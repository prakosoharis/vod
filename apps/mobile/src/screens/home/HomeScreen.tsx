import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  RefreshControl,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../../store/authStore';
import { contentService } from '../../services';
import { Content } from '../../types';
import { COLORS, COLORS as COLORS_CONST } from '../../constants';
import ContentCard from '../../components/ui/ContentCard';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const { width: screenWidth } = Dimensions.get('window');

const HomeScreen: React.FC = () => {
  const { isAuthenticated } = useAuthStore();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedContent, setSelectedContent] = useState<Content | null>(null);

  // State for staggered loading
  const [loadSecondary, setLoadSecondary] = useState(false);
  const [loadGenre, setLoadGenre] = useState(false);

  // Load secondary content after 1 second
  useEffect(() => {
    const timer = setTimeout(() => setLoadSecondary(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  // Load genre content after 2 seconds
  useEffect(() => {
    const timer = setTimeout(() => setLoadGenre(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  // Priority 1: Featured content (immediate load)
  const { data: featured, isLoading: loadingFeatured, refetch: refetchFeatured } = useQuery({
    queryKey: ['featured'],
    queryFn: () => contentService.getFeaturedContent(),
  });

  // Priority 1: Trending (immediate load)
  const { data: trending, isLoading: loadingTrending, refetch: refetchTrending } = useQuery({
    queryKey: ['trending'],
    queryFn: () => contentService.getTrendingContent(),
  });

  // Priority 2: Load after 1 second delay
  const { data: indonesian, isLoading: loadingIndonesian } = useQuery({
    queryKey: ['indonesian'],
    queryFn: () => contentService.getIndonesianContent(),
    enabled: loadSecondary,
  });

  const { data: newReleases, isLoading: loadingNewReleases } = useQuery({
    queryKey: ['new-releases'],
    queryFn: () => contentService.getNewReleases(),
    enabled: loadSecondary,
  });

  // Priority 3: Load after 2 seconds delay
  const { data: action, isLoading: loadingAction } = useQuery({
    queryKey: ['genre', 'Action'],
    queryFn: () => contentService.getActionContent(),
    enabled: loadGenre,
  });

  const { data: drama, isLoading: loadingDrama } = useQuery({
    queryKey: ['genre', 'Drama'],
    queryFn: () => contentService.getDramaContent(),
    enabled: loadGenre,
  });

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        refetchFeatured(),
        refetchTrending(),
      ]);
    } finally {
      setRefreshing(false);
    }
  };

  const handleContentPress = (content: Content) => {
    if (!isAuthenticated) {
      // Show login modal or navigate to login
      console.log('Need to login to watch content');
      return;
    }
    // Navigate to video player
    console.log('Navigate to video player for content:', content.id);
  };

  const handleInfoPress = (content: Content) => {
    setSelectedContent(content);
    // Navigate to content detail modal
    console.log('Show content detail for:', content.id);
  };

  const renderSectionHeader = (title: string) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );

  const renderContentList = (contents: Content[] = [], showLock: boolean = false) => (
    <FlatList
      data={contents}
      horizontal
      showsHorizontalScrollIndicator={false}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.contentList}
      renderItem={({ item }) => (
        <ContentCard
          content={item}
          onPress={handleContentPress}
          onInfoPress={handleInfoPress}
          size="small"
          showLock={showLock}
        />
      )}
    />
  );

  const renderLoadingSkeleton = () => (
    <View style={styles.loadingSection}>
      <View style={[styles.skeleton, styles.skeletonHeader]} />
      <View style={styles.skeletonList}>
        {[...Array(3)].map((_, i) => (
          <View key={i} style={[styles.skeleton, styles.skeletonCard]} />
        ))}
      </View>
    </View>
  );

  // Only show initial loading for priority 1 content
  const isLoadingInitial = loadingFeatured || loadingTrending;

  if (isLoadingInitial && !refreshing) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS_CONST.primary} />
      }
      showsVerticalScrollIndicator={false}
    >
      {/* Featured Content */}
      {featured && featured.length > 0 && (
        <View style={styles.featuredSection}>
          <FlatList
            data={featured.slice(0, 5)}
            horizontal
            showsHorizontalScrollIndicator={false}
            pagingEnabled
            keyExtractor={(item) => `featured-${item.id}`}
            renderItem={({ item }) => (
              <ContentCard
                content={item}
                onPress={handleContentPress}
                onInfoPress={handleInfoPress}
                size="large"
                showLock={!isAuthenticated}
              />
            )}
            contentContainerStyle={styles.featuredList}
          />
        </View>
      )}

      {/* Trending Now */}
      {trending && trending.length > 0 && (
        <View style={styles.section}>
          {renderSectionHeader('Trending Sekarang')}
          {renderContentList(trending, !isAuthenticated)}
        </View>
      )}

      {/* Made in Indonesia */}
      {loadSecondary && (
        <View style={styles.section}>
          {loadingIndonesian ? (
            renderLoadingSkeleton()
          ) : indonesian && indonesian.length > 0 ? (
            <>
              {renderSectionHeader('Buatan Indonesia')}
              {renderContentList(indonesian, !isAuthenticated)}
            </>
          ) : null}
        </View>
      )}

      {/* New Releases */}
      {loadSecondary && (
        <View style={styles.section}>
          {loadingNewReleases ? (
            renderLoadingSkeleton()
          ) : newReleases && newReleases.length > 0 ? (
            <>
              {renderSectionHeader('Rilis Terbaru')}
              {renderContentList(newReleases, !isAuthenticated)}
            </>
          ) : null}
        </View>
      )}

      {/* Action Movies */}
      {loadGenre && (
        <View style={styles.section}>
          {loadingAction ? (
            renderLoadingSkeleton()
          ) : action && action.length > 0 ? (
            <>
              {renderSectionHeader('Aksi')}
              {renderContentList(action, !isAuthenticated)}
            </>
          ) : null}
        </View>
      )}

      {/* Drama */}
      {loadGenre && (
        <View style={styles.section}>
          {loadingDrama ? (
            renderLoadingSkeleton()
          ) : drama && drama.length > 0 ? (
            <>
              {renderSectionHeader('Drama')}
              {renderContentList(drama, !isAuthenticated)}
            </>
          ) : null}
        </View>
      )}

      {/* Bottom padding */}
      <View style={styles.bottomPadding} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS_CONST.background,
  },
  contentContainer: {
    flexGrow: 1,
  },
  featuredSection: {
    marginBottom: 24,
  },
  featuredList: {
    paddingHorizontal: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    paddingHorizontal: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS_CONST.text,
  },
  contentList: {
    paddingHorizontal: 12,
  },
  loadingSection: {
    marginBottom: 24,
  },
  skeletonHeader: {
    width: 120,
    height: 20,
    backgroundColor: COLORS_CONST.surface,
    borderRadius: 4,
    marginHorizontal: 16,
    marginBottom: 12,
  },
  skeletonList: {
    flexDirection: 'row',
    paddingHorizontal: 12,
  },
  skeletonCard: {
    width: 90,
    height: 135,
    backgroundColor: COLORS_CONST.surface,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  bottomPadding: {
    height: 100, // Extra padding for bottom tab bar
  },
});

export default HomeScreen;