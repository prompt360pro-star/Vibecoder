# VibeCode — Constantes do Sistema

## Localização
packages/shared/constants/index.ts

## LEVELS (50+ níveis)
Array de objetos { level, xpRequired, title, viForm }
Função: getLevelForXp(xp) → retorna nível atual
Função: getXpForNextLevel(xp) → retorna XP restante

## STREAK_BONUSES
Array: 3d/50XP, 7d/200XP, 14d/300XP, 30d/1000XP, 60d/2000XP, 100d/5000XP, 365d/20000XP

## ACHIEVEMENTS
Objeto com todas as 45 conquistas, cada uma com: id, name, description, emoji, category, xpReward, condition, isSecret

## ISLANDS
Array de 4 ilhas com zonas:
- basic: 4 zonas, 30 missões
- intermediate: 5 zonas, 45 missões
- advanced: 6 zonas, 50 missões
- expert: 5 zonas, 35 missões

## APP_CONFIG
name, tagline, maxFreeViMessages (5), maxFreeProjects (1), defaultStreakFreezes (2), proStreakFreezes (5), dailyChallengeXp, coopXpBonus (1.5), speedRunMaxMinutes (15)

## COLORS
Todos os tokens de cor do design system (30+ cores)
