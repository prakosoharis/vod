import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useAuthStore } from '../store/authStore';
import { useContentStore } from '../store/contentStore';
import { FeaturedCarousel, ContentRow, LiveStreamRow } from '../components';
import { Loading, ErrorState } from '../components';
import { Content, LiveStream } from '../types';
import { contentService, authService } from '../services';

const HomeScreen: React.FC = () => {
  const { user, isAuthenticated } = useAuthStore();
  const {
    featuredContent,
    liveStreams,
    isLoading,
    isRefreshing,
    error,
    fetchFeaturedContent,
    fetchLiveStreams,
    refreshContent,
    clearError,
  } = useContentStore();

  // Local state for staggered loading (mirroring web app behavior)
  const [loadSecondary, setLoadSecondary] = useState(false);
  const [loadGenre, setLoadGenre] = useState(false);
  const [trendingContent, setTrendingContent] = useState<Content[]>([]);
  const [continueWatching, setContinueWatching] = useState<Content[]>([]);
  const [indonesianContent, setIndonesianContent] = useState<Content[]>([]);
  const [newReleases, setNewReleases] = useState<Content[]>([]);
  const [actionContent, setActionContent] = useState<Content[]>([]);
  const [loadingSecondary, setLoadingSecondary] = useState(false);
  const [loadingGenre, setLoadingGenre] = useState(false);

  // Load secondary content after 1 second (mirroring web app)
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoadSecondary(true);
      loadSecondaryContent();
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  // Load genre content after 2 seconds (mirroring web app)
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoadGenre(true);
      loadGenreContent();
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  // Initial content loading
  useEffect(() => {
    loadInitialContent();
  }, []);

  const loadInitialContent = async () => {
    try {
      await Promise.all([
        fetchFeaturedContent(),
        fetchLiveStreams(),
        loadTrendingContent(),
        isAuthenticated ? loadContinueWatching() : Promise.resolve(),
      ]);
    } catch (err) {
      // Error is handled by store
    }
  };

  const loadTrendingContent = async () => {
    try {
      const trending = await contentService.getTrendingContent();
      setTrendingContent(trending);
    } catch (err) {
      console.error('Error loading trending content:', err);
    }
  };

  const loadContinueWatching = async () => {
    try {
      const continueData = await authService.getContinueWatching();
      setContinueWatching(continueData);
    } catch (err) {
      console.error('Error loading continue watching:', err);
    }
  };

  const loadSecondaryContent = async () => {
    setLoadingSecondary(true);
    try {
      const [newReleasesData, indonesianData] = await Promise.all([
        contentService.getAllContent({ limit: 20 }),
        contentService.getAllContent({ genre: 'Indonesian', limit: 20 }),
      ]);
      setNewReleases(newReleasesData.data);
      setIndonesianContent(indonesianData.data);
    } catch (err) {
      console.error('Error loading secondary content:', err);
    } finally {
      setLoadingSecondary(false);
    }
  };

  const loadGenreContent = async () => {
    setLoadingGenre(true);
    try {
      const actionData = await contentService.getAllContent({
        genre: 'Action',
        limit: 20,
      });
      setActionContent(actionData.data);
    } catch (err) {
      console.error('Error loading genre content:', err);
    } finally {
      setLoadingGenre(false);
    }
  };

  const handleRefresh = async () => {
    clearError();
    await refreshContent();
    await loadInitialContent();
    if (loadSecondary) await loadSecondaryContent();
    if (loadGenre) await loadGenreContent();
  };

  const renderLoadingSkeleton = () => (
    <View style={styles.loadingContainer}>
      <View style={styles.carouselSkeleton} />
      <View style={styles.rowSkeleton}>
        <View style={styles.rowTitleSkeleton} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {Array.from({ length: 6 }, (_, i) => (
            <View key={i} style={styles.cardSkeleton} />
          ))}
        </ScrollView>
      </View>
    </View>
  );

  const renderContent = () => {
    if (isLoading && !featuredContent.length) {
      return renderLoadingSkeleton();
    }

    if (error && !featuredContent.length) {
      return (
        <ErrorState
          title="Error Loading Content"
          message={error}
          onRetry={handleRefresh}
        />
      );
    }

    return (
      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Welcome Message */}
        <View style={styles.header}>
          <Text style={styles.welcomeText}>
            {user ? `Welcome back, ${user.full_name || user.email}!` : 'Welcome to VOD'}
          </Text>
          <Text style={styles.subtitleText}>
            Discover and watch your favorite content
          </Text>
        </View>

        {/* Featured Carousel */}
        {featuredContent.length > 0 && (
          <FeaturedCarousel contents={featuredContent} />
        )}

        {/* Continue Watching (only if logged in) */}
        {isAuthenticated && continueWatching.length > 0 && (
          <ContentRow
            title="Continue Watching"
            contents={continueWatching}
            loading={isLoading}
          />
        )}

        {/* Trending Now */}
        {trendingContent.length > 0 && (
          <ContentRow
            title="Trending Now"
            contents={trendingContent}
            loading={isLoading}
          />
        )}

        {/* Live Streams */}
        {liveStreams.length > 0 && (
          <LiveStreamRow
            title="Live Streams"
            streams={liveStreams}
            loading={isLoading}
          />
        )}

        {/* New Releases */}
        {loadSecondary && newReleases.length > 0 && (
          <ContentRow
            title="New Releases"
            contents={newReleases}
            loading={loadingSecondary}
          />
        )}

        {/* Indonesian Content */}
        {loadSecondary && indonesianContent.length > 0 && (
          <ContentRow
            title="Indonesian Content"
            contents={indonesianContent}
            loading={loadingSecondary}
          />
        )}

        {/* Action Movies */}
        {loadGenre && actionContent.length > 0 && (
          <ContentRow
            title="Action Movies"
            contents={actionContent}
            loading={loadingGenre}
          />
        )}

        {/* Loading indicators for secondary content */}
        {loadSecondary && loadingSecondary && (
          <>
            <View style={styles.loadingSection}>
              <View style={styles.loadingTitle} />
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {Array.from({ length: 6 }, (_, i) => (
                  <View key={i} style={styles.cardSkeleton} />
                ))}
              </ScrollView>
            </View>
            <View style={styles.loadingSection}>
              <View style={styles.loadingTitle} />
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {Array.from({ length: 6 }, (_, i) => (
                  <View key={i} style={styles.cardSkeleton} />
                ))}
              </ScrollView>
            </View>
          </>
        )}

        {/* Loading indicators for genre content */}
        {loadGenre && loadingGenre && (
          <View style={styles.loadingSection}>
            <View style={styles.loadingTitle} />
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {Array.from({ length: 6 }, (_, i) => (
                <View key={i} style={styles.cardSkeleton} />
              ))}
            </ScrollView>
          </View>
        )}
      </ScrollView>
    );
  };

  return renderContent();
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  subtitleText: {
    fontSize: 14,
    color: '#9ca3af',
  },

  // Loading Skeleton Styles
  loadingContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  carouselSkeleton: {
    height: 500,
    backgroundColor: '#1a1a1a',
    marginBottom: 20,
  },
  rowSkeleton: {
    marginBottom: 24,
  },
  rowTitleSkeleton: {
    width: 150,
    height: 22,
    backgroundColor: '#1a1a1a',
    borderRadius: 4,
    marginHorizontal: 16,
    marginBottom: 12,
  },
  cardSkeleton: {
    width: 120,
    height: 180,
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    marginLeft: 16,
    marginRight: 12,
  },
  loadingSection: {
    marginBottom: 24,
  },
  loadingTitle: {
    width: 150,
    height: 22,
    backgroundColor: '#1a1a1a',
    borderRadius: 4,
    marginHorizontal: 16,
    marginBottom: 12,
  },
});

export default HomeScreen;