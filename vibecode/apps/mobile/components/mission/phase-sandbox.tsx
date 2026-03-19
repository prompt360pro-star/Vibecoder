import { useState, useEffect } from 'react'
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native'
import * as Clipboard from 'expo-clipboard'
import * as Haptics from 'expo-haptics'
import Text from '../ui/text'
import Button from '../ui/button'
import { COLORS } from '@vibecode/shared'
import { TextInput } from 'react-native-gesture-handler'

export interface PhaseSandboxProps {
  content: {
    instruction: string
    promptTemplate: string
    expectedOutput: string
    hints: string[]
    evaluationCriteria: string[]
  }
  onComplete: (score: number) => void
}

export default function PhaseSandbox({ content, onComplete }: PhaseSandboxProps) {
  const [userInput, setUserInput] = useState('')
  const [hintIndex, setHintIndex] = useState(-1)
  const [isEvaluating, setIsEvaluating] = useState(false)

  const handleCopyTemplate = async () => {
    await Clipboard.setStringAsync(content.promptTemplate)
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
  }

  const handleSubmit = () => {
    if (!userInput.trim()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
      return
    }

    setIsEvaluating(true)

    // Avaliação local super simples (mock)
    // Conta quantas keywords da criteria o user escreveu no prompt.
    setTimeout(() => {
      let matched = 0
      const total = content.evaluationCriteria.length
      
      const lowerInput = userInput.toLowerCase()
      content.evaluationCriteria.forEach((crit) => {
        // Separa criteria por palavras chave se for uma frase para simplificar, 
        // ou verifica substring direta.
        if (lowerInput.includes(crit.toLowerCase())) {
          matched++
        } else {
          // Fallback simple keyword match
          const keywords = crit.toLowerCase().split(' ')
          const hasAnyKeyword = keywords.some(k => k.length > 3 && lowerInput.includes(k))
          if (hasAnyKeyword) matched++
        }
      })

      // Aproximação do score: 50 base (por tentar) + proporcional aos matches
      const score = total > 0 ? Math.min(100, Math.round(50 + (matched / total) * 50)) : 100

      setIsEvaluating(false)
      onComplete(score)
    }, 1500)
  }

  const showNextHint = () => {
    if (hintIndex < content.hints.length - 1) {
      setHintIndex(hintIndex + 1)
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={100}
    >
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <Text style={styles.instruction}>{content.instruction}</Text>

        {content.promptTemplate && content.promptTemplate.length > 0 && (
          <View style={styles.templateCard}>
            <Text style={styles.templateLabel}>Template:</Text>
            <View style={styles.templateBox}>
              <Text style={styles.templateText}>{content.promptTemplate}</Text>
            </View>
            <Button
              title="COPIAR"
              onPress={handleCopyTemplate}
              variant="secondary"
              size="sm"
              style={styles.copyBtn}
            />
          </View>
        )}

        <Text style={styles.inputLabel}>Teu Prompt:</Text>
        <TextInput
          style={styles.textInput}
          multiline
          placeholder="Escreve o teu prompt aqui..."
          placeholderTextColor={COLORS.textTertiary}
          value={userInput}
          onChangeText={setUserInput}
          autoCapitalize="none"
          autoCorrect={false}
        />

        <View style={styles.hintSection}>
          {hintIndex >= 0 && (
            <View style={styles.activeHintBox}>
              <Text style={styles.hintIcon}>💡</Text>
              <Text style={styles.hintText}>{content.hints[hintIndex]}</Text>
            </View>
          )}

          {hintIndex < content.hints.length - 1 && (
            <Button
              title={hintIndex === -1 ? "💡 Ver dica" : "Próxima dica"}
              onPress={showNextHint}
              variant="secondary"
              size="sm"
              style={styles.hintBtn}
            />
          )}
        </View>

        <View style={styles.footer}>
          {isEvaluating ? (
            <View style={styles.evaluatingBox}>
              <ActivityIndicator color={COLORS.accentPurple} />
              <Text style={styles.evaluatingText}>A avaliar...</Text>
            </View>
          ) : (
            <Button
              title="SUBMETER"
              onPress={handleSubmit}
              variant="primary"
              size="lg"
            />
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgPrimary,
  },
  scroll: {
    paddingBottom: 40,
    gap: 20,
  },
  instruction: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFF',
    lineHeight: 24,
  },
  templateCard: {
    backgroundColor: COLORS.bgElevated,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
    gap: 12,
  },
  templateLabel: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  templateBox: {
    backgroundColor: '#000',
    borderRadius: 8,
    padding: 12,
  },
  templateText: {
    color: COLORS.accentPurple,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontSize: 13,
  },
  copyBtn: {
    alignSelf: 'flex-end',
  },
  inputLabel: {
    color: COLORS.textPrimary,
    fontSize: 15,
    fontWeight: '600',
  },
  textInput: {
    backgroundColor: COLORS.bgElevated,
    minHeight: 120,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
    padding: 16,
    color: '#FFF',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontSize: 14,
    textAlignVertical: 'top',
  },
  hintSection: {
    gap: 12,
    alignItems: 'flex-start',
  },
  activeHintBox: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    width: '100%',
  },
  hintIcon: {
    fontSize: 20,
  },
  hintText: {
    flex: 1,
    color: '#FFF',
    fontSize: 14,
    lineHeight: 22,
  },
  hintBtn: {
    marginTop: 4,
  },
  footer: {
    marginTop: 12,
  },
  evaluatingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.bgElevated,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.accentPurple,
    gap: 12,
  },
  evaluatingText: {
    color: COLORS.accentPurple,
    fontSize: 16,
    fontWeight: '700',
  },
})
