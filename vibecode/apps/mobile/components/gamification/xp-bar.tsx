import { View, StyleSheet, type ViewStyle } from 'react-native'
import Text from '../ui/text'
import ProgressBar from '../ui/progress-bar'
import { COLORS, getLevelForXp, getLevelProgress, getXpForNextLevel } from '@vibecode/shared'

interface XpBarProps {
  currentXp: number
  style?: ViewStyle
}

export default function XpBar({ currentXp, style }: XpBarProps) {
  const levelConfig = getLevelForXp(currentXp)
  const progress = getLevelProgress(currentXp)
  const xpNeeded = getXpForNextLevel(currentXp)

  return (
    <View style={[styles.container, style]}>
      <View style={styles.header}>
        <Text style={styles.levelText}>Nível {levelConfig.level}</Text>
        <Text style={styles.titleText}>{levelConfig.title}</Text>
      </View>

      <ProgressBar 
        progress={progress} 
        variant="gradient" 
        height={8}
        style={styles.progressBar}
      />

      <View style={styles.footer}>
        <Text style={styles.xpText}>
          {currentXp} / {currentXp + xpNeeded} XP
        </Text>
        <Text style={styles.remainingText}>
          Faltam {xpNeeded} XP
        </Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.bgCard,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  levelText: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  titleText: {
    color: COLORS.textTertiary,
    fontSize: 13,
    fontWeight: '500',
  },
  progressBar: {
    marginVertical: 4,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  xpText: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
  remainingText: {
    color: COLORS.accentPurple,
    fontSize: 12,
    fontWeight: '600',
  },
})
