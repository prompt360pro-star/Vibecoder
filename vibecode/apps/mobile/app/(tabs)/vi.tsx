import { useState, useRef, useCallback } from 'react'
import {
  View,
  StyleSheet,
  FlatList,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useMutation } from '@tanstack/react-query'
import { MMKV } from 'react-native-mmkv'
import * as Haptics from 'expo-haptics'
import { Ionicons } from '@expo/vector-icons'
import Text from '../../components/ui/text'
import ViChatBubble from '../../components/vi/vi-chat-bubble'
import ViModeSelector from '../../components/vi/vi-mode-selector'
import ViTypingIndicator from '../../components/vi/vi-typing-indicator'
import ViSuggestionChips from '../../components/vi/vi-suggestion-chips'
import { COLORS, ViMode } from '@vibecode/shared'
import { api, ApiError } from '../../services/api'

interface ViMessage {
  id: string
  role: 'USER' | 'ASSISTANT'
  content: string
  timestamp: Date
  mode?: ViMode
}

const storage = new MMKV({ id: 'vi-chat' })
const STORAGE_KEY = 'vi_messages'
const MAX_STORED = 50

const WELCOME_MESSAGE: ViMessage = {
  id: 'welcome',
  role: 'ASSISTANT',
  content:
    'Olá! Sou o Vi — o teu mentor de programação com IA. 🤖\n\nPodes perguntar-me qualquer coisa sobre código, pedir que te explique conceitos, ou simplesmente conversar sobre tech. De que precisas hoje?',
  timestamp: new Date(),
  mode: ViMode.TEACHER,
}

const MODE_LABELS: Record<ViMode, { emoji: string; label: string }> = {
  [ViMode.TEACHER]: { emoji: '🎓', label: 'Professor' },
  [ViMode.BUILDER]: { emoji: '🔧', label: 'Construtor' },
  [ViMode.DETECTIVE]: { emoji: '🐛', label: 'Detetive' },
  [ViMode.REVIEWER]: { emoji: '📝', label: 'Revisor' },
  [ViMode.CREATIVE]: { emoji: '💡', label: 'Criativo' },
  [ViMode.QUIZ]: { emoji: '🎯', label: 'Quiz' },
  [ViMode.CONVERSATION]: { emoji: '🗣️', label: 'Conversa' },
  [ViMode.SCANNER]: { emoji: '📸', label: 'Scanner' },
}

interface ViApiResponse {
  message: string
  role: string
  model: string
  tokensUsed: number
}

export default function ViScreen() {
  const flatListRef = useRef<FlatList>(null)

  // Load persisted messages or use welcome
  const [messages, setMessages] = useState<ViMessage[]>(() => {
    try {
      const stored = storage.getString(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored) as Array<Omit<ViMessage, 'timestamp'> & { timestamp: string }>
        const msgs = parsed.map((m) => ({ ...m, timestamp: new Date(m.timestamp) }))
        return msgs.length > 0 ? msgs : [WELCOME_MESSAGE]
      }
    } catch {}
    return [WELCOME_MESSAGE]
  })

  const [input, setInput] = useState('')
  const [mode, setMode] = useState<ViMode>(ViMode.TEACHER)
  const [showModeSelector, setShowModeSelector] = useState(false)

  const hasUserMessage = messages.some((m) => m.role === 'USER')

  // Persist messages (last 50)
  const persistMessages = useCallback((msgs: ViMessage[]) => {
    const toStore = msgs.slice(-MAX_STORED)
    storage.set(STORAGE_KEY, JSON.stringify(toStore))
  }, [])

  const sendMessage = useMutation({
    mutationFn: (content: string) =>
      api.post<ViApiResponse>('/vi/chat', { content, mode }),
    onSuccess: (data, content) => {
      const viMsg: ViMessage = {
        id: `vi-${Date.now()}`,
        role: 'ASSISTANT',
        content: data.message,
        timestamp: new Date(),
        mode,
      }
      setMessages((prev) => {
        const next = [...prev, viMsg]
        persistMessages(next)
        return next
      })
    },
    onError: (err) => {
      let errorText = 'Oops! Não consegui responder. Tenta outra vez. 🔁'
      if (err instanceof ApiError) {
        if (err.code === 'LIMIT_REACHED') {
          errorText = 'Atingiste o limite de mensagens gratuitas hoje. Faz upgrade para PRO para continuar! 🚀'
        } else if (err.code === 'RATE_LIMIT') {
          errorText = 'Estás a enviar demasiadas mensagens. Aguarda um momento! ⏳'
        }
      }
      const errMsg: ViMessage = {
        id: `err-${Date.now()}`,
        role: 'ASSISTANT',
        content: errorText,
        timestamp: new Date(),
        mode,
      }
      setMessages((prev) => {
        const next = [...prev, errMsg]
        persistMessages(next)
        return next
      })
    },
  })

  const handleSend = (text?: string) => {
    const content = (text ?? input).trim()
    if (!content || sendMessage.isPending) return

    const userMsg: ViMessage = {
      id: `user-${Date.now()}`,
      role: 'USER',
      content,
      timestamp: new Date(),
      mode,
    }

    setMessages((prev) => {
      const next = [...prev, userMsg]
      persistMessages(next)
      return next
    })
    setInput('')
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    sendMessage.mutate(content)
  }

  const handleModeSelect = (newMode: ViMode) => {
    setMode(newMode)
    setShowModeSelector(false)
  }

  const currentModeInfo = MODE_LABELS[mode]

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTitle}>
          <Text style={styles.title}>🤖 Vi</Text>
          <Text style={styles.subtitle}>Seu Mentor</Text>
        </View>
        <Pressable
          onPress={() => setShowModeSelector((v) => !v)}
          style={({ pressed }) => [styles.modeChip, pressed && styles.modeChipPressed]}
        >
          <Text style={styles.modeChipText}>
            {currentModeInfo.emoji} {currentModeInfo.label}
          </Text>
          <Ionicons
            name={showModeSelector ? 'chevron-up' : 'chevron-down'}
            size={14}
            color={COLORS.accentPurple}
          />
        </Pressable>
      </View>

      {/* Mode selector (expandable) */}
      {showModeSelector && (
        <ViModeSelector currentMode={mode} onSelect={handleModeSelect} />
      )}

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        {/* Messages list */}
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ViChatBubble role={item.role} content={item.content} timestamp={item.timestamp} />
          )}
          contentContainerStyle={styles.messagesList}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          onContentSizeChange={() =>
            flatListRef.current?.scrollToEnd({ animated: true })
          }
          ListFooterComponent={
            sendMessage.isPending ? <ViTypingIndicator /> : null
          }
        />

        {/* Suggestion chips — only before first user message */}
        {!hasUserMessage && (
          <ViSuggestionChips onSuggest={(text) => handleSend(text)} />
        )}

        {/* Input bar */}
        <View style={styles.inputBar}>
          <Pressable style={styles.cameraBtn}>
            <Ionicons name="camera-outline" size={22} color={COLORS.textMuted} />
          </Pressable>

          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="Pergunte ao Vi..."
            placeholderTextColor={COLORS.textMuted}
            multiline
            maxLength={10000}
            returnKeyType="default"
          />

          <Pressable
            onPress={() => handleSend()}
            disabled={!input.trim() || sendMessage.isPending}
            style={({ pressed }) => [
              styles.sendBtn,
              input.trim() ? styles.sendBtnActive : styles.sendBtnInactive,
              pressed && styles.sendBtnPressed,
            ]}
          >
            <Ionicons
              name="send"
              size={18}
              color={input.trim() ? '#FFFFFF' : COLORS.textMuted}
            />
          </Pressable>
        </View>

        {/* Safe area bottom padding (iOS) */}
        <View style={styles.bottomPad} />
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bgPrimary },
  flex: { flex: 1 },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderSubtle,
  },
  headerTitle: { gap: 1 },
  title: { color: COLORS.textPrimary, fontSize: 18, fontWeight: '800' },
  subtitle: { color: COLORS.textMuted, fontSize: 12 },
  modeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(139,92,246,0.1)',
    borderWidth: 1,
    borderColor: COLORS.accentPurple,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  modeChipPressed: { opacity: 0.7 },
  modeChipText: { color: COLORS.accentPurple, fontSize: 13, fontWeight: '600' },

  // Messages
  messagesList: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 8,
  },

  // Input bar
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderSubtle,
    backgroundColor: COLORS.bgSecondary,
  },
  cameraBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: COLORS.bgCard,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: COLORS.textPrimary,
    fontSize: 15,
    lineHeight: 22,
    maxHeight: 120,
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendBtnActive: { backgroundColor: COLORS.accentPurple },
  sendBtnInactive: { backgroundColor: 'transparent' },
  sendBtnPressed: { opacity: 0.75 },

  bottomPad: { height: Platform.OS === 'ios' ? 34 : 8 },
})
