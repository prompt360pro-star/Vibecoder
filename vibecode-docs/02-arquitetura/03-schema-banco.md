# VibeCode — Schema do Banco de Dados (Prisma)

## Visão Geral
- 16 models principais
- PostgreSQL (Neon serverless)
- Prisma ORM
- Todos os models com timestamps e soft references

## Diagrama de Relações

```
User (central)
├── 1:N → MissionProgress
├── 1:N → ViConversation
├── 1:N → ViMemory
├── 1:N → UserAchievement
├── 1:N → StreakDay
├── 1:N → Project
├── 1:N → SocialPost
├── 1:N → PostLike
├── 1:N → PostComment
├── 1:N → SharedPrompt
├── 1:N → SavedPrompt
├── 1:N → Certificate
├── 1:N → Notification
├── 1:N → PushToken
├── 1:N → CoopSession (as PlayerA)
└── 1:N → CoopSession (as PlayerB)
```

## Enums

```prisma
enum SubscriptionTier { FREE PRO TEAM LIFETIME }
enum MissionStatus { LOCKED AVAILABLE IN_PROGRESS COMPLETED }
enum IslandLevel { BASIC INTERMEDIATE ADVANCED EXPERT }
enum ViMode { TEACHER BUILDER DETECTIVE REVIEWER CREATIVE QUIZ CONVERSATION SCANNER }
enum PostType { ACHIEVEMENT PROJECT PROMPT HELP GENERAL }
enum CoopStatus { MATCHING ACTIVE COMPLETED ABANDONED }
enum LearningStyle { READING WATCHING DOING TALKING }
enum MemoryType { FACT PREFERENCE STRUGGLE PROJECT GOAL }
```

## Models

### User
Campos principais: id, clerkId, email, name, username, avatarUrl, bio, dnaProfile (JSON), learningStyle, dailyTimeGoalMinutes, buildGoals, currentLevel, totalXp, streakDays, streakFreezes, longestStreak, subscriptionTier, stripeCustomerId, stripeSubscriptionId, locale, timezone, soundEnabled, hapticsEnabled, notifyStreak, notifyNewMission, notifySocial, notifyNews, openToWork, preferredStack, createdAt, updatedAt, lastActiveAt.

### MissionProgress
Campos: id, userId (FK), missionId, status, score, xpEarned, timeSpentSeconds, attempts, data (JSON), completedAt. Unique: [userId, missionId].

### UserAchievement
Campos: id, userId (FK), achievementId, earnedAt, data (JSON). Unique: [userId, achievementId].

### StreakDay
Campos: id, userId (FK), date, xpEarned, missionsCompleted, timeSpentMinutes, freezeUsed. Unique: [userId, date].

### Project
Campos: id, userId (FK), title, description, type, techStack[], sourceCodeUrl, liveUrl, thumbnailUrl, isPublic, isPortfolio, likesCount, createdAt, updatedAt.

### ViConversation
Campos: id, userId (FK), mode (ViMode), context, contextId, messages (JSON[]), modelUsed, tokensUsed, createdAt, updatedAt.

### ViMemory
Campos: id, userId (FK), type (MemoryType), content, sourceConversationId, confidence (Float), createdAt, updatedAt.

### SocialPost
Campos: id, userId (FK), type (PostType), content, codeBlock, attachment (JSON), tags[], likesCount, commentsCount, createdAt, updatedAt.

### PostLike
Campos: id, userId (FK), postId (FK), createdAt. Unique: [userId, postId].

### PostComment
Campos: id, userId (FK), postId (FK), content, createdAt.

### SharedPrompt
Campos: id, userId (FK), title, prompt, category, tags[], savesCount, usesCount, createdAt, updatedAt.

### SavedPrompt
Campos: id, userId (FK), promptId (FK), savedAt. Unique: [userId, promptId].

### CoopSession
Campos: id, missionId, playerAId (FK), playerBId (FK nullable), playerARole, playerBRole, status (CoopStatus), chatHistory (JSON[]), ratings (JSON), startedAt, completedAt, createdAt.

### Certificate
Campos: id, userId (FK), certificateNumber (unique), level (IslandLevel), issuedAt, skills[], projects (JSON), bossFightScore, totalStudyHours, signatureHash, pdfUrl, pngUrl, isRevoked, metadata (JSON).

### Notification
Campos: id, userId (FK), type, title, body, data (JSON), read, createdAt.

### PushToken
Campos: id, userId (FK), token (unique), platform, createdAt.

## Indexes Importantes
- User: clerkId (unique), email (unique), username (unique), stripeCustomerId (unique)
- MissionProgress: [userId], [missionId], [userId, missionId] (unique)
- ViConversation: [userId], [userId, context]
- ViMemory: [userId], [userId, type]
- SocialPost: [userId], [createdAt DESC], [type]
- StreakDay: [userId], [userId, date] (unique)
- Notification: [userId, read], [userId, createdAt DESC]
