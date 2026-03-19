import { useEffect } from 'react'
import { StyleSheet, View } from 'react-native'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated'
import { COLORS } from '@vibecode/shared'
import { MOTION } from '../../lib/animations'
import ViAvatar from './vi-avatar'

interface TypingDotProps {
  delay: number
}

function TypingDot({ delay }: TypingDotProps) {
  const translateY = useSharedValue(0)
  const opacity = useSharedValue(0.4)

  useEffect(() => {
    translateY.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(-7, { duration: 280, easing: MOTION.easing.decelerate }),
          withTiming(0, { duration: 280, easing: MOTION.easing.accelerate }),
        ),
        -1,
      ),
    )

    opacity.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 280 }),
          withTiming(0.4, { duration: 280 }),
        ),
        -1,
      ),
    )
  }, [delay, opacity, translateY])

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }))

  return <Animated.View style={[styles.dot, animatedStyle]} />
}

export default function ViTypingIndicator() {
  return (
    <View style={styles.wrapper}>
      <ViAvatar size={32} isThinking />
      <View style={styles.bubble}>
        <View style={styles.dotsRow}>
          <TypingDot delay={0} />
          <TypingDot delay={150} />
          <TypingDot delay={300} />
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    alignSelf: 'flex-start',
    marginVertical: 6,
    maxWidth: '85%',
    gap: 8,
  },
  bubble: {
    backgroundColor: COLORS.bgCard,
    borderRadius: 20,
    borderBottomLeftRadius: 4,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
    justifyContent: 'center',
    height: 48,
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.textMuted,
  },
})
