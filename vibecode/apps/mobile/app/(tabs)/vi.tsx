import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLocalSearchParams } from 'expo-router'
import * as Haptics from 'expo-haptics'
import { Ionicons } from '@expo/vector-icons'
import Animated from 'react-native-reanimated'
import { COLORS, ViMode } from '@vibecode/shared'
import GradientBackground from '../../components/ui/gradient-background'
import Text from '../../components/ui/text'
import ViAvatar from '../../components/vi/vi-avatar'
import ViChatBubble from '../../components/vi/vi-chat-bubble'
import ViModeSelector from '../../components/vi/vi-mode-selector'
import ViSuggestionChips from '../../components/vi/vi-suggestion-chips'
import ViTypingIndicator from '../../components/vi/vi-typing-indicator'
import { useFloat } from '../../lib/animations'
import { useVi } from '../../hooks/use-vi'

const MODE_LABELS: Record<string, string> = {
  [ViMode.TEACHER]: 'professor',
  [ViMode.REVIEWER]: 'revisor',
  [ViMode.QUIZ]: 'quiz master',
  MOTIVATOR: 'motivador',
  PAIR: 'pair coder',
}

export default function ViScreen() {
  const { context } = useLocalSearchParams<{ context?: string }>()
  const flatListRef = useRef<FlatList>(null)
  const { messages, isLoading, error, sendMessage, clearConversation } = useVi()
  const [input, setInput] = useState('')
  const [mode, setMode] = useState<ViMode>(ViMode.TEACHER)
  const [showModeSelector, setShowModeSelector] = useState(false)
  const [contextSent, setContextSent] = useState(false)
  const [avatarMood, setAvatarMood] = useState<'neutral' | 'happy'>('neutral')

  const emptyAvatarFloatStyle = useFloat(3, 2800)

  useEffect(() => {
    if (context && !contextSent) {
      setMode(ViMode.TEACHER)
      sendMessage(context, ViMode.TEACHER)
      setContextSent(true)
    }
  }, [context, contextSent, sendMessage])

  useEffect(() => {
    const latestMessage = messages[messages.length - 1]
    if (latestMessage?.role !== 'assistant') return

    setAvatarMood('happy')
    const timer = setTimeout(() => setAvatarMood('neutral'), 2000)
    return () => clearTimeout(timer)
  }, [messages])

  const headerMood = useMemo(() => (isLoading ? 'thinking' : avatarMood), [avatarMood, isLoading])

  const handleSend = (text?: string) => {
    const content = (text ?? input).trim()
    if (!content || isLoading) return

    setInput('')
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    sendMessage(content, mode)
  }

  const handleClear = () => {
    Alert.alert(
      'Limpar conversa?',
      'Esta acção apaga a conversa do ecrã. O histórico no servidor permanece.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Começar de novo',
          style: 'destructive',
          onPress: () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
            clearConversation()
          },
        },
      ],
    )
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <GradientBackground variant="vi" />

      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <ViAvatar size={40} isThinking={isLoading} mood={headerMood} />
          <View>
            <Text style={styles.title}>Vi</Text>
            <Text style={styles.subtitle}>modo {MODE_LABELS[mode] || 'assistente'}</Text>
          </View>
        </View>

        <View style={styles.headerRight}>
          <Pressable
            onPress={() => setShowModeSelector(true)}
            style={({ pressed }) => [styles.iconBtn, pressed && styles.pressed]}
          >
            <Ionicons name="settings-outline" size={24} color={COLORS.textPrimary} />
          </Pressable>
          <Pressable
            onPress={handleClear}
            style={({ pressed }) => [styles.iconBtn, pressed && styles.pressed]}
          >
            <Ionicons name="trash-outline" size={24} color={COLORS.textPrimary} />
          </Pressable>
        </View>
      </View>

      {showModeSelector ? (
        <ViModeSelector
          currentMode={mode}
          onSelect={(selectedMode) => setMode(selectedMode as ViMode)}
          onClose={() => setShowModeSelector(false)}
        />
      ) : null}

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        {messages.length === 0 && !isLoading ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIntro}>
              <Animated.View style={emptyAvatarFloatStyle}>
                <ViAvatar size={72} mood="neutral" />
              </Animated.View>
              <Text style={styles.emptyTitle}>Olá! Sou o Vi</Text>
              <Text style={styles.emptySubtitle}>o teu mentor de Vibe Coding</Text>
            </View>
            <ViSuggestionChips mode={mode} onSelect={handleSend} />
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={({ item, index }) => (
              <ViChatBubble message={item} isLatest={index === messages.length - 1} />
            )}
            contentContainerStyle={styles.messagesList}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
            ListFooterComponent={isLoading ? <ViTypingIndicator /> : null}
          />
        )}

        {error === 'LIMIT_REACHED' ? (
          <View style={styles.limitBanner}>
            <Text style={styles.limitText}>
              Atingiste o limite de 5 mensagens diárias gratuitas.
            </Text>
            <Pressable
              style={styles.upgradeBtn}
              onPress={() => Alert.alert('Em Breve!', 'Funcionalidade PRO disponível em breve.')}
            >
              <Text style={styles.upgradeBtnText}>Upgrade para PRO 🚀</Text>
            </Pressable>
          </View>
        ) : null}

        <View style={styles.inputBar}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="Pergunta ao Vi..."
            placeholderTextColor={COLORS.textMuted}
            multiline
            maxLength={1000}
            returnKeyType="default"
          />
          <Pressable
            onPress={() => handleSend()}
            disabled={!input.trim() || isLoading}
            style={({ pressed }) => [
              styles.sendBtn,
              input.trim() && !isLoading ? styles.sendBtnActive : styles.sendBtnInactive,
              pressed && styles.sendBtnPressed,
            ]}
          >
            <Ionicons
              name="arrow-up"
              size={20}
              color={input.trim() && !isLoading ? COLORS.textPrimary : COLORS.textMuted}
            />
          </Pressable>
        </View>

        <View style={styles.bottomPad} />
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bgPrimary },
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderSubtle,
    backgroundColor: 'transparent',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  title: { color: COLORS.textPrimary, fontSize: 16, fontWeight: '800' },
  subtitle: { color: COLORS.textMuted, fontSize: 13, textTransform: 'lowercase' },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconBtn: {
    padding: 4,
  },
  pressed: {
    opacity: 0.6,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  emptyIntro: {
    alignItems: 'center',
    marginBottom: 32,
  },
  emptyTitle: {
    color: COLORS.textPrimary,
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 12,
  },
  emptySubtitle: {
    color: COLORS.textMuted,
    fontSize: 14,
    textAlign: 'center',
    marginTop: 4,
  },
  messagesList: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingBottom: 24,
  },
  limitBanner: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 16,
    gap: 12,
  },
  limitText: {
    color: COLORS.textPrimary,
    fontSize: 14,
    lineHeight: 20,
  },
  upgradeBtn: {
    backgroundColor: COLORS.bgCard,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.5)',
  },
  upgradeBtnText: {
    color: '#F59E0B',
    fontWeight: '700',
    fontSize: 14,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderSubtle,
    backgroundColor: COLORS.bgPrimary,
  },
  input: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
    paddingTop: 12,
    color: COLORS.textPrimary,
    fontSize: 15,
    lineHeight: 22,
    maxHeight: 120,
    minHeight: 48,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 2,
  },
  sendBtnActive: { backgroundColor: COLORS.accentPurple },
  sendBtnInactive: {
    backgroundColor: COLORS.bgCard,
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
  },
  sendBtnPressed: { opacity: 0.75 },
  bottomPad: { height: Platform.OS === 'ios' ? 20 : 8 },
})
