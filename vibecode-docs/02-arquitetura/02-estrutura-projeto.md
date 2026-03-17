# VibeCode — Estrutura do Projeto

## Árvore de Pastas Completa

```
vibecode/
│
├── package.json              ← Root monorepo config
├── pnpm-workspace.yaml       ← Workspace definitions
├── turbo.json                ← Turborepo task config
├── .gitignore
├── .env.example
├── README.md
│
├── apps/
│   │
│   ├── mobile/               ← EXPO APP (React Native)
│   │   ├── app.json          ← Expo config
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── babel.config.js
│   │   ├── metro.config.js
│   │   │
│   │   ├── app/              ← Expo Router (file-based)
│   │   │   ├── _layout.tsx           ← Root layout (providers)
│   │   │   ├── index.tsx             ← Entry redirect
│   │   │   │
│   │   │   ├── (auth)/
│   │   │   │   ├── _layout.tsx
│   │   │   │   ├── sign-in.tsx
│   │   │   │   └── sign-up.tsx
│   │   │   │
│   │   │   ├── (onboarding)/
│   │   │   │   ├── _layout.tsx
│   │   │   │   ├── welcome.tsx       ← 3 telas swipáveis
│   │   │   │   ├── dna-test.tsx      ← Quiz 10 perguntas
│   │   │   │   └── dna-result.tsx    ← Resultado do DNA
│   │   │   │
│   │   │   ├── (tabs)/
│   │   │   │   ├── _layout.tsx       ← Tab navigator (5 tabs)
│   │   │   │   ├── home.tsx          ← Mapa de ilhas
│   │   │   │   ├── trail.tsx         ← Lista de missões
│   │   │   │   ├── vi.tsx            ← Chat com Vi
│   │   │   │   ├── social.tsx        ← Feed social
│   │   │   │   └── profile.tsx       ← Perfil + settings
│   │   │   │
│   │   │   ├── mission/
│   │   │   │   └── [missionId].tsx   ← Mission player
│   │   │   │
│   │   │   ├── island/
│   │   │   │   └── [islandId].tsx    ← Detalhe da ilha
│   │   │   │
│   │   │   ├── project/
│   │   │   │   └── [projectId].tsx   ← Project builder
│   │   │   │
│   │   │   └── challenge/
│   │   │       └── daily.tsx         ← Daily challenge
│   │   │
│   │   ├── components/
│   │   │   ├── ui/                   ← Componentes base
│   │   │   │   ├── button.tsx
│   │   │   │   ├── card.tsx
│   │   │   │   ├── text.tsx
│   │   │   │   ├── input.tsx
│   │   │   │   ├── chip.tsx
│   │   │   │   ├── progress-bar.tsx
│   │   │   │   ├── avatar.tsx
│   │   │   │   ├── badge-icon.tsx
│   │   │   │   └── divider.tsx
│   │   │   │
│   │   │   ├── mission/              ← Componentes de missão
│   │   │   │   ├── phase-story.tsx
│   │   │   │   ├── phase-concept.tsx
│   │   │   │   ├── phase-interaction.tsx
│   │   │   │   ├── phase-sandbox.tsx
│   │   │   │   ├── phase-quiz.tsx
│   │   │   │   ├── mission-complete.tsx
│   │   │   │   └── daily-challenge-card.tsx
│   │   │   │
│   │   │   ├── exercises/            ← Exercícios interativos
│   │   │   │   ├── drag-drop.tsx
│   │   │   │   ├── quiz-multiple-choice.tsx
│   │   │   │   ├── true-false.tsx
│   │   │   │   ├── fill-blank.tsx
│   │   │   │   └── code-interactive.tsx
│   │   │   │
│   │   │   ├── vi/                   ← Componentes do Vi
│   │   │   │   ├── vi-chat-bubble.tsx
│   │   │   │   ├── vi-mode-selector.tsx
│   │   │   │   ├── vi-typing-indicator.tsx
│   │   │   │   └── vi-suggestion-chips.tsx
│   │   │   │
│   │   │   ├── gamification/         ← Componentes de gamificação
│   │   │   │   ├── island-map.tsx
│   │   │   │   ├── xp-bar.tsx
│   │   │   │   ├── streak-badge.tsx
│   │   │   │   ├── level-up-modal.tsx
│   │   │   │   └── achievement-modal.tsx
│   │   │   │
│   │   │   └── social/               ← Componentes sociais
│   │   │       ├── post-card.tsx
│   │   │       ├── ranking-item.tsx
│   │   │       └── podium.tsx
│   │   │
│   │   ├── hooks/                    ← Custom hooks
│   │   │   ├── use-user.ts
│   │   │   ├── use-streak.ts
│   │   │   ├── use-missions.ts
│   │   │   ├── use-achievements.ts
│   │   │   └── use-api-setup.ts
│   │   │
│   │   ├── stores/                   ← Zustand stores
│   │   │   ├── user-store.ts
│   │   │   └── mission-store.ts
│   │   │
│   │   ├── services/                 ← API client
│   │   │   └── api.ts
│   │   │
│   │   ├── lib/                      ← Utilities
│   │   │   └── clerk-token-cache.ts
│   │   │
│   │   ├── constants/                ← Mobile-specific constants
│   │   │   └── animations.ts
│   │   │
│   │   └── assets/                   ← Imagens, Lottie, fontes
│   │       ├── images/
│   │       ├── lottie/
│   │       └── fonts/
│   │
│   └── web/                  ← NEXT.JS APP (API + Web)
│       ├── package.json
│       ├── tsconfig.json
│       ├── next.config.ts
│       ├── tailwind.config.ts
│       │
│       ├── app/
│       │   ├── layout.tsx
│       │   ├── page.tsx              ← Landing page (futuro)
│       │   │
│       │   └── api/
│       │       ├── auth/
│       │       │   └── [...clerk]/route.ts
│       │       │
│       │       ├── users/
│       │       │   ├── me/route.ts           ← GET/PUT perfil
│       │       │   └── dna/route.ts          ← POST DNA profile
│       │       │
│       │       ├── missions/
│       │       │   ├── route.ts              ← GET lista de missões
│       │       │   └── [missionId]/
│       │       │       ├── route.ts          ← GET missão específica
│       │       │       └── complete/route.ts ← POST completar missão
│       │       │
│       │       ├── vi/
│       │       │   └── chat/route.ts         ← POST chat com Vi
│       │       │
│       │       ├── gamification/
│       │       │   ├── xp/route.ts           ← POST adicionar XP
│       │       │   ├── streak/route.ts       ← GET streak info
│       │       │   └── achievements/route.ts ← GET conquistas
│       │       │
│       │       ├── social/
│       │       │   ├── feed/route.ts         ← GET feed
│       │       │   ├── posts/route.ts        ← POST criar post
│       │       │   └── ranking/route.ts      ← GET ranking
│       │       │
│       │       └── webhooks/
│       │           ├── clerk/route.ts        ← Webhook do Clerk
│       │           └── stripe/route.ts       ← Webhook do Stripe
│       │
│       └── lib/
│           ├── rate-limit.ts
│           └── stripe.ts
│
├── packages/
│   │
│   ├── db/                   ← PRISMA + DATABASE
│   │   ├── package.json
│   │   ├── index.ts                  ← Export do PrismaClient
│   │   └── prisma/
│   │       ├── schema.prisma         ← Schema completo
│   │       ├── seed.ts               ← Dados iniciais
│   │       └── migrations/
│   │
│   ├── shared/               ← TYPES + SCHEMAS + CONSTANTS
│   │   ├── package.json
│   │   ├── index.ts
│   │   ├── types/
│   │   │   └── index.ts
│   │   ├── schemas/
│   │   │   └── index.ts
│   │   ├── constants/
│   │   │   └── index.ts
│   │   └── content/
│   │       └── missions/             ← JSON das missões
│   │           ├── m01.json
│   │           ├── m02.json
│   │           └── ...
│   │
│   └── ai/                   ← AI / Vi SERVICE
│       ├── package.json
│       ├── index.ts
│       ├── prompts/
│       │   ├── base.ts               ← Personalidade Vi
│       │   ├── level-adapter.ts      ← 6 níveis
│       │   ├── modes.ts              ← 8 modos
│       │   ├── context.ts            ← Contextos
│       │   ├── memory.ts             ← Memórias
│       │   ├── language.ts           ← 4 idiomas
│       │   ├── safety.ts             ← Guardrails
│       │   ├── voice.ts              ← Modo voz
│       │   ├── coop.ts              ← Modo co-op
│       │   ├── scan.ts              ← Modo scanner
│       │   ├── assembler.ts          ← Montagem final
│       │   └── specialized/
│       │       ├── dna-analysis.ts
│       │       ├── exercise-generator.ts
│       │       ├── auto-review.ts
│       │       └── news-summary.ts
│       │
│       └── providers/
│           └── router.ts             ← Model router
│
└── tooling/
    ├── eslint/
    │   └── base.js
    ├── typescript/
    │   └── base.json
    └── prettier/
        └── index.js
```
