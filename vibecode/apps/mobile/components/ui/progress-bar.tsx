// ProgressBar — Barra de progresso animada
import { useEffect, useRef } from 'react'
import {
  View,
  Animated,
  StyleSheet,
  type ViewStyle,
  type StyleProp,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'

type ProgressVariant = 'default' | 'thick' | 'gradient'

interface ProgressBarProps {
  progress: number // 0-1
  variant?: ProgressVariant
  color?: string
  height?: number
  style?: StyleProp<ViewStyle>
}

export default function ProgressBar({
  progress,
  variant = 'default',
  color = '#8B5CF6',
  height: customHeight,
  style,
}: ProgressBarProps) {
  const animatedWidth = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.spring(animatedWidth, {
      toValue: Math.min(Math.max(progress, 0), 1),
      useNativeDriver: false,
      friction: 8,
      tension: 40,
    }).start()
  }, [progress, animatedWidth])

  const defaultHeight = variant === 'thick' ? 8 : 4
  const height = customHeight || defaultHeight

  const widthInterpolation = animatedWidth.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  })

  return (
    <View style={[styles.track, { height, borderRadius: height / 2 }, style]}>
      <Animated.View
        style={[
          styles.fill,
          {
            width: widthInterpolation,
            height,
            borderRadius: height / 2,
          },
        ]}
      >
        {variant === 'gradient' ? (
          <LinearGradient
            colors={[color, '#3B82F6']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.gradientFill, { height, borderRadius: height / 2 }]}
          />
        ) : (
          <View
            style={[
              styles.solidFill,
              { backgroundColor: color, height, borderRadius: height / 2 },
            ]}
          />
        )}
      </Animated.View>
    </View>
  )
}

const styles = StyleSheet.create({
  track: {
    backgroundColor: '#222222',
    overflow: 'hidden',
    width: '100%',
  },
  fill: {
    overflow: 'hidden',
  },
  gradientFill: {
    flex: 1,
    width: '100%',
  },
  solidFill: {
    flex: 1,
    width: '100%',
  },
})
