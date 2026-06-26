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
  navigation: NativeStackNavigationProp<RootStackParamList, 'PaymentError'>;
  route: RouteProp<RootStackParamList, 'PaymentError'>;
};

const PaymentErrorScreen: React.FC<Props> = ({ navigation, route }) => {
  const { errorMessage } = route.params || {};

  const handleTryAgain = () => {
    navigation.goBack();
  };

  const handleGoHome = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'Main' as any }],
    });
  };

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.warmCharcoal[100]} />
      <View style={styles.container}>
        {/* Error Icon */}
        <View style={styles.iconContainer}>
          <LinearGradient
            colors={[COLORS.red[500], COLORS.red[600]]}
            style={styles.iconCircle}
          >
            <SafeIcon name="close" size={80} color={COLORS.cream[50]} />
          </LinearGradient>
        </View>

        {/* Error Message */}
        <Text style={styles.errorTitle}>Pembayaran Gagal</Text>
        <Text style={styles.errorDescription}>
          {errorMessage || 'Terjadi kesalahan saat memproses pembayaran Anda. Silakan coba lagi.'}
        </Text>

        {/* Troubleshooting Tips */}
        <View style={styles.tipsContainer}>
          <Text style={styles.tipsTitle}>Tips:</Text>
          <View style={styles.tipItem}>
            <SafeIcon name="check-circle" size={18} color={COLORS.accent[500]} />
            <Text style={styles.tipText}>Pastikan koneksi internet stabil</Text>
          </View>
          <View style={styles.tipItem}>
            <SafeIcon name="check-circle" size={18} color={COLORS.accent[500]} />
            <Text style={styles.tipText}>Periksa saldo atau limit kartu Anda</Text>
          </View>
          <View style={styles.tipItem}>
            <SafeIcon name="check-circle" size={18} color={COLORS.accent[500]} />
            <Text style={styles.tipText}>Coba metode pembayaran lain</Text>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleTryAgain}
          >
            <LinearGradient
              colors={[COLORS.accent[500], COLORS.accent[600]]}
              style={styles.gradientButton}
            >
              <SafeIcon name="refresh" size={20} color={COLORS.cream[50]} />
              <Text style={styles.primaryButtonText}>Coba Lagi</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handleGoHome}
          >
            <Text style={styles.secondaryButtonText}>Kembali ke Beranda</Text>
          </TouchableOpacity>
        </View>

        {/* Support Info */}
        <View style={styles.supportContainer}>
          <Text style={styles.supportText}>
            Masih mengalami masalah?
          </Text>
          <TouchableOpacity>
            <Text style={styles.supportLink}>Hubungi Layanan Pelanggan</Text>
          </TouchableOpacity>
        </View>
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
    shadowColor: COLORS.red[500],
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },
  errorTitle: {
    fontSize: THEME.typography.fontSize.xxxl,
    fontWeight: THEME.typography.fontWeight.bold,
    color: COLORS.cream[50],
    marginBottom: THEME.spacing.md,
    textAlign: 'center',
  },
  errorDescription: {
    fontSize: THEME.typography.fontSize.md,
    color: COLORS.cream[200],
    textAlign: 'center',
    marginBottom: THEME.spacing.xxl,
    lineHeight: THEME.typography.lineHeight.relaxed * THEME.typography.fontSize.md,
    paddingHorizontal: THEME.spacing.lg,
  },
  tipsContainer: {
    width: '100%',
    backgroundColor: COLORS.warmCharcoal[50],
    borderRadius: THEME.borderRadius.lg,
    padding: THEME.spacing.xl,
    marginBottom: THEME.spacing.xxl,
  },
  tipsTitle: {
    fontSize: THEME.typography.fontSize.md,
    fontWeight: THEME.typography.fontWeight.semibold,
    color: COLORS.cream[50],
    marginBottom: THEME.spacing.md,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: THEME.spacing.sm,
  },
  tipText: {
    fontSize: THEME.typography.fontSize.sm,
    color: COLORS.cream[100],
    marginLeft: THEME.spacing.md,
    flex: 1,
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: THEME.spacing.lg,
    borderRadius: THEME.borderRadius.full,
    gap: THEME.spacing.sm,
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
  supportContainer: {
    alignItems: 'center',
  },
  supportText: {
    fontSize: THEME.typography.fontSize.sm,
    color: COLORS.cream[200],
    marginBottom: THEME.spacing.xs,
  },
  supportLink: {
    fontSize: THEME.typography.fontSize.sm,
    color: COLORS.accent[400],
    fontWeight: THEME.typography.fontWeight.semibold,
    textDecorationLine: 'underline',
  },
});

export default PaymentErrorScreen;
