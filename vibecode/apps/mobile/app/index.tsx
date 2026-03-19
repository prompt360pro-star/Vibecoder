import { useEffect } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import * as SplashScreen from 'expo-splash-screen'
import { LinearGradient } from 'expo-linear-gradient'
import { useAuth } from '@clerk/clerk-expo'
import { useRouter } from 'expo-router'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated'
import { MOTION } from '../lib/animations'
import { useApiSetup } from '../hooks/use-api-setup'
import { useUserStore } from '../stores/user-store'

SplashScreen.preventAutoHideAsync().catch(() => {})

interface BouncingDotProps {
  delay: number
}

function BouncingDot({ delay }: BouncingDotProps) {
  const y = useSharedValue(0)
  const opacity = useSharedValue(0)

  useEffect(() => {
    opacity.value = withDelay(950 + delay, withTiming(1, { duration: 200 }))
    y.value = withDelay(
      1100 + delay,
      withRepeat(
        withSequence(
          withTiming(-10, { duration: 380, easing: MOTION.easing.decelerate }),
          withTiming(0, { duration: 380, easing: MOTION.easing.accelerate }),
        ),
        -1,
      ),
    )
  }, [delay, opacity, y])

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: y.value }],
  }))

  return <Animated.View style={[styles.dot, animatedStyle]} />
}

export default function IndexScreen() {
  const { isSignedIn, isLoaded } = useAuth()
  const hasCompletedOnboarding = useUserStore((state) => state.hasCompletedOnboarding)
  const hydrated = useUserStore((state) => state.hydrated)
  const router = useRouter()

  const glowScale = useSharedValue(0.72)
  const glowOpacity = useSharedValue(0)
  const ring1Scale = useSharedValue(0.84)
  const ring1Opacity = useSharedValue(0)
  const ring2Scale = useSharedValue(0.84)
  const ring2Opacity = useSharedValue(0)
  const logoScale = useSharedValue(0.6)
  const logoOpacity = useSharedValue(0)
  const logoRotate = useSharedValue(-12)
  const nameY = useSharedValue(24)
  const nameOpacity = useSharedValue(0)
  const tagOpacity = useSharedValue(0)

  useApiSetup()

  useEffect(() => {
    const hideTimer = setTimeout(() => {
      SplashScreen.hideAsync().catch(() => {})
    }, 100)

    glowOpacity.value = withTiming(1, { duration: 600 })
    glowScale.value = withSpring(1, MOTION.spring.floaty)

    ring1Opacity.value = withDelay(200, withTiming(0.2, { duration: 500 }))
    ring1Scale.value = withDelay(200, withSpring(1, MOTION.spring.gentle))
    ring2Opacity.value = withDelay(300, withTiming(0.1, { duration: 500 }))
    ring2Scale.value = withDelay(300, withSpring(1, MOTION.spring.gentle))

    logoOpacity.value = withDelay(150, withTiming(1, { duration: 250 }))
    logoScale.value = withDelay(150, withSpring(1, MOTION.spring.bouncy))
    logoRotate.value = withDelay(150, withSpring(0, MOTION.spring.wobbly))

    const idleTimer = setTimeout(() => {
      logoScale.value = withRepeat(
        withSequence(
          withTiming(1.06, { duration: 1200, easing: MOTION.easing.smooth }),
          withTiming(1, { duration: 1200, easing: MOTION.easing.smooth }),
        ),
        -1,
        true,
      )
    }, 900)

    nameOpacity.value = withDelay(480, withTiming(1, { duration: 350 }))
    nameY.value = withDelay(480, withSpring(0, MOTION.spring.gentle))
    tagOpacity.value = withDelay(720, withTiming(1, { duration: 400 }))

    return () => {
      clearTimeout(hideTimer)
      clearTimeout(idleTimer)
    }
  }, [
    glowOpacity,
    glowScale,
    logoOpacity,
    logoRotate,
    logoScale,
    nameOpacity,
    nameY,
    ring1Opacity,
    ring1Scale,
    ring2Opacity,
    ring2Scale,
    tagOpacity,
  ])

  useEffect(() => {
    if (!isLoaded || !hydrated) return

    const navigationTimer = setTimeout(() => {
      if (!isSignedIn) {
        router.replace('/(auth)/sign-in')
        return
      }

      if (!hasCompletedOnboarding) {
        router.replace('/(onboarding)/welcome' as never)
        return
      }

      router.replace('/(tabs)/home' as never)
    }, 2100)

    return () => clearTimeout(navigationTimer)
  }, [hasCompletedOnboarding, hydrated, isLoaded, isSignedIn, router])

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
    transform: [{ scale: glowScale.value }],
  }))

  const ring1Style = useAnimatedStyle(() => ({
    opacity: ring1Opacity.value,
    transform: [{ scale: ring1Scale.value }],
  }))

  const ring2Style = useAnimatedStyle(() => ({
    opacity: ring2Opacity.value,
    transform: [{ scale: ring2Scale.value }],
  }))

  const logoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [
      { scale: logoScale.value },
      { rotate: `${logoRotate.value}deg` },
    ],
  }))

  const nameStyle = useAnimatedStyle(() => ({
    opacity: nameOpacity.value,
    transform: [{ translateY: nameY.value }],
  }))

  const tagStyle = useAnimatedStyle(() => ({
    opacity: tagOpacity.value,
  }))

  return (
    <LinearGradient colors={['#0A0A0F', '#0D0A18', '#0A0A0F']} style={styles.container}>
      <Animated.View style={[styles.glow, glowStyle]} />
      <Animated.View style={[styles.ring1, ring1Style]} />
      <Animated.View style={[styles.ring2, ring2Style]} />

      <Animated.View style={logoStyle}>
        <Text style={styles.logoText}>🎵</Text>
      </Animated.View>

      <Animated.View style={nameStyle}>
        <Text style={styles.nameText}>VibeCode</Text>
      </Animated.View>

      <Animated.View style={tagStyle}>
        <Text style={styles.taglineText}>aprende, sobe de nível, cria com ritmo</Text>
      </Animated.View>

      <View style={styles.dotsContainer}>
        <BouncingDot delay={0} />
        <BouncingDot delay={140} />
        <BouncingDot delay={280} />
      </View>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0F',
    justifyContent: 'center',
    alignItems: 'center',
  },
  glow: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: '#7C3AED',
    opacity: 0.28,
  },
  ring1: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 1,
    borderColor: 'rgba(139,92,246,0.25)',
  },
  ring2: {
    position: 'absolute',
    width: 240,
    height: 240,
    borderRadius: 120,
    borderWidth: 1,
    borderColor: 'rgba(139,92,246,0.12)',
  },
  logoText: {
    fontSize: 88,
    marginBottom: 20,
  },
  nameText: {
    color: '#FFF',
    fontSize: 44,
    fontWeight: '800',
    letterSpacing: -1.5,
  },
  taglineText: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: 15,
    marginBottom: 56,
  },
  dotsContainer: {
    flexDirection: 'row',
    gap: 8,
    position: 'absolute',
    bottom: 80,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#8B5CF6',
  },
})
