import { ScrollView, StyleSheet, Pressable } from 'react-native'
import Text from '../ui/text'
import { COLORS } from '@vibecode/shared'
import * as Haptics from 'expo-haptics'

interface ViSuggestionChipsProps {
  onSuggest: (text: string) => void
}

const CHIPS = [
  'Explica',
  'Dá um exemplo',
  'Testa-me',
  'Próxima lição',
]

export default function ViSuggestionChips({ onSuggest }: ViSuggestionChipsProps) {
  const handlePress = (text: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    onSuggest(text)
  }

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
      style={styles.scroll}
    >
      {CHIPS.map((chip) => (
        <Pressable
          key={chip}
          onPress={() => handlePress(chip)}
          style={({ pressed }) => [styles.chip, pressed && styles.chipPressed]}
        >
          <Text style={styles.chipText}>{chip}</Text>
        </Pressable>
      ))}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  scroll: {
    flexShrink: 0,
  },
  container: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
    flexDirection: 'row',
  },
  chip: {
    backgroundColor: COLORS.bgCard,
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  chipPressed: {
    opacity: 0.65,
    transform: [{ scale: 0.96 }],
  },
  chipText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: '500',
  },
})
