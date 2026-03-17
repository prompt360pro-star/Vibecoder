// VibeCode — Tela de Streak Detail
import { useRef, useEffect } from 'react'
import { ScrollView, View, StyleSheet, Pressable, Animated } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import Text from '../../components/ui/text'
import { COLORS, STREAK_BONUSES } from '@vibecode/shared'
import { useStreak, type StreakInfo } from '../../hooks/use-streak'

// Streak data with calendar
interface StreakWithCalendar extends StreakInfo {
  calendar?: { date: string; completed: boolean; freezeUsed: boolean }[]
}

// Nomes dos dias da semana
const WEEK_DAYS = ['SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB', 'DOM']

// Calendário mensal do mês actual
function buildMonthGrid(calendar: { date: string; completed: boolean; freezeUsed: boolean }[] = []) {
  const now = new Date()
  const year = now.getUTCFullYear()
  const month = now.getUTCMonth()

  // Primeiro dia do mês
  const firstDay = new Date(Date.UTC(year, month, 1))
  // Dia da semana do primeiro dia (0=Dom → ajustar para Seg=0)
  let startDow = firstDay.getUTCDay() - 1
  if (startDow < 0) startDow = 6

  const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate()

  const calMap = new Map(calendar.map((c) => [c.date, c]))
  const todayStr = now.toISOString().slice(0, 10)

  // Grid com células vazias no início
  const cells: ({ day: number; dateStr: string; completed: boolean; freezeUsed: boolean; isToday: boolean } | null)[] = []
  for (let i = 0; i < startDow; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    const c = calMap.get(dateStr)
    cells.push({
      day: d,
      dateStr,
      completed: c?.completed ?? false,
      freezeUsed: c?.freezeUsed ?? false,
      isToday: dateStr === todayStr,
    })
  }

  return cells
}

export default function StreakScreen() {
  const { data: streakRaw, isLoading } = useStreak()
  const streak = streakRaw as StreakWithCalendar | undefined

  // Animação de pulso para o emoji de fogo
  const pulse = useRef(new Animated.Value(1)).current
  useEffect(() => {
    if ((streak?.current ?? 0) > 0) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulse, { toValue: 1.15, duration: 600, useNativeDriver: true }),
          Animated.timing(pulse, { toValue: 1, duration: 600, useNativeDriver: true }),
        ])
      ).start()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [streak?.current])

  const currentStreak = streak?.current ?? 0
  const longestStreak = streak?.longest ?? 0
  const freezesAvailable = streak?.freezesAvailable ?? 0
  const nextBonus = streak?.nextBonus ?? null
  const calendar = streak?.calendar ?? []

  // Calcular total de dias activos e freezes usados do calendário
  const totalDaysActive = calendar.filter((c) => c.completed && !c.freezeUsed).length
  const freezesUsed = calendar.filter((c) => c.freezeUsed).length
  const MAX_FREEZES = 2 // FREE tier

  const monthCells = buildMonthGrid(calendar)
  const monthName = new Date().toLocaleDateString('pt-PT', { month: 'long', year: 'numeric' })
  const progressToNext = nextBonus
    ? Math.min(currentStreak / nextBonus.days, 1)
    : 1

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loading}><Text style={{ color: COLORS.textMuted }}>A carregar...</Text></View>
      </SafeAreaView>
    )
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
        <Text style={styles.headerTitle}>STREAK</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Topo: fogo + número */}
        <View style={styles.heroSection}>
          <Animated.Text style={[styles.fireEmoji, { transform: [{ scale: pulse }] }]}>
            🔥
          </Animated.Text>
          <View style={styles.streakNumberRow}>
            <Text style={styles.streakNumber}>{currentStreak}</Text>
            <Text style={styles.streakDiasLabel}>DIAS</Text>
          </View>
          <Text style={styles.recordText}>Seu recorde: {longestStreak} dias</Text>
        </View>

        {/* Calendário */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📅 {monthName.toUpperCase()}</Text>
          <View style={styles.calendar}>
            {/* Cabeçalho dias semana */}
            {WEEK_DAYS.map((d) => (
              <View key={d} style={styles.calCell}>
                <Text style={styles.calDayName}>{d}</Text>
              </View>
            ))}
            {/* Células do mês */}
            {monthCells.map((cell, i) => {
              if (!cell) {
                return <View key={`empty-${i}`} style={styles.calCell} />
              }
              return (
                <View
                  key={cell.dateStr}
                  style={[
                    styles.calCell,
                    styles.calDayCell,
                    cell.isToday && styles.calToday,
                    cell.completed && !cell.freezeUsed && styles.calCompleted,
                    cell.freezeUsed && styles.calFreeze,
                  ]}
                >
                  <Text style={[
                    styles.calDayNum,
                    cell.isToday && { color: COLORS.accentPurple },
                    cell.completed && !cell.freezeUsed && { color: COLORS.accentYellow },
                    cell.freezeUsed && { color: COLORS.accentCyan },
                  ]}>
                    {cell.completed ? (cell.freezeUsed ? '❄️' : '🔥') : cell.day}
                  </Text>
                </View>
              )
            })}
          </View>
        </View>

        {/* Freeze Tokens */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>❄️ STREAK FREEZES</Text>
          <View style={styles.freezeCard}>
            <View style={styles.freezeTokens}>
              {Array.from({ length: MAX_FREEZES }).map((_, i) => (
                <Text key={i} style={[styles.freezeToken, i >= freezesAvailable && { opacity: 0.2 }]}>
                  ❄️
                </Text>
              ))}
            </View>
            <Text style={styles.freezeAvailText}>Disponíveis: {freezesAvailable}/{MAX_FREEZES}</Text>
            <Text style={styles.freezeHint}>
              Um freeze protege o teu streak por 1 dia sem actividade. Ganhas +1 freeze a cada 7 dias de streak.
            </Text>
          </View>
        </View>

        {/* Próximo Bónus */}
        {nextBonus && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🎁 PRÓXIMO BÓNUS</Text>
            <View style={styles.bonusCard}>
              <View style={styles.bonusHeader}>
                <Text style={styles.bonusEmoji}>{nextBonus.emoji}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.bonusTitle}>
                    {nextBonus.days} dias → +{nextBonus.xpBonus.toLocaleString()} XP
                  </Text>
                  <Text style={styles.bonusMsg}>{nextBonus.message}</Text>
                </View>
              </View>
              <View style={styles.bonusTrack}>
                <View style={[styles.bonusFill, { width: `${progressToNext * 100}%` as `${number}%` }]} />
              </View>
              <Text style={styles.bonusFaltam}>
                {Math.max(nextBonus.days - currentStreak, 0)} dias até o bónus!
              </Text>
            </View>
          </View>
        )}

        {/* Estatísticas */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📊 ESTATÍSTICAS</Text>
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{totalDaysActive}</Text>
              <Text style={styles.statLabel}>Total dias activos</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{longestStreak}</Text>
              <Text style={styles.statLabel}>Melhor streak</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{freezesUsed}</Text>
              <Text style={styles.statLabel}>Freezes usados</Text>
            </View>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bgPrimary },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: COLORS.borderSubtle,
  },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  headerTitle: { color: COLORS.textPrimary, fontSize: 14, fontWeight: '800', letterSpacing: 2 },

  scrollContent: { paddingHorizontal: 16 },

  heroSection: { alignItems: 'center', paddingVertical: 32 },
  fireEmoji: { fontSize: 64, marginBottom: 8 },
  streakNumberRow: { flexDirection: 'row', alignItems: 'baseline', gap: 8 },
  streakNumber: { color: COLORS.textPrimary, fontSize: 56, fontWeight: '900' },
  streakDiasLabel: { color: COLORS.textMuted, fontSize: 16, fontWeight: '700', letterSpacing: 2 },
  recordText: { color: COLORS.textMuted, fontSize: 14, marginTop: 8 },

  section: { marginBottom: 24 },
  sectionTitle: {
    color: COLORS.textMuted, fontSize: 11, fontWeight: '700',
    letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 12,
  },

  // Calendário
  calendar: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  calCell: { width: '13%', alignItems: 'center', paddingVertical: 4 },
  calDayName: { color: COLORS.textMuted, fontSize: 10, fontWeight: '600' },
  calDayCell: { borderRadius: 8, minHeight: 36, justifyContent: 'center' },
  calDayNum: { color: COLORS.textTertiary, fontSize: 13 },
  calToday: { borderWidth: 1.5, borderColor: COLORS.accentPurple },
  calCompleted: { backgroundColor: 'rgba(245, 158, 11, 0.15)' },
  calFreeze: { backgroundColor: 'rgba(6, 182, 212, 0.15)' },

  // Freeze tokens
  freezeCard: { backgroundColor: COLORS.bgCard, borderRadius: 16, padding: 16, gap: 8 },
  freezeTokens: { flexDirection: 'row', gap: 8 },
  freezeToken: { fontSize: 32 },
  freezeAvailText: { color: COLORS.accentCyan, fontSize: 14, fontWeight: '700' },
  freezeHint: { color: COLORS.textMuted, fontSize: 13, lineHeight: 18 },

  // Bónus card
  bonusCard: { backgroundColor: COLORS.bgCard, borderRadius: 16, padding: 16, gap: 10 },
  bonusHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  bonusEmoji: { fontSize: 36 },
  bonusTitle: { color: COLORS.textPrimary, fontSize: 15, fontWeight: '700' },
  bonusMsg: { color: COLORS.textMuted, fontSize: 12 },
  bonusTrack: { height: 8, backgroundColor: COLORS.bgElevated, borderRadius: 4, overflow: 'hidden' },
  bonusFill: { height: 8, backgroundColor: COLORS.accentYellow, borderRadius: 4 },
  bonusFaltam: { color: COLORS.accentYellow, fontSize: 13, fontWeight: '600' },

  // Stats
  statsRow: { flexDirection: 'row', gap: 10 },
  statCard: {
    flex: 1, backgroundColor: COLORS.bgCard, borderRadius: 12,
    padding: 14, alignItems: 'center', gap: 4,
  },
  statValue: { color: COLORS.textPrimary, fontSize: 22, fontWeight: '800' },
  statLabel: { color: COLORS.textMuted, fontSize: 11, textAlign: 'center' },
})
