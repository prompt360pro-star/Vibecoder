import { NextResponse } from 'next/server'
import { db } from '@vibecode/db'
import { sendBatchNotifications } from '../../../../lib/push-notifications'

const CRON_UNAUTHORIZED_RESPONSE = NextResponse.json(
  { success: false, error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } },
  { status: 401 },
)

const getCronSecret = () => process.env.CRON_SECRET

const isAuthorized = (authorizationHeader: string | null) => {
  const secret = getCronSecret()
  return Boolean(secret) && authorizationHeader === `Bearer ${secret}`
}

export async function GET(request: Request) {
  if (!isAuthorized(request.headers.get('authorization'))) {
    return CRON_UNAUTHORIZED_RESPONSE
  }

  try {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

    const activeUsers = await db.user.findMany({
      where: {
        pushToken: { not: null },
        notifyStreak: true,
        lastActiveAt: { gte: sevenDaysAgo },
      },
      select: { id: true, pushToken: true, name: true },
      take: 1000,
    })

    const messages = activeUsers.map((user) => ({
      to: user.pushToken!,
      title: '⚡ Novo Desafio Diário!',
      body: `${user.name?.split(' ')[0] || 'Coder'}, o teu desafio de hoje está disponível. Vamos lá!`,
      data: {
        type: 'new_mission',
        userId: user.id,
      },
      sound: 'default' as const,
    }))

    const results = await sendBatchNotifications(messages)
    const sent = results.filter((result) => result.success).length

    return NextResponse.json({
      success: true,
      data: { total: messages.length, sent },
    })
  } catch (error) {
    console.error('[CRON_DAILY_CHALLENGE]', error)
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL', message: 'Internal server error' } },
      { status: 500 },
    )
  }
}
