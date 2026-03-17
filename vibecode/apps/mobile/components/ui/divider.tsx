// Divider — Linha divisória com texto opcional
import { View, Text, StyleSheet, type ViewStyle, type StyleProp } from 'react-native'

interface DividerProps {
  text?: string
  style?: StyleProp<ViewStyle>
}

export default function Divider({ text, style }: DividerProps) {
  if (!text) {
    return <View style={[styles.line, style]} />
  }

  return (
    <View style={[styles.container, style]}>
      <View style={styles.line} />
      <Text style={styles.text}>{text}</Text>
      <View style={styles.line} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#222222',
  },
  text: {
    color: '#888888',
    fontSize: 13,
    marginHorizontal: 16,
  },
})
