import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@vibecode/db'
import { STREAK_BONUSES } from '@vibecode/shared'

export async function GET() {
  const { userId: clerkId } = auth()

  if (!clerkId) {
    return NextResponse.json(
      { success: false, error: { code: 'UNAUTHORIZED', message: 'Não autorizado' } },
      { status: 401 }
    )
  }

  try {
    // Busca user pelo clerkId para obter o id interno
    const user = await db.user.findUnique({
      where: { clerkId },
      select: {
        id: true,
        streakDays: true,
        longestStreak: true,
        streakFreezes: true,
      },
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Utilizador não encontrado' } },
        { status: 404 }
      )
    }

    // Verificar se hoje já foi completado usando o id interno do utilizador
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const todayStreak = await db.streakDay.findFirst({
      where: {
        userId: user.id,
        date: today,
      },
    })

    // Calcular streak e próximo bónus
    const currentStreak = user.streakDays
    const nextBonus = STREAK_BONUSES.find((b) => b.days > currentStreak) || null

    // Buscar últimos 35 dias do calendário
    const thirtyFiveDaysAgo = new Date()
    thirtyFiveDaysAgo.setUTCDate(thirtyFiveDaysAgo.getUTCDate() - 34)
    thirtyFiveDaysAgo.setUTCHours(0, 0, 0, 0)

    const streakDays = await db.streakDay.findMany({
      where: {
        userId: user.id,
        date: { gte: thirtyFiveDaysAgo },
      },
      select: { date: true, freezeUsed: true },
    })

    const streakDaySet = new Map(
      streakDays.map((s) => [s.date.toISOString().slice(0, 10), s.freezeUsed])
    )

    const calendar: { date: string; completed: boolean; freezeUsed: boolean }[] = []
    for (let i = 34; i >= 0; i--) {
      const d = new Date()
      d.setUTCDate(d.getUTCDate() - i)
      const dateStr = d.toISOString().slice(0, 10)
      const freezeUsed = streakDaySet.get(dateStr)
      calendar.push({
        date: dateStr,
        completed: streakDaySet.has(dateStr),
        freezeUsed: freezeUsed ?? false,
      })
    }

    return NextResponse.json({
      success: true,
      data: {
        current: currentStreak,
        longest: user.longestStreak,
        freezesAvailable: user.streakFreezes,
        todayCompleted: !!todayStreak,
        nextBonus,
        calendar,
      },
    })
  } catch (error) {
    console.error('[STREAK_API_ERROR]', error)
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Erro interno do servidor' } },
      { status: 500 }
    )
  }
}
