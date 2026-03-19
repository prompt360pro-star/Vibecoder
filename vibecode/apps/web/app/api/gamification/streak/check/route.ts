// VibeCode — POST /api/gamification/streak/check
// Chamado pelo app 1x/dia ao abrir
// Verifica se streak continua, usa freeze se necessário, dá bónus de milestone

import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@vibecode/db'
import { STREAK_BONUSES, getLevelForXp } from '@vibecode/shared'
import { checkAchievements } from '../../../../../lib/achievement-checker'

export async function POST() {
  const { userId: clerkId } = await auth()

  if (!clerkId) {
    return NextResponse.json(
      { success: false, error: { code: 'UNAUTHORIZED', message: 'Não autorizado' } },
      { status: 401 }
    )
  }

  try {
    // 1. Buscar user
    const user = await db.user.findUnique({
      where: { clerkId },
      select: {
        id: true,
        streakDays: true,
        longestStreak: true,
        streakFreezes: true,
        totalXp: true,
        currentLevel: true,
      },
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Utilizador não encontrado' } },
        { status: 404 }
      )
    }

    // 2. Verificar se ontem existiu StreakDay
    const yesterday = new Date()
    yesterday.setUTCDate(yesterday.getUTCDate() - 1)
    yesterday.setUTCHours(0, 0, 0, 0)

    const today = new Date()
    today.setUTCHours(0, 0, 0, 0)

    const yesterdayStreak = await db.streakDay.findFirst({
      where: { userId: user.id, date: yesterday },
    })

    const todayStreak = await db.streakDay.findFirst({
      where: { userId: user.id, date: today },
    })

    let freezeUsed = false
    let bonusEarned = false
    let bonusXp = 0
    let newStreakDays = user.streakDays

    if (todayStreak) {
      // Já foi verificado hoje, nada a fazer
      return NextResponse.json({
        success: true,
        data: {
          streakDays: user.streakDays,
          freezeUsed: false,
          bonusEarned: false,
          bonusXp: 0,
          alreadyChecked: true,
        },
      })
    }

    if (yesterdayStreak) {
      // FIX 7: Streak activa — incrementar streakDays (antes nunca era incrementado aqui)
      newStreakDays = user.streakDays + 1
      await db.user.update({
        where: { id: user.id },
        data: { streakDays: newStreakDays },
      })
    } else {
      // Streak quebrada — usar freeze ou resetar
      if (user.streakFreezes > 0) {
        // Usar um freeze: criar StreakDay de ontem com freezeUsed=true
        await db.streakDay.create({
          data: {
            userId: user.id,
            date: yesterday,
            freezeUsed: true,
            xpEarned: 0,
            missionsCompleted: 0,
            timeSpentMinutes: 0,
          },
        })

        await db.user.update({
          where: { id: user.id },
          data: { streakFreezes: { decrement: 1 } },
        })

        freezeUsed = true
        // Streak mantém-se, não incrementa
      } else {
        // Sem freezes — resetar streak
        newStreakDays = 0
        await db.user.update({
          where: { id: user.id },
          data: { streakDays: 0 },
        })
      }
    }

    // 3. Actualizar longestStreak se necessário
    if (newStreakDays > user.longestStreak) {
      await db.user.update({
        where: { id: user.id },
        data: { longestStreak: newStreakDays },
      })
    }

    // 4. Verificar bónus de milestone de streak
    const matchingBonus = STREAK_BONUSES.find((b) => b.days === newStreakDays)
    if (matchingBonus) {
      bonusEarned = true
      bonusXp = matchingBonus.xpBonus

      const newTotalXp = user.totalXp + bonusXp
      const newLevelInfo = getLevelForXp(newTotalXp)
      const leveledUp = newLevelInfo.level > user.currentLevel

      await db.user.update({
        where: { id: user.id },
        data: {
          totalXp: { increment: bonusXp },
          ...(leveledUp ? { currentLevel: newLevelInfo.level } : {}),
        },
      })
    }

    // 5. Verificar achievements de streak + outros
    const [missionCount, projectCount, viCount] = await Promise.all([
      db.missionProgress.count({ where: { userId: user.id, status: 'COMPLETED' } }),
      db.project.count({ where: { userId: user.id } }),
      db.viConversation.count({ where: { userId: user.id } }),
    ])

    const newAchievements = await checkAchievements(user.id, {
      streakDays: newStreakDays,
      missionCount,
      projectCount,
      viConversationCount: viCount,
      currentLevel: user.currentLevel,
      currentHour: new Date().getUTCHours(),
    })

    return NextResponse.json({
      success: true,
      data: {
        streakDays: newStreakDays,
        freezeUsed,
        bonusEarned,
        bonusXp,
        newAchievements,
      },
    })
  } catch (error) {
    console.error('[STREAK_CHECK_ERROR]', error)
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Erro interno do servidor' } },
      { status: 500 }
    )
  }
}
