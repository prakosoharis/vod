import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';
import { contentService } from '../../services';
import { RootStackParamList } from '../../types';
import { COLORS } from '../../constants';
import NetflixPlayer from '../../components/video/NetflixPlayer';

type Props = NativeStackScreenProps<RootStackParamList, 'VideoPlayer'>;

const VideoPlayerScreen: React.FC<Props> = ({ route, navigation }) => {
  const { contentId } = route.params;

  // Fetch content data
  const { data: content, isLoading, error } = useQuery({
    queryKey: ['content', contentId],
    queryFn: () => contentService.getContentById(contentId),
    enabled: !!contentId,
  });

  // Loading state
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
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

  // Video URL not available
  if (!content.video_url) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Video not available</Text>
        <Text style={styles.title}>{content.title}</Text>
        <Text style={styles.description}>{content.description}</Text>
      </View>
    );
  }

  // Render Netflix-style player
  return (
    <NetflixPlayer
      source={content.video_url}
      onBack={() => navigation.goBack()}
      title={content.title}
    />
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: COLORS.primary,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  errorSubtext: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: 20,
    marginBottom: 12,
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default VideoPlayerScreen;
