// VibeCode — Tela de Settings
import { useState, useCallback } from 'react'
import { ScrollView, View, StyleSheet, Pressable, Switch, Alert } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useAuth } from '@clerk/clerk-expo'
import * as Haptics from 'expo-haptics'
import { MMKV } from 'react-native-mmkv'
import Text from '../../components/ui/text'
import { COLORS } from '@vibecode/shared'
import { useUser } from '../../hooks/use-user'
import { api } from '../../services/api'
import { useQueryClient } from '@tanstack/react-query'

const storage = new MMKV({ id: 'settings' })

type ToggleField = 'soundEnabled' | 'hapticsEnabled' | 'notifyStreak' | 'notifyNewMission' | 'notifySocial' | 'notifyNews'

// ── SettingItem: linha simples → ────────────────────────
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
        {value && <Text style={styles.itemValue}>{value}</Text>}
        {onPress && !disabled && (
          <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
        )}
      </View>
    </Pressable>
  )
}

// ── SettingToggle: linha com switch ─────────────────────
interface SettingToggleProps {
  icon: string
  label: string
  value: boolean
  onToggle: (v: boolean) => void
}
function SettingToggle({ icon, label, value, onToggle }: SettingToggleProps) {
  return (
    <View style={styles.item}>
      <Text style={styles.itemIcon}>{icon}</Text>
      <Text style={styles.itemLabel}>{label}</Text>
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

// ── Secção card ─────────────────────────────────────────
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

// ── Tela principal ──────────────────────────────────────
export default function SettingsScreen() {
  const { signOut } = useAuth()
  const { user } = useUser()
  const qc = useQueryClient()

  // Estado local dos toggles (inicializado do user ou MMKV)
  const [toggles, setToggles] = useState({
    soundEnabled: storage.getBoolean('soundEnabled') ?? user?.soundEnabled ?? true,
    hapticsEnabled: storage.getBoolean('hapticsEnabled') ?? user?.hapticsEnabled ?? true,
    notifyStreak: storage.getBoolean('notifyStreak') ?? user?.notifyStreak ?? true,
    notifyNewMission: storage.getBoolean('notifyNewMission') ?? user?.notifyNewMission ?? true,
    notifySocial: storage.getBoolean('notifySocial') ?? user?.notifySocial ?? true,
    notifyNews: storage.getBoolean('notifyNews') ?? user?.notifyNews ?? true,
  })

  const handleToggle = useCallback(async (field: ToggleField, value: boolean) => {
    if (toggles.hapticsEnabled || field === 'hapticsEnabled') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    }

    // Update local state immediately
    setToggles((prev) => ({ ...prev, [field]: value }))
    storage.set(field, value)

    // Sync with API (fire-and-forget)
    try {
      await api.put('/users/me', { [field]: value })
      qc.invalidateQueries({ queryKey: ['user', 'me'] })
    } catch {
      // Reverter em caso de erro
      setToggles((prev) => ({ ...prev, [field]: !value }))
      storage.set(field, !value)
    }
  }, [toggles.hapticsEnabled, qc])

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
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)
            try {
              // Limpar MMKV
              storage.clearAll()
              const viStorage = new MMKV({ id: 'vi-chat' })
              viStorage.clearAll()
              const gamStorage = new MMKV({ id: 'gamification' })
              gamStorage.clearAll()

              await signOut()
              router.replace('/(auth)/sign-in')
            } catch {
              Alert.alert('Erro', 'Não foi possível sair. Tenta novamente.')
            }
          },
        },
      ]
    )
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
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
        <Text style={styles.headerTitle}>DEFINIÇÕES</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* CONTA */}
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

        {/* APRENDIZADO */}
        <Section title="APRENDIZADO">
          <SettingItem icon="⏰" label="Lembrete diário" value="20:00" disabled />
          <View style={styles.divider} />
          <SettingItem icon="⏱️" label="Meta diária" value={`${user?.dailyTimeGoalMinutes ?? 15} min`} disabled />
          <View style={styles.divider} />
          <SettingItem icon="🌐" label="Idioma" value={user?.locale?.toUpperCase() ?? 'PT'} disabled />
          <View style={styles.divider} />
          <SettingToggle
            icon="🎵"
            label="Sons"
            value={toggles.soundEnabled}
            onToggle={(v) => handleToggle('soundEnabled', v)}
          />
          <View style={styles.divider} />
          <SettingToggle
            icon="📳"
            label="Vibração (Haptics)"
            value={toggles.hapticsEnabled}
            onToggle={(v) => handleToggle('hapticsEnabled', v)}
          />
        </Section>

        {/* NOTIFICAÇÕES */}
        <Section title="NOTIFICAÇÕES">
          <SettingToggle
            icon="🔥"
            label="Streak em risco"
            value={toggles.notifyStreak}
            onToggle={(v) => handleToggle('notifyStreak', v)}
          />
          <View style={styles.divider} />
          <SettingToggle
            icon="📚"
            label="Novas missões"
            value={toggles.notifyNewMission}
            onToggle={(v) => handleToggle('notifyNewMission', v)}
          />
          <View style={styles.divider} />
          <SettingToggle
            icon="👥"
            label="Social"
            value={toggles.notifySocial}
            onToggle={(v) => handleToggle('notifySocial', v)}
          />
          <View style={styles.divider} />
          <SettingToggle
            icon="🗞️"
            label="Vibe News"
            value={toggles.notifyNews}
            onToggle={(v) => handleToggle('notifyNews', v)}
          />
        </Section>

        {/* ASSINATURA */}
        <Section title="ASSINATURA">
          <SettingItem
            icon="⭐"
            label="Plano actual"
            value={user?.subscriptionTier ?? 'FREE'}
          />
          <View style={styles.divider} />
          <Pressable style={styles.upgradeBtn} onPress={() => {}}>
            <Text style={styles.upgradeBtnText}>🚀 UPGRADE PARA PRO — $14.99/mês</Text>
          </Pressable>
        </Section>

        {/* SOBRE */}
        <Section title="SOBRE">
          <SettingItem icon="📋" label="Termos de Uso" onPress={() => {}} disabled />
          <View style={styles.divider} />
          <SettingItem icon="🔒" label="Política de Privacidade" onPress={() => {}} disabled />
          <View style={styles.divider} />
          <SettingItem icon="❤️" label="Avaliar o App" onPress={() => {}} disabled />
          <View style={styles.divider} />
          <SettingItem icon="📧" label="Contacto / Suporte" onPress={() => {}} disabled />
          <View style={styles.divider} />
          <SettingItem icon="📱" label="Versão" value="1.0.0" />
        </Section>

        {/* SAIR */}
        <Section title="">
          <Pressable style={styles.signOutBtn} onPress={handleSignOut}>
            <Text style={styles.signOutText}>🚪 Sair da Conta</Text>
          </Pressable>
        </Section>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bgPrimary },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: COLORS.borderSubtle,
  },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  headerTitle: { color: COLORS.textPrimary, fontSize: 14, fontWeight: '800', letterSpacing: 2 },

  scrollContent: { paddingHorizontal: 16, paddingTop: 16 },

  section: { marginBottom: 20 },
  sectionTitle: {
    color: COLORS.textMuted, fontSize: 11, fontWeight: '700',
    letterSpacing: 1.5, textTransform: 'uppercase',
    marginBottom: 8, paddingHorizontal: 4,
  },
  sectionCard: {
    backgroundColor: COLORS.bgCard,
    borderRadius: 16,
    overflow: 'hidden',
  },
  divider: { height: 1, backgroundColor: COLORS.borderSubtle, marginHorizontal: 16 },

  item: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 14, gap: 12,
    minHeight: 52,
  },
  itemIcon: { fontSize: 18, width: 26 },
  itemLabel: { flex: 1, color: COLORS.textPrimary, fontSize: 15 },
  itemRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  itemValue: { color: COLORS.textMuted, fontSize: 14 },

  // Upgrade
  upgradeBtn: {
    margin: 12,
    height: 50,
    backgroundColor: COLORS.accentPurple,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  upgradeBtnText: { color: '#FFF', fontSize: 13, fontWeight: '700', letterSpacing: 0.5 },

  // Sign out
  signOutBtn: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  signOutText: { color: COLORS.accentRed, fontSize: 16, fontWeight: '600' },
})
