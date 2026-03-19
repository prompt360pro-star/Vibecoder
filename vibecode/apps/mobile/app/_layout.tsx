import { useEffect } from 'react'
import { View, ActivityIndicator } from 'react-native'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import * as SplashScreen from 'expo-splash-screen'
import { ClerkProvider, ClerkLoaded } from '@clerk/clerk-expo'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { tokenCache } from '../lib/clerk-token-cache'
import { useUserStore } from '../stores/user-store'
import { useApiSetup } from '../hooks/use-api-setup'
import { useNotifications } from '../hooks/use-notifications'
import GamificationProvider from '../components/gamification/gamification-provider'

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 2, staleTime: 1000 * 60 * 5 } },
})

const clerkKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY ?? ''

function InnerLayout() {
  useApiSetup()
  useNotifications()

  const hydrate = useUserStore(s => s.hydrate)
  const hydrated = useUserStore(s => s.hydrated)

  useEffect(() => { hydrate() }, [])

  if (!hydrated) {
    return (
      <View style={{
        flex: 1, backgroundColor: '#0A0A0F',
        justifyContent: 'center', alignItems: 'center'
      }}>
        <ActivityIndicator color="#8B5CF6" size="large" />
      </View>
    )
  }

  return (
    <GamificationProvider>
      <View style={{ flex: 1, backgroundColor: '#0A0A0F' }}>
        <StatusBar style="light" />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(onboarding)" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="index" />
          <Stack.Screen name="mission/[missionId]" />
          <Stack.Screen name="island/[islandId]" />
          <Stack.Screen name="social/new-post" />
          <Stack.Screen name="social/post/[postId]" />
          <Stack.Screen name="profile/achievements" />
          <Stack.Screen name="profile/streak" />
          <Stack.Screen name="profile/settings" />
        </Stack>
      </View>
    </GamificationProvider>
  )
}

export default function RootLayout() {
  useEffect(() => {
    // Fail-safe: evita ficar preso no splash nativo se o index ainda não montou.
    const timer = setTimeout(() => {
      SplashScreen.hideAsync().catch(() => {})
    }, 500)

    return () => clearTimeout(timer)
  }, [])

  return (
    <ClerkProvider publishableKey={clerkKey} tokenCache={tokenCache}>
      <QueryClientProvider client={queryClient}>
        <ClerkLoaded>
          <InnerLayout />
        </ClerkLoaded>
      </QueryClientProvider>
    </ClerkProvider>
  )
}
