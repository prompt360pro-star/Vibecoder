import { Pressable, ScrollView, StyleSheet, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import { COLORS } from '@vibecode/shared'
import ProgressBar from '../../components/ui/progress-bar'
import Text from '../../components/ui/text'
import { useAchievements, type Achievement, type NearMissAchievement } from '../../hooks/use-achievements'

interface AchievementCardProps {
  achievement: Achievement
  variant: 'earned' | 'locked'
}

function AchievementCard({ achievement, variant }: AchievementCardProps) {
  const isEarned = variant === 'earned'

  return (
    <View style={[styles.achievementCard, !isEarned && styles.lockedCard]}>
      <Text style={[styles.cardEmoji, !isEarned && styles.lockedEmoji]}>{achievement.emoji}</Text>
      <Text style={styles.cardTitle}>{achievement.title}</Text>
      <Text style={styles.cardDescription}>{achievement.description}</Text>
      {isEarned ? <Text style={styles.xpBadge}>+{achievement.xpReward} XP</Text> : null}
      {isEarned && achievement.earnedAt ? (
        <Text style={styles.cardMeta}>
          Obtida em {new Date(achievement.earnedAt).toLocaleDateString('pt-PT')}
        </Text>
      ) : null}
    </View>
  )
}

function NearMissCard({ achievement }: { achievement: NearMissAchievement }) {
  const progress = Math.min(achievement.progress.current / achievement.progress.required, 1)

  return (
    <View style={styles.nearMissCard}>
      <View style={styles.nearMissHeader}>
        <Text style={styles.cardEmoji}>{achievement.emoji}</Text>
        <View style={styles.nearMissInfo}>
          <Text style={styles.cardTitle}>{achievement.title}</Text>
          <Text style={styles.cardMeta}>
            {achievement.progress.current}/{achievement.progress.required} {achievement.progress.label}
          </Text>
        </View>
      </View>
      <ProgressBar progress={progress} color={COLORS.accentYellow} height={8} variant="gradient" />
    </View>
  )
}

export default function AchievementsScreen() {
  const { earned, available, nearMisses, stats, isLoading } = useAchievements()
  const unlockedVisible = available.filter((achievement) => !achievement.isSecret)

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
            router.back()
          }}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={22} color={COLORS.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>Conquistas</Text>
        <View style={styles.headerBadge}>
          <Text style={styles.headerBadgeText}>{stats.totalEarned}/{stats.totalAvailable}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Conclusão geral</Text>
          <ProgressBar progress={stats.completionPct / 100} variant="gradient" height={10} />
          <Text style={styles.summaryMeta}>{stats.completionPct}% completo</Text>
        </View>

        {isLoading ? (
          <View style={styles.grid}>
            {Array.from({ length: 6 }, (_, index) => (
              <View key={index} style={styles.skeletonCard} />
            ))}
          </View>
        ) : (
          <>
            {earned.length > 0 ? (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Obtidas</Text>
                <View style={styles.grid}>
                  {earned.map((achievement) => (
                    <AchievementCard key={achievement.id} achievement={achievement} variant="earned" />
                  ))}
                </View>
              </View>
            ) : null}

            {nearMisses.length > 0 ? (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Quase lá 🎯</Text>
                <View style={styles.stack}>
                  {nearMisses.map((achievement) => (
                    <NearMissCard key={achievement.id} achievement={achievement} />
                  ))}
                </View>
              </View>
            ) : null}

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Por desbloquear</Text>
              <View style={styles.grid}>
                {unlockedVisible.map((achievement) => (
                  <AchievementCard key={achievement.id} achievement={achievement} variant="locked" />
                ))}
              </View>
            </View>
          </>
        )}
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
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderSubtle,
  },
  backButton: { width: 40, height: 40, justifyContent: 'center' },
  headerTitle: { color: COLORS.textPrimary, fontSize: 20, fontWeight: '700' },
  headerBadge: {
    minWidth: 64,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: COLORS.purpleAlpha20,
    alignItems: 'center',
  },
  headerBadgeText: { color: COLORS.textPrimary, fontSize: 12, fontWeight: '700' },
  content: { padding: 16, gap: 20 },
  summaryCard: {
    backgroundColor: COLORS.bgSecondary,
    borderRadius: 18,
    padding: 16,
    gap: 12,
  },
  summaryLabel: { color: COLORS.textPrimary, fontSize: 16, fontWeight: '700' },
  summaryMeta: { color: COLORS.textMuted, fontSize: 12 },
  section: { gap: 12 },
  sectionTitle: { color: COLORS.textPrimary, fontSize: 18, fontWeight: '700' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  stack: { gap: 12 },
  achievementCard: {
    width: '48%',
    backgroundColor: COLORS.bgCard,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.purpleAlpha20,
    gap: 8,
  },
  lockedCard: { opacity: 0.5 },
  nearMissCard: {
    backgroundColor: COLORS.bgCard,
    borderRadius: 16,
    padding: 14,
    gap: 12,
  },
  nearMissHeader: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  nearMissInfo: { flex: 1, gap: 4 },
  cardEmoji: { fontSize: 36 },
  lockedEmoji: { opacity: 0.4 },
  cardTitle: { color: COLORS.textPrimary, fontSize: 14, fontWeight: '700' },
  cardDescription: { color: COLORS.textMuted, fontSize: 12, lineHeight: 16 },
  cardMeta: { color: COLORS.textMuted, fontSize: 11 },
  xpBadge: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.purpleAlpha20,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
    color: COLORS.textPrimary,
    fontSize: 11,
    fontWeight: '700',
  },
  skeletonCard: {
    width: '48%',
    height: 150,
    borderRadius: 16,
    backgroundColor: COLORS.bgCard,
    opacity: 0.5,
  },
})
