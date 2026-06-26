import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';
import { SafeIcon } from '../../components/ui';
import LiveChat from '../../components/live/LiveChat';
import { broadcastService } from '../../services';
import { RootStackParamList } from '../../types';
import { COLORS, THEME } from '../../constants';
import { useAuthStore } from '../../store/authStore';
import HLSPlayer from '../../components/video/HLSPlayer';
import { SOCKET_URL } from '../../constants';

type Props = NativeStackScreenProps<RootStackParamList, 'LiveStream'>;

const LiveStreamScreen: React.FC<Props> = ({ route, navigation }) => {
  const { broadcastId } = route.params;
  const { isAuthenticated } = useAuthStore();
  const [showChat, setShowChat] = useState(false); // Hidden by default

  // Fetch broadcast data
  const { data: broadcast, isLoading, error } = useQuery({
    queryKey: ['broadcast', broadcastId],
    queryFn: () => broadcastService.getBroadcastById(broadcastId),
    enabled: !!broadcastId,
  });

  // Loading state
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.accent[500]} />
        <Text style={styles.loadingText}>Loading stream...</Text>
      </View>
    );
  }

  // Error state
  if (error) {
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

  const streamUrl = broadcast.playback_url;

  return (
    <View style={styles.container}>
      {/* Video Player Section */}
      <View style={styles.videoContainer}>
        <HLSPlayer
          source={streamUrl}
          onBack={() => navigation.goBack()}
          title={broadcast.title}
          contentId={broadcastId}
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
            {broadcast.viewer_count || 0}
          </Text>
        </View>

        {/* Chat Toggle Button */}
        {broadcast.chat_enabled && isAuthenticated && (
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
      {broadcast.chat_enabled && isAuthenticated && showChat && (
        <View style={styles.chatContainer}>
          <LiveChat chatServer={SOCKET_URL} broadcastId={broadcastId} />
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
  videoContainer: {
    flex: 1,
    backgroundColor: COLORS.black,
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
