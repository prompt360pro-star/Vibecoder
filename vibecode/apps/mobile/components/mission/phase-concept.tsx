import { View, StyleSheet, ScrollView } from 'react-native'
import Text from '../ui/text'
import Button from '../ui/button'
import { COLORS } from '@vibecode/shared'

export interface PhaseConceptProps {
  content: {
    title: string
    explanation: string
    keyPoints: string[]
    tip?: string
  }
  onContinue: () => void
}

export default function PhaseConcept({ content, onContinue }: PhaseConceptProps) {
  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <Text variant="h2" style={styles.title}>{content.title}</Text>
        
        <Text style={styles.explanation}>{content.explanation}</Text>

        <View style={styles.keyPointsContainer}>
          {content.keyPoints?.map((point, index) => (
            <View key={index} style={styles.keyPointRow}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.keyPointText}>{point}</Text>
            </View>
          ))}
        </View>

        {content.tip && (
          <View style={styles.tipCard}>
            <Text style={styles.tipIcon}>💡</Text>
            <Text style={styles.tipText}>{content.tip}</Text>
          </View>
        )}
      </ScrollView>

      {/* Botão Fixo no fundo */}
      <View style={styles.footer}>
        <Button
          title="CONTINUAR"
          onPress={onContinue}
          variant="primary"
          size="xl"
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgPrimary,
  },
  scroll: {
    paddingBottom: 40,
  },
  title: {
    marginBottom: 16,
    color: '#FFF',
  },
  explanation: {
    color: COLORS.textSecondary,
    fontSize: 16,
    lineHeight: 26,
    marginBottom: 24,
  },
  keyPointsContainer: {
    gap: 12,
    marginBottom: 32,
  },
  keyPointRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  bullet: {
    color: COLORS.accentPurple,
    fontSize: 20,
    lineHeight: 24,
    fontWeight: '900',
  },
  keyPointText: {
    flex: 1,
    color: COLORS.textPrimary,
    fontSize: 15,
    lineHeight: 24,
  },
  tipCard: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 24,
  },
  tipIcon: {
    fontSize: 24,
  },
  tipText: {
    flex: 1,
    color: '#FFF',
    fontSize: 14,
    lineHeight: 22,
  },
  footer: {
    paddingTop: 16,
  },
})
