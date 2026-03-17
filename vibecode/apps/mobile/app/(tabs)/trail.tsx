import { View, StyleSheet } from 'react-native'
import Text from '../../components/ui/text'
import { COLORS } from '@vibecode/shared'

export default function TrailScreen() {
  return (
    <View style={styles.container}>
      <Text variant="h2">Trilha</Text>
      <Text variant="body" style={styles.subtitle}>Em breve...</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgPrimary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  subtitle: {
    color: COLORS.textTertiary,
    marginTop: 8,
  },
})
