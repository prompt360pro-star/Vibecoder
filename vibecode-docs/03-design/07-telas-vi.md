# VibeCode — Wireframes: Chat Vi

## Tela Principal do Vi
- Header: "🤖 Vi · Seu Mentor" + botão de modo
- Seletor de modo (chip com emoji + nome + chevron)
- Lista de mensagens (FlatList)
- Indicador "Vi está pensando..." (animado)
- Sugestões rápidas (chips horizontais): "Explica", "Dá um exemplo", "Me testa", "Próxima lição"
- Input: câmera + text input + send button
- Tab Bar

## Chat Bubbles
- Vi: bg card, rounded 16px, top-left 4px, label "🤖 Vi:", timestamp
- User: bg purple/20, rounded 16px, top-right 4px, timestamp
- Code block: bg code, font mono, rounded 12px, copy button

## Mode Selector (expandido)
- Grid 2x4 com 8 modos:
  1. 🎓 Professor — Explica conceitos
  2. 🔧 Construtor — Ajuda a criar código
  3. 🐛 Detetive — Debugar erros
  4. 📝 Revisor — Revisa código
  5. 💡 Criativo — Sugere ideias
  6. 🎯 Quiz — Testa conhecimento
  7. 🗣️ Conversa — Bate-papo livre
  8. 📸 Scanner — Lê imagens
- Card ativo: border purple, bg purple/15
- Toque seleciona e fecha

## States
- Empty: mensagem de boas-vindas do Vi
- Loading: bolhas animadas
- Error: mensagem de erro com retry
- Rate limited: aviso + CTA upgrade
