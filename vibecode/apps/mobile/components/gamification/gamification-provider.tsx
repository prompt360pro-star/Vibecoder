// VibeCode — GamificationProvider
// Wrapper que lê gamificationStore e renderiza LevelUpModal + AchievementToast
// Coloca no _layout.tsx dentro dos providers

import { useEffect } from 'react'
import { useGamificationStore } from '../../stores/gamification-store'
import LevelUpModal from './level-up-modal'
import AchievementToast from './achievement-toast'
import * as Haptics from 'expo-haptics'

interface GamificationProviderProps {
  children: React.ReactNode
}

export default function GamificationProvider({ children }: GamificationProviderProps) {
  const {
    levelUpData,
    dismissLevelUp,
    toastQueue,
    processQueue,
  } = useGamificationStore()

  // Haptic quando level up acontece
  useEffect(() => {
    if (levelUpData) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    }
  }, [levelUpData])

  // Haptic quando novo achievement toast é adicionado à fila
  useEffect(() => {
    if (toastQueue.length > 0) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    }
  }, [toastQueue.length])

  const currentToast = toastQueue[0] ?? null

  return (
    <>
      {children}

      {/* Level Up Modal — mostrar sobre tudo */}
      {levelUpData && (
        <LevelUpModal
          visible={true}
          newLevel={levelUpData.level}
          newTitle={levelUpData.title}
          newViForm={levelUpData.viForm}
          onClose={dismissLevelUp}
        />
      )}

      {/* Achievement Toast — 1 de cada vez, processQueue ao dismissar */}
      {currentToast && (
        <AchievementToast
          visible={true}
          achievement={{
            name: currentToast.name,
            emoji: currentToast.emoji,
            xpReward: currentToast.xpReward,
          }}
          onClose={processQueue}
        />
      )}
    </>
  )
}
