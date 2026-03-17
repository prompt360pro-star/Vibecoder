# Regras — Backend API (Next.js)

## Contexto
Este é o backend do VibeCode, construído com Next.js 14 App Router.
Serve as API Routes consumidas pelo app mobile.

## Especificação de Endpoints
Consultar: `C:\Users\Administrator\Documents\vibecoder\vibecode-docs\06-api\`
- 01-endpoints-users.md → GET/PUT /api/users/me, POST /api/users/dna
- 02-endpoints-vi.md → POST /api/vi/chat
- 03-endpoints-missions.md → GET/POST /api/missions/
- 04-endpoints-gamification.md → XP, streak, achievements
- 05-endpoints-social.md → Feed, posts, ranking, prompts

## Estrutura de API Routes
```
app/api/
├── users/me/route.ts
├── users/dna/route.ts
├── missions/route.ts
├── missions/[missionId]/route.ts
├── missions/[missionId]/complete/route.ts
├── vi/chat/route.ts
├── gamification/xp/route.ts
├── gamification/streak/route.ts
├── gamification/achievements/route.ts
├── social/feed/route.ts
├── social/posts/route.ts
├── social/ranking/route.ts
├── webhooks/clerk/route.ts
└── webhooks/stripe/route.ts
```

## Regras Backend Específicas
1. SEMPRE `auth()` do Clerk como primeira operação
2. SEMPRE `schema.safeParse(body)` para validação
3. SEMPRE retornar `{ success: boolean, data?, error?: { code, message } }`
4. SEMPRE try/catch com console.error
5. SEMPRE rate limit em endpoints de IA (Upstash)
6. Verificar tier do user antes de chamar IA (FREE = 5 msgs/dia)
7. Model router em packages/ai seleciona modelo por tarefa
8. System prompts montados em packages/ai/prompts/assembler.ts
