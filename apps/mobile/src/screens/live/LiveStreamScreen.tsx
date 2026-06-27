import React, { useEffect, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, ActivityIndicator, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';
import { SafeIcon } from '../../components/ui';
import LiveChat from '../../components/live/LiveChat';
import { broadcastService, paymentService } from '../../services';
import { RootStackParamList } from '../../types';
import { COLORS, THEME, MIDTRANS_CONFIG } from '../../constants';
import { useAuthStore } from '../../store/authStore';
import HLSPlayer from '../../components/video/HLSPlayer';
import { SOCKET_URL } from '../../constants';
import Midtrans from '../../modules/MidtransModule';

type Props = NativeStackScreenProps<RootStackParamList, 'LiveStream'>;

const LiveStreamScreen: React.FC<Props> = ({ route, navigation }) => {
  const { broadcastId } = route.params || {};
  const { isAuthenticated } = useAuthStore();
  const [showChat, setShowChat] = useState(false); // Hidden by default
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);

  useEffect(() => {
    const initMidtrans = async () => {
      try {
        await Midtrans.initialize(
          MIDTRANS_CONFIG.clientKey,
          MIDTRANS_CONFIG.merchantBaseUrl
        );
      } catch (error) {
        console.error('Failed to initialize Midtrans:', error);
      }
    };

    initMidtrans();

    return () => {
      Midtrans.cleanup();
    };
  }, []);

  // Fetch broadcast data
  const { data: broadcast, isLoading, error } = useQuery({
    queryKey: ['broadcast', broadcastId],
    queryFn: () => broadcastService.getBroadcastById(broadcastId!),
    enabled: !!broadcastId,
  });

  const ticketPrice = Number(broadcast?.ticket_price || 0);

  const { data: accessInfo, isLoading: isAccessLoading, refetch: refetchAccess } = useQuery({
    queryKey: ['broadcast-access', broadcastId],
    queryFn: () => paymentService.checkBroadcastAccess(broadcastId!),
    enabled: !!broadcastId && !!broadcast && ticketPrice > 0 && isAuthenticated,
  });

  const hasAccess = ticketPrice <= 0 || !!accessInfo?.has_access;
  const {
    data: playerBroadcast,
    isLoading: isPlayerLoading,
    error: playerError,
  } = useQuery({
    queryKey: ['broadcast-player', broadcastId],
    queryFn: () => broadcastService.getBroadcastPlayerById(broadcastId!),
    enabled: !!broadcastId && !!broadcast && hasAccess && ticketPrice > 0,
  });
  const playbackBroadcast = playerBroadcast || broadcast;

  const handleBuyTicket = async () => {
    if (!broadcastId || !broadcast) return;

    if (!isAuthenticated) {
      Alert.alert('Login diperlukan', 'Silakan login untuk membeli tiket live event.', [
        { text: 'OK', onPress: () => navigation.navigate('Auth') },
      ]);
      return;
    }

    if (broadcast.status === 'ENDED' || broadcast.status === 'CANCELLED') {
      Alert.alert('Tiket ditutup', 'Tiket untuk live event ini sudah tidak tersedia.');
      return;
    }

    setIsPaymentProcessing(true);
    try {
      const paymentResponse = await paymentService.buyBroadcastTicket(broadcastId);
      const result = await Midtrans.startPayment(paymentResponse.snap_token);

      if (result.status === 'success') {
        await refetchAccess();
        Alert.alert('Berhasil', 'Tiket berhasil dibeli. Anda dapat menonton live event ini.');
      } else if (result.status === 'pending') {
        Alert.alert('Pending', 'Pembayaran sedang diproses. Coba buka kembali event ini setelah pembayaran selesai.');
      } else if (result.status === 'canceled') {
        Alert.alert('Dibatalkan', 'Pembayaran dibatalkan.');
      } else {
        Alert.alert('Gagal', 'Pembayaran gagal. Silakan coba lagi.');
      }
    } catch (err: any) {
      console.error('Ticket payment error:', err);
      Alert.alert('Error', err.response?.data?.error || err.message || 'Gagal membuat pembayaran tiket.');
    } finally {
      setIsPaymentProcessing(false);
    }
  };

  // Loading state
  if (isLoading || isAccessLoading || isPlayerLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.accent[500]} />
        <Text style={styles.loadingText}>Loading stream...</Text>
      </View>
    );
  }

  // Error state
  if (error || (ticketPrice > 0 && hasAccess && playerError)) {
    return (
      <View style={styles.errorContainer}>
        <SafeIcon name="error-outline" size={48} color={COLORS.red[500]} />
        <Text style={styles.errorText}>Failed to load stream</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Broadcast not found or ended
  if (!broadcast || broadcast.status !== 'LIVE') {
    return (
      <View style={styles.errorContainer}>
        <SafeIcon
          name={broadcast?.status === 'ENDED' ? 'video-library' : 'event-busy'}
          size={48}
          color={COLORS.cream[200]}
        />
        <Text style={styles.errorText}>
          {broadcast?.status === 'ENDED' ? 'Stream has ended' : 'Stream not found'}
        </Text>
        <Text style={styles.errorSubtext}>{broadcast?.title || ''}</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!hasAccess) {
    return (
      <View style={styles.errorContainer}>
        <SafeIcon name="lock" size={48} color={COLORS.accent[500]} />
        <Text style={styles.errorText}>{broadcast.title}</Text>
        <Text style={styles.errorSubtext}>
          Tiket diperlukan untuk menonton live event ini.
        </Text>
        <Text style={styles.ticketPrice}>
          Rp {ticketPrice.toLocaleString('id-ID')}
        </Text>
        <TouchableOpacity
          style={[styles.backButton, isPaymentProcessing && styles.buttonDisabled]}
          onPress={handleBuyTicket}
          disabled={isPaymentProcessing}
        >
          <Text style={styles.backButtonText}>
            {isPaymentProcessing ? 'Memproses...' : 'Beli Tiket'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondaryButton} onPress={() => navigation.goBack()}>
          <Text style={styles.secondaryButtonText}>Kembali</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!playbackBroadcast?.playback_url) {
    return (
      <View style={styles.errorContainer}>
        <SafeIcon name="event-busy" size={48} color={COLORS.cream[200]} />
        <Text style={styles.errorText}>Stream belum tersedia</Text>
        <Text style={styles.errorSubtext}>{broadcast.title}</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const streamUrl = playbackBroadcast.playback_url;
  const activeBroadcastId = broadcastId!;

  return (
    <View style={styles.container}>
      {/* Video Player Section */}
      <View style={styles.videoContainer}>
        <HLSPlayer
          source={streamUrl}
          onBack={() => navigation.goBack()}
          title={playbackBroadcast.title}
          contentId={activeBroadcastId}
        />

        {/* Stream Info Overlay */}
        <View style={styles.streamInfo}>
          <View style={styles.streamInfoBadge}>
            <View style={styles.liveIndicator} />
            <Text style={styles.liveText}>LIVE</Text>
          </View>
          <Text style={styles.viewerCount}>
            <SafeIcon name="visibility" size={12} color={COLORS.cream[50]} />
            {' '}
            {playbackBroadcast.viewer_count || 0}
          </Text>
        </View>

        {/* Chat Toggle Button */}
        {playbackBroadcast.chat_enabled && isAuthenticated && (
          <TouchableOpacity
            style={styles.chatToggle}
            onPress={() => setShowChat(!showChat)}
          >
            <SafeIcon
              name={showChat ? 'chevron-right' : 'chevron-left'}
              size={24}
              color={COLORS.cream[50]}
            />
          </TouchableOpacity>
        )}
      </View>

      {/* Chat Section */}
      {playbackBroadcast.chat_enabled && isAuthenticated && showChat && (
        <View style={styles.chatContainer}>
          <LiveChat chatServer={SOCKET_URL} broadcastId={activeBroadcastId} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.warmCharcoal[100],
    flexDirection: 'row',
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
    fontWeight: THEME.typography.fontWeight.bold,
    color: COLORS.cream[50],
    marginTop: THEME.spacing.lg,
    marginBottom: THEME.spacing.sm,
    textAlign: 'center',
  },
  errorSubtext: {
    fontSize: THEME.typography.fontSize.md,
    color: COLORS.cream[200],
    textAlign: 'center',
    marginBottom: THEME.spacing.xl,
  },
  backButton: {
    backgroundColor: COLORS.accent[500],
    paddingHorizontal: THEME.spacing.xl,
    paddingVertical: THEME.spacing.md,
    borderRadius: THEME.borderRadius.md,
  },
  backButtonText: {
    color: COLORS.cream[50],
    fontWeight: THEME.typography.fontWeight.semibold,
  },
  secondaryButton: {
    marginTop: THEME.spacing.md,
    paddingHorizontal: THEME.spacing.xl,
    paddingVertical: THEME.spacing.md,
  },
  secondaryButtonText: {
    color: COLORS.cream[200],
    fontWeight: THEME.typography.fontWeight.medium,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  ticketPrice: {
    fontSize: THEME.typography.fontSize.xl,
    color: COLORS.accent[400],
    fontWeight: THEME.typography.fontWeight.bold,
    marginBottom: THEME.spacing.xl,
  },
  videoContainer: {
    flex: 1,
    backgroundColor: '#000000',
    position: 'relative',
  },
  streamInfo: {
    position: 'absolute',
    top: THEME.spacing.md,
    left: THEME.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: THEME.spacing.md,
  },
  streamInfoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${COLORS.red[500]}20`,
    paddingHorizontal: THEME.spacing.sm,
    paddingVertical: 4,
    borderRadius: THEME.borderRadius.sm,
    borderWidth: 1,
    borderColor: `${COLORS.red[500]}40`,
  },
  liveIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.red[500],
    marginRight: 4,
  },
  liveText: {
    fontSize: THEME.typography.fontSize.xs,
    color: COLORS.red[400],
    fontWeight: THEME.typography.fontWeight.bold,
  },
  viewerCount: {
    flexDirection: 'row',
    alignItems: 'center',
    fontSize: THEME.typography.fontSize.sm,
    color: COLORS.cream[50],
    fontWeight: THEME.typography.fontWeight.medium,
  },
  chatToggle: {
    position: 'absolute',
    right: THEME.spacing.md,
    top: '50%',
    marginTop: -20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${COLORS.cream[200]}20`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatContainer: {
    width: 350,
    backgroundColor: COLORS.warmCharcoal[100],
    borderLeftWidth: 1,
    borderLeftColor: `${COLORS.cream[200]}20`,
  },
});

export default LiveStreamScreen;
