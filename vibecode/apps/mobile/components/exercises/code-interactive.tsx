import { useState } from 'react'
import { View, StyleSheet, Pressable, Modal } from 'react-native'
import Text from '../ui/text'
import Button from '../ui/button'
import { COLORS } from '@vibecode/shared'
import * as Haptics from 'expo-haptics'

interface CodeLine {
  code: string
  explanation: string
}

interface CodeInteractiveProps {
  lines: CodeLine[]
  onComplete: (score: number) => void
}

export default function CodeInteractive({ lines, onComplete }: CodeInteractiveProps) {
  const [touched, setTouched] = useState<Set<number>>(new Set())
  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  const handleTap = (index: number) => {
    setActiveIndex(index)
    const next = new Set(touched)
    next.add(index)
    setTouched(next)
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
  }

  const handleClose = () => {
    setActiveIndex(null)
    if (touched.size === lines.length) {
      setTimeout(() => onComplete(100), 400)
    }
  }

  const activeLine = activeIndex !== null ? lines[activeIndex] : null

  return (
    <View style={styles.container}>
      <Text style={styles.instruction}>
        Toca em cada linha para perceber o que faz:
      </Text>

      <View style={styles.codeBlock}>
        {lines.map((line, index) => (
          <Pressable
            key={index}
            onPress={() => handleTap(index)}
            style={({ pressed }) => [
              styles.codeLine,
              touched.has(index) && styles.codeLineTouched,
              pressed && styles.codeLinePressed,
            ]}
          >
            <Text style={styles.lineNum}>{index + 1}</Text>
            <Text style={styles.codeText}>{line.code}</Text>
            {touched.has(index) && <Text style={styles.checkmark}>✓</Text>}
          </Pressable>
        ))}
      </View>

      <Text style={styles.progress}>
        {touched.size}/{lines.length} linhas exploradas
      </Text>

      {touched.size === lines.length && (
        <Button title="CONTINUAR" onPress={() => onComplete(100)} variant="primary" />
      )}

      {/* Explanation Modal */}
      <Modal visible={activeIndex !== null} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.codePreview}>
              <Text style={styles.codePreviewText}>{activeLine?.code}</Text>
            </View>
            <Text style={styles.explanationText}>{activeLine?.explanation}</Text>
            <Button title="ENTENDI" onPress={handleClose} variant="primary" size="md" />
          </View>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { gap: 20 },
  instruction: { color: COLORS.textSecondary, fontSize: 15 },
  codeBlock: {
    backgroundColor: '#0A0A0F',
    borderRadius: 14,
    padding: 4,
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
    overflow: 'hidden',
  },
  codeLine: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    gap: 10,
    borderRadius: 8,
  },
  codeLineTouched: { backgroundColor: 'rgba(139,92,246,0.08)' },
  codeLinePressed: { opacity: 0.7 },
  lineNum: { color: COLORS.textMuted, fontSize: 12, width: 20, textAlign: 'right', fontFamily: 'monospace' },
  codeText: { flex: 1, color: '#A9FF94', fontSize: 13, fontFamily: 'monospace' },
  checkmark: { color: COLORS.accentGreen, fontSize: 13 },
  progress: { color: COLORS.textMuted, fontSize: 13, textAlign: 'center' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.bgSecondary,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    gap: 20,
  },
  codePreview: {
    backgroundColor: '#0A0A0F',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
  },
  codePreviewText: { color: '#A9FF94', fontSize: 14, fontFamily: 'monospace' },
  explanationText: { color: COLORS.textPrimary, fontSize: 16, lineHeight: 24 },
})
