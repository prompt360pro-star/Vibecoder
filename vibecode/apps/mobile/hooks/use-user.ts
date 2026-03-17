// Hook para dados do user autenticado
// React Query + Clerk
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@clerk/clerk-expo'
import { api } from '../services/api'
import type { UserProfile, LevelInfo } from '@vibecode/shared'

interface UserWithLevel extends UserProfile {
  levelTitle: string
  viForm: string
  levelInfo: LevelInfo
}

export const useUser = () => {
  const { isSignedIn } = useAuth()

  const query = useQuery({
    queryKey: ['user', 'me'],
    queryFn: async () => {
      const data = await api.get<UserWithLevel>('/users/me')
      return data
    },
    enabled: !!isSignedIn,
    staleTime: 1000 * 60 * 5, // 5 minutos
    retry: 2,
  })

  return {
    user: query.data ?? null,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  }
}
