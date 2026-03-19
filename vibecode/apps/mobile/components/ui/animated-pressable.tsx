import { useEffect } from 'react'
import type { ReactNode } from 'react'
import { Pressable, StyleSheet, type StyleProp, type ViewStyle } from 'react-native'
import * as Haptics from 'expo-haptics'
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated'
import { usePressScale } from '../../lib/animations'

type HapticType = 'light' | 'medium' | 'success' | 'error' | 'none'

interface AnimatedPressableProps {
  onPress?: () => void
  onLongPress?: () => void
  disabled?: boolean
  haptic?: HapticType
  scaleValue?: number
  style?: StyleProp<ViewStyle>
  children: ReactNode
}

export default function AnimatedPressable({
  onPress,
  onLongPress,
  disabled = false,
  haptic = 'light',
  scaleValue = 0.95,
  style,
  children,
}: AnimatedPressableProps) {
  const { onPressIn, onPressOut, style: scaleStyle } = usePressScale(scaleValue)
  const opacity = useSharedValue(disabled ? 0.5 : 1)

  useEffect(() => {
    opacity.value = withTiming(disabled ? 0.5 : 1, { duration: 180 })
  }, [disabled, opacity])

  const opacityStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }))

  const handlePress = () => {
    if (disabled) {
      return
    }

    if (haptic === 'light') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    } else if (haptic === 'medium') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    } else if (haptic === 'success') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    } else if (haptic === 'error') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
    }

    onPress?.()
  }

  return (
    <Animated.View style={[styles.container, scaleStyle, opacityStyle, style]}>
      <Pressable
        disabled={disabled}
        onPress={handlePress}
        onLongPress={onLongPress}
        onPressIn={disabled ? undefined : onPressIn}
        onPressOut={disabled ? undefined : onPressOut}
        style={styles.pressable}
      >
        {children}
      </Pressable>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignSelf: 'stretch',
  },
  pressable: {
    alignSelf: 'stretch',
  },
})
