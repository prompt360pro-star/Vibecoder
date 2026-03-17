// Tela de Sign In — Email/Password + OAuth (Google, GitHub)
import { useState, useCallback } from 'react'
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native'
import { useRouter } from 'expo-router'
import { useSignIn, useSSO } from '@clerk/clerk-expo'
import * as Haptics from 'expo-haptics'
import * as WebBrowser from 'expo-web-browser'
import { LinearGradient } from 'expo-linear-gradient'

// Necessário para OAuth no Expo
WebBrowser.maybeCompleteAuthSession()

export default function SignInScreen() {
  const { signIn, setActive, isLoaded } = useSignIn()
  const { startSSOFlow } = useSSO()
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  // Sign in com email + password
  const handleSignIn = useCallback(async () => {
    if (!isLoaded || !signIn) return
    if (!email.trim() || !password.trim()) {
      setError('Preencha todos os campos')
      return
    }

    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    setIsLoading(true)
    setError('')

    try {
      const result = await signIn.create({
        identifier: email.trim(),
        password,
      })

      if (result.status === 'complete' && result.createdSessionId) {
        await setActive({ session: result.createdSessionId })
        router.replace('/')
      }
    } catch (err: unknown) {
      const clerkError = err as { errors?: Array<{ message: string }> }
      const message = clerkError.errors?.[0]?.message ?? 'Erro ao entrar. Tente novamente.'
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }, [isLoaded, signIn, email, password, setActive, router])

  // OAuth — Google ou GitHub
  const handleOAuth = useCallback(
    async (strategy: 'oauth_google' | 'oauth_github') => {
      if (!isLoaded) return

      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
      setIsLoading(true)
      setError('')

      try {
        const { createdSessionId, setActive: ssoSetActive } = await startSSOFlow({
          strategy,
          redirectUrl: 'vibecode://oauth-callback',
        })

        if (createdSessionId && ssoSetActive) {
          await ssoSetActive({ session: createdSessionId })
          router.replace('/')
        }
      } catch (err: unknown) {
        const clerkError = err as { errors?: Array<{ message: string }> }
        const message = clerkError.errors?.[0]?.message ?? 'Erro na autenticação OAuth'
        setError(message)
      } finally {
        setIsLoading(false)
      }
    },
    [isLoaded, startSSOFlow, router],
  )

  const handleGoToSignUp = useCallback(async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    router.push('/(auth)/sign-up')
  }, [router])

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Text style={styles.logoEmoji}>🎵</Text>
          <Text style={styles.logoText}>VibeCode</Text>
          <Text style={styles.tagline}>Code the future. Ride the vibe.</Text>
        </View>

        {/* Título */}
        <Text style={styles.title}>Entrar</Text>

        {/* Erro */}
        {error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>⚠ {error}</Text>
          </View>
        ) : null}

        {/* Input Email */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="seu@email.com"
            placeholderTextColor="#555555"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            textContentType="emailAddress"
            autoComplete="email"
          />
        </View>

        {/* Input Password */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Senha</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="••••••••"
              placeholderTextColor="#555555"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              textContentType="password"
              autoComplete="password"
            />
            <Pressable
              onPress={() => setShowPassword(!showPassword)}
              style={styles.eyeButton}
            >
              <Text style={styles.eyeIcon}>{showPassword ? '🙈' : '👁️'}</Text>
            </Pressable>
          </View>
        </View>

        {/* Botão Entrar */}
        <Pressable
          onPress={handleSignIn}
          disabled={isLoading}
          style={({ pressed }) => [
            styles.primaryButton,
            pressed && styles.pressed,
            isLoading && styles.disabled,
          ]}
        >
          <LinearGradient
            colors={['#8B5CF6', '#3B82F6']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.gradient}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.primaryButtonText}>ENTRAR</Text>
            )}
          </LinearGradient>
        </Pressable>

        {/* Divider */}
        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>ou continue com</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* OAuth Buttons */}
        <Pressable
          onPress={() => handleOAuth('oauth_google')}
          disabled={isLoading}
          style={({ pressed }) => [
            styles.oauthButton,
            pressed && styles.pressed,
          ]}
        >
          <Text style={styles.oauthIcon}>G</Text>
          <Text style={styles.oauthText}>Continuar com Google</Text>
        </Pressable>

        <Pressable
          onPress={() => handleOAuth('oauth_github')}
          disabled={isLoading}
          style={({ pressed }) => [
            styles.oauthButton,
            pressed && styles.pressed,
          ]}
        >
          <Text style={styles.oauthIcon}>⌥</Text>
          <Text style={styles.oauthText}>Continuar com GitHub</Text>
        </Pressable>

        {/* Link para Sign Up */}
        <Pressable onPress={handleGoToSignUp} style={styles.linkContainer}>
          <Text style={styles.linkText}>
            Não tem conta? <Text style={styles.linkHighlight}>Criar</Text>
          </Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: '#0A0A0F',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 80,
    paddingBottom: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoEmoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  logoText: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '700',
  },
  tagline: {
    color: '#888888',
    fontSize: 14,
    marginTop: 4,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 24,
  },
  errorContainer: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 14,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    color: '#CCCCCC',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#1A1A2E',
    borderWidth: 1,
    borderColor: '#333333',
    borderRadius: 12,
    height: 48,
    paddingHorizontal: 16,
    color: '#FFFFFF',
    fontSize: 16,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A2E',
    borderWidth: 1,
    borderColor: '#333333',
    borderRadius: 12,
    height: 48,
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 16,
    color: '#FFFFFF',
    fontSize: 16,
    height: '100%',
  },
  eyeButton: {
    paddingHorizontal: 12,
    justifyContent: 'center',
    height: '100%',
  },
  eyeIcon: {
    fontSize: 18,
  },
  primaryButton: {
    marginTop: 8,
    borderRadius: 12,
    overflow: 'hidden',
  },
  gradient: {
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 1,
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  disabled: {
    opacity: 0.6,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#333333',
  },
  dividerText: {
    color: '#888888',
    fontSize: 13,
    marginHorizontal: 16,
  },
  oauthButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1A1A2E',
    borderWidth: 1,
    borderColor: '#333333',
    borderRadius: 12,
    height: 52,
    marginBottom: 12,
  },
  oauthIcon: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginRight: 12,
  },
  oauthText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '500',
  },
  linkContainer: {
    alignItems: 'center',
    marginTop: 20,
    paddingVertical: 8,
  },
  linkText: {
    color: '#888888',
    fontSize: 14,
  },
  linkHighlight: {
    color: '#8B5CF6',
    fontWeight: '600',
  },
})
