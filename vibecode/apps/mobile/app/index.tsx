// Entry point — redireciona com base no estado de auth e onboarding
import { useEffect } from 'react'
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native'
import { useAuth } from '@clerk/clerk-expo'
import { useRouter } from 'expo-router'
import { useUserStore } from '../stores/user-store'
import { useApiSetup } from '../hooks/use-api-setup'

export default function IndexScreen() {
  const { isSignedIn, isLoaded } = useAuth()
  const router = useRouter()
  const { hasCompletedOnboarding } = useUserStore()

  // Configurar API client com token do Clerk
  useApiSetup()

  useEffect(() => {
    if (!isLoaded) return

    if (!isSignedIn) {
      // Não autenticado → auth flow
      router.replace('/(auth)/sign-in')
      return
    }

    if (!hasCompletedOnboarding) {
      // Autenticado mas sem onboarding → onboarding
      router.replace('/(onboarding)/welcome' as never)
      return
    }

    // Tudo ok → tabs
    router.replace('/(tabs)/home' as never)
  }, [isLoaded, isSignedIn, hasCompletedOnboarding, router])

  // Loading state enquanto o Clerk carrega
  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>🎵</Text>
      <Text style={styles.title}>VibeCode</Text>
      <ActivityIndicator
        color="#8B5CF6"
        size="large"
        style={styles.spinner}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0A0A0F',
  },
  emoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 36,
    fontWeight: '700',
    marginBottom: 32,
  },
  spinner: {
    marginTop: 16,
  },
})
