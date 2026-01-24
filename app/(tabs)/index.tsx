import { ActivityIndicator, FlatList, Image, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';

import TranslationText from '@/components/translationText';
import { DevToArticle } from '@/types';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [articles, setArticles] = useState<DevToArticle[]>([]);

  const [visibleArticleIds, setVisibleArticleIds] = useState<string[]>([]);

  const router = useRouter();

  const handleNavigation = useCallback((articleId: string) => {
    router.push({ pathname: '/article/[articleId]', params: { articleId } });
  }, [router]);

  const fetchArticles = useCallback(async (pageNo = 1, isRefresh = false) => {
    if (loading) return;

    setLoading(true);

    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_ARTICLE_API_URL}?page=${pageNo}&per_page=10`
      );

      const data: DevToArticle[] = await response.json();

      if (data.length === 0) {
        setHasMore(false);
      }

      const allArticles = isRefresh ? data : [...articles, ...data];

      const uniqueArticlesMap = new Map<string, DevToArticle>();

      allArticles.forEach(article => {
        uniqueArticlesMap.set(article.id, article);
      });

      setArticles(Array.from(uniqueArticlesMap.values()));

      uniqueArticlesMap.clear();

    } catch (error) {
      console.error('Error fetching articles:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [loading]);

  const loadMore = useCallback(
    () => {
      if (!loading && hasMore) {
        const next = page + 1;
        setPage(next);
        fetchArticles(next);
      }
    }, [loading, hasMore, page]
  )

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setHasMore(true);
    setPage(1);
    fetchArticles(1, true);
  }, [fetchArticles]);

  const renderArticleItem = useCallback(
    ({ item }: { item: DevToArticle }) => {
      const isVisible = visibleArticleIds.includes(item.id);

      return (
        <Pressable onPress={() => handleNavigation(item.id)} style={styles.card}>

          {/* Cover Image */}
          {
            item.cover_image && (
              <Image
                source={{ uri: item.cover_image }}
                style={styles.cover}
              />
            )
          }

          {/* Content */}
          <View style={styles.content}>
            <TranslationText isVisible={isVisible} style={styles.title} numberOfLines={2}>
              {item.title}
            </TranslationText>

            <TranslationText isVisible={isVisible} style={styles.description} numberOfLines={3}>
              {item.description}
            </TranslationText>

            {/* Author */}
            <View style={styles.authorRow}>
              <Image
                source={{ uri: item.user.profile_image }}
                style={styles.avatar}
              />

              <View style={{ flex: 1 }}>
                <Text style={styles.authorName}>
                  {item.user.name}
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, }}>
                  <TranslationText style={styles.date} isVisible={isVisible}>
                    published on
                  </TranslationText>
                  <Text style={styles.date}>
                    {new Date(item.published_at).toLocaleDateString()}
                  </Text>
                </View>
              </View>
            </View>

            {/* Tags */}
            <View style={styles.tagWrap}>
              {item.tag_list.slice(0, 3).map((tag, index) => (
                <Text key={`${item.id}-${tag}-${index}`} style={styles.tag}>
                  #{tag}
                </Text>
              ))}
            </View>
          </View>
        </Pressable>
      );
    },
    [handleNavigation, visibleArticleIds]
  );


  const renderFooter = useCallback(() => {
    if (!loading) return null;

    return (
      <View style={styles.loader}>
        <ActivityIndicator size="small" color="#2563eb" />
        <Text style={styles.loaderText}>Loading more...</Text>
      </View>
    );
  }, [loading]);

  const renderEmptyItem = useCallback(() => (
    <View style={styles.empty}>
      <TranslationText>No articles found.</TranslationText>
    </View>
  ), []);

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: any[] }) => {
      const visibleIds = viewableItems.map(v => v.item.id);
      setVisibleArticleIds(visibleIds);
    },
    []
  );

  const viewabilityConfig = {
    itemVisiblePercentThreshold: 50, // 50% visible = considered visible
  };

  useEffect(() => {
    fetchArticles(1);
  }, []);

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      {/* header */}
      <View style={styles.header}>
        <TranslationText style={styles.headerTitle}>
          latest articles
        </TranslationText>
      </View>

      {
        loading && articles.length === 0 ?
          (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <ActivityIndicator size="large" color="#ffffff" />
            </View>
          ) : (
            <FlatList
              data={articles}
              keyExtractor={(item) => item.id.toString()}
              contentContainerStyle={styles.list}
              renderItem={renderArticleItem}
              ListEmptyComponent={renderEmptyItem}
              initialNumToRender={5}
              maxToRenderPerBatch={5}
              updateCellsBatchingPeriod={50}
              windowSize={5}
              removeClippedSubviews={true}
              onViewableItemsChanged={onViewableItemsChanged}
              viewabilityConfig={viewabilityConfig}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  tintColor="#2563eb"
                />
              }
              onEndReached={loadMore}
              onEndReachedThreshold={0.5}
              ListFooterComponent={renderFooter}
            />
          )
      }
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  header: { paddingHorizontal: 16, paddingVertical: 12 },

  headerTitle: { fontSize: 24, fontWeight: '700', color: 'white' },

  list: {
    gap: 16,
    paddingHorizontal: 16,
  },

  card: {
    borderRadius: 16,
    overflow: 'hidden',
    borderColor: '#333',
    borderWidth: 1,
  },

  cover: {
    width: '100%',
    height: 180,
  },

  content: {
    padding: 12,
  },

  title: {
    fontSize: 17,
    fontWeight: '700',
    color: 'white',
  },

  description: {
    marginTop: 6,
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
  },

  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
  },

  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 10,
  },

  authorName: {
    fontSize: 13,
    fontWeight: '600',
    color: 'white',
  },

  date: {
    fontSize: 11,
    color: '#888',
    marginTop: 2,
  },

  tagWrap: {
    flexDirection: 'row',
    marginTop: 10,
  },

  tag: {
    marginRight: 8,
    fontSize: 12,
    color: '#2563eb',
    backgroundColor: '#e0ecff',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },

  loader: {
    paddingVertical: 20,
    alignItems: 'center',
  },

  loaderText: {
    marginTop: 6,
    fontSize: 12,
    color: '#999',
  },

  empty: {
    marginTop: 60,
    alignItems: 'center',
  },

});

