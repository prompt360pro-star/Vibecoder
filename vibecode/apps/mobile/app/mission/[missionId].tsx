import { useState, useRef } from 'react'
import { View, StyleSheet, Pressable } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLocalSearchParams, useRouter } from 'expo-router'
import * as Haptics from 'expo-haptics'
import Text from '../../components/ui/text'
import ProgressBar from '../../components/ui/progress-bar'
import PhaseStory from '../../components/mission/phase-story'
import PhaseConcept from '../../components/mission/phase-concept'
import PhaseInteraction from '../../components/mission/phase-interaction'
import PhaseSandbox from '../../components/mission/phase-sandbox'
import MissionComplete from '../../components/mission/mission-complete'
import { useMission, useCompleteMission } from '../../hooks/use-missions'
import { COLORS } from '@vibecode/shared'
import type { StoryContent, ConceptContent, InteractionContent, SandboxContent } from '@vibecode/shared'
import { Ionicons } from '@expo/vector-icons'

export default function MissionPlayerScreen() {
  const { missionId } = useLocalSearchParams<{ missionId: string }>()
  const router = useRouter()
  const { data: mission, isLoading } = useMission(missionId)
  const completeMission = useCompleteMission()

  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0)
  const [phaseScores, setPhaseScores] = useState<number[]>([])
  const [isComplete, setIsComplete] = useState(false)
  const [completionResult, setCompletionResult] = useState<{
    xpEarned: number
    nextMissionId: string | null
  } | null>(null)
  const startTime = useRef(Date.now())

  if (isLoading || !mission) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loading}>
          <Text style={styles.loadingText}>A carregar missão...</Text>
        </View>
      </SafeAreaView>
    )
  }

  const phases = mission.phases
  const currentPhase = phases[currentPhaseIndex]
  const totalPhases = phases.length
  const progress = totalPhases > 0 ? (currentPhaseIndex) / totalPhases : 0

  const handlePhaseComplete = async (score: number) => {
    const newScores = [...phaseScores, score]
    setPhaseScores(newScores)

    const nextIndex = currentPhaseIndex + 1

    if (nextIndex >= totalPhases) {
      // Última fase — calcular score médio e completar
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
      const avgScore = Math.round(newScores.reduce((a, b) => a + b, 0) / newScores.length)
      const timeSpent = Math.round((Date.now() - startTime.current) / 1000)

      try {
        const result = await completeMission.mutateAsync({
          missionId,
          score: avgScore,
          timeSpentSeconds: timeSpent,
          data: { phaseScores: newScores },
        })
        setCompletionResult({
          xpEarned: result.xpEarned,
          nextMissionId: result.nextMissionId,
        })
      } catch {
        setCompletionResult({ xpEarned: 0, nextMissionId: null })
      }
      setIsComplete(true)
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
      setCurrentPhaseIndex(nextIndex)
    }
  }

  if (isComplete && completionResult) {
    const avgScore = Math.round(phaseScores.reduce((a, b) => a + b, 0) / phaseScores.length)
    return (
      <MissionComplete
        xpEarned={completionResult.xpEarned}
        score={avgScore}
        missionTitle={mission.title}
        nextMissionId={completionResult.nextMissionId}
        onNextMission={() => {
          if (completionResult.nextMissionId) {
            router.replace(`/mission/${completionResult.nextMissionId}`)
          }
        }}
        onBackToMap={() => router.replace('/(tabs)/home')}
      />
    )
  }

  if (!currentPhase) return null

  const renderPhase = () => {
    switch (currentPhase.type) {
      case 'story':
        return (
          <PhaseStory
            content={currentPhase.content as StoryContent}
            onContinue={() => handlePhaseComplete(100)}
          />
        )
      case 'concept':
        return (
          <PhaseConcept
            content={currentPhase.content as ConceptContent}
            onContinue={() => handlePhaseComplete(100)}
          />
        )
      case 'interaction':
        return (
          <PhaseInteraction
            content={currentPhase.content as InteractionContent}
            onComplete={handlePhaseComplete}
          />
        )
      case 'sandbox':
        return (
          <PhaseSandbox
            content={currentPhase.content as SandboxContent}
            onComplete={handlePhaseComplete}
          />
        )
      default:
        return null
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={COLORS.textPrimary} />
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={styles.missionLabel}>
            {mission.title}
          </Text>
          <Text style={styles.phaseLabel}>
            Fase {currentPhaseIndex + 1} de {totalPhases}
          </Text>
        </View>
        <View style={styles.backBtn} />
      </View>

      {/* Progress bar */}
      <View style={styles.progressContainer}>
        <ProgressBar
          progress={progress}
          variant="gradient"
          height={6}
        />
      </View>

      {/* Phase content */}
      <View style={styles.content}>
        {renderPhase()}
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgPrimary,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: COLORS.textSecondary,
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  missionLabel: {
    color: COLORS.textPrimary,
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
  },
  phaseLabel: {
    color: COLORS.textMuted,
    fontSize: 12,
  },
  progressContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
})
