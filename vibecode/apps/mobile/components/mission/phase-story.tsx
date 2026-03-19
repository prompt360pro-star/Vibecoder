import { useEffect } from 'react'
import { View, StyleSheet } from 'react-native'
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from 'react-native-reanimated'
import Text from '../ui/text'
import Button from '../ui/button'
import { COLORS } from '@vibecode/shared'
import type { StoryContent } from '@vibecode/shared'

interface PhaseStoryProps {
  content: StoryContent
  onContinue: () => void
}

export default function PhaseStory({ content, onContinue }: PhaseStoryProps) {
  const scale = useSharedValue(0.5)
  const opacity = useSharedValue(0)
  const bubble = useSharedValue(0)

  useEffect(() => {
    scale.value = withSpring(1, { damping: 10, stiffness: 140 })
    opacity.value = withTiming(1, { duration: 400 })
    bubble.value = withDelay(300, withSpring(1, { damping: 10, stiffness: 180 }))
  }, [bubble, opacity, scale])

  const emojiStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }))

  const bubbleStyle = useAnimatedStyle(() => ({
    opacity: bubble.value,
    transform: [{ translateY: interpolate(bubble.value, [0, 1], [20, 0]) }],
  }))

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Animated.Text style={[styles.emoji, emojiStyle]}>{content.emoji}</Animated.Text>

        <Animated.View style={[styles.bubble, bubbleStyle]}>
          <View style={styles.bubbleTail} />
          <Text style={styles.narration}>{content.narration}</Text>
          <Text style={styles.viLabel}>— Vi 🤖</Text>
        </Animated.View>
      </View>

      <Button title="CONTINUAR" onPress={onContinue} variant="primary" size="lg" />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 32,
    paddingHorizontal: 4,
  },
  emoji: {
    fontSize: 100,
    textAlign: 'center',
  },
  bubble: {
    backgroundColor: COLORS.bgCard,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(139,92,246,0.3)',
    padding: 24,
    width: '100%',
    position: 'relative',
  },
  bubbleTail: {
    position: 'absolute',
    top: -10,
    left: '50%',
    width: 0,
    height: 0,
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderBottomWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: 'rgba(139,92,246,0.3)',
  },
  narration: {
    color: COLORS.textPrimary,
    fontSize: 17,
    lineHeight: 26,
    textAlign: 'center',
  },
  viLabel: {
    color: COLORS.textMuted,
    fontSize: 13,
    textAlign: 'right',
    marginTop: 12,
    fontStyle: 'italic',
  },
})
