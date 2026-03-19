import { Pressable, StyleSheet, type StyleProp, type ViewStyle } from 'react-native'
import * as Haptics from 'expo-haptics'
import Animated from 'react-native-reanimated'
import { COLORS } from '@vibecode/shared'
import { useFloat, useGlowPulse, usePulse } from '../../lib/animations'
import Text from '../ui/text'

interface StreakBadgeProps {
  days: number
  style?: StyleProp<ViewStyle>
  onPress?: () => void
}

export default function StreakBadge({ days, style, onPress }: StreakBadgeProps) {
  const floatStyle = useFloat(3, 2200)
  const flamePulseStyle = usePulse(0.88, 1.15, 900)
  const glowStyle = useGlowPulse()
  const isHot = days >= 7
  const isFire = days >= 30

  const handlePress = () => {
    if (!onPress) return
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    onPress()
  }

  return (
    <Animated.View style={[floatStyle, isHot && glowStyle, style]}>
      <Pressable
        onPress={handlePress}
        style={[
          styles.container,
          isHot && styles.hotContainer,
          isFire && styles.fireContainer,
        ]}
      >
        <Animated.View style={flamePulseStyle}>
          <Text style={styles.emoji}>🔥</Text>
        </Animated.View>
        <Text
          style={[
            styles.days,
            days === 0 && styles.daysDefault,
            days > 0 && styles.daysHot,
            isFire && styles.daysFire,
          ]}
        >
          {days}
        </Text>
      </Pressable>
    </Animated.View>
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
    borderColor: 'rgba(255,255,255,0.1)',
    gap: 6,
  },
  hotContainer: {
    borderColor: '#F59E0B',
    backgroundColor: 'rgba(245,158,11,0.12)',
  },
  fireContainer: {
    borderColor: '#EF4444',
    backgroundColor: 'rgba(239,68,68,0.12)',
  },
  emoji: {
    fontSize: 16,
  },
  days: {
    fontSize: 15,
    fontWeight: '700',
  },
  daysDefault: {
    color: 'rgba(255,255,255,0.5)',
  },
  daysHot: {
    color: '#F59E0B',
  },
  daysFire: {
    color: '#EF4444',
  },
})
