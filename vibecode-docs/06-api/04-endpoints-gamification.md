# VibeCode — API: Gamification

## POST /api/gamification/xp
Auth: Required
Body: { amount: number, source: string }
Process: add XP → check level up → check achievements → update streak
Response: { newXp, newLevel, leveledUp, levelTitle, viForm, newAchievements }

## GET /api/gamification/streak
Auth: Required
Response: { current, longest, freezesAvailable, todayCompleted, nextBonus }

## POST /api/gamification/streak/check
Auth: Required (called daily by client)
Process: verify yesterday → increment or reset → use freeze if needed
Response: { streakDays, freezeUsed, bonusEarned }

## GET /api/gamification/achievements
Auth: Required
Response: { earned: Achievement[], available: Achievement[], nearMisses: Achievement[] }
