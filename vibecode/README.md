# VibeCode

Duolingo da programação com IA. Ensina pessoas a construir apps reais usando inteligência artificial.

## Stack
- Mobile: React Native / Expo SDK 52
- Backend: Next.js 14 App Router (Vercel)
- Database: PostgreSQL (Neon) via Prisma
- Auth: Clerk
- AI: Anthropic Claude / OpenAI / Groq
- Cache/Rate Limit: Upstash Redis

## Deploy Rápido

### Backend (Vercel)
1. Fork o repositório
2. Cria novo projecto na Vercel apontando para apps/web
3. Configura as env vars do apps/web/.env.example
4. Deploy automático em cada push para main

### Base de dados
```bash
cd packages/db
cp .env.example .env  # preenche DATABASE_URL
npx prisma migrate deploy
npx prisma db seed
```

### App Mobile (Expo Go)
```bash
cd apps/mobile
cp .env.example .env  # preenche EXPO_PUBLIC_API_URL e CLERK key
pnpm install
npx expo start
```
Abre o QR code com a app Expo Go no telemóvel.

## Desenvolvimento Local
```bash
pnpm install
pnpm dev          # inicia web + mobile em paralelo via Turborepo
```
