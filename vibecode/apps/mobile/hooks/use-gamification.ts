// VibeCode — useGamification hooks
// useAddXp: mutation POST /api/gamification/xp
// useCheckStreak: mutation POST /api/gamification/streak/check (1x/sessão via MMKV)

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { MMKV } from 'react-native-mmkv'
import { api } from '../services/api'
import { useGamificationStore } from '../stores/gamification-store'

const storage = new MMKV({ id: 'gamification' })
const LAST_STREAK_CHECK_KEY = 'lastStreakCheckDate'

function getTodayString(): string {
  return new Date().toISOString().slice(0, 10) // 'YYYY-MM-DD'
}

// ─────────────────────────────────────────────
// XP Response
// ─────────────────────────────────────────────
interface AddXpResponse {
  newXp: number
  newLevel: number
  leveledUp: boolean
  levelTitle: string
  viForm: string
  newAchievements: string[]
}

// ─────────────────────────────────────────────
// Streak Check Response
// ─────────────────────────────────────────────
interface StreakCheckResponse {
  streakDays: number
  freezeUsed: boolean
  bonusEarned: boolean
  bonusXp: number
  newAchievements: string[]
  alreadyChecked?: boolean
}

// ─────────────────────────────────────────────
// useAddXp
// ─────────────────────────────────────────────
export function useAddXp() {
  const qc = useQueryClient()
  const { triggerLevelUp, triggerAchievement } = useGamificationStore()

  return useMutation({
    mutationFn: ({ amount, source }: { amount: number; source: string }) =>
      api.post<AddXpResponse>('/gamification/xp', { amount, source }),
    onSuccess: (data) => {
      // Invalidar queries de user/profile
      qc.invalidateQueries({ queryKey: ['user'] })

      // Disparar level up modal se subiu
      if (data.leveledUp) {
        triggerLevelUp({ level: data.newLevel, title: data.levelTitle, viForm: data.viForm })
      }

      // Enfileirar achievement toasts
      for (const id of data.newAchievements) {
        triggerAchievement({ id, name: id, emoji: '🏆', xpReward: 0 })
      }
    },
  })
}

// ─────────────────────────────────────────────
// useCheckStreak
// ─────────────────────────────────────────────
export function useCheckStreak() {
  const qc = useQueryClient()
  const { triggerAchievement } = useGamificationStore()

  const mutation = useMutation({
    mutationFn: () => api.post<StreakCheckResponse>('/gamification/streak/check', {}),
    onSuccess: (data) => {
      if (data.alreadyChecked) return

      // Invalidar streak query
      qc.invalidateQueries({ queryKey: ['streak'] })

      // Enfileirar achievement toasts de streak
      for (const id of data.newAchievements ?? []) {
        triggerAchievement({ id, name: id, emoji: '🔥', xpReward: 0 })
      }
    },
  })

  /**
   * Chama o streak check apenas 1x por sessão/dia.
   * Usa MMKV para guardar a última data de check.
   */
  const checkOnce = () => {
    const today = getTodayString()
    const last = storage.getString(LAST_STREAK_CHECK_KEY)

    if (last === today) return // Já foi chamado hoje

    storage.set(LAST_STREAK_CHECK_KEY, today)
    mutation.mutate()
  }

  return { checkOnce, ...mutation }
}
