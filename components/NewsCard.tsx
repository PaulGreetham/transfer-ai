import React from 'react';
import { StyleSheet, TouchableOpacity, Image, Linking } from 'react-native';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';
import { NewsItem } from '@/services/newsService';

interface NewsCardProps {
  item: NewsItem;
}

export function NewsCard({ item }: NewsCardProps) {
  const publishDate = new Date(item.published_at);
  const now = new Date();
  
  // Calculate how many hours ago the article was published
  const hoursAgo = Math.floor((now.getTime() - publishDate.getTime()) / (1000 * 60 * 60));
  
  // Format relative time for display
  let timeDisplay;
  if (hoursAgo < 1) {
    timeDisplay = "Just now";
  } else if (hoursAgo < 24) {
    timeDisplay = `${hoursAgo} ${hoursAgo === 1 ? 'hour' : 'hours'} ago`;
  } else {
    const daysAgo = Math.floor(hoursAgo / 24);
    timeDisplay = `${daysAgo} ${daysAgo === 1 ? 'day' : 'days'} ago`;
  }
  
  // Also keep the full date for the tooltip/detail
  const formattedDate = publishDate.toLocaleDateString() + ' ' + 
                       publishDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  
  const handlePress = () => {
    Linking.openURL(item.url);
  };

  return (
    <TouchableOpacity style={styles.card} onPress={handlePress}>
      <ThemedView style={styles.cardContent}>
        {item.image && (
          <Image
            source={{ uri: item.image }}
            style={styles.image}
            resizeMode="cover"
          />
        )}
        <ThemedView style={styles.textContainer}>
          <ThemedText type="defaultSemiBold" style={styles.title}>
            {item.title}
          </ThemedText>
          <ThemedText style={styles.description} numberOfLines={2}>
            {item.description}
          </ThemedText>
          <ThemedView style={styles.footer}>
            <ThemedText style={styles.source}>{item.source}</ThemedText>
            <ThemedText style={hoursAgo < 24 ? styles.recentDate : styles.date}>
              {timeDisplay}
            </ThemedText>
          </ThemedView>
        </ThemedView>
      </ThemedView>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  cardContent: {
    overflow: 'hidden',
  },
  image: {
    height: 180,
    width: '100%',
  },
  textContainer: {
    padding: 12,
  },
  title: {
    marginBottom: 8,
    fontSize: 16,
  },
  description: {
    fontSize: 14,
    marginBottom: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  source: {
    fontSize: 12,
    opacity: 0.7,
  },
  date: {
    fontSize: 12,
    opacity: 0.7,
  },
  recentDate: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0a7ea4', // Highlight recent news
  },
}); 