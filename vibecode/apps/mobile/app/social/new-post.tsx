import React, { useState } from 'react'
import { View, StyleSheet, TextInput, Pressable, KeyboardAvoidingView, Platform, ScrollView, Alert, ActivityIndicator } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import Text from '../../components/ui/text'
import { COLORS } from '@vibecode/shared'
import { useCreatePost } from '../../hooks/use-social'

type PostTypeOption = { id: 'ACHIEVEMENT' | 'PROMPT' | 'HELP' | 'GENERAL', label: string, emoji: string }

const POST_TYPES: PostTypeOption[] = [
  { id: 'GENERAL', label: 'Geral', emoji: '💬' },
  { id: 'ACHIEVEMENT', label: 'Feito', emoji: '🎉' },
  { id: 'PROMPT', label: 'Prompt', emoji: '💡' },
  { id: 'HELP', label: 'Help', emoji: '🆘' },
]

const AVAILABLE_TAGS = ['React', 'Next', 'TypeScript', 'API', 'Deploy', 'Tailwind', 'IA', 'Debug', 'UI/UX']

export default function NewPostScreen() {
  const [type, setType] = useState<'ACHIEVEMENT' | 'PROMPT' | 'HELP' | 'GENERAL'>('GENERAL')
  const [content, setContent] = useState('')
  const [showCode, setShowCode] = useState(false)
  const [codeBlock, setCodeBlock] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])

  const createPostMutation = useCreatePost()

  const handleToggleTag = (tag: string) => {
    Haptics.selectionAsync()
    setSelectedTags((prev) => {
      if (prev.includes(tag)) return prev.filter(t => t !== tag)
      if (prev.length >= 5) return prev
      return [...prev, tag]
    })
  }

  const handlePublish = () => {
    if (!content.trim()) return

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)

    createPostMutation.mutate({
      type,
      content: content.trim(),
      codeBlock: showCode ? codeBlock.trim() : undefined,
      tags: selectedTags,
    }, {
      onSuccess: () => {
        router.back()
      },
      onError: (err) => {
        Alert.alert('Erro', 'Não foi possível publicar. Tenta novamente.')
      }
    })
  }

  const isPublishEnabled = content.trim().length > 0 && !createPostMutation.isPending

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable
            onPress={() => {
              Haptics.selectionAsync()
              router.back()
            }}
            style={styles.headerBtn}
          >
             <Ionicons name="close" size={24} color={COLORS.textPrimary} />
          </Pressable>
          <Text style={styles.headerTitle}>NOVO POST</Text>
          <Pressable 
             onPress={handlePublish} 
             disabled={!isPublishEnabled}
             style={[styles.publishBtn, !isPublishEnabled && styles.publishBtnDisabled]}
          >
            {createPostMutation.isPending ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <Text style={[styles.publishBtnText, !isPublishEnabled && styles.publishBtnTextDisabled]}>
                Publicar
              </Text>
            )}
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          
          {/* Post Type Selector */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.typeSelectorRow}>
            {POST_TYPES.map((pt) => {
              const isActive = type === pt.id
              return (
                <Pressable
                  key={pt.id}
                  style={[styles.typeCard, isActive && styles.typeCardActive]}
                  onPress={() => {
                     Haptics.selectionAsync()
                     setType(pt.id)
                  }}
                >
                  <Text style={[styles.typeEmoji, !isActive && { opacity: 0.5 }]}>{pt.emoji}</Text>
                  <Text style={[styles.typeLabel, isActive && styles.typeLabelActive]}>{pt.label}</Text>
                </Pressable>
              )
            })}
          </ScrollView>

          {/* Text Input */}
          <TextInput
             style={styles.input}
             multiline
             placeholder="Partilha algo com a comunidade..."
             placeholderTextColor={COLORS.textMuted}
             value={content}
             onChangeText={setContent}
             autoFocus
          />

          {/* Add Code Toggle */}
          <View style={styles.actionRow}>
            <Pressable 
               style={styles.actionToggleBtn} 
               onPress={() => {
                 Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                 setShowCode(!showCode)
               }}
            >
              <Ionicons name="code-slash" size={20} color={showCode ? COLORS.accentPurple : COLORS.textMuted} />
              <Text style={[styles.actionToggleText, showCode && { color: COLORS.accentPurple }]}>
                {showCode ? 'Remover Código' : 'Adicionar Código'}
              </Text>
            </Pressable>
          </View>

          {/* Code Block Input */}
          {showCode && (
            <View style={styles.codeInputWrapper}>
              <View style={styles.codeHeader}>
                <Ionicons name="terminal" size={14} color="#A5B4FC" />
                <Text style={styles.codeHeaderText}>Código</Text>
              </View>
              <TextInput
                style={styles.codeInput}
                multiline
                placeholder="Cola o teu código aqui..."
                placeholderTextColor={COLORS.textMuted}
                value={codeBlock}
                onChangeText={setCodeBlock}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
          )}

          {/* Tags */}
          <View style={styles.tagsSection}>
            <Text style={styles.tagsLabel}>Tags (Mínimo 0, Máx 5) {selectedTags.length}/5</Text>
            <View style={styles.tagsWrapper}>
              {AVAILABLE_TAGS.map((tag) => {
                 const isSelected = selectedTags.includes(tag)
                 return (
                   <Pressable 
                     key={tag} 
                     style={[styles.tagChip, isSelected && styles.tagChipActive]}
                     onPress={() => handleToggleTag(tag)}
                   >
                     <Text style={[styles.tagText, isSelected && styles.tagTextActive]}>
                       #{tag}
                     </Text>
                   </Pressable>
                 )
              })}
            </View>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bgPrimary },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: COLORS.borderSubtle,
  },
  headerBtn: { width: 40, height: 40, justifyContent: 'center' },
  headerTitle: { color: COLORS.textPrimary, fontSize: 13, fontWeight: '800', letterSpacing: 1.5 },
  publishBtn: { backgroundColor: COLORS.accentPurple, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 16 },
  publishBtnDisabled: { backgroundColor: COLORS.bgElevated },
  publishBtnText: { color: '#FFF', fontSize: 13, fontWeight: '700' },
  publishBtnTextDisabled: { color: COLORS.textMuted },

  scrollContent: { padding: 16, paddingBottom: 40 },

  typeSelectorRow: { gap: 10, marginBottom: 20 },
  typeCard: {
    backgroundColor: COLORS.bgCard, borderRadius: 12,
    borderWidth: 1, borderColor: 'transparent',
    paddingHorizontal: 14, paddingVertical: 10,
    alignItems: 'center', minWidth: 80,
  },
  typeCardActive: {
    borderColor: COLORS.accentPurple, backgroundColor: COLORS.purpleAlpha10,
  },
  typeEmoji: { fontSize: 22, marginBottom: 4 },
  typeLabel: { color: COLORS.textMuted, fontSize: 11, fontWeight: '600' },
  typeLabelActive: { color: COLORS.accentPurple },

  input: {
    backgroundColor: COLORS.bgCard,
    borderRadius: 12,
    padding: 16,
    color: COLORS.textPrimary,
    fontSize: 16,
    minHeight: 120,
    textAlignVertical: 'top',
    marginBottom: 16,
  },

  actionRow: { flexDirection: 'row', marginBottom: 16 },
  actionToggleBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 6, paddingHorizontal: 8, backgroundColor: COLORS.bgCard, borderRadius: 8 },
  actionToggleText: { color: COLORS.textMuted, fontSize: 13, fontWeight: '600' },

  codeInputWrapper: { backgroundColor: '#0A0A0F', borderRadius: 12, borderWidth: 1, borderColor: COLORS.borderSubtle, marginBottom: 20, overflow: 'hidden' },
  codeHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#11111A', paddingHorizontal: 12, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: COLORS.borderSubtle },
  codeHeaderText: { color: '#A5B4FC', fontSize: 12, fontWeight: '600', fontFamily: 'monospace' },
  codeInput: { color: '#A5B4FC', fontFamily: 'monospace', fontSize: 13, minHeight: 120, textAlignVertical: 'top', padding: 16 },

  tagsSection: { marginTop: 10 },
  tagsLabel: { color: COLORS.textMuted, fontSize: 12, fontWeight: '600', marginBottom: 10 },
  tagsWrapper: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tagChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, backgroundColor: COLORS.bgCard, borderWidth: 1, borderColor: COLORS.borderSubtle },
  tagChipActive: { backgroundColor: COLORS.purpleAlpha10, borderColor: COLORS.accentPurple },
  tagText: { color: COLORS.textSecondary, fontSize: 13 },
  tagTextActive: { color: COLORS.accentPurple, fontWeight: '600' },
})
