import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeIcon } from '../../components/ui';
import { paymentService, Subscription, SubscriptionPlan } from '../../services';
import { COLORS, THEME } from '../../constants';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

type Props = {
  navigation: NativeStackNavigationProp<any>;
};

const SubscriptionScreen: React.FC<Props> = ({ navigation }) => {
  const queryClient = useQueryClient();

  // Get user subscription
  const { data: subscription, isLoading: loadingSubscription } = useQuery({
    queryKey: ['user-subscription'],
    queryFn: () => paymentService.getMySubscription(),
  });

  // Get subscription plans
  const { data: plans } = useQuery({
    queryKey: ['subscription-plans'],
    queryFn: () => paymentService.getSubscriptionPlans(),
  });

  // Cancel subscription mutation
  const cancelMutation = useMutation({
    mutationFn: () => paymentService.cancelSubscription(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-subscription'] });
      Alert.alert('Berhasil', 'Langganan berhasil dibatalkan. Auto-renew dimatikan.');
    },
    onError: () => {
      Alert.alert('Gagal', 'Gagal membatalkan langganan. Silakan coba lagi.');
    },
  });

  const handleCancelSubscription = () => {
    Alert.alert(
      'Batalkan Langganan',
      'Apakah Anda yakin ingin membatalkan langganan? Anda masih bisa mengakses konten hingga periode berakhir.',
      [
        {
          text: 'Batal',
          style: 'cancel',
        },
        {
          text: 'Batalkan',
          style: 'destructive',
          onPress: () => cancelMutation.mutate(),
        },
      ]
    );
  };

  const isExpired = (date: string) => new Date(date) < new Date();
  const isExpiringSoon = (date: string) => {
    const daysUntilExpiry = Math.floor((new Date(date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 7 && daysUntilExpiry > 0;
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  if (loadingSubscription) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.warmCharcoal[100]} />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <SafeIcon name="arrow-back" size={24} color={COLORS.cream[50]} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Langganan Saya</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.content}>
          {subscription ? (
            <>
              {/* Status Badge */}
              <View style={styles.statusBadges}>
                <View style={styles.statusBadgeActive}>
                  <SafeIcon name="check-circle" size={16} color={COLORS.accent[500]} />
                  <Text style={styles.statusBadgeTextActive}>
                    {isExpired(subscription.end_date) ? 'Expired' : 'Active'}
                  </Text>
                </View>
                {!subscription.auto_renew && (
                  <View style={styles.statusBadgeWarning}>
                    <SafeIcon name="info" size={16} color={COLORS.yellow[400]} />
                    <Text style={styles.statusBadgeTextWarning}>Auto-renew OFF</Text>
                  </View>
                )}
              </View>

              {/* Plan Card */}
              <View style={styles.planCard}>
                <View style={styles.planHeader}>
                  <SafeIcon name="workspace-premium" size={48} color={COLORS.accent[500]} />
                  <Text style={styles.planName}>
                    {plans?.find(p => p.id === subscription.plan_id)?.name || 'VOD Unlimited'}
                  </Text>
                  <Text style={styles.planDescription}>
                    {plans?.find(p => p.id === subscription.plan_id)?.description || 'Akses unlimited ke semua konten'}
                  </Text>
                </View>

                {/* Details */}
                <View style={styles.detailsContainer}>
                  <View style={styles.detailRow}>
                    <View style={styles.detailIcon}>
                      <SafeIcon name="event" size={20} color={COLORS.accent[400]} />
                    </View>
                    <View style={styles.detailInfo}>
                      <Text style={styles.detailLabel}>Mulai</Text>
                      <Text style={styles.detailValue}>
                        {new Date(subscription.start_date).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.detailRow}>
                    <View style={styles.detailIcon}>
                      <SafeIcon name="schedule" size={20} color={COLORS.accent[400]} />
                    </View>
                    <View style={styles.detailInfo}>
                      <Text style={styles.detailLabel}>Berakhir</Text>
                      <Text
                        style={[
                          styles.detailValue,
                          isExpiringSoon(subscription.end_date) && styles.expiringSoonText,
                        ]}
                      >
                        {new Date(subscription.end_date).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </Text>
                    </View>
                  </View>

                  {plans?.find(p => p.id === subscription.plan_id) && (
                    <View style={styles.detailRow}>
                      <View style={styles.detailIcon}>
                        <SafeIcon name="payments" size={20} color={COLORS.accent[400]} />
                      </View>
                      <View style={styles.detailInfo}>
                        <Text style={styles.detailLabel}>Harga</Text>
                        <Text style={styles.detailValue}>
                          {formatPrice(plans.find(p => p.id === subscription.plan_id)!.price)} / bulan
                        </Text>
                      </View>
                    </View>
                  )}
                </View>

                {/* Actions */}
                {subscription.auto_renew && !isExpired(subscription.end_date) && (
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={handleCancelSubscription}
                    disabled={cancelMutation.isPending}
                  >
                    <Text style={styles.cancelButtonText}>
                      {cancelMutation.isPending ? 'Memproses...' : 'Batalkan Langganan'}
                    </Text>
                  </TouchableOpacity>
                )}

                {!subscription.auto_renew && (
                  <View style={styles.noticeBox}>
                    <SafeIcon name="info" size={20} color={COLORS.yellow[400]} />
                    <Text style={styles.noticeText}>
                      Langganan tidak akan diperpanjang otomatis. Anda masih bisa mengakses hingga{' '}
                      {new Date(subscription.end_date).toLocaleDateString('id-ID')}.
                    </Text>
                  </View>
                )}
              </View>
            </>
          ) : (
            <>
              {/* No Subscription */}
              <View style={styles.emptyContainer}>
                <SafeIcon name="workspace-premium" size={80} color={COLORS.cream[200]} />
                <Text style={styles.emptyTitle}>Belum Berlangganan</Text>
                <Text style={styles.emptyText}>
                  Berlangganan untuk akses unlimited ke semua film dan serial!
                </Text>
                <TouchableOpacity
                  style={styles.subscribeButton}
                  onPress={() => navigation.navigate('Pricing')}
                >
                  <Text style={styles.subscribeButtonText}>Lihat Paket Langganan</Text>
                </TouchableOpacity>
              </View>
            </>
          )}

          {/* Features */}
          {plans && plans.length > 0 && (
            <View style={styles.featuresContainer}>
              <Text style={styles.featuresTitle}>Manfaat Berlangganan</Text>
              {plans[0].features.map((feature, index) => (
                <View key={index} style={styles.featureItem}>
                  <SafeIcon name="check-circle" size={20} color={COLORS.accent[500]} />
                  <Text style={styles.featureText}>{feature}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
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
  content: {
    padding: THEME.spacing.lg,
  },
  statusBadges: {
    flexDirection: 'row',
    gap: THEME.spacing.sm,
    marginBottom: THEME.spacing.lg,
  },
  statusBadgeActive: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${COLORS.green[500]}20`,
    paddingHorizontal: THEME.spacing.md,
    paddingVertical: THEME.spacing.xs,
    borderRadius: THEME.borderRadius.full,
    borderWidth: 1,
    borderColor: `${COLORS.green[500]}40`,
  },
  statusBadgeTextActive: {
    fontSize: THEME.typography.fontSize.sm,
    color: COLORS.green[400],
    fontWeight: THEME.typography.fontWeight.semibold,
    marginLeft: THEME.spacing.xs,
  },
  statusBadgeWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${COLORS.yellow[500]}20`,
    paddingHorizontal: THEME.spacing.md,
    paddingVertical: THEME.spacing.xs,
    borderRadius: THEME.borderRadius.full,
    borderWidth: 1,
    borderColor: `${COLORS.yellow[500]}40`,
  },
  statusBadgeTextWarning: {
    fontSize: THEME.typography.fontSize.sm,
    color: COLORS.yellow[400],
    fontWeight: THEME.typography.fontWeight.semibold,
    marginLeft: THEME.spacing.xs,
  },
  planCard: {
    backgroundColor: COLORS.warmCharcoal[50],
    borderRadius: THEME.borderRadius.lg,
    padding: THEME.spacing.xl,
    borderWidth: 2,
    borderColor: `${COLORS.accent[500]}30`,
  },
  planHeader: {
    alignItems: 'center',
    marginBottom: THEME.spacing.xl,
  },
  planName: {
    fontSize: THEME.typography.fontSize.xxl,
    fontWeight: THEME.typography.fontWeight.bold,
    color: COLORS.cream[50],
    marginTop: THEME.spacing.md,
    marginBottom: THEME.spacing.sm,
  },
  planDescription: {
    fontSize: THEME.typography.fontSize.md,
    color: COLORS.cream[200],
    textAlign: 'center',
  },
  detailsContainer: {
    gap: THEME.spacing.md,
    marginBottom: THEME.spacing.xl,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${COLORS.warmCharcoal[100]}60`,
    padding: THEME.spacing.md,
    borderRadius: THEME.borderRadius.md,
  },
  detailIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${COLORS.accent[500]}20`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: THEME.spacing.md,
  },
  detailInfo: {
    flex: 1,
  },
  detailLabel: {
    fontSize: THEME.typography.fontSize.sm,
    color: COLORS.cream[200],
    marginBottom: 2,
  },
  detailValue: {
    fontSize: THEME.typography.fontSize.md,
    color: COLORS.cream[50],
    fontWeight: THEME.typography.fontWeight.semibold,
  },
  expiringSoonText: {
    color: COLORS.yellow[400],
  },
  cancelButton: {
    backgroundColor: `${COLORS.warmCharcoal[100]}80`,
    paddingVertical: THEME.spacing.md,
    borderRadius: THEME.borderRadius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: `${COLORS.cream[200]}30`,
  },
  cancelButtonText: {
    fontSize: THEME.typography.fontSize.md,
    fontWeight: THEME.typography.fontWeight.semibold,
    color: COLORS.cream[50],
  },
  noticeBox: {
    flexDirection: 'row',
    backgroundColor: `${COLORS.yellow[500]}10`,
    padding: THEME.spacing.md,
    borderRadius: THEME.borderRadius.md,
    borderWidth: 1,
    borderColor: `${COLORS.yellow[500]}30`,
    alignItems: 'center',
  },
  noticeText: {
    flex: 1,
    fontSize: THEME.typography.fontSize.sm,
    color: COLORS.yellow[400],
    marginLeft: THEME.spacing.sm,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: THEME.spacing.xxl,
    paddingHorizontal: THEME.spacing.xl,
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
  subscribeButton: {
    backgroundColor: COLORS.accent[500],
    paddingHorizontal: THEME.spacing.xxl,
    paddingVertical: THEME.spacing.md,
    borderRadius: THEME.borderRadius.full,
  },
  subscribeButtonText: {
    fontSize: THEME.typography.fontSize.md,
    fontWeight: THEME.typography.fontWeight.semibold,
    color: COLORS.cream[50],
  },
  featuresContainer: {
    marginTop: THEME.spacing.xl,
    backgroundColor: COLORS.warmCharcoal[50],
    borderRadius: THEME.borderRadius.lg,
    padding: THEME.spacing.xl,
  },
  featuresTitle: {
    fontSize: THEME.typography.fontSize.lg,
    fontWeight: THEME.typography.fontWeight.bold,
    color: COLORS.cream[50],
    marginBottom: THEME.spacing.md,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: THEME.spacing.md,
  },
  featureText: {
    flex: 1,
    fontSize: THEME.typography.fontSize.md,
    color: COLORS.cream[100],
    marginLeft: THEME.spacing.md,
  },
});

export default SubscriptionScreen;
