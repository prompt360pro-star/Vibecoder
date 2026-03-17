import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@vibecode/db'
import { getStaticMission } from '@vibecode/shared'
import { MissionStatus } from '@vibecode/shared'

export async function GET(
  _req: Request,
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
    const mission = getStaticMission(params.missionId)

    if (!mission) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Missão não encontrada' } },
        { status: 404 }
      )
    }

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

    const progress = await db.missionProgress.findUnique({
      where: { userId_missionId: { userId: user.id, missionId: params.missionId } },
    })

    const defaultStatus =
      params.missionId === 'm01' ? MissionStatus.AVAILABLE : MissionStatus.LOCKED

    return NextResponse.json({
      success: true,
      data: {
        ...mission,
        status: (progress?.status as MissionStatus) ?? defaultStatus,
        score: progress?.score ?? null,
        completedAt: progress?.completedAt?.toISOString() ?? null,
      },
    })
  } catch (error) {
    console.error('[MISSION_DETAIL_ERROR]', error)
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Erro interno do servidor' } },
      { status: 500 }
    )
  }
}
