import { Pressable, StyleSheet, type ViewStyle } from 'react-native'
import Text from '../ui/text'
import { COLORS } from '@vibecode/shared'
import * as Haptics from 'expo-haptics'

interface StreakBadgeProps {
  days: number
  style?: ViewStyle
  onPress?: () => void
}

export default function StreakBadge({ days, style, onPress }: StreakBadgeProps) {
  const isHighStreak = days >= 7
  const textColor = days > 0 ? COLORS.accentYellow : COLORS.textMuted

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    onPress?.()
  }

  return (
    <Pressable
      onPress={handlePress}
      style={[
        styles.container,
        isHighStreak && styles.containerHigh,
        style
      ]}
    >
      <Text style={styles.emoji}>🔥</Text>
      <Text style={[styles.days, { color: textColor }]}>
        {days}
      </Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bgCard,
    height: 36,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
    gap: 6,
  },
  containerHigh: {
    borderColor: COLORS.accentYellow,
    shadowColor: COLORS.accentYellow,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  emoji: {
    fontSize: 16,
  },
  days: {
    fontSize: 15,
    fontWeight: '700',
  },
})
