// Tela de Sign Up — Nome, Email, Password + OAuth
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
} from 'react-native'
import { useRouter } from 'expo-router'
import { useSignUp, useSSO } from '@clerk/clerk-expo'
import * as Haptics from 'expo-haptics'
import * as WebBrowser from 'expo-web-browser'
import { LinearGradient } from 'expo-linear-gradient'

WebBrowser.maybeCompleteAuthSession()

// Avalia a força da password
const getPasswordStrength = (pw: string): { level: number; label: string; color: string } => {
  let score = 0
  if (pw.length >= 8) score++
  if (/[A-Z]/.test(pw)) score++
  if (/[0-9]/.test(pw)) score++
  if (/[^A-Za-z0-9]/.test(pw)) score++

  if (score <= 1) return { level: score, label: 'Fraca', color: '#EF4444' }
  if (score === 2) return { level: score, label: 'Razoável', color: '#F59E0B' }
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

  // Pendente de verificação de email
  const [pendingVerification, setPendingVerification] = useState(false)
  const [verificationCode, setVerificationCode] = useState('')

  const passwordStrength = getPasswordStrength(password)

  // Sign up com email + password
  const handleSignUp = useCallback(async () => {
    if (!isLoaded || !signUp) return
    if (!name.trim() || !email.trim() || !password.trim()) {
      setError('Preencha todos os campos')
      return
    }
    if (password.length < 8) {
      setError('Password deve ter pelo menos 8 caracteres')
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

      // Enviar código de verificação por email
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' })
      setPendingVerification(true)
    } catch (err: unknown) {
      const clerkError = err as { errors?: Array<{ message: string }> }
      const message = clerkError.errors?.[0]?.message ?? 'Erro ao criar conta. Tente novamente.'
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }, [isLoaded, signUp, name, email, password])

  // Verificar código de email
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
    } catch (err: unknown) {
      const clerkError = err as { errors?: Array<{ message: string }> }
      const message = clerkError.errors?.[0]?.message ?? 'Código inválido. Tente novamente.'
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }, [isLoaded, signUp, verificationCode, setActive, router])

  // OAuth
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

  const handleGoToSignIn = useCallback(async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    router.back()
  }, [router])

  // Tela de verificação de email
  if (pendingVerification) {
    return (
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.verifyContainer}>
          <Text style={styles.verifyEmoji}>📧</Text>
          <Text style={styles.verifyTitle}>Verifica o teu email</Text>
          <Text style={styles.verifySubtitle}>
            Enviámos um código para {email}
          </Text>

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
            <LinearGradient
              colors={['#8B5CF6', '#3B82F6']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.gradient}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.primaryButtonText}>VERIFICAR</Text>
              )}
            </LinearGradient>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    )
  }

  // Tela de registo
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
        </View>

        {/* Título */}
        <Text style={styles.title}>Criar Conta</Text>

        {/* Erro */}
        {error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>⚠ {error}</Text>
          </View>
        ) : null}

        {/* Input Nome */}
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
              placeholder="Mínimo 8 caracteres"
              placeholderTextColor="#555555"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              textContentType="newPassword"
              autoComplete="new-password"
            />
            <Pressable
              onPress={() => setShowPassword(!showPassword)}
              style={styles.eyeButton}
            >
              <Text style={styles.eyeIcon}>{showPassword ? '🙈' : '👁️'}</Text>
            </Pressable>
          </View>

          {/* Password strength indicator */}
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
                            : '#333333',
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

        {/* Botão Criar Conta */}
        <Pressable
          onPress={handleSignUp}
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
              <Text style={styles.primaryButtonText}>CRIAR CONTA</Text>
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

        {/* Link para Sign In */}
        <Pressable onPress={handleGoToSignIn} style={styles.linkContainer}>
          <Text style={styles.linkText}>
            Já tem conta? <Text style={styles.linkHighlight}>Entrar</Text>
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
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
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

  // Verification screen
  verifyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    backgroundColor: '#0A0A0F',
  },
  verifyEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  verifyTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  verifySubtitle: {
    color: '#888888',
    fontSize: 14,
    marginBottom: 32,
    textAlign: 'center',
  },
  codeInput: {
    backgroundColor: '#1A1A2E',
    borderWidth: 1,
    borderColor: '#333333',
    borderRadius: 12,
    height: 56,
    width: 200,
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 8,
    marginBottom: 24,
  },
})
