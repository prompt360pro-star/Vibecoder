import { View, StyleSheet } from 'react-native'
import type { InteractionContent } from '@vibecode/shared'
import QuizMultipleChoice from '../exercises/quiz-multiple-choice'
import TrueFalse from '../exercises/true-false'
import DragDrop from '../exercises/drag-drop'
import Classify from '../exercises/classify'

interface PhaseInteractionProps {
  content: InteractionContent
  onComplete: (score: number) => void
}

export default function PhaseInteraction({ content, onComplete }: PhaseInteractionProps) {
  switch (content.exerciseType) {
    case 'quiz':
      return (
        <QuizMultipleChoice
          question={content.question ?? ''}
          options={content.options ?? []}
          correctIndex={content.correctIndex ?? 0}
          explanation={content.explanation ?? ''}
          onComplete={onComplete}
        />
      )

    case 'true_false':
      return (
        <TrueFalse
          instruction={content.instruction}
          statements={content.statements ?? []}
          onComplete={onComplete}
        />
      )

    case 'drag_drop':
      return (
        <DragDrop
          instruction={content.instruction}
          items={content.items ?? []}
          correctOrder={content.correctOrder ?? []}
          onComplete={onComplete}
        />
      )

    case 'classify':
      return (
        <Classify
          instruction={content.instruction ?? ''}
          categories={content.categories ?? []}
          classifyItems={content.classifyItems ?? []}
          onComplete={onComplete}
        />
      )

    default:
      return <View style={styles.empty} />
  }
}

const styles = StyleSheet.create({
  empty: { flex: 1 },
})
