// VibeCode — Constantes do Sistema
// LEVELS, STREAK_BONUSES, ACHIEVEMENTS, ISLANDS, APP_CONFIG, COLORS

import type { Achievement, Island, IslandLevel } from '../types'

// ═══════════════════════════════════════
// COLORS — Design System
// ═══════════════════════════════════════

export const COLORS = {
  // Backgrounds
  bgPrimary: '#0A0A0F',
  bgSecondary: '#111118',
  bgCard: '#1A1A2E',
  bgElevated: '#1E1E3A',
  bgCode: '#0A0A0F',

  // Textos
  textPrimary: '#FFFFFF',
  textSecondary: '#CCCCCC',
  textTertiary: '#888888',
  textMuted: '#666666',

  // Bordas
  borderDefault: '#333333',
  borderSubtle: '#222222',
  borderFocus: '#8B5CF6',

  // Acentos
  accentPurple: '#8B5CF6',
  accentBlue: '#3B82F6',
  accentCyan: '#06B6D4',
  accentGreen: '#22C55E',
  accentYellow: '#F59E0B',
  accentRed: '#EF4444',
  accentGold: '#FFD700',

  // Gradientes (para usar com expo-linear-gradient)
  gradientPrimary: ['#8B5CF6', '#3B82F6'] as const,
  gradientGold: ['#FFD700', '#F97316'] as const,
  gradientDark: ['#0A0A0F', '#111118'] as const,

  // Overlay
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(0, 0, 0, 0.3)',

  // Status
  success: '#22C55E',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',

  // Transparências
  purpleAlpha10: 'rgba(139, 92, 246, 0.1)',
  purpleAlpha20: 'rgba(139, 92, 246, 0.2)',
  purpleAlpha30: 'rgba(139, 92, 246, 0.3)',
  blueAlpha10: 'rgba(59, 130, 246, 0.1)',
  greenAlpha10: 'rgba(34, 197, 94, 0.1)',
  yellowAlpha10: 'rgba(245, 158, 11, 0.1)',
  redAlpha10: 'rgba(239, 68, 68, 0.1)',
} as const

// ═══════════════════════════════════════
// TYPOGRAPHY
// ═══════════════════════════════════════

export const FONTS = {
  ui: 'Inter',
  code: 'JetBrains Mono',
} as const

export const FONT_SIZES = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 28,
  '4xl': 36,
} as const

// ═══════════════════════════════════════
// SPACING & DIMENSIONS
// ═══════════════════════════════════════

export const DIMENSIONS = {
  statusBar: 44,
  navBar: 56,
  tabBar: 83,
  tabBarSafeArea: 34,
  buttonSm: 36,
  buttonMd: 44,
  buttonLg: 52,
  buttonXl: 56,
  inputHeight: 48,
  borderRadiusSm: 8,
  borderRadiusMd: 12,
  borderRadiusLg: 16,
  borderRadiusXl: 20,
  borderRadiusFull: 9999,
} as const

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
  '5xl': 48,
} as const

// ═══════════════════════════════════════
// LEVELS (50 níveis)
// ═══════════════════════════════════════

export interface LevelConfig {
  level: number
  xpRequired: number
  title: string
  viForm: string
}

export const LEVELS: LevelConfig[] = [
  { level: 1, xpRequired: 0, title: 'Semente Digital', viForm: '🌱' },
  { level: 2, xpRequired: 100, title: 'Curioso', viForm: '🔍' },
  { level: 3, xpRequired: 250, title: 'Explorador', viForm: '🧭' },
  { level: 4, xpRequired: 500, title: 'Aprendiz', viForm: '📚' },
  { level: 5, xpRequired: 800, title: 'Prompt Padawan', viForm: '🎯' },
  { level: 6, xpRequired: 1200, title: 'Digitador', viForm: '⌨️' },
  { level: 7, xpRequired: 1700, title: 'Code Whisperer', viForm: '🤫' },
  { level: 8, xpRequired: 2300, title: 'Bug Hunter', viForm: '🐛' },
  { level: 9, xpRequired: 3000, title: 'Builder Iniciante', viForm: '🔨' },
  { level: 10, xpRequired: 3800, title: 'Vibe Coder Jr.', viForm: '🎵' },
  { level: 11, xpRequired: 4700, title: 'Criador', viForm: '🎨' },
  { level: 12, xpRequired: 5700, title: 'Inventor', viForm: '💡' },
  { level: 13, xpRequired: 6800, title: 'Desenvolvedor', viForm: '💻' },
  { level: 14, xpRequired: 8000, title: 'Arquitecto', viForm: '🏗️' },
  { level: 15, xpRequired: 9500, title: 'Problem Solver', viForm: '🧩' },
  { level: 16, xpRequired: 11000, title: 'Full Stack Rookie', viForm: '📦' },
  { level: 17, xpRequired: 13000, title: 'API Crafter', viForm: '🔌' },
  { level: 18, xpRequired: 15000, title: 'Data Wrangler', viForm: '📊' },
  { level: 19, xpRequired: 17500, title: 'UI Artisan', viForm: '🖌️' },
  { level: 20, xpRequired: 20000, title: 'Vibe Coder', viForm: '🎸' },
  { level: 21, xpRequired: 23000, title: 'Automatizador', viForm: '⚡' },
  { level: 22, xpRequired: 26000, title: 'System Thinker', viForm: '🧠' },
  { level: 23, xpRequired: 30000, title: 'Cloud Navigator', viForm: '☁️' },
  { level: 24, xpRequired: 34000, title: 'DevOps Initiate', viForm: '🚀' },
  { level: 25, xpRequired: 39000, title: 'Tech Lead Jr.', viForm: '👔' },
  { level: 26, xpRequired: 44000, title: 'Open Source Fan', viForm: '🌍' },
  { level: 27, xpRequired: 50000, title: 'Mentor Aprendiz', viForm: '🎓' },
  { level: 28, xpRequired: 56000, title: 'Product Thinker', viForm: '🎯' },
  { level: 29, xpRequired: 63000, title: 'SaaS Builder', viForm: '🏢' },
  { level: 30, xpRequired: 70000, title: 'Vibe Master', viForm: '🎹' },
  { level: 31, xpRequired: 78000, title: 'Inovador', viForm: '🔬' },
  { level: 32, xpRequired: 87000, title: 'Disruptor', viForm: '💥' },
  { level: 33, xpRequired: 97000, title: 'Empreendedor Tech', viForm: '🦄' },
  { level: 34, xpRequired: 108000, title: 'AI Whisperer', viForm: '🤖' },
  { level: 35, xpRequired: 120000, title: 'Code Samurai', viForm: '⚔️' },
  { level: 36, xpRequired: 133000, title: 'Digital Alchemist', viForm: '⚗️' },
  { level: 37, xpRequired: 147000, title: 'Platform Engineer', viForm: '🏗️' },
  { level: 38, xpRequired: 162000, title: 'Venture Builder', viForm: '🚀' },
  { level: 39, xpRequired: 178000, title: 'Tech Visionary', viForm: '🔮' },
  { level: 40, xpRequired: 195000, title: 'Vibe Legend', viForm: '🎸' },
  { level: 41, xpRequired: 215000, title: 'Code Philosopher', viForm: '📜' },
  { level: 42, xpRequired: 236000, title: 'Digital Sensei', viForm: '🥋' },
  { level: 43, xpRequired: 258000, title: 'Startup Wizard', viForm: '🧙' },
  { level: 44, xpRequired: 282000, title: 'Full Stack Master', viForm: '🎯' },
  { level: 45, xpRequired: 308000, title: 'AI Architect', viForm: '🏛️' },
  { level: 46, xpRequired: 336000, title: 'Innovation Lead', viForm: '💎' },
  { level: 47, xpRequired: 366000, title: 'Code Ascendant', viForm: '✨' },
  { level: 48, xpRequired: 400000, title: 'Digital Titan', viForm: '⚡' },
  { level: 49, xpRequired: 440000, title: 'Vibe Grandmaster', viForm: '👑' },
  { level: 50, xpRequired: 500000, title: 'The Founder', viForm: '🌟' },
]

// Funções utilitárias de nível
export const getLevelForXp = (xp: number): LevelConfig => {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    const level = LEVELS[i]
    if (level && xp >= level.xpRequired) {
      return level
    }
  }
  return LEVELS[0]!
}

export const getXpForNextLevel = (xp: number): number => {
  const currentLevel = getLevelForXp(xp)
  const nextLevel = LEVELS.find((l) => l.level === currentLevel.level + 1)
  if (!nextLevel) return 0
  return nextLevel.xpRequired - xp
}

export const getLevelProgress = (xp: number): number => {
  const currentLevel = getLevelForXp(xp)
  const nextLevel = LEVELS.find((l) => l.level === currentLevel.level + 1)
  if (!nextLevel) return 1
  const currentLevelXp = xp - currentLevel.xpRequired
  const levelRange = nextLevel.xpRequired - currentLevel.xpRequired
  if (levelRange <= 0) return 1
  return Math.min(Math.max(currentLevelXp / levelRange, 0), 1)
}

// ═══════════════════════════════════════
// STREAK BONUSES
// ═══════════════════════════════════════

export interface StreakBonus {
  days: number
  xpBonus: number
  emoji: string
  message: string
}

export const STREAK_BONUSES: StreakBonus[] = [
  { days: 3, xpBonus: 50, emoji: '🔥', message: '3 dias seguidos!' },
  { days: 7, xpBonus: 200, emoji: '⚡', message: '1 semana de streak!' },
  { days: 14, xpBonus: 300, emoji: '💪', message: '2 semanas imparáveis!' },
  { days: 30, xpBonus: 1000, emoji: '🏆', message: '1 mês de dedicação!' },
  { days: 60, xpBonus: 2000, emoji: '💎', message: '2 meses de consistência!' },
  { days: 100, xpBonus: 5000, emoji: '👑', message: '100 dias lendários!' },
  { days: 365, xpBonus: 20000, emoji: '🌟', message: '1 ano inteiro! Lenda!' },
]

// ═══════════════════════════════════════
// ACHIEVEMENTS (45 conquistas)
// ═══════════════════════════════════════

export const ACHIEVEMENTS: Achievement[] = [
  // === Categoria: Início ===
  { id: 'first-login', name: 'Primeiro Passo', description: 'Fez login pela primeira vez', emoji: '👋', category: 'inicio', xpReward: 10, condition: 'first-login', isSecret: false },
  { id: 'dna-complete', name: 'DNA Revelado', description: 'Completou o teste DNA', emoji: '🧬', category: 'inicio', xpReward: 50, condition: 'dna-complete', isSecret: false },
  { id: 'first-mission', name: 'Primeira Missão', description: 'Completou a primeira missão', emoji: '🎯', category: 'inicio', xpReward: 25, condition: 'complete-mission-1', isSecret: false },
  { id: 'profile-setup', name: 'Identidade Digital', description: 'Configurou o perfil completo', emoji: '📸', category: 'inicio', xpReward: 20, condition: 'profile-complete', isSecret: false },
  { id: 'first-vi-chat', name: 'Olá, Vi!', description: 'Teve a primeira conversa com o Vi', emoji: '💬', category: 'inicio', xpReward: 15, condition: 'first-vi-chat', isSecret: false },

  // === Categoria: Missões ===
  { id: 'missions-5', name: 'Explorador', description: 'Completou 5 missões', emoji: '🧭', category: 'missoes', xpReward: 50, condition: 'complete-missions-5', isSecret: false },
  { id: 'missions-10', name: 'Determinado', description: 'Completou 10 missões', emoji: '💪', category: 'missoes', xpReward: 100, condition: 'complete-missions-10', isSecret: false },
  { id: 'missions-25', name: 'Imparável', description: 'Completou 25 missões', emoji: '🔥', category: 'missoes', xpReward: 250, condition: 'complete-missions-25', isSecret: false },
  { id: 'missions-50', name: 'Meio Centenário', description: 'Completou 50 missões', emoji: '🏅', category: 'missoes', xpReward: 500, condition: 'complete-missions-50', isSecret: false },
  { id: 'missions-100', name: 'Centenário', description: 'Completou 100 missões', emoji: '💯', category: 'missoes', xpReward: 1000, condition: 'complete-missions-100', isSecret: false },
  { id: 'perfect-score', name: 'Nota Máxima', description: 'Score de 100 numa missão', emoji: '⭐', category: 'missoes', xpReward: 75, condition: 'perfect-score', isSecret: false },
  { id: 'speed-run', name: 'Speed Runner', description: 'Completou missão em menos de 5 min', emoji: '⚡', category: 'missoes', xpReward: 100, condition: 'speed-run', isSecret: false },
  { id: 'no-hints', name: 'Sem Ajuda', description: 'Completou missão sem usar dicas', emoji: '🧠', category: 'missoes', xpReward: 50, condition: 'no-hints', isSecret: false },

  // === Categoria: Ilhas ===
  { id: 'island-basic', name: 'Ilha Básica Conquistada', description: 'Completou todas as missões da Ilha Básica', emoji: '🏝️', category: 'ilhas', xpReward: 500, condition: 'complete-island-basic', isSecret: false },
  { id: 'island-intermediate', name: 'Ilha Intermédia Conquistada', description: 'Completou todas as missões da Ilha Intermédia', emoji: '⛰️', category: 'ilhas', xpReward: 1000, condition: 'complete-island-intermediate', isSecret: false },
  { id: 'island-advanced', name: 'Ilha Avançada Conquistada', description: 'Completou todas as missões da Ilha Avançada', emoji: '🌋', category: 'ilhas', xpReward: 2000, condition: 'complete-island-advanced', isSecret: false },
  { id: 'island-expert', name: 'Ilha Expert Conquistada', description: 'Completou todas as missões da Ilha Expert', emoji: '🏔️', category: 'ilhas', xpReward: 5000, condition: 'complete-island-expert', isSecret: false },
  { id: 'boss-basic', name: 'Boss: Prompt Monster', description: 'Derrotou o boss da Ilha Básica', emoji: '👾', category: 'ilhas', xpReward: 300, condition: 'beat-boss-basic', isSecret: false },
  { id: 'boss-intermediate', name: 'Boss: API Dragon', description: 'Derrotou o boss da Ilha Intermédia', emoji: '🐉', category: 'ilhas', xpReward: 750, condition: 'beat-boss-intermediate', isSecret: false },
  { id: 'boss-advanced', name: 'Boss: Deploy Titan', description: 'Derrotou o boss da Ilha Avançada', emoji: '🤖', category: 'ilhas', xpReward: 1500, condition: 'beat-boss-advanced', isSecret: false },
  { id: 'boss-expert', name: 'Boss: The Architect', description: 'Derrotou o boss da Ilha Expert', emoji: '👑', category: 'ilhas', xpReward: 3000, condition: 'beat-boss-expert', isSecret: false },

  // === Categoria: Streak ===
  { id: 'streak-3', name: 'Fogo Aceso', description: '3 dias consecutivos', emoji: '🔥', category: 'streak', xpReward: 50, condition: 'streak-3', isSecret: false },
  { id: 'streak-7', name: 'Semana Perfeita', description: '7 dias consecutivos', emoji: '⚡', category: 'streak', xpReward: 200, condition: 'streak-7', isSecret: false },
  { id: 'streak-14', name: 'Duas Semanas', description: '14 dias consecutivos', emoji: '💪', category: 'streak', xpReward: 300, condition: 'streak-14', isSecret: false },
  { id: 'streak-30', name: 'Mês de Ferro', description: '30 dias consecutivos', emoji: '🏆', category: 'streak', xpReward: 1000, condition: 'streak-30', isSecret: false },
  { id: 'streak-100', name: 'Centenário do Streak', description: '100 dias consecutivos', emoji: '💎', category: 'streak', xpReward: 5000, condition: 'streak-100', isSecret: false },
  { id: 'streak-365', name: 'O Lendário', description: '365 dias consecutivos', emoji: '🌟', category: 'streak', xpReward: 20000, condition: 'streak-365', isSecret: false },

  // === Categoria: Vi ===
  { id: 'vi-messages-50', name: 'Conversador', description: 'Enviou 50 mensagens ao Vi', emoji: '💬', category: 'vi', xpReward: 50, condition: 'vi-messages-50', isSecret: false },
  { id: 'vi-messages-200', name: 'Best Friend do Vi', description: 'Enviou 200 mensagens ao Vi', emoji: '🤝', category: 'vi', xpReward: 200, condition: 'vi-messages-200', isSecret: false },
  { id: 'vi-all-modes', name: 'Explorador de Modos', description: 'Usou todos os 8 modos do Vi', emoji: '🎭', category: 'vi', xpReward: 150, condition: 'vi-all-modes', isSecret: false },
  { id: 'vi-code-review', name: 'Code Reviewer', description: 'Pediu 10 code reviews ao Vi', emoji: '🔍', category: 'vi', xpReward: 100, condition: 'vi-code-review-10', isSecret: false },

  // === Categoria: Social ===
  { id: 'first-post', name: 'Primeira Partilha', description: 'Criou o primeiro post social', emoji: '📢', category: 'social', xpReward: 25, condition: 'first-post', isSecret: false },
  { id: 'posts-10', name: 'Influencer Tech', description: 'Criou 10 posts', emoji: '📱', category: 'social', xpReward: 100, condition: 'posts-10', isSecret: false },
  { id: 'likes-50', name: 'Popular', description: 'Recebeu 50 likes total', emoji: '❤️', category: 'social', xpReward: 100, condition: 'likes-50', isSecret: false },
  { id: 'shared-prompt-10', name: 'Prompt Sharer', description: 'Partilhou 10 prompts', emoji: '🎁', category: 'social', xpReward: 150, condition: 'shared-prompts-10', isSecret: false },
  { id: 'coop-first', name: 'Co-piloto', description: 'Completou primeira missão co-op', emoji: '👯', category: 'social', xpReward: 100, condition: 'first-coop', isSecret: false },

  // === Categoria: Projets ===
  { id: 'first-project', name: 'O Primeiro Projeto', description: 'Criou o primeiro projeto', emoji: '🚀', category: 'projetos', xpReward: 100, condition: 'first-project', isSecret: false },
  { id: 'projects-3', name: 'Portfolio Builder', description: 'Criou 3 projetos', emoji: '📂', category: 'projetos', xpReward: 250, condition: 'projects-3', isSecret: false },
  { id: 'project-deployed', name: 'Deployed!', description: 'Fez deploy do primeiro projeto', emoji: '🌐', category: 'projetos', xpReward: 300, condition: 'project-deployed', isSecret: false },

  // === Categoria: Nível ===
  { id: 'level-10', name: 'Vibe Coder Jr.', description: 'Chegou ao nível 10', emoji: '🎵', category: 'nivel', xpReward: 200, condition: 'reach-level-10', isSecret: false },
  { id: 'level-20', name: 'Vibe Coder', description: 'Chegou ao nível 20', emoji: '🎸', category: 'nivel', xpReward: 500, condition: 'reach-level-20', isSecret: false },
  { id: 'level-30', name: 'Vibe Master', description: 'Chegou ao nível 30', emoji: '🎹', category: 'nivel', xpReward: 1000, condition: 'reach-level-30', isSecret: false },
  { id: 'level-40', name: 'Vibe Legend', description: 'Chegou ao nível 40', emoji: '🎸', category: 'nivel', xpReward: 2000, condition: 'reach-level-40', isSecret: false },
  { id: 'level-50', name: 'The Founder', description: 'Chegou ao nível 50', emoji: '🌟', category: 'nivel', xpReward: 10000, condition: 'reach-level-50', isSecret: false },

  // === Secretas ===
  { id: 'secret-easter-egg', name: '???', description: 'Encontrou o easter egg escondido', emoji: '🥚', category: 'secreto', xpReward: 500, condition: 'easter-egg', isSecret: true },
  { id: 'secret-midnight', name: 'Coder Noturno', description: 'Completou uma missão à meia-noite', emoji: '🌙', category: 'secreto', xpReward: 100, condition: 'midnight-mission', isSecret: true },
]

// ═══════════════════════════════════════
// ISLANDS (4 ilhas com zonas)
// ═══════════════════════════════════════

export const ISLANDS: Island[] = [
  {
    id: 'basic',
    level: 'BASIC' as IslandLevel,
    name: 'Ilha Básica',
    subtitle: 'Do Zero ao Primeiro App',
    emoji: '🏝️',
    totalMissions: 30,
    bossFight: {
      name: 'Prompt Monster',
      description: 'Derrota o monstro usando apenas prompts',
      emoji: '👾',
      xpReward: 500,
    },
    zones: [
      {
        id: 'basic-z1',
        islandId: 'basic',
        name: 'Fundamentos',
        emoji: '🌱',
        description: 'Descobre o que é vibe coding e conhece o Vi',
        order: 1,
        miniProject: null,
        missions: [
          { id: 'm01', title: 'O que é Vibe Coding?', order: 1, estimatedMinutes: 8, xpReward: 25 },
          { id: 'm02', title: 'Conhece o Vi', order: 2, estimatedMinutes: 5, xpReward: 20 },
          { id: 'm03', title: 'O Teu Primeiro Prompt', order: 3, estimatedMinutes: 10, xpReward: 30 },
          { id: 'm04', title: 'Anatomia de um Prompt', order: 4, estimatedMinutes: 12, xpReward: 35 },
          { id: 'm05', title: 'Padrões de Prompt', order: 5, estimatedMinutes: 15, xpReward: 40 },
          { id: 'm06', title: 'Ferramentas IA', order: 6, estimatedMinutes: 10, xpReward: 30 },
          { id: 'm07', title: 'Setup Workspace', order: 7, estimatedMinutes: 15, xpReward: 40 },
          { id: 'm08', title: 'HTML & CSS Basics', order: 8, estimatedMinutes: 20, xpReward: 50 },
        ],
      },
      {
        id: 'basic-z2',
        islandId: 'basic',
        name: 'Primeiros Passos',
        emoji: '👣',
        description: 'Começa a construir com IA',
        order: 2,
        miniProject: { id: 'mp-landing', title: 'Landing Page', description: 'Cria a tua primeira landing page com IA', xpReward: 100 },
        missions: [
          { id: 'm09', title: 'JavaScript Intro', order: 1, estimatedMinutes: 20, xpReward: 50 },
          { id: 'm10', title: 'Build Landing Page', order: 2, estimatedMinutes: 25, xpReward: 60 },
          { id: 'm11', title: 'CSS Avançado com IA', order: 3, estimatedMinutes: 15, xpReward: 40 },
          { id: 'm12', title: 'Responsividade', order: 4, estimatedMinutes: 15, xpReward: 40 },
          { id: 'm13', title: 'Formulários', order: 5, estimatedMinutes: 20, xpReward: 50 },
          { id: 'm14', title: 'Debug com IA', order: 6, estimatedMinutes: 15, xpReward: 40 },
          { id: 'm15', title: 'Git Basics', order: 7, estimatedMinutes: 15, xpReward: 40 },
        ],
      },
      {
        id: 'basic-z3',
        islandId: 'basic',
        name: 'React Essentials',
        emoji: '⚛️',
        description: 'Entra no mundo React',
        order: 3,
        miniProject: { id: 'mp-todo', title: 'Todo App', description: 'Cria um Todo App completo com React', xpReward: 150 },
        missions: [
          { id: 'm16', title: 'O que é React?', order: 1, estimatedMinutes: 10, xpReward: 30 },
          { id: 'm17', title: 'Componentes', order: 2, estimatedMinutes: 15, xpReward: 40 },
          { id: 'm18', title: 'Props & State', order: 3, estimatedMinutes: 20, xpReward: 50 },
          { id: 'm19', title: 'Hooks Básicos', order: 4, estimatedMinutes: 20, xpReward: 50 },
          { id: 'm20', title: 'Listas & Loops', order: 5, estimatedMinutes: 15, xpReward: 40 },
          { id: 'm21', title: 'Eventos', order: 6, estimatedMinutes: 15, xpReward: 40 },
          { id: 'm22', title: 'Conditional Rendering', order: 7, estimatedMinutes: 15, xpReward: 40 },
          { id: 'm23', title: 'Styling React', order: 8, estimatedMinutes: 15, xpReward: 40 },
        ],
      },
      {
        id: 'basic-z4',
        islandId: 'basic',
        name: 'O Primeiro App',
        emoji: '🚀',
        description: 'Constrói e lança o teu primeiro app',
        order: 4,
        miniProject: { id: 'mp-portfolio', title: 'Portfolio Site', description: 'Cria o teu portfolio pessoal', xpReward: 200 },
        missions: [
          { id: 'm24', title: 'APIs & Fetch', order: 1, estimatedMinutes: 20, xpReward: 50 },
          { id: 'm25', title: 'JSON & Data', order: 2, estimatedMinutes: 15, xpReward: 40 },
          { id: 'm26', title: 'Routing', order: 3, estimatedMinutes: 15, xpReward: 40 },
          { id: 'm27', title: 'Deploy Basics', order: 4, estimatedMinutes: 20, xpReward: 50 },
          { id: 'm28', title: 'Performance', order: 5, estimatedMinutes: 15, xpReward: 40 },
          { id: 'm29', title: 'Revisão & Refactor', order: 6, estimatedMinutes: 20, xpReward: 50 },
          { id: 'm30', title: 'Boss Fight: Prompt Monster', order: 7, estimatedMinutes: 30, xpReward: 100 },
        ],
      },
    ],
  },
  {
    id: 'intermediate',
    level: 'INTERMEDIATE' as IslandLevel,
    name: 'Ilha Intermédia',
    subtitle: 'Full Stack com IA',
    emoji: '⛰️',
    totalMissions: 45,
    bossFight: {
      name: 'API Dragon',
      description: 'Constrói uma API completa em tempo limitado',
      emoji: '🐉',
      xpReward: 1000,
    },
    zones: [
      {
        id: 'inter-z1', islandId: 'intermediate', name: 'TypeScript', emoji: '📘',
        description: 'Domina TypeScript com IA', order: 1, miniProject: null,
        missions: [
          { id: 'm31', title: 'Tipos Básicos', order: 1, estimatedMinutes: 15, xpReward: 40 },
          { id: 'm32', title: 'Interfaces & Types', order: 2, estimatedMinutes: 15, xpReward: 40 },
          { id: 'm33', title: 'Generics', order: 3, estimatedMinutes: 20, xpReward: 50 },
          { id: 'm34', title: 'Enums & Unions', order: 4, estimatedMinutes: 15, xpReward: 40 },
          { id: 'm35', title: 'TypeScript + React', order: 5, estimatedMinutes: 20, xpReward: 50 },
          { id: 'm36', title: 'Utility Types', order: 6, estimatedMinutes: 15, xpReward: 40 },
          { id: 'm37', title: 'TS Config & Best Practices', order: 7, estimatedMinutes: 15, xpReward: 40 },
          { id: 'm38', title: 'Zod Validation', order: 8, estimatedMinutes: 15, xpReward: 40 },
          { id: 'm39', title: 'Type-safe APIs', order: 9, estimatedMinutes: 20, xpReward: 50 },
        ],
      },
      {
        id: 'inter-z2', islandId: 'intermediate', name: 'Backend & APIs', emoji: '🔌',
        description: 'Constrói APIs robustas', order: 2,
        miniProject: { id: 'mp-api', title: 'REST API', description: 'API completa com auth', xpReward: 250 },
        missions: [
          { id: 'm40', title: 'Node.js Intro', order: 1, estimatedMinutes: 15, xpReward: 40 },
          { id: 'm41', title: 'Express/Next API', order: 2, estimatedMinutes: 20, xpReward: 50 },
          { id: 'm42', title: 'CRUD Operations', order: 3, estimatedMinutes: 20, xpReward: 50 },
          { id: 'm43', title: 'Auth & JWT', order: 4, estimatedMinutes: 25, xpReward: 60 },
          { id: 'm44', title: 'Middleware', order: 5, estimatedMinutes: 15, xpReward: 40 },
          { id: 'm45', title: 'Error Handling', order: 6, estimatedMinutes: 15, xpReward: 40 },
          { id: 'm46', title: 'Rate Limiting', order: 7, estimatedMinutes: 15, xpReward: 40 },
          { id: 'm47', title: 'File Upload', order: 8, estimatedMinutes: 20, xpReward: 50 },
          { id: 'm48', title: 'API Testing', order: 9, estimatedMinutes: 15, xpReward: 40 },
        ],
      },
      {
        id: 'inter-z3', islandId: 'intermediate', name: 'Database', emoji: '🗄️',
        description: 'Domina bases de dados', order: 3,
        miniProject: { id: 'mp-blog', title: 'Blog Fullstack', description: 'Blog com DB, auth, CRUD', xpReward: 300 },
        missions: [
          { id: 'm49', title: 'SQL Basics', order: 1, estimatedMinutes: 15, xpReward: 40 },
          { id: 'm50', title: 'PostgreSQL', order: 2, estimatedMinutes: 15, xpReward: 40 },
          { id: 'm51', title: 'Prisma ORM', order: 3, estimatedMinutes: 20, xpReward: 50 },
          { id: 'm52', title: 'Schema Design', order: 4, estimatedMinutes: 20, xpReward: 50 },
          { id: 'm53', title: 'Queries Avançadas', order: 5, estimatedMinutes: 20, xpReward: 50 },
          { id: 'm54', title: 'Migrations', order: 6, estimatedMinutes: 15, xpReward: 40 },
          { id: 'm55', title: 'Seeding', order: 7, estimatedMinutes: 15, xpReward: 40 },
          { id: 'm56', title: 'Relations', order: 8, estimatedMinutes: 20, xpReward: 50 },
          { id: 'm57', title: 'Performance SQL', order: 9, estimatedMinutes: 15, xpReward: 40 },
        ],
      },
      {
        id: 'inter-z4', islandId: 'intermediate', name: 'State & Data', emoji: '📊',
        description: 'Gestão de estado pro', order: 4, miniProject: null,
        missions: [
          { id: 'm58', title: 'React Query', order: 1, estimatedMinutes: 20, xpReward: 50 },
          { id: 'm59', title: 'Zustand', order: 2, estimatedMinutes: 15, xpReward: 40 },
          { id: 'm60', title: 'Optimistic Updates', order: 3, estimatedMinutes: 20, xpReward: 50 },
          { id: 'm61', title: 'Caching', order: 4, estimatedMinutes: 15, xpReward: 40 },
          { id: 'm62', title: 'Offline First', order: 5, estimatedMinutes: 20, xpReward: 50 },
          { id: 'm63', title: 'Real-time Data', order: 6, estimatedMinutes: 20, xpReward: 50 },
          { id: 'm64', title: 'Data Patterns', order: 7, estimatedMinutes: 15, xpReward: 40 },
          { id: 'm65', title: 'Error Boundaries', order: 8, estimatedMinutes: 15, xpReward: 40 },
          { id: 'm66', title: 'Testing State', order: 9, estimatedMinutes: 15, xpReward: 40 },
        ],
      },
      {
        id: 'inter-z5', islandId: 'intermediate', name: 'Full Stack Project', emoji: '🏗️',
        description: 'Junta tudo num projeto real', order: 5,
        miniProject: { id: 'mp-saas-lite', title: 'SaaS Lite', description: 'Micro-SaaS básico', xpReward: 400 },
        missions: [
          { id: 'm67', title: 'Project Planning', order: 1, estimatedMinutes: 15, xpReward: 40 },
          { id: 'm68', title: 'Auth Integration', order: 2, estimatedMinutes: 25, xpReward: 60 },
          { id: 'm69', title: 'Dashboard UI', order: 3, estimatedMinutes: 25, xpReward: 60 },
          { id: 'm70', title: 'API Integration', order: 4, estimatedMinutes: 25, xpReward: 60 },
          { id: 'm71', title: 'Deploy & CI/CD', order: 5, estimatedMinutes: 20, xpReward: 50 },
          { id: 'm72', title: 'Monitoring', order: 6, estimatedMinutes: 15, xpReward: 40 },
          { id: 'm73', title: 'Code Review com IA', order: 7, estimatedMinutes: 15, xpReward: 40 },
          { id: 'm74', title: 'Refactoring', order: 8, estimatedMinutes: 20, xpReward: 50 },
          { id: 'm75', title: 'Boss Fight: API Dragon', order: 9, estimatedMinutes: 35, xpReward: 150 },
        ],
      },
    ],
  },
  {
    id: 'advanced',
    level: 'ADVANCED' as IslandLevel,
    name: 'Ilha Avançada',
    subtitle: 'Mobile + AI Integration',
    emoji: '🌋',
    totalMissions: 50,
    bossFight: {
      name: 'Deploy Titan',
      description: 'Deploy completo com CI/CD em tempo limitado',
      emoji: '🤖',
      xpReward: 2000,
    },
    zones: [
      {
        id: 'adv-z1', islandId: 'advanced', name: 'React Native', emoji: '📱',
        description: 'Entra no mundo mobile', order: 1, miniProject: null,
        missions: Array.from({ length: 8 }, (_, i) => ({
          id: `m${76 + i}`, title: `React Native ${i + 1}`, order: i + 1, estimatedMinutes: 20, xpReward: 50,
        })),
      },
      {
        id: 'adv-z2', islandId: 'advanced', name: 'Expo Deep Dive', emoji: '🎯',
        description: 'Expo SDK avançado', order: 2,
        miniProject: { id: 'mp-mobile-app', title: 'App Mobile', description: 'App mobile completo', xpReward: 400 },
        missions: Array.from({ length: 9 }, (_, i) => ({
          id: `m${84 + i}`, title: `Expo SDK ${i + 1}`, order: i + 1, estimatedMinutes: 20, xpReward: 50,
        })),
      },
      {
        id: 'adv-z3', islandId: 'advanced', name: 'AI Integration', emoji: '🤖',
        description: 'Integra IA nos teus apps', order: 3,
        miniProject: { id: 'mp-ai-app', title: 'AI-Powered App', description: 'App com IA integrada', xpReward: 500 },
        missions: Array.from({ length: 9 }, (_, i) => ({
          id: `m${93 + i}`, title: `AI Integration ${i + 1}`, order: i + 1, estimatedMinutes: 25, xpReward: 60,
        })),
      },
      {
        id: 'adv-z4', islandId: 'advanced', name: 'Payments', emoji: '💳',
        description: 'Monetiza o teu app', order: 4, miniProject: null,
        missions: Array.from({ length: 8 }, (_, i) => ({
          id: `m${102 + i}`, title: `Payments ${i + 1}`, order: i + 1, estimatedMinutes: 20, xpReward: 50,
        })),
      },
      {
        id: 'adv-z5', islandId: 'advanced', name: 'Testing & QA', emoji: '🧪',
        description: 'Testa como um profissional', order: 5, miniProject: null,
        missions: Array.from({ length: 8 }, (_, i) => ({
          id: `m${110 + i}`, title: `Testing ${i + 1}`, order: i + 1, estimatedMinutes: 20, xpReward: 50,
        })),
      },
      {
        id: 'adv-z6', islandId: 'advanced', name: 'Ship It', emoji: '🚢',
        description: 'Deploy e launch', order: 6,
        miniProject: { id: 'mp-launch', title: 'Product Launch', description: 'Lança o teu produto', xpReward: 600 },
        missions: Array.from({ length: 8 }, (_, i) => ({
          id: `m${118 + i}`, title: `Shipping ${i + 1}`, order: i + 1, estimatedMinutes: 25, xpReward: 60,
        })),
      },
    ],
  },
  {
    id: 'expert',
    level: 'EXPERT' as IslandLevel,
    name: 'Ilha Expert',
    subtitle: 'SaaS Builder',
    emoji: '🏔️',
    totalMissions: 35,
    bossFight: {
      name: 'The Architect',
      description: 'Desenha a arquitectura de um SaaS completo',
      emoji: '👑',
      xpReward: 5000,
    },
    zones: [
      {
        id: 'exp-z1', islandId: 'expert', name: 'Architecture', emoji: '🏛️',
        description: 'Design de sistemas', order: 1, miniProject: null,
        missions: Array.from({ length: 7 }, (_, i) => ({
          id: `m${126 + i}`, title: `Architecture ${i + 1}`, order: i + 1, estimatedMinutes: 25, xpReward: 60,
        })),
      },
      {
        id: 'exp-z2', islandId: 'expert', name: 'Scale', emoji: '📈',
        description: 'Escala o teu produto', order: 2, miniProject: null,
        missions: Array.from({ length: 7 }, (_, i) => ({
          id: `m${133 + i}`, title: `Scaling ${i + 1}`, order: i + 1, estimatedMinutes: 25, xpReward: 60,
        })),
      },
      {
        id: 'exp-z3', islandId: 'expert', name: 'Business', emoji: '💼',
        description: 'Lado business do SaaS', order: 3,
        miniProject: { id: 'mp-saas', title: 'Full SaaS', description: 'SaaS completo production-ready', xpReward: 1000 },
        missions: Array.from({ length: 7 }, (_, i) => ({
          id: `m${140 + i}`, title: `Business ${i + 1}`, order: i + 1, estimatedMinutes: 25, xpReward: 60,
        })),
      },
      {
        id: 'exp-z4', islandId: 'expert', name: 'Advanced AI', emoji: '🧠',
        description: 'IA avançada nos teus produtos', order: 4, miniProject: null,
        missions: Array.from({ length: 7 }, (_, i) => ({
          id: `m${147 + i}`, title: `Advanced AI ${i + 1}`, order: i + 1, estimatedMinutes: 30, xpReward: 70,
        })),
      },
      {
        id: 'exp-z5', islandId: 'expert', name: 'The Final Build', emoji: '🌟',
        description: 'O projeto final', order: 5,
        miniProject: { id: 'mp-capstone', title: 'Capstone Project', description: 'O teu grande projeto final', xpReward: 2000 },
        missions: Array.from({ length: 7 }, (_, i) => ({
          id: `m${154 + i}`, title: `Final Build ${i + 1}`, order: i + 1, estimatedMinutes: 30, xpReward: 70,
        })),
      },
    ],
  },
]

// ═══════════════════════════════════════
// APP CONFIG
// ═══════════════════════════════════════

export const APP_CONFIG = {
  name: 'VibeCode',
  tagline: 'Code the future. Ride the vibe.',
  maxFreeViMessages: 5,
  maxFreeProjects: 1,
  defaultStreakFreezes: 2,
  proStreakFreezes: 5,
  dailyChallengeXp: 50,
  coopXpBonus: 1.5,
  speedRunMaxMinutes: 15,
  supportEmail: 'support@vibecode.app',
  websiteUrl: 'https://vibecode.app',
  privacyUrl: 'https://vibecode.app/privacy',
  termsUrl: 'https://vibecode.app/terms',
} as const
