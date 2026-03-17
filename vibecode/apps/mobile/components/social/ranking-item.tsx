import React from 'react'
import { View, StyleSheet, Image } from 'react-native'
import Text from '../ui/text'
import { COLORS } from '@vibecode/shared'
import type { RankingEntry } from '../../hooks/use-social'

interface RankingItemProps {
  entry: RankingEntry
  isMe: boolean
}

export function RankingItem({ entry, isMe }: RankingItemProps) {
  const isTop3 = entry.position <= 3
  
  let medal = ''
  if (entry.position === 1) medal = '🥇'
  else if (entry.position === 2) medal = '🥈'
  else if (entry.position === 3) medal = '🥉'

  return (
    <View style={[styles.container, isMe && styles.meContainer]}>
      <View style={styles.positionBox}>
        {isTop3 ? (
          <Text style={styles.medal}>{medal}</Text>
        ) : (
          <Text style={[styles.positionText, isMe && { color: COLORS.accentPurple }]}>
            {entry.position}
          </Text>
        )}
      </View>

      {entry.avatarUrl ? (
        <Image source={{ uri: entry.avatarUrl }} style={styles.avatar} />
      ) : (
        <View style={styles.avatarPlaceholder}>
          <Text style={styles.avatarInitial}>
            {(entry.name?.charAt(0) || 'U').toUpperCase()}
          </Text>
        </View>
      )}

      <View style={styles.info}>
         <Text style={[styles.name, isMe && { color: '#FFF' }]} numberOfLines={1}>
           {entry.name}
         </Text>
         <Text style={styles.username}>
           {entry.username ? `@${entry.username}` : ''}
         </Text>
      </View>

      <View style={styles.xpBox}>
         <Text style={styles.xpValue}>{entry.xp.toLocaleString()}</Text>
         <Text style={styles.xpLabel}>XP</Text>
         <Text style={styles.trend}>═</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bgCard,
    borderRadius: 12,
    height: 64,
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  meContainer: {
    backgroundColor: COLORS.purpleAlpha10,
    borderWidth: 1,
    borderColor: COLORS.accentPurple,
  },
  
  positionBox: { width: 32, alignItems: 'center', justifyContent: 'center' },
  medal: { fontSize: 22 },
  positionText: { color: COLORS.textMuted, fontSize: 16, fontWeight: '700' },
  
  avatar: { width: 40, height: 40, borderRadius: 20, marginLeft: 8 },
  avatarPlaceholder: {
    width: 40, height: 40, borderRadius: 20, marginLeft: 8,
    backgroundColor: COLORS.bgElevated,
    justifyContent: 'center', alignItems: 'center'
  },
  avatarInitial: { color: COLORS.accentPurple, fontSize: 18, fontWeight: '700' },
  
  info: { flex: 1, marginLeft: 12, justifyContent: 'center' },
  name: { color: COLORS.textPrimary, fontSize: 16, fontWeight: '600' },
  username: { color: COLORS.textMuted, fontSize: 13, marginTop: 2 },
  
  xpBox: { alignItems: 'flex-end', justifyContent: 'center', flexDirection: 'row', gap: 6 },
  xpValue: { color: COLORS.accentYellow, fontSize: 16, fontWeight: '800' },
  xpLabel: { color: COLORS.textMuted, fontSize: 11, marginBottom: 2 },
  trend: { color: COLORS.textMuted, fontSize: 12, marginLeft: 4, marginBottom: 2 }
})
