// VibeCode — POST /api/vi/chat
// Melhoria 4: Suporte a conversationId opcional para manter histórico de conversa
// Fluxo: se conversationId fornecido → busca histórico → passa ao modelo → faz update
//        se não fornecido → cria nova conversa → retorna id para o cliente usar nas próximas

import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { generateText } from 'ai'
import { anthropic } from '@ai-sdk/anthropic'
import { openai, createOpenAI } from '@ai-sdk/openai'
import { db } from '@vibecode/db'
import { viMessageSchema, ViMode } from '@vibecode/shared'
import { assembleViPrompt, classifyTask, selectModel } from '@vibecode/ai'
import { rateLimit } from '../../../../lib/rate-limit'

const FREE_DAILY_LIMIT = 5

// Tipo interno para mensagens no histórico
interface StoredMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp?: string
}

export async function POST(req: Request) {
  // ── 1. Auth (await obrigatório no SDK v5)
  const { userId: clerkId } = await auth()
  if (!clerkId) {
    return NextResponse.json(
      { success: false, error: { code: 'UNAUTHORIZED', message: 'Não autorizado' } },
      { status: 401 }
    )
  }

  // ── 2. Rate limit (30 req/min por user)
  const rl = await rateLimit(`vi:${clerkId}`)
  if (!rl.success) {
    return NextResponse.json(
      { success: false, error: { code: 'RATE_LIMIT', message: 'Demasiados pedidos. Aguarda um momento.' } },
      { status: 429 }
    )
  }

  try {
    // ── 3. Parse & validar body
    const body = await req.json()
    const parsed = viMessageSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION', message: parsed.error.message } },
        { status: 400 }
      )
    }

    const { content, mode = 'TEACHER', context, conversationId } = parsed.data
    const viMode: ViMode = (mode ?? 'TEACHER') as ViMode

    // ── 4. Buscar user
    const user = await db.user.findUnique({
      where: { clerkId },
      select: {
        id: true,
        name: true,
        currentLevel: true,
        subscriptionTier: true,
        locale: true,
        totalXp: true,
      },
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Utilizador não encontrado' } },
        { status: 401 }
      )
    }

    // ── 5. Verificar limite FREE (5 conversações/dia — só conta novas conversas)
    if (user.subscriptionTier === 'FREE' && !conversationId) {
      const todayStart = new Date()
      todayStart.setUTCHours(0, 0, 0, 0)

      const todayCount = await db.viConversation.count({
        where: {
          userId: user.id,
          createdAt: { gte: todayStart },
        },
      })

      if (todayCount >= FREE_DAILY_LIMIT) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'LIMIT_REACHED',
              message: `Atingiste o limite de ${FREE_DAILY_LIMIT} conversações gratuitas por dia. Faz upgrade para PRO para conversar sem limites! 🚀`,
            },
          },
          { status: 403 }
        )
      }
    }

    // ── 6. Melhoria 4: Carregar histórico se conversationId fornecido
    let existingMessages: StoredMessage[] = []
    let targetConversationId: string | null = conversationId ?? null

    if (conversationId) {
      const existing = await db.viConversation.findFirst({
        where: { id: conversationId, userId: user.id },
        select: { messages: true },
      })
      if (existing) {
        existingMessages = existing.messages as unknown as StoredMessage[]
      } else {
        // conversationId inválido ou de outro user — ignorar e criar nova
        targetConversationId = null
      }
    }

    // ── 7. Montar system prompt (10 camadas)
    const systemPrompt = assembleViPrompt({
      mode: viMode,
      userLevel: user.currentLevel,
      userName: user.name ?? 'Aluno',
      locale: user.locale ?? 'pt',
      missionContext: context ?? undefined,
      maxResponseLength: 'medium',
    })

    // ── 8. Classificar tarefa e seleccionar modelo
    const taskType = classifyTask(content)
    const modelConfig = selectModel(
      taskType,
      (user.subscriptionTier as 'FREE' | 'PRO' | 'TEAM' | 'LIFETIME') ?? 'FREE'
    )

    // ── 9. Preparar array de messages com histórico
    const messagesForAI = [
      // Histórico existente (últimas 10 mensagens para não ultrapassar context window)
      ...existingMessages.slice(-10).map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
      // Nova mensagem do user
      { role: 'user' as const, content },
    ]

    // ── 10. Chamar provider correcto
    let aiText = ''
    let tokensUsed = 0

    if (modelConfig.provider === 'anthropic') {
      const result = await generateText({
        model: anthropic(modelConfig.model),
        system: systemPrompt,
        messages: messagesForAI,
        maxTokens: modelConfig.maxTokens,
        temperature: modelConfig.temperature,
      })
      aiText = result.text
      tokensUsed = (result.usage?.promptTokens ?? 0) + (result.usage?.completionTokens ?? 0)
    } else if (modelConfig.provider === 'groq') {
      const groqProvider = createOpenAI({
        baseURL: 'https://api.groq.com/openai/v1',
        apiKey: process.env.GROQ_API_KEY ?? '',
      })
      const result = await generateText({
        model: groqProvider(modelConfig.model),
        system: systemPrompt,
        messages: messagesForAI,
        maxTokens: modelConfig.maxTokens,
        temperature: modelConfig.temperature,
      })
      aiText = result.text
      tokensUsed = (result.usage?.promptTokens ?? 0) + (result.usage?.completionTokens ?? 0)
    } else {
      const result = await generateText({
        model: openai(modelConfig.model),
        system: systemPrompt,
        messages: messagesForAI,
        maxTokens: modelConfig.maxTokens,
        temperature: modelConfig.temperature,
      })
      aiText = result.text
      tokensUsed = (result.usage?.promptTokens ?? 0) + (result.usage?.completionTokens ?? 0)
    }

    // ── 11. Melhoria 4: Persistir conversa (update ou create)
    const newMessages: StoredMessage[] = [
      ...existingMessages,
      { role: 'user', content, timestamp: new Date().toISOString() },
      { role: 'assistant', content: aiText, timestamp: new Date().toISOString() },
    ]

    let savedConversationId: string

    if (targetConversationId) {
      // Actualizar conversa existente com novas mensagens
      await db.viConversation.update({
        where: { id: targetConversationId },
        data: {
          messages: newMessages as never,
          tokensUsed: { increment: tokensUsed },
          updatedAt: new Date(),
        },
      })
      savedConversationId = targetConversationId
    } else {
      // Criar nova conversa e devolver id ao cliente
      const created = await db.viConversation.create({
        data: {
          userId: user.id,
          mode: viMode as never,
          context: context ?? null,
          messages: newMessages as never,
          modelUsed: modelConfig.model,
          tokensUsed,
        },
      })
      savedConversationId = created.id
    }

    // ── 12. Retornar resposta com conversationId para o cliente usar na próxima
    return NextResponse.json({
      success: true,
      data: {
        message: aiText,
        role: 'ASSISTANT',
        model: modelConfig.model,
        tokensUsed,
        conversationId: savedConversationId, // Cliente guarda e envia no próximo request
      },
    })
  } catch (error) {
    console.error('[VI_CHAT_ERROR]', error)
    return NextResponse.json(
      { success: false, error: { code: 'AI_ERROR', message: 'Erro ao contactar o Vi. Tenta novamente.' } },
      { status: 500 }
    )
  }
}
