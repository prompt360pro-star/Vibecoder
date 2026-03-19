import { useEffect, useState } from 'react'
import { Pressable, StyleSheet, View } from 'react-native'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import { Image } from 'expo-image'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated'
import { COLORS } from '@vibecode/shared'
import type { SocialPostType } from '../../hooks/use-social'
import { useLikePost } from '../../hooks/use-social'
import Text from '../ui/text'

interface PostCardProps {
  post: SocialPostType
  readOnly?: boolean
}

interface HeartParticleProps {
  destX: number
  destY: number
  delay: number
}

const PARTICLE_ANGLES = [45, 135, 225, 315] as const
const PARTICLE_DISTANCE = 30

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

function HeartParticle({ destX, destY, delay }: HeartParticleProps) {
  const translateX = useSharedValue(0)
  const translateY = useSharedValue(0)
  const opacity = useSharedValue(0)
  const scale = useSharedValue(0.4)

  useEffect(() => {
    opacity.value = withDelay(
      delay,
      withSequence(
        withTiming(1, { duration: 150 }),
        withTiming(0, { duration: 400 }),
      ),
    )
    scale.value = withDelay(
      delay,
      withSequence(
        withSpring(1, { damping: 10, stiffness: 300 }),
        withTiming(0.4, { duration: 400 }),
      ),
    )
    translateX.value = withDelay(delay, withTiming(destX, { duration: 500 }))
    translateY.value = withDelay(delay, withTiming(destY, { duration: 500 }))
  }, [delay, destX, destY, opacity, scale, translateX, translateY])

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }))

  return <Animated.Text style={[styles.heartParticle, animatedStyle]}>❤️</Animated.Text>
}

function LikeButton({
  post,
  onLike,
}: {
  post: SocialPostType
  onLike: () => void
}) {
  const heartScale = useSharedValue(1)
  const [showParticles, setShowParticles] = useState(false)

  const handleLike = () => {
    heartScale.value = withSequence(
      withSpring(1.6, { damping: 5, stiffness: 300 }),
      withSpring(1, { damping: 12, stiffness: 200 }),
    )
    setShowParticles(true)
    setTimeout(() => setShowParticles(false), 650)
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    onLike()
  }

  const heartStyle = useAnimatedStyle(() => ({
    transform: [{ scale: heartScale.value }],
  }))

  return (
    <Pressable style={styles.actionButton} onPress={handleLike}>
      <View style={styles.likeButtonWrap}>
        {showParticles &&
          PARTICLE_ANGLES.map((angle, index) => (
            <HeartParticle
              key={angle}
              destX={Math.round(Math.cos((angle * Math.PI) / 180) * PARTICLE_DISTANCE)}
              destY={Math.round(Math.sin((angle * Math.PI) / 180) * PARTICLE_DISTANCE)}
              delay={index * 30}
            />
          ))}
        <Animated.View style={heartStyle}>
          <Text style={[styles.actionEmoji, post.isLikedByMe && styles.actionEmojiActive]}>👏</Text>
        </Animated.View>
      </View>
      <Text style={[styles.actionCount, post.isLikedByMe && styles.actionCountActive]}>
        {post.likesCount}
      </Text>
    </Pressable>
  )
}

export function PostCard({ post, readOnly = false }: PostCardProps) {
  const likeMutation = useLikePost()
  const isAchievement = post.type === 'ACHIEVEMENT'
  const isHelp = post.type === 'HELP'
  const isPrompt = post.type === 'PROMPT'

  const handleLike = () => {
    if (likeMutation.isPending) return
    likeMutation.mutate(post.id)
  }

  const handleCommentsPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    router.push(`/social/post/${post.id}` as never)
  }

  return (
    <View style={[styles.card, isHelp && styles.cardHelp]}>
      <View style={styles.header}>
        {post.user.avatarUrl ? (
          <Image source={{ uri: post.user.avatarUrl }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarInitial}>{(post.user.name?.charAt(0) || 'U').toUpperCase()}</Text>
          </View>
        )}

        <View style={styles.headerInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.name}>{post.user.name}</Text>
            <View style={styles.levelBadge}>
              <Text style={styles.levelText}>Lv.{post.user.currentLevel}</Text>
            </View>
          </View>
          <Text style={styles.username}>
            {post.user.username ? `@${post.user.username}` : ''} • {timeSince(post.createdAt)}
          </Text>
        </View>

        {isAchievement ? <Text style={styles.typeEmoji}>🎉</Text> : null}
        {isPrompt ? <Text style={styles.typeEmoji}>💡</Text> : null}
        {isHelp ? <Text style={styles.typeEmoji}>🆘</Text> : null}
      </View>

      <Text style={styles.content}>{post.content}</Text>

      {post.codeBlock ? (
        <View style={styles.codeContainer}>
          <Text style={styles.codeText}>{post.codeBlock}</Text>
        </View>
      ) : null}

      {post.tags.length > 0 ? (
        <View style={styles.tagsContainer}>
          {post.tags.map((tag) => (
            <View key={tag} style={styles.tag}>
              <Text style={styles.tagText}>#{tag}</Text>
            </View>
          ))}
        </View>
      ) : null}

      {!readOnly ? (
        <View style={styles.actions}>
          <LikeButton post={post} onLike={handleLike} />

          <Pressable
            style={({ pressed }) => [styles.actionButton, pressed && styles.pressed]}
            onPress={handleCommentsPress}
          >
            <Ionicons name="chatbubble-outline" size={18} color={COLORS.textMuted} />
            <Text style={styles.actionCount}>{post.commentsCount}</Text>
          </Pressable>

          <View style={styles.actionsSpacer} />

          {isHelp ? (
            <Pressable style={styles.helpButton}>
              <Text style={styles.helpButtonText}>🤝 EU AJUDO!</Text>
            </Pressable>
          ) : null}

          {isPrompt ? (
            <Pressable style={styles.copyButton}>
              <Ionicons name="copy-outline" size={16} color={COLORS.textSecondary} />
              <Text style={styles.copyButtonText}>Copiar</Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    position: 'relative',
    backgroundColor: COLORS.bgCard,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  cardHelp: {
    borderLeftWidth: 4,
    borderLeftColor: COLORS.accentRed,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: { width: 36, height: 36, borderRadius: 18 },
  avatarPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.bgElevated,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitial: { color: COLORS.accentPurple, fontSize: 16, fontWeight: '700' },
  headerInfo: { flex: 1, marginLeft: 10, justifyContent: 'center' },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  name: { color: COLORS.textPrimary, fontSize: 15, fontWeight: '700' },
  levelBadge: {
    backgroundColor: COLORS.purpleAlpha10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  levelText: { color: COLORS.accentPurple, fontSize: 10, fontWeight: '800' },
  username: { color: COLORS.textMuted, fontSize: 12, marginTop: 2 },
  typeEmoji: { fontSize: 24 },
  content: { color: COLORS.textSecondary, fontSize: 15, lineHeight: 22, marginBottom: 12 },
  codeContainer: {
    backgroundColor: COLORS.bgCode,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
  },
  codeText: { color: '#A5B4FC', fontFamily: 'monospace', fontSize: 13, lineHeight: 18 },
  tagsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 16 },
  tag: {
    backgroundColor: COLORS.bgElevated,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  tagText: { color: COLORS.accentBlue, fontSize: 12, fontWeight: '600' },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderSubtle,
    paddingTop: 12,
  },
  actionButton: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  likeButtonWrap: {
    position: 'relative',
    width: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pressed: { opacity: 0.6 },
  actionEmoji: { fontSize: 18, opacity: 0.6 },
  actionEmojiActive: { opacity: 1 },
  actionCount: { color: COLORS.textMuted, fontSize: 13, fontWeight: '600' },
  actionCountActive: { color: COLORS.accentPurple },
  actionsSpacer: { flex: 1 },
  helpButton: {
    backgroundColor: COLORS.redAlpha10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  helpButtonText: { color: COLORS.accentRed, fontSize: 12, fontWeight: '800' },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.bgElevated,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  copyButtonText: { color: COLORS.textSecondary, fontSize: 12, fontWeight: '600' },
  heartParticle: {
    position: 'absolute',
    fontSize: 12,
  },
})
