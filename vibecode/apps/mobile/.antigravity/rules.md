# Regras — App Mobile (Expo/React Native)

## Contexto
Este é o app mobile principal do VibeCode, construído com Expo e React Native.

## Wireframes de Referência
Consultar: `C:\Users\Administrator\Documents\vibecoder\vibecode-docs\03-design\`
- 03-telas-auth.md → Telas de login/signup
- 04-telas-onboarding.md → Onboarding + DNA Test
- 05-telas-home.md → Home + Mapa de Ilhas
- 06-telas-missao.md → Mission Player
- 07-telas-vi.md → Chat com Vi
- 08-telas-social.md → Feed social
- 09-telas-perfil.md → Perfil + Settings
- 10-telas-extras.md → Challenge, Scan, Boss Fight, Portfolio, etc.

## Estrutura de Pastas
```
app/              ← Expo Router (file-based routing)
components/
├── ui/           ← Button, Card, Input, Chip, ProgressBar, Avatar, Badge
├── mission/      ← PhaseStory, PhaseConcept, PhaseQuiz, MissionComplete
├── exercises/    ← DragDrop, QuizMultiple, TrueFalse, FillBlank, CodeInteractive
├── vi/           ← ChatBubble, ModeSelector, TypingIndicator, SuggestionChips
├── gamification/ ← IslandMap, XpBar, StreakBadge, LevelUpModal, AchievementModal
└── social/       ← PostCard, RankingItem, Podium
hooks/            ← useUser, useStreak, useMissions, useAchievements
stores/           ← userStore (Zustand), missionStore
services/         ← api.ts (HTTP client com auth)
```

## Regras Mobile Específicas
1. StyleSheet.create no FINAL do ficheiro
2. Cores SEMPRE de `COLORS` importado de `@vibecode/shared`
3. `expo-haptics` em TODOS os Pressable
4. `FlatList` para listas (NUNCA ScrollView para listas)
5. `Image` de `expo-image` (NUNCA de react-native)
6. `KeyboardAvoidingView` em telas com input
7. Estado global via Zustand (stores/)
8. Estado do servidor via React Query (hooks/)
9. API calls via services/api.ts (NUNCA fetch direto)

## Padrão de Tela
```tsx
import { View, StyleSheet } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { COLORS } from "@vibecode/shared"
// importar hooks, componentes...

export default function MinhaTelaScreen() {
  const insets = useSafeAreaInsets()
  // hooks...

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* conteúdo */}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgPrimary,
  },
})
```
