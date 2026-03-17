# VibeCode — Contexto do Projeto

> Este ficheiro fornece aos agentes IA uma visão geral da arquitetura,
> objetivos de negócio e estado atual do projeto.

---

## 🎯 O QUE ESTAMOS A CONSTRUIR

**VibeCode** é um app mobile (iOS + Android) que ensina pessoas comuns a construir
apps reais usando inteligência artificial. É o "Duolingo da programação com IA".

O aluno conversa com um mentor IA chamado **Vi**, completa missões gamificadas,
e constrói projetos reais que vão para o seu portfolio.

### Proposta de Valor
- Para **quem nunca programou**: aprende do zero com IA como assistente
- Para **quem já sabe um pouco**: acelera 10x com técnicas de vibe coding
- Para **quem quer criar um produto**: sai com um SaaS funcional no portfolio

---

## 🏗️ ARQUITETURA

### Monorepo (Turborepo + pnpm)
```
vibecode/
├── apps/mobile/        → App principal (Expo/React Native)
├── apps/web/           → API backend (Next.js 14)
├── packages/db/        → Database (Prisma + PostgreSQL)
├── packages/shared/    → Tipos, schemas, constantes (reusado por todos)
└── packages/ai/        → IA: prompts do Vi, model router
```

### Fluxo de Dados
```
📱 Mobile App
    ↕ HTTPS (JSON)
🖥️ Next.js API (apps/web)
    ↕ Prisma ORM
🗄️ PostgreSQL (Neon)
    
🖥️ Next.js API
    ↕ API calls
🤖 AI Providers (Claude/GPT/Groq)
```

### Autenticação
```
📱 App → Clerk SDK → Clerk Cloud → JWT
🖥️ API → Clerk Middleware → verifica JWT → permite/bloqueia
📨 Clerk Webhook → user.created → cria User no PostgreSQL
```

### Sistema de IA (Vi)
```
📱 App envia: { content: "pergunta", mode: "teacher" }
    ↓
🖥️ Servidor:
    1. Autentica user
    2. Busca dados do user (nível, nome, idioma)
    3. Busca memórias do Vi sobre este user
    4. Monta system prompt (6 camadas)
    5. Classifica tipo de tarefa
    6. Seleciona modelo de IA ideal
    7. Chama provider (Anthropic/OpenAI/Groq)
    8. Salva conversa no banco
    9. Retorna apenas a resposta
    ↓
📱 App recebe: { content: "resposta do Vi", model: "claude-sonnet" }
```

---

## 📊 ESTADO ATUAL DO PROJETO

### Fase: PRÉ-MVP (Setup)
- [x] Documentação completa (41 ficheiros .md)
- [x] Configuração Antigravity
- [ ] Setup monorepo (Turborepo + pnpm)
- [ ] Prisma schema + migrations
- [ ] Auth (Clerk)
- [ ] Navegação (Expo Router)
- [ ] Componentes UI base
- [ ] Home screen com mapa
- [ ] Mission Player
- [ ] Vi Chat
- [ ] Gamificação
- [ ] Perfil
- [ ] Deploy

### Próxima Tarefa
Setup do monorepo: criar a estrutura de pastas, instalar dependências,
configurar Turborepo, Prisma, Clerk, e verificar que tudo compila.

---

## 🎮 FUNCIONALIDADES CORE (MVP)

| # | Feature | Prioridade | Estado |
|---|---------|-----------|--------|
| 1 | Auth (Clerk) | P0 | ⬜ |
| 2 | Onboarding + DNA Test | P0 | ⬜ |
| 3 | Mapa de Ilhas | P0 | ⬜ |
| 4 | Missões interativas (30) | P0 | ⬜ |
| 5 | Vi Chat (8 modos) | P0 | ⬜ |
| 6 | XP + Níveis + Streaks | P0 | ⬜ |
| 7 | Perfil + Badges | P1 | ⬜ |
| 8 | Sandbox de código | P1 | ⬜ |
| 9 | Push notifications | P2 | ⬜ |

---

## 💰 MODELO DE NEGÓCIO

| Tier | Preço | Inclui |
|------|-------|--------|
| Free | $0 | Ilha Básica (30 missões), Vi 5 msgs/dia |
| Pro | $14.99/mês | Tudo ilimitado |
| Team | $29.99/pessoa/mês | + Dashboard admin |
| Lifetime | $299 | Acesso perpétuo |

---

## 🧭 PRINCÍPIOS DE DESENVOLVIMENTO

1. **Mobile-first**: O app mobile é o produto principal
2. **Vertical slices**: Cada feature = UI + API + DB funcional de uma vez
3. **Type-safe**: TypeScript strict em todo lugar, Zod em toda validação
4. **Offline-capable**: Missões disponíveis offline via MMKV
5. **Performance**: FlatList, memo, lazy loading — 60fps constante
6. **Security**: Prompts no servidor, keys no .env, auth em todo endpoint
7. **Iteration**: Começar simples, iterar rápido, nunca over-engineer

---

## 📁 ONDE ENCONTRAR O QUÊ

| Preciso de... | Vou a... |
|--------------|----------|
| Entender o projeto | `CONTEXT.md` (este ficheiro) |
| Regras de código | `.antigravity/rules.md` |
| Especificação detalhada | `vibecode-docs/` (41 ficheiros) |
| Schema do banco | `packages/db/prisma/schema.prisma` |
| Tipos compartilhados | `packages/shared/types/` |
| Schemas de validação | `packages/shared/schemas/` |
| Constantes (cores, níveis) | `packages/shared/constants/` |
| Prompts do Vi | `packages/ai/prompts/` |
| API Routes | `apps/web/app/api/` |
| Telas do app | `apps/mobile/app/` |
| Componentes | `apps/mobile/components/` |
| Hooks | `apps/mobile/hooks/` |
