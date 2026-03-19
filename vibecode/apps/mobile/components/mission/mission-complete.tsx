import { useEffect, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import * as Haptics from 'expo-haptics'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from 'react-native-reanimated'
import { ACHIEVEMENTS, COLORS } from '@vibecode/shared'
import { useStaggerIn } from '../../lib/animations'
import { useGamificationStore } from '../../stores/gamification-store'
import Button from '../ui/button'
import { ConfettiBurst } from '../ui/confetti'
import Text from '../ui/text'

interface MissionCompleteProps {
  xpEarned: number
  score: number
  missionTitle: string
  nextMissionId?: string | null
  newAchievements?: string[]
  leveledUp?: boolean
  newLevel?: number | null
  levelTitle?: string | null
  viForm?: string | null
  onNextMission: () => void
  onBackToMap: () => void
}

interface AnimatedStarProps {
  filled: boolean
  delay: number
}

function StaggerButton({ index, children }: { index: number; children: React.ReactNode }) {
  const animatedStyle = useStaggerIn(index, 120)
  return <Animated.View style={animatedStyle}>{children}</Animated.View>
}

function AnimatedStar({ filled, delay }: AnimatedStarProps) {
  const scale = useSharedValue(0)
  const rotate = useSharedValue(-30)

  useEffect(() => {
    if (!filled) return

    scale.value = withDelay(delay, withSpring(1, { damping: 8, stiffness: 200 }))
    rotate.value = withDelay(delay, withSpring(0, { damping: 10, stiffness: 150 }))
  }, [delay, filled, rotate, scale])

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: scale.value,
    transform: [{ scale: scale.value }, { rotate: `${rotate.value}deg` }],
  }))

  return <Animated.Text style={[styles.star, animatedStyle]}>⭐</Animated.Text>
}

export default function MissionComplete({
  xpEarned,
  score,
  missionTitle,
  nextMissionId,
  newAchievements,
  leveledUp,
  newLevel,
  levelTitle,
  viForm,
  onNextMission,
  onBackToMap,
}: MissionCompleteProps) {
  const { triggerAchievement, triggerLevelUp } = useGamificationStore()
  const [displayXp, setDisplayXp] = useState(0)
  const containerScale = useSharedValue(0.88)
  const containerOpacity = useSharedValue(0)
  const stars = score >= 90 ? 3 : score >= 70 ? 2 : 1

  useEffect(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    containerScale.value = withSpring(1, { damping: 10, stiffness: 180 })
    containerOpacity.value = withTiming(1, { duration: 250 })

    const revealTimer = setTimeout(() => {
      if (newAchievements && newAchievements.length > 0) {
        newAchievements.forEach((id) => {
          const achievement = ACHIEVEMENTS.find((a) => a.id === id)
          if (achievement) {
            triggerAchievement({
              id: achievement.id,
              name: achievement.name,
              emoji: achievement.emoji,
              xpReward: achievement.xpReward,
            })
          }
        })
      }

      if (leveledUp && newLevel) {
        triggerLevelUp({
          level: newLevel,
          title: levelTitle ?? 'Novo Nível',
          viForm: viForm ?? '🎉',
        })
      }
    }, 800)

    return () => clearTimeout(revealTimer)
  }, [containerOpacity, containerScale, leveledUp, newAchievements, newLevel, levelTitle, viForm, triggerAchievement, triggerLevelUp])

  useEffect(() => {
    const duration = 1200
    const start = Date.now()
    const timer = setInterval(() => {
      const elapsed = Date.now() - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplayXp(Math.round(eased * xpEarned))
      if (progress >= 1) clearInterval(timer)
    }, 16)

    return () => clearInterval(timer)
  }, [xpEarned])

  const containerStyle = useAnimatedStyle(() => ({
    opacity: containerOpacity.value,
    transform: [{ scale: containerScale.value }],
  }))

  return (
    <View style={styles.overlay}>
      <ConfettiBurst count={48} />

      <Animated.View style={[styles.container, containerStyle]}>
        <Text style={styles.confetti}>🎉</Text>
        <Text style={styles.title}>MISSÃO COMPLETA!</Text>
        <Text style={styles.missionName}>{missionTitle}</Text>

        <View style={styles.stars}>
          {[1, 2, 3].map((starIndex) => (
            <AnimatedStar key={starIndex} filled={starIndex <= stars} delay={starIndex * 300} />
          ))}
        </View>

        <View style={styles.xpBadge}>
          <Text style={styles.xpValue}>+{displayXp} XP</Text>
          <Text style={styles.scoreText}>Score: {score}%</Text>
        </View>

        <View style={styles.buttons}>
          {nextMissionId ? (
            <StaggerButton index={0}>
              <Button title="PRÓXIMA MISSÃO →" onPress={onNextMission} variant="primary" size="lg" />
            </StaggerButton>
          ) : null}

          <StaggerButton index={1}>
            <Button title="VOLTAR AO MAPA" onPress={onBackToMap} variant="secondary" size="lg" />
          </StaggerButton>
        </View>
      </Animated.View>
    </View>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(10,10,15,0.97)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  container: {
    width: '100%',
    alignItems: 'center',
    gap: 20,
  },
  confetti: { fontSize: 72, marginBottom: 8 },
  title: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: 2,
    textAlign: 'center',
  },
  missionName: {
    color: COLORS.textSecondary,
    fontSize: 16,
    textAlign: 'center',
  },
  stars: {
    flexDirection: 'row',
    gap: 8,
  },
  star: {
    fontSize: 48,
  },
  xpBadge: {
    backgroundColor: 'rgba(139,92,246,0.15)',
    borderRadius: 20,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderWidth: 2,
    borderColor: COLORS.accentPurple,
    alignItems: 'center',
    gap: 6,
  },
  xpValue: {
    color: COLORS.accentPurple,
    fontSize: 40,
    fontWeight: '900',
  },
  scoreText: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  buttons: {
    width: '100%',
    gap: 12,
    marginTop: 8,
  },
})
