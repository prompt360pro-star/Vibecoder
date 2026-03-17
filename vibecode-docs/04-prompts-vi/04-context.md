# Vi — Context Layer

## Localização: packages/ai/prompts/context.ts

## 4 Tipos de Contexto (apenas 1 ativo por vez)

### Missão Ativa
Inclui: título, zona, ilha, fase atual, objetivo, conceitos, fases completas/restantes.
Instrução: manter foco no tema, dicas progressivas (conceitual → pseudo-código → parcial → completa).

### Projeto em Andamento
Inclui: título, stack, etapa atual, etapas completas/restantes, file tree.
Instrução: código que integra com existente, mesma stack, mostrar ONDE colocar.

### Desafio Diário
Inclui: título, dificuldade, tempo limite/restante, requisitos.
Instrução: CONCISO e DIRETO (contra relógio), código funcional não perfeito.

### Boss Fight
Inclui: título, nível, etapa, HP do boss.
Instrução: mais desafiador, técnica socrática, dicas custam pontos, celebrar cada etapa.
