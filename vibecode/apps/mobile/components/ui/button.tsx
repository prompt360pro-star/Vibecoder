// Button — 4 variantes (primary, secondary, destructive, ghost) + 4 tamanhos
import { type ReactNode } from 'react'
import {
  Pressable,
  Text,
  StyleSheet,
  ActivityIndicator,
  View,
  type ViewStyle,
  type StyleProp,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import * as Haptics from 'expo-haptics'

type ButtonVariant = 'primary' | 'secondary' | 'destructive' | 'ghost'
type ButtonSize = 'sm' | 'md' | 'lg' | 'xl'

interface ButtonProps {
  title: string
  onPress: () => void
  variant?: ButtonVariant
  size?: ButtonSize
  disabled?: boolean
  icon?: ReactNode
  loading?: boolean
  style?: StyleProp<ViewStyle>
}

const HEIGHTS: Record<ButtonSize, number> = {
  sm: 36,
  md: 44,
  lg: 52,
  xl: 56,
}

const FONT_SIZES: Record<ButtonSize, number> = {
  sm: 13,
  md: 14,
  lg: 15,
  xl: 16,
}

export default function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  icon,
  loading = false,
  style,
}: ButtonProps) {
  const height = HEIGHTS[size]
  const fontSize = FONT_SIZES[size]

  const handlePress = async () => {
    if (disabled || loading) return
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    onPress()
  }

  const renderContent = () => (
    <View style={[styles.content, { height }]}>
      {loading ? (
        <ActivityIndicator
          color={variant === 'destructive' ? '#EF4444' : '#FFFFFF'}
          size="small"
        />
      ) : (
        <>
          {icon ? <View style={styles.iconWrap}>{icon}</View> : null}
          <Text
            style={[
              styles.text,
              { fontSize },
              variant === 'secondary' && styles.textSecondary,
              variant === 'destructive' && styles.textDestructive,
              variant === 'ghost' && styles.textGhost,
            ]}
          >
            {title}
          </Text>
        </>
      )}
    </View>
  )

  // Primary usa LinearGradient
  if (variant === 'primary') {
    return (
      <Pressable
        onPress={handlePress}
        disabled={disabled || loading}
        style={({ pressed }) => [
          styles.base,
          pressed && styles.pressed,
          (disabled || loading) && styles.disabled,
          style,
        ]}
      >
        <LinearGradient
          colors={['#8B5CF6', '#3B82F6']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.gradient, { height, borderRadius: 12 }]}
        >
          {renderContent()}
        </LinearGradient>
      </Pressable>
    )
  }

  // Outros variants
  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.base,
        variant === 'secondary' && [styles.secondary, { height }],
        variant === 'destructive' && [styles.destructive, { height }],
        variant === 'ghost' && [styles.ghost, { height }],
        pressed && styles.pressed,
        (disabled || loading) && styles.disabled,
        style,
      ]}
    >
      {renderContent()}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  gradient: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  iconWrap: {
    marginRight: 8,
  },
  text: {
    color: '#FFFFFF',
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  textSecondary: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  textDestructive: {
    color: '#EF4444',
    fontWeight: '600',
  },
  textGhost: {
    color: '#CCCCCC',
    fontWeight: '500',
  },
  secondary: {
    backgroundColor: '#1A1A2E',
    borderWidth: 1,
    borderColor: '#333333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  destructive: {
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  ghost: {
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  disabled: {
    opacity: 0.5,
  },
})
