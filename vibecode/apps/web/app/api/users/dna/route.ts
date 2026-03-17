// API: POST /api/users/dna — Salvar resultado do DNA Test
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@vibecode/db'
import { dnaProfileSchema } from '@vibecode/shared'
import type { LearningStyle } from '@vibecode/shared'

export async function POST(request: NextRequest) {
  const { userId: clerkId } = await auth()
  if (!clerkId) {
    return NextResponse.json(
      { success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
      { status: 401 },
    )
  }

  try {
    const body: unknown = await request.json()
    const parsed = dnaProfileSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION', message: parsed.error.message } },
        { status: 400 },
      )
    }

    const dna = parsed.data

    // Mapear learning style do Zod enum para o Prisma enum
    const learningStyleMap: Record<string, LearningStyle> = {
      READING: 'READING' as LearningStyle,
      WATCHING: 'WATCHING' as LearningStyle,
      DOING: 'DOING' as LearningStyle,
      TALKING: 'TALKING' as LearningStyle,
    }
    const prismaLearningStyle = learningStyleMap[dna.learningStyle] ?? undefined

    // Calcular nível inicial e estimativa com base no perfil
    const experienceWeight: Record<string, number> = {
      zero: 0,
      dabbled: 1,
      some: 2,
      professional: 3,
    }
    const startLevel = 1
    const expWeight = experienceWeight[dna.experience] ?? 0
    const estimatedWeeks = Math.max(4, 24 - expWeight * 4)

    // Actualizar user
    const user = await db.user.update({
      where: { clerkId },
      data: {
        dnaProfile: JSON.parse(JSON.stringify(dna)),
        learningStyle: prismaLearningStyle,
        buildGoals: dna.buildGoals,
        dailyTimeGoalMinutes: (() => {
          const timeMap: Record<string, number> = {
            '5-15': 10,
            '15-30': 20,
            '30-60': 45,
            '60+': 75,
          }
          return timeMap[dna.dailyTime] ?? 15
        })(),
      },
    })

    // Mensagem personalizada baseada no perfil
    const personalMessage = (() => {
      if (dna.experience === 'zero') {
        return 'Perfeito! Vais começar do zero e isso é incrível. O Vi vai guiar-te passo a passo. 🚀'
      }
      if (dna.experience === 'professional') {
        return 'Já tens experiência — vais acelerar muito com vibe coding. Prepara-te para construir coisas incríveis! ⚡'
      }
      return 'Tens uma boa base para começar. O Vi vai adaptar-se ao teu ritmo. 💪'
    })()

    return NextResponse.json({
      success: true,
      data: {
        profile: dna,
        startLevel,
        estimatedWeeks,
        personalMessage,
        userId: user.id,
      },
    })
  } catch (error) {
    console.error('[POST /api/users/dna]', error)
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL', message: 'Internal server error' } },
      { status: 500 },
    )
  }
}
