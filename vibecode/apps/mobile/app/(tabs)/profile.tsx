// VibeCode — Tela de Perfil Principal
import { ScrollView, View, StyleSheet, Pressable, Image } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import Text from '../../components/ui/text'
import { COLORS, ACHIEVEMENTS, ISLANDS } from '@vibecode/shared'
import { useUser } from '../../hooks/use-user'
import { useStreak } from '../../hooks/use-streak'
import { useAchievements } from '../../hooks/use-achievements'

// ── Utilidades ─────────────────────────────────────────────
function formatXp(xp: number): string {
  if (xp >= 1000) return `${(xp / 1000).toFixed(1)}k`
  return String(xp)
}

// ── Componente: StatCard ───────────────────────────────────
interface StatCardProps {
  emoji: string
  value: string | number
  label: string
  onPress?: () => void
}
function StatCard({ emoji, value, label, onPress }: StatCardProps) {
  return (
    <Pressable
      style={({ pressed }) => [styles.statCard, pressed && { opacity: 0.7 }]}
      onPress={onPress}
      disabled={!onPress}
    >
      <Text style={styles.statEmoji}>{emoji}</Text>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </Pressable>
  )
}

// ── Componente: LevelProgress Bar ─────────────────────────
interface LevelBarProps {
  emoji: string
  label: string
  completed: number
  total: number
  active: boolean
}
function LevelBar({ emoji, label, completed, total, active }: LevelBarProps) {
  const pct = total > 0 ? Math.min(completed / total, 1) : 0
  return (
    <View style={styles.levelBarRow}>
      <Text style={styles.levelBarEmoji}>{emoji}</Text>
      <View style={styles.levelBarContent}>
        <View style={styles.levelBarHeader}>
          <Text style={styles.levelBarLabel}>{label}</Text>
          <Text style={styles.levelBarCount}>
            {completed}/{total}
          </Text>
        </View>
        <View style={styles.levelBarTrack}>
          <View
            style={[
              styles.levelBarFill,
              { width: `${pct * 100}%` as `${number}%` },
              active ? styles.levelBarFillActive : styles.levelBarFillInactive,
            ]}
          />
        </View>
      </View>
      <Text style={[styles.levelBarPct, active && { color: COLORS.accentPurple }]}>
        {Math.round(pct * 100)}%
      </Text>
    </View>
  )
}

// ── Tela principal ─────────────────────────────────────────
export default function ProfileScreen() {
  const { user, isLoading } = useUser()
  const streak = useStreak()
  const { earned } = useAchievements()

  if (isLoading || !user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>A carregar perfil...</Text>
        </View>
      </SafeAreaView>
    )
  }

  // Contagem de achievements por categoria e estado
  const totalAchievements = ACHIEVEMENTS.length // 45
  const earnedCount = earned.length
  const firstEight = ACHIEVEMENTS.slice(0, 8)
  const earnedIds = new Set(earned.map((a) => a.id))

  // Island progress — usamos ISLANDS para totais
  // Para simplificar: missões completas por ilha viriam da useMissions()
  // Por now usamos 0 como placeholder real — seria conectado com useMissions()
  const islandProgress = [
    { emoji: '🏝️', label: 'Básica', total: 30, completed: 0, level: 'BASIC' },
    { emoji: '⛰️', label: 'Intermédia', total: 45, completed: 0, level: 'INTERMEDIATE' },
    { emoji: '🌋', label: 'Avançada', total: 50, completed: 0, level: 'ADVANCED' },
    { emoji: '🚀', label: 'Expert', total: 35, completed: 0, level: 'EXPERT' },
  ]

  const currentIslandLevel = user.currentLevel <= 10 ? 'BASIC'
    : user.currentLevel <= 20 ? 'INTERMEDIATE'
    : user.currentLevel <= 30 ? 'ADVANCED'
    : 'EXPERT'

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
            router.push('/profile/settings')
          }}
          style={styles.headerBtn}
        >
          <Ionicons name="settings-outline" size={22} color={COLORS.textMuted} />
        </Pressable>
        <Text style={styles.headerTitle}>PERFIL</Text>
        <Pressable style={styles.headerBtn}>
          <Ionicons name="pencil-outline" size={22} color={COLORS.textMuted} />
        </Pressable>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Avatar + Info */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarWrapper}>
            {user.avatarUrl ? (
              <Image source={{ uri: user.avatarUrl }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarInitial}>
                  {(user.name ?? 'U').charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
            {/* Level overlay */}
            <View style={styles.levelOverlay}>
              <Text style={styles.levelOverlayText}>Lv.{user.currentLevel}</Text>
            </View>
          </View>
          <Text style={styles.userName}>{user.name ?? 'Utilizador'}</Text>
          {user.username && (
            <Text style={styles.userHandle}>@{user.username}</Text>
          )}
          {user.bio && (
            <Text style={styles.userBio}>{user.bio}</Text>
          )}
          <Text style={styles.levelTitle}>{user.levelTitle}</Text>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <StatCard
            emoji="🔥"
            value={streak.data?.current ?? user.streakDays}
            label="Dias"
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
              router.push('/profile/streak')
            }}
          />
          <StatCard
            emoji="⚡"
            value={formatXp(user.totalXp)}
            label="XP Total"
          />
          <StatCard
            emoji="🏗️"
            value={0}
            label="Projetos"
          />
        </View>

        {/* Progresso por Nível */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📊 PROGRESSO</Text>
          {islandProgress.map((island) => (
            <LevelBar
              key={island.level}
              emoji={island.emoji}
              label={island.label}
              completed={island.completed}
              total={island.total}
              active={currentIslandLevel === island.level}
            />
          ))}
        </View>

        {/* Conquistas Preview */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              🏆 CONQUISTAS ({earnedCount}/{totalAchievements})
            </Text>
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                router.push('/profile/achievements')
              }}
            >
              <Text style={styles.seeAll}>Ver todas →</Text>
            </Pressable>
          </View>
          <View style={styles.achievementGrid}>
            {firstEight.map((ach) => {
              const isEarned = earnedIds.has(ach.id)
              return (
                <View
                  key={ach.id}
                  style={[styles.achievementBadge, !isEarned && styles.achievementLocked]}
                >
                  <Text style={[styles.achievementEmoji, !isEarned && { opacity: 0.3 }]}>
                    {ach.isSecret && !isEarned ? '🔒' : ach.emoji}
                  </Text>
                </View>
              )
            })}
          </View>
        </View>

        {/* Botões */}
        <View style={styles.buttonsRow}>
          <Pressable style={styles.btnPrimary}>
            <Text style={styles.btnPrimaryText}>🌐 VER MEU PORTFOLIO</Text>
          </Pressable>
          <Pressable style={styles.btnSecondary}>
            <Text style={styles.btnSecondaryText}>📜 MEUS CERTIFICADOS</Text>
          </Pressable>
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bgPrimary },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: COLORS.textMuted, fontSize: 14 },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderSubtle,
  },
  headerBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  headerTitle: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 2,
  },

  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 16 },

  // Avatar
  avatarSection: { alignItems: 'center', paddingVertical: 24 },
  avatarWrapper: { position: 'relative', marginBottom: 12 },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 3,
    borderColor: COLORS.accentPurple,
  },
  avatarPlaceholder: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: COLORS.bgCard,
    borderWidth: 3,
    borderColor: COLORS.accentPurple,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitial: { color: COLORS.accentPurple, fontSize: 36, fontWeight: '700' },
  levelOverlay: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: COLORS.accentPurple,
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  levelOverlayText: { color: '#FFF', fontSize: 11, fontWeight: '700' },
  userName: { color: COLORS.textPrimary, fontSize: 22, fontWeight: '700', marginBottom: 2 },
  userHandle: { color: COLORS.textMuted, fontSize: 14, marginBottom: 4 },
  userBio: { color: COLORS.textTertiary, fontSize: 14, textAlign: 'center', paddingHorizontal: 32, marginBottom: 6 },
  levelTitle: { color: COLORS.accentPurple, fontSize: 13, fontWeight: '600' },

  // Stats
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 24 },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.bgCard,
    borderRadius: 12,
    height: 72,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  statEmoji: { fontSize: 18 },
  statValue: { color: COLORS.textPrimary, fontSize: 20, fontWeight: '700' },
  statLabel: { color: COLORS.textMuted, fontSize: 11 },

  // Section
  section: { marginBottom: 24 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: 12,
  },
  seeAll: { color: COLORS.accentPurple, fontSize: 13, fontWeight: '600' },

  // Level bars
  levelBarRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 10 },
  levelBarEmoji: { fontSize: 20, width: 28 },
  levelBarContent: { flex: 1 },
  levelBarHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  levelBarLabel: { color: COLORS.textSecondary, fontSize: 13, fontWeight: '500' },
  levelBarCount: { color: COLORS.textMuted, fontSize: 12 },
  levelBarTrack: { height: 6, backgroundColor: COLORS.bgElevated, borderRadius: 3, overflow: 'hidden' },
  levelBarFill: { height: 6, borderRadius: 3 },
  levelBarFillActive: { backgroundColor: COLORS.accentPurple },
  levelBarFillInactive: { backgroundColor: '#333' },
  levelBarPct: { color: COLORS.textMuted, fontSize: 12, width: 36, textAlign: 'right' },

  // Achievement grid
  achievementGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  achievementBadge: {
    width: '21%',
    aspectRatio: 1,
    backgroundColor: COLORS.bgCard,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  achievementLocked: { opacity: 0.4 },
  achievementEmoji: { fontSize: 28 },

  // Buttons
  buttonsRow: { gap: 10 },
  btnPrimary: {
    height: 52,
    backgroundColor: COLORS.accentPurple,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnPrimaryText: { color: '#FFF', fontSize: 14, fontWeight: '700', letterSpacing: 1 },
  btnSecondary: {
    height: 52,
    backgroundColor: COLORS.bgCard,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.borderDefault,
  },
  btnSecondaryText: { color: COLORS.textSecondary, fontSize: 14, fontWeight: '600' },
})
