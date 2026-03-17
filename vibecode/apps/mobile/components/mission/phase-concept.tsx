import { useState } from 'react'
import { View, StyleSheet, ScrollView, Pressable } from 'react-native'
import Text from '../ui/text'
import Button from '../ui/button'
import { COLORS } from '@vibecode/shared'
import type { ConceptContent, ConceptSection } from '@vibecode/shared'

interface PhaseConceptProps {
  content: ConceptContent
  onContinue: () => void
}

export default function PhaseConcept({ content, onContinue }: PhaseConceptProps) {
  const [expandedCard, setExpandedCard] = useState<number | null>(null)

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {content.sections.map((section, i) => (
          <View key={i} style={styles.section}>
            <SectionRenderer
              section={section}
              expandedCard={expandedCard}
              setExpandedCard={setExpandedCard}
            />
          </View>
        ))}

        <Button
          title="ENTENDI"
          onPress={onContinue}
          variant="primary"
          size="lg"
          style={styles.btn}
        />
      </ScrollView>
    </View>
  )
}

function SectionRenderer({
  section,
  expandedCard,
  setExpandedCard,
}: {
  section: ConceptSection
  expandedCard: number | null
  setExpandedCard: (i: number | null) => void
}) {
  if (section.type === 'text') {
    return <Text style={styles.textSection}>{section.text}</Text>
  }

  if (section.type === 'quote') {
    return (
      <View style={styles.quoteBlock}>
        <Text style={styles.quoteMark}>"</Text>
        <Text style={styles.quoteText}>{section.text}</Text>
        <Text style={styles.quoteAuthor}>
          — {section.author}, {section.date}
        </Text>
      </View>
    )
  }

  if (section.type === 'comparison') {
    return (
      <View style={styles.comparison}>
        <View style={styles.compCol}>
          <Text style={[styles.compTitle, { color: COLORS.accentRed }]}>{section.leftTitle}</Text>
          {section.leftItems.map((item, i) => (
            <View key={i} style={styles.compItem}>
              <Text style={styles.compBullet}>✗</Text>
              <Text style={styles.compItemText}>{item}</Text>
            </View>
          ))}
        </View>
        <View style={styles.compDivider} />
        <View style={styles.compCol}>
          <Text style={[styles.compTitle, { color: COLORS.accentGreen }]}>{section.rightTitle}</Text>
          {section.rightItems.map((item, i) => (
            <View key={i} style={styles.compItem}>
              <Text style={styles.compBullet}>✓</Text>
              <Text style={styles.compItemText}>{item}</Text>
            </View>
          ))}
        </View>
      </View>
    )
  }

  if (section.type === 'cards') {
    return (
      <View style={styles.cardsGrid}>
        {section.items.map((card, ci) => (
          <Pressable
            key={ci}
            onPress={() => setExpandedCard(expandedCard === ci ? null : ci)}
            style={({ pressed }) => [
              styles.card,
              expandedCard === ci && styles.cardExpanded,
              pressed && styles.cardPressed,
            ]}
          >
            <Text style={styles.cardEmoji}>{card.emoji}</Text>
            <Text style={styles.cardTitle}>{card.title}</Text>
            {expandedCard === ci && (
              <Text style={styles.cardDesc}>{card.description}</Text>
            )}
          </Pressable>
        ))}
      </View>
    )
  }

  return null
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { gap: 24, paddingBottom: 16 },
  section: {},
  btn: { marginTop: 8 },
  textSection: {
    color: COLORS.textSecondary,
    fontSize: 15,
    lineHeight: 24,
  },
  quoteBlock: {
    backgroundColor: 'rgba(139,92,246,0.06)',
    borderLeftWidth: 4,
    borderLeftColor: COLORS.accentPurple,
    borderRadius: 12,
    padding: 20,
    gap: 8,
  },
  quoteMark: { fontSize: 40, color: COLORS.accentPurple, height: 30, lineHeight: 40 },
  quoteText: { color: COLORS.textPrimary, fontSize: 16, lineHeight: 24, fontStyle: 'italic' },
  quoteAuthor: { color: COLORS.textMuted, fontSize: 13, marginTop: 4 },
  comparison: {
    flexDirection: 'row',
    backgroundColor: COLORS.bgCard,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
  },
  compCol: { flex: 1, padding: 16, gap: 10 },
  compTitle: { fontSize: 13, fontWeight: '800', marginBottom: 4 },
  compDivider: { width: 1, backgroundColor: COLORS.borderSubtle },
  compItem: { flexDirection: 'row', gap: 8, alignItems: 'flex-start' },
  compBullet: { fontSize: 14, color: COLORS.textMuted, width: 14 },
  compItemText: { flex: 1, color: COLORS.textSecondary, fontSize: 13, lineHeight: 18 },
  cardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  card: {
    width: '47%',
    backgroundColor: COLORS.bgCard,
    borderRadius: 14,
    padding: 16,
    gap: 6,
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
    alignItems: 'center',
  },
  cardExpanded: {
    width: '100%',
    borderColor: COLORS.accentPurple,
    backgroundColor: 'rgba(139,92,246,0.06)',
  },
  cardPressed: { opacity: 0.8 },
  cardEmoji: { fontSize: 28 },
  cardTitle: { color: COLORS.textPrimary, fontSize: 13, fontWeight: '700', textAlign: 'center' },
  cardDesc: { color: COLORS.textSecondary, fontSize: 12, lineHeight: 18, textAlign: 'center', marginTop: 4 },
})
