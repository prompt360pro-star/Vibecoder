// VibeCode — Package AI
// Re-exporta model router, prompts e providers

// Router & model selection
export {
  classifyTask,
  getModelForTask,
  routeMessage,
  selectModel,
  MODEL_CONFIGS,
  TASK_MODEL_MAP,
} from './providers/router'

// Prompt system
export { VI_BASE_PROMPT, VI_MODES, VI_LEVEL_ADAPTERS } from './prompts/base'
export { getLevelAdapter } from './prompts/level-adapter'
export { getModePrompt } from './prompts/modes'
export { getLanguageAdapter } from './prompts/language'
export { SAFETY_LAYER } from './prompts/safety'
export { assembleViPrompt, estimatePromptTokens } from './prompts/assembler'
export type { AssembleViPromptParams } from './prompts/assembler'
