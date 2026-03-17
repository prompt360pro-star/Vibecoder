import { View, StyleSheet } from 'react-native'
import type { SandboxContent } from '@vibecode/shared'
import SandboxPrompt from '../exercises/sandbox-prompt'

interface PhaseSandboxProps {
  content: SandboxContent
  onComplete: (score: number) => void
}

export default function PhaseSandbox({ content, onComplete }: PhaseSandboxProps) {
  return (
    <View style={styles.container}>
      <SandboxPrompt
        instruction={content.instruction}
        placeholder={content.placeholder}
        hint={content.hint}
        onComplete={onComplete}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
})
