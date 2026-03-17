import { useState } from 'react'
import { View, StyleSheet, Pressable } from 'react-native'
import Text from '../ui/text'
import { COLORS } from '@vibecode/shared'
import * as Haptics from 'expo-haptics'

interface QuizMultipleChoiceProps {
  question: string
  options: string[]
  correctIndex: number
  explanation: string
  onComplete: (score: number) => void
}

const LETTERS = ['A', 'B', 'C', 'D']

export default function QuizMultipleChoice({
  question,
  options,
  correctIndex,
  explanation,
  onComplete,
}: QuizMultipleChoiceProps) {
  const [selected, setSelected] = useState<number | null>(null)
  const [confirmed, setConfirmed] = useState(false)

  const handleSelect = (index: number) => {
    if (confirmed) return
    if (selected === index) {
      // Segunda pressão = confirmar
      setConfirmed(true)
      const isCorrect = index === correctIndex
      Haptics.notificationAsync(
        isCorrect
          ? Haptics.NotificationFeedbackType.Success
          : Haptics.NotificationFeedbackType.Error
      )
      setTimeout(() => onComplete(isCorrect ? 100 : 0), 1800)
    } else {
      setSelected(index)
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    }
  }

  const getOptionStyle = (index: number) => {
    if (!confirmed) {
      return selected === index ? styles.optionSelected : styles.option
    }
    if (index === correctIndex) return styles.optionCorrect
    if (index === selected && index !== correctIndex) return styles.optionWrong
    return styles.option
  }

  const getTextColor = (index: number) => {
    if (!confirmed) return selected === index ? COLORS.accentPurple : COLORS.textPrimary
    if (index === correctIndex) return COLORS.accentGreen
    if (index === selected && index !== correctIndex) return COLORS.accentRed
    return COLORS.textMuted
  }

  return (
    <View style={styles.container}>
      <Text style={styles.question}>{question}</Text>

      <View style={styles.options}>
        {options.map((option, index) => (
          <Pressable
            key={index}
            onPress={() => handleSelect(index)}
            style={({ pressed }) => [getOptionStyle(index), pressed && !confirmed && styles.pressed]}
          >
            <View style={styles.letterBadge}>
              <Text style={[styles.letter, { color: getTextColor(index) }]}>
                {LETTERS[index]}
              </Text>
            </View>
            <Text style={[styles.optionText, { color: getTextColor(index) }]}>{option}</Text>
          </Pressable>
        ))}
      </View>

      {selected !== null && !confirmed && (
        <Text style={styles.hint}>Toca novamente para confirmar</Text>
      )}

      {confirmed && (
        <View style={[
          styles.feedback,
          selected === correctIndex ? styles.feedbackCorrect : styles.feedbackWrong,
        ]}>
          <Text style={styles.feedbackText}>
            {selected === correctIndex ? '✅ Correto!' : '❌ Errado!'}{' '}
            {explanation}
          </Text>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { gap: 24 },
  question: {
    color: COLORS.textPrimary,
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 26,
  },
  options: { gap: 12 },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: COLORS.bgCard,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
  },
  optionSelected: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: COLORS.bgCard,
    borderRadius: 14,
    padding: 16,
    borderWidth: 2,
    borderColor: COLORS.accentPurple,
  },
  optionCorrect: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: COLORS.greenAlpha10,
    borderRadius: 14,
    padding: 16,
    borderWidth: 2,
    borderColor: COLORS.accentGreen,
  },
  optionWrong: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: COLORS.redAlpha10,
    borderRadius: 14,
    padding: 16,
    borderWidth: 2,
    borderColor: COLORS.accentRed,
  },
  pressed: { opacity: 0.7 },
  letterBadge: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(139,92,246,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  letter: { fontSize: 14, fontWeight: '900' },
  optionText: { flex: 1, fontSize: 15, fontWeight: '500' },
  hint: {
    color: COLORS.textMuted,
    fontSize: 13,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  feedback: {
    borderRadius: 14,
    padding: 16,
  },
  feedbackCorrect: { backgroundColor: COLORS.greenAlpha10, borderWidth: 1, borderColor: COLORS.accentGreen },
  feedbackWrong: { backgroundColor: COLORS.redAlpha10, borderWidth: 1, borderColor: COLORS.accentRed },
  feedbackText: { color: COLORS.textPrimary, fontSize: 14, lineHeight: 20 },
})
