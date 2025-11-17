import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { Video, ResizeMode } from 'react-native-video';
import type { Content } from '../types';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface VideoPlayerProps {
  content: Content;
  onEnd?: () => void;
  onProgress?: (progress: { currentTime: number; duration: number }) => void;
  autoPlay?: boolean;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  content,
  onEnd,
  onProgress,
  autoPlay = true,
}) => {
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isLoading, setIsLoading] = useState(true);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const videoRef = useRef<any>(null);
  const controlsTimeoutRef = useRef<any>();

  useEffect(() => {
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, []);

  const handleLoad = (payload: any) => {
    setIsLoading(false);
    setDuration(payload.duration || 0);
  };

  const handleProgress = (payload: any) => {
    setCurrentTime(payload.currentTime || 0);
    onProgress?.({
      currentTime: payload.currentTime || 0,
      duration: payload.duration || duration,
    });
  };

  const handleEnd = () => {
    setIsPlaying(false);
    onEnd?.();
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
    showControlsTemporarily();
  };

  const showControlsTemporarily = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      setShowControls(false);
    }, 3000);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSeek = (position: number) => {
    if (videoRef.current) {
      videoRef.current.seek(position);
    }
  };

  const handleSeekPress = (event: any) => {
    const { locationX } = event.nativeEvent;
    const seekPosition = (locationX / screenWidth) * duration;
    handleSeek(seekPosition);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const renderControls = () => (
    <View style={styles.controlsContainer}>
      {/* Play/Pause Button */}
      <View style={styles.controlsRow}>
        <TouchableOpacity
          style={styles.controlButton}
          onPress={togglePlayPause}
          activeOpacity={0.7}
        >
          <Text style={styles.controlText}>
            {isPlaying ? '⏸' : '▶'}
          </Text>
        </TouchableOpacity>

        {/* Time Display */}
        <Text style={styles.timeText}>
          {formatTime(currentTime)} / {formatTime(duration)}
        </Text>

        {/* Fullscreen Button */}
        <TouchableOpacity
          style={styles.controlButton}
          onPress={toggleFullscreen}
          activeOpacity={0.7}
        >
          <Text style={styles.controlText}>
            {isFullscreen ? '⤓' : '⤢'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Progress Bar */}
      <TouchableOpacity
        style={styles.progressContainer}
        onPress={handleSeekPress}
        activeOpacity={0.7}
      >
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { width: `${(currentTime / duration) * 100 || 0}%` },
            ]}
          />
        </View>
      </TouchableOpacity>

      {/* Video Info */}
      <View style={styles.videoInfo}>
        <Text style={styles.videoTitle} numberOfLines={2}>
          {content.title}
        </Text>
        <Text style={styles.videoMeta}>
          {content.year && `${content.year} • `}
          {content.rating && `⭐ ${content.rating} • `}
          {content.duration}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, isFullscreen && styles.fullscreenContainer]}>
      <Video
        ref={videoRef}
        source={{ uri: content.video_url || '' }}
        style={styles.video}
        resizeMode={ResizeMode.CONTAIN}
        shouldPlay={isPlaying}
        isLooping={false}
        useNativeControls={false}
        onLoad={handleLoad}
        onProgress={handleProgress}
        onEnd={handleEnd}
        onError={(error) => {
          console.error('Video playback error:', error);
          setIsLoading(false);
        }}
      />

      {/* Loading Indicator */}
      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#fff" />
        </View>
      )}

      {/* Controls Overlay */}
      {showControls && renderControls()}

      {/* Tap to show controls */}
      <TouchableOpacity
        style={styles.tapOverlay}
        onPress={showControlsTemporarily}
        activeOpacity={1}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    position: 'relative',
  },
  fullscreenContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
  },
  video: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  tapOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
  },
  controlsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: 20,
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  controlButton: {
    padding: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  controlText: {
    fontSize: 18,
    color: '#fff',
    textAlign: 'center',
  },
  timeText: {
    fontSize: 14,
    color: '#fff',
    fontFamily: 'monospace',
  },
  progressContainer: {
    marginBottom: 15,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#dc2626',
    borderRadius: 2,
  },
  videoInfo: {
    marginTop: 10,
  },
  videoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  videoMeta: {
    fontSize: 14,
    color: '#ccc',
  },
});

export default VideoPlayer;