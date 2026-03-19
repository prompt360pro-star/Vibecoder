// VibeCode — Schemas de Validação (Zod)
// Usados no servidor para validar requests e no mobile para forms

import { z } from 'zod'

// ═══════════════════════════════════════
// Enums Zod
// ═══════════════════════════════════════

export const subscriptionTierEnum = z.enum(['FREE', 'PRO', 'TEAM', 'LIFETIME'])
export const missionStatusEnum = z.enum(['LOCKED', 'AVAILABLE', 'IN_PROGRESS', 'COMPLETED'])
export const islandLevelEnum = z.enum(['BASIC', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'])
export const viModeEnum = z.enum(['TEACHER', 'BUILDER', 'DETECTIVE', 'REVIEWER', 'CREATIVE', 'QUIZ', 'CONVERSATION', 'SCANNER'])
export const postTypeEnum = z.enum(['ACHIEVEMENT', 'PROJECT', 'PROMPT', 'HELP', 'GENERAL'])
export const coopStatusEnum = z.enum(['MATCHING', 'ACTIVE', 'COMPLETED', 'ABANDONED'])
export const learningStyleEnum = z.enum(['READING', 'WATCHING', 'DOING', 'TALKING'])
export const memoryTypeEnum = z.enum(['FACT', 'PREFERENCE', 'STRUGGLE', 'PROJECT', 'GOAL'])

// ═══════════════════════════════════════
// DNA Profile Schema
// ═══════════════════════════════════════

export const dnaProfileSchema = z.object({
  techRelation: z.enum(['loves', 'curious', 'scared', 'neutral']),
  experience: z.enum(['zero', 'dabbled', 'some', 'professional']),
  codeFeeling: z.enum(['excited', 'nervous', 'confused', 'determined']),
  aiUsage: z.enum(['never', 'basic', 'regular', 'advanced']),
  buildGoals: z.array(z.string()).min(1).max(5),
  learningStyle: learningStyleEnum,
  dailyTime: z.enum(['5-15', '15-30', '30-60', '60+']),
  mainGoal: z.enum(['learn-basics', 'build-product', 'career-change', 'side-income', 'curiosity']),
  hasComputer: z.boolean(),
  currentArea: z.enum(['tech', 'business', 'design', 'student', 'other']),
})

export type DNAProfileInput = z.infer<typeof dnaProfileSchema>

// ═══════════════════════════════════════
// Update Profile Schema
// ═══════════════════════════════════════

export const updateProfileSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  username: z.string().min(3).max(30).regex(/^[a-z0-9_-]+$/).optional(),
  bio: z.string().max(500).optional(),
  avatarUrl: z.string().url().optional(),
  dailyTimeGoalMinutes: z.number().int().min(5).max(120).optional(),
  locale: z.enum(['pt', 'en', 'es', 'fr']).optional(),
  timezone: z.string().optional(),
  soundEnabled: z.boolean().optional(),
  hapticsEnabled: z.boolean().optional(),
  notifyStreak: z.boolean().optional(),
  notifyNewMission: z.boolean().optional(),
  notifySocial: z.boolean().optional(),
  notifyNews: z.boolean().optional(),
  pushToken: z.string().nullable().optional(),
  openToWork: z.boolean().optional(),
  preferredStack: z.array(z.string()).optional(),
})

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>

// ═══════════════════════════════════════
// Vi Message Schema
// ═══════════════════════════════════════

export const viMessageSchema = z.object({
  content: z.string().min(1).max(10000),
  mode: viModeEnum,
  context: z.string().optional(),
  contextId: z.string().optional(),
  imageBase64: z.string().optional(),
  conversationId: z.string().optional(), // Melhoria 4: suporte a histórico de conversa
})

export type ViMessageInput = z.infer<typeof viMessageSchema>

// ═══════════════════════════════════════
// Create Post Schema
// ═══════════════════════════════════════

export const createPostSchema = z.object({
  type: postTypeEnum,
  content: z.string().min(1).max(5000),
  codeBlock: z.string().max(10000).optional(),
  tags: z.array(z.string().max(30)).max(5).optional(),
})

export type CreatePostInput = z.infer<typeof createPostSchema>

// ═══════════════════════════════════════
// Complete Mission Schema
// ═══════════════════════════════════════

export const completeMissionSchema = z.object({
  missionId: z.string(),
  score: z.number().int().min(0).max(100),
  timeSpentSeconds: z.number().int().min(0),
  data: z.record(z.unknown()).optional(),
})

export type CompleteMissionInput = z.infer<typeof completeMissionSchema>

// ═══════════════════════════════════════
// Pagination Schema
// ═══════════════════════════════════════

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  perPage: z.coerce.number().int().min(1).max(50).default(20),
})

export type PaginationInput = z.infer<typeof paginationSchema>

// ═══════════════════════════════════════
// Post Comment Schema
// ═══════════════════════════════════════

export const createCommentSchema = z.object({
  postId: z.string(),
  content: z.string().min(1).max(2000),
})

export type CreateCommentInput = z.infer<typeof createCommentSchema>

// ═══════════════════════════════════════
// Shared Prompt Schema
// ═══════════════════════════════════════

export const createSharedPromptSchema = z.object({
  title: z.string().min(1).max(200),
  prompt: z.string().min(1).max(10000),
  category: z.string().max(50).optional(),
  tags: z.array(z.string().max(30)).max(10).optional(),
})

export type CreateSharedPromptInput = z.infer<typeof createSharedPromptSchema>
