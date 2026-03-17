# VibeCode — Tipos Compartilhados e Schemas Zod

## Localização
packages/shared/types/index.ts — Tipos TypeScript
packages/shared/schemas/index.ts — Schemas Zod para validação

## Tipos Principais

### UserProfile
id, clerkId, email, name, username, avatarUrl, bio, currentLevel, totalXp, streakDays, longestStreak, subscriptionTier, locale, createdAt

### DNAProfile
techRelation, experience, codeFeeling, aiUsage, buildGoals[], learningStyle, dailyTime, mainGoal, hasComputer, currentArea

### Island
id, level, name, subtitle, emoji, zones[], bossFight, totalMissions

### Zone
id, islandId, name, emoji, description, missions[], miniProject, order

### Mission
id, zoneId, title, description, order, estimatedMinutes, xpReward, phases[]

### MissionPhase
id, type (story|concept|interaction|sandbox|quiz), title, content, estimatedSeconds

### Achievement
id, name, description, emoji, category, xpReward, condition, isSecret

### ViMessage
id, role (user|assistant|system), content, timestamp, metadata

### ViContext
userId, userLevel, currentMission, currentProject, mode, memories[], conversationHistory[]

### ApiResponse<T>
success, data?, error? { code, message }, meta? { page, perPage, total }

## Schemas Zod

### dnaProfileSchema
Valida todo o perfil DNA com enums estritos

### updateProfileSchema
name?, username?, bio?, avatarUrl?, settings...

### viMessageSchema
content (1-10000 chars), mode (8 opções), context?, contextId?, imageBase64?

### createPostSchema
type (5 opções), content (1-5000), codeBlock?, tags? (max 5)

### completeMissionSchema
missionId, score (0-100), timeSpentSeconds, data?

### paginationSchema
page (min 1, default 1), perPage (1-50, default 20)
