// DNA Result — Perfil calculado + tempo estimado + redirect para tabs
import { useState, useEffect, useCallback } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Animated,
  ScrollView,
} from 'react-native'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import Button from '../../components/ui/button'
import Card from '../../components/ui/card'
import { useUserStore } from '../../stores/user-store'

// ═══════════════════════════════════════
// Lógica de cálculo do perfil
// ═══════════════════════════════════════

interface ProfileResult {
  emoji: string
  name: string
  description: string
}

const PROFILES: Record<string, ProfileResult> = {
  creator: {
    emoji: '🎨',
    name: 'CRIADOR',
    description: 'Você tem olho para estética e quer criar coisas visuais. Perfeito para vibe coding! Vamos transformar suas ideias em apps reais.',
  },
  solver: {
    emoji: '🧩',
    name: 'SOLUCIONADOR',
    description: 'Você gosta de resolver problemas e já se sente em casa com código. Vamos levar as suas skills para o próximo nível com IA.',
  },
  entrepreneur: {
    emoji: '💰',
    name: 'EMPREENDEDOR',
    description: 'Você quer criar o seu próprio produto ou ganhar renda extra. O vibe coding é o atalho perfeito para lançar rápido.',
  },
  explorer: {
    emoji: '🔭',
    name: 'EXPLORADOR',
    description: 'Você é curioso e quer entender como as coisas funcionam. O Vi vai ser o seu guia nesta viagem pelo mundo do código.',
  },
  automator: {
    emoji: '⚡',
    name: 'AUTOMATIZADOR',
    description: 'Você quer automatizar tudo e tornar a vida mais eficiente. Com IA, vai criar ferramentas que trabalham por si.',
  },
}

const calculateProfile = (buildGoals: string[], mainGoal: string, codeFeeling: string): ProfileResult => {
  // Se buildGoals inclui design/visual heavy → Criador
  const visualGoals = ['website', 'mobile_app', 'game']
  const hasVisualGoals = buildGoals.some((g) => visualGoals.includes(g))

  // Se codeFeeling = "at_home" → Solucionador
  if (codeFeeling === 'at_home') return PROFILES.solver!

  // Se mainGoal = "own_product" ou "freelance" → Empreendedor
  if (mainGoal === 'own_product' || mainGoal === 'freelance') return PROFILES.entrepreneur!

  // Se mainGoal = "hobby" → Explorador
  if (mainGoal === 'hobby') return PROFILES.explorer!

  // Se buildGoals inclui "automation" → Automatizador
  if (buildGoals.includes('automation')) return PROFILES.automator!

  // Se tem goals visuais → Criador
  if (hasVisualGoals) return PROFILES.creator!

  // Default
  return PROFILES.creator!
}

interface TimeEstimate {
  label: string
  color: string
  emoji: string
  weeks: number
}

const calculateTimeEstimates = (dailyTime: string): TimeEstimate[] => {
  // Base (30min/dia)
  const base = { basic: 2, intermediate: 6, advanced: 12, expert: 24 }

  const multiplier: Record<string, number> = {
    '5-15': 2.5,
    '15-30': 1,
    '30-60': 0.6,
    '60+': 0.4,
  }

  const mult = multiplier[dailyTime] ?? 1

  return [
    {
      label: 'Básico',
      color: '#22C55E',
      emoji: '🟢',
      weeks: Math.ceil(base.basic * mult),
    },
    {
      label: 'Intermediário',
      color: '#F59E0B',
      emoji: '🟡',
      weeks: Math.ceil(base.intermediate * mult),
    },
    {
      label: 'Avançado',
      color: '#F97316',
      emoji: '🟠',
      weeks: Math.ceil(base.advanced * mult),
    },
    {
      label: 'Expert',
      color: '#EF4444',
      emoji: '🔴',
      weeks: Math.ceil(base.expert * mult),
    },
  ]
}

// ═══════════════════════════════════════
// Componente Principal
// ═══════════════════════════════════════

export default function DNAResultScreen() {
  const router = useRouter()
  const { dnaProfile, setHasCompletedOnboarding } = useUserStore()

  const [isCalculating, setIsCalculating] = useState(true)
  const pulseAnim = useState(() => new Animated.Value(1))[0]
  const fadeAnim = useState(() => new Animated.Value(0))[0]

  // Calcular perfil
  const buildGoals = dnaProfile?.buildGoals ?? []
  const mainGoal = dnaProfile?.mainGoal ?? 'hobby'
  const dailyTime = dnaProfile?.dailyTime ?? '15-30'

  const profile = calculateProfile(buildGoals, mainGoal, '')
  const timeEstimates = calculateTimeEstimates(dailyTime)

  // Animação de "calculando"
  useEffect(() => {
    // Pulse animation
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
    )
    pulse.start()

    // Mostrar resultado após 2 segundos
    const timer = setTimeout(() => {
      pulse.stop()
      setIsCalculating(false)
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start()
    }, 2000)

    return () => {
      clearTimeout(timer)
      pulse.stop()
    }
  }, [pulseAnim, fadeAnim])

  // Ir para tabs
  const handleStart = useCallback(() => {
    setHasCompletedOnboarding(true)
    router.replace('/(tabs)/home' as never)
  }, [setHasCompletedOnboarding, router])

  // Tela de "calculando"
  if (isCalculating) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.calculatingContainer}>
          <Animated.Text
            style={[
              styles.calculatingEmoji,
              { transform: [{ scale: pulseAnim }] },
            ]}
          >
            🧬
          </Animated.Text>
          <Text style={styles.calculatingTitle}>A analisar o teu DNA...</Text>
          <ActivityIndicator color="#8B5CF6" size="large" style={styles.spinner} />
        </View>
      </SafeAreaView>
    )
  }

  // Resultado
  return (
    <SafeAreaView style={styles.container}>
      <Animated.View style={[styles.resultContainer, { opacity: fadeAnim }]}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Perfil */}
          <View style={styles.profileSection}>
            <Text style={styles.profileEmoji}>{profile.emoji}</Text>
            <Text style={styles.profileTitle}>Perfil: {profile.name} {profile.emoji}</Text>
            <Text style={styles.profileLevel}>Nível inicial: Iniciante</Text>
          </View>

          {/* Card de estimativa */}
          <Card variant="elevated" style={styles.estimateCard}>
            <Text style={styles.estimateTitle}>Tempo estimado:</Text>
            {timeEstimates.map((est) => (
              <View key={est.label} style={styles.estimateRow}>
                <Text style={styles.estimateEmoji}>{est.emoji}</Text>
                <Text style={styles.estimateLabel}>{est.label}:</Text>
                <Text style={[styles.estimateWeeks, { color: est.color }]}>
                  {est.weeks} semanas
                </Text>
              </View>
            ))}
          </Card>

          {/* Mensagem personalizada */}
          <Card style={styles.messageCard}>
            <Text style={styles.messageIcon}>💬</Text>
            <Text style={styles.messageText}>{profile.description}</Text>
          </Card>
        </ScrollView>

        {/* Botão */}
        <View style={styles.buttonContainer}>
          <Button
            title="🚀 VER MINHA TRILHA"
            onPress={handleStart}
            variant="primary"
            size="xl"
          />
        </View>
      </Animated.View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0F',
  },
  // Calculando
  calculatingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  calculatingEmoji: {
    fontSize: 80,
    marginBottom: 24,
  },
  calculatingTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
  },
  spinner: {
    marginTop: 24,
  },
  // Resultado
  resultContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 100,
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  profileEmoji: {
    fontSize: 72,
    marginBottom: 16,
  },
  profileTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  profileLevel: {
    color: '#888888',
    fontSize: 16,
  },
  estimateCard: {
    marginBottom: 16,
    gap: 12,
  },
  estimateTitle: {
    color: '#CCCCCC',
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  estimateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  estimateEmoji: {
    fontSize: 16,
  },
  estimateLabel: {
    color: '#CCCCCC',
    fontSize: 15,
    width: 110,
  },
  estimateWeeks: {
    fontSize: 15,
    fontWeight: '700',
  },
  messageCard: {
    marginBottom: 16,
    gap: 12,
  },
  messageIcon: {
    fontSize: 24,
  },
  messageText: {
    color: '#CCCCCC',
    fontSize: 15,
    lineHeight: 22,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingBottom: 32,
    backgroundColor: '#0A0A0F',
  },
})
