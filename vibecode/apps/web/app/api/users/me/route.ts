// API: GET/PUT /api/users/me — Perfil do user autenticado
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@vibecode/db'
import { updateProfileSchema, getLevelForXp, getXpForNextLevel, getLevelProgress } from '@vibecode/shared'

// GET — Retorna perfil do user autenticado
export async function GET() {
  const { userId: clerkId } = await auth()
  if (!clerkId) {
    return NextResponse.json(
      { success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
      { status: 401 },
    )
  }

  try {
    const user = await db.user.findUnique({
      where: { clerkId },
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'User not found' } },
        { status: 404 },
      )
    }

    // Actualizar lastActiveAt (fire-and-forget)
    db.user.update({
      where: { clerkId },
      data: { lastActiveAt: new Date() },
    }).catch(() => {
      // Silenciar erro — não é crítico
    })

    // Calcular info do nível
    const levelConfig = getLevelForXp(user.totalXp)
    const xpForNext = getXpForNextLevel(user.totalXp)
    const progress = getLevelProgress(user.totalXp)

    return NextResponse.json({
      success: true,
      data: {
        id: user.id,
        clerkId: user.clerkId,
        email: user.email,
        name: user.name,
        username: user.username,
        avatarUrl: user.avatarUrl,
        bio: user.bio,
        currentLevel: user.currentLevel,
        totalXp: user.totalXp,
        streakDays: user.streakDays,
        longestStreak: user.longestStreak,
        streakFreezes: user.streakFreezes,
        subscriptionTier: user.subscriptionTier,
        locale: user.locale,
        timezone: user.timezone,
        dailyTimeGoalMinutes: user.dailyTimeGoalMinutes,
        soundEnabled: user.soundEnabled,
        hapticsEnabled: user.hapticsEnabled,
        notifyStreak: user.notifyStreak,
        notifyNewMission: user.notifyNewMission,
        notifySocial: user.notifySocial,
        notifyNews: user.notifyNews,
        createdAt: user.createdAt.toISOString(),
        levelTitle: levelConfig.title,
        viForm: levelConfig.viForm,
        levelInfo: {
          level: levelConfig.level,
          title: levelConfig.title,
          currentXp: user.totalXp,
          xpRequired: levelConfig.xpRequired,
          xpForNextLevel: xpForNext,
          progress,
          viForm: levelConfig.viForm,
        },
      },
    })
  } catch (error) {
    console.error('[GET /api/users/me]', error)
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL', message: 'Internal server error' } },
      { status: 500 },
    )
  }
}

// PUT — Actualizar perfil
export async function PUT(request: NextRequest) {
  const { userId: clerkId } = await auth()
  if (!clerkId) {
    return NextResponse.json(
      { success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
      { status: 401 },
    )
  }

  try {
    const body: unknown = await request.json()
    const parsed = updateProfileSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION', message: parsed.error.message } },
        { status: 400 },
      )
    }

    const user = await db.user.update({
      where: { clerkId },
      data: parsed.data,
    })

    return NextResponse.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        username: user.username,
        avatarUrl: user.avatarUrl,
        bio: user.bio,
        locale: user.locale,
      },
    })
  } catch (error) {
    console.error('[PUT /api/users/me]', error)
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL', message: 'Internal server error' } },
      { status: 500 },
    )
  }
}
