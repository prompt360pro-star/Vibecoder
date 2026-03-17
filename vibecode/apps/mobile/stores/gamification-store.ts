// VibeCode — Gamification Store (Zustand)
// Gere o estado global de eventos de gamificação: level up modal + fila de achievement toasts

import { create } from 'zustand'

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
interface LevelUpData {
  level: number
  title: string
  viForm: string
}

interface AchievementToastData {
  id: string
  name: string
  emoji: string
  xpReward: number
}

interface GamificationState {
  // Level Up
  levelUpData: LevelUpData | null
  // Achievement Toast queue
  toastQueue: AchievementToastData[]

  // Actions
  triggerLevelUp: (data: LevelUpData) => void
  dismissLevelUp: () => void
  triggerAchievement: (data: AchievementToastData) => void
  processQueue: () => void // Remove o primeiro item da fila
}

// ─────────────────────────────────────────────
// Store
// ─────────────────────────────────────────────
export const useGamificationStore = create<GamificationState>((set) => ({
  levelUpData: null,
  toastQueue: [],

  triggerLevelUp: (data) => set({ levelUpData: data }),

  dismissLevelUp: () => set({ levelUpData: null }),

  triggerAchievement: (data) =>
    set((state) => ({
      toastQueue: [...state.toastQueue, data],
    })),

  processQueue: () =>
    set((state) => ({
      toastQueue: state.toastQueue.slice(1), // Remove o primeiro (já exibido)
    })),
}))
