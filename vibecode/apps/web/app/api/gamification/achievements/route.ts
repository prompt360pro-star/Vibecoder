// VibeCode — GET /api/gamification/achievements
// Retorna achievements em 3 grupos: earned, available, nearMisses (>= 50% progresso)

import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@vibecode/db'
import { ACHIEVEMENTS } from '@vibecode/shared'
import { getAchievementProgress } from '../../../../lib/achievement-checker'

export async function GET() {
  const { userId: clerkId } = await auth()

  if (!clerkId) {
    return NextResponse.json(
      { success: false, error: { code: 'UNAUTHORIZED', message: 'Não autorizado' } },
      { status: 401 }
    )
  }

  try {
    // 1. Buscar user e dados relevantes
    const user = await db.user.findUnique({
      where: { clerkId },
      select: {
        id: true,
        streakDays: true,
        currentLevel: true,
        totalXp: true,
      },
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Utilizador não encontrado' } },
        { status: 404 }
      )
    }

    // 2. Buscar achievements já ganhos
    const userAchievements = await db.userAchievement.findMany({
      where: { userId: user.id },
      select: { achievementId: true, earnedAt: true },
    })

    const earnedMap = new Map(userAchievements.map((ua) => [ua.achievementId, ua.earnedAt]))

    // 3. Contar dados para calcular progresso
    const [missionCount, projectCount, deployCount, viCount, postCount] = await Promise.all([
      db.missionProgress.count({ where: { userId: user.id, status: 'COMPLETED' } }),
      db.project.count({ where: { userId: user.id } }),
      db.project.count({ where: { userId: user.id, liveUrl: { not: null } } }),
      db.viConversation.count({ where: { userId: user.id } }),
      db.socialPost.count({ where: { userId: user.id } }),
    ])

    const ctx = {
      missionCount,
      streakDays: user.streakDays,
      projectCount,
      deployCount,
      viConversationCount: viCount,
      currentLevel: user.currentLevel,
      postCount,
    }

    // 4. Separar achievements em 3 grupos
    const earned: typeof ACHIEVEMENTS[0][] & { earnedAt?: string }[] = []
    const available: typeof ACHIEVEMENTS[0][] = []
    const nearMisses: (typeof ACHIEVEMENTS[0] & {
      progress: { current: number; required: number; label: string } | null
    })[] = []

    for (const achievement of ACHIEVEMENTS) {
      if (earnedMap.has(achievement.id)) {
        // Earned: tem UserAchievement
        earned.push({
          ...achievement,
          earnedAt: earnedMap.get(achievement.id)?.toISOString(),
        } as typeof ACHIEVEMENTS[0] & { earnedAt?: string })
      } else {
        // Calcular progresso
        const progress = getAchievementProgress(achievement.id, ctx)

        if (progress) {
          const pct = progress.required > 0 ? progress.current / progress.required : 0
          if (pct >= 0.5) {
            // Near-miss: >= 50% do caminho
            nearMisses.push({ ...achievement, progress })
          } else {
            available.push(achievement)
          }
        } else {
          // Sem progresso calculável (eventos, acções especiais)
          if (!achievement.isSecret) {
            available.push(achievement)
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        earned,
        available,
        nearMisses,
        stats: {
          totalEarned: earned.length,
          totalAvailable: ACHIEVEMENTS.length,
          completionPct: Math.round((earned.length / ACHIEVEMENTS.length) * 100),
        },
      },
    })
  } catch (error) {
    console.error('[ACHIEVEMENTS_ERROR]', error)
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Erro interno do servidor' } },
      { status: 500 }
    )
  }
}
