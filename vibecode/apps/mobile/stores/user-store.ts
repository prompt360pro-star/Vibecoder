import { create } from 'zustand'
import AsyncStorage from '@react-native-async-storage/async-storage'
import type { DNAProfile } from '@vibecode/shared'

const KEYS = {
  onboarding: 'vibecode:hasCompletedOnboarding',
  dnaCompleted: 'vibecode:dnaCompleted',
} as const

interface UserStoreState {
  hasCompletedOnboarding: boolean
  dnaCompleted: boolean
  hydrated: boolean

  setHasCompletedOnboarding: (value: boolean) => void
  setDnaCompleted: (value: boolean) => void
  setDnaProfile: (profile: DNAProfile) => void
  hydrate: () => Promise<void>
  reset: () => void
}

export const useUserStore = create<UserStoreState>((set) => ({
  hasCompletedOnboarding: false,
  dnaCompleted: false,
  hydrated: false,

  setHasCompletedOnboarding: (value) => {
    AsyncStorage.setItem(KEYS.onboarding, String(value)).catch(() => {})
    set({ hasCompletedOnboarding: value })
  },

  setDnaCompleted: (value) => {
    AsyncStorage.setItem(KEYS.dnaCompleted, String(value)).catch(() => {})
    set({ dnaCompleted: value })
  },

  setDnaProfile: (_profile) => {
    AsyncStorage.setItem(KEYS.dnaCompleted, 'true').catch(() => {})
    set({ dnaCompleted: true })
  },

  hydrate: async () => {
    try {
      const [onboarding, dna] = await Promise.all([
        AsyncStorage.getItem(KEYS.onboarding),
        AsyncStorage.getItem(KEYS.dnaCompleted),
      ])

      set({
        hasCompletedOnboarding: onboarding === 'true',
        dnaCompleted: dna === 'true',
        hydrated: true,
      })
    } catch {
      set({ hydrated: true })
    }
  },

  reset: () => {
    AsyncStorage.multiRemove(Object.values(KEYS)).catch(() => {})
    set({ hasCompletedOnboarding: false, dnaCompleted: false })
  },
}))
