import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { useAuth } from '@clerk/clerk-expo'
import Animated from 'react-native-reanimated'
import { COLORS, ISLANDS } from '@vibecode/shared'
import Card from '../../components/ui/card'
import Button from '../../components/ui/button'
import GradientBackground from '../../components/ui/gradient-background'
import { SkeletonProfile } from '../../components/ui/skeleton'
import Text from '../../components/ui/text'
import IslandMap from '../../components/gamification/island-map'
import StreakBadge from '../../components/gamification/streak-badge'
import XpBar from '../../components/gamification/xp-bar'
import { useGlowPulse, usePressScale, useStaggerIn } from '../../lib/animations'
import { useMissions } from '../../hooks/use-missions'
import { useStreak } from '../../hooks/use-streak'
import { useUser } from '../../hooks/use-user'

interface StaggerItemProps {
  index: number
  children: ReactNode
  style?: object
}

interface ContinueCardProps {
  title: string
  subtitle: string
  label: string
  emoji: string
  onPress?: () => void
  disabled?: boolean
}

function StaggerItem({ index, children, style }: StaggerItemProps) {
  const animatedStyle = useStaggerIn(index, 80)
  return <Animated.View style={[animatedStyle, style]}>{children}</Animated.View>
}

function ContinueCard({
  title,
  subtitle,
  label,
  emoji,
  onPress,
  disabled = false,
}: ContinueCardProps) {
  const glowStyle = useGlowPulse()
  const { onPressIn, onPressOut, style: pressScaleStyle } = usePressScale(0.97)

  return (
    <Animated.View style={[glowStyle, pressScaleStyle]}>
      <Card
        variant="highlighted"
        onPress={disabled ? undefined : onPress}
        style={[styles.continueCard, disabled && styles.continueCardStatic]}
      >
        <View
          onTouchStart={disabled ? undefined : onPressIn}
          onTouchEnd={disabled ? undefined : onPressOut}
          style={styles.continueCardInner}
        >
          <View style={styles.continueContent}>
            <Text style={styles.continueLabel}>{label}</Text>
            <Text variant="h3" style={styles.missionTitle}>
              {title}
            </Text>
            <Text variant="caption" style={styles.zoneTitle}>
              {subtitle}
            </Text>
          </View>
          <View style={styles.continueIcon}>
            <Text style={styles.continueEmoji}>{emoji}</Text>
          </View>
        </View>
      </Card>
    </Animated.View>
  )
}

export default function HomeScreen() {
  const router = useRouter()
  const { signOut } = useAuth()
  const { user, isLoading, refetch: refetchUser } = useUser()
  const { data: streak, refetch: refetchStreak } = useStreak()
  const { data: missions, refetch: refetchMissions } = useMissions()
  const [refreshing, setRefreshing] = useState(false)
  const [timedOut, setTimedOut] = useState(false)

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    await Promise.all([refetchUser(), refetchStreak(), refetchMissions()])
    setRefreshing(false)
  }, [refetchMissions, refetchStreak, refetchUser])

  useEffect(() => {
    setTimedOut(false)
    const timer = setTimeout(() => {
      if (!user) setTimedOut(true)
    }, 10000)

    return () => clearTimeout(timer)
  }, [user])

  const nextMission = useMemo(() => {
    const availableMissions = (missions ?? [])
      .filter((mission) => mission.status === 'AVAILABLE')
      .sort((left, right) => left.order - right.order)

    return availableMissions[0] ?? null
  }, [missions])

  const continueMeta = useMemo(() => {
    if (!nextMission) {
      return { islandName: '', zoneName: '' }
    }

    for (const island of ISLANDS) {
      const zone = island.zones.find((currentZone) => currentZone.id === nextMission.zoneId)
      if (zone) {
        return { islandName: island.name, zoneName: zone.name }
      }
    }

    return { islandName: '', zoneName: '' }
  }, [nextMission])

  // CORRECÇÃO 3: Calcular progresso real das ilhas a partir das missões completas
  const completedMissions = useMemo(() => {
    const empty = { basic: 0, intermediate: 0, advanced: 0, expert: 0 }
    if (!missions) return empty

    // O tipo MissionWithProgress usa mission.id (ex: 'm01', 'm02', etc.)
    // As ilhas são identificadas pelo prefixo: m01-m30 = basic, m31-m75 = intermediate, etc.
    return {
      basic: missions.filter(
        (m) => m.status === 'COMPLETED' && /^m(0[1-9]|[12][0-9]|30)$/.test(m.id),
      ).length,
      intermediate: missions.filter(
        (m) => m.status === 'COMPLETED' && /^m(3[1-9]|[4-6][0-9]|75)$/.test(m.id),
      ).length,
      advanced: missions.filter(
        (m) => m.status === 'COMPLETED' && /^m(7[6-9]|8[0-9])$/.test(m.id),
      ).length,
      expert: missions.filter(
        (m) => m.status === 'COMPLETED' && /^m(9[0-9]|1[0-5][0-9])$/.test(m.id),
      ).length,
    }
  }, [missions])

  if (isLoading && !user) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <GradientBackground variant="home" />
        <ScrollView contentContainerStyle={styles.loadingScroll} showsVerticalScrollIndicator={false}>
          <SkeletonProfile />
        </ScrollView>
      </SafeAreaView>
    )
  }

  if (timedOut && !user) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <GradientBackground variant="home" />
        <View style={styles.errorState}>
          <Text style={styles.errorTitle}>Perfil não encontrado</Text>
          <Text style={styles.errorText}>
            A sessão carregou, mas os dados do perfil não chegaram a tempo.
          </Text>
          <Button
            title="Terminar Sessão"
            variant="secondary"
            onPress={async () => {
              await signOut()
              router.replace('/(auth)/sign-in')
            }}
          />
        </View>
      </SafeAreaView>
    )
  }

  if (!user) {
    return null
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <GradientBackground variant="home" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.accentPurple} />
        }
      >
        <StaggerItem index={0}>
          <View style={styles.header}>
            <View>
              <Text variant="h2" style={styles.greeting}>
                Olá, {user.name?.split(' ')[0] || 'Coder'}! 👋
              </Text>
              <Text variant="body" style={styles.subGreeting}>
                Vamos construir algo incrível?
              </Text>
            </View>
            <StreakBadge days={streak?.current || 0} />
          </View>
        </StaggerItem>

        <StaggerItem index={1}>
          <XpBar currentXp={user.totalXp} style={styles.xpBar} />
        </StaggerItem>

        <StaggerItem index={2}>
          <Card variant="elevated" style={styles.dailyCard}>
            <View style={styles.dailyHeader}>
              <Text style={styles.dailyEmoji}>⚡</Text>
              <View style={styles.dailyTextGroup}>
                <Text variant="h3">Desafio Diário</Text>
                <Text variant="caption">Completa hoje para proteger o streak.</Text>
              </View>
            </View>
            <Button title="ACEITAR" variant="secondary" size="sm" onPress={() => { }} style={styles.dailyButton} />
          </Card>
        </StaggerItem>

        <StaggerItem index={3}>
          <View style={styles.sectionHeader}>
            <Text variant="h3">🗺️ A tua jornada</Text>
          </View>
        </StaggerItem>

        <StaggerItem index={4}>
          <IslandMap
            userLevel={user.currentLevel}
            completedMissions={completedMissions}
            onIslandPress={(id) => router.push(`/island/${id}`)}
          />
        </StaggerItem>

        <StaggerItem index={5}>
          {nextMission ? (
            <ContinueCard
              label="▶ CONTINUAR"
              title={nextMission.title}
              subtitle={`${continueMeta.islandName} • ${continueMeta.zoneName}`}
              emoji="🚀"
              onPress={() => router.push(`/mission/${nextMission.id}`)}
            />
          ) : (
            <ContinueCard
              label="▶ TUDO COMPLETO"
              title="🎉 Ilha completa!"
              subtitle="Próxima aventura em breve..."
              emoji="🏝️"
              disabled
            />
          )}
        </StaggerItem>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgPrimary,
  },
  loadingScroll: {
    paddingTop: 16,
    paddingBottom: 40,
  },
  errorState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    gap: 16,
  },
  errorTitle: {
    color: COLORS.textPrimary,
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
  },
  errorText: {
    color: COLORS.textSecondary,
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    maxWidth: 320,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  greeting: {
    fontSize: 20,
  },
  subGreeting: {
    color: COLORS.textTertiary,
    fontSize: 14,
  },
  xpBar: {
    marginBottom: 24,
  },
  dailyCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    marginBottom: 32,
  },
  dailyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  dailyTextGroup: {
    flex: 1,
  },
  dailyEmoji: {
    fontSize: 32,
  },
  dailyButton: {
    paddingHorizontal: 16,
    marginLeft: 12,
  },
  sectionHeader: {
    marginBottom: 16,
  },
  continueCard: {
    marginTop: 32,
    backgroundColor: COLORS.purpleAlpha10,
    borderColor: 'rgba(139, 92, 246, 0.35)',
  },
  continueCardStatic: {
    opacity: 0.7,
  },
  continueCardInner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  continueContent: {
    flex: 1,
  },
  continueLabel: {
    color: COLORS.accentPurple,
    fontSize: 12,
    fontWeight: '900',
    marginBottom: 4,
  },
  missionTitle: {
    color: COLORS.textPrimary,
    fontSize: 16,
    marginBottom: 2,
  },
  zoneTitle: {
    color: COLORS.textTertiary,
  },
  continueIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  continueEmoji: {
    fontSize: 24,
  },
})
