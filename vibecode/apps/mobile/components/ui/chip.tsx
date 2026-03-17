// Chip — Pill selecionável com ícone opcional
import { Pressable, Text, View, StyleSheet, type ViewStyle, type StyleProp } from 'react-native'
import * as Haptics from 'expo-haptics'
import type { ReactNode } from 'react'

type ChipVariant = 'default' | 'tag' | 'meta'

interface ChipProps {
  label: string
  selected?: boolean
  onPress?: () => void
  icon?: ReactNode
  variant?: ChipVariant
  style?: StyleProp<ViewStyle>
}

export default function Chip({
  label,
  selected = false,
  onPress,
  icon,
  variant = 'default',
  style,
}: ChipProps) {
  const handlePress = async () => {
    if (!onPress) return
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    onPress()
  }

  const chipStyle = [
    styles.base,
    variant === 'tag' && styles.tag,
    variant === 'meta' && styles.meta,
    selected && styles.selected,
    style,
  ]

  if (onPress) {
    return (
      <Pressable
        onPress={handlePress}
        style={({ pressed }) => [
          ...chipStyle,
          pressed && styles.pressed,
        ]}
      >
        {icon ? <View style={styles.iconWrap}>{icon}</View> : null}
        <Text style={[styles.text, selected && styles.textSelected]}>
          {label}
        </Text>
      </Pressable>
    )
  }

  return (
    <View style={chipStyle}>
      {icon ? <View style={styles.iconWrap}>{icon}</View> : null}
      <Text style={[styles.text, selected && styles.textSelected]}>
        {label}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 32,
    paddingHorizontal: 14,
    borderRadius: 9999,
    backgroundColor: '#1A1A2E',
    borderWidth: 1,
    borderColor: '#333333',
  },
  tag: {
    height: 28,
    paddingHorizontal: 12,
  },
  meta: {
    height: 24,
    paddingHorizontal: 10,
  },
  selected: {
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    borderColor: '#8B5CF6',
  },
  text: {
    color: '#CCCCCC',
    fontSize: 13,
    fontWeight: '500',
  },
  textSelected: {
    color: '#FFFFFF',
  },
  iconWrap: {
    marginRight: 6,
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.96 }],
  },
})
