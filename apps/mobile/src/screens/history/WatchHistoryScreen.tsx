import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar,
  Image,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeIcon } from '../../components/ui';
import { userService, ContentWithProgress } from '../../services';
import { COLORS, THEME } from '../../constants';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

type Props = {
  navigation: NativeStackNavigationProp<any>;
};

const WatchHistoryScreen: React.FC<Props> = ({ navigation }) => {
  // Fetch continue watching
  const { data: continueWatching, isLoading, error } = useQuery({
    queryKey: ['continue-watching'],
    queryFn: () => userService.getContinueWatching(),
  });

  const formatProgress = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours > 0) {
      return `${hours}j ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const formatLastWatched = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Hari ini';
    if (diffDays === 1) return 'Kemarin';
    if (diffDays < 7) return `${diffDays} hari yang lalu`;
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
  };

  const renderContentItem = ({ item }: { item: ContentWithProgress }) => {
    // Calculate progress percentage for progress bar
    // We'll estimate based on a typical content duration since duration_seconds isn't available
    const progressPercent = item.progress_seconds > 0 ? Math.min(100, (item.progress_seconds / 7200) * 100) : 0; // Assuming 2 hours as max duration

    return (
      <TouchableOpacity
        style={styles.contentItem}
        onPress={() => navigation.navigate('VideoPlayer', { contentId: item.id })}
        activeOpacity={0.7}
      >
        <View style={styles.thumbnailContainer}>
          <Image
            source={{ uri: item.thumbnail_url }}
            style={styles.thumbnail}
            resizeMode="cover"
          />
          {/* Play overlay */}
          <View style={styles.playOverlay}>
            <View style={styles.playButton}>
              <SafeIcon name="play-arrow" size={24} color={COLORS.cream[50]} />
            </View>
          </View>
          {/* Progress bar */}
          <View style={styles.progressBarContainer}>
            <View
              style={[
                styles.progressBar,
                { width: `${progressPercent}%` }
              ]}
            />
          </View>
        </View>
        <View style={styles.contentInfo}>
          <Text style={styles.contentTitle} numberOfLines={2}>
            {item.title}
          </Text>
          <Text style={styles.progressText}>
            {formatProgress(item.progress_seconds)} ditonton • {formatLastWatched(item.last_watched)}
          </Text>
          {item.genre && item.genre.length > 0 && (
            <View style={styles.genreContainer}>
              {item.genre.slice(0, 2).map((genre, index) => (
                <View key={index} style={styles.genreTag}>
                  <Text style={styles.genreText}>{genre}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
        <TouchableOpacity
          style={styles.moreButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <SafeIcon name="more-vert" size={24} color={COLORS.cream[200]} />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return <LoadingSpinner fullScreen />;
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <SafeIcon name="error-outline" size={64} color={COLORS.accent[500]} />
        <Text style={styles.errorText}>Gagal memuat riwayat</Text>
        <Text style={styles.errorSubtext}>
          Terjadi kesalahan saat memuat riwayat tontonan
        </Text>
      </View>
    );
  }

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.warmCharcoal[100]} />
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <SafeIcon name="arrow-back" size={24} color={COLORS.cream[50]} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Riwayat Tontonan</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Content */}
        {!continueWatching || continueWatching.length === 0 ? (
          <View style={styles.emptyContainer}>
            <SafeIcon name="history" size={80} color={COLORS.cream[200]} />
            <Text style={styles.emptyTitle}>Belum Ada Riwayat</Text>
            <Text style={styles.emptyText}>
              Mulai nonton film dan serial, riwayat akan muncul di sini
            </Text>
            <TouchableOpacity
              style={styles.browseButton}
              onPress={() => navigation.navigate('MainTabs', { screen: 'Browse' })}
            >
              <Text style={styles.browseButtonText}>Jelajahi Konten</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={continueWatching}
            keyExtractor={(item) => item.id}
            renderItem={renderContentItem}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
        )}
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.warmCharcoal[100],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: THEME.spacing.lg,
    paddingVertical: THEME.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.warmCharcoal[50],
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: THEME.typography.fontSize.xxl,
    fontWeight: THEME.typography.fontWeight.bold,
    color: COLORS.cream[50],
    flex: 1,
    textAlign: 'center',
  },
  listContent: {
    padding: THEME.spacing.lg,
  },
  contentItem: {
    flexDirection: 'row',
    backgroundColor: COLORS.warmCharcoal[50],
    borderRadius: THEME.borderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: `${COLORS.accent[500]}20`,
  },
  thumbnailContainer: {
    width: 140,
    height: 100,
    position: 'relative',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  playOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: `${COLORS.accent[500]}90`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressBarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: `${COLORS.cream[200]}30`,
  },
  progressBar: {
    height: '100%',
    backgroundColor: COLORS.accent[500],
  },
  contentInfo: {
    flex: 1,
    padding: THEME.spacing.md,
    justifyContent: 'center',
  },
  contentTitle: {
    fontSize: THEME.typography.fontSize.md,
    fontWeight: THEME.typography.fontWeight.semibold,
    color: COLORS.cream[50],
    marginBottom: THEME.spacing.xs,
  },
  progressText: {
    fontSize: THEME.typography.fontSize.xs,
    color: COLORS.cream[200],
    marginBottom: THEME.spacing.xs,
  },
  genreContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: THEME.spacing.xs,
  },
  genreTag: {
    backgroundColor: `${COLORS.accent[500]}30`,
    paddingHorizontal: THEME.spacing.xs,
    paddingVertical: 2,
    borderRadius: THEME.borderRadius.sm,
    borderWidth: 1,
    borderColor: `${COLORS.accent[400]}50`,
  },
  genreText: {
    fontSize: THEME.typography.fontSize.xs - 2,
    color: COLORS.accent[300],
    fontWeight: THEME.typography.fontWeight.medium,
  },
  moreButton: {
    width: 40,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: THEME.spacing.sm,
  },
  separator: {
    height: THEME.spacing.md,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: THEME.spacing.xxl,
  },
  emptyTitle: {
    fontSize: THEME.typography.fontSize.xxl,
    fontWeight: THEME.typography.fontWeight.bold,
    color: COLORS.cream[50],
    marginTop: THEME.spacing.lg,
    marginBottom: THEME.spacing.sm,
  },
  emptyText: {
    fontSize: THEME.typography.fontSize.md,
    color: COLORS.cream[200],
    textAlign: 'center',
    marginBottom: THEME.spacing.xxl,
  },
  browseButton: {
    backgroundColor: COLORS.accent[500],
    paddingHorizontal: THEME.spacing.xxl,
    paddingVertical: THEME.spacing.md,
    borderRadius: THEME.borderRadius.full,
  },
  browseButtonText: {
    fontSize: THEME.typography.fontSize.md,
    fontWeight: THEME.typography.fontWeight.semibold,
    color: COLORS.cream[50],
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: THEME.spacing.xl,
  },
  errorText: {
    fontSize: THEME.typography.fontSize.xl,
    color: COLORS.cream[50],
    fontWeight: THEME.typography.fontWeight.bold,
    marginTop: THEME.spacing.lg,
    marginBottom: THEME.spacing.sm,
  },
  errorSubtext: {
    fontSize: THEME.typography.fontSize.sm,
    color: COLORS.cream[200],
    textAlign: 'center',
  },
});

export default WatchHistoryScreen;
