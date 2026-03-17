import React from 'react'
import { View, StyleSheet, Pressable, Image } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import Text from '../ui/text'
import { COLORS } from '@vibecode/shared'
import type { SocialPostType } from '../../hooks/use-social'
import { useLikePost } from '../../hooks/use-social'

interface PostCardProps {
  post: SocialPostType
}

function timeSince(dateString: string) {
  const date = new Date(dateString)
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000)

  let interval = seconds / 31536000
  if (interval > 1) return Math.floor(interval) + 'a'
  interval = seconds / 2592000
  if (interval > 1) return Math.floor(interval) + 'm'
  interval = seconds / 86400
  if (interval > 1) return Math.floor(interval) + 'd'
  interval = seconds / 3600
  if (interval > 1) return Math.floor(interval) + 'h'
  interval = seconds / 60
  if (interval > 1) return Math.floor(interval) + 'min'
  return Math.floor(seconds) + 's'
}

export function PostCard({ post }: PostCardProps) {
  const likeMutation = useLikePost()

  const handleLike = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    likeMutation.mutate(post.id)
  }

  // Estilos condicionados pelo tipo de post
  const isAchievement = post.type === 'ACHIEVEMENT'
  const isHelp = post.type === 'HELP'
  const isPrompt = post.type === 'PROMPT'

  return (
    <View style={[styles.card, isHelp && styles.cardHelp]}>
      {/* Header */}
      <View style={styles.header}>
        {post.user.avatarUrl ? (
          <Image source={{ uri: post.user.avatarUrl }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
             <Text style={styles.avatarInitial}>{(post.user.name?.charAt(0) || 'U').toUpperCase()}</Text>
          </View>
        )}
        <View style={styles.headerInfo}>
           <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
             <Text style={styles.name}>{post.user.name}</Text>
             <View style={styles.levelBadge}>
               <Text style={styles.levelText}>Lv.{post.user.currentLevel}</Text>
             </View>
           </View>
           <Text style={styles.username}>
             {post.user.username ? `@${post.user.username}` : ''} • {timeSince(post.createdAt)}
           </Text>
        </View>
        {isAchievement && <Text style={{ fontSize: 24 }}>🎉</Text>}
        {isPrompt && <Text style={{ fontSize: 24 }}>💡</Text>}
        {isHelp && <Text style={{ fontSize: 24 }}>🆘</Text>}
      </View>

      {/* Content */}
      <Text style={styles.content}>{post.content}</Text>

      {/* Code Block */}
      {post.codeBlock && (
        <View style={styles.codeContainer}>
          <Text style={styles.codeText}>{post.codeBlock}</Text>
        </View>
      )}

      {/* Tags */}
      {post.tags && post.tags.length > 0 && (
        <View style={styles.tagsContainer}>
          {post.tags.map((tag, i) => (
             <View key={i} style={styles.tag}>
                <Text style={styles.tagText}>#{tag}</Text>
             </View>
          ))}
        </View>
      )}

      {/* Actions */}
      <View style={styles.actions}>
        <Pressable 
           style={({pressed}) => [styles.actionBtn, pressed && { opacity: 0.6 }]}
           onPress={handleLike}
        >
          <Text style={[styles.actionEmoji, post.isLikedByMe && styles.actionEmojiActive]}>
            👏
          </Text>
          <Text style={[styles.actionCount, post.isLikedByMe && styles.actionCountActive]}>
            {post.likesCount}
          </Text>
        </Pressable>

        <Pressable style={({pressed}) => [styles.actionBtn, pressed && { opacity: 0.6 }]}>
          <Ionicons name="chatbubble-outline" size={18} color={COLORS.textMuted} />
          <Text style={styles.actionCount}>{post.commentsCount}</Text>
        </Pressable>

        <View style={{ flex: 1 }} />

        {isHelp && (
           <Pressable style={styles.helpBtn}>
             <Text style={styles.helpBtnText}>🤝 EU AJUDO!</Text>
           </Pressable>
        )}
        {isPrompt && (
           <Pressable style={styles.copyBtn}>
             <Ionicons name="copy-outline" size={16} color={COLORS.textSecondary} />
             <Text style={styles.copyBtnText}>Copiar</Text>
           </Pressable>
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.bgCard,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  cardHelp: {
    borderLeftWidth: 4,
    borderLeftColor: COLORS.accentRed,
  },
  
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  avatar: { width: 36, height: 36, borderRadius: 18 },
  avatarPlaceholder: { 
    width: 36, height: 36, borderRadius: 18, 
    backgroundColor: COLORS.bgElevated, 
    justifyContent: 'center', alignItems: 'center' 
  },
  avatarInitial: { color: COLORS.accentPurple, fontSize: 16, fontWeight: '700' },
  headerInfo: { flex: 1, marginLeft: 10, justifyContent: 'center' },
  name: { color: COLORS.textPrimary, fontSize: 15, fontWeight: '700' },
  levelBadge: { backgroundColor: COLORS.purpleAlpha10, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8 },
  levelText: { color: COLORS.accentPurple, fontSize: 10, fontWeight: '800' },
  username: { color: COLORS.textMuted, fontSize: 12, marginTop: 2 },
  
  content: { color: COLORS.textSecondary, fontSize: 15, lineHeight: 22, marginBottom: 12 },

  codeContainer: {
    backgroundColor: '#0A0A0F',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.borderSubtle
  },
  codeText: { color: '#A5B4FC', fontFamily: 'monospace', fontSize: 13, lineHeight: 18 },

  tagsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 16 },
  tag: { backgroundColor: COLORS.bgElevated, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  tagText: { color: COLORS.accentBlue, fontSize: 12, fontWeight: '600' },

  actions: { flexDirection: 'row', alignItems: 'center', gap: 16, borderTopWidth: 1, borderTopColor: COLORS.borderSubtle, paddingTop: 12 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  actionEmoji: { fontSize: 18, opacity: 0.6 },
  actionEmojiActive: { opacity: 1 },
  actionCount: { color: COLORS.textMuted, fontSize: 13, fontWeight: '600' },
  actionCountActive: { color: COLORS.accentPurple },

  helpBtn: { backgroundColor: COLORS.redAlpha10, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  helpBtnText: { color: COLORS.accentRed, fontSize: 12, fontWeight: '800' },
  
  copyBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: COLORS.bgElevated, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  copyBtnText: { color: COLORS.textSecondary, fontSize: 12, fontWeight: '600' }
})
