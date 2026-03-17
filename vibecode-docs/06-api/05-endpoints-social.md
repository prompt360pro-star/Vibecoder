# VibeCode — API: Social

## GET /api/social/feed
Auth: Required
Query: page, perPage, type?
Response: SocialPost[] with isLikedByMe, paginated

## POST /api/social/posts
Auth: Required
Body (createPostSchema): type, content, codeBlock?, tags?, attachment?
Response: Created post

## POST /api/social/posts/[id]/like
Auth: Required (toggle)
Response: { liked: boolean, likesCount }

## POST /api/social/posts/[id]/comments
Auth: Required
Body (createCommentSchema): content
Response: Created comment

## GET /api/social/ranking
Auth: Required
Query: period (week|month|alltime)
Response: RankingEntry[] with user position highlighted

## POST /api/social/prompts
Auth: Required
Body (createPromptSchema): title, prompt, category, tags?
Response: Created shared prompt

## GET /api/social/prompts
Auth: Required
Query: category?, search?, sort (popular|recent)
Response: SharedPrompt[] paginated
