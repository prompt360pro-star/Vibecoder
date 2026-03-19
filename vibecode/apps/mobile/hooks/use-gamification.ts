import { useMutation, useQueryClient } from '@tanstack/react-query'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { api } from '../services/api'
import { useGamificationStore } from '../stores/gamification-store'

const LAST_STREAK_CHECK_KEY = 'vibecode:lastStreakCheckDate'

function getTodayString(): string {
  return new Date().toISOString().slice(0, 10)
}

interface AddXpResponse {
  newXp: number
  newLevel: number
  leveledUp: boolean
  levelTitle: string
  viForm: string
  newAchievements: string[]
}

interface StreakCheckResponse {
  streakDays: number
  freezeUsed: boolean
  bonusEarned: boolean
  bonusXp: number
  newAchievements: string[]
  alreadyChecked?: boolean
}

export function useAddXp() {
  const queryClient = useQueryClient()
  const { triggerLevelUp, triggerAchievement } = useGamificationStore()

  return useMutation({
    mutationFn: ({ amount, source }: { amount: number; source: string }) =>
      api.post<AddXpResponse>('/gamification/xp', { amount, source }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['user'] })

      if (data.leveledUp) {
        triggerLevelUp({ level: data.newLevel, title: data.levelTitle, viForm: data.viForm })
      }

      for (const id of data.newAchievements) {
        triggerAchievement({ id, name: id, emoji: '🏆', xpReward: 0 })
      }
    },
  })
}

export function useCheckStreak() {
  const queryClient = useQueryClient()
  const { triggerAchievement } = useGamificationStore()

  const mutation = useMutation({
    mutationFn: () => api.post<StreakCheckResponse>('/gamification/streak/check', {}),
    onSuccess: (data) => {
      if (data.alreadyChecked) return

      queryClient.invalidateQueries({ queryKey: ['streak'] })

      for (const id of data.newAchievements ?? []) {
        triggerAchievement({ id, name: id, emoji: '🔥', xpReward: 0 })
      }
    },
  })

  const checkOnce = () => {
    void (async () => {
      const today = getTodayString()
      const last = await AsyncStorage.getItem(LAST_STREAK_CHECK_KEY)

      if (last === today) {
        return
      }

      await AsyncStorage.setItem(LAST_STREAK_CHECK_KEY, today)
      mutation.mutate()
    })()
  }

  return { checkOnce, ...mutation }
}
