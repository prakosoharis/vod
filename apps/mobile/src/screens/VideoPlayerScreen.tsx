import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  BackHandler,
  ActivityIndicator,
} from 'react-native';
import { useRoute, useFocusEffect } from '@react-navigation/native';
import VideoPlayer from '../components/VideoPlayer';
import { Loading, ErrorState } from '../components';
import { contentService, authService } from '../services';
import type { Content } from '../types';

const VideoPlayerScreen = ({ navigation }: { navigation: any }) => {
  const route = useRoute();
  const { videoId, title } = route.params as { videoId: string; title: string };

  const [content, setContent] = useState<Content | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        navigation.goBack();
        return true;
      };

      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);

      return () => subscription.remove();
    }, [navigation])
  );

  useEffect(() => {
    loadContent();
  }, [videoId]);

  const loadContent = async () => {
    try {
      setLoading(true);
      setError(null);
      const contentData = await contentService.getContentById(videoId);
      setContent(contentData);
    } catch (err: any) {
      setError(err.message || 'Failed to load content');
    } finally {
      setLoading(false);
    }
  };

  const handleVideoEnd = () => {
    // Track watch progress or navigate to next episode
    console.log('Video ended');
  };

  const handleVideoProgress = (progress: { currentTime: number; duration: number }) => {
    // Update watch progress
    if (progress.currentTime > 0 && progress.duration > 0) {
      const progressPercent = (progress.currentTime / progress.duration) * 100;

      // Save progress every 10 seconds
      if (progress.currentTime % 10 < 1) {
        // authService.updateWatchProgress(videoId, progressPercent).catch(console.error);
        console.log('Watch progress update not implemented yet');
      }
    }
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const handleRetry = () => {
    loadContent();
  };

  if (loading) {
    return <Loading visible text="Loading content..." />;
  }

  if (error || !content) {
    return (
      <ErrorState
        title="Content Not Available"
        message={error || 'This content could not be loaded'}
        onRetry={handleRetry}
      />
    );
  }

  // Fallback content if video_url is missing
  const videoContent = {
    ...content,
    video_url: content.video_url || 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {content.title}
        </Text>
        <TouchableOpacity style={styles.moreButton}>
          <Text style={styles.moreIcon}>⋮</Text>
        </TouchableOpacity>
      </View>

      <VideoPlayer
        content={videoContent}
        onEnd={handleVideoEnd}
        onProgress={handleVideoProgress}
        autoPlay={true}
      />

      {/* Video Information */}
      <View style={styles.infoSection}>
        <Text style={styles.videoTitle}>{content.title}</Text>

        {content.description && (
          <Text style={styles.description} numberOfLines={3}>
            {content.description}
          </Text>
        )}

        <View style={styles.videoStats}>
          <Text style={styles.statText}>
            {content.year && `${content.year} • `}
            {content.rating && `⭐ ${content.rating} • `}
            {content.duration}
          </Text>
          <Text style={styles.statText}>{content.type}</Text>
        </View>

        {/* Genre Tags */}
        {content.genre && content.genre.length > 0 && (
          <View style={styles.genreContainer}>
            {content.genre.slice(0, 5).map((genre, index) => (
              <View key={index} style={styles.genreTag}>
                <Text style={styles.genreText}>{genre}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Cast Information */}
        {content.cast && content.cast.length > 0 && (
          <View style={styles.castSection}>
            <Text style={styles.sectionTitle}>Cast</Text>
            <View style={styles.castContainer}>
              {content.cast.slice(0, 4).map((castMember, index) => (
                <Text key={index} style={styles.castText}>
                  {castMember.name} {castMember.role && `as ${castMember.role}`}
                </Text>
              ))}
            </View>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionIcon}>👍</Text>
            <Text style={styles.actionText}>Like</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionIcon}>⭐</Text>
            <Text style={styles.actionText}>Favorite</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionIcon}>📋</Text>
            <Text style={styles.actionText}>Watchlist</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionIcon}>📤</Text>
            <Text style={styles.actionText}>Share</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#000',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  backButton: {
    padding: 8,
  },
  backArrow: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
  },
  headerTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginHorizontal: 12,
  },
  moreButton: {
    padding: 8,
  },
  moreIcon: {
    fontSize: 20,
    color: '#fff',
  },
  videoContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  videoPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
  },
  description: {
    fontSize: 16,
    color: '#ccc',
    lineHeight: 22,
    marginBottom: 16,
  },
  videoId: {
    fontSize: 14,
    color: '#aaa',
    marginBottom: 24,
  },
  playButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playIcon: {
    fontSize: 32,
    color: '#fff',
    marginLeft: 4,
  },
  controls: {
    padding: 16,
    backgroundColor: '#000',
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#333',
    borderRadius: 2,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 2,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeText: {
    fontSize: 12,
    color: '#aaa',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 24,
  },
  controlButton: {
    padding: 8,
  },
  playPauseButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlIcon: {
    fontSize: 24,
    color: '#fff',
  },
  playPauseIcon: {
    fontSize: 32,
  },
  infoSection: {
    backgroundColor: '#1a1a1a',
    padding: 16,
  },
  infoSection: {
    padding: 20,
    backgroundColor: '#1a1a1a',
    marginTop: 'auto',
  },
  videoStats: {
    marginBottom: 20,
  },
  statText: {
    fontSize: 14,
    color: '#aaa',
    marginBottom: 4,
  },
  genreContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  genreTag: {
    backgroundColor: '#dc2626',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  genreText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '500',
  },
  castSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  castContainer: {
    gap: 4,
  },
  castText: {
    fontSize: 14,
    color: '#ccc',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
  },
  actionButton: {
    alignItems: 'center',
  },
  actionIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  actionText: {
    fontSize: 12,
    color: '#aaa',
  },
});

export default VideoPlayerScreen;