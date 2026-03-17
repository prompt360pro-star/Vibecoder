// Hook para configurar o API client com o token do Clerk
// Chamar no root _layout.tsx
import { useEffect } from 'react'
import { useAuth } from '@clerk/clerk-expo'
import Constants from 'expo-constants'
import { configureApi } from '../services/api'

export const useApiSetup = () => {
  const { getToken } = useAuth()

  useEffect(() => {
    const baseUrl =
      (Constants.expoConfig?.extra?.apiUrl as string | undefined) ??
      process.env.EXPO_PUBLIC_API_URL ??
      'http://localhost:3000/api'

    configureApi(getToken, baseUrl)
  }, [getToken])
}
