// VibeCode — Gamification Store (Zustand)
// Melhoria 2: Toast queue com IDs únicos — evita race conditions quando múltiplos
// toasts chegam em rápida sucessão (level-up + achievements simultâneos)

import { create } from 'zustand'

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
interface LevelUpData {
  level: number
  title: string
  viForm: string
}

export interface AchievementToastData {
  id: string         // ID único para dismiss preciso
  name: string
  emoji: string
  xpReward: number
}

interface GamificationState {
  // Level Up
  levelUpData: LevelUpData | null
  // Achievement Toast queue com IDs únicos
  toastQueue: AchievementToastData[]

  // Actions
  triggerLevelUp: (data: LevelUpData) => void
  dismissLevelUp: () => void
  
  // Melhoria 2: addToast recebe objecto completo com id gerado externamente
  triggerAchievement: (data: AchievementToastData) => void
  
  // Melhoria 2: dismissToast por id específico — não é um pop cego
  dismissToast: (id: string) => void
  
  // Mantido para compatibilidade retroactiva (remove o primeiro da fila)
  processQueue: () => void
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
    set((state) => {
      // Evitar duplicados na fila (por id)
      if (state.toastQueue.some((t) => t.id === data.id)) return state
      return { toastQueue: [...state.toastQueue, data] }
    }),

  // Melhoria 2: dismiss preciso por ID — sem pop cego
  dismissToast: (id: string) =>
    set((state) => ({
      toastQueue: state.toastQueue.filter((t) => t.id !== id),
    })),

  // Compatibilidade retroactiva: pop primeiro item
  processQueue: () =>
    set((state) => ({
      toastQueue: state.toastQueue.slice(1),
    })),
}))
