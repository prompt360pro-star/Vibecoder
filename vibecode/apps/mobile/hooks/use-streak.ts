import { useQuery } from '@tanstack/react-query'
import { api } from '../services/api'
import { useAuth } from '@clerk/clerk-expo'

export interface StreakInfo {
  current: number
  longest: number
  freezesAvailable: number
  todayCompleted: boolean
  nextBonus: {
    days: number
    xpBonus: number
    emoji: string
    message: string
  } | null
  calendar?: { date: string; completed: boolean; freezeUsed: boolean }[]
}

export function useStreak() {
  const { userId } = useAuth()

  return useQuery<StreakInfo>({
    queryKey: ['user', 'streak'],
    enabled: !!userId,
    queryFn: async () => {
      const response = await api.get<StreakInfo>('/gamification/streak')
      return response
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
    initialData: {
      current: 0,
      longest: 0,
      freezesAvailable: 2,
      todayCompleted: false,
      nextBonus: null,
    },
  })
}
