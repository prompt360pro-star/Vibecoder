import { useEffect, useRef } from 'react'
import { View, StyleSheet, Animated } from 'react-native'
import Text from '../ui/text'
import Button from '../ui/button'
import { COLORS } from '@vibecode/shared'
import * as Haptics from 'expo-haptics'

interface MissionCompleteProps {
  xpEarned: number
  score: number
  missionTitle: string
  nextMissionId?: string | null
  onNextMission: () => void
  onBackToMap: () => void
}

export default function MissionComplete({
  xpEarned,
  score,
  missionTitle,
  nextMissionId,
  onNextMission,
  onBackToMap,
}: MissionCompleteProps) {
  const scaleAnim = useRef(new Animated.Value(0)).current
  const xpCountAnim = useRef(new Animated.Value(0)).current

  const stars = score >= 90 ? 3 : score >= 70 ? 2 : 1

  useEffect(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)

    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 40,
        friction: 7,
      }),
      Animated.timing(xpCountAnim, {
        toValue: xpEarned,
        duration: 1200,
        useNativeDriver: false,
      }),
    ]).start()
  }, [scaleAnim, xpCountAnim, xpEarned])

  return (
    <View style={styles.overlay}>
      <Animated.View style={[styles.container, { transform: [{ scale: scaleAnim }] }]}>
        {/* Confete animado */}
        <Text style={styles.confetti}>🎉</Text>

        <Text style={styles.title}>MISSÃO COMPLETA!</Text>
        <Text style={styles.missionName}>{missionTitle}</Text>

        {/* Estrelas */}
        <View style={styles.stars}>
          {[1, 2, 3].map((s) => (
            <Text key={s} style={[styles.star, { opacity: s <= stars ? 1 : 0.25 }]}>
              ⭐
            </Text>
          ))}
        </View>

        {/* XP animado */}
        <View style={styles.xpBadge}>
          <Animated.Text style={styles.xpValue}>
            +{Math.round(xpEarned)} XP
          </Animated.Text>
          <Text style={styles.scoreText}>Score: {score}%</Text>
        </View>

        {/* Botões */}
        <View style={styles.buttons}>
          {nextMissionId && (
            <Button
              title="PRÓXIMA MISSÃO →"
              onPress={onNextMission}
              variant="primary"
              size="lg"
            />
          )}
          <Button
            title="VOLTAR AO MAPA"
            onPress={onBackToMap}
            variant="secondary"
            size="lg"
          />
        </View>
      </Animated.View>

      {/* Sparkles decorativos */}
      <Text style={[styles.sparkle, { top: '8%', left: '10%' }]}>✨</Text>
      <Text style={[styles.sparkle, { top: '12%', right: '15%' }]}>🎊</Text>
      <Text style={[styles.sparkle, { bottom: '15%', left: '8%' }]}>⭐</Text>
      <Text style={[styles.sparkle, { bottom: '20%', right: '10%' }]}>✨</Text>
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
  star: { fontSize: 40 },
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
  sparkle: {
    position: 'absolute',
    fontSize: 28,
  },
})
