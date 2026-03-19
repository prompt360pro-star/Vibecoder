import { useEffect, useMemo } from 'react'
import { StyleSheet, View } from 'react-native'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated'

interface FallingPieceProps {
  x: number
  color: string
  delay: number
  duration: number
}

const CONFETTI_COLORS = [
  '#8B5CF6',
  '#A78BFA',
  '#F59E0B',
  '#10B981',
  '#3B82F6',
  '#EC4899',
] as const

const colorStyles = StyleSheet.create({
  purple: { backgroundColor: '#8B5CF6' },
  lavender: { backgroundColor: '#A78BFA' },
  amber: { backgroundColor: '#F59E0B' },
  green: { backgroundColor: '#10B981' },
  blue: { backgroundColor: '#3B82F6' },
  pink: { backgroundColor: '#EC4899' },
})

function getColorStyle(color: string) {
  switch (color) {
    case '#8B5CF6':
      return colorStyles.purple
    case '#A78BFA':
      return colorStyles.lavender
    case '#F59E0B':
      return colorStyles.amber
    case '#10B981':
      return colorStyles.green
    case '#3B82F6':
      return colorStyles.blue
    default:
      return colorStyles.pink
  }
}

export function FallingPiece({ x, color, delay, duration }: FallingPieceProps) {
  const translateY = useSharedValue(-20)
  const opacity = useSharedValue(0)
  const rotate = useSharedValue(0)

  useEffect(() => {
    translateY.value = withDelay(delay, withTiming(700, { duration }))
    opacity.value = withDelay(
      delay,
      withSequence(
        withTiming(1, { duration: 100 }),
        withTiming(1, { duration: Math.max(100, duration - 500) }),
        withTiming(0, { duration: 400 }),
      ),
    )
    rotate.value = withDelay(
      delay,
      withRepeat(withTiming(360, { duration: duration / 3 }), -1),
    )
  }, [delay, duration, opacity, rotate, translateY])

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { translateX: x },
      { translateY: translateY.value },
      { rotate: `${rotate.value}deg` },
    ],
  }))

  return <Animated.View style={[styles.piece, getColorStyle(color), animatedStyle]} />
}

interface ConfettiBurstProps {
  count?: number
}

export function ConfettiBurst({ count = 40 }: ConfettiBurstProps) {
  const pieces = useMemo(
    () =>
      Array.from({ length: count }, (_, index) => ({
        x: (index / count) * 360,
        color: CONFETTI_COLORS[index % CONFETTI_COLORS.length] ?? CONFETTI_COLORS[0],
        delay: Math.random() * 500,
        duration: 1600 + Math.random() * 1200,
      })),
    [count],
  )

  return (
    <View style={styles.overlay} pointerEvents="none">
      {pieces.map((piece, index) => (
        <FallingPiece
          key={`${piece.color}-${index}`}
          x={piece.x}
          color={piece.color}
          delay={piece.delay}
          duration={piece.duration}
        />
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  piece: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 8,
    height: 12,
    borderRadius: 2,
  },
})
