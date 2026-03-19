import { useQuery } from '@tanstack/react-query'
import { api } from '../services/api'
import type { Achievement as SharedAchievement } from '@vibecode/shared'

interface AchievementProgress {
  current: number
  required: number
  label: string
}

interface ApiAchievement extends SharedAchievement {
  earnedAt?: string
  progress?: AchievementProgress | null
}

interface ApiAchievementGroup {
  earned: ApiAchievement[]
  available: ApiAchievement[]
  nearMisses: ApiAchievement[]
  stats: AchievementStats
}

export interface Achievement {
  id: string
  title: string
  description: string
  emoji: string
  xpReward: number
  isSecret?: boolean
  earnedAt?: string
}

export interface NearMissAchievement extends Achievement {
  progress: AchievementProgress
}

export interface AchievementStats {
  totalEarned: number
  totalAvailable: number
  completionPct: number
}

export interface AchievementGroup {
  earned: Achievement[]
  available: Achievement[]
  nearMisses: NearMissAchievement[]
  stats: AchievementStats
}

const mapAchievement = (achievement: ApiAchievement): Achievement => ({
  id: achievement.id,
  title: achievement.name,
  description: achievement.description,
  emoji: achievement.emoji,
  xpReward: achievement.xpReward,
  isSecret: achievement.isSecret,
  earnedAt: achievement.earnedAt,
})

export function useAchievements() {
  const query = useQuery<AchievementGroup>({
    queryKey: ['achievements'],
    queryFn: async () => {
      const data = await api.get<ApiAchievementGroup>('/gamification/achievements')

      return {
        earned: data.earned.map(mapAchievement),
        available: data.available.map(mapAchievement),
        nearMisses: data.nearMisses
          .filter((achievement): achievement is ApiAchievement & { progress: AchievementProgress } => Boolean(achievement.progress))
          .map((achievement) => ({
            ...mapAchievement(achievement),
            progress: achievement.progress,
          })),
        stats: data.stats,
      }
    },
    staleTime: 1000 * 60 * 2,
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
