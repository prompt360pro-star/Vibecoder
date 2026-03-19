import { Pressable, ScrollView, StyleSheet } from 'react-native'
import * as Haptics from 'expo-haptics'
import Animated from 'react-native-reanimated'
import { COLORS, ViMode } from '@vibecode/shared'
import { useStaggerIn } from '../../lib/animations'
import Text from '../ui/text'

interface ViSuggestionChipsProps {
  mode: ViMode | string
  onSelect: (text: string) => void
}

const getSuggestionsForMode = (mode: ViMode | string) => {
  switch (mode) {
    case ViMode.TEACHER:
      return ['Explica-me Vibe Coding', 'O que é um prompt?', 'Como uso IA para criar apps?']
    case ViMode.REVIEWER:
      return ['Revê este prompt meu:', 'O que melhorarias nisto?', 'Está bem estruturado?']
    case ViMode.QUIZ:
    case 'QUIZ_MASTER':
      return ['Faz-me um quiz', 'Testa-me sobre prompts', 'Pergunta difícil!']
    case 'MOTIVATOR':
      return ['Preciso de motivação', 'Estou a travar...', 'Celebra comigo! 🎉']
    case 'PAIR':
      return ['Vamos criar juntos', 'Ajuda-me com este projeto', 'Que feature construímos?']
    default:
      return ['Explica-me como começas', 'O que podemos fazer?', 'Testa o meu código']
  }
}

function SuggestionChip({
  chip,
  index,
  onSelect,
}: {
  chip: string
  index: number
  onSelect: (text: string) => void
}) {
  const animatedStyle = useStaggerIn(index, 70)

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    onSelect(chip)
  }

  return (
    <Animated.View style={animatedStyle}>
      <Pressable onPress={handlePress} style={({ pressed }) => [styles.chip, pressed && styles.chipPressed]}>
        <Text style={styles.chipText}>{chip}</Text>
      </Pressable>
    </Animated.View>
  )
}

export default function ViSuggestionChips({ mode, onSelect }: ViSuggestionChipsProps) {
  const chips = getSuggestionsForMode(mode)

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
      style={styles.scroll}
    >
      {chips.map((chip, index) => (
        <SuggestionChip key={chip} chip={chip} index={index} onSelect={onSelect} />
      ))}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  scroll: {
    flexShrink: 0,
    marginBottom: 8,
  },
  container: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  chip: {
    backgroundColor: COLORS.bgCard,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    borderRadius: 18,
    height: 36,
    paddingHorizontal: 14,
    justifyContent: 'center',
  },
  chipPressed: {
    opacity: 0.65,
    transform: [{ scale: 0.96 }],
  },
  chipText: {
    color: COLORS.textPrimary,
    fontSize: 13,
  },
})
