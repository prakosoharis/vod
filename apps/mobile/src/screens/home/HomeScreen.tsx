import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  RefreshControl,
  Dimensions,
  StatusBar,
} from 'react-native';
import { SafeIcon } from '../../components/ui';
import { useQuery } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuthStore } from '../../store/authStore';
import { contentService } from '../../services';
import { Content, RootStackParamList } from '../../types';
import { COLORS, THEME } from '../../constants';
import ContentCard from '../../components/ui/ContentCard';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import FeaturedCarousel from '../../components/home/FeaturedCarousel';

const { width: screenWidth } = Dimensions.get('window');

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
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
      await refetchFeatured();
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
    navigation.navigate('VideoPlayer', { contentId: content.id });
  };

  const handleInfoPress = (content: Content) => {
    setSelectedContent(content);
    // Navigate to content detail modal
    navigation.navigate('ContentDetail', { content });
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
  const isLoadingInitial = loadingFeatured;

  if (isLoadingInitial && !refreshing) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.warmCharcoal[100]} />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.accent[500]}
            colors={[COLORS.accent[500]]}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Featured Carousel */}
        {featured && featured.length > 0 && (
          <FeaturedCarousel
            contents={featured.slice(0, 5)}
            onPlayPress={handleContentPress}
            onInfoPress={handleInfoPress}
          />
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
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.warmCharcoal[100],
  },
  contentContainer: {
    flexGrow: 1,
  },
  section: {
    marginBottom: THEME.spacing.xl,
  },
  sectionHeader: {
    paddingHorizontal: THEME.spacing.lg,
    marginBottom: THEME.spacing.md,
    marginTop: THEME.spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: THEME.typography.fontSize.xl,
    fontWeight: THEME.typography.fontWeight.bold,
    color: COLORS.cream[50],
    letterSpacing: 0.5,
  },
  contentList: {
    paddingHorizontal: THEME.spacing.md,
  },
  loadingSection: {
    marginBottom: THEME.spacing.xl,
  },
  skeletonHeader: {
    width: 140,
    height: 24,
    backgroundColor: COLORS.warmCharcoal[50],
    borderRadius: THEME.borderRadius.md,
    marginHorizontal: THEME.spacing.lg,
    marginBottom: THEME.spacing.md,
    opacity: 0.3,
  },
  skeletonList: {
    flexDirection: 'row',
    paddingHorizontal: THEME.spacing.md,
  },
  skeletonCard: {
    width: 90,
    height: 135,
    backgroundColor: COLORS.warmCharcoal[50],
    borderRadius: THEME.borderRadius.md,
    marginHorizontal: THEME.spacing.xs,
    opacity: 0.3,
  },
  bottomPadding: {
    height: 100, // Extra padding for bottom tab bar
  },
});

export default HomeScreen;