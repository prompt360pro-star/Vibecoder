// Card — 3 variantes (default, highlighted, elevated)
import type { ReactNode } from 'react'
import {
  Pressable,
  View,
  StyleSheet,
  type ViewStyle,
  type StyleProp,
} from 'react-native'
import * as Haptics from 'expo-haptics'

type CardVariant = 'default' | 'highlighted' | 'elevated'

interface CardProps {
  children: ReactNode
  variant?: CardVariant
  style?: StyleProp<ViewStyle>
  onPress?: () => void
}

export default function Card({
  children,
  variant = 'default',
  style,
  onPress,
}: CardProps) {
  const handlePress = async () => {
    if (!onPress) return
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    onPress()
  }

  const variantStyle =
    variant === 'highlighted'
      ? styles.highlighted
      : variant === 'elevated'
        ? styles.elevated
        : styles.default

  if (onPress) {
    return (
      <Pressable
        onPress={handlePress}
        style={({ pressed }) => [
          styles.base,
          variantStyle,
          pressed && styles.pressed,
          style,
        ]}
      >
        {children}
      </Pressable>
    )
  }

  return (
    <View style={[styles.base, variantStyle, style]}>
      {children}
    </View>
  )
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 20,
    padding: 16,
  },
  default: {
    backgroundColor: '#1A1A2E',
  },
  highlighted: {
    backgroundColor: '#1A1A2E',
    borderWidth: 1,
    borderColor: '#8B5CF6',
  },
  elevated: {
    backgroundColor: '#1E1E3A',
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
})
