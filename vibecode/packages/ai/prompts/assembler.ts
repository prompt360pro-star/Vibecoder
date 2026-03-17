// VibeCode — Prompt Assembler
// Monta o system prompt completo do Vi em 10 camadas ordenadas

import type { ViMode } from '@vibecode/shared'
import { VI_BASE_PROMPT } from './base'
import { getLevelAdapter } from './level-adapter'
import { getModePrompt } from './modes'
import { getLanguageAdapter } from './language'
import { SAFETY_LAYER } from './safety'

export interface AssembleViPromptParams {
  mode: ViMode
  userLevel: number
  userName: string
  locale?: string
  missionContext?: string
  projectContext?: string
  challengeContext?: string
  bossFightContext?: string
  memories?: string[]
  customInstructions?: string
  maxResponseLength?: 'short' | 'medium' | 'long'
}

export function assembleViPrompt(params: AssembleViPromptParams): string {
  const {
    mode,
    userLevel,
    userName,
    locale = 'pt',
    missionContext,
    projectContext,
    challengeContext,
    bossFightContext,
    memories,
    customInstructions,
    maxResponseLength = 'medium',
  } = params

  const layers: string[] = []

  // ── 1. BASE PROMPT (personalidade — sempre)
  layers.push(VI_BASE_PROMPT)

  // ── 2. LANGUAGE ADAPTER (idioma)
  layers.push(getLanguageAdapter(locale))

  // ── 3. USER INFO (contexto do aluno)
  layers.push(`
## CONTEXTO DO ALUNO

- **Nome**: ${userName}
- **Nível actual**: ${userLevel}
- **Idioma configurado**: ${locale}

Usa o nome do aluno ocasionalmente para personalizar a conversa — não em todas as respostas, mas quando for natural.
`.trim())

  // ── 4. LEVEL ADAPTER (adaptação por nível)
  layers.push(getLevelAdapter(userLevel))

  // ── 5. MODE PROMPT (instruções do modo activo)
  layers.push(getModePrompt(mode))

  // ── 6. CONTEXT LAYER (missão / projecto / desafio / boss — apenas 1)
  const context = missionContext ?? projectContext ?? challengeContext ?? bossFightContext
  if (context) {
    layers.push(`
## CONTEXTO ACTIVO

${context}

Responde tendo em conta o progresso do aluno neste contexto. As tuas respostas devem ser relevantes para o que está a aprender/construir agora.
`.trim())
  }

  // ── 7. MEMORY LAYER (memórias do aluno)
  if (memories && memories.length > 0) {
    layers.push(`
## O QUE SABES SOBRE ESTE ALUNO

${memories.map((m, i) => `${i + 1}. ${m}`).join('\n')}

Usa estas informações para personalizar as tuas respostas, mas não as cites explicitamente a menos que seja relevante.
`.trim())
  }

  // ── 8. RESPONSE LENGTH (instruções de tamanho)
  layers.push(getResponseLengthInstruction(maxResponseLength))

  // ── 9. CUSTOM INSTRUCTIONS (se houver)
  if (customInstructions) {
    layers.push(`
## INSTRUÇÕES ADICIONAIS

${customInstructions}
`.trim())
  }

  // ── 10. SAFETY LAYER (guardrails — sempre último)
  layers.push(SAFETY_LAYER)

  const prompt = layers.join('\n\n---\n\n')
  return prompt
}

function getResponseLengthInstruction(length: 'short' | 'medium' | 'long'): string {
  switch (length) {
    case 'short':
      return `
## TAMANHO DA RESPOSTA: CURTA

Responde de forma concisa e directa:
- Máximo 3-4 parágrafos de texto
- Blocos de código: máximo 15 linhas
- Vai directo ao ponto — sem introduções longas
- Ideal para conversas rápidas ou confirmações
`.trim()

    case 'long':
      return `
## TAMANHO DA RESPOSTA: LONGA

Podes ser extenso e detalhado quando necessário:
- Até 12 parágrafos de texto explicativo
- Blocos de código: até 60 linhas
- Máximo absoluto: 1500 palavras
- Usa títulos (##) para estruturar respostas longas
- Ideal para tutoriais, revisões profundas, código complexo
`.trim()

    case 'medium':
    default:
      return `
## TAMANHO DA RESPOSTA: MÉDIA

Equilibra detalhe com concisão:
- 4-8 parágrafos de texto
- Blocos de código: até 30 linhas
- Explica as decisões importantes, omite o óbvio
- Ideal para a maioria das interacções de ensino
`.trim()
  }
}

// Estimativa de tokens (aprox. 4.2 caracteres por token)
export function estimatePromptTokens(prompt: string): number {
  return Math.round(prompt.length / 4.2)
}
