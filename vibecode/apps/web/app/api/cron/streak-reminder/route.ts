import { NextResponse } from 'next/server'
import { db } from '@vibecode/db'
import { sendBatchNotifications } from '../../../../lib/push-notifications'

const CRON_UNAUTHORIZED_RESPONSE = NextResponse.json(
  { success: false, error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } },
  { status: 401 },
)

const getCronSecret = () => process.env.CRON_SECRET

const isAuthorized = (authorizationHeader: string | null) => {
  const secret = getCronSecret()
  return Boolean(secret) && authorizationHeader === `Bearer ${secret}`
}

export async function GET(request: Request) {
  if (!isAuthorized(request.headers.get('authorization'))) {
    return CRON_UNAUTHORIZED_RESPONSE
  }

  try {
    const today = new Date()
    today.setUTCHours(0, 0, 0, 0)

    const usersAtRisk = await db.user.findMany({
      where: {
        pushToken: { not: null },
        notifyStreak: true,
        streakDays: { gt: 0 },
        NOT: {
          streakHistory: {
            some: { date: today },
          },
        },
      },
      select: {
        id: true,
        pushToken: true,
        streakDays: true,
        name: true,
      },
      take: 1000,
    })

    const messages = usersAtRisk.map((user) => ({
      to: user.pushToken!,
      title: getStreakReminderTitle(user.streakDays),
      body: getStreakReminderBody(user.streakDays, user.name),
      data: {
        type: 'streak_reminder',
        userId: user.id,
      },
      sound: 'default' as const,
    }))

    const results = await sendBatchNotifications(messages)
    const sent = results.filter((result) => result.success).length

    console.log(`[STREAK_REMINDER] Enviadas ${sent}/${messages.length} notificações`)

    return NextResponse.json({
      success: true,
      data: { total: messages.length, sent },
    })
  } catch (error) {
    console.error('[CRON_STREAK_REMINDER]', error)
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL', message: 'Internal server error' } },
      { status: 500 },
    )
  }
}

function getStreakReminderTitle(streakDays: number): string {
  if (streakDays >= 30) return '🔥 30+ dias de streak em risco!'
  if (streakDays >= 7) return '⚡ O teu streak está em perigo!'
  return '📚 Hora de aprender!'
}

function getStreakReminderBody(streakDays: number, name: string | null): string {
  const firstName = name?.split(' ')[0] || 'Coder'
  if (streakDays >= 30) return `${firstName}, tens ${streakDays} dias consecutivos. Não percas agora!`
  if (streakDays >= 7) return `${firstName}, o teu streak de ${streakDays} dias desaparece à meia-noite!`
  return `${firstName}, completa uma missão rápida para manter o teu streak!`
}
