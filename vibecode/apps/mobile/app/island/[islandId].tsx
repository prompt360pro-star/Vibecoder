import { View, StyleSheet, ScrollView, Pressable } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useEffect } from 'react'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated'
import Text from '../../components/ui/text'
import ProgressBar from '../../components/ui/progress-bar'
import { COLORS, ISLANDS } from '@vibecode/shared'
import { MissionStatus } from '@vibecode/shared'
import { useMissions } from '../../hooks/use-missions'
import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'

function SkeletonLoader() {
  const opacity = useSharedValue(0.4)

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 800 }),
        withTiming(0.4, { duration: 800 }),
      ),
      -1,
      true,
    )
  }, [opacity])

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }))

  return (
    <>
      {[1, 2, 3].map((item) => (
        <Animated.View key={item} style={[styles.skeletonCard, animatedStyle]} />
      ))}
    </>
  )
}

function AvailableIconPulse() {
  const scale = useSharedValue(1)

  useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.2, { duration: 1000 }),
        withTiming(1, { duration: 1000 }),
      ),
      -1,
      true,
    )
  }, [scale])

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }))

  return <Animated.Text style={[styles.statusIcon, animatedStyle]}>▶️</Animated.Text>
}

export default function IslandDetailScreen() {
  const { islandId } = useLocalSearchParams<{ islandId: string }>()
  const router = useRouter()
  const island = ISLANDS.find((currentIsland) => currentIsland.id === islandId)
  const { data: missions, isLoading } = useMissions(islandId)

  if (!island) return null

  const getMissionStatus = (missionId: string): MissionStatus => {
    const mission = missions?.find((item) => item.id === missionId)
    return mission?.status ?? (missionId === 'm01' ? MissionStatus.AVAILABLE : MissionStatus.LOCKED)
  }

  const getMissionScore = (missionId: string): number | null | undefined => {
    return missions?.find((item) => item.id === missionId)?.score
  }

  const totalMissions = island.zones.reduce((acc, zone) => acc + zone.missions.length, 0)
  const completedMissions =
    missions?.filter(
      (mission) =>
        mission.status === MissionStatus.COMPLETED &&
        island.zones.some((zone) => zone.missions.some((zoneMission) => zoneMission.id === mission.id)),
    ).length ?? 0
  const islandProgress = totalMissions > 0 ? completedMissions / totalMissions : 0

  const renderStatusIcon = (status: MissionStatus) => {
    switch (status) {
      case MissionStatus.COMPLETED:
        return <Text style={styles.statusIcon}>✅</Text>
      case MissionStatus.IN_PROGRESS:
      case MissionStatus.AVAILABLE:
        return <AvailableIconPulse />
      case MissionStatus.LOCKED:
        return <Text style={styles.statusIcon}>🔒</Text>
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
        </Pressable>
        <Text variant="h3">
          {island.emoji} {island.name}
        </Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={styles.hero}>
          <Text style={styles.islandEmoji}>{island.emoji}</Text>
          <Text style={styles.islandSubtitle}>
            {completedMissions} de {totalMissions} missões completas
          </Text>

          <View style={styles.progressRow}>
            <Text style={styles.progressLabel}>
              {completedMissions}/{totalMissions} missões
            </Text>
            <Text style={styles.progressPct}>{Math.round(islandProgress * 100)}%</Text>
          </View>
          <ProgressBar progress={islandProgress} variant="gradient" height={8} />
        </View>

        {island.zones.map((zone) => {
          const sortedMissions = [...zone.missions].sort((left, right) => left.order - right.order)

          return (
            <View key={zone.id} style={styles.zone}>
              <View style={styles.zoneHeader}>
                <Text style={styles.zoneEmoji}>{zone.emoji}</Text>
                <View style={styles.zoneInfo}>
                  <Text style={styles.zoneName}>{zone.name}</Text>
                  <Text style={styles.zoneDesc}>{zone.description}</Text>
                </View>
              </View>

              <View style={styles.missionList}>
                {isLoading ? (
                  <SkeletonLoader />
                ) : (
                  sortedMissions.map((summary, missionIndex) => {
                    const status = getMissionStatus(summary.id)
                    const score = getMissionScore(summary.id)
                    const isLocked = status === MissionStatus.LOCKED
                    const isAvailable =
                      status === MissionStatus.AVAILABLE || status === MissionStatus.IN_PROGRESS

                    return (
                      <Pressable
                        key={summary.id}
                        onPress={() => {
                          if (isLocked) {
                            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
                            return
                          }
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                          router.push(`/mission/${summary.id}`)
                        }}
                        style={({ pressed }) => [
                          styles.missionCard,
                          isLocked && styles.missionLocked,
                          isAvailable && styles.missionAvailable,
                          pressed && !isLocked && styles.missionPressed,
                        ]}
                      >
                        <View style={styles.missionLeft}>
                          <Text style={styles.missionNum}>
                            {String(missionIndex + 1).padStart(2, '0')}
                          </Text>
                          <View>
                            <Text style={[styles.missionTitle, isLocked && styles.textLocked]}>
                              {summary.title}
                            </Text>
                            <Text style={styles.missionMeta}>
                              {summary.xpReward} XP • {summary.estimatedMinutes} min
                              {status === MissionStatus.COMPLETED && score != null && ` • ⭐ ${score}%`}
                            </Text>
                          </View>
                        </View>
                        {renderStatusIcon(status)}
                      </Pressable>
                    )
                  })
                )}
              </View>
            </View>
          )
        })}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bgPrimary },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  scroll: { padding: 20, gap: 28, paddingBottom: 48 },
  hero: { alignItems: 'center', gap: 12 },
  islandEmoji: { fontSize: 72 },
  islandSubtitle: { color: COLORS.textSecondary, fontSize: 15, textAlign: 'center' },
  progressRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%' },
  progressLabel: { color: COLORS.textMuted, fontSize: 13 },
  progressPct: { color: COLORS.textSecondary, fontSize: 13, fontWeight: '700' },
  zone: { gap: 16 },
  zoneHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  zoneEmoji: { fontSize: 24 },
  zoneInfo: { flex: 1 },
  zoneName: { color: COLORS.textPrimary, fontSize: 16, fontWeight: '700' },
  zoneDesc: { color: COLORS.textMuted, fontSize: 12 },
  missionList: { gap: 10 },
  missionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.bgCard,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
    height: 72,
  },
  skeletonCard: {
    backgroundColor: COLORS.bgElevated,
    borderRadius: 16,
    height: 72,
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
  },
  missionLocked: { opacity: 0.5 },
  missionAvailable: {
    borderColor: COLORS.accentPurple,
    backgroundColor: 'rgba(139,92,246,0.05)',
  },
  missionPressed: { transform: [{ scale: 0.98 }] },
  missionLeft: { flexDirection: 'row', alignItems: 'center', gap: 14, flex: 1 },
  missionNum: {
    color: COLORS.textMuted,
    fontSize: 18,
    fontWeight: '900',
    width: 30,
  },
  missionTitle: { color: COLORS.textPrimary, fontSize: 15, fontWeight: '600', marginBottom: 2 },
  textLocked: { color: COLORS.textMuted },
  missionMeta: { color: COLORS.textMuted, fontSize: 12 },
  statusIcon: { fontSize: 20 },
})
