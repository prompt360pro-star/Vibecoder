// Root Layout — Providers base: Clerk + React Query + GamificationProvider
import { useEffect } from 'react'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { View, StyleSheet } from 'react-native'
import { ClerkProvider, ClerkLoaded, useAuth } from '@clerk/clerk-expo'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { tokenCache } from '../lib/clerk-token-cache'
import GamificationProvider from '../components/gamification/gamification-provider'
import { useCheckStreak } from '../hooks/use-gamification'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60 * 5, // 5 minutos
    },
  },
})

const clerkPublishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY

// Inner layout: tem acesso ao contexto Clerk para verificar autenticação
function InnerLayout() {
  const { isSignedIn } = useAuth()
  const { checkOnce } = useCheckStreak()

  // Verificar streak 1x por sessão, apenas se autenticado
  useEffect(() => {
    if (isSignedIn) {
      checkOnce()
    }
  }, [isSignedIn])

  return (
    <GamificationProvider>
      <View style={styles.container}>
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: '#0A0A0F' },
            animation: 'slide_from_right',
          }}
        />
      </View>
    </GamificationProvider>
  )
}

export default function RootLayout() {
  useEffect(() => {
    if (!clerkPublishableKey) {
      console.warn('[VibeCode] EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY não configurada')
    }
  }, [])

  // Dev mode sem Clerk
  if (!clerkPublishableKey) {
    return (
      <QueryClientProvider client={queryClient}>
        <GamificationProvider>
          <View style={styles.container}>
            <StatusBar style="light" />
            <Stack
              screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: '#0A0A0F' },
                animation: 'slide_from_right',
              }}
            />
          </View>
        </GamificationProvider>
      </QueryClientProvider>
    )
  }

  return (
    <ClerkProvider publishableKey={clerkPublishableKey} tokenCache={tokenCache}>
      <ClerkLoaded>
        <QueryClientProvider client={queryClient}>
          <InnerLayout />
        </QueryClientProvider>
      </ClerkLoaded>
    </ClerkProvider>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0F',
  },
})
