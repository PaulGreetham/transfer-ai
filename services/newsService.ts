import { apiKeys } from '@/constants/ApiKeys';

export interface NewsItem {
  author: string;
  title: string;
  description: string;
  url: string;
  source: string;
  image: string | null;
  category: string;
  language: string;
  country: string;
  published_at: string;
}

export interface NewsResponse {
  pagination: {
    limit: number;
    offset: number;
    count: number;
    total: number;
  };
  data: NewsItem[];
  error?: {
    message: string;
    code: string;
    context?: any;
  };
}

// Add this function to help deduplicate news items
const removeDuplicateNews = (newsItems: NewsItem[]): NewsItem[] => {
  const uniqueUrls = new Set<string>();
  return newsItems.filter(item => {
    // If we've seen this URL before, filter it out
    if (uniqueUrls.has(item.url)) {
      return false;
    }
    // Otherwise, add it to our set and keep the item
    uniqueUrls.add(item.url);
    return true;
  });
};

export const fetchFootballTransferNews = async (): Promise<NewsItem[]> => {
  try {
    // Get date for the last 30 days to ensure we get enough transfer news
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);
    
    // Format dates as YYYY-MM-DD
    const formattedToday = today.toISOString().split('T')[0];
    const formattedThirtyDaysAgo = thirtyDaysAgo.toISOString().split('T')[0];
    
    // Always use a consistent date range
    const dateQuery = `&date=${formattedThirtyDaysAgo},${formattedToday}`;
    
    // Simplify query to get more results
    const apiUrl = `https://api.mediastack.com/v1/news?` +
      `access_key=${apiKeys.mediaStack}` + 
      `&keywords=soccer` + // Simplified to just get some results
      `&categories=sports` +
      `&languages=en` +
      dateQuery + 
      `&sort=published_desc` + 
      `&limit=100`;
    
    console.log('Fetching from URL:', apiUrl.replace(apiKeys.mediaStack, '[REDACTED]'));
    
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      console.error('API returned status:', response.status);
      const responseText = await response.text();
      console.error('API response:', responseText);
      throw new Error(`Failed to fetch news: ${response.status}`);
    }
    
    const data: NewsResponse = await response.json();
    console.log('API returned', data.data.length, 'news items');
    
    if (data.error) {
      console.error('API error:', data.error);
      throw new Error(data.error.message || 'API error occurred');
    }
    
    // Less restrictive filtering to get at least some results
    let filteredNews = data.data;
    
    // Only apply filtering if we have results
    if (filteredNews.length > 0) {
      filteredNews = filteredNews.filter(item => {
        const lowerTitle = item.title.toLowerCase();
        const lowerDesc = (item.description || '').toLowerCase();
        
        // Check for transfer-related keywords, but be less restrictive
        const transferKeywords = [
          'transfer', 'sign', 'deal', 'move', 'joins', 'bid',
          'rumour', 'rumor', 'target', 'fee'
        ];
        
        // If title contains any transfer keyword, include it
        for (const keyword of transferKeywords) {
          if (lowerTitle.includes(keyword)) {
            return true;
          }
        }
        
        // If description contains multiple transfer keywords, include it
        let keywordCount = 0;
        for (const keyword of transferKeywords) {
          if (lowerDesc.includes(keyword)) {
            keywordCount++;
            if (keywordCount >= 1) {
              return true;
            }
          }
        }
        
        return false;
      });
    }
    
    console.log('After filtering:', filteredNews.length, 'items remain');
    
    // Remove duplicates
    const uniqueNews = removeDuplicateNews(filteredNews);
    console.log('After removing duplicates:', uniqueNews.length, 'items remain');
    
    // If we still have no results, show a test article
    if (uniqueNews.length === 0) {
      console.log('No results found, using test article');
      return [{
        author: "Debug Test",
        title: "MediaStack API Returned No Results",
        description: "Your API key may be invalid or expired. Please check your .env file and MediaStack account. This is a test article to help debug the issue.",
        url: "https://mediastack.com/documentation",
        source: "Debug Source",
        image: null,
        category: "sports",
        language: "en",
        country: "gb",
        published_at: new Date().toISOString()
      }];
    }
    
    // Sort by publication date (newest first)
    const sortedNews = uniqueNews.sort((a, b) => {
      return new Date(b.published_at).getTime() - new Date(a.published_at).getTime();
    });
    
    return sortedNews;
  } catch (error) {
    console.error('Error fetching football transfer news:', error);
    // Return a test article to help debug
    return [{
      author: "Error Reporter",
      title: "Error Fetching News",
      description: `An error occurred while fetching news: ${error}. Please check your API key and network connection.`,
      url: "https://mediastack.com/documentation",
      source: "Error Handler",
      image: null,
      category: "sports",
      language: "en",
      country: "gb",
      published_at: new Date().toISOString()
    }];
  }
};

export const fetchFootballTransfersSecondary = async (): Promise<NewsItem[]> => {
  try {
    // Get date for the last 30 days
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);
    
    // Format dates as YYYY-MM-DD
    const formattedToday = today.toISOString().split('T')[0];
    const formattedThirtyDaysAgo = thirtyDaysAgo.toISOString().split('T')[0];
    
    const dateQuery = `&date=${formattedThirtyDaysAgo},${formattedToday}`;
    
    // Use alternative keywords for a wider search
    const response = await fetch(
      `https://api.mediastack.com/v1/news?` +
      `access_key=${apiKeys.mediaStack}` + 
      `&keywords=football deal OR "player joins" OR "player signs" OR "new signing"` +
      `&categories=sports` +
      `&languages=en` +
      dateQuery + 
      `&sort=published_desc` + 
      `&limit=100`
    );
    
    if (!response.ok) {
      console.error('Secondary API returned status: ', response.status);
      return [];
    }
    
    const data: NewsResponse = await response.json();
    console.log('Secondary API returned ', data.data.length, ' news items');
    
    if (data.error) {
      console.error('Secondary API error:', data.error);
      return [];
    }
    
    // Similar filtering for transfer-related content
    const filteredNews = data.data.filter(item => {
      const lowerTitle = item.title.toLowerCase();
      const lowerDesc = (item.description || '').toLowerCase();
      
      const transferKeywords = [
        'transfer', 'sign ', 'signs', 'signed', 'signing',
        'deal', 'move', 'joins', 'joined', 'bid',
        'rumour', 'rumor', 'target', 'fee'
      ];
      
      const hasTransferKeyword = transferKeywords.some(keyword => 
        lowerTitle.includes(keyword) || lowerDesc.includes(keyword)
      );
      
      const footballKeywords = [
        'football', 'soccer', 'league', 'club', 
        'premier league', 'serie a', 'la liga', 'bundesliga'
      ];
      
      const isFootballRelated = footballKeywords.some(keyword => 
        lowerTitle.includes(keyword) || lowerDesc.includes(keyword)
      );
      
      return hasTransferKeyword && isFootballRelated;
    });
    
    console.log('After secondary filtering:', filteredNews.length, 'items remain');
    
    const uniqueNews = removeDuplicateNews(filteredNews);
    console.log('After removing secondary duplicates:', uniqueNews.length, 'items remain');
    
    const sortedNews = uniqueNews.sort((a, b) => {
      return new Date(b.published_at).getTime() - new Date(a.published_at).getTime();
    });
    
    return sortedNews;
  } catch (error) {
    console.error('Error fetching secondary football transfer news:', error);
    return [];
  }
};
