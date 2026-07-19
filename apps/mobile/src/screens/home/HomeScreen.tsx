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
  Image,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SafeIcon } from '../../components/ui';
import { useQuery } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuthStore } from '../../store/authStore';
import { contentService, userService } from '../../services';
import { Content, RootStackParamList } from '../../types';
import { COLORS, THEME } from '../../constants';
import ContentCard from '../../components/ui/ContentCard';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import FeaturedCarousel from '../../components/home/FeaturedCarousel';

const { width: screenWidth } = Dimensions.get('window');
const smashLogo = require('../../assets/smash-logo-transparent.png');

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

  // Continue Watching - Only for authenticated users (immediate load)
  const { data: continueWatching, isLoading: loadingContinue } = useQuery({
    queryKey: ['continue-watching'],
    queryFn: () => userService.getContinueWatching(),
    enabled: isAuthenticated,
  });

  // Priority 2: Load after 1 second delay
  const { data: moviePicks, isLoading: loadingMoviePicks } = useQuery({
    queryKey: ['homepage', 'movie-picks'],
    queryFn: () => contentService.getMoviePicks(10),
    enabled: loadSecondary,
  });

  const { data: newReleases, isLoading: loadingNewReleases } = useQuery({
    queryKey: ['new-releases'],
    queryFn: () => contentService.getNewReleases(),
    enabled: loadSecondary,
  });

  // Priority 3: Load after 2 seconds delay
  const { data: popularSeries, isLoading: loadingPopularSeries } = useQuery({
    queryKey: ['homepage', 'popular-series'],
    queryFn: () => contentService.getPopularSeries(10),
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
    // Always navigate to ContentDetail first to show info
    setSelectedContent(content);
    navigation.navigate('ContentDetail', { content });
  };

  const handleInfoPress = (content: Content) => {
    setSelectedContent(content);
    // Navigate to content detail modal
    navigation.navigate('ContentDetail', { content });
  };

  const renderSectionHeader = (title: string, eyebrow?: string) => (
    <View style={styles.sectionHeader}>
      <View>
        {eyebrow && <Text style={styles.sectionEyebrow}>{eyebrow}</Text>}
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      <TouchableOpacity onPress={() => navigation.navigate('Main', { screen: 'Browse' })}>
        <Text style={styles.seeAll}>Lihat semua  →</Text>
      </TouchableOpacity>
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

  const renderContinueWatching = (contents: any[] = []) => (
    <FlatList
      data={contents}
      horizontal
      showsHorizontalScrollIndicator={false}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.continueList}
      renderItem={({ item }) => {
        const durationMinutes = Number.parseInt(item.duration || '0', 10) || 90;
        const totalSeconds = durationMinutes * 60;
        const progress = Math.min(100, Math.max(4, ((item.progress_seconds || 0) / totalSeconds) * 100));
        return (
          <TouchableOpacity style={styles.continueCard} onPress={() => handleContentPress(item)} activeOpacity={0.88}>
            <Image source={{ uri: item.backdrop_url || item.thumbnail_url }} style={styles.continueImage} />
            <View style={styles.continuePlay}><SafeIcon name="play-arrow" size={22} color={COLORS.cream[50]} /></View>
            <View style={styles.continueCopy}>
              <Text style={styles.continueTitle} numberOfLines={1}>{item.title}</Text>
              <Text style={styles.continueMeta}>{item.type === 'SERIES' ? 'Lanjutkan episode' : 'Lanjutkan film'}</Text>
            </View>
            <View style={styles.progressTrack}><View style={[styles.progressBar, { width: `${progress}%` }]} /></View>
          </TouchableOpacity>
        );
      }}
    />
  );

  // Only show initial loading for priority 1 content
  const isLoadingInitial = loadingFeatured;

  if (isLoadingInitial && !refreshing) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.warmCharcoal[100]} />
      <View style={styles.appHeader}>
        <Image source={smashLogo} resizeMode="contain" style={styles.logo} />
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerButton} onPress={() => navigation.navigate('Search')}>
            <SafeIcon name="search" size={23} color={COLORS.cream[50]} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.avatar} onPress={() => navigation.navigate('Main', { screen: 'Profile' })}>
            <Text style={styles.avatarText}>SM</Text>
          </TouchableOpacity>
        </View>
      </View>
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

        {/* Continue Watching - Only for authenticated users */}
        {isAuthenticated && continueWatching && continueWatching.length > 0 && (
          <View style={styles.section}>
            {renderSectionHeader('Lanjutkan Menonton')}
            {renderContinueWatching(continueWatching)}
          </View>
        )}

      {/* Curated movie picks */}
      {loadSecondary && (
        <View style={styles.section}>
          {loadingMoviePicks ? (
            renderLoadingSkeleton()
          ) : moviePicks && moviePicks.length > 0 ? (
            <>
              {renderSectionHeader('Film Pilihan', 'PILIHAN EDITOR')}
              {renderContentList(moviePicks, !isAuthenticated)}
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
              {renderSectionHeader('Rilis Terbaru', 'BARU DI SMASH')}
              {renderContentList(newReleases, !isAuthenticated)}
            </>
          ) : null}
        </View>
      )}

      {/* Curated popular series */}
      {loadGenre && (
        <View style={styles.section}>
          {loadingPopularSeries ? (
            renderLoadingSkeleton()
          ) : popularSeries && popularSeries.length > 0 ? (
            <>
              {renderSectionHeader('Serial Populer', 'CERITA BERSAMBUNG')}
              {renderContentList(popularSeries, !isAuthenticated)}
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
              {renderSectionHeader('Drama', 'KOLEKSI NUSANTARA')}
              {renderContentList(drama, !isAuthenticated)}
            </>
          ) : null}
        </View>
      )}

        {/* Bottom padding */}
        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.warmCharcoal[100] },
  appHeader: {
    height: 58,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.warmCharcoal[100],
  },
  logo: { width: 94, height: 50 },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerButton: {
    width: 44, height: 44, alignItems: 'center', justifyContent: 'center',
  },
  avatar: {
    width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.accent[500],
    alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: `${COLORS.cream[50]}30`,
  },
  avatarText: { color: COLORS.cream[50], fontSize: 11, fontWeight: '800' },
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
  sectionEyebrow: {
    color: COLORS.accent[500], fontSize: 9, fontWeight: '800', letterSpacing: 1.5, marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 21,
    fontWeight: THEME.typography.fontWeight.bold,
    color: COLORS.cream[50],
    letterSpacing: 0.5,
  },
  seeAll: { color: COLORS.cream[100], fontSize: 12, fontWeight: '600' },
  contentList: {
    paddingHorizontal: 12,
  },
  continueList: { paddingHorizontal: 16, gap: 12 },
  continueCard: {
    width: screenWidth * 0.72,
    backgroundColor: COLORS.warmCharcoal[50],
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: `${COLORS.cream[50]}14`,
  },
  continueImage: { width: '100%', height: 132 },
  continuePlay: {
    position: 'absolute', top: 48, left: '45%', width: 38, height: 38, borderRadius: 19,
    alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(23,21,15,.72)',
    borderWidth: 1, borderColor: `${COLORS.cream[50]}55`,
  },
  continueCopy: { paddingHorizontal: 12, paddingTop: 10, paddingBottom: 13 },
  continueTitle: { color: COLORS.cream[50], fontWeight: '700', fontSize: 14 },
  continueMeta: { color: COLORS.cream[200], fontSize: 11, marginTop: 3 },
  progressTrack: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 3, backgroundColor: COLORS.warmCharcoal[300] },
  progressBar: { height: 3, backgroundColor: COLORS.accent[500] },
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
  skeleton: {
    backgroundColor: COLORS.warmCharcoal[50],
    opacity: 0.32,
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
