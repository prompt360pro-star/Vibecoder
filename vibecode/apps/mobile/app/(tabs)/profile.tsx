import { useMemo, type ReactNode } from 'react'
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Image } from 'expo-image'
import { router } from 'expo-router'
import { useAuth, useUser as useClerkUser } from '@clerk/clerk-expo'
import * as Haptics from 'expo-haptics'
import Animated from 'react-native-reanimated'
import { COLORS } from '@vibecode/shared'
import GradientBackground from '../../components/ui/gradient-background'
import XpBar from '../../components/gamification/xp-bar'
import Button from '../../components/ui/button'
import { SkeletonProfile } from '../../components/ui/skeleton'
import Text from '../../components/ui/text'
import { useGlowPulse, useStaggerIn } from '../../lib/animations'
import { useAchievements } from '../../hooks/use-achievements'
import { useStreak } from '../../hooks/use-streak'
import { useUser } from '../../hooks/use-user'

interface AvatarProps {
  url?: string | null
  name?: string | null
  size?: number
}

function StaggerItem({ index, children }: { index: number; children: ReactNode }) {
  const animatedStyle = useStaggerIn(index, 80)
  return <Animated.View style={animatedStyle}>{children}</Animated.View>
}

function Avatar({ url, name, size = 80 }: AvatarProps) {
  if (url) {
    return (
      <Image
        source={{ uri: url }}
        style={[
          styles.avatarImage,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
          },
        ]}
      />
    )
  }

  const initials =
    name
      ?.split(' ')
      .map((word) => word[0])
      .slice(0, 2)
      .join('')
      .toUpperCase() || '?'

  return (
    <View
      style={[
        styles.avatarFallback,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
        },
      ]}
    >
      <Text style={[styles.avatarInitials, { fontSize: size * 0.35 }]}>{initials}</Text>
    </View>
  )
}

export default function ProfileScreen() {
  const { signOut } = useAuth()
  const { user } = useUser()
  const { user: clerkUser } = useClerkUser()
  const { earned } = useAchievements()
  const { data: streak } = useStreak()
  const avatarGlowStyle = useGlowPulse()

  const recentAchievements = useMemo(() => {
    return [...earned]
      .sort(
        (left, right) =>
          new Date(right.earnedAt ?? 0).getTime() -
          new Date(left.earnedAt ?? 0).getTime(),
      )
      .slice(0, 3)
  }, [earned])

  const recentDays = useMemo(() => {
    const calendarMap = new Map((streak?.calendar ?? []).map((day) => [day.date, day]))
    const weekdayLabels = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S']

    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date()
      date.setUTCHours(0, 0, 0, 0)
      date.setUTCDate(date.getUTCDate() - (6 - index))

      const key = date.toISOString().slice(0, 10)
      const item = calendarMap.get(key)

      return {
        key,
        label: weekdayLabels[date.getUTCDay()] ?? '?',
        completed: item?.completed ?? false,
        freezeUsed: item?.freezeUsed ?? false,
      }
    })
  }, [streak?.calendar])

  const xpProgressText = useMemo(() => {
    if (!user) return ''

    const xpRequired = user.levelInfo.xpRequired ?? 0
    const xpRemainingForNextLevel = user.levelInfo.xpRemainingForNextLevel ?? 0

    if (xpRemainingForNextLevel <= 0) {
      return 'Nível máximo atingido'
    }

    const xpInCurrentLevel = Math.max(0, user.totalXp - xpRequired)
    const xpNeededForNext = xpInCurrentLevel + xpRemainingForNextLevel

    return `${xpInCurrentLevel} / ${xpNeededForNext} XP para nível ${user.currentLevel + 1}`
  }, [user])

  const handlePress = (
    path: '/profile/settings' | '/profile/achievements' | '/profile/streak',
  ) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    router.push(path)
  }

  const handleSignOut = () => {
    Alert.alert('Terminar Sessão', 'Tens a certeza que queres terminar a sessão?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Terminar',
        style: 'destructive',
        onPress: async () => {
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
          await signOut()
          router.replace('/(auth)/sign-in')
        },
      },
    ])
  }

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <GradientBackground variant="profile" />
        <ScrollView contentContainerStyle={styles.loadingWrapper}>
          <SkeletonProfile />
        </ScrollView>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <GradientBackground variant="profile" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.heroSection}>
          <Animated.View style={[styles.avatarGlowWrap, avatarGlowStyle]}>
            <Avatar url={clerkUser?.imageUrl ?? user.avatarUrl} name={user.name} />
          </Animated.View>
          <Text style={styles.name}>{user.name ?? 'Coder'}</Text>
          <Text style={styles.username}>@{user.username ?? 'vibecoder'}</Text>
          {user.bio ? <Text style={styles.bio}>{user.bio}</Text> : null}
          <Button
            title="Editar Perfil"
            variant="secondary"
            size="sm"
            onPress={() => handlePress('/profile/settings')}
          />
        </View>

        <View style={styles.statsRow}>
          <StaggerItem index={0}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{user.streakDays}</Text>
              <Text style={styles.statLabel}>🔥 dias streak</Text>
            </View>
          </StaggerItem>
          <StaggerItem index={1}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{user.currentLevel}</Text>
              <Text style={styles.statLabel}>⚡ nível</Text>
            </View>
          </StaggerItem>
          <StaggerItem index={2}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{user.totalXp.toLocaleString()}</Text>
              <Text style={styles.statLabel}>💎 XP total</Text>
            </View>
          </StaggerItem>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Nível {user.currentLevel} - {user.levelTitle}
          </Text>
          <XpBar currentXp={user.totalXp} />
          <Text style={styles.sectionMeta}>{xpProgressText}</Text>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>🏆 Conquistas</Text>
            <Pressable onPress={() => handlePress('/profile/achievements')}>
              <Text style={styles.linkText}>Ver todas →</Text>
            </Pressable>
          </View>
          {recentAchievements.length === 0 ? (
            <Text style={styles.emptyText}>Completa a tua primeira missão!</Text>
          ) : (
            <View style={styles.achievementRow}>
              {recentAchievements.map((achievement) => (
                <View key={achievement.id} style={styles.achievementItem}>
                  <View style={styles.achievementBadge}>
                    <Text style={styles.achievementEmoji}>{achievement.emoji}</Text>
                  </View>
                  <Text style={styles.achievementTitle} numberOfLines={2}>
                    {achievement.title}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>🔥 Streak</Text>
            <Pressable onPress={() => handlePress('/profile/streak')}>
              <Text style={styles.linkText}>Ver calendário →</Text>
            </Pressable>
          </View>
          <View style={styles.weekRow}>
            {recentDays.map((day) => (
              <View key={day.key} style={styles.weekDay}>
                <View
                  style={[
                    styles.weekDot,
                    day.completed && styles.weekDotCompleted,
                    day.freezeUsed && styles.weekDotFreeze,
                  ]}
                >
                  <Text style={styles.weekDotText}>{day.freezeUsed ? '❄️' : ''}</Text>
                </View>
                <Text style={styles.weekLabel}>{day.label}</Text>
              </View>
            ))}
          </View>
        </View>

        <Pressable style={styles.signOutButton} onPress={handleSignOut}>
          <Text style={styles.signOutText}>Terminar Sessão</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bgPrimary },
  loadingWrapper: {
    paddingTop: 16,
    paddingBottom: 40,
  },
  content: { padding: 20, gap: 20 },
  heroSection: { alignItems: 'center', gap: 10 },
  avatarGlowWrap: {
    borderRadius: 999,
  },
  avatarImage: {
    backgroundColor: COLORS.bgCard,
  },
  avatarFallback: {
    backgroundColor: COLORS.accentPurple,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitials: { color: COLORS.textPrimary, fontWeight: '700' },
  name: { color: COLORS.textPrimary, fontSize: 24, fontWeight: '700' },
  username: { color: COLORS.textMuted, fontSize: 14 },
  bio: {
    color: COLORS.textSecondary,
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
  statsRow: { flexDirection: 'row', gap: 12 },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.bgElevated,
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    gap: 6,
  },
  statValue: { color: COLORS.textPrimary, fontSize: 24, fontWeight: '700' },
  statLabel: { color: COLORS.textMuted, fontSize: 12, textAlign: 'center' },
  section: {
    backgroundColor: COLORS.bgSecondary,
    borderRadius: 20,
    padding: 16,
    gap: 14,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: { color: COLORS.textPrimary, fontSize: 18, fontWeight: '700' },
  sectionMeta: { color: COLORS.textMuted, fontSize: 12 },
  linkText: { color: COLORS.accentPurple, fontSize: 13, fontWeight: '600' },
  emptyText: { color: COLORS.textMuted, fontSize: 14, textAlign: 'center' },
  achievementRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  achievementItem: { flex: 1, alignItems: 'center', gap: 8 },
  achievementBadge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.bgCard,
    justifyContent: 'center',
    alignItems: 'center',
  },
  achievementEmoji: { fontSize: 28 },
  achievementTitle: {
    color: COLORS.textMuted,
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 14,
  },
  weekRow: { flexDirection: 'row', justifyContent: 'space-between' },
  weekDay: { alignItems: 'center', gap: 8 },
  weekDot: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.bgCard,
    justifyContent: 'center',
    alignItems: 'center',
  },
  weekDotCompleted: { backgroundColor: COLORS.accentGreen },
  weekDotFreeze: { backgroundColor: COLORS.accentBlue },
  weekDotText: { fontSize: 14 },
  weekLabel: { color: COLORS.textMuted, fontSize: 12 },
  signOutButton: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.redAlpha10,
    paddingVertical: 16,
    alignItems: 'center',
  },
  signOutText: { color: COLORS.accentRed, fontSize: 15, fontWeight: '600' },
})
