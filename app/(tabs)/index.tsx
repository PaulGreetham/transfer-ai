import { Image, StyleSheet, RefreshControl, TouchableOpacity } from 'react-native';
import React, { useEffect, useState } from 'react';

import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { NewsCard } from '@/components/NewsCard';
import { fetchFootballTransferNews, NewsItem } from '@/services/newsService';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { apiKeys } from '@/constants/ApiKeys';

export default function HomeScreen() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [debug, setDebug] = useState(false);
  const colorScheme = useColorScheme();

  const loadNews = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Only use the MediaStack API with no fallbacks
      const newsData = await fetchFootballTransferNews();
      
      // Debug logging to help identify issues
      console.log(`Received ${newsData.length} news items from API`);
      
      // Set the news data
      setNews(newsData);
      
      // Show error if no news found
      if (newsData.length === 0) {
        console.log('No news items found from the API');
      }
    } catch (err) {
      console.error('Error loading news:', err);
      setError('Failed to load news. Pull down to refresh.');
    } finally {
      setLoading(false);
    }
  };

  // Helper function to sort news by date (no longer needed as we sort in the service)
  // But keeping it for now in case we need it later
  const sortNewsByDate = (newsItems: NewsItem[]): NewsItem[] => {
    return [...newsItems].sort((a, b) => {
      return new Date(b.published_at).getTime() - new Date(a.published_at).getTime();
    });
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadNews();
    setRefreshing(false);
  };

  useEffect(() => {
    loadNews();
  }, []);

  const refreshControl = (
    <RefreshControl
      refreshing={refreshing}
      onRefresh={handleRefresh}
      colors={[Colors.light.tint]}
      tintColor={Colors[colorScheme ?? 'light'].tint}
    />
  );

  const toggleDebug = () => {
    setDebug(!debug);
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <Image
          source={require('@/assets/images/partial-react-logo.png')}
          style={styles.reactLogo}
        />
      }
      refreshControl={refreshControl}>
      <TouchableOpacity onLongPress={toggleDebug} activeOpacity={0.7}>
        <ThemedView style={styles.titleContainer}>
          <ThemedText type="title">Football Transfer News</ThemedText>
        </ThemedView>
      </TouchableOpacity>
      
      {debug && (
        <ThemedView style={styles.debugContainer}>
          <ThemedText type="defaultSemiBold">Debug Info:</ThemedText>
          <ThemedText>API Key: {apiKeys.mediaStack ? '✅ Present' : '❌ Missing'}</ThemedText>
          <ThemedText>API Key Length: {apiKeys.mediaStack ? apiKeys.mediaStack.length : 0} characters</ThemedText>
          <ThemedText>News Items: {news.length}</ThemedText>
          <ThemedText>Date Range: Last 30 days</ThemedText>
          <ThemedText>Sort Order: Chronological (newest first)</ThemedText>
          {news.length > 0 && (
            <ThemedView style={styles.dateInfo}>
              <ThemedText>
                <ThemedText type="defaultSemiBold">Newest:</ThemedText> {new Date(news[0].published_at).toLocaleString()}
              </ThemedText>
              {news.length > 1 && (
                <ThemedText>
                  <ThemedText type="defaultSemiBold">Oldest:</ThemedText> {new Date(news[news.length-1].published_at).toLocaleString()}
                </ThemedText>
              )}
            </ThemedView>
          )}
          <ThemedText>Loading: {loading ? 'Yes' : 'No'}</ThemedText>
          <ThemedText>Error: {error || 'None'}</ThemedText>
          <TouchableOpacity 
            style={styles.debugButton} 
            onPress={() => {
              loadNews();
            }}>
            <ThemedText style={styles.debugButtonText}>Reload News</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.debugButton} 
            onPress={() => {
              setNews([{
                author: "Debug Author",
                title: "Debug Test Article",
                description: "This is a test article to verify the news card component works correctly.",
                url: "https://example.com",
                source: "Debug Source",
                image: null,
                category: "sports",
                language: "en",
                country: "gb",
                published_at: new Date().toISOString()
              }]);
            }}>
            <ThemedText style={styles.debugButtonText}>Show Test Article</ThemedText>
          </TouchableOpacity>
        </ThemedView>
      )}
      
      {loading && !refreshing ? (
        <ThemedView style={styles.centered}>
          <ThemedText style={styles.loadingText}>Loading football transfer news...</ThemedText>
        </ThemedView>
      ) : error ? (
        <ThemedView style={styles.centered}>
          <ThemedText style={styles.errorText}>{error}</ThemedText>
        </ThemedView>
      ) : news.length === 0 ? (
        <ThemedView style={styles.centered}>
          <ThemedText>No transfer news found at the moment.</ThemedText>
          <ThemedText>
            We're constantly searching for the latest transfer rumors and deals.
          </ThemedText>
          <ThemedText>Pull down to refresh.</ThemedText>
        </ThemedView>
      ) : (
        <ThemedView style={styles.newsContainer}>
          {news.map((item, index) => {
            // Ensure we have a unique key by combining URL and index
            const uniqueKey = `${item.url}-${index}`;
            
            return (
              <NewsCard 
                key={uniqueKey} 
                item={item} 
              />
            );
          })}
        </ThemedView>
      )}
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    marginBottom: 16,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
  newsContainer: {
    flex: 1,
    marginTop: 8,
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    minHeight: 200,
  },
  loadingText: {
    marginTop: 12,
  },
  errorText: {
    marginBottom: 12,
    textAlign: 'center',
  },
  debugContainer: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 16,
    borderRadius: 8,
  },
  debugButton: {
    backgroundColor: '#0a7ea4',
    padding: 8,
    borderRadius: 6,
    marginTop: 8,
    alignItems: 'center',
  },
  debugButtonText: {
    color: 'white',
  },
  dateInfo: {
    marginVertical: 8,
  },
});
