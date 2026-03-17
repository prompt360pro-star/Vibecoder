import { useState } from 'react'
import { View, StyleSheet, Pressable } from 'react-native'
import Text from '../ui/text'
import Button from '../ui/button'
import { COLORS } from '@vibecode/shared'
import * as Haptics from 'expo-haptics'

interface DragDropProps {
  instruction?: string
  items: string[]
  correctOrder: number[]
  onComplete: (score: number) => void
}

export default function DragDrop({ instruction, items, correctOrder, onComplete }: DragDropProps) {
  const [order, setOrder] = useState<number[]>(items.map((_, i) => i))
  const [selected, setSelected] = useState<number | null>(null) // index in order array
  const [submitted, setSubmitted] = useState(false)
  const [results, setResults] = useState<boolean[]>([])

  const handleTap = (positionIndex: number) => {
    if (submitted) return

    if (selected === null) {
      // Primeiro toque — selecionar
      setSelected(positionIndex)
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    } else if (selected === positionIndex) {
      // Toque no mesmo — desselecionar
      setSelected(null)
    } else {
      // Segundo toque — trocar os dois
      const newOrder = [...order]
      const temp = newOrder[selected]
      newOrder[selected] = newOrder[positionIndex] as number
      newOrder[positionIndex] = temp as number
      setOrder(newOrder)
      setSelected(null)
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    }
  }

  const handleVerify = () => {
    setSubmitted(true)
    const res = correctOrder.map((expectedItemIndex, position) => {
      return order[position] === expectedItemIndex
    })
    setResults(res)
    const correct = res.filter(Boolean).length
    const score = Math.round((correct / items.length) * 100)
    Haptics.notificationAsync(
      score === 100
        ? Haptics.NotificationFeedbackType.Success
        : Haptics.NotificationFeedbackType.Warning
    )
    setTimeout(() => onComplete(score), 2200)
  }

  return (
    <View style={styles.container}>
      {instruction && <Text style={styles.instruction}>{instruction}</Text>}
      <Text style={styles.hint}>💡 Toca num bloco e depois noutro para os trocar de posição.</Text>

      <View style={styles.list}>
        {order.map((itemIndex, positionIndex) => {
          const label = items[itemIndex] ?? ''
          const isSelected = selected === positionIndex
          const isCorrect = submitted ? results[positionIndex] : null

          return (
            <Pressable
              key={positionIndex}
              onPress={() => handleTap(positionIndex)}
              style={[
                styles.block,
                isSelected && styles.blockSelected,
                submitted && isCorrect === true && styles.blockCorrect,
                submitted && isCorrect === false && styles.blockWrong,
              ]}
            >
              <View style={styles.positionNum}>
                <Text style={styles.posNum}>{positionIndex + 1}</Text>
              </View>
              <Text style={[styles.blockText, isSelected && { color: COLORS.accentPurple }]}>
                {label}
              </Text>
              {submitted && (
                <Text style={styles.resultIcon}>
                  {isCorrect ? '✅' : '❌'}
                </Text>
              )}
            </Pressable>
          )
        })}
      </View>

      {!submitted && (
        <Button title="VERIFICAR" onPress={handleVerify} variant="primary" />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { gap: 20 },
  instruction: { color: COLORS.textSecondary, fontSize: 15, lineHeight: 22 },
  hint: { color: COLORS.textMuted, fontSize: 13 },
  list: { gap: 10 },
  block: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: COLORS.bgCard,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
  },
  blockSelected: {
    borderColor: COLORS.accentPurple,
    borderWidth: 2,
    backgroundColor: 'rgba(139,92,246,0.08)',
    transform: [{ scale: 1.02 }],
  },
  blockCorrect: {
    borderColor: COLORS.accentGreen,
    backgroundColor: COLORS.greenAlpha10,
  },
  blockWrong: {
    borderColor: COLORS.accentRed,
    backgroundColor: COLORS.redAlpha10,
  },
  positionNum: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: 'rgba(139,92,246,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  posNum: { color: COLORS.accentPurple, fontWeight: '900', fontSize: 13 },
  blockText: { flex: 1, color: COLORS.textPrimary, fontSize: 14, fontWeight: '600' },
  resultIcon: { fontSize: 18 },
})
