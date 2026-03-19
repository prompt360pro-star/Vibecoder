import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
  type InfiniteData,
  type QueryKey,
} from "@tanstack/react-query";
import { api, apiRaw } from "../services/api";
import type { CreatePostInput, PostCommentData } from "@vibecode/shared";

export interface SocialUser {
  id: string;
  name: string | null;
  username: string | null;
  avatarUrl: string | null;
  currentLevel: number;
}

export interface SocialPostType {
  id: string;
  userId: string;
  type: "ACHIEVEMENT" | "PROJECT" | "PROMPT" | "HELP" | "GENERAL";
  content: string;
  codeBlock: string | null;
  tags: string[];
  likesCount: number;
  commentsCount: number;
  createdAt: string;
  user: SocialUser;
  isLikedByMe: boolean;
}

interface FeedApiResponse {
  success: boolean;
  data: SocialPostType[];
  meta: {
    page: number;
    perPage: number;
    total: number;
  };
}

export interface SocialCommentType extends PostCommentData {}

export function useFeed(type?: string) {
  return useInfiniteQuery<FeedApiResponse>({
    queryKey: ["social", "feed", type],
    queryFn: async ({ pageParam = 1 }) => {
      let endpoint = `/social/feed?page=${pageParam}&perPage=20`;
      if (type) {
        endpoint += `&type=${type}`;
      }

      return apiRaw.get<FeedApiResponse>(endpoint);
    },
    getNextPageParam: (lastPage) => {
      const { page, perPage, total } = lastPage.meta;
      return page * perPage < total ? page + 1 : undefined;
    },
    initialPageParam: 1,
    staleTime: 1000 * 60,
  });
}

export function useCreatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePostInput) => api.post("/social/posts", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["social", "feed"] });
    },
  });
}

export function useComments(postId: string) {
  return useQuery<SocialCommentType[]>({
    queryKey: ["social", "comments", postId],
    queryFn: () =>
      api.get<SocialCommentType[]>(`/social/posts/${postId}/comments`),
    enabled: !!postId,
    staleTime: 1000 * 30,
  });
}

export function useCreateComment(postId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (content: string) =>
      api.post<SocialCommentType>(`/social/posts/${postId}/comments`, {
        content,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["social", "comments", postId],
      });
      queryClient.invalidateQueries({ queryKey: ["social", "feed"] });
    },
  });
}

export function useLikePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId: string) =>
      api.post<{ liked: boolean; likesCount: number }>(
        `/social/posts/${postId}/like`,
      ),
    onMutate: async (postId) => {
      await queryClient.cancelQueries({ queryKey: ["social", "feed"] });

      const previousFeedQueries = queryClient.getQueriesData<
        InfiniteData<FeedApiResponse, number>
      >({
        queryKey: ["social", "feed"],
      });

      queryClient.setQueriesData<InfiniteData<FeedApiResponse, number>>(
        { queryKey: ["social", "feed"] },
        (old) => {
          if (!old) {
            return old;
          }

          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              data: page.data.map((post) => {
                if (post.id !== postId) {
                  return post;
                }

                const newLikeState = !post.isLikedByMe;

                return {
                  ...post,
                  isLikedByMe: newLikeState,
                  likesCount: post.likesCount + (newLikeState ? 1 : -1),
                };
              }),
            })),
          };
        },
      );

      return { previousFeedQueries };
    },
    onError: (_error, _postId, context) => {
      if (!context?.previousFeedQueries) {
        return;
      }

      context.previousFeedQueries.forEach(([queryKey, oldData]) => {
        queryClient.setQueryData(queryKey as QueryKey, oldData);
      });
    },
  });
}

export interface RankingEntry {
  position: number;
  id: string;
  name: string | null;
  username: string | null;
  avatarUrl: string | null;
  xp: number;
}

interface RankingResponse {
  rankings: RankingEntry[];
  myPosition: number;
}

export function useRanking(period: "week" | "month" | "alltime") {
  return useQuery<RankingResponse>({
    queryKey: ["social", "ranking", period],
    queryFn: () => api.get<RankingResponse>(`/social/ranking?period=${period}`),
    staleTime: 1000 * 60 * 5,
  });
}
