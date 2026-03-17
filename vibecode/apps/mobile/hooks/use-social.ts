import { useInfiniteQuery, useMutation, useQueryClient, useQuery } from '@tanstack/react-query'
import { api } from '../services/api'
import type { CreatePostInput, PaginationInput } from '@vibecode/shared'

export interface SocialUser {
  id: string
  name: string | null
  username: string | null
  avatarUrl: string | null
  currentLevel: number
}

export interface SocialPostType {
  id: string
  userId: string
  type: 'ACHIEVEMENT' | 'PROJECT' | 'PROMPT' | 'HELP' | 'GENERAL'
  content: string
  codeBlock: string | null
  tags: string[]
  likesCount: number
  commentsCount: number
  createdAt: string
  user: SocialUser
  isLikedByMe: boolean
}

interface FeedResponse {
  success: boolean
  data: SocialPostType[]
  meta: { page: number; perPage: number; total: number }
}

export function useFeed(type?: string) {
  return useInfiniteQuery<FeedResponse>({
    queryKey: ['social', 'feed', type],
    queryFn: async ({ pageParam = 1 }) => {
      let endpoint = `/social/feed?page=${pageParam}&perPage=20`
      if (type) endpoint += `&type=${type}`
      return api.get<FeedResponse>(endpoint)
    },
    getNextPageParam: (lastPage) => {
      const { page, perPage, total } = lastPage.meta
      return page * perPage < total ? page + 1 : undefined
    },
    initialPageParam: 1,
    staleTime: 1000 * 60, // 1 minute
  })
}

export function useCreatePost() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreatePostInput) => api.post('/social/posts', data),
    onSuccess: () => {
      // Invalidate all feed queries to refetch 
      queryClient.invalidateQueries({ queryKey: ['social', 'feed'] })
    },
  })
}

export function useLikePost() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (postId: string) => api.post<{ liked: boolean, likesCount: number }>(`/social/posts/${postId}/like`),
    onMutate: async (postId) => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey: ['social', 'feed'] })

      // Snapshot the previous value
      const previousFeedQueries = queryClient.getQueriesData({ queryKey: ['social', 'feed'] })

      // Optimistically update to the new value logic
      queryClient.setQueriesData({ queryKey: ['social', 'feed'] }, (old: any) => {
        if (!old || !old.pages) return old

        return {
          ...old,
          pages: old.pages.map((page: any) => ({
            ...page,
            data: page.data.map((post: SocialPostType) => {
               if (post.id === postId) {
                 const newLikeState = !post.isLikedByMe
                 return {
                   ...post,
                   isLikedByMe: newLikeState,
                   likesCount: post.likesCount + (newLikeState ? 1 : -1)
                 }
               }
               return post
            })
          }))
        }
      })

      // Return a context object with the snapshotted value
      return { previousFeedQueries }
    },
    onError: (err, newTodo, context) => {
      // Revert to snapshot on error
      if (context?.previousFeedQueries) {
        context.previousFeedQueries.forEach(([queryKey, oldData]) => {
           queryClient.setQueryData(queryKey, oldData)
        })
      }
    },
    onSettled: () => {
      // Always refetch after error or success to restablish sync in background (optional, can be skipped to avoid loads)
      // queryClient.invalidateQueries({ queryKey: ['social', 'feed'] })
    },
  })
}

export interface RankingEntry {
  position: number
  id: string
  name: string | null
  username: string | null
  avatarUrl: string | null
  xp: number
}

interface RankingResponse {
  rankings: RankingEntry[]
  myPosition: number
}

export function useRanking(period: 'week' | 'month' | 'alltime') {
  return useQuery<RankingResponse>({
    queryKey: ['social', 'ranking', period],
    queryFn: () => api.get<RankingResponse>(`/social/ranking?period=${period}`),
    staleTime: 1000 * 60 * 5, // 5 min
  })
}
