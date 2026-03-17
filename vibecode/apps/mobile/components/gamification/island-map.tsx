import { View, StyleSheet, ScrollView, Pressable, type ViewStyle } from 'react-native'
import Text from '../ui/text'
import Card from '../ui/card'
import ProgressBar from '../ui/progress-bar'
import { COLORS, ISLANDS } from '@vibecode/shared'
import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'

interface IslandMapProps {
  userLevel: number
  completedMissions: Record<string, number>
  onIslandPress: (islandId: string) => void
  style?: ViewStyle
}

export default function IslandMap({
  userLevel,
  completedMissions,
  onIslandPress,
  style,
}: IslandMapProps) {
  // Dados invertidos para scroll de baixo para cima
  const invertedIslands = [...ISLANDS].reverse()

  const isIslandLocked = (islandId: string) => {
    if (islandId === 'basic') return false
    if (islandId === 'intermediate') return userLevel < 11
    if (islandId === 'advanced') return userLevel < 21
    if (islandId === 'expert') return userLevel < 31
    return true
  }

  const getIslandProgress = (islandId: string, total: number) => {
    const completed = completedMissions[islandId] || 0
    return Math.min(completed / total, 1)
  }

  const isCurrentIsland = (islandId: string) => {
    const basicComp = completedMissions['basic'] || 0
    const interComp = completedMissions['intermediate'] || 0
    const advComp = completedMissions['advanced'] || 0

    if (basicComp < 30) return islandId === 'basic'
    if (interComp < 45) return islandId === 'intermediate'
    if (advComp < 50) return islandId === 'advanced'
    return islandId === 'expert'
  }

  return (
    <ScrollView 
      style={[styles.container, style]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {invertedIslands.map((island, index) => {
        const locked = isIslandLocked(island.id)
        const current = isCurrentIsland(island.id)
        const progress = getIslandProgress(island.id, island.totalMissions)
        const completedCount = completedMissions[island.id] || 0

        return (
          <View key={island.id} style={styles.islandContainer}>
            <Pressable
              onPress={() => {
                if (!locked) {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
                  onIslandPress(island.id)
                } else {
                  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
                }
              }}
              style={({ pressed }) => [
                styles.islandCard,
                current && styles.islandCardCurrent,
                locked && styles.islandCardLocked,
                pressed && !locked && styles.islandPressed,
              ]}
            >
              <View style={styles.islandHeader}>
                <Text style={styles.islandEmoji}>{island.emoji}</Text>
                <View style={styles.islandInfo}>
                  <Text style={styles.islandName}>{island.name}</Text>
                  <Text style={styles.islandSubtitle}>{island.subtitle}</Text>
                </View>
                {locked && (
                  <Ionicons name="lock-closed" size={20} color={COLORS.textMuted} />
                )}
              </View>

              <View style={styles.progressContainer}>
                <View style={styles.progressTextRow}>
                  <Text style={styles.progressLabel}>
                    {completedCount} / {island.totalMissions} missões
                  </Text>
                  <Text style={styles.percentageLabel}>
                    {Math.round(progress * 100)}%
                  </Text>
                </View>
                <ProgressBar progress={progress} height={6} variant="gradient" />
              </View>

              {current && (
                <View style={styles.currentBadge}>
                  <Text style={styles.currentBadgeText}>← VOCÊ ESTÁ AQUI</Text>
                </View>
              )}
            </Pressable>

            {/* Path connector (except last item which is bottom-most) */}
            {index < invertedIslands.length - 1 && (
              <View style={styles.connector} />
            )}
          </View>
        )
      })}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingBottom: 40,
  },
  islandContainer: {
    alignItems: 'center',
    width: '100%',
  },
  islandCard: {
    width: '100%',
    backgroundColor: COLORS.bgCard,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
    marginBottom: 0,
  },
  islandCardCurrent: {
    borderColor: COLORS.accentPurple,
    borderWidth: 2,
    shadowColor: COLORS.accentPurple,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
  },
  islandCardLocked: {
    opacity: 0.5,
  },
  islandPressed: {
    transform: [{ scale: 0.98 }],
  },
  islandHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 16,
  },
  islandEmoji: {
    fontSize: 32,
  },
  islandInfo: {
    flex: 1,
  },
  islandName: {
    color: COLORS.textPrimary,
    fontSize: 18,
    fontWeight: '700',
  },
  islandSubtitle: {
    color: COLORS.textTertiary,
    fontSize: 13,
  },
  progressContainer: {
    gap: 8,
  },
  progressTextRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressLabel: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
  percentageLabel: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '700',
  },
  currentBadge: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: COLORS.accentPurple,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  currentBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '900',
  },
  connector: {
    width: 2,
    height: 40,
    backgroundColor: COLORS.borderSubtle,
    borderStyle: 'dashed',
    borderRadius: 1,
  },
})
