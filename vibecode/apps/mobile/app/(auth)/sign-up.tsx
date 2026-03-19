import { useCallback, useState } from 'react'
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'
import { useRouter } from 'expo-router'
import { useSSO, useSignUp } from '@clerk/clerk-expo'
import * as Haptics from 'expo-haptics'
import * as WebBrowser from 'expo-web-browser'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import { COLORS } from '@vibecode/shared'

WebBrowser.maybeCompleteAuthSession()

const CLERK_ERROR_PT: Record<string, string> = {
  session_exists: 'Ja tens sessao iniciada.',
  form_password_incorrect: 'Password incorrecta.',
  form_identifier_not_found: 'Email nao encontrado.',
  form_param_format_invalid: 'Formato de email invalido.',
  too_many_requests: 'Demasiadas tentativas. Aguarda.',
  network_error: 'Sem conexao. Verifica o Wi-Fi.',
  form_password_pwned: 'Password comprometida. Usa outra.',
  identifier_already_signed_in: 'Esta conta ja esta autenticada.',
}

interface ClerkErrorLike {
  errors?: Array<{
    code?: string
  }>
}

const getErrorMessage = (error: unknown): string => {
  const clerkError = error as ClerkErrorLike
  const code = clerkError?.errors?.[0]?.code ?? ''
  return CLERK_ERROR_PT[code] ?? 'Ocorreu um erro. Tenta novamente.'
}

const getPasswordStrength = (password: string): { level: number; label: string; color: string } => {
  let score = 0
  if (password.length >= 8) score++
  if (/[A-Z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++

  if (score <= 1) return { level: score, label: 'Fraca', color: '#EF4444' }
  if (score === 2) return { level: score, label: 'Razoavel', color: '#F59E0B' }
  if (score === 3) return { level: score, label: 'Boa', color: '#06B6D4' }
  return { level: score, label: 'Forte', color: '#22C55E' }
}

export default function SignUpScreen() {
  const { signUp, setActive, isLoaded } = useSignUp()
  const { startSSOFlow } = useSSO()
  const router = useRouter()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [pendingVerification, setPendingVerification] = useState(false)
  const [verificationCode, setVerificationCode] = useState('')

  const passwordStrength = getPasswordStrength(password)

  const handleSignUp = useCallback(async () => {
    if (!isLoaded || !signUp) return
    if (!name.trim() || !email.trim() || !password.trim()) {
      setError('Preenche todos os campos.')
      return
    }
    if (password.length < 8) {
      setError('Password deve ter pelo menos 8 caracteres.')
      return
    }

    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    setIsLoading(true)
    setError('')

    try {
      await signUp.create({
        firstName: name.trim().split(' ')[0],
        lastName: name.trim().split(' ').slice(1).join(' ') || undefined,
        emailAddress: email.trim(),
        password,
      })

      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' })
      setPendingVerification(true)
    } catch (errorValue: unknown) {
      setError(getErrorMessage(errorValue))
    } finally {
      setIsLoading(false)
    }
  }, [email, isLoaded, name, password, signUp])

  const handleVerify = useCallback(async () => {
    if (!isLoaded || !signUp) return

    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    setIsLoading(true)
    setError('')

    try {
      const result = await signUp.attemptEmailAddressVerification({
        code: verificationCode,
      })

      if (result.status === 'complete' && result.createdSessionId) {
        await setActive({ session: result.createdSessionId })
        router.replace('/')
      }
    } catch (errorValue: unknown) {
      setError(getErrorMessage(errorValue))
    } finally {
      setIsLoading(false)
    }
  }, [isLoaded, router, setActive, signUp, verificationCode])

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
        setError(getErrorMessage(errorValue))
      } finally {
        setIsLoading(false)
      }
    },
    [isLoaded, router, startSSOFlow],
  )

  const handleGoToSignIn = useCallback(async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    router.back()
  }, [router])

  if (pendingVerification) {
    return (
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.verifyContainer}>
          <Text style={styles.verifyEmoji}>📧</Text>
          <Text style={styles.verifyTitle}>Verifica o teu email</Text>
          <Text style={styles.verifySubtitle}>Enviamos um codigo para {email}</Text>

          {error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>⚠ {error}</Text>
            </View>
          ) : null}

          <TextInput
            style={styles.codeInput}
            placeholder="000000"
            placeholderTextColor="#555555"
            value={verificationCode}
            onChangeText={setVerificationCode}
            keyboardType="number-pad"
            maxLength={6}
            textAlign="center"
          />

          <Pressable
            onPress={handleVerify}
            disabled={isLoading || verificationCode.length < 6}
            style={({ pressed }) => [
              styles.primaryButton,
              pressed && styles.pressed,
              isLoading && styles.disabled,
            ]}
          >
            <LinearGradient colors={COLORS.gradientPrimary} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.gradient}>
              {isLoading ? (
                <ActivityIndicator color={COLORS.textPrimary} />
              ) : (
                <Text style={styles.primaryButtonText}>VERIFICAR</Text>
              )}
            </LinearGradient>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    )
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.logoContainer}>
          <Text style={styles.logoEmoji}>🎵</Text>
          <Text style={styles.logoText}>VibeCode</Text>
        </View>

        <Text style={styles.title}>Criar Conta</Text>

        {error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>⚠ {error}</Text>
          </View>
        ) : null}

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Nome</Text>
          <TextInput
            style={styles.input}
            placeholder="O teu nome"
            placeholderTextColor="#555555"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
            textContentType="name"
            autoComplete="name"
          />
        </View>

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

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Senha</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Minimo 8 caracteres"
              placeholderTextColor="#555555"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              textContentType="newPassword"
              autoComplete="new-password"
            />
            <Pressable onPress={() => setShowPassword(!showPassword)} style={styles.eyeButton}>
              <Ionicons
                name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                size={20}
                color={COLORS.textMuted}
              />
            </Pressable>
          </View>

          {password.length > 0 ? (
            <View style={styles.strengthContainer}>
              <View style={styles.strengthBars}>
                {[1, 2, 3, 4].map((level) => (
                  <View
                    key={level}
                    style={[
                      styles.strengthBar,
                      {
                        backgroundColor:
                          level <= passwordStrength.level
                            ? passwordStrength.color
                            : COLORS.borderDefault,
                      },
                    ]}
                  />
                ))}
              </View>
              <Text style={[styles.strengthLabel, { color: passwordStrength.color }]}>
                {passwordStrength.label}
              </Text>
            </View>
          ) : null}
        </View>

        <Pressable
          onPress={handleSignUp}
          disabled={isLoading}
          style={({ pressed }) => [
            styles.primaryButton,
            pressed && styles.pressed,
            isLoading && styles.disabled,
          ]}
        >
          <LinearGradient colors={COLORS.gradientPrimary} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.gradient}>
            {isLoading ? (
              <ActivityIndicator color={COLORS.textPrimary} />
            ) : (
              <Text style={styles.primaryButtonText}>CRIAR CONTA</Text>
            )}
          </LinearGradient>
        </Pressable>

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>ou continue com</Text>
          <View style={styles.dividerLine} />
        </View>

        <Pressable
          onPress={() => handleOAuth('oauth_google')}
          disabled={isLoading}
          style={({ pressed }) => [styles.oauthButton, pressed && styles.pressed]}
        >
          <Text style={styles.oauthIcon}>G</Text>
          <Text style={styles.oauthText}>Continuar com Google</Text>
        </Pressable>

        <Pressable
          onPress={() => handleOAuth('oauth_github')}
          disabled={isLoading}
          style={({ pressed }) => [styles.oauthButton, pressed && styles.pressed]}
        >
          <Text style={styles.oauthIcon}>⌥</Text>
          <Text style={styles.oauthText}>Continuar com GitHub</Text>
        </Pressable>

        <Pressable onPress={handleGoToSignIn} style={styles.linkContainer}>
          <Text style={styles.linkText}>
            Ja tem conta? <Text style={styles.linkHighlight}>Entrar</Text>
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
    paddingTop: 60,
    paddingBottom: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoEmoji: {
    fontSize: 40,
    marginBottom: 8,
  },
  logoText: {
    color: COLORS.textPrimary,
    fontSize: 24,
    fontWeight: '700',
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
  strengthContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 8,
  },
  strengthBars: {
    flexDirection: 'row',
    gap: 4,
    flex: 1,
  },
  strengthBar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
  strengthLabel: {
    fontSize: 12,
    fontWeight: '600',
    minWidth: 50,
    textAlign: 'right',
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
    color: COLORS.textPrimary,
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
  verifyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    backgroundColor: COLORS.bgPrimary,
  },
  verifyEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  verifyTitle: {
    color: COLORS.textPrimary,
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  verifySubtitle: {
    color: COLORS.textTertiary,
    fontSize: 14,
    marginBottom: 32,
    textAlign: 'center',
  },
  codeInput: {
    backgroundColor: COLORS.bgCard,
    borderWidth: 1,
    borderColor: COLORS.borderDefault,
    borderRadius: 12,
    height: 56,
    width: 200,
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.textPrimary,
    letterSpacing: 8,
    marginBottom: 24,
  },
})
