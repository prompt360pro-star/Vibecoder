import { useEffect } from 'react'
import { Modal, StyleSheet, View } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated'
import { COLORS } from '@vibecode/shared'
import { MOTION } from '../../lib/animations'
import Button from '../ui/button'
import { ConfettiBurst } from '../ui/confetti'
import Text from '../ui/text'

interface LevelUpModalProps {
  visible: boolean
  newLevel: number
  newTitle: string
  newViForm: string
  onClose: () => void
}

const CARD_GRADIENT = ['#1A1530', '#110E22', '#0D0A18'] as const
const RAY_TRANSFORMS = [
  { transform: [{ rotate: '0deg' }, { translateY: -60 }] },
  { transform: [{ rotate: '45deg' }, { translateY: -60 }] },
  { transform: [{ rotate: '90deg' }, { translateY: -60 }] },
  { transform: [{ rotate: '135deg' }, { translateY: -60 }] },
  { transform: [{ rotate: '180deg' }, { translateY: -60 }] },
  { transform: [{ rotate: '225deg' }, { translateY: -60 }] },
  { transform: [{ rotate: '270deg' }, { translateY: -60 }] },
  { transform: [{ rotate: '315deg' }, { translateY: -60 }] },
] as const

export default function LevelUpModal({
  visible,
  newLevel,
  newTitle,
  newViForm,
  onClose,
}: LevelUpModalProps) {
  const opacity = useSharedValue(0)
  const scale = useSharedValue(0.88)
  const levelScale = useSharedValue(0.8)
  const rayRotate = useSharedValue(0)

  useEffect(() => {
    if (!visible) {
      cancelAnimation(rayRotate)
      opacity.value = 0
      scale.value = 0.88
      levelScale.value = 0.8
      rayRotate.value = 0
      return
    }

    opacity.value = withTiming(1, { duration: 260 })
    scale.value = withSpring(1, MOTION.spring.bouncy)
    levelScale.value = withDelay(
      500,
      withSequence(
        withSpring(1.4, { damping: 6, stiffness: 180 }),
        withSpring(0.9, { damping: 12, stiffness: 200 }),
        withSpring(1.05, { damping: 15, stiffness: 250 }),
        withSpring(1, { damping: 20, stiffness: 300 }),
      ),
    )
    rayRotate.value = withRepeat(
      withTiming(360, { duration: 12000, easing: MOTION.easing.linear }),
      -1,
    )
  }, [levelScale, opacity, rayRotate, scale, visible])

  const cardStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }))

  const levelStyle = useAnimatedStyle(() => ({
    transform: [{ scale: levelScale.value }],
  }))

  const raysStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rayRotate.value}deg` }],
  }))

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <ConfettiBurst count={48} />

        <Animated.View style={[styles.raysContainer, raysStyle]}>
          {RAY_TRANSFORMS.map((rayStyle, index) => (
            <View key={`ray-${index}`} style={[styles.ray, rayStyle]} />
          ))}
        </Animated.View>

        <Animated.View style={[styles.cardShadow, cardStyle]}>
          <LinearGradient colors={CARD_GRADIENT} style={styles.card}>
            <Text style={styles.emoji}>{newViForm}</Text>

            <Animated.View style={levelStyle}>
              <Text style={styles.levelText}>NÍVEL {newLevel}!</Text>
            </Animated.View>

            <Text style={styles.titleText}>{newTitle}</Text>
            <Text style={styles.congratsText}>
              Impressionante! A tua jornada no vibe coding está a ganhar velocidade.
            </Text>

            <Button
              title="CONTINUAR"
              variant="primary"
              size="lg"
              onPress={onClose}
              style={styles.button}
            />
          </LinearGradient>
        </Animated.View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(10,10,15,0.94)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  raysContainer: {
    position: 'absolute',
    width: 220,
    height: 220,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ray: {
    position: 'absolute',
    width: 2,
    height: 120,
    backgroundColor: 'rgba(139,92,246,0.07)',
    borderRadius: 999,
  },
  cardShadow: {
    width: '100%',
    maxWidth: 360,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 40,
    elevation: 20,
  },
  card: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 32,
    borderRadius: 28,
    borderWidth: 1.5,
    borderColor: 'rgba(139,92,246,0.5)',
  },
  emoji: {
    fontSize: 72,
    marginBottom: 20,
  },
  levelText: {
    color: '#FFFFFF',
    fontSize: 40,
    fontWeight: '900',
    letterSpacing: 2,
    textAlign: 'center',
    marginBottom: 10,
  },
  titleText: {
    color: COLORS.accentPurple,
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 18,
  },
  congratsText: {
    color: COLORS.textSecondary,
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 28,
  },
  button: {
    width: '100%',
  },
})
