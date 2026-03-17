// VibeCode — Model Router
// Seleciona o modelo de IA ideal para cada tipo de tarefa
// Classifica a intenção do user e roteia para o provider certo

import type { TaskType, ModelConfig } from '@vibecode/shared'

// ═══════════════════════════════════════
// Configuração dos Modelos
// ═══════════════════════════════════════

const MODEL_CONFIGS: Record<string, ModelConfig> = {
  'claude-sonnet-4': {
    provider: 'anthropic',
    model: 'claude-sonnet-4-20250514',
    maxTokens: 8192,
    temperature: 0.7,
  },
  'claude-haiku-3.5': {
    provider: 'anthropic',
    model: 'claude-3-5-haiku-20241022',
    maxTokens: 4096,
    temperature: 0.6,
  },
  'gpt-4o': {
    provider: 'openai',
    model: 'gpt-4o',
    maxTokens: 4096,
    temperature: 0.7,
  },
  'gpt-4o-mini': {
    provider: 'openai',
    model: 'gpt-4o-mini',
    maxTokens: 4096,
    temperature: 0.7,
  },
  'llama-3.1-70b': {
    provider: 'groq',
    model: 'llama-3.1-70b-versatile',
    maxTokens: 4096,
    temperature: 0.7,
  },
}

// ═══════════════════════════════════════
// Mapeamento Tarefa → Modelo
// ═══════════════════════════════════════

const TASK_MODEL_MAP: Record<TaskType, string> = {
  'complex-reasoning': 'claude-sonnet-4',
  'code-review': 'claude-sonnet-4',
  'code-generation': 'gpt-4o',
  'simple-code': 'gpt-4o-mini',
  'summarization': 'claude-haiku-3.5',
  'quiz': 'claude-haiku-3.5',
  'simple-question': 'llama-3.1-70b',
  'fast-response': 'llama-3.1-70b',
}

// ═══════════════════════════════════════
// Classificador de Tarefas
// ═══════════════════════════════════════

// Keywords que indicam o tipo de tarefa
const TASK_KEYWORDS: Record<TaskType, string[]> = {
  'complex-reasoning': ['explica', 'porque', 'como funciona', 'arquitetura', 'design pattern', 'comparar', 'analisa'],
  'code-review': ['revê', 'review', 'melhorar', 'optimizar', 'refactor', 'bugs', 'problemas'],
  'code-generation': ['cria', 'escreve', 'gera', 'implementa', 'constrói', 'código para', 'function'],
  'simple-code': ['ajusta', 'muda', 'adiciona', 'remove', 'corrige', 'fix', 'update'],
  'summarization': ['resume', 'sumário', 'resumo', 'sintetiza', 'pontos-chave'],
  'quiz': ['quiz', 'pergunta', 'teste', 'exercício', 'avalia'],
  'simple-question': ['o que é', 'define', 'qual', 'quando usar', 'diferença entre'],
  'fast-response': ['sim ou não', 'rápido', 'confirma', 'ok', 'obrigado', 'entendi'],
}

export const classifyTask = (message: string): TaskType => {
  const lowerMessage = message.toLowerCase()

  // Verifica cada tipo de tarefa por ordem de prioridade
  const priorities: TaskType[] = [
    'code-review',
    'code-generation',
    'complex-reasoning',
    'quiz',
    'summarization',
    'simple-code',
    'simple-question',
    'fast-response',
  ]

  for (const taskType of priorities) {
    const keywords = TASK_KEYWORDS[taskType]
    if (keywords && keywords.some((kw) => lowerMessage.includes(kw))) {
      return taskType
    }
  }

  // Default: pergunta simples
  return 'simple-question'
}

// ═══════════════════════════════════════
// Router Principal
// ═══════════════════════════════════════

export const getModelForTask = (taskType: TaskType): ModelConfig => {
  const modelKey = TASK_MODEL_MAP[taskType]
  const config = MODEL_CONFIGS[modelKey]
  if (!config) {
    // Fallback para GPT-4o-mini
    return MODEL_CONFIGS['gpt-4o-mini']!
  }
  return config
}

export const routeMessage = (message: string): { taskType: TaskType; model: ModelConfig } => {
  const taskType = classifyTask(message)
  const model = getModelForTask(taskType)
  return { taskType, model }
}

// ═══════════════════════════════════════
// selectModel — Baseado em tier de subscrição
// ═══════════════════════════════════════

type SubscriptionTier = 'FREE' | 'PRO' | 'TEAM' | 'LIFETIME'

// Modelos mais baratos para FREE, melhores para PRO+
const FREE_TIER_OVERRIDES: Partial<Record<TaskType, string>> = {
  'complex-reasoning': 'claude-haiku-3.5',
  'code-review': 'gpt-4o-mini',
  'code-generation': 'gpt-4o-mini',
  'simple-code': 'llama-3.1-70b',
}

export const selectModel = (taskType: TaskType, tier: SubscriptionTier): ModelConfig => {
  if (tier === 'FREE') {
    const overrideKey = FREE_TIER_OVERRIDES[taskType]
    if (overrideKey && MODEL_CONFIGS[overrideKey]) {
      return MODEL_CONFIGS[overrideKey]!
    }
    // Default FREE: llama (mais rápido e barato)
    return MODEL_CONFIGS['llama-3.1-70b']!
  }
  // PRO, TEAM, LIFETIME: usa o modelo ideal para a tarefa
  return getModelForTask(taskType)
}

// Exporta configurações para uso externo
export { MODEL_CONFIGS, TASK_MODEL_MAP }
export type { TaskType, ModelConfig }

