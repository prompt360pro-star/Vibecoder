// Welcome — 3 telas horizontais swipáveis
import { useRef, useState, useCallback } from 'react'
import {
  View,
  Text,
  FlatList,
  useWindowDimensions,
  StyleSheet,
  type NativeSyntheticEvent,
  type NativeScrollEvent,
  type ListRenderItemInfo,
} from 'react-native'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import Button from '../../components/ui/button'

interface WelcomePage {
  id: string
  emoji: string
  title: string
  subtitle: string
  showButton: boolean
}

const PAGES: WelcomePage[] = [
  {
    id: '1',
    emoji: '💬🤖',
    title: 'Fale o que quer.\nA IA constrói.',
    subtitle: 'Vibe coding é programar usando inteligência artificial como seu superpoder.',
    showButton: false,
  },
  {
    id: '2',
    emoji: '🤖✨',
    title: 'Conheça o Vi.\nSeu mentor pessoal.',
    subtitle: 'Ele aprende com você, se adapta ao seu ritmo e nunca perde a paciência.',
    showButton: false,
  },
  {
    id: '3',
    emoji: '🗺️🏝️',
    title: 'Sua jornada.\nSeus projetos reais.',
    subtitle: 'Cada nível = apps reais no seu portfolio. Cada conquista = skills que o mercado paga.',
    showButton: true,
  },
]

export default function WelcomeScreen() {
  const { width } = useWindowDimensions()
  const router = useRouter()
  const [activeIndex, setActiveIndex] = useState(0)
  const flatListRef = useRef<FlatList<WelcomePage>>(null)

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const offsetX = event.nativeEvent.contentOffset.x
      const index = Math.round(offsetX / width)
      setActiveIndex(index)
    },
    [width],
  )

  const handleStartDNA = useCallback(() => {
    router.push('/(onboarding)/dna-test')
  }, [router])

  const renderPage = useCallback(
    ({ item }: ListRenderItemInfo<WelcomePage>) => (
      <View style={[styles.page, { width }]}>
        <View style={styles.content}>
          <Text style={styles.emoji}>{item.emoji}</Text>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.subtitle}>{item.subtitle}</Text>
        </View>

        {item.showButton ? (
          <View style={styles.buttonContainer}>
            <Button
              title="DESCOBRIR MEU DNA"
              onPress={handleStartDNA}
              variant="primary"
              size="xl"
            />
          </View>
        ) : null}
      </View>
    ),
    [width, handleStartDNA],
  )

  const keyExtractor = useCallback((item: WelcomePage) => item.id, [])

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={PAGES}
        renderItem={renderPage}
        keyExtractor={keyExtractor}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        bounces={false}
      />

      {/* Dots indicator */}
      <View style={styles.dots}>
        {PAGES.map((page, index) => (
          <View
            key={page.id}
            style={[
              styles.dot,
              index === activeIndex ? styles.dotActive : styles.dotInactive,
            ]}
          />
        ))}
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0F',
  },
  page: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  content: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 72,
    marginBottom: 32,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 32,
    marginBottom: 16,
  },
  subtitle: {
    color: '#CCCCCC',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 16,
  },
  buttonContainer: {
    paddingHorizontal: 8,
    paddingBottom: 24,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 40,
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotActive: {
    backgroundColor: '#8B5CF6',
    width: 24,
  },
  dotInactive: {
    backgroundColor: '#333333',
  },
})
