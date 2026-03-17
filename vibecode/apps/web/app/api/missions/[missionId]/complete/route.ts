import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@vibecode/db'
import { completeMissionSchema, getStaticMission, STATIC_MISSIONS, getLevelForXp } from '@vibecode/shared'
import { MissionStatus } from '@vibecode/shared'
import { checkAchievements } from '../../../../../lib/achievement-checker'

export async function POST(
  req: Request,
  { params }: { params: { missionId: string } }
) {
  const { userId: clerkId } = auth()

  if (!clerkId) {
    return NextResponse.json(
      { success: false, error: { code: 'UNAUTHORIZED', message: 'Não autorizado' } },
      { status: 401 }
    )
  }

  try {
    const body = await req.json()
    const parsed = completeMissionSchema.safeParse({ ...body, missionId: params.missionId })

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: parsed.error.message } },
        { status: 422 }
      )
    }

    const { score, timeSpentSeconds, data } = parsed.data

    const mission = getStaticMission(params.missionId)
    if (!mission) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Missão não encontrada' } },
        { status: 404 }
      )
    }

    const user = await db.user.findUnique({
      where: { clerkId },
      select: { id: true, totalXp: true, currentLevel: true, streakDays: true },
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Utilizador não encontrado' } },
        { status: 404 }
      )
    }

    // 1. Calcular XP ganho (proporcional ao score)
    const xpEarned = Math.round(mission.xpReward * (score / 100))

    // 2. Upsert MissionProgress como COMPLETED
    const progress = await db.missionProgress.upsert({
      where: { userId_missionId: { userId: user.id, missionId: params.missionId } },
      create: {
        userId: user.id,
        missionId: params.missionId,
        status: MissionStatus.COMPLETED,
        score,
        xpEarned,
        timeSpentSeconds,
        attempts: 1,
        data: (data ?? {}) as never,
        completedAt: new Date(),
      },
      update: {
        status: MissionStatus.COMPLETED,
        score: Math.max(score, 0),
        xpEarned,
        timeSpentSeconds,
        attempts: { increment: 1 },
        data: (data ?? {}) as never,
        completedAt: new Date(),
      },
    })

    // 3. Descobrir missão seguinte e desbloqueá-la
    const allMissions = STATIC_MISSIONS
    const currentIndex = allMissions.findIndex((m) => m.id === params.missionId)
    const nextMission = currentIndex !== -1 ? allMissions[currentIndex + 1] : undefined
    let nextMissionId: string | null = null

    if (nextMission) {
      nextMissionId = nextMission.id
      await db.missionProgress.upsert({
        where: { userId_missionId: { userId: user.id, missionId: nextMission.id } },
        create: {
          userId: user.id,
          missionId: nextMission.id,
          status: MissionStatus.AVAILABLE,
          score: 0,
          xpEarned: 0,
          timeSpentSeconds: 0,
          attempts: 0,
          data: {},
        },
        update: {
          status: MissionStatus.AVAILABLE,
        },
      })
    }

    // 4. Adicionar XP ao user e recalcular nível
    const newTotalXp = user.totalXp + xpEarned
    await db.user.update({
      where: { id: user.id },
      data: { totalXp: newTotalXp },
    })

    const newLevelInfo = getLevelForXp(newTotalXp)
    const leveledUp = newLevelInfo.level > user.currentLevel

    if (leveledUp) {
      await db.user.update({
        where: { id: user.id },
        data: { currentLevel: newLevelInfo.level },
      })
    }

    // 5. Actualizar streak do dia
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    await db.streakDay.upsert({
      where: { userId_date: { userId: user.id, date: today } },
      create: { userId: user.id, date: today, xpEarned },
      update: { xpEarned: { increment: xpEarned } },
    })

    // 6. Verificar achievements via achievement-checker centralizado
    const completedCount = await db.missionProgress.count({
      where: { userId: user.id, status: 'COMPLETED' },
    })

    const newAchievements = await checkAchievements(user.id, {
      missionCount: completedCount,
      streakDays: user.streakDays,
      currentLevel: leveledUp ? newLevelInfo.level : user.currentLevel,
      currentHour: new Date().getUTCHours(),
    })

    return NextResponse.json({
      success: true,
      data: {
        progress: {
          id: progress.id,
          missionId: progress.missionId,
          status: progress.status,
          score: progress.score,
          completedAt: progress.completedAt?.toISOString() ?? null,
        },
        xpEarned,
        newTotalXp,
        nextMissionId,
        newAchievements,
        leveledUp,
        newLevel: leveledUp ? newLevelInfo.level : null,
        levelTitle: leveledUp ? newLevelInfo.title : null,
        viForm: leveledUp ? newLevelInfo.viForm : null,
      },
    })
  } catch (error) {
    console.error('[MISSION_COMPLETE_ERROR]', error)
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Erro interno do servidor' } },
      { status: 500 }
    )
  }
}
