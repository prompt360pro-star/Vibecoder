import { useState } from 'react'
import { View, StyleSheet, Pressable, ScrollView } from 'react-native'
import Text from '../ui/text'
import Button from '../ui/button'
import { COLORS } from '@vibecode/shared'
import type { TrueFalseStatement } from '@vibecode/shared'
import * as Haptics from 'expo-haptics'

interface TrueFalseProps {
  instruction?: string
  statements: TrueFalseStatement[]
  onComplete: (score: number) => void
}

type Answer = 'true' | 'false' | null

export default function TrueFalse({ instruction, statements, onComplete }: TrueFalseProps) {
  const [answers, setAnswers] = useState<Answer[]>(statements.map(() => null))
  const [submitted, setSubmitted] = useState(false)

  const allAnswered = answers.every((a) => a !== null)

  const handleAnswer = (index: number, value: 'true' | 'false') => {
    if (submitted) return
    const next = [...answers]
    next[index] = value
    setAnswers(next)
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
  }

  const handleSubmit = () => {
    if (!allAnswered) return
    setSubmitted(true)
    const correct = statements.filter((s, i) => {
      const answer = answers[i]
      return (s.isTrue && answer === 'true') || (!s.isTrue && answer === 'false')
    }).length
    const score = Math.round((correct / statements.length) * 100)
    Haptics.notificationAsync(
      score >= 80
        ? Haptics.NotificationFeedbackType.Success
        : Haptics.NotificationFeedbackType.Warning
    )
    setTimeout(() => onComplete(score), 2000)
  }

  const isCorrect = (index: number) => {
    const s = statements[index]
    const a = answers[index]
    if (!s || !a) return false
    return (s.isTrue && a === 'true') || (!s.isTrue && a === 'false')
  }

  return (
    <View style={styles.container}>
      {instruction && <Text style={styles.instruction}>{instruction}</Text>}

      <View style={styles.list}>
        {statements.map((stmt, index) => {
          const answer = answers[index]
          const correct = submitted ? isCorrect(index) : null

          return (
            <View
              key={index}
              style={[
                styles.item,
                submitted && correct === true && styles.itemCorrect,
                submitted && correct === false && styles.itemWrong,
              ]}
            >
              <Text style={styles.stmtText}>{stmt.text}</Text>
              <View style={styles.buttonRow}>
                <Pressable
                  onPress={() => handleAnswer(index, 'true')}
                  style={[
                    styles.btn,
                    answer === 'true' && styles.btnSelected,
                    submitted && stmt.isTrue && styles.btnCorrectHighlight,
                  ]}
                >
                  <Text style={styles.btnLabel}>V</Text>
                </Pressable>
                <Pressable
                  onPress={() => handleAnswer(index, 'false')}
                  style={[
                    styles.btn,
                    answer === 'false' && styles.btnSelected,
                    submitted && !stmt.isTrue && styles.btnCorrectHighlight,
                  ]}
                >
                  <Text style={styles.btnLabel}>F</Text>
                </Pressable>
              </View>
              {submitted && (
                <Text style={[styles.explanation, { color: correct ? COLORS.accentGreen : COLORS.accentRed }]}>
                  {correct ? '✅' : '❌'} {stmt.explanation}
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
  container: { gap: 24 },
  instruction: { color: COLORS.textSecondary, fontSize: 15, lineHeight: 22 },
  list: { gap: 12 },
  item: {
    backgroundColor: COLORS.bgCard,
    borderRadius: 14,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
  },
  itemCorrect: { borderColor: COLORS.accentGreen, backgroundColor: COLORS.greenAlpha10 },
  itemWrong: { borderColor: COLORS.accentRed, backgroundColor: COLORS.redAlpha10 },
  stmtText: { color: COLORS.textPrimary, fontSize: 15, lineHeight: 21 },
  buttonRow: { flexDirection: 'row', gap: 10 },
  btn: {
    flex: 1,
    height: 40,
    borderRadius: 10,
    backgroundColor: COLORS.bgElevated,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
  },
  btnSelected: {
    borderColor: COLORS.accentPurple,
    backgroundColor: 'rgba(139,92,246,0.15)',
  },
  btnCorrectHighlight: {
    borderColor: COLORS.accentGreen,
    backgroundColor: COLORS.greenAlpha10,
  },
  btnLabel: { color: COLORS.textPrimary, fontWeight: '900', fontSize: 16 },
  explanation: { fontSize: 13, lineHeight: 18 },
})
