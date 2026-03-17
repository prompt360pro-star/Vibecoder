# VibeCode — Regras do Projeto (Antigravity)

> Este ficheiro define as leis e regras de codificação que TODOS os agentes
> IA devem seguir ao trabalhar neste projeto. NUNCA ignore estas regras.

---

## 🎯 IDENTIDADE DO PROJETO

**Nome:** VibeCode
**Descrição:** App mobile que ensina vibe coding (programar com IA) do zero ao avançado
**Conceito:** "O Duolingo da programação com IA"
**Tagline:** "Code the future. Ride the vibe."

---

## 📚 DOCUMENTAÇÃO DE REFERÊNCIA

Toda a documentação detalhada do projeto está em:
```
C:\Users\Administrator\Documents\vibecoder\vibecode-docs\
```

**ANTES de implementar qualquer feature, o agente DEVE consultar os ficheiros relevantes:**

| Precisa de... | Consultar... |
|---------------|-------------|
| Visão geral do projeto | `vibecode-docs/MASTER-BRIEF.md` |
| Lista de features | `vibecode-docs/01-visao/02-features-lista.md` |
| Cores, fontes, visual | `vibecode-docs/01-visao/03-identidade-visual.md` |
| Gamificação (XP, níveis) | `vibecode-docs/01-visao/04-gamificacao.md` |
| Stack tecnológica | `vibecode-docs/02-arquitetura/01-stack-tecnologica.md` |
| Estrutura de pastas | `vibecode-docs/02-arquitetura/02-estrutura-projeto.md` |
| Schema do banco | `vibecode-docs/02-arquitetura/03-schema-banco.md` |
| Tipos TypeScript | `vibecode-docs/02-arquitetura/04-tipos-compartilhados.md` |
| Constantes (levels, etc) | `vibecode-docs/02-arquitetura/05-constantes.md` |
| Design tokens | `vibecode-docs/03-design/01-design-tokens.md` |
| Componentes UI | `vibecode-docs/03-design/02-componentes-base.md` |
| Wireframe de telas | `vibecode-docs/03-design/03-*.md` até `10-*.md` |
| Prompts do Vi | `vibecode-docs/04-prompts-vi/01-*.md` até `07-*.md` |
| Conteúdo das missões | `vibecode-docs/05-conteudo/01-*.md` até `10-*.md` |
| Especificação de APIs | `vibecode-docs/06-api/01-*.md` até `05-*.md` |
| PRD por fase | `vibecode-docs/07-prd/01-*.md` até `04-*.md` |

---

## 🔧 STACK TECNOLÓGICA OBRIGATÓRIA

### Mobile
| Tecnologia | Uso |
|------------|-----|
| Expo SDK 51+ | Framework React Native |
| Expo Router 3.5+ | File-based routing |
| TypeScript 5.4+ | Type safety |
| Zustand 4.5+ | Estado global |
| @tanstack/react-query 5+ | Estado do servidor |
| react-native-mmkv | Persistência local |
| expo-haptics | Feedback tátil |
| expo-image | Imagens otimizadas |
| expo-linear-gradient | Gradientes |
| lottie-react-native | Animações |
| react-native-reanimated 3+ | Animações de performance |
| @clerk/clerk-expo | Autenticação |

### Backend
| Tecnologia | Uso |
|------------|-----|
| Next.js 14+ | API Routes (App Router) |
| Prisma 5+ | ORM |
| Zod 3.23+ | Validação |
| @clerk/nextjs | Auth middleware |
| @upstash/redis | Cache + rate limiting |
| Stripe | Pagamentos |
| Resend | Emails |

### IA
| Provider | Modelo | Quando usar |
|----------|--------|-------------|
| Anthropic | Claude Sonnet 4 | Raciocínio complexo, code review |
| Anthropic | Claude Haiku 3.5 | Summarização, quiz |
| OpenAI | GPT-4o | Code generation |
| OpenAI | GPT-4o-mini | Tarefas simples de código |
| Groq | Llama 3.1 70B | Perguntas simples, respostas rápidas |

### Infra
| Tecnologia | Uso |
|------------|-----|
| PostgreSQL (Neon) | Banco de dados |
| Redis (Upstash) | Cache |
| Vercel | Deploy API |
| EAS Build | Build mobile |
| Cloudflare R2 | Storage |
| Sentry | Error tracking |
| PostHog | Analytics |

---

## 📁 ESTRUTURA DO MONOREPO

```
vibecode/
├── apps/
│   ├── mobile/          ← Expo (React Native) — app principal
│   │   ├── app/         ← Expo Router (file-based routing)
│   │   ├── components/  ← UI, mission, exercises, vi, gamification, social
│   │   ├── hooks/       ← Custom hooks (use-user, use-streak, etc.)
│   │   ├── stores/      ← Zustand stores
│   │   ├── services/    ← API client
│   │   ├── lib/         ← Utilitários
│   │   └── assets/      ← Imagens, Lottie, fontes
│   │
│   └── web/             ← Next.js — API + futuro web app
│       ├── app/api/     ← API Routes
│       └── lib/         ← Utilitários servidor
│
├── packages/
│   ├── db/              ← Prisma schema + client + seed
│   ├── shared/          ← Types, Zod schemas, constants (reusado por todos)
│   └── ai/              ← Prompts do Vi, model router, providers
│
└── tooling/             ← ESLint, TypeScript, Prettier configs
```

---

## ✅ CONVENÇÕES DE CÓDIGO — OBRIGATÓRIAS

### TypeScript
- `strict: true` SEMPRE
- Functional components com arrow functions
- Named exports — NUNCA default exports (exceto pages Expo Router/Next.js)
- Nomes de variáveis e funções em **INGLÊS**
- Comentários em **PORTUGUÊS**
- `const` > `let` — NUNCA `var`
- `async/await` > `.then()`
- Tipo explícito quando TypeScript não consegue inferir
- NUNCA usar `any` — usar `unknown` se necessário
- Ficheiros com máximo 300 linhas — dividir se maior

### Nomeação
- Ficheiros: `kebab-case.tsx` (ex: `island-map.tsx`)
- Componentes: `PascalCase` (ex: `IslandMap`)
- Hooks: `camelCase` com prefixo `use` (ex: `useUser`)
- Stores: `camelCase` com sufixo `Store` (ex: `userStore`)
- Constants: `UPPER_SNAKE_CASE` (ex: `COLORS`, `LEVELS`)
- Tipos/Interfaces: `PascalCase` (ex: `UserProfile`)
- Enums: `PascalCase` (ex: `MissionStatus`)

### React Native / Expo
- `StyleSheet.create` no FINAL do ficheiro — NUNCA inline styles (exceto dinâmicos)
- Cores SEMPRE de `@vibecode/shared` constant `COLORS` — NUNCA hardcodar
- `expo-haptics` (ImpactFeedbackStyle.Light) em TODOS os botões/pressables
- `FlatList` para listas — NUNCA `ScrollView` para listas longas
- `Image` de `expo-image` — NUNCA de `react-native`
- Navegação via `expo-router` — NUNCA `react-navigation` direto
- `SafeAreaView` quando o conteúdo pode ir atrás da status bar
- `KeyboardAvoidingView` em TODAS as telas com input de texto
- `Platform.OS` para código específico iOS/Android

### Componentes
- 1 componente por ficheiro
- Props tipadas com `interface` (não `type`)
- Desestruturação de props no parâmetro da função
- Styles no final do ficheiro via `StyleSheet.create`

### API Routes (Next.js)
- SEMPRE autenticar: `const { userId } = await auth()`
- SEMPRE validar body: `schema.safeParse(body)`
- SEMPRE retornar formato padrão:
  ```json
  { "success": true, "data": {...} }
  { "success": false, "error": { "code": "UNAUTHORIZED", "message": "..." } }
  ```
- SEMPRE `try/catch` com `console.error('[ENDPOINT]', error)`
- SEMPRE rate limit em endpoints que chamam IA
- Status codes: 200, 201, 400, 401, 403, 404, 429, 500

### Prisma
- Usar singleton `db` de `@vibecode/db`
- Tabelas mapeadas em `snake_case` via `@@map("nome_tabela")`
- Campos em `camelCase`
- Relações com `onDelete` explícito
- Indexes em campos de busca frequente

### Git
- Conventional commits em inglês: `feat:`, `fix:`, `refactor:`, `docs:`, `chore:`
- Branch por feature: `feat/nome-da-feature`
- Commit a cada feature funcional

---

## 🎨 DESIGN VISUAL — OBRIGATÓRIO

### Cores (Dark Mode — Padrão)
```
BACKGROUNDS:
  bg-primary:     #0A0A0F
  bg-secondary:   #111118
  bg-card:        #1A1A2E
  bg-elevated:    #1E1E3A
  bg-code:        #0A0A0F

TEXTOS:
  text-primary:   #FFFFFF
  text-secondary: #CCCCCC
  text-tertiary:  #888888
  text-muted:     #666666

BORDAS:
  border-default: #333333
  border-subtle:  #222222
  border-focus:   #8B5CF6

ACENTOS:
  accent-purple:  #8B5CF6  (primário — botões, links, destaque)
  accent-blue:    #3B82F6  (secundário)
  accent-cyan:    #06B6D4
  accent-green:   #22C55E  (sucesso)
  accent-yellow:  #F59E0B  (streak, warning)
  accent-red:     #EF4444  (erro, perigo)
  accent-gold:    #FFD700  (premium, boss fight)

GRADIENTES:
  primary:  #8B5CF6 → #3B82F6  (botões CTA)
  gold:     #FFD700 → #F97316  (boss fight, certificados)
```

### Tipografia
- **UI:** Inter (400, 500, 600, 700)
- **Código:** JetBrains Mono (400)
- **Escala:** 12, 14, 16, 18, 20, 24, 28, 36px

### Dimensões
- Status bar: 44px
- Nav bar: 56px
- Tab bar: 83px (inclui safe area 34px)
- Buttons: sm(36px), md(44px), lg(52px), xl(56px)
- Input: 48px height
- Border radius: sm(8), md(12), lg(16), xl(20), full(9999)

---

## 🤖 PROMPTS DO Vi — REGRAS DE SEGURANÇA

- System prompts vivem APENAS em `packages/ai/prompts/`
- O app mobile **NUNCA** vê o system prompt
- API keys **NUNCA** no app mobile — apenas no servidor (.env)
- O servidor monta o prompt, chama a IA, e devolve **apenas a resposta**
- Ver documentação completa em `vibecode-docs/04-prompts-vi/`

---

## 🚫 O QUE NUNCA FAZER

1. **NUNCA** usar Tailwind CSS no React Native
2. **NUNCA** usar default exports (exceto pages)
3. **NUNCA** hardcodar cores — usar COLORS de @vibecode/shared
4. **NUNCA** hardcodar strings de UI — preparar para i18n futuro
5. **NUNCA** colocar lógica de negócio nos componentes — usar hooks/services
6. **NUNCA** fazer fetch direto nos componentes — usar hooks React Query
7. **NUNCA** commitar .env ou API keys
8. **NUNCA** usar console.log em produção — usar Sentry
9. **NUNCA** ignorar erros TypeScript — resolver imediatamente
10. **NUNCA** criar ficheiros com mais de 300 linhas — dividir
11. **NUNCA** colocar prompts de IA no código do mobile
12. **NUNCA** usar `any` — usar `unknown` se necessário
13. **NUNCA** usar `require` — usar `import`
14. **NUNCA** usar `var` — usar `const` ou `let`

---

## 📋 PADRÃO DE COMPONENTE REACT NATIVE

```tsx
import { View, Text, StyleSheet, Pressable } from 'react-native'
import * as Haptics from 'expo-haptics'
import { COLORS } from '@vibecode/shared'

interface MeuComponenteProps {
  titulo: string
  onPress: () => void
  disabled?: boolean
}

export function MeuComponente({ titulo, onPress, disabled = false }: MeuComponenteProps) {
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    onPress()
  }

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled}
      style={[styles.container, disabled && styles.disabled]}
    >
      <Text style={styles.titulo}>{titulo}</Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.bgCard,
    borderRadius: 16,
    padding: 16,
  },
  disabled: {
    opacity: 0.5,
  },
  titulo: {
    color: COLORS.textPrimary,
    fontSize: 18,
    fontWeight: '700',
  },
})
```

---

## 📋 PADRÃO DE API ROUTE (NEXT.JS)

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@vibecode/db'
import { meuSchema } from '@vibecode/shared'

export async function POST(request: NextRequest) {
  // 1. Autenticação
  const { userId: clerkId } = await auth()
  if (!clerkId) {
    return NextResponse.json(
      { success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
      { status: 401 }
    )
  }

  // 2. Validação
  const body = await request.json()
  const parsed = meuSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: { code: 'VALIDATION', message: parsed.error.message } },
      { status: 400 }
    )
  }

  // 3. Buscar user
  const user = await db.user.findUnique({ where: { clerkId } })
  if (!user) {
    return NextResponse.json(
      { success: false, error: { code: 'NOT_FOUND', message: 'User not found' } },
      { status: 404 }
    )
  }

  try {
    // 4. Lógica de negócio
    const resultado = await minhaOperacao(parsed.data, user)

    // 5. Resposta
    return NextResponse.json({ success: true, data: resultado })
  } catch (error) {
    console.error('[MEU_ENDPOINT]', error)
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL', message: 'Internal server error' } },
      { status: 500 }
    )
  }
}
```

---

## 📋 PADRÃO DE HOOK (REACT QUERY)

```typescript
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@clerk/clerk-expo'
import { api } from '../services/api'
import type { MeuTipo } from '@vibecode/shared'

export function useMeusDados() {
  const { isSignedIn } = useAuth()

  const query = useQuery({
    queryKey: ['meus-dados'],
    queryFn: async () => {
      const { data } = await api.get<MeuTipo>('/meu-endpoint')
      return data
    },
    enabled: isSignedIn,
    staleTime: 1000 * 60 * 5, // 5 minutos
  })

  return {
    dados: query.data,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  }
}
```
