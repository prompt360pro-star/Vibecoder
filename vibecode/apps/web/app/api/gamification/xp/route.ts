// VibeCode — POST /api/gamification/xp
// Endpoint genérico para adicionar XP (achievements, events, etc.)
// NÃO para missões — essas usam /api/missions/[id]/complete

import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { z } from 'zod'
import { db } from '@vibecode/db'
import { getLevelForXp } from '@vibecode/shared'
import { checkAchievements } from '../../../../lib/achievement-checker'

const xpBodySchema = z.object({
  amount: z.number().int().positive().max(100000),
  source: z.string().min(1).max(100),
})

export async function POST(req: Request) {
  const { userId: clerkId } = auth()

  if (!clerkId) {
    return NextResponse.json(
      { success: false, error: { code: 'UNAUTHORIZED', message: 'Não autorizado' } },
      { status: 401 }
    )
  }

  try {
    const body = await req.json()
    const parsed = xpBodySchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION', message: parsed.error.message } },
        { status: 400 }
      )
    }

    const { amount } = parsed.data

    // 1. Buscar user
    const user = await db.user.findUnique({
      where: { clerkId },
      select: {
        id: true,
        totalXp: true,
        currentLevel: true,
        streakDays: true,
      },
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Utilizador não encontrado' } },
        { status: 404 }
      )
    }

    // 2. Adicionar XP
    const newTotalXp = user.totalXp + amount
    await db.user.update({
      where: { id: user.id },
      data: { totalXp: newTotalXp },
    })

    // 3. Recalcular nível
    const newLevelInfo = getLevelForXp(newTotalXp)
    const leveledUp = newLevelInfo.level > user.currentLevel

    if (leveledUp) {
      await db.user.update({
        where: { id: user.id },
        data: { currentLevel: newLevelInfo.level },
      })
    }

    // 4. Contar dados para achievement check
    const [missionCount, projectCount, deployCount, viCount, postCount] = await Promise.all([
      db.missionProgress.count({ where: { userId: user.id, status: 'COMPLETED' } }),
      db.project.count({ where: { userId: user.id } }),
      db.project.count({ where: { userId: user.id, liveUrl: { not: null } } }),
      db.viConversation.count({ where: { userId: user.id } }),
      db.socialPost.count({ where: { userId: user.id } }),
    ])

    // 5. Verificar achievements
    const newAchievements = await checkAchievements(user.id, {
      missionCount,
      streakDays: user.streakDays,
      projectCount,
      deployCount,
      viConversationCount: viCount,
      currentLevel: leveledUp ? newLevelInfo.level : user.currentLevel,
      postCount,
      currentHour: new Date().getUTCHours(),
    })

    return NextResponse.json({
      success: true,
      data: {
        newXp: newTotalXp,
        newLevel: newLevelInfo.level,
        leveledUp,
        levelTitle: newLevelInfo.title,
        viForm: newLevelInfo.viForm,
        newAchievements,
      },
    })
  } catch (error) {
    console.error('[XP_ERROR]', error)
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Erro interno do servidor' } },
      { status: 500 }
    )
  }
}
