import { useEffect, useRef } from 'react'
import { Animated, StyleSheet, View, type ViewStyle } from 'react-native'
import Text from '../ui/text'
import { COLORS } from '@vibecode/shared'
import * as Haptics from 'expo-haptics'

interface AchievementToastProps {
  visible: boolean
  achievement: {
    name: string
    emoji: string
    xpReward: number
  }
  onClose: () => void
}

export default function AchievementToast({
  visible,
  achievement,
  onClose,
}: AchievementToastProps) {
  const transY = useRef(new Animated.Value(-100)).current

  useEffect(() => {
    if (visible) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
      
      Animated.sequence([
        Animated.spring(transY, {
          toValue: 20,
          useNativeDriver: true,
          tension: 40,
          friction: 7,
        }),
        Animated.delay(3000),
        Animated.timing(transY, {
          toValue: -150,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        onClose()
      })
    }
  }, [visible, transY, onClose])

  if (!visible) return null

  return (
    <Animated.View 
      style={[
        styles.container, 
        { transform: [{ translateY: transY }] }
      ]}
    >
      <View style={styles.content}>
        <Text style={styles.emoji}>{achievement.emoji}</Text>
        <View style={styles.info}>
          <Text style={styles.title}>Unlock: {achievement.name}</Text>
          <Text style={styles.xp}>+{achievement.xpReward} XP</Text>
        </View>
      </View>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 40,
    left: 16,
    right: 16,
    zIndex: 9999,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E1E3A',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.accentPurple,
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  emoji: {
    fontSize: 32,
  },
  info: {
    flex: 1,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  xp: {
    color: COLORS.accentPurple,
    fontSize: 13,
    fontWeight: '700',
    marginTop: 2,
  },
})
