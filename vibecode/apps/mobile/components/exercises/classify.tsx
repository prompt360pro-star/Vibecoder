import { useState } from 'react'
import { View, StyleSheet, Pressable } from 'react-native'
import Text from '../ui/text'
import Button from '../ui/button'
import { COLORS } from '@vibecode/shared'
import type { ClassifyCategory, ClassifyItem } from '@vibecode/shared'
import * as Haptics from 'expo-haptics'

interface ClassifyProps {
  instruction: string
  categories: ClassifyCategory[]
  classifyItems: ClassifyItem[]
  onComplete: (score: number) => void
}

type Answers = Record<number, string> // itemIndex → categoryId

export default function Classify({
  instruction,
  categories,
  classifyItems,
  onComplete,
}: ClassifyProps) {
  const [answers, setAnswers] = useState<Answers>({})
  const [submitted, setSubmitted] = useState(false)

  const allAnswered = classifyItems.every((_, i) => answers[i] !== undefined)

  const handleAnswer = (itemIndex: number, categoryId: string) => {
    if (submitted) return
    setAnswers((prev) => ({ ...prev, [itemIndex]: categoryId }))
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
  }

  const handleSubmit = () => {
    if (!allAnswered) return
    setSubmitted(true)
    const correct = classifyItems.filter((item, i) => answers[i] === item.correctCategory).length
    const score = Math.round((correct / classifyItems.length) * 100)
    Haptics.notificationAsync(
      score >= 80
        ? Haptics.NotificationFeedbackType.Success
        : Haptics.NotificationFeedbackType.Warning
    )
    setTimeout(() => onComplete(score), 2000)
  }

  const isCorrect = (itemIndex: number) =>
    answers[itemIndex] === classifyItems[itemIndex]?.correctCategory

  return (
    <View style={styles.container}>
      <Text style={styles.instruction}>{instruction}</Text>

      {/* Legenda das categorias */}
      <View style={styles.legend}>
        {categories.map((cat) => (
          <View key={cat.id} style={styles.legendItem}>
            <Text style={styles.legendEmoji}>{cat.emoji}</Text>
            <Text style={styles.legendLabel}>{cat.label}</Text>
          </View>
        ))}
      </View>

      <View style={styles.list}>
        {classifyItems.map((item, itemIndex) => {
          const selected = answers[itemIndex]
          const correct = submitted ? isCorrect(itemIndex) : null

          return (
            <View
              key={itemIndex}
              style={[
                styles.itemCard,
                submitted && correct === true && styles.itemCorrect,
                submitted && correct === false && styles.itemWrong,
              ]}
            >
              <Text style={styles.itemText}>{item.text}</Text>

              <View style={styles.categoryButtons}>
                {categories.map((cat) => (
                  <Pressable
                    key={cat.id}
                    onPress={() => handleAnswer(itemIndex, cat.id)}
                    style={[
                      styles.catBtn,
                      selected === cat.id && styles.catBtnSelected,
                      submitted &&
                        cat.id === item.correctCategory &&
                        styles.catBtnCorrect,
                    ]}
                  >
                    <Text style={styles.catEmoji}>{cat.emoji}</Text>
                  </Pressable>
                ))}
              </View>

              {submitted && (
                <Text
                  style={[
                    styles.explanation,
                    { color: correct ? COLORS.accentGreen : COLORS.accentRed },
                  ]}
                >
                  {correct ? '✅' : '❌'} {item.explanation}
                </Text>
              )}
            </View>
          )
        })}
      </View>

      {!submitted && (
        <Button
          title="VERIFICAR"
          onPress={handleSubmit}
          variant={allAnswered ? 'primary' : 'secondary'}
          disabled={!allAnswered}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { gap: 20 },
  instruction: { color: COLORS.textSecondary, fontSize: 15, lineHeight: 22 },
  legend: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.bgCard,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  legendEmoji: { fontSize: 16 },
  legendLabel: { color: COLORS.textSecondary, fontSize: 12, fontWeight: '600' },
  list: { gap: 12 },
  itemCard: {
    backgroundColor: COLORS.bgCard,
    borderRadius: 14,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
  },
  itemCorrect: { borderColor: COLORS.accentGreen, backgroundColor: COLORS.greenAlpha10 },
  itemWrong: { borderColor: COLORS.accentRed, backgroundColor: COLORS.redAlpha10 },
  itemText: { color: COLORS.textPrimary, fontSize: 14, lineHeight: 20 },
  categoryButtons: { flexDirection: 'row', gap: 10 },
  catBtn: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    backgroundColor: COLORS.bgElevated,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
  },
  catBtnSelected: {
    borderColor: COLORS.accentPurple,
    borderWidth: 2,
    backgroundColor: 'rgba(139,92,246,0.15)',
  },
  catBtnCorrect: {
    borderColor: COLORS.accentGreen,
    backgroundColor: COLORS.greenAlpha10,
  },
  catEmoji: { fontSize: 22 },
  explanation: { fontSize: 13, lineHeight: 18 },
})
