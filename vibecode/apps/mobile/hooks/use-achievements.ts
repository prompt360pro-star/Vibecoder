// VibeCode — useAchievements hook
// React Query para GET /api/gamification/achievements

import { useQuery } from '@tanstack/react-query'
import { api } from '../services/api'
import type { Achievement } from '@vibecode/shared'

export interface AchievementWithProgress extends Achievement {
  earnedAt?: string
  progress?: { current: number; required: number; label: string } | null
}

export interface AchievementsData {
  earned: AchievementWithProgress[]
  available: AchievementWithProgress[]
  nearMisses: AchievementWithProgress[]
  stats: {
    totalEarned: number
    totalAvailable: number
    completionPct: number
  }
}

export function useAchievements() {
  const query = useQuery<AchievementsData>({
    queryKey: ['achievements'],
    queryFn: () => api.get<AchievementsData>('/gamification/achievements'),
    staleTime: 1000 * 60 * 5, // 5 minutos
  })

  return {
    earned: query.data?.earned ?? [],
    available: query.data?.available ?? [],
    nearMisses: query.data?.nearMisses ?? [],
    stats: query.data?.stats ?? { totalEarned: 0, totalAvailable: 0, completionPct: 0 },
    isLoading: query.isLoading,
    refetch: query.refetch,
  }
}
