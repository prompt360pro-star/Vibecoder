import { useCallback, useEffect, useState } from 'react'
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native'
import { useRouter } from 'expo-router'
import { useAuth, useSSO, useSignIn } from '@clerk/clerk-expo'
import * as Haptics from 'expo-haptics'
import * as WebBrowser from 'expo-web-browser'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import Animated from 'react-native-reanimated'
import { COLORS } from '@vibecode/shared'
import { usePressScale, useScaleIn, useShake, useShimmer, useStaggerIn } from '../../lib/animations'
import Text from '../../components/ui/text'

WebBrowser.maybeCompleteAuthSession()

const CLERK_ERROR_MAP: Record<string, string> = {
  session_exists: 'Já tens sessão iniciada.',
  form_password_incorrect: 'Password incorrecta.',
  form_identifier_not_found: 'Email não encontrado.',
  form_param_format_invalid: 'Formato de email inválido.',
  too_many_requests: 'Demasiadas tentativas. Aguarda.',
  network_error: 'Sem conexão. Verifica o Wi-Fi.',
  form_password_pwned: 'Password comprometida. Usa outra.',
  identifier_already_signed_in: 'Conta já autenticada.',
  form_code_incorrect: 'Código incorrecto.',
  verification_expired: 'Verificação expirou. Tenta novamente.',
}

interface ClerkErrorShape {
  errors?: Array<{ code?: string }>
}

function StaggerItem({
  index,
  children,
}: {
  index: number
  children: React.ReactNode
}) {
  const animatedStyle = useStaggerIn(index, 70)
  return <Animated.View style={animatedStyle}>{children}</Animated.View>
}

const getClerkError = (errorValue: unknown): string => {
  const err = errorValue as ClerkErrorShape
  return CLERK_ERROR_MAP[err?.errors?.[0]?.code ?? ''] ?? 'Ocorreu um erro. Tenta novamente.'
}

export default function SignInScreen() {
  const { signIn, setActive, isLoaded } = useSignIn()
  const { startSSOFlow } = useSSO()
  const { isSignedIn } = useAuth()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const logoStyle = useScaleIn(0)
  const { shake, style: shakeStyle } = useShake()
  const { onPressIn, onPressOut, style: pressScaleStyle } = usePressScale(0.97)
  const shimmerStyle = useShimmer(360, 2200)

  useEffect(() => {
    if (isSignedIn) {
      router.replace('/(tabs)/home')
    }
  }, [isSignedIn, router])

  const canSubmit = email.trim().length > 0 && password.trim().length > 0

  const handleSignIn = useCallback(async () => {
    if (!isLoaded || !signIn) return
    if (!canSubmit) {
      setError('Preenche todos os campos.')
      shake()
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
    } catch (errorValue: unknown) {
      setError(getClerkError(errorValue))
      shake()
    } finally {
      setIsLoading(false)
    }
  }, [canSubmit, email, isLoaded, password, router, setActive, shake, signIn])

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
      } catch (errorValue: unknown) {
        setError(getClerkError(errorValue))
        shake()
      } finally {
        setIsLoading(false)
      }
    },
    [isLoaded, router, shake, startSSOFlow],
  )

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <Animated.View style={[styles.logoContainer, logoStyle]}>
          <Text style={styles.logoEmoji}>🎵</Text>
          <Text style={styles.logoText}>VibeCode</Text>
          <Text style={styles.tagline}>Code the future. Ride the vibe.</Text>
        </Animated.View>

        <Animated.View style={shakeStyle}>
          <StaggerItem index={0}>
            <Text style={styles.title}>Entrar</Text>
          </StaggerItem>

          {error ? (
            <StaggerItem index={1}>
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>⚠ {error}</Text>
              </View>
            </StaggerItem>
          ) : null}

          <StaggerItem index={1}>
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
          </StaggerItem>

          <StaggerItem index={2}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Password</Text>
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
                <Pressable onPress={() => setShowPassword(!showPassword)} style={styles.eyeButton}>
                  <Ionicons
                    name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                    size={20}
                    color={COLORS.textMuted}
                  />
                </Pressable>
              </View>
            </View>
          </StaggerItem>

          <StaggerItem index={3}>
            <Animated.View style={[styles.primaryButtonWrap, pressScaleStyle]}>
              <Pressable
                onPress={handleSignIn}
                onPressIn={isLoading ? undefined : onPressIn}
                onPressOut={isLoading ? undefined : onPressOut}
                disabled={isLoading}
                style={styles.primaryButton}
              >
                {!isLoading && canSubmit ? (
                  <Animated.View style={[styles.signInShimmer, shimmerStyle]}>
                    <LinearGradient
                      colors={['transparent', 'rgba(255,255,255,0.12)', 'transparent']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.signInShimmerGradient}
                    />
                  </Animated.View>
                ) : null}
                <LinearGradient colors={COLORS.gradientPrimary} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.gradient}>
                  <Text style={[styles.primaryButtonText, isLoading && styles.primaryButtonTextHidden]}>
                    ENTRAR
                  </Text>
                  {isLoading ? (
                    <View style={styles.loaderOverlay}>
                      <ActivityIndicator color={COLORS.textPrimary} />
                    </View>
                  ) : null}
                </LinearGradient>
              </Pressable>
            </Animated.View>
          </StaggerItem>

          <StaggerItem index={4}>
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>ou continue com</Text>
              <View style={styles.dividerLine} />
            </View>
          </StaggerItem>

          <StaggerItem index={5}>
            <Pressable
              onPress={() => handleOAuth('oauth_google')}
              disabled={isLoading}
              style={({ pressed }) => [styles.oauthButton, pressed && styles.pressed]}
            >
              <Text style={styles.oauthIcon}>G</Text>
              <Text style={styles.oauthText}>Continuar com Google</Text>
            </Pressable>
          </StaggerItem>

          <StaggerItem index={6}>
            <Pressable
              onPress={() => handleOAuth('oauth_github')}
              disabled={isLoading}
              style={({ pressed }) => [styles.oauthButton, pressed && styles.pressed]}
            >
              <Text style={styles.oauthIcon}>⌥</Text>
              <Text style={styles.oauthText}>Continuar com GitHub</Text>
            </Pressable>
          </StaggerItem>
        </Animated.View>

        <Pressable onPress={() => router.push('/(auth)/sign-up')} style={styles.linkContainer}>
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
    backgroundColor: COLORS.bgPrimary,
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
    color: COLORS.textPrimary,
    fontSize: 28,
    fontWeight: '700',
  },
  tagline: {
    color: COLORS.textTertiary,
    fontSize: 14,
    marginTop: 4,
  },
  title: {
    color: COLORS.textPrimary,
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 24,
  },
  errorContainer: {
    backgroundColor: COLORS.redAlpha10,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: COLORS.accentRed,
    fontSize: 14,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    backgroundColor: COLORS.bgCard,
    borderWidth: 1,
    borderColor: COLORS.borderDefault,
    borderRadius: 12,
    height: 48,
    paddingHorizontal: 16,
    color: COLORS.textPrimary,
    fontSize: 16,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bgCard,
    borderWidth: 1,
    borderColor: COLORS.borderDefault,
    borderRadius: 12,
    height: 48,
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 16,
    color: COLORS.textPrimary,
    fontSize: 16,
    height: '100%',
  },
  eyeButton: {
    paddingHorizontal: 12,
    justifyContent: 'center',
    height: '100%',
  },
  primaryButtonWrap: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 8,
  },
  primaryButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  signInShimmer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: -100,
    width: 80,
    zIndex: 2,
    transform: [{ skewX: '-20deg' }],
  },
  signInShimmerGradient: {
    flex: 1,
  },
  gradient: {
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    overflow: 'hidden',
  },
  primaryButtonText: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 1,
  },
  primaryButtonTextHidden: {
    opacity: 0,
  },
  loaderOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pressed: {
    opacity: 0.8,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.borderDefault,
  },
  dividerText: {
    color: COLORS.textTertiary,
    fontSize: 13,
    marginHorizontal: 16,
  },
  oauthButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.bgCard,
    borderWidth: 1,
    borderColor: COLORS.borderDefault,
    borderRadius: 12,
    height: 52,
    marginBottom: 12,
  },
  oauthIcon: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginRight: 12,
  },
  oauthText: {
    color: COLORS.textPrimary,
    fontSize: 15,
    fontWeight: '500',
  },
  linkContainer: {
    alignItems: 'center',
    marginTop: 20,
    paddingVertical: 8,
  },
  linkText: {
    color: COLORS.textTertiary,
    fontSize: 14,
  },
  linkHighlight: {
    color: COLORS.accentPurple,
    fontWeight: '600',
  },
})
