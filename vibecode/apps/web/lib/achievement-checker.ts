// VibeCode — Achievement Checker (reutilizável)
// Chamado por: complete/route.ts, xp/route.ts, streak/check/route.ts
// Verifica quais achievements o user desbloqueou e cria os registos na BD

import { db } from '@vibecode/db'
import { ACHIEVEMENTS, getLevelForXp } from '@vibecode/shared'

export interface AchievementContext {
  userId: string
  // Missões
  missionCount?: number
  // Streak
  streakDays?: number
  // Projectos
  projectCount?: number
  deployCount?: number
  // Vi conversations
  viConversationCount?: number
  // Nível actual
  currentLevel?: number
  // Social
  postCount?: number
  // Hora actual (para easter eggs)
  currentHour?: number
}

// Mapa de achievement ID → condição de desbloqueio
// Cada entrada retorna true se a condição está cumprida
type ConditionFn = (ctx: AchievementContext) => boolean

const ACHIEVEMENT_CONDITIONS: Record<string, ConditionFn> = {
  // ── Início
  'first-mission': (ctx) => (ctx.missionCount ?? 0) >= 1,

  // ── Missões
  'missions-5': (ctx) => (ctx.missionCount ?? 0) >= 5,
  'missions-10': (ctx) => (ctx.missionCount ?? 0) >= 10,
  'missions-25': (ctx) => (ctx.missionCount ?? 0) >= 25,
  'missions-50': (ctx) => (ctx.missionCount ?? 0) >= 50,
  'missions-100': (ctx) => (ctx.missionCount ?? 0) >= 100,

  // ── Streak
  'streak-3': (ctx) => (ctx.streakDays ?? 0) >= 3,
  'streak-7': (ctx) => (ctx.streakDays ?? 0) >= 7,
  'streak-14': (ctx) => (ctx.streakDays ?? 0) >= 14,
  'streak-30': (ctx) => (ctx.streakDays ?? 0) >= 30,
  'streak-100': (ctx) => (ctx.streakDays ?? 0) >= 100,
  'streak-365': (ctx) => (ctx.streakDays ?? 0) >= 365,

  // ── Projectos
  'first-project': (ctx) => (ctx.projectCount ?? 0) >= 1,
  'projects-3': (ctx) => (ctx.projectCount ?? 0) >= 3,
  'project-deployed': (ctx) => (ctx.deployCount ?? 0) >= 1,

  // ── Vi
  'first-vi-chat': (ctx) => (ctx.viConversationCount ?? 0) >= 1,
  'vi-messages-50': (ctx) => (ctx.viConversationCount ?? 0) >= 50,
  'vi-messages-200': (ctx) => (ctx.viConversationCount ?? 0) >= 200,

  // ── Nível
  'level-10': (ctx) => (ctx.currentLevel ?? 0) >= 10,
  'level-20': (ctx) => (ctx.currentLevel ?? 0) >= 20,
  'level-30': (ctx) => (ctx.currentLevel ?? 0) >= 30,
  'level-40': (ctx) => (ctx.currentLevel ?? 0) >= 40,
  'level-50': (ctx) => (ctx.currentLevel ?? 0) >= 50,

  // ── Social
  'first-post': (ctx) => (ctx.postCount ?? 0) >= 1,
  'posts-10': (ctx) => (ctx.postCount ?? 0) >= 10,

  // ── Easter Eggs
  'secret-midnight': (ctx) => {
    const h = ctx.currentHour ?? -1
    return h >= 0 && h < 5
  },
}

/**
 * Verifica todos os achievements aplicáveis e cria os que ainda não existem.
 * Retorna: array de IDs de achievements recém-desbloqueados.
 */
export async function checkAchievements(
  userId: string,
  ctx: Omit<AchievementContext, 'userId'>
): Promise<string[]> {
  // 1. Carregar achievements já ganhos
  const earned = await db.userAchievement.findMany({
    where: { userId },
    select: { achievementId: true },
  })
  const earnedIds = new Set(earned.map((e) => e.achievementId))

  const newlyUnlocked: string[] = []

  // 2. Avaliar cada achievement que temos condição
  for (const [achievementId, conditionFn] of Object.entries(ACHIEVEMENT_CONDITIONS)) {
    // Skip se já ganhou
    if (earnedIds.has(achievementId)) continue

    // Avaliar condição
    const condition = conditionFn({ userId, ...ctx })
    if (!condition) continue

    // Descobrir dados do achievement
    const achievementDef = ACHIEVEMENTS.find((a) => a.id === achievementId)
    if (!achievementDef) continue

    // 3. Criar UserAchievement
    try {
      await db.userAchievement.create({
        data: {
          userId,
          achievementId,
        },
      })

      // 4. Dar XP do achievement ao user e recalcular nível
      if (achievementDef.xpReward > 0) {
        const updatedUser = await db.user.update({
          where: { id: userId },
          data: { totalXp: { increment: achievementDef.xpReward } },
          select: { totalXp: true, currentLevel: true }
        })
        // FIX 6: Verificar se o XP do achievement causou level-up
        const newLevelInfo = getLevelForXp(updatedUser.totalXp)
        if (newLevelInfo.level > updatedUser.currentLevel) {
          await db.user.update({
            where: { id: userId },
            data: { currentLevel: newLevelInfo.level }
          })
        }
      }

      newlyUnlocked.push(achievementId)
    } catch {
      // Se já existe (race condition), skip silenciosamente
    }
  }

  return newlyUnlocked
}

/**
 * Calcula o progresso de um achievement para near-misses UI.
 * Retorna null se achievement não for rastreável com contexto disponível.
 */
export function getAchievementProgress(
  achievementId: string,
  ctx: Omit<AchievementContext, 'userId'>
): { current: number; required: number; label: string } | null {
  switch (achievementId) {
    case 'first-mission': return { current: ctx.missionCount ?? 0, required: 1, label: '1 missão' }
    case 'missions-5': return { current: ctx.missionCount ?? 0, required: 5, label: '5 missões' }
    case 'missions-10': return { current: ctx.missionCount ?? 0, required: 10, label: '10 missões' }
    case 'missions-25': return { current: ctx.missionCount ?? 0, required: 25, label: '25 missões' }
    case 'missions-50': return { current: ctx.missionCount ?? 0, required: 50, label: '50 missões' }
    case 'missions-100': return { current: ctx.missionCount ?? 0, required: 100, label: '100 missões' }
    case 'streak-3': return { current: ctx.streakDays ?? 0, required: 3, label: '3 dias streak' }
    case 'streak-7': return { current: ctx.streakDays ?? 0, required: 7, label: '7 dias streak' }
    case 'streak-14': return { current: ctx.streakDays ?? 0, required: 14, label: '14 dias streak' }
    case 'streak-30': return { current: ctx.streakDays ?? 0, required: 30, label: '30 dias streak' }
    case 'streak-100': return { current: ctx.streakDays ?? 0, required: 100, label: '100 dias streak' }
    case 'streak-365': return { current: ctx.streakDays ?? 0, required: 365, label: '365 dias streak' }
    case 'first-project': return { current: ctx.projectCount ?? 0, required: 1, label: '1 projecto' }
    case 'projects-3': return { current: ctx.projectCount ?? 0, required: 3, label: '3 projectos' }
    case 'first-vi-chat': return { current: ctx.viConversationCount ?? 0, required: 1, label: '1 mensagem ao Vi' }
    case 'vi-messages-50': return { current: ctx.viConversationCount ?? 0, required: 50, label: '50 mensagens ao Vi' }
    case 'vi-messages-200': return { current: ctx.viConversationCount ?? 0, required: 200, label: '200 mensagens ao Vi' }
    case 'level-10': return { current: ctx.currentLevel ?? 0, required: 10, label: 'nível 10' }
    case 'level-20': return { current: ctx.currentLevel ?? 0, required: 20, label: 'nível 20' }
    case 'level-30': return { current: ctx.currentLevel ?? 0, required: 30, label: 'nível 30' }
    case 'first-post': return { current: ctx.postCount ?? 0, required: 1, label: '1 post' }
    case 'posts-10': return { current: ctx.postCount ?? 0, required: 10, label: '10 posts' }
    default: return null
  }
}
