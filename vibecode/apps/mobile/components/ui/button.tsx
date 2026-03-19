import { useEffect, type ReactNode } from 'react'
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import * as Haptics from 'expo-haptics'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated'
import { usePressScale, useShimmer } from '../../lib/animations'

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

const GRADIENT_COLORS = ['#8B5CF6', '#3B82F6'] as const
const SHIMMER_COLORS = ['transparent', 'rgba(255,255,255,0.12)', 'transparent'] as const

const sizeSurfaceStyles = StyleSheet.create({
  sm: { height: 36 },
  md: { height: 44 },
  lg: { height: 52 },
  xl: { height: 56 },
})

const sizeTextStyles = StyleSheet.create({
  sm: { fontSize: 13 },
  md: { fontSize: 14 },
  lg: { fontSize: 15 },
  xl: { fontSize: 16 },
})

const variantSurfaceStyles = StyleSheet.create({
  secondary: {
    backgroundColor: '#1A1A2E',
    borderWidth: 1,
    borderColor: '#333333',
  },
  destructive: {
    backgroundColor: 'rgba(239,68,68,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.3)',
  },
  ghost: {
    backgroundColor: 'transparent',
  },
})

const variantTextStyles = StyleSheet.create({
  primary: { color: '#FFFFFF' },
  secondary: { color: '#FFFFFF' },
  destructive: { color: '#EF4444' },
  ghost: { color: '#CCCCCC', fontWeight: '500' },
})

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
  const isDisabled = disabled || loading
  const { onPressIn, onPressOut, style: pressScaleStyle } = usePressScale(0.97)
  const shimmerStyle = useShimmer(360, 2200)
  const opacity = useSharedValue(isDisabled ? 0.5 : 1)

  useEffect(() => {
    opacity.value = withTiming(isDisabled ? 0.5 : 1, { duration: 180 })
  }, [isDisabled, opacity])

  const animatedContainerStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }))

  const handlePress = async () => {
    if (isDisabled) return
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    onPress()
  }

  const indicatorColor =
    variant === 'destructive' ? '#EF4444' : variant === 'ghost' ? '#CCCCCC' : '#FFFFFF'

  const content = (
    <>
      {variant === 'primary' && !isDisabled ? (
        <Animated.View style={[styles.shimmer, shimmerStyle]}>
          <LinearGradient
            colors={SHIMMER_COLORS}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.shimmerGradient}
          />
        </Animated.View>
      ) : null}

      <View style={[styles.content, loading && styles.contentHidden]}>
        {icon ? <View style={styles.iconWrap}>{icon}</View> : null}
        <Text style={[styles.text, sizeTextStyles[size], variantTextStyles[variant]]}>
          {title}
        </Text>
      </View>

      {loading ? (
        <View style={styles.loaderOverlay}>
          <ActivityIndicator color={indicatorColor} size="small" />
        </View>
      ) : null}
    </>
  )

  return (
    <Animated.View style={[styles.base, pressScaleStyle, animatedContainerStyle, style]}>
      <Pressable
        disabled={isDisabled}
        onPress={handlePress}
        onPressIn={isDisabled ? undefined : onPressIn}
        onPressOut={isDisabled ? undefined : onPressOut}
        style={styles.pressable}
      >
        {variant === 'primary' ? (
          <LinearGradient
            colors={GRADIENT_COLORS}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.surface, sizeSurfaceStyles[size]]}
          >
            {content}
          </LinearGradient>
        ) : (
          <View
            style={[
              styles.surface,
              sizeSurfaceStyles[size],
              variantSurfaceStyles[variant],
            ]}
          >
            {content}
          </View>
        )}
      </Pressable>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  pressable: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  surface: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    borderRadius: 12,
    overflow: 'hidden',
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: '100%',
  },
  contentHidden: {
    opacity: 0,
  },
  iconWrap: {
    marginRight: 8,
  },
  text: {
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  shimmer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: -100,
    width: 80,
    overflow: 'hidden',
    transform: [{ skewX: '-20deg' }],
  },
  shimmerGradient: {
    flex: 1,
  },
  loaderOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
})
