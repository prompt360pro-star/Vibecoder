import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../services/api'
import type { MissionWithProgress } from '@vibecode/shared'

// ─── useMissions ───────────────────────────────────────────
export function useMissions(zoneId?: string) {
  return useQuery<MissionWithProgress[]>({
    queryKey: ['missions', zoneId ?? 'all'],
    queryFn: async () => {
      const url = zoneId ? `/missions?zoneId=${zoneId}` : '/missions'
      return api.get<MissionWithProgress[]>(url)
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

// ─── useMission ────────────────────────────────────────────
export function useMission(missionId: string) {
  return useQuery<MissionWithProgress>({
    queryKey: ['mission', missionId],
    queryFn: () => api.get<MissionWithProgress>(`/missions/${missionId}`),
    enabled: !!missionId,
    staleTime: 1000 * 60 * 5,
  })
}

// ─── useCompleteMission ────────────────────────────────────
export interface CompleteMissionPayload {
  score: number
  timeSpentSeconds: number
  data?: Record<string, unknown>
}

export interface CompleteMissionResult {
  xpEarned: number
  newTotalXp: number
  nextMissionId: string | null
  newAchievements: string[]
}

export function useCompleteMission() {
  const queryClient = useQueryClient()

  return useMutation<CompleteMissionResult, Error, { missionId: string } & CompleteMissionPayload>({
    mutationFn: ({ missionId, ...payload }) =>
      api.post<CompleteMissionResult>(`/missions/${missionId}/complete`, payload),
    onSuccess: () => {
      // Invalidar listas de missões e dados do user (XP actualizou)
      queryClient.invalidateQueries({ queryKey: ['missions'] })
      queryClient.invalidateQueries({ queryKey: ['user'] })
      queryClient.invalidateQueries({ queryKey: ['user', 'streak'] })
    },
  })
}
