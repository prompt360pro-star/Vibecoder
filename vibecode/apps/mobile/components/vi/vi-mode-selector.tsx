import { useEffect, useRef } from 'react'
import { Modal, Pressable, StyleSheet, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated'
import { COLORS, ViMode } from '@vibecode/shared'
import Text from '../ui/text'

interface ViModeSelectorProps {
  currentMode: ViMode
  onSelect: (mode: ViMode) => void
  onClose: () => void
}

const VI_MODES = [
  { id: ViMode.TEACHER, emoji: '🎓', label: 'Professor', desc: 'Explica conceitos passo a passo' },
  { id: ViMode.REVIEWER, emoji: '🔍', label: 'Revisor', desc: 'Analisa e critica o teu código' },
  { id: ViMode.QUIZ, emoji: '🧠', label: 'Quiz Master', desc: 'Testa os teus conhecimentos' },
  { id: 'MOTIVATOR' as ViMode, emoji: '🚀', label: 'Motivador', desc: 'Mantém-te focado e energizado' },
  { id: 'PAIR' as ViMode, emoji: '👥', label: 'Pair Coder', desc: 'Codifica contigo em tempo real' },
]

export default function ViModeSelector({
  currentMode,
  onSelect,
  onClose,
}: ViModeSelectorProps) {
  const slideY = useSharedValue(300)
  const opacity = useSharedValue(0)
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    slideY.value = withTiming(0, { duration: 250 })
    opacity.value = withTiming(1, { duration: 250 })
  }, [opacity, slideY])

  const closeWithAnimation = (callback?: () => void) => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current)
    }
    slideY.value = withTiming(300, { duration: 200 })
    opacity.value = withTiming(0, { duration: 200 })
    closeTimerRef.current = setTimeout(() => {
      if (callback) callback()
      else onClose()
      closeTimerRef.current = null
    }, 210)
  }

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current)
    }
  }, [])

  const handleSelect = (mode: ViMode) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    closeWithAnimation(() => {
      onSelect(mode)
      onClose()
    })
  }

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }))

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: slideY.value }],
  }))

  return (
    <Modal visible transparent animationType="none" onRequestClose={() => closeWithAnimation()}>
      <View style={styles.overlay}>
        <Animated.View style={[styles.backdrop, backdropStyle]}>
          <Pressable style={styles.backdropPressable} onPress={() => closeWithAnimation()} />
        </Animated.View>

        <Animated.View style={[styles.sheet, sheetStyle]}>
          <View style={styles.header}>
            <Text style={styles.title}>Modos do Vi</Text>
            <Pressable onPress={() => closeWithAnimation()} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color={COLORS.textPrimary} />
            </Pressable>
          </View>

          <View style={styles.list}>
            {VI_MODES.map((item, index) => {
              const isActive = currentMode === item.id
              const isLast = index === VI_MODES.length - 1

              return (
                <Pressable
                  key={item.id}
                  onPress={() => handleSelect(item.id)}
                  style={({ pressed }) => [
                    styles.item,
                    isActive && styles.itemActive,
                    !isLast && styles.itemDivider,
                    pressed && styles.itemPressed,
                  ]}
                >
                  <Text style={styles.emoji}>{item.emoji}</Text>
                  <View style={styles.itemTextContainer}>
                    <Text style={[styles.label, isActive && styles.labelActive]}>{item.label}</Text>
                    <Text style={styles.desc}>{item.desc}</Text>
                  </View>
                </Pressable>
              )
            })}
          </View>
        </Animated.View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  backdropPressable: {
    flex: 1,
  },
  sheet: {
    backgroundColor: COLORS.bgCard,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 40,
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    color: COLORS.textPrimary,
    fontSize: 18,
    fontWeight: '800',
  },
  closeBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: {
    gap: 4,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bgElevated,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
    gap: 16,
  },
  itemActive: {
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
    borderWidth: 1.5,
    borderColor: COLORS.accentPurple,
  },
  itemDivider: {
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  itemPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  emoji: {
    fontSize: 28,
  },
  itemTextContainer: {
    flex: 1,
  },
  label: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  labelActive: {
    color: COLORS.accentPurple,
    fontWeight: '700',
  },
  desc: {
    color: COLORS.textMuted,
    fontSize: 13,
  },
})
