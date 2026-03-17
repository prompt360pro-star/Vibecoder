# Vi — Sistema de Memória

## Localização: packages/ai/prompts/memory.ts

## Tipos de Memória
- FACT: informação factual ("trabalha com design", "usa Mac")
- PREFERENCE: preferência ("gosta de analogias de cozinha", "prefere React")
- STRUGGLE: dificuldade ("travou em async/await", "confunde props com state")
- PROJECT: projeto ("construindo SaaS de fitness")
- GOAL: objetivo ("quer mudar de carreira para tech")

## Armazenamento
- Tabela vi_memories no banco
- Campos: userId, type, content, confidence (0-1), timestamps
- Max 5 memórias incluídas por prompt (mais relevantes)

## Extração
- Após cada conversa, AI analisa e extrai memórias automaticamente
- Prompt de extração retorna JSON com type, content, confidence
- Confidence < 0.5 = não salvar
- Max 5 memórias por conversa

## Uso no Prompt
- Agrupadas por tipo no system prompt
- Instruções: referenciar quando relevante, paciência extra em struggles, conectar com projetos anteriores

## Privacidade
- Usuário pode ver/editar/deletar memórias
- Deletadas permanentemente ao remover conta
- Nunca compartilhadas entre usuários
