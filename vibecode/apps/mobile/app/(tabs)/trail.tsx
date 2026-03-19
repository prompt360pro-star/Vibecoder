import { useEffect, useMemo, type ReactNode } from 'react'
import { Pressable, ScrollView, StyleSheet, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import * as Haptics from 'expo-haptics'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated'
import { COLORS, ISLANDS, MissionStatus } from '@vibecode/shared'
import GradientBackground from '../../components/ui/gradient-background'
import { SkeletonMissionList } from '../../components/ui/skeleton'
import Text from '../../components/ui/text'
import { MOTION, useGlowPulse, useShake, useStaggerIn } from '../../lib/animations'
import { useMissions } from '../../hooks/use-missions'
import { useUser } from '../../hooks/use-user'

const ISLAND_META: Record<
  string,
  { unlockLevel: number | null; totalXpLabel: string; timeLabel: string }
> = {
  basic: { unlockLevel: null, totalXpLabel: '1.500 XP', timeLabel: '~2 semanas' },
  intermediate: { unlockLevel: 11, totalXpLabel: '4.200 XP', timeLabel: '~4 semanas' },
  advanced: { unlockLevel: 21, totalXpLabel: '7.600 XP', timeLabel: '~5 semanas' },
  expert: { unlockLevel: 31, totalXpLabel: '9.800 XP', timeLabel: '~6 semanas' },
}

interface StaggerItemProps {
  index: number
  children: ReactNode
}

interface IslandProgressBarProps {
  progress: number
  active: boolean
}

interface IslandItem {
  id: string
  name: string
  emoji: string
  completed: number
  total: number
  unlockLevel: number | null
  isLocked: boolean
  progress: number
  totalXpLabel: string
  timeLabel: string
}

interface IslandCardProps {
  island: IslandItem
  isActive: boolean
  index: number
  onOpen: (id: string) => void
}

function StaggerItem({ index, children }: StaggerItemProps) {
  const animatedStyle = useStaggerIn(index, 70)
  return <Animated.View style={animatedStyle}>{children}</Animated.View>
}

function IslandProgressBar({ progress, active }: IslandProgressBarProps) {
  const fill = useSharedValue(0)

  useEffect(() => {
    fill.value = withTiming(Math.max(0, Math.min(1, progress)), {
      duration: 800,
      easing: MOTION.easing.decelerate,
    })
  }, [fill, progress])

  const fillStyle = useAnimatedStyle(() => ({
    width: `${fill.value * 100}%` as `${number}%`,
  }))

  return (
    <View style={styles.islandProgressTrack}>
      <Animated.View
        style={[
          styles.islandProgressFill,
          !active && styles.islandProgressFillLocked,
          fillStyle,
        ]}
      />
    </View>
  )
}

function IslandCard({ island, isActive, index, onOpen }: IslandCardProps) {
  const staggerStyle = useStaggerIn(index, 80)
  const glowStyle = useGlowPulse()
  const { shake, style: shakeStyle } = useShake()

  const handlePress = () => {
    if (island.isLocked) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
      shake()
      return
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    onOpen(island.id)
  }

  return (
    <Animated.View style={[staggerStyle, shakeStyle, isActive && glowStyle]}>
      <Pressable
        onPress={handlePress}
        style={[
          styles.islandCard,
          isActive && styles.islandCardActive,
          island.isLocked && styles.islandCardLocked,
        ]}
      >
        <View style={styles.islandCardHeader}>
          <Text style={styles.islandCardEmoji}>{island.emoji}</Text>
          <View style={styles.islandCardBody}>
            <View style={styles.islandTitleRow}>
              <Text style={styles.islandCardName}>{island.name}</Text>
              {isActive ? (
                <View style={styles.activePill}>
                  <Text style={styles.activePillText}>ACTIVA</Text>
                </View>
              ) : null}
            </View>

            <Text style={styles.islandCardStats}>
              {island.completed}/{island.total} missões
            </Text>

            {island.isLocked ? (
              <Text style={styles.lockedText}>🔒 Nível {island.unlockLevel} necessário</Text>
            ) : (
              <IslandProgressBar progress={island.progress} active={isActive} />
            )}

            <View style={styles.metaRow}>
              <Text style={styles.metaText}>{island.totalXpLabel}</Text>
              <Text style={styles.metaDot}>•</Text>
              <Text style={styles.metaText}>{island.timeLabel}</Text>
            </View>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  )
}

export default function TrailScreen() {
  const router = useRouter()
  const { data: missions, isLoading } = useMissions()
  const { user } = useUser()

  const inProgressMissions = (missions || [])
    .filter(
      (mission) =>
        mission.status === MissionStatus.AVAILABLE ||
        mission.status === MissionStatus.IN_PROGRESS ||
        (mission.score != null && mission.score < 100),
    )
    .sort((left, right) => {
      if (
        left.status === MissionStatus.IN_PROGRESS &&
        right.status !== MissionStatus.IN_PROGRESS
      ) {
        return -1
      }

      if (
        right.status === MissionStatus.IN_PROGRESS &&
        left.status !== MissionStatus.IN_PROGRESS
      ) {
        return 1
      }

      return left.order - right.order
    })
    .slice(0, 3)

  const islands = useMemo(() => {
    return ISLANDS.map((island) => {
      const allIslandMissions = island.zones.flatMap((zone) => zone.missions)
      const total = island.totalMissions || allIslandMissions.length
      const completed = (missions || []).filter(
        (mission) =>
          mission.status === MissionStatus.COMPLETED &&
          allIslandMissions.some((islandMission) => islandMission.id === mission.id),
      ).length

      const unlockLevel = ISLAND_META[island.id]?.unlockLevel ?? null
      const isLocked = unlockLevel !== null && (user?.currentLevel ?? 0) < unlockLevel
      const progress = total > 0 ? completed / total : 0

      return {
        ...island,
        completed,
        total,
        unlockLevel,
        isLocked,
        progress,
        totalXpLabel: ISLAND_META[island.id]?.totalXpLabel ?? '0 XP',
        timeLabel: ISLAND_META[island.id]?.timeLabel ?? '~2 semanas',
      }
    })
  }, [missions, user?.currentLevel])

  const activeIsland = useMemo(() => {
    return (
      islands.find((island) => !island.isLocked && island.progress < 1) ??
      islands.find((island) => !island.isLocked) ??
      islands[0]
    )
  }, [islands])

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <GradientBackground variant="trail" />
      <View style={styles.header}>
        <Text variant="h2">🗺️ Trilha</Text>
        <View style={styles.xpBadge}>
          <Text style={styles.xpText}>{user?.totalXp || 0} XP</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <StaggerItem index={0}>
          <Pressable
            style={styles.recommendedBanner}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
              router.push(`/island/${activeIsland?.id ?? 'basic'}`)
            }}
          >
            <Text style={styles.recommendedEmoji}>{activeIsland?.emoji ?? '🏝️'}</Text>
            <View style={styles.recommendedContent}>
              <Text style={styles.recommendedLabel}>COMEÇA AQUI</Text>
              <Text style={styles.recommendedTitle}>{activeIsland?.name ?? 'Ilha Básica'}</Text>
              <Text style={styles.recommendedMeta}>
                {activeIsland?.completed ?? 0}/{activeIsland?.total ?? 30} missões •{' '}
                {activeIsland?.unlockLevel ? `Nível ${activeIsland.unlockLevel}` : 'Grátis'}
              </Text>
            </View>
            <Text style={styles.recommendedArrow}>→</Text>
          </Pressable>
        </StaggerItem>

        {isLoading ? (
          <SkeletonMissionList />
        ) : (
          <>
            {inProgressMissions.length > 0 ? (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Em Progresso</Text>
                {inProgressMissions.map((mission, index) => {
                  let islandEmoji = '🏝️'
                  let islandName = 'Desconhecida'

                  for (const island of ISLANDS) {
                    if (island.zones.some((zone) => zone.missions.some((item) => item.id === mission.id))) {
                      islandEmoji = island.emoji
                      islandName = island.name
                      break
                    }
                  }

                  return (
                    <StaggerItem key={mission.id} index={index + 1}>
                      <Pressable
                        style={styles.progressCard}
                        onPress={() => router.push(`/mission/${mission.id}`)}
                      >
                        <View style={styles.progressCardHeader}>
                          <Text style={styles.progressEmoji}>{islandEmoji}</Text>
                          <View style={styles.progressInfo}>
                            <Text style={styles.missionTitle} numberOfLines={1}>
                              {mission.title}
                            </Text>
                            <Text style={styles.islandName}>{islandName}</Text>
                          </View>
                        </View>

                        <View style={styles.progressFooter}>
                          <View style={styles.progressTrack}>
                            <View
                              style={[
                                styles.progressFill,
                                { width: `${Math.max(6, ((mission.score ?? 0) / 100) * 100)}%` },
                              ]}
                            />
                          </View>
                          <View style={styles.continueBtn}>
                            <Text style={styles.continueBtnText}>CONTINUAR</Text>
                          </View>
                        </View>
                      </Pressable>
                    </StaggerItem>
                  )
                })}
              </View>
            ) : null}

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Mundos de Vibe</Text>
              {islands.map((island, index) => (
                <IslandCard
                  key={island.id}
                  island={island}
                  isActive={activeIsland?.id === island.id}
                  index={index}
                  onOpen={(id) => router.push(`/island/${id}`)}
                />
              ))}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgPrimary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderSubtle,
  },
  xpBadge: {
    backgroundColor: 'rgba(139,92,246,0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(139,92,246,0.3)',
  },
  xpText: {
    color: '#D8B4FE',
    fontWeight: '700',
    fontSize: 14,
  },
  scroll: {
    padding: 20,
    gap: 24,
    paddingBottom: 40,
  },
  recommendedBanner: {
    backgroundColor: 'rgba(139, 92, 246, 0.12)',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.4)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  recommendedEmoji: {
    fontSize: 36,
  },
  recommendedContent: {
    flex: 1,
  },
  recommendedLabel: {
    color: COLORS.accentPurple,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 4,
  },
  recommendedTitle: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  recommendedMeta: {
    color: COLORS.textMuted,
    fontSize: 13,
    marginTop: 2,
  },
  recommendedArrow: {
    color: COLORS.accentPurple,
    fontSize: 20,
    fontWeight: '700',
  },
  section: {
    gap: 16,
  },
  sectionTitle: {
    color: COLORS.textPrimary,
    fontSize: 18,
    fontWeight: '700',
  },
  progressCard: {
    backgroundColor: COLORS.bgCard,
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
    borderRadius: 16,
    padding: 16,
    gap: 16,
  },
  progressCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  progressEmoji: {
    fontSize: 24,
  },
  progressInfo: {
    flex: 1,
  },
  missionTitle: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
  islandName: {
    color: COLORS.textTertiary,
    fontSize: 13,
  },
  progressFooter: {
    gap: 12,
  },
  progressTrack: {
    width: '100%',
    height: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: COLORS.accentPurple,
  },
  continueBtn: {
    backgroundColor: 'rgba(139,92,246,0.1)',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(139,92,246,0.2)',
  },
  continueBtnText: {
    color: '#D8B4FE',
    fontWeight: '800',
    fontSize: 13,
    letterSpacing: 1,
  },
  islandCard: {
    backgroundColor: COLORS.bgCard,
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
    borderRadius: 16,
    padding: 16,
  },
  islandCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  islandCardBody: {
    flex: 1,
  },
  islandCardEmoji: {
    fontSize: 44,
  },
  islandTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  islandCardName: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  activePill: {
    backgroundColor: COLORS.accentPurple,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  activePillText: {
    color: COLORS.textPrimary,
    fontSize: 10,
    fontWeight: '800',
  },
  islandCardStats: {
    color: COLORS.textSecondary,
    fontSize: 13,
    marginBottom: 8,
  },
  islandProgressTrack: {
    width: '100%',
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
    marginBottom: 10,
  },
  islandProgressFill: {
    height: '100%',
    borderRadius: 2,
    backgroundColor: '#8B5CF6',
  },
  islandProgressFillLocked: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  lockedText: {
    color: COLORS.accentRed,
    fontSize: 12,
    marginTop: 2,
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    color: COLORS.textMuted,
    fontSize: 12,
  },
  metaDot: {
    color: COLORS.textMuted,
    fontSize: 12,
  },
  islandCardActive: {
    borderWidth: 1.5,
    borderColor: COLORS.accentPurple,
    backgroundColor: 'rgba(139, 92, 246, 0.08)',
  },
  islandCardLocked: {
    opacity: 0.5,
  },
})
