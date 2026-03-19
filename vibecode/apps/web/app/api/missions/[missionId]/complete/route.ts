import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@vibecode/db'
import { completeMissionSchema, getStaticMission, STATIC_MISSIONS, getLevelForXp } from '@vibecode/shared'
import { MissionStatus } from '@vibecode/shared'
import { checkAchievements } from '../../../../../lib/achievement-checker'
import { rateLimit } from '../../../../../lib/rate-limit'

export async function POST(
  req: Request,
  { params }: { params: { missionId: string } }
) {
  // FIX 1: auth() com await
  const { userId: clerkId } = await auth()

  if (!clerkId) {
    return NextResponse.json(
      { success: false, error: { code: 'UNAUTHORIZED', message: 'Não autorizado' } },
      { status: 401 }
    )
  }

  // FIX 10: Rate limiting para missions/complete
  const rl = await rateLimit(`mission:${clerkId}`)
  if (!rl.success) {
    return NextResponse.json(
      { success: false, error: { code: 'RATE_LIMIT', message: 'Demasiados pedidos' } },
      { status: 429 }
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
    const newTotalXp = user.totalXp + xpEarned

    // FIX 4: Usar UTC para consistência com streak/check
    const today = new Date()
    today.setUTCHours(0, 0, 0, 0)

    const allMissions = STATIC_MISSIONS
    const currentIndex = allMissions.findIndex((m) => m.id === params.missionId)
    const nextMission = currentIndex !== -1 ? allMissions[currentIndex + 1] : undefined
    let nextMissionId: string | null = null
    if (nextMission) nextMissionId = nextMission.id

    // FIX 3: Envolver todos os writes numa transacção Prisma para atomicidade
    const result = await db.$transaction(async (tx) => {
      // 2. Upsert MissionProgress como COMPLETED
      const progress = await tx.missionProgress.upsert({
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

      // 3. Desbloquear missão seguinte
      if (nextMission) {
        await tx.missionProgress.upsert({
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

      // 4. Adicionar XP ao user
      await tx.user.update({
        where: { id: user.id },
        data: { totalXp: newTotalXp },
      })

      // FIX 3: Recalcular nível dentrio da transacção
      const newLevelInfo = getLevelForXp(newTotalXp)
      const leveledUp = newLevelInfo.level > user.currentLevel

      if (leveledUp) {
        await tx.user.update({
          where: { id: user.id },
          data: { currentLevel: newLevelInfo.level },
        })
      }

      // 5. Actualizar streak do dia (FIX 4: setUTCHours)
      await tx.streakDay.upsert({
        where: { userId_date: { userId: user.id, date: today } },
        create: { userId: user.id, date: today, xpEarned },
        update: { xpEarned: { increment: xpEarned } },
      })

      return { progress, newLevelInfo, leveledUp }
    })

    // 6. Verificar achievements (FORA da transacção — fire-and-forget)
    const completedCount = await db.missionProgress.count({
      where: { userId: user.id, status: 'COMPLETED' },
    })

    const newAchievements = await checkAchievements(user.id, {
      missionCount: completedCount,
      streakDays: user.streakDays,
      currentLevel: result.leveledUp ? result.newLevelInfo.level : user.currentLevel,
      currentHour: new Date().getUTCHours(),
    })

    return NextResponse.json({
      success: true,
      data: {
        progress: {
          id: result.progress.id,
          missionId: result.progress.missionId,
          status: result.progress.status,
          score: result.progress.score,
          completedAt: result.progress.completedAt?.toISOString() ?? null,
        },
        xpEarned,
        newTotalXp,
        nextMissionId,
        newAchievements,
        leveledUp: result.leveledUp,
        newLevel: result.leveledUp ? result.newLevelInfo.level : null,
        levelTitle: result.leveledUp ? result.newLevelInfo.title : null,
        viForm: result.leveledUp ? result.newLevelInfo.viForm : null,
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
