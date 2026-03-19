import { StyleSheet, View, type DimensionValue, type StyleProp, type ViewStyle } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import Animated from 'react-native-reanimated'
import { useShimmer } from '../../lib/animations'

interface SkeletonProps {
  width?: DimensionValue
  height?: number
  borderRadius?: number
  style?: StyleProp<ViewStyle>
}

export function Skeleton({
  width = '100%',
  height = 16,
  borderRadius = 8,
  style,
}: SkeletonProps) {
  const shimmerStyle = useShimmer(400)

  return (
    <View
      style={[
        styles.base,
        {
          width,
          height,
          borderRadius,
        },
        style,
      ]}
    >
      <Animated.View style={[styles.shimmer, shimmerStyle]}>
        <LinearGradient
          colors={['transparent', 'rgba(255,255,255,0.09)', 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.shimmerGradient}
        />
      </Animated.View>
    </View>
  )
}

interface SectionSkeletonProps {
  style?: StyleProp<ViewStyle>
}

export function SkeletonCard({ style }: SectionSkeletonProps) {
  return (
    <View style={[styles.card, style]}>
      <View style={styles.cardHeader}>
        <Skeleton width={44} height={44} borderRadius={22} />
        <View style={styles.cardHeaderText}>
          <Skeleton width="60%" height={14} borderRadius={4} />
          <Skeleton width="40%" height={11} borderRadius={4} />
        </View>
      </View>
      <Skeleton width="100%" height={12} borderRadius={4} />
      <Skeleton width="80%" height={12} borderRadius={4} />
    </View>
  )
}

export function SkeletonProfile() {
  return (
    <View style={styles.profile}>
      <Skeleton width={88} height={88} borderRadius={44} />
      <Skeleton width={160} height={20} borderRadius={6} />
      <Skeleton width={110} height={14} borderRadius={4} />
      <View style={styles.profileStats}>
        <Skeleton width={96} height={76} borderRadius={14} />
        <Skeleton width={96} height={76} borderRadius={14} />
        <Skeleton width={96} height={76} borderRadius={14} />
      </View>
      <Skeleton width="100%" height={10} borderRadius={5} />
      <Skeleton width="100%" height={96} borderRadius={16} />
      <Skeleton width="100%" height={96} borderRadius={16} />
    </View>
  )
}

export function SkeletonMissionList() {
  return (
    <View style={styles.missionList}>
      {Array.from({ length: 5 }, (_, index) => (
        <Skeleton key={index} width="100%" height={72} borderRadius={14} />
      ))}
    </View>
  )
}

export default Skeleton

const styles = StyleSheet.create({
  base: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    overflow: 'hidden',
  },
  shimmer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 120,
  },
  shimmerGradient: {
    flex: 1,
  },
  card: {
    padding: 16,
    gap: 12,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  cardHeaderText: {
    flex: 1,
    gap: 6,
  },
  profile: {
    alignItems: 'center',
    padding: 24,
    gap: 14,
  },
  profileStats: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  missionList: {
    gap: 10,
    padding: 16,
  },
})
