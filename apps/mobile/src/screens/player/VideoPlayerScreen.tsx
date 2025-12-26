import React, { useRef, useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';
import { contentService, userService } from '../../services';
import { RootStackParamList } from '../../types';
import { COLORS, THEME } from '../../constants';
import { useAuthStore } from '../../store/authStore';
import HLSPlayer from '../../components/video/HLSPlayer';

type Props = NativeStackScreenProps<RootStackParamList, 'VideoPlayer'>;

const VideoPlayerScreen: React.FC<Props> = ({ route, navigation }) => {
  const { contentId } = route.params;
  const { isAuthenticated } = useAuthStore();

  // Watch progress tracking
  const [lastSyncTime, setLastSyncTime] = useState(0);
  const progressSyncTimeout = useRef<NodeJS.Timeout | null>(null);

  // Fetch content data
  const { data: content, isLoading, error } = useQuery({
    queryKey: ['content', contentId],
    queryFn: async () => {
      const data = await contentService.getContentById(contentId);
      console.log('=== CONTENT DATA DEBUG ===');
      console.log('Content ID:', contentId);
      console.log('Full content object:', JSON.stringify(data, null, 2));
      console.log('video_url:', data.video_url);
      console.log('hls_url:', data.hls_url);
      console.log('hls_cdn_url:', data.hls_cdn_url);
      console.log('========================');
      return data;
    },
    enabled: !!contentId,
  });

  // Watch progress sync function
  const syncWatchProgress = async (progressSeconds: number) => {
    if (!isAuthenticated || !contentId) return;

    try {
      await userService.updateWatchProgress(contentId, Math.floor(progressSeconds));
      setLastSyncTime(progressSeconds);
      console.log('Watch progress synced:', Math.floor(progressSeconds));
    } catch (error) {
      console.error('Failed to sync watch progress:', error);
    }
  };

  // Handle progress updates with debouncing
  const handleProgress = (progressSeconds: number) => {
    // Clear previous timeout
    if (progressSyncTimeout.current) {
      clearTimeout(progressSyncTimeout.current);
    }

    // Only sync if 10+ seconds have passed since last sync
    if (progressSeconds - lastSyncTime > 10) {
      // Debounce: sync after 5 seconds of no progress updates (user paused or seeking)
      progressSyncTimeout.current = setTimeout(() => {
        syncWatchProgress(progressSeconds);
      }, 5000);
    }
  };

  // Sync progress when user leaves the screen
  useEffect(() => {
    return () => {
      if (progressSyncTimeout.current) {
        clearTimeout(progressSyncTimeout.current);
      }
    };
  }, []);

  // Loading state
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.accent[500]} />
        <Text style={styles.loadingText}>Loading video...</Text>
      </View>
    );
  }

  // Error state
  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Failed to load content</Text>
        <Text style={styles.errorSubtext}>Please try again later</Text>
      </View>
    );
  }

  // Content not found
  if (!content) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Content not found</Text>
      </View>
    );
  }

  // Determine video URL (prioritize HLS)
  const videoUrl = content.hls_cdn_url || content.hls_url || content.video_url;

  console.log('=== VIDEO URL SELECTION ===');
  console.log('Selected videoUrl:', videoUrl);
  console.log('Priority check:');
  console.log('  1. hls_cdn_url:', content.hls_cdn_url);
  console.log('  2. hls_url:', content.hls_url);
  console.log('  3. video_url:', content.video_url);
  console.log('===========================');

  // Video URL not available
  if (!videoUrl) {
    console.log('ERROR: No video URL found!');
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Video not available</Text>
        <Text style={styles.title}>{content.title}</Text>
        <Text style={styles.description}>{content.description}</Text>
        <Text style={styles.errorSubtext}>
          No video URL (hls_cdn_url, hls_url, or video_url) found for this content.
        </Text>
      </View>
    );
  }

  // Render HLS Player
  return (
    <HLSPlayer
      source={videoUrl}
      onBack={() => navigation.goBack()}
      title={content.title}
      contentId={contentId}
      onProgress={handleProgress}
    />
  );
};

const styles = StyleSheet.create({
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
    color: COLORS.accent[500],
    fontWeight: THEME.typography.fontWeight.bold,
    marginBottom: THEME.spacing.sm,
    textAlign: 'center',
  },
  errorSubtext: {
    fontSize: THEME.typography.fontSize.sm,
    color: COLORS.cream[200],
    textAlign: 'center',
  },
  title: {
    fontSize: THEME.typography.fontSize.xxl,
    fontWeight: THEME.typography.fontWeight.bold,
    color: COLORS.cream[50],
    marginTop: THEME.spacing.xl,
    marginBottom: THEME.spacing.md,
    textAlign: 'center',
  },
  description: {
    fontSize: THEME.typography.fontSize.sm,
    color: COLORS.cream[200],
    textAlign: 'center',
    lineHeight: THEME.typography.lineHeight.relaxed * THEME.typography.fontSize.sm,
  },
});

export default VideoPlayerScreen;
