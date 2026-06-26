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
import { contentService, Content } from '../../services';
import { COLORS, THEME } from '../../constants';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

interface UpcomingContent extends Content {
  release_date?: string;
}

type Props = {
  navigation: NativeStackNavigationProp<any>;
};

const UpcomingScreen: React.FC<Props> = ({ navigation }) => {
  // For now, we'll use getNewReleases as a placeholder
  // In a real implementation, you'd have a specific endpoint for upcoming content
  const { data: upcomingContent, isLoading, error } = useQuery({
    queryKey: ['upcoming-content'],
    queryFn: async () => {
      // Placeholder - using new releases as upcoming
      // In production, this should call a dedicated API endpoint
      const response = await contentService.getAllContent({ limit: 20 });
      // Simulate upcoming content by adding release dates
      return response.data.map((item, index) => ({
        ...item,
        release_date: new Date(Date.now() + index * 86400000 * (Math.random() * 30 + 1)).toISOString(),
      })) as UpcomingContent[];
    },
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Hari ini';
    if (diffDays === 1) return 'Besok';
    if (diffDays < 7) return `${diffDays} hari lagi`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} minggu lagi`;

    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const renderContentItem = ({ item }: { item: UpcomingContent }) => (
    <TouchableOpacity
      style={styles.contentItem}
      onPress={() => navigation.navigate('ContentDetail', { content: item })}
      activeOpacity={0.7}
    >
      <Image
        source={{ uri: item.thumbnail_url }}
        style={styles.thumbnail}
        resizeMode="cover"
      />
      <View style={styles.contentInfo}>
        <Text style={styles.contentTitle} numberOfLines={2}>
          {item.title}
        </Text>
        {item.description && (
          <Text style={styles.contentDescription} numberOfLines={2}>
            {item.description}
          </Text>
        )}
        {item.release_date && (
          <View style={styles.releaseDateContainer}>
            <SafeIcon name="event" size={14} color={COLORS.accent[500]} />
            <Text style={styles.releaseDate}>{formatDate(item.release_date)}</Text>
          </View>
        )}
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
      <SafeIcon name="notifications-none" size={24} color={COLORS.cream[200]} />
    </TouchableOpacity>
  );

  if (isLoading) {
    return <LoadingSpinner fullScreen />;
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <SafeIcon name="error-outline" size={64} color={COLORS.accent[500]} />
        <Text style={styles.errorText}>Gagal memuat konten</Text>
        <Text style={styles.errorSubtext}>
          Terjadi kesalahan saat memuat konten yang akan datang
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
          <Text style={styles.headerTitle}>Akan Datang</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Info Banner */}
        <View style={styles.infoBanner}>
          <SafeIcon name="info" size={20} color={COLORS.accent[400]} />
          <Text style={styles.infoBannerText}>
            Film premieres, live comedy shows, dan acara spesial yang akan datang
          </Text>
        </View>

        {/* Content */}
        {!upcomingContent || upcomingContent.length === 0 ? (
          <View style={styles.emptyContainer}>
            <SafeIcon name="event" size={80} color={COLORS.cream[200]} />
            <Text style={styles.emptyTitle}>Coming Soon</Text>
            <Text style={styles.emptyText}>
              Event calendar akan hadir segera. Stay tuned!
            </Text>
          </View>
        ) : (
          <FlatList
            data={upcomingContent}
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
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${COLORS.accent[500]}10`,
    paddingHorizontal: THEME.spacing.lg,
    paddingVertical: THEME.spacing.md,
    marginHorizontal: THEME.spacing.lg,
    marginTop: THEME.spacing.md,
    borderRadius: THEME.borderRadius.md,
    borderWidth: 1,
    borderColor: `${COLORS.accent[500]}30`,
  },
  infoBannerText: {
    flex: 1,
    fontSize: THEME.typography.fontSize.sm,
    color: COLORS.accent[400],
    marginLeft: THEME.spacing.md,
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
  thumbnail: {
    width: 100,
    height: 150,
    backgroundColor: COLORS.warmCharcoal[100],
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
  contentDescription: {
    fontSize: THEME.typography.fontSize.sm,
    color: COLORS.cream[200],
    marginBottom: THEME.spacing.xs,
  },
  releaseDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: THEME.spacing.xs,
  },
  releaseDate: {
    fontSize: THEME.typography.fontSize.sm,
    color: COLORS.accent[500],
    fontWeight: THEME.typography.fontWeight.semibold,
    marginLeft: THEME.spacing.xs,
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

export default UpcomingScreen;
