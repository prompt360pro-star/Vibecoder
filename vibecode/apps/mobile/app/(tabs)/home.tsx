import { View, StyleSheet, ScrollView, RefreshControl, Platform } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { useState, useCallback } from 'react'
import Text from '../../components/ui/text'
import Card from '../../components/ui/card'
import Button from '../../components/ui/button'
import XpBar from '../../components/gamification/xp-bar'
import StreakBadge from '../../components/gamification/streak-badge'
import IslandMap from '../../components/gamification/island-map'
import { useUser } from '../../hooks/use-user'
import { useStreak } from '../../hooks/use-streak'
import { COLORS } from '@vibecode/shared'

export default function HomeScreen() {
  const router = useRouter()
  const { user, isLoading: isUserLoading, refetch: refetchUser } = useUser()
  const { data: streak, isLoading: isStreakLoading, refetch: refetchStreak } = useStreak()
  const [refreshing, setRefreshing] = useState(false)

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    await Promise.all([refetchUser(), refetchStreak()])
    setRefreshing(false)
  }, [refetchUser, refetchStreak])

  if (isUserLoading || !user) {
    return (
      <View style={styles.loadingContainer}>
        <Text>A carregar o teu mundo...</Text>
      </View>
    )
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.accentPurple} />
        }
      >
        {/* HEADER */}
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

        {/* XP BAR */}
        <XpBar currentXp={user.totalXp} style={styles.xpBar} />

        {/* DAILY CHALLENGE */}
        <Card variant="elevated" style={styles.dailyCard}>
          <View style={styles.dailyHeader}>
            <Text style={styles.dailyEmoji}>⚡</Text>
            <View>
              <Text variant="h3">Desafio Diário</Text>
              <Text variant="caption">Complete para manter seu streak!</Text>
            </View>
          </View>
          <Button 
            title="ACEITAR" 
            variant="secondary" 
            size="sm" 
            onPress={() => {}}
            style={styles.dailyButton} 
          />
        </Card>

        {/* JOURNEY SECTION */}
        <View style={styles.sectionHeader}>
          <Text variant="h3">🗺️ Sua Jornada</Text>
        </View>

        <IslandMap 
          userLevel={user.currentLevel}
          completedMissions={{ basic: 0, intermediate: 0, advanced: 0, expert: 0 }}
          onIslandPress={(id) => router.push(`/island/${id}`)}
        />

        {/* CONTINUE CARD */}
        <Pressable
          style={({ pressed }) => [
            styles.continueCard,
            pressed && styles.continuePressed
          ]}
        >
          <View style={styles.continueContent}>
            <Text style={styles.continueLabel}>▶ CONTINUAR</Text>
            <Text variant="h3" style={styles.missionTitle}>O que é Vibe Coding?</Text>
            <Text variant="caption" style={styles.zoneTitle}>Ilha Básica • Fundamentos</Text>
          </View>
          <View style={styles.continueIcon}>
            <Text style={{ fontSize: 24 }}>🏝️</Text>
          </View>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  )
}

import { Pressable } from 'react-native'

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgPrimary,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: COLORS.bgPrimary,
    justifyContent: 'center',
    alignItems: 'center',
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
  },
  dailyEmoji: {
    fontSize: 32,
  },
  dailyButton: {
    paddingHorizontal: 16,
  },
  sectionHeader: {
    marginBottom: 16,
  },
  continueCard: {
    marginTop: 32,
    backgroundColor: COLORS.purpleAlpha10,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  continuePressed: {
    opacity: 0.8,
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
    color: '#FFFFFF',
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
})
