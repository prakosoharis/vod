import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Dimensions, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';
import Video from 'react-native-video';
import { SafeIcon } from '../../components/ui';
import { contentService } from '../../services';
import { RootStackParamList } from '../../types';
import { COLORS } from '../../constants';

type Props = NativeStackScreenProps<RootStackParamList, 'VideoPlayer'>;

const VideoPlayerScreen: React.FC<Props> = ({ route }) => {
  const { contentId } = route.params;
  const dimensions = Dimensions.get('window');
  const width = dimensions.width;
  const height = dimensions.height;
  const videoRef = useRef<Video>(null);
  const progressRef = useRef<View>(null);

  // Player states
  const [isPlaying, setIsPlaying] = useState(true);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [volume, setVolume] = useState(1.0);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [isLoading, setIsLoading] = useState(true);
  const [isBuffering, setIsBuffering] = useState(false);
  const [showCenterPlay, setShowCenterPlay] = useState(false);
  const [orientation, setOrientation] = useState(width > height ? 'landscape' : 'portrait');

  // Progress bar states
  const [isSeeking, setIsSeeking] = useState(false);
  const [seekTime, setSeekTime] = useState(0);
  const [showPlaybackSpeedMenu, setShowPlaybackSpeedMenu] = useState(false);
  const [progressBarWidth, setProgressBarWidth] = useState(0);

  // Error handling
  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data: content, isLoading: isContentLoading, error: queryError } = useQuery({
    queryKey: ['content', contentId],
    queryFn: () => contentService.getContentById(contentId),
    enabled: !!contentId,
  });

  useEffect(() => {
    let controlsTimer: NodeJS.Timeout;
    if (showControls) {
      controlsTimer = setTimeout(() => {
        // Don't auto-hide controls in fullscreen mode
        if (!isFullscreen) {
          setShowControls(false);
        }
      }, 3000);
    }
    return () => clearTimeout(controlsTimer);
  }, [showControls, isFullscreen]);

  // Handle orientation changes
  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      const newOrientation = window.width > window.height ? 'landscape' : 'portrait';
      setOrientation(newOrientation);
      // Force re-render when orientation changes
      if (isFullscreen) {
        setShowControls(true);
      }
    });

    return () => subscription?.remove();
  }, [isFullscreen]);

  const onProgress = (data: any) => {
    if (!isSeeking) {
      setCurrentTime(data.currentTime);
    }
  };

  const onLoad = (data: any) => {
    setDuration(data.duration);
    setIsLoading(false);
    setShowCenterPlay(false);
  };

  const onLoadStart = () => {
    setIsLoading(true);
    setIsBuffering(true);
  };

  const onBuffer = ({ isBuffering: buffering }: any) => {
    setIsBuffering(buffering);
  };

  const onReadyForDisplay = () => {
    setIsLoading(false);
    setIsBuffering(false);
    setHasError(false);
    setError(null);
  };

  const onError = (error: any) => {
    console.error('Video error:', error);
    setHasError(true);
    setError('Gagal memuat video. Silakan coba lagi.');
    setIsLoading(false);
    setIsBuffering(false);
    setIsPlaying(false);
  };

  const onEnd = () => {
    setIsPlaying(false);
    setShowCenterPlay(true);
  };

  const retryPlayback = () => {
    setHasError(false);
    setError(null);
    setIsLoading(true);
    if (videoRef.current) {
      videoRef.current.seek(0);
    }
    setCurrentTime(0);
    setIsPlaying(true);
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
    setShowControls(true);
    setShowCenterPlay(false);
  };

  const toggleControls = () => {
    setShowControls(!showControls);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
    setShowControls(true);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const skipForward = () => {
    const newTime = Math.min(currentTime + 10, duration);
    seekToTime(newTime);
  };

  const skipBackward = () => {
    const newTime = Math.max(currentTime - 10, 0);
    seekToTime(newTime);
  };

  const seekToTime = (time: number) => {
    if (videoRef.current) {
      videoRef.current.seek(time);
      setCurrentTime(time);
    }
  };

  const changePlaybackSpeed = (rate: number) => {
    setPlaybackRate(rate);
    setShowPlaybackSpeedMenu(false);
  };

  const handleProgressPress = (e: any) => {
    const { locationX } = e.nativeEvent;
    if (progressBarWidth > 0 && duration > 0) {
      const seekTime = (locationX / progressBarWidth) * duration;
      seekToTime(seekTime);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Dynamic video container styles
  const videoContainerStyle = {
    backgroundColor: '#000000',
    height: isFullscreen
      ? (orientation === 'landscape' ? height : width * 0.5625)
      : height * 0.3,
    width: isFullscreen ? width : '100%',
    position: isFullscreen ? 'absolute' : 'relative' as const,
    top: isFullscreen ? 0 : undefined,
    left: isFullscreen ? 0 : undefined,
    right: isFullscreen ? 0 : undefined,
    bottom: isFullscreen ? 0 : undefined,
    zIndex: isFullscreen ? 9999 : 1,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  };

  if (!content) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Content not found</Text>
      </View>
    );
  }

  if (!content.video_url) {
    return (
      <View style={styles.container}>
        <Text style={styles.noVideoText}>Video not available</Text>
        <Text style={styles.title}>{content.title}</Text>
        <Text style={styles.description}>{content.description}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Video Player - Single Component */}
      <View style={videoContainerStyle}>
        <Video
          ref={videoRef}
          source={{ uri: content.video_url }}
          style={styles.video}
          controls={false}
          resizeMode="contain"
          onProgress={onProgress}
          onLoad={onLoad}
          onLoadStart={onLoadStart}
          onBuffer={onBuffer}
          onReadyForDisplay={onReadyForDisplay}
          onError={onError}
          onEnd={onEnd}
          paused={!isPlaying}
          volume={volume}
          muted={isMuted}
          rate={playbackRate}
          fullscreen={false}
          playInBackground={false}
          playWhenInactive={false}
        />

        {/* Error Overlay */}
        {hasError && (
          <View style={styles.errorOverlay}>
            <SafeIcon name="close" size={48} color={COLORS.primary} />
            <Text style={styles.errorText}>{error || 'Terjadi kesalahan'}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={retryPlayback}>
              <SafeIcon name="replay" size={20} color={COLORS.text} />
              <Text style={styles.retryButtonText}>Coba Lagi</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Loading Spinner */}
        {isLoading && !hasError && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        )}

        {/* Buffering Indicator */}
        {isBuffering && !isLoading && (
          <View style={styles.bufferingIndicator}>
            <ActivityIndicator size="small" color={COLORS.text} />
          </View>
        )}

        {/* Center Play Button */}
        {!isPlaying && !isLoading && (
          <TouchableOpacity
            style={styles.centerPlayButton}
            onPress={togglePlayPause}
            activeOpacity={0.8}
          >
            <SafeIcon
              name="play-arrow"
              size={64}
              color={COLORS.text}
            />
          </TouchableOpacity>
        )}

        {/* Touch area for controls in fullscreen - bottom area */}
        {isFullscreen && !showControls && (
          <TouchableOpacity
            style={styles.fullscreenControlsArea}
            onPress={toggleControls}
            activeOpacity={1}
          />
        )}

        {/* Custom Controls */}
        <TouchableOpacity style={styles.videoOverlay} onPress={toggleControls} activeOpacity={1}>
          {showControls && (
            <View style={[styles.controls, isFullscreen && { paddingBottom: 20 }]}>
              {/* Progress Bar */}
              <TouchableOpacity
                style={styles.progressBarContainer}
                onPress={handleProgressPress}
                onLayout={(e) => setProgressBarWidth(e.nativeEvent.layout.width)}
                activeOpacity={0.8}
              >
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: duration > 0 ? (currentTime / duration) * 100 + '%' : '0%' }
                    ]}
                  />
                </View>
              </TouchableOpacity>

              {/* Control Buttons */}
              <View style={styles.controlButtons}>
                {/* Left side controls */}
                <View style={styles.leftControls}>
                  <TouchableOpacity style={styles.controlButton} onPress={togglePlayPause}>
                    <SafeIcon
                      name={isPlaying ? 'pause' : 'play-arrow'}
                      size={28}
                      color={COLORS.text}
                    />
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.controlButton} onPress={skipBackward}>
                    <SafeIcon
                      name="replay"
                      size={24}
                      color={COLORS.text}
                    />
                    <Text style={styles.skipText}>-10s</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.controlButton} onPress={skipForward}>
                    <SafeIcon
                      name="skip-next"
                      size={24}
                      color={COLORS.text}
                    />
                    <Text style={styles.skipText}>+10s</Text>
                  </TouchableOpacity>
                </View>

                {/* Center - Time display */}
                <View style={styles.timeContainer}>
                  <Text style={styles.timeText}>
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </Text>
                </View>

                {/* Right side controls */}
                <View style={styles.rightControls}>
                  <TouchableOpacity style={styles.controlButton} onPress={toggleMute}>
                    <SafeIcon
                      name={isMuted ? 'volume-off' : 'volume-up'}
                      size={24}
                      color={COLORS.text}
                    />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.controlButton}
                    onPress={() => setShowPlaybackSpeedMenu(!showPlaybackSpeedMenu)}
                  >
                    <Text style={styles.speedText}>{playbackRate}x</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.controlButton} onPress={toggleFullscreen}>
                    <SafeIcon
                      name={isFullscreen ? 'fullscreen-exit' : 'fullscreen'}
                      size={24}
                      color={COLORS.text}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Playback Speed Menu */}
              {showPlaybackSpeedMenu && (
                <View style={styles.speedMenu}>
                  {[0.5, 0.75, 1, 1.25, 1.5, 2].map((rate) => (
                    <TouchableOpacity
                      key={rate}
                      style={[
                        styles.speedOption,
                        playbackRate === rate && styles.speedOptionActive
                      ]}
                      onPress={() => changePlaybackSpeed(rate)}
                    >
                      <Text style={[
                        styles.speedOptionText,
                        playbackRate === rate && styles.speedOptionTextActive
                      ]}>
                        {rate}x
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Content Info */}
      {!isFullscreen && (
        <View style={styles.contentInfo}>
          <Text style={styles.title}>{content.title}</Text>
          <Text style={styles.description}>{content.description}</Text>
          <Text style={styles.metadata}>
            {content.year} • {content.genre.join(', ')} • {content.duration}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  video: {
    width: '100%',
    height: '100%',
  },
  videoOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Error and loading styles
  errorOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: 20,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 16,
  },
  retryButtonText: {
    color: COLORS.text,
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
  },
  bufferingIndicator: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -12,
    marginLeft: -12,
  },
  centerPlayButton: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -32,
    marginLeft: -32,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 50,
    width: 64,
    height: 64,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullscreenControlsArea: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Controls styles
  controls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  progressBarContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    width: '100%',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 2,
  },
  controlButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  leftControls: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  rightControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  controlButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 8,
    flexDirection: 'row',
  },
  skipText: {
    color: COLORS.text,
    fontSize: 10,
    marginLeft: 2,
  },
  speedText: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: 'bold',
  },
  timeContainer: {
    flex: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
    marginHorizontal: 8,
  },
  // Speed menu styles
  speedMenu: {
    position: 'absolute',
    right: 16,
    bottom: 80,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    borderRadius: 8,
    padding: 4,
  },
  speedOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginVertical: 2,
    borderRadius: 4,
  },
  speedOptionActive: {
    backgroundColor: COLORS.primary,
  },
  speedOptionText: {
    color: COLORS.text,
    fontSize: 14,
  },
  speedOptionTextActive: {
    color: '#000',
    fontWeight: 'bold',
  },
  timeText: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '500',
  },
  contentInfo: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginBottom: 16,
    lineHeight: 24,
  },
  metadata: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 16,
  },
  noVideoText: {
    fontSize: 18,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 50,
    marginBottom: 20,
  },
  loadingText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginTop: 16,
  },
  errorText: {
    fontSize: 16,
    color: '#FF4444',
    textAlign: 'center',
  },
});

export default VideoPlayerScreen;