import { StyleSheet } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'

type GradientVariant = 'home' | 'mission' | 'vi' | 'social' | 'profile' | 'trail'

interface GradientBackgroundProps {
  variant?: GradientVariant
}

const GRADIENTS: Record<GradientVariant, readonly [string, string, string]> = {
  home: ['#0A0A0F', '#0D0915', '#0A0A0F'],
  mission: ['#0A0A0F', '#0D0A17', '#080F0A'],
  vi: ['#0A0A0F', '#070E1A', '#0A0A0F'],
  social: ['#0A0A0F', '#140A10', '#0A0A0F'],
  profile: ['#0A0A0F', '#0C0915', '#0A0A0F'],
  trail: ['#0A0A0F', '#0A0F0D', '#0A0A0F'],
}

export default function GradientBackground({
  variant = 'home',
}: GradientBackgroundProps) {
  return (
    <LinearGradient
      colors={GRADIENTS[variant]}
      locations={[0, 0.5, 1]}
      pointerEvents="none"
      style={styles.fill}
    />
  )
}

const styles = StyleSheet.create({
  fill: {
    ...StyleSheet.absoluteFillObject,
  },
})
