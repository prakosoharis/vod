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
import { paymentService } from '../../services';
import { COLORS, THEME } from '../../constants';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

interface Rental {
  id: string;
  content_id: string;
  rented_at: string;
  expired_at: string;
  rental_price: {
    price: number;
    duration_hours: number;
  };
  content: {
    id: string;
    title: string;
    thumbnail_url: string;
    year?: number;
    genre?: string[];
  };
}

type Props = {
  navigation: NativeStackNavigationProp<any>;
};

const RentalHistoryScreen: React.FC<Props> = ({ navigation }) => {
  // Get user rentals
  const { data: rentals, isLoading, error } = useQuery({
    queryKey: ['user-rentals'],
    queryFn: () => paymentService.getMyRentals(),
  });

  const isExpired = (date: string) => new Date(date) < new Date();
  const isExpiringSoon = (date: string) => {
    const hoursUntilExpiry = Math.floor((new Date(date).getTime() - new Date().getTime()) / (1000 * 60 * 60));
    return hoursUntilExpiry <= 6 && hoursUntilExpiry > 0;
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const renderRentalItem = ({ item }: { item: Rental }) => {
    const expired = isExpired(item.expired_at);
    const expiringSoon = isExpiringSoon(item.expired_at);

    return (
      <View
        style={[
          styles.rentalItem,
          expired && styles.rentalItemExpired,
        ]}
      >
        <TouchableOpacity
          style={styles.rentalContent}
          onPress={() =>
            !expired && navigation.navigate('VideoPlayer', { contentId: item.content_id })
          }
          activeOpacity={0.7}
          disabled={expired}
        >
          <Image
            source={{ uri: item.content.thumbnail_url }}
            style={styles.thumbnail}
            resizeMode="cover"
          />
          <View style={styles.contentInfo}>
            <View style={styles.headerRow}>
              <Text style={styles.contentTitle} numberOfLines={1}>
                {item.content.title}
              </Text>
              {expired ? (
                <View style={styles.statusBadgeExpired}>
                  <Text style={styles.statusBadgeTextExpired}>Expired</Text>
                </View>
              ) : (
                <View style={styles.statusBadgeActive}>
                  <SafeIcon name="play-circle" size={12} color={COLORS.green[400]} />
                  <Text style={styles.statusBadgeTextActive}>Active</Text>
                </View>
              )}
            </View>

            <View style={styles.metadata}>
              <View style={styles.metadataItem}>
                <SafeIcon name="event" size={14} color={COLORS.cream[200]} />
                <Text style={styles.metadataText}>
                  {new Date(item.rented_at).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'short',
                  })}
                </Text>
              </View>
              <View style={styles.metadataItem}>
                <SafeIcon name="schedule" size={14} color={COLORS.cream[200]} />
                <Text
                  style={[
                    styles.metadataText,
                    expiringSoon && styles.expiringSoonText,
                  ]}
                >
                  {expired
                    ? 'Expired'
                    : new Date(item.expired_at).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                </Text>
              </View>
              <View style={styles.metadataItem}>
                <SafeIcon name="payments" size={14} color={COLORS.cream[200]} />
                <Text style={styles.metadataText}>
                  {formatPrice(item.rental_price.price)} • {item.rental_price.duration_hours}j
                </Text>
              </View>
            </View>

            {!expired && (
              <TouchableOpacity
                style={styles.watchButton}
                onPress={() => navigation.navigate('VideoPlayer', { contentId: item.content_id })}
              >
                <SafeIcon name="play-arrow" size={18} color={COLORS.cream[50]} />
                <Text style={styles.watchButtonText}>Tonton</Text>
              </TouchableOpacity>
            )}
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  if (isLoading) {
    return <LoadingSpinner fullScreen />;
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <SafeIcon name="error-outline" size={64} color={COLORS.accent[500]} />
        <Text style={styles.errorText}>Gagal memuat rental</Text>
        <Text style={styles.errorSubtext}>
          Terjadi kesalahan saat memuat riwayat rental
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
          <Text style={styles.headerTitle}>Film Disewa</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Content */}
        {!rentals || rentals.length === 0 ? (
          <View style={styles.emptyContainer}>
            <SafeIcon name="local-movies" size={80} color={COLORS.cream[200]} />
            <Text style={styles.emptyTitle}>Belum Ada Sewa</Text>
            <Text style={styles.emptyText}>
              Mulai sewa film favorit Anda mulai dari Rp 10.000!
            </Text>
            <TouchableOpacity
              style={styles.browseButton}
              onPress={() => navigation.navigate('MainTabs', { screen: 'Browse' })}
            >
              <Text style={styles.browseButtonText}>Jelajahi Film</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={rentals}
            keyExtractor={(item) => item.id}
            renderItem={renderRentalItem}
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
  rentalItem: {
    backgroundColor: COLORS.warmCharcoal[50],
    borderRadius: THEME.borderRadius.lg,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: `${COLORS.accent[500]}30`,
  },
  rentalItemExpired: {
    borderColor: `${COLORS.warmCharcoal[100]}80`,
    opacity: 0.6,
  },
  rentalContent: {
    flexDirection: 'row',
    padding: THEME.spacing.md,
  },
  thumbnail: {
    width: 80,
    height: 120,
    borderRadius: THEME.borderRadius.md,
    backgroundColor: COLORS.warmCharcoal[100],
  },
  contentInfo: {
    flex: 1,
    marginLeft: THEME.spacing.md,
    justifyContent: 'space-between',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: THEME.spacing.xs,
  },
  contentTitle: {
    flex: 1,
    fontSize: THEME.typography.fontSize.md,
    fontWeight: THEME.typography.fontWeight.semibold,
    color: COLORS.cream[50],
    marginRight: THEME.spacing.xs,
  },
  statusBadgeActive: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${COLORS.green[500]}20`,
    paddingHorizontal: THEME.spacing.sm,
    paddingVertical: 2,
    borderRadius: THEME.borderRadius.sm,
    borderWidth: 1,
    borderColor: `${COLORS.green[500]}40`,
  },
  statusBadgeTextActive: {
    fontSize: THEME.typography.fontSize.xs,
    color: COLORS.green[400],
    fontWeight: THEME.typography.fontWeight.semibold,
    marginLeft: 2,
  },
  statusBadgeExpired: {
    backgroundColor: `${COLORS.red[500]}20`,
    paddingHorizontal: THEME.spacing.sm,
    paddingVertical: 2,
    borderRadius: THEME.borderRadius.sm,
    borderWidth: 1,
    borderColor: `${COLORS.red[500]}40`,
  },
  statusBadgeTextExpired: {
    fontSize: THEME.typography.fontSize.xs,
    color: COLORS.red[400],
    fontWeight: THEME.typography.fontWeight.semibold,
  },
  metadata: {
    gap: THEME.spacing.xs,
  },
  metadataItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metadataText: {
    fontSize: THEME.typography.fontSize.xs,
    color: COLORS.cream[200],
    marginLeft: THEME.spacing.xs,
  },
  expiringSoonText: {
    color: COLORS.yellow[400],
    fontWeight: THEME.typography.fontWeight.semibold,
  },
  watchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: COLORS.accent[500],
    paddingHorizontal: THEME.spacing.md,
    paddingVertical: THEME.spacing.xs,
    borderRadius: THEME.borderRadius.full,
    marginTop: THEME.spacing.sm,
  },
  watchButtonText: {
    fontSize: THEME.typography.fontSize.sm,
    fontWeight: THEME.typography.fontWeight.semibold,
    color: COLORS.cream[50],
    marginLeft: THEME.spacing.xs,
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

export default RentalHistoryScreen;
