import { useCallback, useEffect, useState } from 'react'
import { Alert, Pressable, ScrollView, StyleSheet, Switch, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useAuth } from '@clerk/clerk-expo'
import { useQueryClient } from '@tanstack/react-query'
import * as Haptics from 'expo-haptics'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { COLORS, type LevelInfo, type UserProfile } from '@vibecode/shared'
import Text from '../../components/ui/text'
import { useUser } from '../../hooks/use-user'
import { api } from '../../services/api'

type ToggleField =
  | 'soundEnabled'
  | 'hapticsEnabled'
  | 'notifyStreak'
  | 'notifyNewMission'
  | 'notifySocial'
  | 'notifyNews'

const TOGGLE_KEYS: Record<ToggleField, string> = {
  soundEnabled: 'vibecode:settings:soundEnabled',
  hapticsEnabled: 'vibecode:settings:hapticsEnabled',
  notifyStreak: 'vibecode:settings:notifyStreak',
  notifyNewMission: 'vibecode:settings:notifyNewMission',
  notifySocial: 'vibecode:settings:notifySocial',
  notifyNews: 'vibecode:settings:notifyNews',
}

const LOCAL_KEYS_TO_CLEAR = [
  'vibecode:hasCompletedOnboarding',
  'vibecode:dnaCompleted',
  'vibecode:lastStreakCheckDate',
  'vibecode:notificationPermissionAsked',
  'vibecode:lastPushToken',
  ...Object.values(TOGGLE_KEYS),
]

interface UserQueryData extends UserProfile {
  levelTitle: string
  viForm: string
  levelInfo: LevelInfo
}

interface SettingItemProps {
  icon: string
  label: string
  value?: string
  onPress?: () => void
  destructive?: boolean
  disabled?: boolean
}

function SettingItem({ icon, label, value, onPress, destructive, disabled }: SettingItemProps) {
  return (
    <Pressable
      style={({ pressed }) => [styles.item, pressed && { opacity: 0.6 }]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={styles.itemIcon}>{icon}</Text>
      <Text style={[styles.itemLabel, destructive && { color: COLORS.accentRed }]}>{label}</Text>
      <View style={styles.itemRight}>
        {value ? <Text style={styles.itemValue}>{value}</Text> : null}
        {onPress && !disabled ? (
          <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
        ) : null}
      </View>
    </Pressable>
  )
}

interface SettingToggleProps {
  icon: string
  label: string
  description?: string
  value: boolean
  onToggle: (value: boolean) => void
}

function SettingToggle({ icon, label, description, value, onToggle }: SettingToggleProps) {
  return (
    <View style={styles.item}>
      <Text style={styles.itemIcon}>{icon}</Text>
      <View style={styles.toggleContent}>
        <Text style={styles.itemLabel}>{label}</Text>
        {description ? <Text style={styles.itemDescription}>{description}</Text> : null}
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: COLORS.bgElevated, true: COLORS.accentPurple }}
        thumbColor={value ? '#FFF' : '#888'}
        ios_backgroundColor={COLORS.bgElevated}
      />
    </View>
  )
}

interface SectionProps {
  title: string
  children: React.ReactNode
}

function Section({ title, children }: SectionProps) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionCard}>{children}</View>
    </View>
  )
}

const getInitialToggles = (user: UserProfile | null) => ({
  soundEnabled: user?.soundEnabled ?? true,
  hapticsEnabled: user?.hapticsEnabled ?? true,
  notifyStreak: user?.notifyStreak ?? true,
  notifyNewMission: user?.notifyNewMission ?? true,
  notifySocial: user?.notifySocial ?? true,
  notifyNews: user?.notifyNews ?? true,
})

export default function SettingsScreen() {
  const { signOut } = useAuth()
  const { user } = useUser()
  const queryClient = useQueryClient()
  const [toggles, setToggles] = useState(() => getInitialToggles(user))
  const [errorToast, setErrorToast] = useState<string | null>(null)

  useEffect(() => {
    setToggles(getInitialToggles(user))
  }, [user])

  useEffect(() => {
    const parseStoredBoolean = (value: string | null): boolean | null => {
      if (value === null) return null
      if (value === 'true') return true
      if (value === 'false') return false
      return null
    }

    const hydrateToggles = async () => {
      try {
        const keys = Object.values(TOGGLE_KEYS)
        const entries = await AsyncStorage.multiGet(keys)

        const storedValues = new Map(entries)
        setToggles((previous) => {
          const next = { ...previous }

          for (const field of Object.keys(TOGGLE_KEYS) as ToggleField[]) {
            const parsed = parseStoredBoolean(storedValues.get(TOGGLE_KEYS[field]) ?? null)
            if (parsed !== null) {
              next[field] = parsed
            }
          }

          return next
        })
      } catch {
        // Ignorar erros de hydration de settings
      }
    }

    void hydrateToggles()
  }, [])

  useEffect(() => {
    if (!errorToast) {
      return
    }

    const timeout = setTimeout(() => setErrorToast(null), 2500)
    return () => clearTimeout(timeout)
  }, [errorToast])

  const updateCachedUser = useCallback((field: ToggleField, value: boolean) => {
    queryClient.setQueryData(['user', 'me'], (previous: UserQueryData | undefined) => {
      if (!previous) {
        return previous
      }

      return {
        ...previous,
        [field]: value,
      }
    })
  }, [queryClient])

  const persistToggle = (field: ToggleField, value: boolean) => {
    AsyncStorage.setItem(TOGGLE_KEYS[field], String(value)).catch(() => {})
  }

  const handleToggle = useCallback(async (field: ToggleField, value: boolean) => {
    const previousValue = toggles[field]

    if (toggles.hapticsEnabled || field === 'hapticsEnabled') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    }

    setToggles((previous) => ({ ...previous, [field]: value }))
    persistToggle(field, value)
    updateCachedUser(field, value)

    try {
      await api.put('/users/me', { [field]: value })
    } catch {
      setToggles((previous) => ({ ...previous, [field]: previousValue }))
      persistToggle(field, previousValue)
      updateCachedUser(field, previousValue)
      setErrorToast('Nao foi possivel guardar a alteracao.')
    }
  }, [toggles, updateCachedUser])

  const handleSignOut = () => {
    Alert.alert(
      'Sair da Conta',
      'Tens a certeza que queres sair?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sair',
          style: 'destructive',
          onPress: async () => {
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)

            try {
              await AsyncStorage.multiRemove(LOCAL_KEYS_TO_CLEAR)
              await signOut()
              router.replace('/(auth)/sign-in')
            } catch {
              Alert.alert('Erro', 'Nao foi possivel sair. Tenta novamente.')
            }
          },
        },
      ],
    )
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
            router.back()
          }}
          style={styles.backBtn}
        >
          <Ionicons name="arrow-back" size={22} color={COLORS.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>DEFINICOES</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Section title="CONTA">
          <SettingItem icon="👤" label="Editar Perfil" onPress={() => {}} disabled />
          <View style={styles.divider} />
          <SettingItem icon="📧" label="Email" value={user?.email ?? '—'} disabled />
          <View style={styles.divider} />
          <SettingItem icon="🔐" label="Alterar Senha" onPress={() => {}} disabled />
          <View style={styles.divider} />
          <SettingItem
            icon="🧬"
            label="Refazer Teste DNA"
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
              router.push('/(onboarding)/dna-test')
            }}
          />
        </Section>

        <Section title="APRENDIZADO">
          <SettingItem icon="⏰" label="Lembrete diario" value="20:00" disabled />
          <View style={styles.divider} />
          <SettingItem icon="⏱️" label="Meta diaria" value={`${user?.dailyTimeGoalMinutes ?? 15} min`} disabled />
          <View style={styles.divider} />
          <SettingItem icon="🌐" label="Idioma" value={user?.locale?.toUpperCase() ?? 'PT'} disabled />
          <View style={styles.divider} />
          <SettingToggle
            icon="🎵"
            label="Sons"
            value={toggles.soundEnabled}
            onToggle={(value) => handleToggle('soundEnabled', value)}
          />
          <View style={styles.divider} />
          <SettingToggle
            icon="📳"
            label="Vibracao (Haptics)"
            value={toggles.hapticsEnabled}
            onToggle={(value) => handleToggle('hapticsEnabled', value)}
          />
        </Section>

        <Section title="NOTIFICACOES">
          <SettingToggle
            icon="🔥"
            label="Lembrete de Streak"
            description="Avisa-me se nao treinar ate as 20h"
            value={toggles.notifyStreak}
            onToggle={(value) => handleToggle('notifyStreak', value)}
          />
          <View style={styles.divider} />
          <SettingToggle
            icon="📚"
            label="Novas Missoes"
            description="Notifica quando ha novo conteudo"
            value={toggles.notifyNewMission}
            onToggle={(value) => handleToggle('notifyNewMission', value)}
          />
          <View style={styles.divider} />
          <SettingToggle
            icon="👥"
            label="Actividade Social"
            description="Likes e comentarios nos meus posts"
            value={toggles.notifySocial}
            onToggle={(value) => handleToggle('notifySocial', value)}
          />
        </Section>

        <Section title="ASSINATURA">
          <SettingItem icon="⭐" label="Plano actual" value={user?.subscriptionTier ?? 'FREE'} />
          <View style={styles.divider} />
          <Pressable style={styles.upgradeBtn} onPress={() => {}}>
            <Text style={styles.upgradeBtnText}>🚀 UPGRADE PARA PRO | $14.99/mes</Text>
          </Pressable>
        </Section>

        <Section title="SOBRE">
          <SettingItem icon="📋" label="Termos de Uso" onPress={() => {}} disabled />
          <View style={styles.divider} />
          <SettingItem icon="🔒" label="Politica de Privacidade" onPress={() => {}} disabled />
          <View style={styles.divider} />
          <SettingItem icon="❤️" label="Avaliar o App" onPress={() => {}} disabled />
          <View style={styles.divider} />
          <SettingItem icon="📧" label="Contacto / Suporte" onPress={() => {}} disabled />
          <View style={styles.divider} />
          <SettingItem icon="📱" label="Versao" value="1.0.0" />
        </Section>

        <Section title="">
          <Pressable style={styles.signOutBtn} onPress={handleSignOut}>
            <Text style={styles.signOutText}>🚪 Sair da Conta</Text>
          </Pressable>
        </Section>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {errorToast ? (
        <View style={styles.toast}>
          <Text style={styles.toastText}>{errorToast}</Text>
        </View>
      ) : null}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bgPrimary },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderSubtle,
  },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  headerTitle: { color: COLORS.textPrimary, fontSize: 14, fontWeight: '800', letterSpacing: 2 },
  headerSpacer: { width: 40 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 16 },
  section: { marginBottom: 20 },
  sectionTitle: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  sectionCard: {
    backgroundColor: COLORS.bgCard,
    borderRadius: 16,
    overflow: 'hidden',
  },
  divider: { height: 1, backgroundColor: COLORS.borderSubtle, marginHorizontal: 16 },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
    minHeight: 52,
  },
  itemIcon: { fontSize: 18, width: 26 },
  toggleContent: { flex: 1, gap: 4 },
  itemLabel: { flex: 1, color: COLORS.textPrimary, fontSize: 15 },
  itemDescription: { color: COLORS.textMuted, fontSize: 12, lineHeight: 16 },
  itemRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  itemValue: { color: COLORS.textMuted, fontSize: 14 },
  upgradeBtn: {
    margin: 12,
    height: 50,
    backgroundColor: COLORS.accentPurple,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  upgradeBtnText: { color: '#FFF', fontSize: 13, fontWeight: '700', letterSpacing: 0.5 },
  signOutBtn: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  signOutText: { color: COLORS.accentRed, fontSize: 16, fontWeight: '600' },
  bottomSpacer: { height: 40 },
  toast: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 24,
    backgroundColor: COLORS.accentRed,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  toastText: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
})
