import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeIcon } from '../ui';
import { COLORS, THEME } from '../../constants';
import { paymentService, PaymentResponse } from '../../services';
import { useAuthStore } from '../../store/authStore';

interface PaymentOptionsModalProps {
  visible: boolean;
  onClose: () => void;
  contentId: string;
  contentTitle: string;
  price?: number;
  durationHours?: number;
  onPaymentSuccess: () => void;
  onRentalPaymentCreated?: (paymentResponse: PaymentResponse) => void;
}

const PaymentOptionsModal: React.FC<PaymentOptionsModalProps> = ({
  visible,
  onClose,
  contentId,
  contentTitle,
  price = 0,
  durationHours = 24,
  onPaymentSuccess,
  onRentalPaymentCreated,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const user = useAuthStore((state) => state.user);
  const isVerified = Boolean(user?.email_verified || user?.email_verified_at || user?.account_status === 'ACTIVE');

  const handleRentContent = async () => {
    if (!isVerified) {
      Alert.alert(
        'Verifikasi email diperlukan',
        'Silakan verifikasi email melalui tombol yang kami kirim. Anda dapat mengirim ulang tautan dari menu Profil.'
      );
      return;
    }
    try {
      setIsProcessing(true);

      // Call backend to create rental payment session
      const paymentResponse = await paymentService.rentContent(contentId);

      if (!paymentResponse.redirect_url) {
        throw new Error('Link pembayaran Midtrans tidak tersedia.');
      }

      onClose();
      onRentalPaymentCreated?.(paymentResponse);
    } catch (error: any) {
      console.error('Rental payment error:', error);
      const errorMessage = error.response?.data?.error || error.message || '';

      if (errorMessage.toLowerCase().includes('already have')) {
        onClose();
        onPaymentSuccess();
        return;
      }

      Alert.alert(
        'Error',
        errorMessage || 'Terjadi kesalahan saat memproses pembayaran'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <SafeIcon name="lock" size={48} color={COLORS.accent[500]} />
            <Text style={styles.title}>Sewa Tayangan</Text>
            <Text style={styles.subtitle}>
              Akses penuh untuk "{contentTitle}" selama masa sewa aktif.
            </Text>
          </View>

          {/* Payment Options */}
          <View style={styles.optionsContainer}>
            {/* Rental Option */}
            <TouchableOpacity
              style={styles.optionCard}
              onPress={handleRentContent}
              disabled={isProcessing}
              activeOpacity={0.8}
            >
              <View style={styles.optionContent}>
                <SafeIcon name="play-circle-outline" size={32} color={COLORS.accent[500]} />
                <View style={styles.optionInfo}>
                  <Text style={styles.optionTitle}>Sewa</Text>
                  <Text style={styles.optionDescription}>Tonton selama {durationHours} jam</Text>
                  <Text style={styles.optionPrice}>
                    Rp {Math.max(0, Number(price)).toLocaleString('id-ID')}
                  </Text>
                </View>
                {isProcessing ? (
                  <ActivityIndicator size="small" color={COLORS.accent[500]} />
                ) : (
                  <SafeIcon name="chevron-right" size={24} color={COLORS.cream[200]} />
                )}
              </View>
            </TouchableOpacity>

          </View>

          {/* Close Button */}
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
            disabled={isProcessing}
            activeOpacity={0.8}
          >
            <Text style={styles.closeButtonText}>Tutup</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: THEME.spacing.lg,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: COLORS.warmCharcoal[50],
    borderRadius: THEME.borderRadius.lg,
    padding: THEME.spacing.xl,
    ...THEME.shadows.large,
  },
  header: {
    alignItems: 'center',
    marginBottom: THEME.spacing.xl,
  },
  title: {
    fontSize: THEME.typography.fontSize.xxl,
    fontWeight: THEME.typography.fontWeight.bold,
    color: COLORS.cream[50],
    marginTop: THEME.spacing.md,
    marginBottom: THEME.spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: THEME.typography.fontSize.md,
    color: COLORS.cream[200],
    textAlign: 'center',
    lineHeight: THEME.typography.lineHeight.relaxed * THEME.typography.fontSize.md,
  },
  optionsContainer: {
    gap: THEME.spacing.md,
    marginBottom: THEME.spacing.xl,
  },
  optionCard: {
    borderRadius: THEME.borderRadius.md,
    overflow: 'hidden',
    backgroundColor: COLORS.warmCharcoal[100],
    borderWidth: 1,
    borderColor: `${COLORS.cream[200]}30`,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: THEME.spacing.lg,
    gap: THEME.spacing.md,
  },
  optionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: THEME.spacing.lg,
    gap: THEME.spacing.md,
  },
  optionInfo: {
    flex: 1,
  },
  optionTitle: {
    fontSize: THEME.typography.fontSize.lg,
    fontWeight: THEME.typography.fontWeight.bold,
    color: COLORS.cream[50],
    marginBottom: 2,
  },
  optionTitleLight: {
    color: COLORS.cream[50],
  },
  optionDescription: {
    fontSize: THEME.typography.fontSize.sm,
    color: COLORS.cream[200],
    marginBottom: THEME.spacing.xs,
  },
  optionDescriptionLight: {
    color: COLORS.cream[100],
  },
  optionPrice: {
    fontSize: THEME.typography.fontSize.md,
    fontWeight: THEME.typography.fontWeight.semibold,
    color: COLORS.accent[400],
  },
  optionPriceLight: {
    color: COLORS.cream[50],
  },
  closeButton: {
    backgroundColor: `${COLORS.warmCharcoal[100]}80`,
    paddingVertical: THEME.spacing.md,
    paddingHorizontal: THEME.spacing.xl,
    borderRadius: THEME.borderRadius.full,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: `${COLORS.cream[200]}30`,
  },
  closeButtonText: {
    fontSize: THEME.typography.fontSize.md,
    fontWeight: THEME.typography.fontWeight.semibold,
    color: COLORS.cream[100],
  },
});

export default PaymentOptionsModal;
