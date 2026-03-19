import { useEffect } from 'react'
import { StyleSheet, View } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import * as Haptics from 'expo-haptics'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated'
import Text from '../ui/text'
import { useShimmer } from '../../lib/animations'

interface AchievementToastProps {
  visible: boolean
  achievement: {
    name: string
    emoji: string
    xpReward: number
  }
  onClose: () => void
}

const TOAST_GRADIENT = ['#1C1A2E', '#1A1525'] as const
const SHIMMER_COLORS = ['transparent', 'rgba(251,191,36,0.12)', 'transparent'] as const

export default function AchievementToast({
  visible,
  achievement,
  onClose,
}: AchievementToastProps) {
  const translateY = useSharedValue(-140)
  const scale = useSharedValue(0.85)
  const opacity = useSharedValue(0)
  const shimmerStyle = useShimmer(360, 1600)

  useEffect(() => {
    if (!visible) {
      translateY.value = -140
      scale.value = 0.85
      opacity.value = 0
      return
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    translateY.value = withSpring(0, { damping: 16, stiffness: 180 })
    scale.value = withSpring(1, { damping: 14, stiffness: 220 })
    opacity.value = withTiming(1, { duration: 200 })

    let closeTimer: ReturnType<typeof setTimeout> | undefined
    const dismissTimer = setTimeout(() => {
      translateY.value = withTiming(-140, { duration: 350 })
      scale.value = withTiming(0.88, { duration: 350 })
      opacity.value = withTiming(0, { duration: 350 })
      closeTimer = setTimeout(onClose, 360)
    }, 3500)

    return () => {
      clearTimeout(dismissTimer)
      if (closeTimer) clearTimeout(closeTimer)
    }
  }, [onClose, opacity, scale, translateY, visible])

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }, { scale: scale.value }],
  }))

  if (!visible) return null

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <LinearGradient colors={TOAST_GRADIENT} style={styles.card}>
        <Animated.View style={[styles.shimmer, shimmerStyle]}>
          <LinearGradient
            colors={SHIMMER_COLORS}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.shimmerGradient}
          />
        </Animated.View>

        <View style={styles.emojiContainer}>
          <Text style={styles.emoji}>{achievement.emoji}</Text>
        </View>

        <View style={styles.info}>
          <Text style={styles.title}>Unlock: {achievement.name}</Text>
          <Text style={styles.xp}>+{achievement.xpReward} XP desbloqueados</Text>
        </View>
      </LinearGradient>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 40,
    left: 16,
    right: 16,
    zIndex: 9999,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(251,191,36,0.35)',
    overflow: 'hidden',
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 16,
  },
  shimmer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: -120,
    width: 100,
    transform: [{ skewX: '-15deg' }],
  },
  shimmerGradient: {
    flex: 1,
  },
  emojiContainer: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: 'rgba(251,191,36,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emoji: {
    fontSize: 28,
  },
  info: {
    flex: 1,
    gap: 4,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  xp: {
    color: '#FBBF24',
    fontSize: 13,
    fontWeight: '700',
  },
})
