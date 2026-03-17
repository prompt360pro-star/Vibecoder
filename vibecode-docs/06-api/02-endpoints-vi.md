# VibeCode — API: Vi (Mentor IA)

## POST /api/vi/chat
Auth: Required
Rate Limit: 30 req/min
Free Limit: 5 messages/day (check vi_conversations count today)

Body (viMessageSchema):
- content: string (1-10000)
- mode: ViMode (default "teacher")
- context?: string
- contextId?: string
- conversationHistory?: last 8 messages

Process:
1. Auth + rate limit + free tier check
2. Get user (level, name, locale, tier)
3. Get memories (top 5)
4. Build system prompt (assembleViPrompt)
5. Classify task (classifyTask)
6. Select model (selectModel)
7. Call AI provider (Anthropic/OpenAI/Groq)
8. Save conversation to DB
9. Return response

Response: { content, model, tokensUsed }

Error codes: UNAUTHORIZED, RATE_LIMIT, LIMIT_REACHED, VALIDATION, AI_ERROR
