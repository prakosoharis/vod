import React, { useState } from 'react';
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
import LinearGradient from 'react-native-linear-gradient';
import { SafeIcon } from '../../components/ui';
import PaymentOptionsModal from '../../components/payment/PaymentOptionsModal';
import { RootStackParamList } from '../../types';
import { COLORS, THEME } from '../../constants';
import { paymentService } from '../../services';
import { useAuthStore } from '../../store/authStore';

type Props = NativeStackScreenProps<RootStackParamList, 'ContentDetail'>;

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const ContentDetailScreen: React.FC<Props> = ({ route, navigation }) => {
  const { content } = route.params;
  const { isAuthenticated } = useAuthStore();

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isCheckingAccess, setIsCheckingAccess] = useState(false);

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

      // Check if user has access to this content
      const accessInfo = await paymentService.checkContentAccess(content.id);

      if (!accessInfo.data.has_access) {
        // User doesn't have access, show payment modal
        setShowPaymentModal(true);
        return;
      }

      // User has access, play video
      navigation.navigate('VideoPlayer', { contentId: content.id });
    } catch (error: any) {
      console.error('Access check error:', error);

      // On error, assume no access and show payment modal (safe fallback)
      setShowPaymentModal(true);
    } finally {
      setIsCheckingAccess(false);
    }
  };

  const handlePaymentSuccess = () => {
    // After successful payment, navigate to video player
    navigation.navigate('VideoPlayer', { contentId: content.id });
  };

  const handleNavigateToSubscription = () => {
    // Navigate to pricing/subscription screen
    navigation.navigate('Pricing' as any);
  };

  const handleBackPress = () => {
    navigation.goBack();
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
                <TouchableOpacity style={styles.iconButton}>
                  <SafeIcon name="add" size={28} color={COLORS.cream[50]} />
                  <Text style={styles.iconButtonLabel}>Daftar Saya</Text>
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
        onPaymentSuccess={handlePaymentSuccess}
        onNavigateToSubscription={handleNavigateToSubscription}
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
