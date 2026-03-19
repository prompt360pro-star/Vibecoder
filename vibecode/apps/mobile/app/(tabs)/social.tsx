import { useRef, useState } from 'react'
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import { LinearGradient } from 'expo-linear-gradient'
import Animated from 'react-native-reanimated'
import { COLORS } from '@vibecode/shared'
import GradientBackground from '../../components/ui/gradient-background'
import { Podium } from '../../components/social/podium'
import { PostCard } from '../../components/social/post-card'
import { RankingItem } from '../../components/social/ranking-item'
import Text from '../../components/ui/text'
import { usePulse, useStaggerIn } from '../../lib/animations'
import { type SocialPostType, useFeed, useRanking } from '../../hooks/use-social'
import { useUser } from '../../hooks/use-user'

type SocialTab = 'feed' | 'ranking'
type RankingPeriod = 'week' | 'month' | 'alltime'

const FEED_FILTERS = [
  { id: undefined, label: 'Todos', emoji: '🌐' },
  { id: 'ACHIEVEMENT', label: 'Conquistas', emoji: '🎉' },
  { id: 'PROMPT', label: 'Prompts', emoji: '💡' },
  { id: 'HELP', label: 'Ajuda', emoji: '🆘' },
  { id: 'GENERAL', label: 'Geral', emoji: '💬' },
] as const

function FeedPostItem({ item, index }: { item: SocialPostType; index: number }) {
  const animatedStyle = useStaggerIn(index, 70)

  if (index >= 5) {
    return <PostCard post={item} />
  }

  return (
    <Animated.View style={animatedStyle}>
      <PostCard post={item} />
    </Animated.View>
  )
}

export default function SocialScreen() {
  const [activeTab, setActiveTab] = useState<SocialTab>('feed')
  const [rankingPeriod, setRankingPeriod] = useState<RankingPeriod>('week')
  const [feedFilter, setFeedFilter] = useState<string | undefined>(undefined)
  const flatListRef = useRef<FlatList<SocialPostType>>(null)
  const { user } = useUser()
  const fabPulseStyle = usePulse(0.96, 1.04, 1600)

  const feedQuery = useFeed(feedFilter)
  const posts = feedQuery.data?.pages.flatMap((page) => page.data) ?? []

  const rankingQuery = useRanking(rankingPeriod)
  const rankingItems = rankingQuery.data?.rankings ?? []
  const myPosition = rankingQuery.data?.myPosition ?? -1
  const top3 = rankingItems.filter((entry) => entry.position <= 3)
  const listItems = rankingItems.filter((entry) => entry.position > 3)

  const handleTabPress = (tab: SocialTab) => {
    if (activeTab === tab) return
    Haptics.selectionAsync()
    setActiveTab(tab)
  }

  const handlePeriodPress = (period: RankingPeriod) => {
    if (rankingPeriod === period) return
    Haptics.selectionAsync()
    setRankingPeriod(period)
  }

  const handleFilterPress = (filter: string | undefined) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    setFeedFilter(filter)
    flatListRef.current?.scrollToOffset({ offset: 0, animated: true })
  }

  const renderFeedHeader = () => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.feedFilters}
    >
      {FEED_FILTERS.map((filter) => {
        const active = feedFilter === filter.id

        return (
          <Pressable
            key={filter.label}
            onPress={() => handleFilterPress(filter.id)}
            style={[styles.feedChip, active && styles.feedChipActive]}
          >
            <Text style={[styles.feedChipText, active && styles.feedChipTextActive]}>
              {filter.emoji} {filter.label}
            </Text>
          </Pressable>
        )
      })}
    </ScrollView>
  )

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <GradientBackground variant="social" />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>COMUNIDADE</Text>
        <Pressable style={styles.headerIcon}>
          <Ionicons name="notifications-outline" size={24} color={COLORS.textPrimary} />
        </Pressable>
      </View>

      <View style={styles.tabsContainer}>
        <Pressable
          style={[styles.tab, activeTab === 'feed' && styles.tabActive]}
          onPress={() => handleTabPress('feed')}
        >
          <Text style={[styles.tabText, activeTab === 'feed' && styles.tabTextActive]}>Feed</Text>
        </Pressable>
        <Pressable
          style={[styles.tab, activeTab === 'ranking' && styles.tabActive]}
          onPress={() => handleTabPress('ranking')}
        >
          <Text style={[styles.tabText, activeTab === 'ranking' && styles.tabTextActive]}>Ranking</Text>
        </Pressable>
        <Pressable style={styles.tab} disabled>
          <Text style={[styles.tabText, styles.disabledTabText]}>Equipas</Text>
        </Pressable>
        <Pressable style={styles.tab} disabled>
          <Text style={[styles.tabText, styles.disabledTabText]}>Prompts</Text>
        </Pressable>
      </View>

      {activeTab === 'feed' ? (
        <View style={styles.feedWrapper}>
          <FlatList
            ref={flatListRef}
            data={posts}
            keyExtractor={(item) => item.id}
            renderItem={({ item, index }) => <FeedPostItem item={item} index={index} />}
            contentContainerStyle={styles.feedContent}
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={renderFeedHeader}
            refreshControl={
              <RefreshControl
                refreshing={feedQuery.isFetching && !feedQuery.isFetchingNextPage}
                onRefresh={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                  feedQuery.refetch()
                }}
                tintColor={COLORS.accentPurple}
              />
            }
            onEndReached={() => {
              if (feedQuery.hasNextPage && !feedQuery.isFetchingNextPage) {
                feedQuery.fetchNextPage()
              }
            }}
            onEndReachedThreshold={0.5}
            ListFooterComponent={
              feedQuery.isFetchingNextPage ? (
                <View style={styles.loadingFooter}>
                  <ActivityIndicator color={COLORS.accentPurple} />
                </View>
              ) : null
            }
            ListEmptyComponent={
              feedQuery.isLoading ? (
                <View style={styles.loadingFooter}>
                  <ActivityIndicator color={COLORS.accentPurple} />
                </View>
              ) : (
                <View style={styles.emptyFeed}>
                  <Text style={styles.emptyFeedEmoji}>🛸</Text>
                  <Text style={styles.emptyFeedTitle}>Ainda não há posts</Text>
                  <Text style={styles.emptyFeedText}>
                    Sê o primeiro a partilhar algo com a comunidade!
                  </Text>
                  <Pressable
                    style={styles.emptyFeedButton}
                    onPress={() => router.push('/social/new-post')}
                  >
                    <Text style={styles.emptyFeedButtonText}>✍️ Criar primeiro post</Text>
                  </Pressable>
                </View>
              )
            }
          />

          <Animated.View style={[styles.fab, fabPulseStyle]}>
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
                router.push('/social/new-post')
              }}
            >
              <LinearGradient colors={[COLORS.accentPurple, COLORS.accentBlue]} style={styles.fabGradient}>
                <Text style={styles.fabIcon}>✍️</Text>
              </LinearGradient>
            </Pressable>
          </Animated.View>
        </View>
      ) : (
        <View style={styles.rankingWrapper}>
          <View style={styles.periodTabs}>
            <Pressable
              style={[styles.periodTab, rankingPeriod === 'week' && styles.periodTabActive]}
              onPress={() => handlePeriodPress('week')}
            >
              <Text style={[styles.periodTabText, rankingPeriod === 'week' && styles.periodTabTextActive]}>
                Semana
              </Text>
            </Pressable>
            <Pressable
              style={[styles.periodTab, rankingPeriod === 'month' && styles.periodTabActive]}
              onPress={() => handlePeriodPress('month')}
            >
              <Text style={[styles.periodTabText, rankingPeriod === 'month' && styles.periodTabTextActive]}>
                Mês
              </Text>
            </Pressable>
            <Pressable
              style={[styles.periodTab, rankingPeriod === 'alltime' && styles.periodTabActive]}
              onPress={() => handlePeriodPress('alltime')}
            >
              <Text style={[styles.periodTabText, rankingPeriod === 'alltime' && styles.periodTabTextActive]}>
                All Time
              </Text>
            </Pressable>
          </View>

          {rankingQuery.isLoading ? (
            <View style={styles.loadingFooter}>
              <ActivityIndicator color={COLORS.accentPurple} />
            </View>
          ) : (
            <FlatList
              data={listItems}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => <RankingItem entry={item} isMe={item.id === user?.id} />}
              contentContainerStyle={styles.rankingContent}
              showsVerticalScrollIndicator={false}
              ListHeaderComponent={
                top3.length > 0 ? (
                  <View style={styles.podiumWrapper}>
                    <Podium top3={top3} />
                  </View>
                ) : null
              }
              refreshControl={
                <RefreshControl
                  refreshing={rankingQuery.isFetching}
                  onRefresh={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                    rankingQuery.refetch()
                  }}
                  tintColor={COLORS.accentPurple}
                />
              }
              ListEmptyComponent={
                <View style={styles.emptyFeed}>
                  <Text style={styles.emptyFeedEmoji}>🏆</Text>
                  <Text style={styles.emptyFeedText}>Nenhum ranking disponível neste período.</Text>
                </View>
              }
            />
          )}

          {user && myPosition > 0 && !rankingItems.find((entry) => entry.id === user.id) ? (
            <View style={styles.myPositionBanner}>
              <Text style={styles.myPositionText}>A tua posição: #{myPosition}</Text>
            </View>
          ) : null}
        </View>
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bgPrimary },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: { color: COLORS.textPrimary, fontSize: 18, fontWeight: '800', letterSpacing: 1 },
  headerIcon: { width: 40, height: 40, justifyContent: 'center', alignItems: 'flex-end' },
  tabsContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderSubtle,
    marginBottom: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: { borderBottomColor: COLORS.accentPurple },
  tabText: { color: COLORS.textMuted, fontSize: 14, fontWeight: '600' },
  tabTextActive: { color: COLORS.textPrimary },
  disabledTabText: { opacity: 0.5 },
  feedWrapper: { flex: 1 },
  feedFilters: { paddingHorizontal: 16, paddingBottom: 16, gap: 8 },
  feedChip: {
    height: 32,
    borderRadius: 999,
    paddingHorizontal: 12,
    backgroundColor: COLORS.bgCard,
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
    justifyContent: 'center',
    alignItems: 'center',
  },
  feedChipActive: {
    backgroundColor: COLORS.purpleAlpha10,
    borderColor: COLORS.accentPurple,
  },
  feedChipText: { color: COLORS.textSecondary, fontSize: 13, fontWeight: '600' },
  feedChipTextActive: { color: COLORS.accentPurple },
  feedContent: { paddingHorizontal: 16, paddingBottom: 100 },
  loadingFooter: { padding: 24, alignItems: 'center' },
  emptyFeed: { padding: 40, alignItems: 'center' },
  emptyFeedEmoji: { fontSize: 48, marginBottom: 16 },
  emptyFeedTitle: {
    color: COLORS.textPrimary,
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  emptyFeedText: {
    color: COLORS.textMuted,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
    paddingHorizontal: 32,
  },
  emptyFeedButton: {
    backgroundColor: COLORS.accentPurple,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  emptyFeedButtonText: {
    color: COLORS.textPrimary,
    fontWeight: '700',
    fontSize: 15,
  },
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 24,
    shadowColor: COLORS.accentPurple,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  fabGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fabIcon: { fontSize: 24, marginLeft: 2 },
  rankingWrapper: { flex: 1 },
  periodTabs: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  periodTab: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: COLORS.bgCard,
    alignItems: 'center',
  },
  periodTabActive: {
    backgroundColor: COLORS.purpleAlpha10,
    borderWidth: 1,
    borderColor: COLORS.accentPurple,
  },
  periodTabText: { color: COLORS.textMuted, fontSize: 12, fontWeight: '600' },
  periodTabTextActive: { color: COLORS.accentPurple },
  podiumWrapper: { marginBottom: 16 },
  rankingContent: { paddingHorizontal: 16, paddingBottom: 80 },
  myPositionBanner: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.bgElevated,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderSubtle,
  },
  myPositionText: { color: COLORS.textPrimary, textAlign: 'center', fontWeight: '700', fontSize: 14 },
})
