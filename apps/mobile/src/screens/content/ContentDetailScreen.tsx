import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  StatusBar,
  Dimensions,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import LinearGradient from 'react-native-linear-gradient';
import { SafeIcon } from '../../components/ui';
import PaymentOptionsModal from '../../components/payment/PaymentOptionsModal';
import { RootStackParamList } from '../../types';
import { COLORS, THEME } from '../../constants';
import { contentService, paymentService, userService, PaymentResponse } from '../../services';
import { useAuthStore } from '../../store/authStore';

type Props = NativeStackScreenProps<RootStackParamList, 'ContentDetail'>;

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const hasActiveRentalForContent = (rentals: any[], contentId: string): boolean => {
  return rentals.some((rental) => {
    const expiry = rental.expired_at;
    return rental.content_id === contentId && expiry && new Date(expiry).getTime() > Date.now();
  });
};

const ContentDetailScreen: React.FC<Props> = ({ route, navigation }) => {
  const { content: initialContent } = route.params;
  const { isAuthenticated, user } = useAuthStore();
  const queryClient = useQueryClient();

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isCheckingAccess, setIsCheckingAccess] = useState(false);
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [selectedEpisodeId, setSelectedEpisodeId] = useState<string | undefined>();

  const { data: latestContent } = useQuery({
    queryKey: ['content', initialContent.id],
    queryFn: () => contentService.getContentById(initialContent.id),
    initialData: initialContent,
  });
  const content = latestContent || initialContent;
  const publishedEpisodes = (content.episodes || []).filter((episode) => episode.is_published);
  const seasons = [...new Set(publishedEpisodes.map((episode) => episode.season_number))].sort((a, b) => a - b);
  const selectedEpisode = publishedEpisodes.find((episode) => episode.id === selectedEpisodeId)
    || publishedEpisodes.find((episode) => episode.season_number === selectedSeason);

  useEffect(() => {
    if (content.type === 'SERIES' && seasons.length > 0 && !seasons.includes(selectedSeason)) {
      setSelectedSeason(seasons[0]);
      setSelectedEpisodeId(undefined);
    }
  }, [content.type, seasons, selectedSeason]);

  // Check if content is in watchlist
  const { data: isInWatchlist } = useQuery({
    queryKey: ['watchlist'],
    queryFn: () => userService.getWatchlist(),
    select: (watchlist: any[]) => watchlist.some((item: any) => item.id === content.id),
    enabled: isAuthenticated,
  });

  // Add to watchlist mutation
  const addToWatchlistMutation = useMutation({
    mutationFn: (contentId: string) => userService.addToWatchlist(contentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['watchlist'] });
      Alert.alert('Berhasil', 'Ditambahkan ke Daftar Saya');
    },
    onError: () => {
      Alert.alert('Gagal', 'Gagal menambahkan ke Daftar Saya');
    },
  });

  // Remove from watchlist mutation
  const removeFromWatchlistMutation = useMutation({
    mutationFn: (contentId: string) => userService.removeFromWatchlist(contentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['watchlist'] });
      Alert.alert('Berhasil', 'Dihapus dari Daftar Saya');
    },
    onError: () => {
      Alert.alert('Gagal', 'Gagal menghapus dari Daftar Saya');
    },
  });

  const handlePlayPress = async () => {
    // Check if user is authenticated
    if (!isAuthenticated) {
      Alert.alert(
        'Login Diperlukan',
        'Silakan login terlebih dahulu untuk menonton konten ini.',
        [
          {
            text: 'Batal',
            style: 'cancel',
          },
          {
            text: 'Login',
            onPress: () => {
              // Navigate to auth stack (user will be redirected to login)
              navigation.reset({
                index: 0,
                routes: [{ name: 'Auth' as any }],
              });
            },
          },
        ]
      );
      return;
    }

    try {
      setIsCheckingAccess(true);

      console.log('=== ACCESS CHECK START ===');
      console.log('Content ID:', content.id);
      console.log('User authenticated:', isAuthenticated);
      console.log('Mobile user:', JSON.stringify({
        id: user?.id,
        email: user?.email,
      }, null, 2));

      let contentAccessError: any = null;

      try {
        const accessInfo = await paymentService.checkContentAccess(content.id);

        console.log('=== CONTENT ACCESS CHECK ===');
        console.log('Raw access data:', JSON.stringify(accessInfo, null, 2));
        console.log('Has access:', accessInfo.has_access);
        console.log('Access type:', accessInfo.access_type);

        if (accessInfo.has_access) {
          console.log('✅ Content access granted via API');
          navigation.navigate('VideoPlayer', {
            contentId: content.id,
            episodeId: content.type === 'SERIES' ? selectedEpisode?.id : undefined,
          });
          return;
        } else {
          console.log('⚠️ No access via content check API');
        }
      } catch (accessError: any) {
        console.log('❌ Content access check failed:', accessError.message);
        contentAccessError = accessError;
      }

      const rentals = await paymentService.getMyRentals();
      console.log('=== RENTAL FALLBACK CHECK ===');
      console.log('Rental count:', rentals.length);
      console.log('Matching rental:', JSON.stringify(
        rentals.find((rental) => rental.content_id === content.id) || null,
        null,
        2
      ));

      if (hasActiveRentalForContent(rentals, content.id)) {
        console.log('✅ Content access granted via active rental fallback');
        navigation.navigate('VideoPlayer', {
          contentId: content.id,
          episodeId: content.type === 'SERIES' ? selectedEpisode?.id : undefined,
        });
        return;
      }

      if (contentAccessError) {
        throw contentAccessError;
      }

      // If we reach here, user doesn't have access - show payment modal
      console.log('=== NO ACCESS FOUND ===');
      console.log('Showing payment modal');
      setShowPaymentModal(true);

    } catch (error: any) {
      console.error('=== ACCESS CHECK ERROR ===');
      console.error('Error:', error.message);
      console.error('Details:', error);

      Alert.alert(
        'Gagal Memeriksa Akses',
        'Kami belum bisa memeriksa akses akun Anda. Silakan coba lagi.',
        [
          {
            text: 'Batal',
            style: 'cancel',
            onPress: () => setIsCheckingAccess(false),
          },
          {
            text: 'Coba Lagi',
            onPress: () => handlePlayPress(),
          },
        ]
      );
    } finally {
      setIsCheckingAccess(false);
    }
  };

  const handlePaymentSuccess = () => {
    // After successful payment, navigate to video player
    navigation.navigate('VideoPlayer', {
      contentId: content.id,
      episodeId: content.type === 'SERIES' ? selectedEpisode?.id : undefined,
    });
  };

  const handleRentalPaymentCreated = (paymentResponse: PaymentResponse) => {
    navigation.navigate('PaymentWebView', {
      url: paymentResponse.redirect_url!,
      orderId: paymentResponse.order_id,
      contentId: content.id,
      type: 'rental',
    });
  };

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleWatchlistPress = () => {
    if (!isAuthenticated) {
      Alert.alert(
        'Login Diperlukan',
        'Silakan login terlebih dahulu untuk menambahkan ke Daftar Saya.',
        [
          {
            text: 'Batal',
            style: 'cancel',
          },
          {
            text: 'Login',
            onPress: () => {
              navigation.reset({
                index: 0,
                routes: [{ name: 'Auth' as any }],
              });
            },
          },
        ]
      );
      return;
    }

    if (isInWatchlist) {
      removeFromWatchlistMutation.mutate(content.id);
    } else {
      addToWatchlistMutation.mutate(content.id);
    }
  };

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.warmCharcoal[100]} />
      <View style={styles.container}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Backdrop Image with Gradient */}
          <View style={styles.backdropContainer}>
            <Image
              source={{ uri: content.backdrop_url || content.thumbnail_url }}
              style={styles.backdropImage}
              resizeMode="cover"
            />
            <LinearGradient
              colors={[
                'transparent',
                `${COLORS.warmCharcoal[100]}40`,
                `${COLORS.warmCharcoal[100]}DD`,
                COLORS.warmCharcoal[100],
              ]}
              style={styles.backdropGradient}
            />

            {/* Back Button */}
            <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
              <SafeIcon name="arrow-back" size={24} color={COLORS.cream[50]} />
            </TouchableOpacity>
          </View>

          {/* Content Details */}
          <View style={styles.contentSection}>
            {/* Title */}
            <Text style={styles.title}>{content.title}</Text>

            {/* Metadata Row */}
            <View style={styles.metadataRow}>
              {content.year && (
                <Text style={styles.metadataText}>{content.year}</Text>
              )}
              {content.year && content.rating && (
                <Text style={styles.metadataDot}>•</Text>
              )}
              {content.rating && (
                <View style={styles.ratingContainer}>
                  <SafeIcon name="star" size={16} color={COLORS.accent[500]} />
                  <Text style={styles.ratingText}>{content.rating}</Text>
                </View>
              )}
              {content.duration && (
                <>
                  <Text style={styles.metadataDot}>•</Text>
                  <Text style={styles.metadataText}>{content.duration}</Text>
                </>
              )}
            </View>

            {/* Genre Tags */}
            {content.genre && content.genre.length > 0 && (
              <View style={styles.genreContainer}>
                {content.genre.map((genre, index) => (
                  <View key={index} style={styles.genreTag}>
                    <Text style={styles.genreText}>{genre}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Action Buttons */}
            <View style={styles.actionsContainer}>
              {content.trailer_url && (
                <TouchableOpacity
                  style={styles.trailerButton}
                  onPress={() => navigation.navigate('VideoPlayer', {
                    contentId: content.id,
                    previewUrl: content.trailer_url!,
                    previewTitle: `Trailer · ${content.title}`,
                  })}
                >
                  <SafeIcon name="play-circle-outline" size={22} color={COLORS.cream[50]} />
                  <Text style={styles.trailerButtonText}>Putar Trailer</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={styles.playButton}
                onPress={handlePlayPress}
                activeOpacity={0.8}
                disabled={isCheckingAccess}
              >
                <LinearGradient
                  colors={[COLORS.accent[500], COLORS.accent[600]]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.playButtonGradient}
                >
                  {isCheckingAccess ? (
                    <>
                      <ActivityIndicator size="small" color={COLORS.cream[50]} />
                      <Text style={styles.playButtonText}>Memeriksa Akses...</Text>
                    </>
                  ) : (
                    <>
                      <SafeIcon name="play-arrow" size={28} color={COLORS.cream[50]} />
                      <Text style={styles.playButtonText}>Tonton Sekarang</Text>
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              <View style={styles.secondaryActions}>
                <TouchableOpacity
                  style={styles.iconButton}
                  onPress={handleWatchlistPress}
                  disabled={!isAuthenticated || addToWatchlistMutation.isPending || removeFromWatchlistMutation.isPending}
                >
                  <SafeIcon
                    name={isInWatchlist ? 'check' : 'add'}
                    size={28}
                    color={isInWatchlist ? COLORS.accent[500] : COLORS.cream[50]}
                  />
                  <Text style={[styles.iconButtonLabel, isInWatchlist && styles.iconButtonLabelActive]}>
                    {isInWatchlist ? 'Ditambahkan' : 'Daftar Saya'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.iconButton}>
                  <SafeIcon name="share" size={28} color={COLORS.cream[50]} />
                  <Text style={styles.iconButtonLabel}>Bagikan</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.iconButton}>
                  <SafeIcon name="download" size={28} color={COLORS.cream[50]} />
                  <Text style={styles.iconButtonLabel}>Unduh</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Description */}
            {content.description && (
              <View style={styles.descriptionContainer}>
                <Text style={styles.sectionTitle}>Sinopsis</Text>
                <Text style={styles.description}>{content.description}</Text>
              </View>
            )}

            {content.type === 'SERIES' && publishedEpisodes.length > 0 && (
              <View style={styles.episodesContainer}>
                <Text style={styles.sectionTitle}>Episode</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.seasonList}>
                  {seasons.map((season) => (
                    <TouchableOpacity
                      key={season}
                      style={[styles.seasonChip, selectedSeason === season && styles.seasonChipActive]}
                      onPress={() => {
                        setSelectedSeason(season);
                        setSelectedEpisodeId(undefined);
                      }}
                    >
                      <Text style={[styles.seasonText, selectedSeason === season && styles.seasonTextActive]}>
                        Season {season}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
                {publishedEpisodes
                  .filter((episode) => episode.season_number === selectedSeason)
                  .sort((a, b) => a.episode_number - b.episode_number)
                  .map((episode) => (
                    <TouchableOpacity
                      key={episode.id}
                      style={[
                        styles.episodeCard,
                        selectedEpisode?.id === episode.id && styles.episodeCardActive,
                      ]}
                      onPress={() => setSelectedEpisodeId(episode.id)}
                    >
                      <View style={styles.episodeNumber}>
                        <Text style={styles.episodeNumberText}>{episode.episode_number}</Text>
                      </View>
                      <View style={styles.episodeInfo}>
                        <Text style={styles.episodeTitle}>{episode.title}</Text>
                        {!!episode.duration && <Text style={styles.episodeDuration}>{episode.duration}</Text>}
                      </View>
                      <SafeIcon name="play-arrow" size={22} color={COLORS.accent[400]} />
                    </TouchableOpacity>
                  ))}
              </View>
            )}

            {/* Cast */}
            {content.cast && content.cast.length > 0 && (
              <View style={styles.castContainer}>
                <Text style={styles.sectionTitle}>Pemain</Text>
                <View style={styles.castList}>
                  {content.cast.map((member, index) => (
                    <View key={index} style={styles.castItem}>
                      <SafeIcon name="person" size={20} color={COLORS.cream[200]} />
                      <View style={styles.castInfo}>
                        <Text style={styles.castName}>{member.name}</Text>
                        <Text style={styles.castRole}>{member.role}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Content Type Badge */}
            <View style={styles.typeBadgeContainer}>
              <View style={styles.typeBadge}>
                <SafeIcon
                  name={content.type === 'MOVIE' ? 'movie' : 'tv'}
                  size={18}
                  color={COLORS.accent[500]}
                />
                <Text style={styles.typeBadgeText}>
                  {content.type === 'MOVIE' ? 'Film' : 'Serial'}
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </View>

      {/* Payment Options Modal */}
      <PaymentOptionsModal
        visible={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        contentId={content.id}
        contentTitle={content.title}
        price={content.rental_price?.price}
        durationHours={content.rental_price?.duration_hours}
        onPaymentSuccess={handlePaymentSuccess}
        onRentalPaymentCreated={handleRentalPaymentCreated}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.warmCharcoal[100],
  },
  scrollContent: {
    paddingBottom: THEME.spacing.xxl,
  },
  backdropContainer: {
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH * 0.6,
    position: 'relative',
  },
  backdropImage: {
    width: '100%',
    height: '100%',
  },
  backdropGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '70%',
  },
  backButton: {
    position: 'absolute',
    top: THEME.spacing.lg,
    left: THEME.spacing.lg,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: `${COLORS.warmCharcoal[50]}CC`,
    justifyContent: 'center',
    alignItems: 'center',
    ...THEME.shadows.medium,
  },
  contentSection: {
    paddingHorizontal: THEME.spacing.lg,
    marginTop: -THEME.spacing.xl,
  },
  title: {
    fontSize: 32,
    fontWeight: THEME.typography.fontWeight.bold,
    color: COLORS.cream[50],
    marginBottom: THEME.spacing.md,
    letterSpacing: 0.5,
  },
  metadataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: THEME.spacing.md,
    gap: THEME.spacing.sm,
  },
  metadataText: {
    fontSize: THEME.typography.fontSize.sm,
    color: COLORS.cream[200],
    fontWeight: THEME.typography.fontWeight.medium,
  },
  metadataDot: {
    fontSize: THEME.typography.fontSize.sm,
    color: COLORS.cream[200],
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: THEME.typography.fontSize.sm,
    color: COLORS.cream[100],
    fontWeight: THEME.typography.fontWeight.semibold,
  },
  genreContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: THEME.spacing.sm,
    marginBottom: THEME.spacing.xl,
  },
  genreTag: {
    backgroundColor: `${COLORS.accent[500]}30`,
    paddingHorizontal: THEME.spacing.md,
    paddingVertical: THEME.spacing.xs,
    borderRadius: THEME.borderRadius.full,
    borderWidth: 1,
    borderColor: `${COLORS.accent[400]}50`,
  },
  genreText: {
    fontSize: THEME.typography.fontSize.xs,
    color: COLORS.accent[300],
    fontWeight: THEME.typography.fontWeight.semibold,
    letterSpacing: 0.5,
  },
  actionsContainer: {
    marginBottom: THEME.spacing.xl,
  },
  trailerButton: {
    minHeight: 48,
    marginBottom: THEME.spacing.md,
    borderRadius: THEME.borderRadius.full,
    borderWidth: 1,
    borderColor: `${COLORS.cream[100]}35`,
    backgroundColor: `${COLORS.cream[50]}12`,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: THEME.spacing.sm,
  },
  trailerButtonText: {
    color: COLORS.cream[50],
    fontWeight: THEME.typography.fontWeight.semibold,
  },
  episodesContainer: {
    marginBottom: THEME.spacing.xl,
  },
  seasonList: {
    marginBottom: THEME.spacing.md,
  },
  seasonChip: {
    paddingVertical: THEME.spacing.sm,
    paddingHorizontal: THEME.spacing.md,
    marginRight: THEME.spacing.sm,
    borderRadius: THEME.borderRadius.full,
    backgroundColor: COLORS.warmCharcoal[50],
    borderWidth: 1,
    borderColor: `${COLORS.cream[200]}25`,
  },
  seasonChipActive: {
    backgroundColor: COLORS.accent[500],
    borderColor: COLORS.accent[500],
  },
  seasonText: {
    color: COLORS.cream[200],
    fontWeight: THEME.typography.fontWeight.semibold,
  },
  seasonTextActive: {
    color: COLORS.cream[50],
  },
  episodeCard: {
    minHeight: 68,
    flexDirection: 'row',
    alignItems: 'center',
    padding: THEME.spacing.md,
    marginBottom: THEME.spacing.sm,
    borderRadius: THEME.borderRadius.md,
    backgroundColor: COLORS.warmCharcoal[50],
    borderWidth: 1,
    borderColor: 'transparent',
  },
  episodeCardActive: {
    borderColor: COLORS.accent[500],
    backgroundColor: `${COLORS.accent[500]}18`,
  },
  episodeNumber: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: `${COLORS.accent[500]}25`,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: THEME.spacing.md,
  },
  episodeNumberText: {
    color: COLORS.accent[300],
    fontWeight: THEME.typography.fontWeight.bold,
  },
  episodeInfo: {
    flex: 1,
  },
  episodeTitle: {
    color: COLORS.cream[50],
    fontWeight: THEME.typography.fontWeight.semibold,
  },
  episodeDuration: {
    color: COLORS.cream[200],
    fontSize: THEME.typography.fontSize.xs,
    marginTop: 3,
  },
  playButton: {
    borderRadius: THEME.borderRadius.full,
    overflow: 'hidden',
    marginBottom: THEME.spacing.lg,
    ...THEME.shadows.large,
  },
  playButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: THEME.spacing.lg,
    paddingHorizontal: THEME.spacing.xl,
    gap: THEME.spacing.sm,
  },
  playButtonText: {
    fontSize: THEME.typography.fontSize.lg,
    fontWeight: THEME.typography.fontWeight.bold,
    color: COLORS.cream[50],
    letterSpacing: 0.5,
  },
  secondaryActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: THEME.spacing.md,
  },
  iconButton: {
    alignItems: 'center',
    gap: THEME.spacing.xs,
  },
  iconButtonLabel: {
    fontSize: THEME.typography.fontSize.xs,
    color: COLORS.cream[200],
    fontWeight: THEME.typography.fontWeight.medium,
  },
  iconButtonLabelActive: {
    color: COLORS.accent[400],
  },
  descriptionContainer: {
    marginBottom: THEME.spacing.xl,
  },
  sectionTitle: {
    fontSize: THEME.typography.fontSize.lg,
    fontWeight: THEME.typography.fontWeight.bold,
    color: COLORS.cream[50],
    marginBottom: THEME.spacing.md,
    letterSpacing: 0.3,
  },
  description: {
    fontSize: THEME.typography.fontSize.md,
    color: COLORS.cream[100],
    lineHeight: THEME.typography.lineHeight.relaxed * THEME.typography.fontSize.md,
    opacity: 0.95,
  },
  castContainer: {
    marginBottom: THEME.spacing.xl,
  },
  castList: {
    gap: THEME.spacing.md,
  },
  castItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: THEME.spacing.md,
    backgroundColor: `${COLORS.warmCharcoal[50]}60`,
    padding: THEME.spacing.md,
    borderRadius: THEME.borderRadius.md,
  },
  castInfo: {
    flex: 1,
  },
  castName: {
    fontSize: THEME.typography.fontSize.md,
    color: COLORS.cream[50],
    fontWeight: THEME.typography.fontWeight.semibold,
    marginBottom: 2,
  },
  castRole: {
    fontSize: THEME.typography.fontSize.sm,
    color: COLORS.cream[200],
  },
  typeBadgeContainer: {
    alignItems: 'center',
    marginTop: THEME.spacing.lg,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: THEME.spacing.xs,
    backgroundColor: `${COLORS.warmCharcoal[50]}80`,
    paddingHorizontal: THEME.spacing.lg,
    paddingVertical: THEME.spacing.sm,
    borderRadius: THEME.borderRadius.full,
    borderWidth: 1,
    borderColor: `${COLORS.accent[500]}40`,
  },
  typeBadgeText: {
    fontSize: THEME.typography.fontSize.sm,
    color: COLORS.cream[100],
    fontWeight: THEME.typography.fontWeight.medium,
  },
});

export default ContentDetailScreen;
