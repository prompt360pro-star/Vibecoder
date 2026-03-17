# VIBECODE — Master Brief

## O que é
App mobile (React Native/Expo) que ensina vibe coding (programar com IA) do zero ao avançado, com gamificação inspirada no Duolingo e mentor IA personalizado chamado Vi.

Conceito: "Aprenda a construir apps com IA construindo apps com IA."

Termo cunhado por Andrej Karpathy (fev/2025): vibe coding = programar descrevendo intenção em linguagem natural e deixando a IA gerar o código.

## Stack Tecnológica
- **Mobile:** Expo SDK 51+ / React Native / Expo Router (file-based routing)
- **Backend/API:** Next.js 14 App Router (API Routes)
- **Database:** PostgreSQL (Neon — serverless) + Prisma ORM
- **Auth:** Clerk (mobile + web, webhook sync)
- **AI Providers:** Anthropic Claude · OpenAI GPT-4o · Groq Llama (via model router)
- **AI Framework:** Vercel AI SDK (streaming)
- **Cache:** Redis (Upstash)
- **State (mobile):** Zustand (global) + React Query (server state) + MMKV (persistência local)
- **UI (mobile):** Custom components + expo-linear-gradient + expo-haptics + Lottie
- **Monorepo:** Turborepo + pnpm workspaces
- **Deploy:** Vercel (API) + EAS Build/Submit (mobile) + Neon (DB)
- **Monitoring:** Sentry (errors) + PostHog (analytics)
- **Payments:** Stripe (subscriptions + webhooks)
- **Email:** Resend
- **Storage:** Cloudflare R2

## Estrutura do Monorepo
```
vibecode/
├── apps/
│   ├── mobile/        ← Expo (React Native) — o app principal
│   └── web/           ← Next.js — API + futuro web app companion
├── packages/
│   ├── db/            ← Prisma schema + client + seed
│   ├── shared/        ← Types, Zod schemas, constants (reusado por todos)
│   └── ai/            ← Prompts do Vi, model router, providers
└── tooling/           ← ESLint, TypeScript, Prettier configs
```

## Identidade Visual
- **Nome:** VibeCode
- **Tagline:** "Code the future. Ride the vibe."
- **Mascote:** Vi — robô-mentor que evolui visualmente com o aluno
- **Cores:** Dark mode padrão — Background #0A0A0F, Card #1A1A2E, Accent #8B5CF6
- **Tipografia:** Inter (UI) + JetBrains Mono (código)

## Funcionalidades Core (MVP)
1. Onboarding + DNA Test (quiz adaptativo)
2. Mapa de ilhas (4 níveis, navegação visual)
3. Missões interativas (30 na Ilha Básica)
4. Chat com Vi (mentor IA, 8 modos, multi-modelo)
5. Sandbox de código (Sandpack, client-side)
6. Sistema de XP, níveis (1-50+) e streaks
7. Conquistas / badges (45 total)
8. Perfil com progresso e stats
9. Auth (Clerk — email + Google + GitHub)
10. Push notifications

## Arquitetura de Prompts do Vi
Prompts vivem EXCLUSIVAMENTE no servidor (packages/ai/prompts/).
Montagem em camadas: Base → Language → Level → Mode → Context → Memory → Safety.
Model Router seleciona modelo ideal por tarefa (Groq/GPT/Claude).

## Database Models Principais
User, MissionProgress, ViConversation, ViMemory, UserAchievement, StreakDay, Project, SocialPost, PostLike, PostComment, SharedPrompt, SavedPrompt, CoopSession, Certificate, Notification, PushToken

## Modelo de Negócio
- **Free:** Ilha Básica (30 missões) + Vi 5 msgs/dia
- **Pro:** $14.99/mês ou $99/ano — Tudo ilimitado
- **Team:** $29.99/pessoa/mês — Dashboard + admin
- **Lifetime:** $299 — Acesso perpétuo + badge Founder
