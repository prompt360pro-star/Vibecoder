import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@vibecode/db'
import { ISLANDS, STATIC_MISSIONS } from '@vibecode/shared'
import type { MissionWithProgress } from '@vibecode/shared'
import { MissionStatus } from '@vibecode/shared'

export async function GET(req: Request) {
  const { userId: clerkId } = auth()

  if (!clerkId) {
    return NextResponse.json(
      { success: false, error: { code: 'UNAUTHORIZED', message: 'Não autorizado' } },
      { status: 401 }
    )
  }

  try {
    const user = await db.user.findUnique({
      where: { clerkId },
      select: { id: true },
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Utilizador não encontrado' } },
        { status: 404 }
      )
    }

    const { searchParams } = new URL(req.url)
    const islandId = searchParams.get('islandId')
    const zoneId = searchParams.get('zoneId')

    // Obter progresso de todas as missões do user
    const allProgress = await db.missionProgress.findMany({
      where: { userId: user.id },
      select: { missionId: true, status: true, score: true, completedAt: true },
    })

    const progressMap = new Map(allProgress.map((p) => [p.missionId, p]))

    // Recolhe missões das constantes, filtrando por ilha/zona se pedido
    const missions: MissionWithProgress[] = []

    for (const island of ISLANDS) {
      if (islandId && island.id !== islandId) continue

      for (const zone of island.zones) {
        if (zoneId && zone.id !== zoneId) continue

        for (const summary of zone.missions) {
          const progress = progressMap.get(summary.id)
          // Se não tem progresso: locked por default, salvo m01 que é available
          const defaultStatus =
            summary.id === 'm01' ? MissionStatus.AVAILABLE : MissionStatus.LOCKED
          const status = (progress?.status as MissionStatus) ?? defaultStatus

          const staticMission = STATIC_MISSIONS.find((m) => m.id === summary.id)

          if (staticMission) {
            missions.push({
              ...staticMission,
              status,
              score: progress?.score ?? null,
              completedAt: progress?.completedAt?.toISOString() ?? null,
            })
          } else {
            // Missão sem conteúdo estático ainda — usa summary
            missions.push({
              id: summary.id,
              zoneId: zone.id,
              title: summary.title,
              description: '',
              order: summary.order,
              estimatedMinutes: summary.estimatedMinutes,
              xpReward: summary.xpReward,
              phases: [],
              status,
              score: progress?.score ?? null,
              completedAt: progress?.completedAt?.toISOString() ?? null,
            })
          }
        }
      }
    }

    return NextResponse.json({ success: true, data: missions })
  } catch (error) {
    console.error('[MISSIONS_LIST_ERROR]', error)
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Erro interno do servidor' } },
      { status: 500 }
    )
  }
}
