import React, { useState } from 'react'
import { View, StyleSheet, FlatList, Pressable, ActivityIndicator, RefreshControl } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import { LinearGradient } from 'expo-linear-gradient'
import Text from '../../components/ui/text'
import { COLORS } from '@vibecode/shared'
import { useFeed, useRanking } from '../../hooks/use-social'
import { PostCard } from '../../components/social/post-card'
import { RankingItem } from '../../components/social/ranking-item'
import { Podium } from '../../components/social/podium'
import { useUser } from '../../hooks/use-user'

type SocialTab = 'feed' | 'ranking'
type RankingPeriod = 'week' | 'month' | 'alltime'

export default function SocialScreen() {
  const [activeTab, setActiveTab] = useState<SocialTab>('feed')
  const [rankingPeriod, setRankingPeriod] = useState<RankingPeriod>('week')

  const { user } = useUser()

  // Feed Query
  const feedQuery = useFeed()
  const posts = feedQuery.data?.pages.flatMap((p) => p.data) ?? []

  // Ranking Query
  const rankingQuery = useRanking(rankingPeriod)
  const rankingItems = rankingQuery.data?.rankings ?? []
  const myPosition = rankingQuery.data?.myPosition ?? -1
  const top3 = rankingItems.filter((r) => r.position <= 3)
  const listItems = rankingItems.filter((r) => r.position > 3)

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

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>COMUNIDADE</Text>
        <Pressable style={styles.headerIcon}>
          <Ionicons name="notifications-outline" size={24} color={COLORS.textPrimary} />
        </Pressable>
      </View>

      {/* Tabs */}
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
          <Text style={[styles.tabText, { opacity: 0.5 }]}>Equipas</Text>
        </Pressable>
        <Pressable style={styles.tab} disabled>
          <Text style={[styles.tabText, { opacity: 0.5 }]}>Prompts</Text>
        </Pressable>
      </View>

      {/* FEED TAB */}
      {activeTab === 'feed' && (
        <View style={{ flex: 1 }}>
          <FlatList
            data={posts}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <PostCard post={item} />}
            contentContainerStyle={styles.feedContent}
            showsVerticalScrollIndicator={false}
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
                <View style={styles.loadingFooter}><ActivityIndicator color={COLORS.accentPurple}/></View>
              ) : (
                <View style={styles.emptyFeed}>
                  <Text style={styles.emptyFeedEmoji}>🛸</Text>
                  <Text style={styles.emptyFeedText}>Ainda não há posts aqui.</Text>
                </View>
              )
            }
          />
          {/* FAB - Create Post */}
          <Pressable
            style={styles.fab}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
              router.push('/social/new-post')
            }}
          >
            <LinearGradient
              colors={[COLORS.accentPurple, COLORS.accentBlue]}
              style={styles.fabGradient}
            >
              <Text style={styles.fabIcon}>✍️</Text>
            </LinearGradient>
          </Pressable>
        </View>
      )}

      {/* RANKING TAB */}
      {activeTab === 'ranking' && (
        <View style={{ flex: 1 }}>
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
            <View style={styles.loadingFooter}><ActivityIndicator color={COLORS.accentPurple}/></View>
          ) : (
            <FlatList
              data={listItems}
              keyExtractor={(item) => item.id}
              ListHeaderComponent={
                top3.length > 0 ? (
                  <View style={{ marginBottom: 16 }}>
                    <Podium top3={top3} />
                  </View>
                ) : null
              }
              renderItem={({ item }) => (
                <RankingItem entry={item} isMe={item.id === user?.id} />
              )}
              contentContainerStyle={styles.rankingContent}
              showsVerticalScrollIndicator={false}
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

          {/* Fixed "My Position" banner if user is not completely loaded or is far below */}
          {user && myPosition > 0 && !rankingItems.find(r => r.id === user.id) && (
            <View style={styles.myPositionBanner}>
              <Text style={styles.myPositionText}>A tua posição: #{myPosition}</Text>
            </View>
          )}
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

  feedContent: { padding: 16, paddingBottom: 100 },
  loadingFooter: { padding: 24, alignItems: 'center' },
  emptyFeed: { padding: 40, alignItems: 'center' },
  emptyFeedEmoji: { fontSize: 48, marginBottom: 16 },
  emptyFeedText: { color: COLORS.textMuted, fontSize: 14 },

  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
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
  fabIcon: { fontSize: 24, marginLeft: 2 }, // Ajuste óptico

  // Ranking
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
  periodTabActive: { backgroundColor: COLORS.purpleAlpha10, borderWidth: 1, borderColor: COLORS.accentPurple },
  periodTabText: { color: COLORS.textMuted, fontSize: 12, fontWeight: '600' },
  periodTabTextActive: { color: COLORS.accentPurple },

  rankingContent: { paddingHorizontal: 16, paddingBottom: 80 },
  myPositionBanner: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.bgElevated,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderSubtle,
  },
  myPositionText: {
    color: '#FFF',
    textAlign: 'center',
    fontWeight: '700',
    fontSize: 14,
  },
})
