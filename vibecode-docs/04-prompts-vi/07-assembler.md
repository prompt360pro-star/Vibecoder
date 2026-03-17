# Vi — Assembler (Montagem Final)

## Localização: packages/ai/prompts/assembler.ts

## Função Principal
assembleViPrompt(params) → string (system prompt completo)

## Parâmetros
- mode: ViMode (obrigatório)
- userLevel: number (obrigatório)
- userName: string (obrigatório)
- locale: string (obrigatório)
- missionContext?: dados da missão
- projectContext?: dados do projeto
- challengeContext?: dados do desafio
- bossFightContext?: dados do boss fight
- memories?: UserMemory[]
- customInstructions?: string
- maxResponseLength?: short | medium | long

## Ordem de Montagem
1. BASE PROMPT (personalidade — sempre)
2. LANGUAGE ADAPTER (idioma)
3. USER INFO (nome, nível, idioma)
4. LEVEL ADAPTER (adaptação por nível)
5. MODE PROMPT (instruções do modo)
6. CONTEXT LAYER (missão/projeto/desafio/boss — apenas 1)
7. MEMORY LAYER (memórias do aluno)
8. RESPONSE LENGTH (curto/médio/longo)
9. CUSTOM INSTRUCTIONS (se houver)
10. SAFETY LAYER (guardrails — sempre último)

## Estimativa de Tokens
~4-5K tokens total do system prompt montado
Função: estimatePromptTokens(prompt) → ~prompt.length / 4.2

## Avisos
- > 4K tokens: "Consider reducing context"
- > 8K tokens: "Will be expensive"

## Resposta por Tamanho
- Short: max 3-4 parágrafos, 15 linhas código
- Medium: 4-8 parágrafos, 30 linhas código
- Long: até 12 parágrafos, 60 linhas código, max 1500 palavras
