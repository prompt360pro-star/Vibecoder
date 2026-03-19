import { useEffect } from 'react'
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated'
import {
  COLORS,
  getLevelForXp,
  getLevelProgress,
  getXpForNextLevel,
} from '@vibecode/shared'
import Text from '../ui/text'

interface XpBarProps {
  currentXp: number
  style?: StyleProp<ViewStyle>
}

const FILL_COLORS = ['#7C3AED', '#8B5CF6', '#A78BFA'] as const

export default function XpBar({ currentXp, style }: XpBarProps) {
  const levelConfig = getLevelForXp(currentXp)
  const progress = Math.max(0, Math.min(1, getLevelProgress(currentXp) ?? 0))
  const remainingXp = Math.max(0, getXpForNextLevel(currentXp))
  const fill = useSharedValue(0)
  const glowOpacity = useSharedValue(0)

  useEffect(() => {
    fill.value = withTiming(progress, { duration: 1000 })

    if (progress > 0.85) {
      glowOpacity.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 900 }),
          withTiming(0.2, { duration: 900 }),
        ),
        -1,
        true,
      )
      return
    }

    glowOpacity.value = withTiming(0, { duration: 200 })
  }, [fill, glowOpacity, progress])

  const fillStyle = useAnimatedStyle(() => ({
    width: `${fill.value * 100}%` as `${number}%`,
  }))

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }))

  return (
    <View style={[styles.container, style]}>
      <View style={styles.header}>
        <Text style={styles.levelText}>Nível {levelConfig.level}</Text>
        <Text style={styles.titleText}>{levelConfig.title}</Text>
      </View>

      <View style={styles.track}>
        <Animated.View style={[styles.fill, fillStyle]}>
          <LinearGradient
            colors={FILL_COLORS}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.fillGradient}
          />
          <View style={styles.shine} />
        </Animated.View>
        <Animated.View style={[styles.glow, glowStyle]} />
      </View>

      <View style={styles.footer}>
        <Text style={styles.xpText}>
          {currentXp} XP • {Math.round(progress * 100)}%
        </Text>
        <Text style={styles.remainingText}>Faltam {remainingXp} XP</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.bgCard,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
    gap: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    gap: 8,
  },
  levelText: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  titleText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: '500',
  },
  track: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 4,
    overflow: 'hidden',
    position: 'relative',
  },
  fill: {
    height: '100%',
    borderRadius: 4,
    overflow: 'hidden',
  },
  fillGradient: {
    flex: 1,
  },
  shine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '50%',
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  glow: {
    position: 'absolute',
    top: -4,
    right: 0,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#A78BFA',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 6,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  xpText: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
  remainingText: {
    color: COLORS.accentPurple,
    fontSize: 12,
    fontWeight: '600',
  },
})
