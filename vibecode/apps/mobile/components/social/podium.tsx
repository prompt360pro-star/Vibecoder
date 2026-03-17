import React from 'react'
import { View, StyleSheet, Image } from 'react-native'
import Text from '../ui/text'
import { COLORS } from '@vibecode/shared'
import type { RankingEntry } from '../../hooks/use-social'

interface PodiumProps {
  top3: RankingEntry[]
}

export function Podium({ top3 }: PodiumProps) {
  if (top3.length === 0) return null

  const first = top3.find((r) => r.position === 1)
  const second = top3.find((r) => r.position === 2)
  const third = top3.find((r) => r.position === 3)

  const renderPodiumItem = (user: RankingEntry | undefined, place: number) => {
    if (!user) return <View style={styles.podiumCol} />

    let height = 100
    let color: string = COLORS.accentGold
    let medal = '🥇'

    if (place === 2) {
      height = 75
      color = '#94A3B8' // Silver
      medal = '🥈'
    } else if (place === 3) {
      height = 60
      color = '#D97706' // Bronze
      medal = '🥉'
    }

    return (
      <View style={styles.podiumCol}>
        <View style={styles.avatarWrapper}>
          <Text style={styles.podiumMedal}>{medal}</Text>
          {user.avatarUrl ? (
            <Image source={{ uri: user.avatarUrl }} style={[styles.avatar, { borderColor: color }]} />
          ) : (
            <View style={[styles.avatarPlaceholder, { borderColor: color }]}>
              <Text style={[styles.avatarInitial, { color }]}>
                {(user.name?.charAt(0) || 'U').toUpperCase()}
              </Text>
            </View>
          )}
        </View>

        <Text style={styles.podiumName} numberOfLines={1}>{user.name}</Text>
        <Text style={styles.podiumXp}>{user.xp.toLocaleString()} XP</Text>

        <View style={[styles.bar, { height, backgroundColor: color }]} />
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.podiumRow}>
        {renderPodiumItem(second, 2)}
        {renderPodiumItem(first, 1)}
        {renderPodiumItem(third, 3)}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  podiumRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 220,
    gap: 8,
  },
  podiumCol: {
    width: 100,
    alignItems: 'center',
  },
  avatarWrapper: {
    alignItems: 'center',
    marginBottom: 8,
    position: 'relative',
  },
  podiumMedal: {
    fontSize: 24,
    position: 'absolute',
    top: -16,
    zIndex: 10,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 3,
  },
  avatarPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 3,
    backgroundColor: COLORS.bgElevated,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitial: {
    fontSize: 24,
    fontWeight: '800',
  },
  podiumName: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 4,
    textAlign: 'center',
  },
  podiumXp: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 12,
  },
  bar: {
    width: '100%',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    opacity: 0.9,
  },
})
