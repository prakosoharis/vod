import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import { SafeIcon } from '../../components/ui';
import { COLORS, THEME } from '../../constants';
import { RootStackParamList } from '../../types';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'PaymentSuccess'>;
  route: RouteProp<RootStackParamList, 'PaymentSuccess'>;
};

const PaymentSuccessScreen: React.FC<Props> = ({ navigation, route }) => {
  const { transactionId, amount, type } = route.params;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getSuccessMessage = () => {
    switch (type) {
      case 'subscription':
        return 'Langganan Aktif!';
      case 'rental':
        return 'Rental Berhasil!';
      case 'event':
        return 'Tiket Dibeli!';
      default:
        return 'Pembayaran Berhasil!';
    }
  };

  const getSuccessDescription = () => {
    switch (type) {
      case 'subscription':
        return 'Sekarang Anda dapat menikmati semua konten premium tanpa batas.';
      case 'rental':
        return 'Anda dapat menonton konten ini selama periode rental.';
      case 'event':
        return 'Tiket acara Anda sudah siap. Selamat menikmati!';
      default:
        return 'Transaksi Anda telah berhasil diproses.';
    }
  };

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.warmCharcoal[100]} />
      <View style={styles.container}>
        {/* Success Icon */}
        <View style={styles.iconContainer}>
          <LinearGradient
            colors={[COLORS.accent[500], COLORS.accent[600]]}
            style={styles.iconCircle}
          >
            <SafeIcon name="check" size={80} color={COLORS.cream[50]} />
          </LinearGradient>
        </View>

        {/* Success Message */}
        <Text style={styles.successTitle}>{getSuccessMessage()}</Text>
        <Text style={styles.successDescription}>{getSuccessDescription()}</Text>

        {/* Transaction Details */}
        <View style={styles.detailsContainer}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>ID Transaksi</Text>
            <Text style={styles.detailValue}>{transactionId}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Jumlah</Text>
            <Text style={styles.detailValue}>{formatPrice(amount)}</Text>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => {
              // Navigate to home and reset stack
              navigation.reset({
                index: 0,
                routes: [{ name: 'MainTabs' }],
              });
            }}
          >
            <LinearGradient
              colors={[COLORS.accent[500], COLORS.accent[600]]}
              style={styles.gradientButton}
            >
              <Text style={styles.primaryButtonText}>Mulai Nonton</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => navigation.navigate('Profile')}
          >
            <Text style={styles.secondaryButtonText}>Lihat Profil</Text>
          </TouchableOpacity>
        </View>

        {/* Bottom Note */}
        <Text style={styles.bottomNote}>
          Email konfirmasi telah dikirim ke alamat email Anda.
        </Text>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.warmCharcoal[100],
    alignItems: 'center',
    justifyContent: 'center',
    padding: THEME.spacing.xl,
  },
  iconContainer: {
    marginBottom: THEME.spacing.xxl,
  },
  iconCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.accent[500],
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },
  successTitle: {
    fontSize: THEME.typography.fontSize.xxxl,
    fontWeight: THEME.typography.fontWeight.bold,
    color: COLORS.cream[50],
    marginBottom: THEME.spacing.md,
    textAlign: 'center',
  },
  successDescription: {
    fontSize: THEME.typography.fontSize.md,
    color: COLORS.cream[200],
    textAlign: 'center',
    marginBottom: THEME.spacing.xxl,
    lineHeight: THEME.typography.lineHeight.relaxed * THEME.typography.fontSize.md,
  },
  detailsContainer: {
    width: '100%',
    backgroundColor: COLORS.warmCharcoal[50],
    borderRadius: THEME.borderRadius.lg,
    padding: THEME.spacing.xl,
    marginBottom: THEME.spacing.xxl,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: THEME.typography.fontSize.md,
    color: COLORS.cream[200],
    fontWeight: THEME.typography.fontWeight.medium,
  },
  detailValue: {
    fontSize: THEME.typography.fontSize.md,
    color: COLORS.cream[50],
    fontWeight: THEME.typography.fontWeight.semibold,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.warmCharcoal[100],
    marginVertical: THEME.spacing.md,
  },
  actionsContainer: {
    width: '100%',
    marginBottom: THEME.spacing.xl,
  },
  primaryButton: {
    width: '100%',
    borderRadius: THEME.borderRadius.full,
    marginBottom: THEME.spacing.md,
    shadowColor: COLORS.accent[500],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  gradientButton: {
    paddingVertical: THEME.spacing.lg,
    borderRadius: THEME.borderRadius.full,
    alignItems: 'center',
  },
  primaryButtonText: {
    fontSize: THEME.typography.fontSize.lg,
    fontWeight: THEME.typography.fontWeight.bold,
    color: COLORS.cream[50],
  },
  secondaryButton: {
    width: '100%',
    paddingVertical: THEME.spacing.lg,
    borderRadius: THEME.borderRadius.full,
    borderWidth: 2,
    borderColor: COLORS.accent[500],
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: THEME.typography.fontSize.lg,
    fontWeight: THEME.typography.fontWeight.bold,
    color: COLORS.accent[500],
  },
  bottomNote: {
    fontSize: THEME.typography.fontSize.sm,
    color: COLORS.cream[200],
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default PaymentSuccessScreen;
