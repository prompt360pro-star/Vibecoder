// Webhook do Clerk — sincroniza users com o banco de dados
// Eventos: user.created, user.updated, user.deleted
import { NextRequest, NextResponse } from 'next/server'
import { Webhook } from 'svix'
import { db } from '@vibecode/db'

// Tipo dos eventos do Clerk
interface ClerkWebhookEvent {
  type: string
  data: {
    id: string
    email_addresses: Array<{
      email_address: string
      id: string
    }>
    first_name: string | null
    last_name: string | null
    username: string | null
    image_url: string | null
  }
}

export async function POST(request: NextRequest) {
  // Verificar que temos o secret configurado
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET
  if (!webhookSecret) {
    console.error('[WEBHOOK/CLERK] CLERK_WEBHOOK_SECRET not configured')
    return NextResponse.json(
      { success: false, error: { code: 'CONFIG_ERROR', message: 'Webhook secret not configured' } },
      { status: 500 },
    )
  }

  // Ler headers de verificação Svix
  const svixId = request.headers.get('svix-id')
  const svixTimestamp = request.headers.get('svix-timestamp')
  const svixSignature = request.headers.get('svix-signature')

  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json(
      { success: false, error: { code: 'UNAUTHORIZED', message: 'Missing svix headers' } },
      { status: 401 },
    )
  }

  // Verificar assinatura
  const body = await request.text()
  const wh = new Webhook(webhookSecret)
  let event: ClerkWebhookEvent

  try {
    event = wh.verify(body, {
      'svix-id': svixId,
      'svix-timestamp': svixTimestamp,
      'svix-signature': svixSignature,
    }) as ClerkWebhookEvent
  } catch (err) {
    console.error('[WEBHOOK/CLERK] Signature verification failed:', err)
    return NextResponse.json(
      { success: false, error: { code: 'UNAUTHORIZED', message: 'Invalid signature' } },
      { status: 401 },
    )
  }

  // Processar eventos
  try {
    const { type, data } = event
    const primaryEmail = data.email_addresses[0]?.email_address

    switch (type) {
      case 'user.created': {
        if (!primaryEmail) {
          console.error('[WEBHOOK/CLERK] user.created without email')
          break
        }

        // Gerar username único se não fornecido
        const baseUsername = data.username ?? primaryEmail.split('@')[0] ?? 'user'
        const username = `${baseUsername}-${data.id.slice(-6)}`

        // FIX 9: upsert para idempotência (Clerk pode reenviar evento)
        await db.user.upsert({
          where: { clerkId: data.id },
          create: {
            clerkId: data.id,
            email: primaryEmail,
            name: [data.first_name, data.last_name].filter(Boolean).join(' ') || null,
            username,
            avatarUrl: data.image_url,
          },
          update: {
            email: primaryEmail,
            name: [data.first_name, data.last_name].filter(Boolean).join(' ') || null,
            avatarUrl: data.image_url,
          },
        })
        console.log(`[WEBHOOK/CLERK] User created: ${primaryEmail}`)
        break
      }

      case 'user.updated': {
        await db.user.update({
          where: { clerkId: data.id },
          data: {
            email: primaryEmail,
            name: [data.first_name, data.last_name].filter(Boolean).join(' ') || null,
            avatarUrl: data.image_url,
          },
        })
        console.log(`[WEBHOOK/CLERK] User updated: ${data.id}`)
        break
      }

      case 'user.deleted': {
        await db.user.delete({
          where: { clerkId: data.id },
        })
        console.log(`[WEBHOOK/CLERK] User deleted: ${data.id}`)
        break
      }

      default:
        console.log(`[WEBHOOK/CLERK] Unhandled event: ${type}`)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[WEBHOOK/CLERK]', error)
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL', message: 'Webhook processing failed' } },
      { status: 500 },
    )
  }
}
