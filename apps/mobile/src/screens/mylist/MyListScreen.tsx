import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar,
  Image,
  Alert,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SafeIcon } from '../../components/ui';
import { userService } from '../../services';
import { Content } from '../../types';
import { COLORS, THEME } from '../../constants';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const MyListScreen: React.FC<any> = ({ navigation, route }) => {
  const queryClient = useQueryClient();
  const isTab = route?.name === 'Collection';

  // Fetch watchlist
  const { data: watchlist, isLoading, error } = useQuery({
    queryKey: ['watchlist'],
    queryFn: () => userService.getWatchlist(),
  });

  // Remove from watchlist mutation
  const removeMutation = useMutation({
    mutationFn: (contentId: string) => userService.removeFromWatchlist(contentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['watchlist'] });
    },
  });

  const handleRemoveFromList = (contentId: string, contentTitle: string) => {
    Alert.alert(
      'Hapus dari Daftar',
      `Hapus "${contentTitle}" dari Daftar Saya?`,
      [
        {
          text: 'Batal',
          style: 'cancel',
        },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: () => removeMutation.mutate(contentId),
        },
      ]
    );
  };

  const renderContentItem = ({ item }: { item: Content }) => (
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
        <View style={styles.metadata}>
          {item.year && <Text style={styles.metadataText}>{item.year}</Text>}
          {item.year && item.rating && (
            <Text style={styles.metadataDot}>•</Text>
          )}
          {item.rating && (
            <View style={styles.ratingContainer}>
              <SafeIcon name="star" size={14} color={COLORS.accent[500]} />
              <Text style={styles.ratingText}>{item.rating}</Text>
            </View>
          )}
          {item.year && item.duration && (
            <Text style={styles.metadataDot}>•</Text>
          )}
          {item.duration && (
            <Text style={styles.metadataText}>{item.duration}</Text>
          )}
        </View>
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
        style={styles.removeButton}
        onPress={() => handleRemoveFromList(item.id, item.title)}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <SafeIcon name="close" size={20} color={COLORS.cream[200]} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  if (isLoading) {
    return <LoadingSpinner fullScreen />;
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <SafeIcon name="error-outline" size={64} color={COLORS.accent[500]} />
        <Text style={styles.errorText}>Gagal memuat daftar</Text>
        <Text style={styles.errorSubtext}>
          Terjadi kesalahan saat memuat daftar Anda
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
          {isTab ? <View style={styles.backButton} /> : (
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
              <SafeIcon name="arrow-back" size={24} color={COLORS.cream[50]} />
            </TouchableOpacity>
          )}
          <View style={styles.headerCopy}>
            <Text style={styles.headerEyebrow}>TERSIMPAN UNTUK ANDA</Text>
            <Text style={styles.headerTitle}>Koleksi</Text>
          </View>
          <View style={{ width: 40 }} />
        </View>

        {/* Content */}
        {!watchlist || watchlist.length === 0 ? (
          <View style={styles.emptyContainer}>
            <SafeIcon name="bookmark-border" size={80} color={COLORS.cream[200]} />
            <Text style={styles.emptyTitle}>Daftar Anda Kosong</Text>
            <Text style={styles.emptyText}>
              Tambahkan film dan serial favorit ke daftar Anda
            </Text>
            <TouchableOpacity
              style={styles.browseButton}
              onPress={() => isTab
                ? navigation.navigate('Browse')
                : navigation.navigate('Main', { screen: 'Browse' })}
            >
              <Text style={styles.browseButtonText}>Jelajahi Konten</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={watchlist}
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
    fontSize: 28,
    fontWeight: THEME.typography.fontWeight.bold,
    color: COLORS.cream[50],
    textAlign: 'center',
  },
  headerCopy: { flex: 1, alignItems: 'center' },
  headerEyebrow: { color: COLORS.accent[500], fontSize: 8, fontWeight: '800', letterSpacing: 1.4, marginBottom: 2 },
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
  metadata: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: THEME.spacing.xs,
  },
  metadataText: {
    fontSize: THEME.typography.fontSize.xs,
    color: COLORS.cream[200],
  },
  metadataDot: {
    fontSize: THEME.typography.fontSize.xs,
    color: COLORS.cream[200],
    marginHorizontal: THEME.spacing.xs,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: THEME.typography.fontSize.xs,
    color: COLORS.cream[200],
    marginLeft: 2,
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
  removeButton: {
    position: 'absolute',
    top: THEME.spacing.sm,
    right: THEME.spacing.sm,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: `${COLORS.warmCharcoal[100]}80`,
    justifyContent: 'center',
    alignItems: 'center',
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

export default MyListScreen;
