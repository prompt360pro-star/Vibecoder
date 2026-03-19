import { Pressable, ScrollView, StyleSheet, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import { COLORS } from '@vibecode/shared'
import ProgressBar from '../../components/ui/progress-bar'
import Text from '../../components/ui/text'
import { useStreak } from '../../hooks/use-streak'

const WEEKDAY_HEADERS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S']

function buildCalendarGrid(calendar: { date: string; completed: boolean; freezeUsed: boolean }[] = []) {
  const today = new Date()
  today.setUTCHours(0, 0, 0, 0)

  const currentWeekStart = new Date(today)
  currentWeekStart.setUTCDate(today.getUTCDate() - today.getUTCDay())

  const startDate = new Date(currentWeekStart)
  startDate.setUTCDate(currentWeekStart.getUTCDate() - 28)

  const calendarMap = new Map(calendar.map((day) => [day.date, day]))

  return Array.from({ length: 35 }, (_, index) => {
    const date = new Date(startDate)
    date.setUTCDate(startDate.getUTCDate() + index)
    const key = date.toISOString().slice(0, 10)
    const item = calendarMap.get(key)

    return {
      key,
      isToday: key === today.toISOString().slice(0, 10),
      isFuture: date > today,
      completed: item?.completed ?? false,
      freezeUsed: item?.freezeUsed ?? false,
      dayNumber: date.getUTCDate(),
    }
  })
}

export default function StreakScreen() {
  const { data, isLoading } = useStreak()
  const calendar = buildCalendarGrid(data?.calendar)
  const progress = data?.nextBonus ? Math.min(data.current / data.nextBonus.days, 1) : 1

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingState}>
          <Text style={styles.loadingText}>A carregar streak...</Text>
        </View>
      </SafeAreaView>
    )
  }

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
        <Text style={styles.headerTitle}>Streak</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <Text style={styles.heroValue}>{data?.current ?? 0}</Text>
          <Text style={styles.heroLabel}>dias consecutivos</Text>
          <Text style={styles.heroMeta}>
            {(data?.current ?? 0) === 0 ? 'Começa hoje! 🚀' : 'Mantém o ritmo até à meia-noite.'}
          </Text>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statTitle}>Recorde</Text>
            <Text style={styles.statValue}>{data?.longest ?? 0} dias</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statTitle}>Freezes disponíveis</Text>
            <Text style={styles.statValue}>{data?.freezesAvailable ?? 0} ❄️</Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.calendarHeader}>
            {WEEKDAY_HEADERS.map((label) => (
              <Text key={label} style={styles.calendarWeekday}>{label}</Text>
            ))}
          </View>
          <View style={styles.calendarGrid}>
            {calendar.map((day) => (
              <View
                key={day.key}
                style={[
                  styles.calendarCell,
                  day.completed && styles.calendarCellCompleted,
                  day.freezeUsed && styles.calendarCellFreeze,
                  day.isToday && !day.completed && styles.calendarCellToday,
                  day.isToday && day.completed && styles.calendarCellTodayCompleted,
                  day.isFuture && styles.calendarCellFuture,
                ]}
              >
                <Text style={styles.calendarCellText}>
                  {day.freezeUsed ? '❄️' : day.isFuture ? '' : day.dayNumber}
                </Text>
              </View>
            ))}
          </View>
          <View style={styles.legend}>
            <Text style={styles.legendText}>• Verde = completo</Text>
            <Text style={styles.legendText}>• Azul = freeze</Text>
            <Text style={styles.legendText}>• Vazio = perdido</Text>
          </View>
        </View>

        {data?.nextBonus ? (
          <View style={styles.bonusCard}>
            <Text style={styles.bonusTitle}>Próximo bónus: {data.nextBonus.days} dias</Text>
            <Text style={styles.bonusMeta}>Faltam {Math.max(data.nextBonus.days - data.current, 0)} dias</Text>
            <Text style={styles.bonusMeta}>+{data.nextBonus.xpBonus} XP de bónus</Text>
            <ProgressBar progress={progress} color={COLORS.accentYellow} height={10} variant="gradient" />
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bgPrimary },
  loadingState: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: COLORS.textMuted, fontSize: 14 },
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
  headerSpacer: { width: 40 },
  content: { padding: 16, gap: 20 },
  hero: { alignItems: 'center', gap: 6, paddingVertical: 12 },
  heroValue: { color: COLORS.accentYellow, fontSize: 64, fontWeight: '700' },
  heroLabel: { color: COLORS.textPrimary, fontSize: 18, fontWeight: '600' },
  heroMeta: { color: COLORS.textMuted, fontSize: 14 },
  statsRow: { flexDirection: 'row', gap: 12 },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.bgSecondary,
    borderRadius: 18,
    padding: 16,
    gap: 8,
  },
  statTitle: { color: COLORS.textMuted, fontSize: 12 },
  statValue: { color: COLORS.textPrimary, fontSize: 18, fontWeight: '700' },
  section: {
    backgroundColor: COLORS.bgSecondary,
    borderRadius: 18,
    padding: 16,
    gap: 14,
  },
  calendarHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  calendarWeekday: { width: '13%', color: COLORS.textMuted, fontSize: 12, textAlign: 'center' },
  calendarGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  calendarCell: {
    width: '12.4%',
    aspectRatio: 1,
    borderRadius: 16,
    backgroundColor: COLORS.bgCard,
    opacity: 0.4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  calendarCellCompleted: { backgroundColor: COLORS.accentGreen, opacity: 1 },
  calendarCellFreeze: { backgroundColor: COLORS.accentBlue, opacity: 1 },
  calendarCellToday: { borderWidth: 2, borderColor: COLORS.accentPurple, opacity: 1 },
  calendarCellTodayCompleted: { backgroundColor: COLORS.accentPurple },
  calendarCellFuture: { backgroundColor: 'transparent', opacity: 1 },
  calendarCellText: { color: COLORS.textPrimary, fontSize: 12, fontWeight: '600' },
  legend: { gap: 4 },
  legendText: { color: COLORS.textMuted, fontSize: 12 },
  bonusCard: {
    backgroundColor: COLORS.yellowAlpha10,
    borderRadius: 18,
    padding: 16,
    gap: 10,
    borderWidth: 1,
    borderColor: COLORS.accentYellow,
  },
  bonusTitle: { color: COLORS.textPrimary, fontSize: 18, fontWeight: '700' },
  bonusMeta: { color: COLORS.textSecondary, fontSize: 13 },
})
