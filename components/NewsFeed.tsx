import React, { useEffect, useState } from 'react';
import { RefreshControl, StyleSheet, ActivityIndicator } from 'react-native';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';
import { NewsCard } from './NewsCard';
import { fetchFootballTransferNews, NewsItem } from '@/services/newsService';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';

export function NewsFeed() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const colorScheme = useColorScheme();

  const loadNews = async () => {
    try {
      setLoading(true);
      setError(null);
      const newsData = await fetchFootballTransferNews();
      setNews(newsData);
    } catch (err) {
      setError('Failed to load news. Pull down to refresh.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNews();
  }, []);

  if (loading) {
    return (
      <ThemedView style={styles.centered}>
        <ActivityIndicator size="large" color={Colors[colorScheme ?? 'light'].tint} />
        <ThemedText style={styles.loadingText}>Loading football transfer news...</ThemedText>
      </ThemedView>
    );
  }

  if (error) {
    return (
      <ThemedView style={styles.centered}>
        <ThemedText style={styles.errorText}>{error}</ThemedText>
      </ThemedView>
    );
  }

  if (news.length === 0) {
    return (
      <ThemedView style={styles.centered}>
        <ThemedText>No football transfer news available.</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView>
      {news.map((item) => (
        <NewsCard key={item.url} item={item} />
      ))}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  list: {
    padding: 16,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
  },
  errorText: {
    marginBottom: 12,
    textAlign: 'center',
  },
}); 