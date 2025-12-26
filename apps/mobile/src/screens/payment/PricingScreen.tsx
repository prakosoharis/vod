import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
  Alert,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { SafeIcon } from '../../components/ui';
import { paymentService, SubscriptionPlan } from '../../services';
import { COLORS, THEME, MIDTRANS_CONFIG } from '../../constants';
import { RootStackParamList } from '../../types';
import Midtrans from '../../modules/MidtransModule';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Pricing'>;
  route: RouteProp<RootStackParamList, 'Pricing'>;
};

const PricingScreen: React.FC<Props> = ({ navigation }) => {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Fetch subscription plans
  const { data: plans, isLoading, error } = useQuery({
    queryKey: ['subscription-plans'],
    queryFn: () => paymentService.getSubscriptionPlans(),
  });

  // Initialize Midtrans on mount
  useEffect(() => {
    const initMidtrans = async () => {
      try {
        console.log('Initializing Midtrans with config:', {
          clientKey: MIDTRANS_CONFIG.clientKey,
          merchantUrl: MIDTRANS_CONFIG.merchantBaseUrl,
          isProduction: MIDTRANS_CONFIG.isProduction,
        });
        await Midtrans.initialize(
          MIDTRANS_CONFIG.clientKey,
          MIDTRANS_CONFIG.merchantBaseUrl
        );
        console.log('Midtrans initialized successfully');
      } catch (error) {
        console.error('Failed to initialize Midtrans:', error);
      }
    };

    initMidtrans();

    return () => {
      Midtrans.cleanup();
    };
  }, []);

  const handleSubscribe = async (plan: SubscriptionPlan) => {
    setIsProcessing(true);
    setSelectedPlan(plan.id);

    try {
      // 1. Create payment session on backend
      const paymentResponse = await paymentService.subscribe(plan.id);

      // 2. Launch Midtrans payment UI
      const result = await Midtrans.startPayment(paymentResponse.snap_token);

      // 3. Handle payment result
      if (result.status === 'success') {
        // Verify payment with backend
        await paymentService.verifyPaymentStatus(paymentResponse.transaction_id);

        Alert.alert(
          'Berhasil!',
          'Pembayaran berhasil! Langganan Anda sudah aktif.',
          [
            {
              text: 'OK',
              onPress: () => {
                navigation.navigate('PaymentSuccess', {
                  transactionId: paymentResponse.transaction_id,
                  amount: paymentResponse.gross_amount,
                  type: 'subscription',
                });
              },
            },
          ]
        );
      } else if (result.status === 'pending') {
        Alert.alert(
          'Pending',
          'Pembayaran Anda sedang diproses. Kami akan memberitahu Anda setelah dikonfirmasi.',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      } else if (result.status === 'canceled') {
        Alert.alert('Dibatalkan', 'Pembayaran dibatalkan.', [{ text: 'OK' }]);
      } else {
        Alert.alert('Gagal', 'Pembayaran gagal. Silakan coba lagi.', [{ text: 'OK' }]);
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      Alert.alert('Error', error.message || 'Terjadi kesalahan. Silakan coba lagi.', [
        { text: 'OK' },
      ]);
    } finally {
      setIsProcessing(false);
      setSelectedPlan(null);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.accent[500]} />
        <Text style={styles.loadingText}>Memuat paket langganan...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <SafeIcon name="error-outline" size={64} color={COLORS.accent[500]} />
        <Text style={styles.errorText}>Gagal memuat paket</Text>
        <Text style={styles.errorSubtext}>Silakan coba lagi nanti</Text>
      </View>
    );
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
          <Text style={styles.headerTitle}>Pilih Paket Langganan</Text>
        </View>

        {/* Plans */}
        <View style={styles.plansContainer}>
          {plans?.map((plan) => (
            <View key={plan.id} style={styles.planCard}>
              <View style={styles.planHeader}>
                <Text style={styles.planName}>{plan.name}</Text>
                <Text style={styles.planPrice}>{formatPrice(plan.price)}</Text>
                <Text style={styles.planDuration}>/{plan.duration_days} hari</Text>
              </View>

              <Text style={styles.planDescription}>{plan.description}</Text>

              {/* Features */}
              <View style={styles.featuresContainer}>
                {plan.features.map((feature, index) => (
                  <View key={index} style={styles.featureItem}>
                    <SafeIcon name="check-circle" size={20} color={COLORS.accent[500]} />
                    <Text style={styles.featureText}>{feature}</Text>
                  </View>
                ))}
              </View>

              {/* Subscribe Button */}
              <TouchableOpacity
                style={[
                  styles.subscribeButton,
                  isProcessing && selectedPlan === plan.id && styles.subscribeButtonDisabled,
                ]}
                onPress={() => handleSubscribe(plan)}
                disabled={isProcessing}
              >
                {isProcessing && selectedPlan === plan.id ? (
                  <ActivityIndicator size="small" color={COLORS.cream[50]} />
                ) : (
                  <Text style={styles.subscribeButtonText}>Berlangganan</Text>
                )}
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Bottom padding */}
        <View style={{ height: 100 }} />
      </ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.warmCharcoal[100],
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.warmCharcoal[100],
  },
  loadingText: {
    marginTop: THEME.spacing.lg,
    fontSize: THEME.typography.fontSize.md,
    color: COLORS.cream[200],
    fontWeight: THEME.typography.fontWeight.medium,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.warmCharcoal[100],
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: THEME.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.warmCharcoal[50],
  },
  backButton: {
    padding: THEME.spacing.sm,
    marginRight: THEME.spacing.md,
  },
  headerTitle: {
    fontSize: THEME.typography.fontSize.xxl,
    fontWeight: THEME.typography.fontWeight.bold,
    color: COLORS.cream[50],
  },
  plansContainer: {
    padding: THEME.spacing.lg,
  },
  planCard: {
    backgroundColor: COLORS.warmCharcoal[50],
    borderRadius: THEME.borderRadius.lg,
    padding: THEME.spacing.xl,
    marginBottom: THEME.spacing.lg,
    borderWidth: 2,
    borderColor: COLORS.accent[500],
  },
  planHeader: {
    alignItems: 'center',
    marginBottom: THEME.spacing.lg,
  },
  planName: {
    fontSize: THEME.typography.fontSize.xxl,
    fontWeight: THEME.typography.fontWeight.bold,
    color: COLORS.accent[500],
    marginBottom: THEME.spacing.sm,
  },
  planPrice: {
    fontSize: THEME.typography.fontSize.xxxl,
    fontWeight: THEME.typography.fontWeight.bold,
    color: COLORS.cream[50],
  },
  planDuration: {
    fontSize: THEME.typography.fontSize.md,
    color: COLORS.cream[200],
  },
  planDescription: {
    fontSize: THEME.typography.fontSize.md,
    color: COLORS.cream[100],
    textAlign: 'center',
    marginBottom: THEME.spacing.lg,
  },
  featuresContainer: {
    marginBottom: THEME.spacing.xl,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: THEME.spacing.md,
  },
  featureText: {
    fontSize: THEME.typography.fontSize.md,
    color: COLORS.cream[50],
    marginLeft: THEME.spacing.md,
    flex: 1,
  },
  subscribeButton: {
    backgroundColor: `linear-gradient(to right, ${COLORS.accent[500]}, ${COLORS.accent[600]})`,
    borderRadius: THEME.borderRadius.full,
    paddingVertical: THEME.spacing.lg,
    alignItems: 'center',
  },
  subscribeButtonDisabled: {
    opacity: 0.6,
  },
  subscribeButtonText: {
    fontSize: THEME.typography.fontSize.lg,
    fontWeight: THEME.typography.fontWeight.bold,
    color: COLORS.cream[50],
  },
});

export default PricingScreen;
