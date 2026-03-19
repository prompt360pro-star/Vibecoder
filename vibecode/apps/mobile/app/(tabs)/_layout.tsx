import { useEffect, type ComponentProps } from 'react'
import { StyleSheet, View } from 'react-native'
import { Tabs } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated'
import { MOTION } from '../../lib/animations'

type IoniconsName = ComponentProps<typeof Ionicons>['name']

interface TabIconProps {
  name: IoniconsName
  color: string
  focused: boolean
  size?: number
}

function TabIcon({ name, color, focused, size = 26 }: TabIconProps) {
  const scale = useSharedValue(1)
  const translateY = useSharedValue(0)
  const glowOpacity = useSharedValue(0)

  useEffect(() => {
    let idleTimer: ReturnType<typeof setTimeout> | undefined

    if (focused) {
      scale.value = withSequence(
        withSpring(1.35, MOTION.spring.bouncy),
        withSpring(1.1, MOTION.spring.gentle),
      )
      translateY.value = withSequence(
        withSpring(-7, MOTION.spring.bouncy),
        withSpring(-2, MOTION.spring.gentle),
      )
      glowOpacity.value = withTiming(1, { duration: 250 })

      idleTimer = setTimeout(() => {
        scale.value = withRepeat(
          withSequence(
            withTiming(1.12, { duration: 900, easing: MOTION.easing.smooth }),
            withTiming(1.08, { duration: 900, easing: MOTION.easing.smooth }),
          ),
          -1,
          true,
        )
      }, 450)
    } else {
      scale.value = withSpring(1, MOTION.spring.gentle)
      translateY.value = withSpring(0, MOTION.spring.gentle)
      glowOpacity.value = withTiming(0, { duration: 200 })
    }

    return () => {
      if (idleTimer) clearTimeout(idleTimer)
    }
  }, [focused, glowOpacity, scale, translateY])

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { translateY: translateY.value }],
  }))

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }))

  return (
    <View style={styles.tabIconContainer}>
      <Animated.View style={[styles.tabGlow, glowStyle]} />
      <Animated.View style={iconStyle}>
        <Ionicons name={name} size={size} color={color} />
      </Animated.View>
    </View>
  )
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: '#8B5CF6',
        tabBarInactiveTintColor: 'rgba(255,255,255,0.35)',
        tabBarLabelStyle: styles.tabBarLabel,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              name={focused ? 'home' : 'home-outline'}
              color={color}
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="trail"
        options={{
          title: 'Trilha',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              name={focused ? 'map' : 'map-outline'}
              color={color}
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="vi"
        options={{
          title: 'Vi',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              name={focused ? 'chatbubble-ellipses' : 'chatbubble-ellipses-outline'}
              color={color}
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="social"
        options={{
          title: 'Social',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              name={focused ? 'people' : 'people-outline'}
              color={color}
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              name={focused ? 'person-circle' : 'person-circle-outline'}
              color={color}
              focused={focused}
            />
          ),
        }}
      />
    </Tabs>
  )
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#0E0E16',
    borderTopWidth: 0,
    height: 64,
    paddingBottom: 10,
    paddingTop: 6,
    elevation: 0,
    shadowOpacity: 0,
  },
  tabBarLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  tabIconContainer: {
    alignItems: 'center',
    width: 44,
    height: 36,
    justifyContent: 'center',
  },
  tabGlow: {
    position: 'absolute',
    bottom: -4,
    width: 28,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#8B5CF6',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 6,
  },
})
