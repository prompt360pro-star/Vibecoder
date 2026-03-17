import { useEffect, useRef } from 'react'
import { View, StyleSheet, Animated } from 'react-native'
import Text from '../ui/text'
import Button from '../ui/button'
import { COLORS } from '@vibecode/shared'
import type { StoryContent } from '@vibecode/shared'

interface PhaseStoryProps {
  content: StoryContent
  onContinue: () => void
}

export default function PhaseStory({ content, onContinue }: PhaseStoryProps) {
  const scaleAnim = useRef(new Animated.Value(0.5)).current
  const opacityAnim = useRef(new Animated.Value(0)).current
  const bubbleAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 40,
        friction: 7,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start()

    setTimeout(() => {
      Animated.spring(bubbleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 80,
        friction: 8,
      }).start()
    }, 300)
  }, [scaleAnim, opacityAnim, bubbleAnim])

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Animated.Text
          style={[styles.emoji, { transform: [{ scale: scaleAnim }], opacity: opacityAnim }]}
        >
          {content.emoji}
        </Animated.Text>

        <Animated.View
          style={[
            styles.bubble,
            {
              opacity: bubbleAnim,
              transform: [{ translateY: bubbleAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }],
            },
          ]}
        >
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
