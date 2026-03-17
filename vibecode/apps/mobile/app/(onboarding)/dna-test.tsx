// DNA Test — 10 perguntas (1 de cada vez com transição animada)
import { useState, useCallback, useRef } from 'react'
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Animated,
  ScrollView,
} from 'react-native'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import * as Haptics from 'expo-haptics'
import ProgressBar from '../../components/ui/progress-bar'
import Button from '../../components/ui/button'
import Input from '../../components/ui/input'
import { useUserStore } from '../../stores/user-store'
import { api } from '../../services/api'

// ═══════════════════════════════════════
// Tipos e Dados das Perguntas
// ═══════════════════════════════════════

interface QuestionOption {
  emoji: string
  label: string
  value: string
}

interface Question {
  id: string
  question: string
  type: 'single' | 'multiple' | 'text'
  options?: QuestionOption[]
  placeholder?: string
  maxLength?: number
}

const QUESTIONS: Question[] = [
  {
    id: 'techRelation',
    question: 'Qual sua relação com tecnologia?',
    type: 'single',
    options: [
      { emoji: '🤷', label: 'Uso celular e redes sociais, só', value: 'consumer' },
      { emoji: '💻', label: 'Trabalho com tech mas não programo', value: 'tech_adjacent' },
      { emoji: '👨‍💻', label: 'Já mexi com código alguma vez', value: 'dabbled' },
    ],
  },
  {
    id: 'experience',
    question: 'Você já programou algo na vida?',
    type: 'single',
    options: [
      { emoji: '🙅', label: 'Nunca, nem HTML', value: 'zero' },
      { emoji: '🌐', label: 'Só HTML/CSS básico', value: 'html_only' },
      { emoji: '📝', label: 'Já fiz scripts simples', value: 'scripts' },
      { emoji: '💪', label: 'Já construí projetos pequenos', value: 'projects' },
    ],
  },
  {
    id: 'codeFeeling',
    question: 'Quando você vê código, o que sente?',
    type: 'single',
    options: [
      { emoji: '😰', label: 'Pânico total', value: 'panic' },
      { emoji: '🤔', label: 'Curioso mas perdido', value: 'curious' },
      { emoji: '😊', label: 'Entendo o básico', value: 'basic' },
      { emoji: '💪', label: 'Me sinto em casa', value: 'at_home' },
    ],
  },
  {
    id: 'aiUsage',
    question: 'Já usou ChatGPT ou Claude para algo?',
    type: 'single',
    options: [
      { emoji: '❌', label: 'Nunca usei', value: 'never' },
      { emoji: '🔍', label: 'Já usei para pesquisar', value: 'research' },
      { emoji: '💬', label: 'Uso regularmente', value: 'regular' },
      { emoji: '🤖', label: 'Uso para tudo!', value: 'power_user' },
    ],
  },
  {
    id: 'buildGoals',
    question: 'O que quer CONSTRUIR?',
    type: 'multiple',
    options: [
      { emoji: '📱', label: 'App mobile', value: 'mobile_app' },
      { emoji: '🌐', label: 'Site / Landing page', value: 'website' },
      { emoji: '🛒', label: 'Loja online', value: 'ecommerce' },
      { emoji: '🤖', label: 'Chatbot / IA', value: 'chatbot' },
      { emoji: '📊', label: 'Dashboard', value: 'dashboard' },
      { emoji: '💰', label: 'SaaS (produto digital)', value: 'saas' },
      { emoji: '🎮', label: 'Jogo', value: 'game' },
      { emoji: '🔧', label: 'Automatização', value: 'automation' },
    ],
  },
  {
    id: 'learningStyle',
    question: 'Como você aprende melhor?',
    type: 'single',
    options: [
      { emoji: '📖', label: 'Lendo', value: 'READING' },
      { emoji: '🎥', label: 'Assistindo vídeos', value: 'WATCHING' },
      { emoji: '🔨', label: 'Fazendo / Praticando', value: 'DOING' },
      { emoji: '🗣️', label: 'Conversando / Perguntando', value: 'TALKING' },
    ],
  },
  {
    id: 'dailyTime',
    question: 'Quanto tempo por dia pode dedicar?',
    type: 'single',
    options: [
      { emoji: '⚡', label: '10 min (micro-doses)', value: '5-15' },
      { emoji: '☕', label: '30 min (café learning)', value: '15-30' },
      { emoji: '🔥', label: '1 hora (focado)', value: '30-60' },
      { emoji: '🚀', label: '2h+ (modo intenso)', value: '60+' },
    ],
  },
  {
    id: 'mainGoal',
    question: 'Qual seu objetivo principal?',
    type: 'single',
    options: [
      { emoji: '💼', label: 'Mudar de carreira para tech', value: 'career_change' },
      { emoji: '💰', label: 'Renda extra / freelance', value: 'freelance' },
      { emoji: '🧠', label: 'Criar meu próprio produto', value: 'own_product' },
      { emoji: '📚', label: 'Curiosidade / hobby', value: 'hobby' },
    ],
  },
  {
    id: 'computer',
    question: 'Você tem computador?',
    type: 'single',
    options: [
      { emoji: '🍎', label: 'Mac', value: 'mac' },
      { emoji: '🪟', label: 'Windows', value: 'windows' },
      { emoji: '🐧', label: 'Linux', value: 'linux' },
      { emoji: '📱', label: 'Só celular / Chromebook', value: 'mobile_only' },
    ],
  },
  {
    id: 'currentArea',
    question: 'Em que área trabalha hoje?',
    type: 'text',
    placeholder: 'Ex: Design, Marketing, Vendas...',
    maxLength: 100,
  },
]

// ═══════════════════════════════════════
// Componente Principal
// ═══════════════════════════════════════

export default function DNATestScreen() {
  const router = useRouter()
  const setDnaProfile = useUserStore((s) => s.setDnaProfile)

  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({})
  const [multipleSelected, setMultipleSelected] = useState<string[]>([])
  const [textAnswer, setTextAnswer] = useState('')
  const fadeAnim = useRef(new Animated.Value(1)).current

  const question = QUESTIONS[currentQuestion]
  if (!question) return null

  const progress = (currentQuestion + 1) / QUESTIONS.length

  // Animação de transição
  const animateTransition = useCallback(
    (callback: () => void) => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        callback()
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }).start()
      })
    },
    [fadeAnim],
  )

  const goToNext = useCallback(
    (newAnswers: Record<string, string | string[]>) => {
      if (currentQuestion < QUESTIONS.length - 1) {
        animateTransition(() => {
          setCurrentQuestion((prev) => prev + 1)
          setMultipleSelected([])
          setTextAnswer('')
        })
      } else {
        // Última pergunta — finalizar
        finalizeDNA(newAnswers)
      }
    },
    [currentQuestion, animateTransition],
  )

  // Selecionar opção (single)
  const handleSelectSingle = useCallback(
    async (value: string) => {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
      const newAnswers = { ...answers, [question.id]: value }
      setAnswers(newAnswers)

      // Auto-advance com delay
      setTimeout(() => {
        goToNext(newAnswers)
      }, 400)
    },
    [answers, question.id, goToNext],
  )

  // Selecionar opção (multiple)
  const handleToggleMultiple = useCallback(
    async (value: string) => {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
      setMultipleSelected((prev) =>
        prev.includes(value)
          ? prev.filter((v) => v !== value)
          : [...prev, value],
      )
    },
    [],
  )

  // Confirmar múltipla seleção
  const handleConfirmMultiple = useCallback(() => {
    const newAnswers = { ...answers, [question.id]: multipleSelected }
    setAnswers(newAnswers)
    goToNext(newAnswers)
  }, [answers, question.id, multipleSelected, goToNext])

  // Confirmar texto livre
  const handleConfirmText = useCallback(() => {
    const newAnswers = { ...answers, [question.id]: textAnswer.trim() }
    setAnswers(newAnswers)
    finalizeDNA(newAnswers)
  }, [answers, question.id, textAnswer])

  // Finalizar DNA e navegar para resultado
  const finalizeDNA = useCallback(
    async (finalAnswers: Record<string, string | string[]>) => {
      // Mapear respostas para o formato DNAProfile
      const experience = (() => {
        const exp = finalAnswers.experience
        if (exp === 'zero' || exp === 'html_only') return 'zero'
        if (exp === 'scripts') return 'dabbled'
        if (exp === 'projects') return 'some'
        return 'zero'
      })()

      const dnaProfile = {
        techRelation: (finalAnswers.techRelation as string) || 'consumer',
        experience,
        codeFeeling: (finalAnswers.codeFeeling as string) || 'curious',
        aiUsage: (finalAnswers.aiUsage as string) || 'never',
        buildGoals: (finalAnswers.buildGoals as string[]) || [],
        learningStyle: (finalAnswers.learningStyle as string) || 'DOING',
        dailyTime: (finalAnswers.dailyTime as string) || '15-30',
        mainGoal: (finalAnswers.mainGoal as string) || 'hobby',
        hasComputer: (finalAnswers.computer as string) !== 'mobile_only',
        currentArea: (finalAnswers.currentArea as string) || '',
      }

      // Guardar no Zustand
      setDnaProfile(dnaProfile)

      // Guardar respostas completas para o resultado
      // (incluindo as que não fazem parte do DNAProfile formal)
      try {
        // Tentar enviar para a API
        await api.post('/users/dna', dnaProfile)
      } catch {
        // Se falhar (ex: sem internet), continua — será reenviado depois
        console.warn('[DNA] API call failed, will retry later')
      }

      router.replace('/(onboarding)/dna-result')
    },
    [setDnaProfile, router],
  )

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🧬 SEU DNA VIBE CODER</Text>
        <Text style={styles.headerSubtitle}>
          Pergunta {currentQuestion + 1} de {QUESTIONS.length}
        </Text>
        <ProgressBar progress={progress} variant="gradient" />
      </View>

      {/* Pergunta */}
      <Animated.View style={[styles.questionContainer, { opacity: fadeAnim }]}>
        <Text style={styles.questionText}>{question.question}</Text>

        {question.type === 'multiple' ? (
          <Text style={styles.multipleHint}>Pode selecionar várias opções</Text>
        ) : null}

        <ScrollView
          style={styles.optionsScroll}
          contentContainerStyle={styles.optionsContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Single / Multiple options */}
          {question.options?.map((option) => {
            const isSelected =
              question.type === 'multiple'
                ? multipleSelected.includes(option.value)
                : answers[question.id] === option.value

            return (
              <Pressable
                key={option.value}
                onPress={() =>
                  question.type === 'multiple'
                    ? handleToggleMultiple(option.value)
                    : handleSelectSingle(option.value)
                }
                style={({ pressed }) => [
                  styles.optionCard,
                  isSelected && styles.optionSelected,
                  pressed && styles.optionPressed,
                ]}
              >
                <Text style={styles.optionEmoji}>{option.emoji}</Text>
                <Text
                  style={[
                    styles.optionLabel,
                    isSelected && styles.optionLabelSelected,
                  ]}
                >
                  {option.label}
                </Text>
              </Pressable>
            )
          })}

          {/* Text input */}
          {question.type === 'text' ? (
            <View style={styles.textInputContainer}>
              <Input
                value={textAnswer}
                onChangeText={setTextAnswer}
                placeholder={question.placeholder}
                maxLength={question.maxLength}
              />
            </View>
          ) : null}
        </ScrollView>

        {/* Botão confirmar para múltipla e texto */}
        {question.type === 'multiple' && multipleSelected.length > 0 ? (
          <View style={styles.confirmButton}>
            <Button
              title="Continuar"
              onPress={handleConfirmMultiple}
              variant="primary"
              size="lg"
            />
          </View>
        ) : null}

        {question.type === 'text' && textAnswer.trim().length > 0 ? (
          <View style={styles.confirmButton}>
            <Button
              title="Finalizar"
              onPress={handleConfirmText}
              variant="primary"
              size="lg"
            />
          </View>
        ) : null}
      </Animated.View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0F',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
    gap: 8,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  headerSubtitle: {
    color: '#888888',
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 4,
  },
  questionContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  questionText: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 30,
  },
  multipleHint: {
    color: '#8B5CF6',
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 8,
  },
  optionsScroll: {
    flex: 1,
    marginTop: 16,
  },
  optionsContent: {
    gap: 10,
    paddingBottom: 80,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A2E',
    borderWidth: 1,
    borderColor: '#333333',
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  optionSelected: {
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
    borderColor: '#8B5CF6',
  },
  optionPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  optionEmoji: {
    fontSize: 24,
  },
  optionLabel: {
    flex: 1,
    color: '#CCCCCC',
    fontSize: 15,
    fontWeight: '500',
  },
  optionLabelSelected: {
    color: '#FFFFFF',
  },
  textInputContainer: {
    marginTop: 8,
  },
  confirmButton: {
    position: 'absolute',
    bottom: 24,
    left: 0,
    right: 0,
  },
})
