import React, { useCallback, useEffect, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, ActivityIndicator, Alert, BackHandler } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CommonActions, useFocusEffect } from '@react-navigation/native';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { SafeIcon } from '../../components/ui';
import LiveChat from '../../components/live/LiveChat';
import { broadcastService, paymentService } from '../../services';
import { RootStackParamList } from '../../types';
import { COLORS, THEME } from '../../constants';
import { useAuthStore } from '../../store/authStore';
import HLSPlayer from '../../components/video/HLSPlayer';
import { SOCKET_URL } from '../../constants';
import Orientation from 'react-native-orientation-locker';

type Props = NativeStackScreenProps<RootStackParamList, 'LiveStream'>;

const LiveStreamScreen: React.FC<Props> = ({ route, navigation }) => {
  const { broadcastId } = route.params || {};
  const { isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();
  const [showChat, setShowChat] = useState(false); // Hidden by default
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);

  const goBackToLiveList = useCallback(() => {
    (Orientation as any).unlockAllOrientations?.();
    Orientation.lockToPortrait();

    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'Main', params: { screen: 'Live' } }],
      })
    );
  }, [navigation]);

  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      goBackToLiveList();
      return true;
    });

    return () => subscription.remove();
  }, [goBackToLiveList]);

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
    retry: false,
  });

  const hasAccess = ticketPrice <= 0 || !!accessInfo?.has_access;
  const requiresTicket = ticketPrice > 0;
  const {
    data: playerBroadcast,
    isLoading: isPlayerLoading,
    error: playerError,
  } = useQuery({
    queryKey: ['broadcast-player', broadcastId],
    queryFn: () => broadcastService.getBroadcastPlayerById(broadcastId!),
    enabled: !!broadcastId && !!broadcast && requiresTicket && hasAccess,
    retry: false,
  });
  const playbackBroadcast = playerBroadcast || broadcast;

  useFocusEffect(
    useCallback(() => {
      if (broadcastId && requiresTicket && isAuthenticated) {
        queryClient.invalidateQueries({ queryKey: ['broadcast-access', broadcastId] });
        refetchAccess();
      }
    }, [broadcastId, isAuthenticated, queryClient, refetchAccess, requiresTicket])
  );

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

      if (!paymentResponse.redirect_url) {
        throw new Error('Link pembayaran Midtrans tidak tersedia.');
      }

      navigation.navigate('PaymentWebView', {
        url: paymentResponse.redirect_url,
        orderId: paymentResponse.order_id,
        broadcastId,
        type: 'event',
      });
    } catch (err: any) {
      console.error('Ticket payment error:', err);
      const errorMessage = err.response?.data?.error || err.message || '';

      if (errorMessage.toLowerCase().includes('already have a ticket')) {
        await queryClient.invalidateQueries({ queryKey: ['broadcast-access', broadcastId] });
        await refetchAccess();
        Alert.alert('Tiket Sudah Aktif', 'Tiket Anda sudah aktif. Membuka ulang akses live event.');
        return;
      }

      Alert.alert('Error', errorMessage || 'Gagal membuat pembayaran tiket.');
    } finally {
      setIsPaymentProcessing(false);
    }
  };

  // Loading state
  if (isLoading || (hasAccess && isPlayerLoading)) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.accent[500]} />
        <Text style={styles.loadingText}>Loading stream...</Text>
      </View>
    );
  }

  // Error state
  if (error || (requiresTicket && hasAccess && playerError)) {
    return (
      <View style={styles.errorContainer}>
        <SafeIcon name="error-outline" size={48} color={COLORS.red[500]} />
        <Text style={styles.errorText}>Failed to load stream</Text>
        <TouchableOpacity style={styles.backButton} onPress={goBackToLiveList}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!broadcast) {
    return (
      <View style={styles.errorContainer}>
        <SafeIcon name="event-busy" size={48} color={COLORS.cream[200]} />
        <Text style={styles.errorText}>Stream not found</Text>
        <TouchableOpacity style={styles.backButton} onPress={goBackToLiveList}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (requiresTicket && !hasAccess) {
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
        {isAccessLoading && (
          <Text style={styles.checkingAccessText}>Memeriksa tiket...</Text>
        )}
        <TouchableOpacity
          style={[styles.backButton, isPaymentProcessing && styles.buttonDisabled]}
          onPress={handleBuyTicket}
          disabled={isPaymentProcessing}
        >
          <Text style={styles.backButtonText}>
            {isPaymentProcessing ? 'Memproses...' : 'Beli Tiket'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondaryButton} onPress={goBackToLiveList}>
          <Text style={styles.secondaryButtonText}>Kembali</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (broadcast.status === 'ENDED' || broadcast.status === 'CANCELLED') {
    return (
      <View style={styles.errorContainer}>
        <SafeIcon name="video-library" size={48} color={COLORS.cream[200]} />
        <Text style={styles.errorText}>
          {broadcast.status === 'ENDED' ? 'Stream has ended' : 'Stream cancelled'}
        </Text>
        <Text style={styles.errorSubtext}>{broadcast.title}</Text>
        <TouchableOpacity style={styles.backButton} onPress={goBackToLiveList}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!playbackBroadcast?.playback_url) {
    return (
      <View style={styles.errorContainer}>
        <SafeIcon name="event-busy" size={48} color={COLORS.cream[200]} />
        <Text style={styles.errorText}>
          {broadcast.status === 'SCHEDULED' ? 'Live belum dimulai' : 'Stream belum tersedia'}
        </Text>
        <Text style={styles.errorSubtext}>{broadcast.title}</Text>
        <TouchableOpacity style={styles.backButton} onPress={goBackToLiveList}>
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
          onBack={goBackToLiveList}
          title={playbackBroadcast.title}
          contentId={activeBroadcastId}
        />

        <TouchableOpacity
          style={styles.alwaysBackButton}
          onPress={goBackToLiveList}
        >
          <SafeIcon name="arrow-back" size={24} color={COLORS.cream[50]} />
        </TouchableOpacity>

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
  checkingAccessText: {
    fontSize: THEME.typography.fontSize.sm,
    color: COLORS.cream[200],
    marginBottom: THEME.spacing.md,
  },
  videoContainer: {
    flex: 1,
    backgroundColor: '#000000',
    position: 'relative',
  },
  alwaysBackButton: {
    position: 'absolute',
    top: THEME.spacing.md,
    left: THEME.spacing.md,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: `${COLORS.warmCharcoal[100]}CC`,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 30,
  },
  streamInfo: {
    position: 'absolute',
    top: THEME.spacing.md,
    left: 72,
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
