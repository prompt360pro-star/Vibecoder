import { useEffect } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated'
import { useFloat } from '../../lib/animations'

interface ViAvatarProps {
  size?: number
  isThinking?: boolean
  isSpeaking?: boolean
  mood?: 'neutral' | 'happy' | 'thinking' | 'excited'
}

type ViMood = NonNullable<ViAvatarProps['mood']>

const EYE_COLORS: Record<ViMood, string> = {
  neutral: '#A78BFA',
  happy: '#34D399',
  excited: '#F59E0B',
  thinking: '#60A5FA',
}

const containerMoodStyles = StyleSheet.create({
  neutral: { backgroundColor: '#131030' },
  happy: { backgroundColor: '#1E1040' },
  excited: { backgroundColor: '#1E1040' },
  thinking: { backgroundColor: '#131030' },
})

const eyeMoodStyles = StyleSheet.create({
  neutral: { backgroundColor: '#A78BFA' },
  happy: { backgroundColor: '#34D399' },
  excited: { backgroundColor: '#F59E0B' },
  thinking: { backgroundColor: '#60A5FA' },
})

export default function ViAvatar({
  size = 56,
  isThinking = false,
  isSpeaking = false,
  mood = 'neutral',
}: ViAvatarProps) {
  const floatStyle = useFloat(3, 2800)
  const eyeScaleY = useSharedValue(1)
  const antennaRotate = useSharedValue(0)
  const thinkScale = useSharedValue(1)

  useEffect(() => {
    let blinkTimer: ReturnType<typeof setTimeout> | undefined
    let isMounted = true

    const scheduleBlink = () => {
      const nextBlink = 3000 + Math.round(Math.random() * 2000)
      blinkTimer = setTimeout(() => {
        if (!isMounted) return
        eyeScaleY.value = withSequence(
          withTiming(0.1, { duration: 80 }),
          withTiming(1, { duration: 80 }),
        )
        scheduleBlink()
      }, nextBlink)
    }

    scheduleBlink()

    return () => {
      isMounted = false
      if (blinkTimer) clearTimeout(blinkTimer)
    }
  }, [eyeScaleY])

  useEffect(() => {
    antennaRotate.value = withRepeat(
      withSequence(
        withTiming(12, { duration: 800 }),
        withTiming(-12, { duration: 800 }),
        withTiming(0, { duration: 400 }),
      ),
      -1,
      true,
    )
  }, [antennaRotate])

  useEffect(() => {
    if (isThinking) {
      thinkScale.value = withRepeat(
        withSequence(
          withTiming(1.08, { duration: 300 }),
          withTiming(0.95, { duration: 300 }),
        ),
        -1,
        true,
      )
      return
    }

    cancelAnimation(thinkScale)
    thinkScale.value = withTiming(1, { duration: 180 })
  }, [isThinking, thinkScale])

  const antennaStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${antennaRotate.value}deg` }],
  }))

  const eyeStyle = useAnimatedStyle(() => ({
    transform: [{ scaleY: eyeScaleY.value }],
  }))

  const thinkStyle = useAnimatedStyle(() => ({
    transform: [{ scale: thinkScale.value }],
  }))

  const outerSizeStyle = { width: size, height: size, borderRadius: size / 2 }
  const bodyStyle = {
    width: size * 0.54,
    height: size * 0.48,
    borderRadius: 6,
  }
  const antennaHeightStyle = { height: size * 0.2 }
  const eyeSizeStyle = {
    width: size * 0.11,
    height: size * 0.11,
    borderRadius: size * 0.055,
  }
  const eyeRowStyle = { gap: size * 0.09 }
  const mouthStyle = {
    width: size * 0.24,
    height: size * 0.06,
    borderRadius: size * 0.03,
  }

  return (
    <Animated.View style={floatStyle}>
      <Animated.View style={thinkStyle}>
        <View style={[styles.container, containerMoodStyles[mood], outerSizeStyle]}>
          <Animated.View style={[styles.antennaWrap, antennaStyle]}>
            <View style={[styles.antenna, antennaHeightStyle]} />
            <View style={styles.antennaDot} />
          </Animated.View>

          <View style={[styles.body, bodyStyle]}>
            <View style={[styles.eyesRow, eyeRowStyle]}>
              <Animated.View style={eyeStyle}>
                <View style={[styles.eye, eyeMoodStyles[mood], eyeSizeStyle]} />
              </Animated.View>
              <Animated.View style={eyeStyle}>
                <View style={[styles.eye, eyeMoodStyles[mood], eyeSizeStyle]} />
              </Animated.View>
            </View>
            <View style={[styles.mouth, mouthStyle]} />
          </View>

          {isSpeaking ? <View style={styles.speakingIndicator} /> : null}
          {isThinking ? <Text style={styles.thinkingBubble}>💭</Text> : null}
        </View>
      </Animated.View>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(139,92,246,0.4)',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 6,
  },
  antennaWrap: {
    position: 'absolute',
    top: 4,
    alignItems: 'center',
  },
  antenna: {
    width: 2,
    backgroundColor: '#A78BFA',
    borderRadius: 1,
  },
  antennaDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#C4B5FD',
    marginTop: -1,
  },
  body: {
    backgroundColor: '#2D2060',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  eyesRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  eye: {
    backgroundColor: EYE_COLORS.neutral,
  },
  mouth: {
    backgroundColor: '#A78BFA',
    opacity: 0.7,
  },
  speakingIndicator: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: '#0A0A0F',
  },
  thinkingBubble: {
    position: 'absolute',
    top: -8,
    right: -4,
    fontSize: 14,
  },
})
