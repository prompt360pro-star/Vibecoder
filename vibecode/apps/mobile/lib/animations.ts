import { useCallback, useEffect } from 'react'
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated'

const ANIMATIONS_DISABLED = process.env.EXPO_PUBLIC_DISABLE_ANIMATIONS === 'true'

function shouldSkip(reducedMotion: boolean): boolean {
  return reducedMotion || ANIMATIONS_DISABLED
}

export const MOTION = {
  duration: {
    instant: 100,
    fast: 200,
    normal: 300,
    slow: 500,
    verySlow: 800,
  },
  spring: {
    gentle: { damping: 20, stiffness: 120, mass: 1 },
    bouncy: { damping: 10, stiffness: 160, mass: 1 },
    snappy: { damping: 25, stiffness: 300, mass: 1 },
    wobbly: { damping: 7, stiffness: 120, mass: 1 },
    stiff: { damping: 35, stiffness: 400, mass: 1 },
    floaty: { damping: 14, stiffness: 80, mass: 1 },
  },
  easing: {
    smooth: Easing.bezier(0.25, 0.1, 0.25, 1),
    snappy: Easing.bezier(0.2, 0, 0, 1),
    decelerate: Easing.bezier(0, 0, 0.2, 1),
    accelerate: Easing.bezier(0.4, 0, 1, 1),
    linear: Easing.linear,
  },
} as const

export function useFadeSlideIn(delay = 0, fromY = 24, duration = 400) {
  const reducedMotion = useReducedMotion()
  const skip = shouldSkip(reducedMotion)
  const opacity = useSharedValue(skip ? 1 : 0)
  const translateY = useSharedValue(skip ? 0 : fromY)

  useEffect(() => {
    if (skip) {
      return
    }

    opacity.value = withDelay(
      delay,
      withTiming(1, {
        duration,
        easing: MOTION.easing.decelerate,
      }),
    )
    translateY.value = withDelay(delay, withSpring(0, MOTION.spring.gentle))
  }, [delay, duration, opacity, skip, translateY])

  return useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }))
}

export function useScaleIn(delay = 0, fromScale = 0.6) {
  const reducedMotion = useReducedMotion()
  const skip = shouldSkip(reducedMotion)
  const scale = useSharedValue(skip ? 1 : fromScale)
  const opacity = useSharedValue(skip ? 1 : 0)

  useEffect(() => {
    if (skip) {
      return
    }

    opacity.value = withDelay(delay, withTiming(1, { duration: 200 }))
    scale.value = withDelay(delay, withSpring(1, MOTION.spring.bouncy))
  }, [delay, opacity, scale, skip])

  return useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }))
}

export function useStaggerIn(index: number, stagger = 55, fromY = 20) {
  return useFadeSlideIn(index * stagger, fromY)
}

export function usePulse(min = 0.97, max = 1.03, duration = 1400) {
  const reducedMotion = useReducedMotion()
  const scale = useSharedValue(1)

  useEffect(() => {
    if (shouldSkip(reducedMotion)) {
      return
    }

    scale.value = withRepeat(
      withSequence(
        withTiming(max, {
          duration: duration / 2,
          easing: MOTION.easing.smooth,
        }),
        withTiming(min, {
          duration: duration / 2,
          easing: MOTION.easing.smooth,
        }),
      ),
      -1,
      true,
    )
  }, [duration, max, min, reducedMotion, scale])

  return useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }))
}

export function usePressScale(activeScale = 0.95) {
  const scale = useSharedValue(1)

  const onPressIn = useCallback(() => {
    scale.value = withSpring(activeScale, MOTION.spring.snappy)
  }, [activeScale, scale])

  const onPressOut = useCallback(() => {
    scale.value = withSpring(1, MOTION.spring.bouncy)
  }, [scale])

  return {
    onPressIn,
    onPressOut,
    style: useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
    })),
  }
}

export function useShake() {
  const x = useSharedValue(0)

  const shake = useCallback(() => {
    x.value = withSequence(
      withTiming(-12, { duration: 50 }),
      withTiming(12, { duration: 50 }),
      withTiming(-9, { duration: 50 }),
      withTiming(9, { duration: 50 }),
      withTiming(-5, { duration: 50 }),
      withTiming(0, { duration: 50 }),
    )
  }, [x])

  return {
    shake,
    style: useAnimatedStyle(() => ({
      transform: [{ translateX: x.value }],
    })),
  }
}

export function useShimmer(width = 300, duration = 1800) {
  const reducedMotion = useReducedMotion()
  const x = useSharedValue(-width)

  useEffect(() => {
    if (shouldSkip(reducedMotion)) {
      return
    }

    x.value = withRepeat(
      withTiming(width, {
        duration,
        easing: MOTION.easing.linear,
      }),
      -1,
    )
  }, [duration, reducedMotion, width, x])

  return useAnimatedStyle(() => ({
    transform: [{ translateX: x.value }],
  }))
}

export function useGlowPulse() {
  const reducedMotion = useReducedMotion()
  const opacity = useSharedValue(0.2)

  useEffect(() => {
    if (shouldSkip(reducedMotion)) {
      return
    }

    opacity.value = withRepeat(
      withSequence(
        withTiming(0.9, {
          duration: 1600,
          easing: MOTION.easing.smooth,
        }),
        withTiming(0.2, {
          duration: 1600,
          easing: MOTION.easing.smooth,
        }),
      ),
      -1,
      true,
    )
  }, [opacity, reducedMotion])

  return useAnimatedStyle(() => ({
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: opacity.value,
    shadowRadius: 12,
    elevation: interpolate(opacity.value, [0.2, 0.9], [2, 8]),
  }))
}

export function useFloat(amplitude = 8, duration = 2400) {
  const reducedMotion = useReducedMotion()
  const y = useSharedValue(0)

  useEffect(() => {
    if (shouldSkip(reducedMotion)) {
      return
    }

    y.value = withRepeat(
      withSequence(
        withTiming(-amplitude, {
          duration: duration / 2,
          easing: MOTION.easing.smooth,
        }),
        withTiming(0, {
          duration: duration / 2,
          easing: MOTION.easing.smooth,
        }),
      ),
      -1,
      true,
    )
  }, [amplitude, duration, reducedMotion, y])

  return useAnimatedStyle(() => ({
    transform: [{ translateY: y.value }],
  }))
}

export function useRotate(duration = 3000) {
  const reducedMotion = useReducedMotion()
  const rotation = useSharedValue(0)

  useEffect(() => {
    if (shouldSkip(reducedMotion)) {
      return
    }

    rotation.value = withRepeat(
      withTiming(360, {
        duration,
        easing: MOTION.easing.linear,
      }),
      -1,
    )
  }, [duration, reducedMotion, rotation])

  return useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }))
}

export { Animated }
