import React, { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CommonActions } from '@react-navigation/native';
import { useQueryClient } from '@tanstack/react-query';
import { WebView, WebViewNavigation } from 'react-native-webview';
import { SafeIcon } from '../../components/ui';
import { paymentService } from '../../services';
import { COLORS, THEME } from '../../constants';
import { RootStackParamList } from '../../types';

type Props = NativeStackScreenProps<RootStackParamList, 'PaymentWebView'>;

const PaymentWebViewScreen: React.FC<Props> = ({ route, navigation }) => {
  const { url, orderId, broadcastId, contentId, type } = route.params;
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(true);
  const [paymentResult, setPaymentResult] = useState<'success' | 'pending' | 'error' | null>(null);
  const hasHandledResult = useRef(false);

  const closePayment = () => {
    Alert.alert('Batalkan Pembayaran?', 'Pembayaran belum selesai.', [
      { text: 'Lanjut Bayar', style: 'cancel' },
      { text: 'Tutup', style: 'destructive', onPress: () => navigation.goBack() },
    ]);
  };

  const finishPayment = async (status: 'success' | 'pending' | 'error') => {
    if (hasHandledResult.current) {
      return;
    }

    hasHandledResult.current = true;

    if (status === 'success') {
      try {
        await paymentService.simulateDevWebhook(orderId);
      } catch (error) {
        console.log('Payment simulator skipped:', error);
      }

      if (type === 'event' && broadcastId) {
        await queryClient.invalidateQueries({ queryKey: ['broadcast-access', broadcastId] });
        await queryClient.invalidateQueries({ queryKey: ['broadcast-player', broadcastId] });
        setPaymentResult('success');
        Alert.alert('Pembayaran Berhasil', 'Tiket Anda sudah aktif. Silakan masuk ke live event.', [
          {
            text: 'Masuk Live Event',
            onPress: () => navigation.dispatch(
              CommonActions.reset({
                index: 1,
                routes: [
                  { name: 'Main', params: { screen: 'Live' } },
                  { name: 'LiveStream', params: { broadcastId } },
                ],
              })
            ),
          },
        ]);
        return;
      }

      if (type === 'rental' && contentId) {
        await queryClient.invalidateQueries({ queryKey: ['content-access', contentId] });
        await queryClient.invalidateQueries({ queryKey: ['user-rentals'] });
        setPaymentResult('success');
        Alert.alert('Pembayaran Berhasil', 'Film sudah bisa ditonton.', [
          {
            text: 'Tonton Sekarang',
            onPress: () => navigation.dispatch(
              CommonActions.reset({
                index: 1,
                routes: [
                  { name: 'Main' },
                  { name: 'VideoPlayer', params: { contentId } },
                ],
              })
            ),
          },
        ]);
        return;
      }

      if (type === 'subscription') {
        await queryClient.invalidateQueries({ queryKey: ['subscription'] });
        await queryClient.invalidateQueries({ queryKey: ['my-subscription'] });
        setPaymentResult('success');
        Alert.alert('Pembayaran Berhasil', 'Langganan Anda sudah aktif.', [
          {
            text: 'OK',
            onPress: () => navigation.dispatch(
              CommonActions.reset({
                index: 0,
                routes: [{ name: 'Main' }],
              })
            ),
          },
        ]);
        return;
      }

      navigation.goBack();
      return;
    }

    if (status === 'pending') {
      setPaymentResult('pending');
      Alert.alert('Pembayaran Pending', 'Pembayaran sedang diproses. Coba buka kembali event setelah beberapa saat.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
      return;
    }

    setPaymentResult('error');
    Alert.alert('Pembayaran Gagal', 'Pembayaran tidak berhasil. Silakan coba lagi.', [
      { text: 'OK', onPress: () => navigation.goBack() },
    ]);
  };

  const handleNavigationChange = (navState: WebViewNavigation) => {
    const currentUrl = navState.url;

    if (currentUrl.includes('/payment/success') || currentUrl.includes('transaction_status=settlement')) {
      finishPayment('success');
    } else if (currentUrl.includes('/payment/pending') || currentUrl.includes('transaction_status=pending')) {
      finishPayment('pending');
    } else if (currentUrl.includes('/payment/error') || currentUrl.includes('transaction_status=deny')) {
      finishPayment('error');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.warmCharcoal[100]} />
      {paymentResult ? (
        <View style={styles.resultContainer}>
          <View
            style={[
              styles.resultIcon,
              paymentResult === 'success' && styles.resultIconSuccess,
              paymentResult === 'pending' && styles.resultIconPending,
              paymentResult === 'error' && styles.resultIconError,
            ]}
          >
            <SafeIcon
              name={paymentResult === 'success' ? 'check' : paymentResult === 'pending' ? 'schedule' : 'close'}
              size={48}
              color={COLORS.cream[50]}
            />
          </View>
          <Text style={styles.resultTitle}>
            {paymentResult === 'success'
              ? 'Pembayaran Berhasil'
              : paymentResult === 'pending'
                ? 'Pembayaran Pending'
                : 'Pembayaran Gagal'}
          </Text>
          <Text style={styles.resultText}>
            {paymentResult === 'success'
              ? type === 'rental'
                ? 'Film sudah bisa ditonton.'
                : type === 'subscription'
                  ? 'Langganan Anda sudah aktif.'
                : 'Tiket Anda sudah aktif.'
              : paymentResult === 'pending'
                ? 'Pembayaran sedang diproses.'
                : 'Silakan coba pembayaran ulang.'}
          </Text>
        </View>
      ) : (
        <>
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconButton} onPress={closePayment}>
          <SafeIcon name="close" size={24} color={COLORS.cream[50]} />
        </TouchableOpacity>
        <Text style={styles.title}>Pembayaran</Text>
        <View style={styles.iconButtonPlaceholder} />
      </View>

      <WebView
        source={{ uri: url }}
        style={styles.webView}
        startInLoadingState
        javaScriptEnabled
        domStorageEnabled
        sharedCookiesEnabled
        thirdPartyCookiesEnabled
        onLoadStart={() => setIsLoading(true)}
        onLoadEnd={() => setIsLoading(false)}
        onNavigationStateChange={handleNavigationChange}
        onError={() => finishPayment('error')}
        renderLoading={() => (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={COLORS.accent[500]} />
            <Text style={styles.loadingText}>Membuka Midtrans...</Text>
          </View>
        )}
      />

      {isLoading && (
        <View pointerEvents="none" style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={COLORS.accent[500]} />
          <Text style={styles.loadingText}>Membuka Midtrans...</Text>
        </View>
      )}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.warmCharcoal[100],
  },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: THEME.spacing.md,
    backgroundColor: COLORS.warmCharcoal[100],
    borderBottomWidth: 1,
    borderBottomColor: COLORS.warmCharcoal[50],
  },
  iconButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconButtonPlaceholder: {
    width: 44,
    height: 44,
  },
  title: {
    fontSize: THEME.typography.fontSize.lg,
    fontWeight: THEME.typography.fontWeight.semibold,
    color: COLORS.cream[50],
  },
  webView: {
    flex: 1,
    backgroundColor: COLORS.cream[50],
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    top: 56,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.warmCharcoal[100],
  },
  loadingText: {
    marginTop: THEME.spacing.md,
    fontSize: THEME.typography.fontSize.md,
    color: COLORS.cream[100],
  },
  resultContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: THEME.spacing.xl,
    backgroundColor: COLORS.warmCharcoal[100],
  },
  resultIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: THEME.spacing.xl,
  },
  resultIconSuccess: {
    backgroundColor: COLORS.green[500],
  },
  resultIconPending: {
    backgroundColor: COLORS.yellow[500],
  },
  resultIconError: {
    backgroundColor: COLORS.red[500],
  },
  resultTitle: {
    fontSize: THEME.typography.fontSize.xxl,
    fontWeight: THEME.typography.fontWeight.bold,
    color: COLORS.cream[50],
    marginBottom: THEME.spacing.md,
    textAlign: 'center',
  },
  resultText: {
    fontSize: THEME.typography.fontSize.md,
    color: COLORS.cream[200],
    textAlign: 'center',
  },
});

export default PaymentWebViewScreen;
