import { View, StyleSheet, ScrollView, Pressable } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import Text from '../../components/ui/text'
import ProgressBar from '../../components/ui/progress-bar'
import { COLORS, ISLANDS } from '@vibecode/shared'
import { MissionStatus } from '@vibecode/shared'
import { useMissions } from '../../hooks/use-missions'
import { Ionicons } from '@expo/vector-icons'

export default function IslandDetailScreen() {
  const { islandId } = useLocalSearchParams<{ islandId: string }>()
  const router = useRouter()

  const island = ISLANDS.find((i) => i.id === islandId)
  const { data: missions } = useMissions()

  if (!island) return null

  const getMissionStatus = (missionId: string): MissionStatus => {
    const m = missions?.find((ms) => ms.id === missionId)
    return m?.status ?? (missionId === 'm01' ? MissionStatus.AVAILABLE : MissionStatus.LOCKED)
  }

  const getMissionScore = (missionId: string): number | null | undefined => {
    return missions?.find((ms) => ms.id === missionId)?.score
  }

  const totalMissions = island.zones.reduce((acc, z) => acc + z.missions.length, 0)
  const completedMissions = missions?.filter(
    (m) => m.status === MissionStatus.COMPLETED
  ).length ?? 0
  const islandProgress = totalMissions > 0 ? completedMissions / totalMissions : 0

  const getStatusIcon = (status: MissionStatus) => {
    switch (status) {
      case MissionStatus.COMPLETED: return '✅'
      case MissionStatus.IN_PROGRESS: return '▶️'
      case MissionStatus.AVAILABLE: return '⭐'
      case MissionStatus.LOCKED: return '🔒'
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
        </Pressable>
        <Text variant="h3">{island.name}</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Island hero */}
        <View style={styles.hero}>
          <Text style={styles.islandEmoji}>{island.emoji}</Text>
          <Text style={styles.islandSubtitle}>{island.subtitle}</Text>

          <View style={styles.progressRow}>
            <Text style={styles.progressLabel}>
              {completedMissions}/{totalMissions} missões
            </Text>
            <Text style={styles.progressPct}>
              {Math.round(islandProgress * 100)}%
            </Text>
          </View>
          <ProgressBar progress={islandProgress} variant="gradient" height={8} />
        </View>

        {/* Zones */}
        {island.zones.map((zone) => (
          <View key={zone.id} style={styles.zone}>
            <View style={styles.zoneHeader}>
              <Text style={styles.zoneEmoji}>{zone.emoji}</Text>
              <View style={styles.zoneInfo}>
                <Text style={styles.zoneName}>{zone.name}</Text>
                <Text style={styles.zoneDesc}>{zone.description}</Text>
              </View>
            </View>

            <View style={styles.missionList}>
              {zone.missions.map((summary, mIdx) => {
                const status = getMissionStatus(summary.id)
                const score = getMissionScore(summary.id)
                const isLocked = status === MissionStatus.LOCKED
                const isAvailable =
                  status === MissionStatus.AVAILABLE || status === MissionStatus.IN_PROGRESS

                return (
                  <Pressable
                    key={summary.id}
                    onPress={() => {
                      if (isAvailable || status === MissionStatus.COMPLETED) {
                        router.push(`/mission/${summary.id}`)
                      }
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
                        {String(mIdx + 1).padStart(2, '0')}
                      </Text>
                      <View>
                        <Text style={[styles.missionTitle, isLocked && styles.textLocked]}>
                          {summary.title}
                        </Text>
                        <Text style={styles.missionMeta}>
                          {summary.estimatedMinutes}min · {summary.xpReward} XP
                          {score != null && ` · ${score}%`}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.statusIcon}>{getStatusIcon(status)}</Text>
                  </Pressable>
                )
              })}
            </View>
          </View>
        ))}
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
