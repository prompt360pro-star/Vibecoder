# VibeCode — API: Missions

## GET /api/missions
Auth: Required
Query: islandId?, zoneId?
Response: Mission[] with user progress status

## GET /api/missions/[missionId]
Auth: Required
Response: Full mission data + user progress

## POST /api/missions/[missionId]/complete
Auth: Required
Body (completeMissionSchema):
- score: 0-100
- timeSpentSeconds: number
- data?: JSON (answers, code, etc)

Process:
1. Calculate XP (baseXp * score/100)
2. Update MissionProgress (status=COMPLETED)
3. Unlock next mission (status=AVAILABLE)
4. Award XP to user
5. Check achievements
6. Update streak

Response: { progress, xpEarned, nextMissionId, newAchievements }
