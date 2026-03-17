# VibeCode

> Code the future. Ride the vibe. 🚀

App mobile que ensina vibe coding (programar com IA) do zero ao avançado.

## Stack
- Mobile: Expo + React Native + Expo Router
- Backend: Next.js 14 + Prisma + PostgreSQL
- AI: Claude + GPT-4o + Groq
- Auth: Clerk

## Setup

```bash
# Instalar dependências
pnpm install

# Configurar ambiente
cp .env.example .env
# Preencher variáveis no .env

# Setup banco de dados
pnpm db:generate
pnpm db:push
pnpm db:seed

# Desenvolvimento
pnpm dev:web      # API em localhost:3000
pnpm dev:mobile   # Expo em localhost:8081
```

## Documentação
Documentação completa em `vibecode-docs/` (41 ficheiros).

## Estrutura
```
vibecode/
├── apps/mobile/     ← App Expo
├── apps/web/        ← API Next.js
├── packages/db/     ← Prisma
├── packages/shared/ ← Types + Schemas + Constants
└── packages/ai/     ← Prompts + Model Router
```
