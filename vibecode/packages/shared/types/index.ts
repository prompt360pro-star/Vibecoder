// VibeCode — Tipos Compartilhados
// Todos os tipos TypeScript usados por mobile, web, e packages

// ═══════════════════════════════════════
// Enums (espelham o Prisma mas usáveis no mobile)
// ═══════════════════════════════════════

export enum SubscriptionTier {
  FREE = 'FREE',
  PRO = 'PRO',
  TEAM = 'TEAM',
  LIFETIME = 'LIFETIME',
}

export enum MissionStatus {
  LOCKED = 'LOCKED',
  AVAILABLE = 'AVAILABLE',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
}

export enum IslandLevel {
  BASIC = 'BASIC',
  INTERMEDIATE = 'INTERMEDIATE',
  ADVANCED = 'ADVANCED',
  EXPERT = 'EXPERT',
}

export enum ViMode {
  TEACHER = 'TEACHER',
  BUILDER = 'BUILDER',
  DETECTIVE = 'DETECTIVE',
  REVIEWER = 'REVIEWER',
  CREATIVE = 'CREATIVE',
  QUIZ = 'QUIZ',
  CONVERSATION = 'CONVERSATION',
  SCANNER = 'SCANNER',
}

export enum PostType {
  ACHIEVEMENT = 'ACHIEVEMENT',
  PROJECT = 'PROJECT',
  PROMPT = 'PROMPT',
  HELP = 'HELP',
  GENERAL = 'GENERAL',
}

export enum CoopStatus {
  MATCHING = 'MATCHING',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  ABANDONED = 'ABANDONED',
}

export enum LearningStyle {
  READING = 'READING',
  WATCHING = 'WATCHING',
  DOING = 'DOING',
  TALKING = 'TALKING',
}

export enum MemoryType {
  FACT = 'FACT',
  PREFERENCE = 'PREFERENCE',
  STRUGGLE = 'STRUGGLE',
  PROJECT = 'PROJECT',
  GOAL = 'GOAL',
}

// ═══════════════════════════════════════
// Tipos Principais
// ═══════════════════════════════════════

export interface UserProfile {
  id: string
  clerkId: string
  email: string
  name: string | null
  username: string | null
  avatarUrl: string | null
  bio: string | null
  currentLevel: number
  totalXp: number
  streakDays: number
  longestStreak: number
  streakFreezes: number
  subscriptionTier: SubscriptionTier
  locale: string
  timezone: string | null
  dailyTimeGoalMinutes: number
  soundEnabled: boolean
  hapticsEnabled: boolean
  notifyStreak: boolean
  notifyNewMission: boolean
  notifySocial: boolean
  notifyNews: boolean
  createdAt: string
}

export interface DNAProfile {
  techRelation: string
  experience: string
  codeFeeling: string
  aiUsage: string
  buildGoals: string[]
  learningStyle: string
  dailyTime: string
  mainGoal: string
  hasComputer: boolean
  currentArea: string
}

export interface Island {
  id: string
  level: IslandLevel
  name: string
  subtitle: string
  emoji: string
  zones: Zone[]
  bossFight: BossFight
  totalMissions: number
}

export interface BossFight {
  name: string
  description: string
  emoji: string
  xpReward: number
}

export interface Zone {
  id: string
  islandId: string
  name: string
  emoji: string
  description: string
  missions: MissionSummary[]
  miniProject: MiniProject | null
  order: number
}

export interface MiniProject {
  id: string
  title: string
  description: string
  xpReward: number
}

export interface MissionSummary {
  id: string
  title: string
  order: number
  estimatedMinutes: number
  xpReward: number
}

export interface Mission {
  id: string
  zoneId: string
  title: string
  description: string
  order: number
  estimatedMinutes: number
  xpReward: number
  phases: MissionPhase[]
}

export type MissionPhaseType = 'story' | 'concept' | 'interaction' | 'sandbox' | 'quiz'

// ═══════════════════════════════════════
// Tipos de Conteúdo de Fase
// ═══════════════════════════════════════

export interface StoryContent {
  narration: string
  emoji: string
}

export interface ComparisonSection {
  type: 'comparison'
  leftTitle: string
  rightTitle: string
  leftItems: string[]
  rightItems: string[]
}

export interface QuoteSection {
  type: 'quote'
  text: string
  author: string
  date: string
}

export interface ConceptCard {
  emoji: string
  title: string
  description: string
}

export interface CardsSection {
  type: 'cards'
  items: ConceptCard[]
}

export interface TextSection {
  type: 'text'
  text: string
}

export type ConceptSection = ComparisonSection | QuoteSection | CardsSection | TextSection

export interface ConceptContent {
  title: string
  explanation: string
  keyPoints: string[]
  tip?: string
}

export interface TrueFalseStatement {
  text: string
  isTrue: boolean
  explanation: string
}

export interface ClassifyCategory {
  id: string
  label: string
  emoji: string
}

export interface ClassifyItem {
  text: string
  correctCategory: string
  explanation: string
}

export interface InteractionContent {
  exerciseType: 'quiz' | 'true_false' | 'drag_drop' | 'classify'
  instruction?: string
  // quiz / multiple-choice
  question?: string
  options?: string[]
  correctIndex?: number
  explanation?: string
  // true_false
  statements?: TrueFalseStatement[]
  // drag_drop
  items?: string[]
  correctOrder?: number[]
  // classify
  categories?: ClassifyCategory[]
  classifyItems?: ClassifyItem[]
}

export interface SandboxContent {
  instruction: string
  promptTemplate: string
  expectedOutput: string
  hints: string[]
  evaluationCriteria: string[]
}

export interface MissionPhase {
  id: string
  type: MissionPhaseType
  title: string
  content: StoryContent | ConceptContent | InteractionContent | SandboxContent
  estimatedSeconds: number
}

export interface MissionWithProgress extends Mission {
  status: MissionStatus
  completedAt?: string | null
  score?: number | null
}

export interface Achievement {
  id: string
  name: string
  description: string
  emoji: string
  category: string
  xpReward: number
  condition: string
  isSecret: boolean
}

export interface ViMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: string
  metadata?: Record<string, unknown>
}

export interface ViContext {
  userId: string
  userLevel: number
  currentMission: string | null
  currentProject: string | null
  mode: ViMode
  memories: ViMemorySummary[]
  conversationHistory: ViMessage[]
}

export interface ViMemorySummary {
  type: MemoryType
  content: string
  confidence: number
}

export interface MissionProgressData {
  id: string
  userId: string
  missionId: string
  status: MissionStatus
  score: number
  xpEarned: number
  timeSpentSeconds: number
  attempts: number
  completedAt: string | null
}

export interface StreakInfo {
  currentStreak: number
  longestStreak: number
  streakFreezes: number
  todayCompleted: boolean
  todayXp: number
}

export interface LevelInfo {
  level: number
  title: string
  currentXp: number
  xpRequired: number
  xpForNextLevel: number
  progress: number
  viForm: string
}

// ═══════════════════════════════════════
// Tipos de API
// ═══════════════════════════════════════

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: ApiError
  meta?: PaginationMeta
}

export interface ApiError {
  code: string
  message: string
}

export interface PaginationMeta {
  page: number
  perPage: number
  total: number
}

// ═══════════════════════════════════════
// Tipos de Social
// ═══════════════════════════════════════

export interface SocialPostData {
  id: string
  userId: string
  type: PostType
  content: string
  codeBlock: string | null
  attachment: unknown | null
  tags: string[]
  likesCount: number
  commentsCount: number
  createdAt: string
  user: {
    name: string | null
    username: string | null
    avatarUrl: string | null
    currentLevel: number
  }
  isLiked?: boolean
}

export interface PostCommentData {
  id: string
  userId: string
  content: string
  createdAt: string
  user: {
    name: string | null
    username: string | null
    avatarUrl: string | null
  }
}

// ═══════════════════════════════════════
// Tipos de Certificate
// ═══════════════════════════════════════

export interface CertificateData {
  id: string
  certificateNumber: string
  level: IslandLevel
  issuedAt: string
  skills: string[]
  bossFightScore: number | null
  totalStudyHours: number | null
  pdfUrl: string | null
  pngUrl: string | null
}

// ═══════════════════════════════════════
// Tipos de Notification
// ═══════════════════════════════════════

export interface NotificationData {
  id: string
  type: string
  title: string
  body: string
  data: unknown | null
  read: boolean
  createdAt: string
}

// ═══════════════════════════════════════
// Tipos de Model Router (AI)
// ═══════════════════════════════════════

export type TaskType =
  | 'complex-reasoning'
  | 'code-review'
  | 'code-generation'
  | 'simple-code'
  | 'summarization'
  | 'quiz'
  | 'simple-question'
  | 'fast-response'

export interface ModelConfig {
  provider: 'anthropic' | 'openai' | 'groq'
  model: string
  maxTokens: number
  temperature: number
}
