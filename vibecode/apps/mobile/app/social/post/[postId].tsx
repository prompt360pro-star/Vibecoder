import { useMemo, useState } from 'react'
import {
  ActivityIndicator,
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
import { router, useLocalSearchParams } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useQueryClient } from '@tanstack/react-query'
import { COLORS } from '@vibecode/shared'
import * as Haptics from 'expo-haptics'
import { PostCard } from '../../../components/social/post-card'
import Text from '../../../components/ui/text'
import { useCreateComment, useComments, type SocialCommentType, type SocialPostType } from '../../../hooks/use-social'
import { useUser } from '../../../hooks/use-user'

function timeSince(dateString: string) {
  const date = new Date(dateString)
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000)

  let interval = seconds / 31536000
  if (interval > 1) return `${Math.floor(interval)}a`
  interval = seconds / 2592000
  if (interval > 1) return `${Math.floor(interval)}m`
  interval = seconds / 86400
  if (interval > 1) return `${Math.floor(interval)}d`
  interval = seconds / 3600
  if (interval > 1) return `${Math.floor(interval)}h`
  interval = seconds / 60
  if (interval > 1) return `${Math.floor(interval)}min`
  return `${Math.floor(seconds)}s`
}

export default function PostCommentsScreen() {
  const { postId } = useLocalSearchParams<{ postId: string }>()
  const queryClient = useQueryClient()
  const { user } = useUser()
  const { data: comments = [], isLoading } = useComments(postId)
  const createComment = useCreateComment(postId)
  const [content, setContent] = useState('')
  const [optimisticComments, setOptimisticComments] = useState<SocialCommentType[]>([])

  const originalPost = useMemo(() => {
    const feedQueries = queryClient.getQueriesData<{ pages: Array<{ data: SocialPostType[] }> }>({
      queryKey: ['social', 'feed'],
    })

    for (const [, data] of feedQueries) {
      const match = data?.pages.flatMap((page) => page.data).find((post) => post.id === postId)
      if (match) {
        return match
      }
    }

    return null
  }, [postId, queryClient])

  const mergedComments = [...comments, ...optimisticComments]

  const handleSubmit = async () => {
    const trimmed = content.trim()
    if (!trimmed || !postId || !user) {
      return
    }

    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)

    const optimisticComment: SocialCommentType = {
      id: `optimistic-${Date.now()}`,
      userId: user.id,
      content: trimmed,
      createdAt: new Date().toISOString(),
      user: {
        name: user.name,
        username: user.username,
        avatarUrl: user.avatarUrl,
      },
    }

    setOptimisticComments((current) => [...current, optimisticComment])
    setContent('')

    try {
      const createdComment = await createComment.mutateAsync(trimmed)
      setOptimisticComments((current) => current.filter((item) => item.id !== optimisticComment.id))
      queryClient.setQueryData<SocialCommentType[]>(['social', 'comments', postId], (current = []) => [
        ...current,
        createdComment,
      ])
    } catch {
      setOptimisticComments((current) => current.filter((item) => item.id !== optimisticComment.id))
      Alert.alert('Erro', 'Não foi possível publicar o comentário.')
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 24 : 0}
      >
        <View style={styles.header}>
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
              router.back()
            }}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={22} color={COLORS.textPrimary} />
          </Pressable>
          <Text style={styles.headerTitle}>Comentários</Text>
          <View style={styles.commentBadge}>
            <Text style={styles.commentBadgeText}>{mergedComments.length}</Text>
          </View>
        </View>

        {isLoading ? (
          <View style={styles.loadingState}>
            <ActivityIndicator color={COLORS.accentPurple} />
          </View>
        ) : (
          <FlatList
            data={mergedComments}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.commentRow}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{(item.user.name?.charAt(0) || 'U').toUpperCase()}</Text>
                </View>
                <View style={styles.commentBody}>
                  <View style={styles.commentMetaRow}>
                    <Text style={styles.commentName}>{item.user.name ?? 'Coder'}</Text>
                    <Text style={styles.commentMeta}>@{item.user.username ?? 'vibecode'} • {timeSince(item.createdAt)}</Text>
                  </View>
                  <Text style={styles.commentContent}>{item.content}</Text>
                </View>
              </View>
            )}
            contentContainerStyle={styles.listContent}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            ListHeaderComponent={originalPost ? <PostCard post={originalPost} readOnly /> : null}
            ListEmptyComponent={
              <Text style={styles.emptyState}>Sê o primeiro a comentar! 💬</Text>
            }
            showsVerticalScrollIndicator={false}
          />
        )}

        <View style={styles.inputBar}>
          <TextInput
            value={content}
            onChangeText={setContent}
            placeholder="Adiciona um comentário..."
            placeholderTextColor={COLORS.textMuted}
            style={styles.input}
            multiline
          />
          <Pressable
            onPress={handleSubmit}
            disabled={!content.trim() || createComment.isPending}
            style={[
              styles.sendButton,
              content.trim() ? styles.sendButtonActive : styles.sendButtonDisabled,
            ]}
          >
            <Ionicons name="arrow-forward" size={18} color={COLORS.textPrimary} />
          </Pressable>
        </View>
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
  },
  backButton: { width: 40, height: 40, justifyContent: 'center' },
  headerTitle: { color: COLORS.textPrimary, fontSize: 18, fontWeight: '700' },
  commentBadge: {
    minWidth: 36,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: COLORS.purpleAlpha10,
    alignItems: 'center',
  },
  commentBadgeText: { color: COLORS.accentPurple, fontSize: 12, fontWeight: '700' },
  loadingState: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContent: { padding: 16, paddingBottom: 24 },
  commentRow: { flexDirection: 'row', gap: 12, paddingVertical: 12 },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.bgElevated,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: { color: COLORS.accentPurple, fontSize: 14, fontWeight: '700' },
  commentBody: { flex: 1, gap: 6 },
  commentMetaRow: { gap: 2 },
  commentName: { color: COLORS.textPrimary, fontSize: 14, fontWeight: '700' },
  commentMeta: { color: COLORS.textMuted, fontSize: 12 },
  commentContent: { color: COLORS.textSecondary, fontSize: 15, lineHeight: 22 },
  separator: { height: 1, backgroundColor: COLORS.borderSubtle },
  emptyState: { color: COLORS.textMuted, fontSize: 14, textAlign: 'center', paddingVertical: 40 },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderSubtle,
    backgroundColor: COLORS.bgPrimary,
  },
  input: {
    flex: 1,
    minHeight: 48,
    maxHeight: 120,
    borderRadius: 16,
    backgroundColor: COLORS.bgCard,
    color: COLORS.textPrimary,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonActive: { backgroundColor: COLORS.accentPurple },
  sendButtonDisabled: { backgroundColor: COLORS.bgElevated },
})
