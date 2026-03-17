// AppText — Typography presets para o design system VibeCode
import {
  Text as RNText,
  StyleSheet,
  type TextStyle,
  type StyleProp,
} from 'react-native'
import type { ReactNode } from 'react'

type TextVariant = 'h1' | 'h2' | 'h3' | 'body' | 'caption' | 'code' | 'label'

interface AppTextProps {
  variant?: TextVariant
  color?: string
  style?: StyleProp<TextStyle>
  children: ReactNode
  numberOfLines?: number
}

const VARIANT_STYLES: Record<TextVariant, TextStyle> = {
  h1: { fontSize: 28, fontWeight: '700', color: '#FFFFFF' },
  h2: { fontSize: 24, fontWeight: '700', color: '#FFFFFF' },
  h3: { fontSize: 20, fontWeight: '600', color: '#FFFFFF' },
  body: { fontSize: 16, fontWeight: '400', color: '#FFFFFF' },
  caption: { fontSize: 13, fontWeight: '400', color: '#888888' },
  code: { fontSize: 14, fontWeight: '400', fontFamily: 'JetBrains Mono', color: '#FFFFFF' },
  label: { fontSize: 12, fontWeight: '600', color: '#666666', textTransform: 'uppercase', letterSpacing: 1 },
}

export default function AppText({
  variant = 'body',
  color,
  style,
  children,
  numberOfLines,
}: AppTextProps) {
  const variantStyle = VARIANT_STYLES[variant]

  return (
    <RNText
      style={[variantStyle, color ? { color } : undefined, style]}
      numberOfLines={numberOfLines}
    >
      {children}
    </RNText>
  )
}
