import { useEffect, useRef } from 'react'
import { View, StyleSheet, Animated } from 'react-native'
import Text from '../ui/text'
import { COLORS } from '@vibecode/shared'

export default function ViTypingIndicator() {
  const dot1 = useRef(new Animated.Value(0)).current
  const dot2 = useRef(new Animated.Value(0)).current
  const dot3 = useRef(new Animated.Value(0)).current

  useEffect(() => {
    const animateDot = (dot: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, { toValue: 1, duration: 350, useNativeDriver: true }),
          Animated.timing(dot, { toValue: 0, duration: 350, useNativeDriver: true }),
          Animated.delay(700 - delay),
        ])
      )

    const a1 = animateDot(dot1, 0)
    const a2 = animateDot(dot2, 200)
    const a3 = animateDot(dot3, 400)

    a1.start()
    a2.start()
    a3.start()

    return () => {
      a1.stop()
      a2.stop()
      a3.stop()
    }
  }, [dot1, dot2, dot3])

  const dotStyle = (anim: Animated.Value) => ({
    opacity: anim.interpolate({ inputRange: [0, 1], outputRange: [0.3, 1] }),
    transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [0, -4] }) }],
  })

  return (
    <View style={styles.wrapper}>
      <Text style={styles.viLabel}>🤖 Vi:</Text>
      <View style={styles.bubble}>
        <View style={styles.dotsRow}>
          <Animated.Text style={[styles.dot, dotStyle(dot1)]}>●</Animated.Text>
          <Animated.Text style={[styles.dot, dotStyle(dot2)]}>●</Animated.Text>
          <Animated.Text style={[styles.dot, dotStyle(dot3)]}>●</Animated.Text>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  wrapper: {
    alignSelf: 'flex-start',
    marginVertical: 6,
    alignItems: 'flex-start',
  },
  viLabel: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 4,
    marginLeft: 4,
  },
  bubble: {
    backgroundColor: COLORS.bgCard,
    borderRadius: 16,
    borderTopLeftRadius: 4,
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  dot: {
    color: COLORS.textMuted,
    fontSize: 14,
  },
})
