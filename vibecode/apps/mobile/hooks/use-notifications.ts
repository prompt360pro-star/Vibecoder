import { useEffect } from 'react'
import Constants from 'expo-constants'

const isExpoGo = Constants.appOwnership === 'expo'

export function useNotifications() {
  useEffect(() => {
    if (isExpoGo) {
      console.log('[useNotifications] Expo Go detectado — notificações desactivadas em dev')
      return
    }
    // Código de notificações só corre em builds nativas
    initNotifications()
  }, [])

  return { permissionGranted: false, pushToken: null }
}

async function initNotifications() {
  try {
    const { default: Notifications } = await import('expo-notifications')
    const { status } = await Notifications.requestPermissionsAsync()
    if (status !== 'granted') return

    const token = await Notifications.getExpoPushTokenAsync(
      process.env.EXPO_PUBLIC_PROJECT_ID
        ? { projectId: process.env.EXPO_PUBLIC_PROJECT_ID }
        : {}
    ).catch(() => null)

    if (token) {
      const { api } = await import('../services/api')
      await api.put('/users/me', { pushToken: token.data }).catch(() => { })
    }
  } catch (error) {
    console.warn('[useNotifications] Erro ao inicializar:', error)
  }
}
