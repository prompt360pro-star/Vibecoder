import { View, StyleSheet, Pressable } from 'react-native'
import Text from '../ui/text'
import { COLORS, ViMode } from '@vibecode/shared'
import * as Haptics from 'expo-haptics'

interface ViModeSelectorProps {
  currentMode: ViMode
  onSelect: (mode: ViMode) => void
}

const MODES: { mode: ViMode; emoji: string; label: string; description: string }[] = [
  { mode: ViMode.TEACHER, emoji: '🎓', label: 'Professor', description: 'Explica conceitos' },
  { mode: ViMode.BUILDER, emoji: '🔧', label: 'Construtor', description: 'Ajuda a criar código' },
  { mode: ViMode.DETECTIVE, emoji: '🐛', label: 'Detetive', description: 'Debugar erros' },
  { mode: ViMode.REVIEWER, emoji: '📝', label: 'Revisor', description: 'Revisa código' },
  { mode: ViMode.CREATIVE, emoji: '💡', label: 'Criativo', description: 'Sugere ideias' },
  { mode: ViMode.QUIZ, emoji: '🎯', label: 'Quiz', description: 'Testa conhecimento' },
  { mode: ViMode.CONVERSATION, emoji: '🗣️', label: 'Conversa', description: 'Bate-papo livre' },
  { mode: ViMode.SCANNER, emoji: '📸', label: 'Scanner', description: 'Lê imagens' },
]

export default function ViModeSelector({ currentMode, onSelect }: ViModeSelectorProps) {
  const handleSelect = (mode: ViMode) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    onSelect(mode)
  }

  return (
    <View style={styles.container}>
      <View style={styles.grid}>
        {MODES.map((item) => {
          const isActive = currentMode === item.mode
          return (
            <Pressable
              key={item.mode}
              onPress={() => handleSelect(item.mode)}
              style={({ pressed }) => [
                styles.card,
                isActive && styles.cardActive,
                pressed && styles.cardPressed,
              ]}
            >
              <Text style={styles.emoji}>{item.emoji}</Text>
              <Text style={[styles.label, isActive && styles.labelActive]}>{item.label}</Text>
              <Text style={styles.desc}>{item.description}</Text>
            </Pressable>
          )
        })}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.bgSecondary,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderSubtle,
    padding: 12,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  card: {
    width: '47.5%',
    backgroundColor: COLORS.bgCard,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
    gap: 2,
  },
  cardActive: {
    borderColor: COLORS.accentPurple,
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
  },
  cardPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.97 }],
  },
  emoji: { fontSize: 20, marginBottom: 2 },
  label: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '700',
  },
  labelActive: {
    color: COLORS.accentPurple,
  },
  desc: {
    color: COLORS.textMuted,
    fontSize: 11,
  },
})
