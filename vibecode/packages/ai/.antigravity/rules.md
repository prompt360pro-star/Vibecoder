# Regras — Package AI (Prompts do Vi)

## Contexto
Este package contém todo o sistema de IA do VibeCode:
prompts do mentor Vi, model router, e providers.

## Documentação Completa
Consultar: `C:\Users\Administrator\Documents\vibecoder\vibecode-docs\04-prompts-vi\`
- 01-base-prompt.md → Personalidade do Vi
- 02-level-adapter.md → Adaptação por nível (6 faixas)
- 03-modes.md → 8 modos especializados
- 04-context.md → Contextos (missão, projeto, desafio, boss)
- 05-memory.md → Sistema de memória do aluno
- 06-safety.md → Guardrails de segurança
- 07-assembler.md → Montagem final do system prompt

## Estrutura
```
prompts/
├── base.ts           ← Personalidade, regras, analogias
├── level-adapter.ts  ← 6 faixas: básico → expert
├── modes.ts          ← 8 modos: teacher, builder, detective...
├── context.ts        ← Contexto de missão/projeto/desafio
├── memory.ts         ← Memórias persistentes do aluno
├── language.ts       ← Adaptação de idioma (PT/EN/ES/FR)
├── safety.ts         ← Guardrails e limites
├── assembler.ts      ← Monta o system prompt final
└── specialized/      ← DNA analysis, exercise gen, etc.

providers/
└── router.ts         ← Seleciona modelo ideal por tarefa
```

## Regras IA Específicas
1. System prompt NUNCA vai para o client mobile
2. Montagem em camadas: Base → Language → Level → Mode → Context → Memory → Safety
3. Model router: perguntas simples → Groq, code → GPT-4o, raciocínio → Claude
4. Target de custo: < $0.05 por conversa
5. Max 5 memórias incluídas por prompt
6. Safety layer SEMPRE incluída (última camada)
7. Guardar conversas no banco (vi_conversations)
8. Extrair memórias automaticamente após conversas
