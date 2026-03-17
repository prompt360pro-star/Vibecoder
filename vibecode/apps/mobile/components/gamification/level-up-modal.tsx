import { Modal, View, StyleSheet, Animated, Pressable } from 'react-native'
import Text from '../ui/text'
import Button from '../ui/button'
import { COLORS } from '@vibecode/shared'
import { useEffect, useRef } from 'react'

interface LevelUpModalProps {
  visible: boolean
  newLevel: number
  newTitle: string
  newViForm: string
  onClose: () => void
}

export default function LevelUpModal({
  visible,
  newLevel,
  newTitle,
  newViForm,
  onClose,
}: LevelUpModalProps) {
  const scaleAnim = useRef(new Animated.Value(0)).current
  const opacityAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 40,
          friction: 7,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start()
    } else {
      scaleAnim.setValue(0)
      opacityAnim.setValue(0)
    }
  }, [visible, scaleAnim, opacityAnim])

  return (
    <Modal visible={visible} transparent animationType="none">
      <View style={styles.overlay}>
        <Animated.View 
          style={[
            styles.container, 
            { 
              opacity: opacityAnim,
              transform: [{ scale: scaleAnim }]
            }
          ]}
        >
          <Text style={styles.emoji}>{newViForm}</Text>
          <Text style={styles.levelText}>NÍVEL {newLevel}!</Text>
          <Text style={styles.titleText}>{newTitle}</Text>
          
          <Text style={styles.congratsText}>
            Impressionante! A tua jornada no vibe coding está apenas a começar.
          </Text>

          <Button 
            title="CONTINUAR" 
            variant="primary" 
            size="lg" 
            onPress={onClose}
            style={styles.button}
          />
        </Animated.View>

        {/* Confetti placeholders */}
        <Text style={[styles.sparkle, { top: '20%', left: '15%' }]}>✨</Text>
        <Text style={[styles.sparkle, { top: '30%', right: '20%' }]}>🎉</Text>
        <Text style={[styles.sparkle, { bottom: '25%', left: '25%' }]}>✨</Text>
        <Text style={[styles.sparkle, { bottom: '35%', right: '15%' }]}>🔥</Text>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(10, 10, 15, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  container: {
    alignItems: 'center',
    width: '100%',
  },
  emoji: {
    fontSize: 80,
    marginBottom: 24,
  },
  levelText: {
    color: '#FFFFFF',
    fontSize: 40,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: 2,
    marginBottom: 8,
  },
  titleText: {
    color: COLORS.accentPurple,
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 32,
  },
  congratsText: {
    color: COLORS.textSecondary,
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 48,
    paddingHorizontal: 12,
  },
  button: {
    width: '100%',
  },
  sparkle: {
    position: 'absolute',
    fontSize: 24,
  }
})
