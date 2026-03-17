import { useState } from 'react'
import { View, StyleSheet, TextInput, ScrollView } from 'react-native'
import Text from '../ui/text'
import Button from '../ui/button'
import { COLORS } from '@vibecode/shared'
import { api, ApiError } from '../../services/api'
import * as Haptics from 'expo-haptics'

interface SandboxPromptProps {
  instruction: string
  placeholder: string
  hint: string
  onComplete: (score: number) => void
}

interface ViResponse {
  message: string
  role: string
}

export default function SandboxPrompt({
  instruction,
  placeholder,
  hint,
  onComplete,
}: SandboxPromptProps) {
  const [prompt, setPrompt] = useState('')
  const [response, setResponse] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasCompleted, setHasCompleted] = useState(false)

  const handleSend = async () => {
    if (!prompt.trim() || loading) return
    setLoading(true)
    setError(null)

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
      const result = await api.post<ViResponse>('/vi/chat', {
        content: prompt.trim(),
        mode: 'teacher',
      })
      setResponse(result.message)
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)

      if (!hasCompleted) {
        setHasCompleted(true)
      }
    } catch (e) {
      if (e instanceof ApiError && e.code === 'LIMIT_REACHED') {
        setError('Limite de mensagens gratuitas atingido. Upgrade para PRO!')
      } else {
        setError('Oops! Não foi possível contactar o Vi. Tenta novamente.')
      }
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={styles.container}>
        <Text style={styles.instruction}>{instruction}</Text>
        <Text style={styles.hint}>{hint}</Text>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={prompt}
            onChangeText={setPrompt}
            placeholder={placeholder}
            placeholderTextColor={COLORS.textMuted}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        <Button
          title={loading ? 'A enviar...' : 'ENVIAR AO VI'}
          onPress={handleSend}
          variant="primary"
          loading={loading}
          disabled={!prompt.trim()}
        />

        {error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>⚠️ {error}</Text>
          </View>
        )}

        {response && (
          <View style={styles.responseBubble}>
            <Text style={styles.viLabel}>🤖 Vi</Text>
            <Text style={styles.responseText}>{response}</Text>
          </View>
        )}

        {hasCompleted && (
          <Button
            title="CONTINUAR"
            onPress={() => onComplete(100)}
            variant="secondary"
          />
        )}
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { gap: 20 },
  instruction: { color: COLORS.textPrimary, fontSize: 16, fontWeight: '600', lineHeight: 24 },
  hint: { color: COLORS.textMuted, fontSize: 13, lineHeight: 18 },
  inputContainer: {
    backgroundColor: COLORS.bgCard,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.borderDefault,
    overflow: 'hidden',
  },
  input: {
    color: COLORS.textPrimary,
    fontSize: 14,
    padding: 16,
    minHeight: 120,
    lineHeight: 22,
  },
  errorBox: {
    backgroundColor: COLORS.redAlpha10,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.accentRed,
  },
  errorText: { color: COLORS.accentRed, fontSize: 14 },
  responseBubble: {
    backgroundColor: 'rgba(139,92,246,0.08)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(139,92,246,0.3)',
    gap: 8,
  },
  viLabel: { color: COLORS.accentPurple, fontSize: 13, fontWeight: '700' },
  responseText: { color: COLORS.textPrimary, fontSize: 14, lineHeight: 22 },
})
