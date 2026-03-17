// VibeCode — Tela de Conquistas
import { useState } from 'react'
import { ScrollView, View, StyleSheet, Pressable } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import Text from '../../components/ui/text'
import { COLORS, ACHIEVEMENTS } from '@vibecode/shared'
import { useAchievements, type AchievementWithProgress } from '../../hooks/use-achievements'

type FilterTab = 'todas' | 'ganhas' | 'proximas'

// Mapa de categoria para label pt
const CATEGORY_LABELS: Record<string, string> = {
  inicio: 'Início',
  missoes: 'Missões',
  ilhas: 'Ilhas',
  streak: 'Consistência',
  vi: 'IA & Vi',
  social: 'Social',
  projetos: 'Projectos',
  nivel: 'Nível',
  secreto: 'Secretas',
}

// Grupo achievements por categoria preservando a ordem de ACHIEVEMENTS
function groupByCategory(list: AchievementWithProgress[]): Record<string, AchievementWithProgress[]> {
  const groups: Record<string, AchievementWithProgress[]> = {}
  for (const ach of list) {
    const cat = (ach as { category?: string }).category ?? 'outros'
    if (!groups[cat]) groups[cat] = []
    groups[cat]!.push(ach)
  }
  return groups
}

// Card de achievement individual
interface AchievementCardProps {
  achievement: AchievementWithProgress
  state: 'earned' | 'near-miss' | 'locked'
}
function AchievementCard({ achievement, state }: AchievementCardProps) {
  const isEarned = state === 'earned'
  const isNearMiss = state === 'near-miss'
  const isLocked = state === 'locked'
  const isSecret = (achievement as { isSecret?: boolean }).isSecret

  const displayName = isSecret && isLocked ? '???' : achievement.name
  const displayDesc = isSecret && isLocked ? 'Conquista secreta' : achievement.description

  let pct = 0
  if (isNearMiss && achievement.progress) {
    pct = achievement.progress.required > 0
      ? Math.min(achievement.progress.current / achievement.progress.required, 1)
      : 0
  }

  return (
    <View style={[
      styles.card,
      isNearMiss && styles.cardNearMiss,
      isLocked && styles.cardLocked,
    ]}>
      <View style={styles.cardLeft}>
        <Text style={[styles.cardEmoji, (isLocked || isNearMiss) && { opacity: isLocked ? 0.4 : 1 }]}>
          {isSecret && isLocked ? '🔒' : achievement.emoji}
        </Text>
      </View>
      <View style={styles.cardBody}>
        <Text style={[styles.cardName, isLocked && styles.cardNameLocked]}>{displayName}</Text>
        <Text style={styles.cardDesc} numberOfLines={2}>{displayDesc}</Text>
        {isEarned && achievement.earnedAt && (
          <Text style={styles.cardDate}>
            Ganho a {new Date(achievement.earnedAt).toLocaleDateString('pt-PT')}
          </Text>
        )}
        {isNearMiss && achievement.progress && (
          <>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${pct * 100}%` as `${number}%` }]} />
            </View>
            <Text style={styles.nearMissLabel}>
              Faltam {achievement.progress.required - achievement.progress.current}!
            </Text>
          </>
        )}
      </View>
      {isEarned && (
        <View style={styles.cardBadge}>
          <Text style={{ fontSize: 16 }}>✅</Text>
        </View>
      )}
      {isNearMiss && (
        <View style={[styles.cardBadge, { backgroundColor: COLORS.yellowAlpha10 }]}>
          <Text style={{ fontSize: 14 }}>🔜</Text>
        </View>
      )}
    </View>
  )
}

export default function AchievementsScreen() {
  const [tab, setTab] = useState<FilterTab>('todas')
  const { earned, available, nearMisses, isLoading } = useAchievements()

  const earnedIds = new Set(earned.map((a) => a.id))
  const nearMissIds = new Set(nearMisses.map((a) => a.id))

  // Construir lista filtrada
  let listToShow: AchievementWithProgress[] = []
  if (tab === 'ganhas') {
    listToShow = earned
  } else if (tab === 'proximas') {
    listToShow = nearMisses
  } else {
    // Todas — juntar earned + nearMisses + available (sem duplicados)
    const allIds = new Set<string>()
    const all: AchievementWithProgress[] = []
    for (const ach of [...earned, ...nearMisses, ...available]) {
      if (!allIds.has(ach.id)) {
        allIds.add(ach.id)
        all.push(ach)
      }
    }
    // Ordenar por ordem de ACHIEVEMENTS
    const orderMap = new Map(ACHIEVEMENTS.map((a, i) => [a.id, i]))
    listToShow = all.sort((a, b) => (orderMap.get(a.id) ?? 999) - (orderMap.get(b.id) ?? 999))
  }

  const groups = groupByCategory(listToShow)

  const getState = (id: string): 'earned' | 'near-miss' | 'locked' => {
    if (earnedIds.has(id)) return 'earned'
    if (nearMissIds.has(id)) return 'near-miss'
    return 'locked'
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
            router.back()
          }}
          style={styles.backBtn}
        >
          <Ionicons name="arrow-back" size={22} color={COLORS.textPrimary} />
        </Pressable>
        <View>
          <Text style={styles.headerTitle}>CONQUISTAS</Text>
          <Text style={styles.headerSubtitle}>{earned.length} de 45 desbloqueadas</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      {/* Filter tabs */}
      <View style={styles.tabs}>
        {([
          { key: 'todas', label: `Todas (${ACHIEVEMENTS.length})` },
          { key: 'ganhas', label: `Ganhas (${earned.length})` },
          { key: 'proximas', label: `Próximas (${nearMisses.length})` },
        ] as const).map((t) => (
          <Pressable
            key={t.key}
            style={[styles.tab, tab === t.key && styles.tabActive]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
              setTab(t.key)
            }}
          >
            <Text style={[styles.tabText, tab === t.key && styles.tabTextActive]}>
              {t.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {isLoading ? (
        <View style={styles.loading}>
          <Text style={{ color: COLORS.textMuted }}>A carregar...</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {Object.entries(groups).map(([cat, items]) => (
            <View key={cat} style={styles.categorySection}>
              <Text style={styles.categoryLabel}>{CATEGORY_LABELS[cat] ?? cat}</Text>
              <View style={styles.divider} />
              {items.map((ach) => (
                <AchievementCard
                  key={ach.id}
                  achievement={ach}
                  state={getState(ach.id)}
                />
              ))}
            </View>
          ))}
          <View style={{ height: 40 }} />
        </ScrollView>
      )}
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
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  headerTitle: { color: COLORS.textPrimary, fontSize: 14, fontWeight: '800', letterSpacing: 2, textAlign: 'center' },
  headerSubtitle: { color: COLORS.textMuted, fontSize: 12, textAlign: 'center' },

  tabs: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 12, gap: 8 },
  tab: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: COLORS.bgCard,
    alignItems: 'center',
  },
  tabActive: { backgroundColor: COLORS.accentPurple },
  tabText: { color: COLORS.textMuted, fontSize: 12, fontWeight: '600' },
  tabTextActive: { color: '#FFF' },

  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  scrollContent: { paddingHorizontal: 16, paddingTop: 8 },

  categorySection: { marginBottom: 20 },
  categoryLabel: { color: COLORS.textMuted, fontSize: 11, fontWeight: '700', letterSpacing: 1.5, textTransform: 'uppercase' },
  divider: { height: 1, backgroundColor: COLORS.borderSubtle, marginVertical: 8 },

  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bgCard,
    borderRadius: 16,
    padding: 14,
    marginBottom: 8,
    gap: 12,
  },
  cardNearMiss: {
    borderWidth: 1.5,
    borderColor: COLORS.accentYellow,
  },
  cardLocked: { opacity: 0.5 },
  cardLeft: { width: 40, alignItems: 'center' },
  cardEmoji: { fontSize: 32 },
  cardBody: { flex: 1, gap: 3 },
  cardName: { color: COLORS.textPrimary, fontSize: 14, fontWeight: '700' },
  cardNameLocked: { color: COLORS.textMuted },
  cardDesc: { color: COLORS.textTertiary, fontSize: 12, lineHeight: 16 },
  cardDate: { color: COLORS.accentGreen, fontSize: 11 },
  cardBadge: { width: 32, height: 32, borderRadius: 16, backgroundColor: COLORS.greenAlpha10, justifyContent: 'center', alignItems: 'center' },

  progressTrack: { height: 4, backgroundColor: COLORS.bgElevated, borderRadius: 2, overflow: 'hidden', marginTop: 4 },
  progressFill: { height: 4, backgroundColor: COLORS.accentYellow, borderRadius: 2 },
  nearMissLabel: { color: COLORS.accentYellow, fontSize: 11, fontWeight: '600' },
})
