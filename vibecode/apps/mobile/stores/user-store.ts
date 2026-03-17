// Zustand store para estado do user
// Persiste flags de onboarding em MMKV
import { create } from 'zustand'
import { MMKV } from 'react-native-mmkv'
import type { DNAProfile } from '@vibecode/shared'

// Storage MMKV para persistência local
const storage = new MMKV({ id: 'vibecode-user-store' })

interface UserStoreState {
  // Estado
  hasCompletedOnboarding: boolean
  dnaProfile: DNAProfile | null

  // Ações
  setHasCompletedOnboarding: (value: boolean) => void
  setDnaProfile: (profile: DNAProfile) => void
  reset: () => void
}

export const useUserStore = create<UserStoreState>((set) => ({
  // Estado inicial — ler do MMKV se existir
  hasCompletedOnboarding: storage.getBoolean('hasCompletedOnboarding') ?? false,
  dnaProfile: (() => {
    const raw = storage.getString('dnaProfile')
    if (raw) {
      try {
        return JSON.parse(raw) as DNAProfile
      } catch {
        return null
      }
    }
    return null
  })(),

  // Ações
  setHasCompletedOnboarding: (value: boolean) => {
    storage.set('hasCompletedOnboarding', value)
    set({ hasCompletedOnboarding: value })
  },

  setDnaProfile: (profile: DNAProfile) => {
    storage.set('dnaProfile', JSON.stringify(profile))
    set({ dnaProfile: profile })
  },

  reset: () => {
    storage.delete('hasCompletedOnboarding')
    storage.delete('dnaProfile')
    set({ hasCompletedOnboarding: false, dnaProfile: null })
  },
}))
