# VibeCode — API: Users

## GET /api/users/me
Auth: Required (Clerk)
Response: UserProfile + levelTitle + viForm
Side effect: update lastActiveAt

## PUT /api/users/me
Auth: Required
Body: updateProfileSchema (Zod validated)
Response: Updated user

## POST /api/users/dna
Auth: Required
Body: dnaProfileSchema
Response: DNAResult { profile, startLevel, estimatedWeeks, personalMessage }
Side effect: update user dnaProfile, learningStyle, buildGoals

## Webhook: POST /api/webhooks/clerk
Events: user.created → create User in DB, user.updated → update, user.deleted → delete
Verification: Svix signature
