import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  StatusBar,
  TouchableWithoutFeedback,
  Dimensions,
} from 'react-native';
import Video from 'react-native-video';
import Slider from '@react-native-community/slider';
import LinearGradient from 'react-native-linear-gradient';
import Orientation from 'react-native-orientation-locker';

interface NetflixPlayerProps {
  source: string;
  onBack: () => void;
  title: string;
}

const NETFLIX_RED = '#E50914';
const CONTROL_TIMEOUT = 3000; // 3 seconds - Netflix-like timing
const SEEK_AMOUNT = 10; // seconds

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const NetflixPlayer: React.FC<NetflixPlayerProps> = ({ source, onBack, title }) => {
  const videoRef = useRef<Video>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastTapRef = useRef<{ time: number; side: 'left' | 'right' | null }>({
    time: 0,
    side: null,
  });

  // Playback State
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isBuffering, setIsBuffering] = useState(false);

  // UI State
  const [showControls, setShowControls] = useState(true); // Show controls on mount
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [wasPlayingBeforeScrub, setWasPlayingBeforeScrub] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showSubtitles, setShowSubtitles] = useState(false);

  // Animation States
  const controlsOpacity = useRef(new Animated.Value(1)).current; // Start visible
  const seekAnimationLeft = useRef(new Animated.Value(0)).current;
  const seekAnimationRight = useRef(new Animated.Value(0)).current;

  // Force landscape on mount, revert on unmount
  useEffect(() => {
    StatusBar.setHidden(true);
    Orientation.lockToLandscape();

    return () => {
      StatusBar.setHidden(false);
      Orientation.lockToPortrait();
    };
  }, []);

  // Auto-hide controls after 4 seconds of inactivity
  useEffect(() => {
    if (showControls && !isScrubbing && isPlaying) {
      resetControlsTimer();
    }

    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [showControls, isScrubbing, isPlaying]);

  // Animate controls visibility
  useEffect(() => {
    Animated.timing(controlsOpacity, {
      toValue: showControls ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [showControls]);

  const resetControlsTimer = () => {
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying && !isScrubbing) {
        setShowControls(false);
      }
    }, CONTROL_TIMEOUT);
  };

  const toggleControls = () => {
    setShowControls((prev) => !prev);
    if (!showControls) {
      resetControlsTimer();
    }
  };

  const togglePlayPause = () => {
    setIsPlaying((prev) => !prev);
    setShowControls(true);
    resetControlsTimer();
  };

  const toggleFullscreen = () => {
    const newFullscreenState = !isFullscreen;
    console.log('Toggling fullscreen:', newFullscreenState);
    setIsFullscreen(newFullscreenState);
    setShowControls(true);
    resetControlsTimer();
  };

  const toggleMute = () => {
    setIsMuted((prev) => !prev);
    setShowControls(true);
    resetControlsTimer();
  };

  const toggleSubtitles = () => {
    setShowSubtitles((prev) => !prev);
    setShowControls(true);
    resetControlsTimer();
  };

  const handleSeek = (direction: 'left' | 'right') => {
    const seekTime = direction === 'left' ? -SEEK_AMOUNT : SEEK_AMOUNT;
    const newTime = Math.max(0, Math.min(currentTime + seekTime, duration));

    if (videoRef.current) {
      videoRef.current.seek(newTime);
      setCurrentTime(newTime);
    }

    // Animate seek icon - always start from 0
    const animation = direction === 'left' ? seekAnimationLeft : seekAnimationRight;
    animation.setValue(0);
    Animated.sequence([
      Animated.timing(animation, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.delay(300),
      Animated.timing(animation, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Ensure animation is reset to 0 after completion
      animation.setValue(0);
    });

    setShowControls(true);
    resetControlsTimer();
  };

  // Handle tap for double-tap detection on side zones only
  const handleSideTap = (side: 'left' | 'right') => {
    const now = Date.now();
    const timeSinceLastTap = now - lastTapRef.current.time;

    if (timeSinceLastTap < 300 && lastTapRef.current.side === side) {
      // Double tap detected
      handleSeek(side);
      lastTapRef.current = { time: 0, side: null };
    } else {
      // Single tap
      lastTapRef.current = { time: now, side };
    }
  };

  // Video event handlers
  const onLoad = (data: any) => {
    console.log('Video loaded, duration:', data.duration);
    setDuration(data.duration);
    setIsLoading(false);
  };

  const onProgress = (data: any) => {
    if (!isScrubbing) {
      const newTime = data.currentTime || 0;
      setCurrentTime(newTime);
      console.log('Progress update:', newTime.toFixed(1), 's /', duration.toFixed(1), 's');
    }
  };

  const onBuffer = ({ isBuffering: buffering }: any) => {
    setIsBuffering(buffering);
  };

  const onError = (error: any) => {
    console.error('Video error:', error);
    setIsLoading(false);
  };

  // Smooth scrubbing handlers
  const handleSlidingStart = () => {
    console.log('Slider: Start scrubbing');
    setIsScrubbing(true);
    setWasPlayingBeforeScrub(isPlaying);
    if (isPlaying) {
      setIsPlaying(false);
    }
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
  };

  const handleSlidingComplete = (value: number) => {
    console.log('Slider: Complete, seeking to', value);
    if (videoRef.current) {
      videoRef.current.seek(value);
      setCurrentTime(value);
    }
    setIsScrubbing(false);
    if (wasPlayingBeforeScrub) {
      setIsPlaying(true);
    }
    resetControlsTimer();
  };

  const handleValueChange = (value: number) => {
    console.log('Slider: Value change', value);
    setCurrentTime(value);
  };

  const formatTime = (seconds: number): string => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      {/* Video Container - Ensures proper centering */}
      <View style={styles.videoContainer}>
        <Video
          ref={videoRef}
          source={{ uri: source }}
          style={styles.video}
          resizeMode="contain"
          paused={!isPlaying}
          muted={isMuted}
          onLoad={onLoad}
          onProgress={onProgress}
          onBuffer={onBuffer}
          onError={onError}
          controls={false}
          playInBackground={false}
          playWhenInactive={false}
          progressUpdateInterval={250}
          repeat={false}
          reportBandwidth={true}
        />
      </View>

      {/* Loading Indicator */}
      {(isLoading || isBuffering) && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={NETFLIX_RED} />
        </View>
      )}

      {/* Seek Animation Icons - Always rendered, controlled by opacity */}
      <View style={styles.seekIconsContainer} pointerEvents="none">
        <Animated.View
          style={[
            styles.seekIconLeft,
            {
              opacity: seekAnimationLeft,
              transform: [{ scale: seekAnimationLeft }],
            },
          ]}
        >
          <View style={styles.seekIconContainer}>
            <Text style={styles.seekIconText}>« 10s</Text>
          </View>
        </Animated.View>

        <Animated.View
          style={[
            styles.seekIconRight,
            {
              opacity: seekAnimationRight,
              transform: [{ scale: seekAnimationRight }],
            },
          ]}
        >
          <View style={styles.seekIconContainer}>
            <Text style={styles.seekIconText}>10s »</Text>
          </View>
        </Animated.View>
      </View>

      {/* Full Screen Tap Area - Always active for toggle controls and double-tap seek */}
      <View style={styles.tapZonesContainer} pointerEvents="box-none">
        <TouchableWithoutFeedback onPress={() => handleSideTap('left')}>
          <View style={styles.leftTapZone} />
        </TouchableWithoutFeedback>

        <TouchableWithoutFeedback onPress={toggleControls}>
          <View style={styles.centerTapZone} />
        </TouchableWithoutFeedback>

        <TouchableWithoutFeedback onPress={() => handleSideTap('right')}>
          <View style={styles.rightTapZone} />
        </TouchableWithoutFeedback>
      </View>

      {/* Controls Overlay - SELALU DI ATAS */}
      {showControls && (
        <Animated.View
          style={[styles.controlsContainer, { opacity: controlsOpacity }]}
        >
          {/* Top Gradient Overlay with Back Button */}
          <LinearGradient
            colors={['rgba(0,0,0,0.8)', 'rgba(0,0,0,0.5)', 'rgba(0,0,0,0.2)', 'transparent']}
            style={styles.topGradient}
          >
            <View style={styles.topBar}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={onBack}
                activeOpacity={0.7}
              >
                <Text style={styles.backIcon}>‹</Text>
              </TouchableOpacity>
              <Text style={styles.videoTitle} numberOfLines={1}>
                {title}
              </Text>
              <View style={styles.spacer} />
            </View>
          </LinearGradient>

          {/* Center Play/Pause Button */}
          <View style={styles.centerControls} pointerEvents="box-none">
            <TouchableOpacity
              style={styles.centerPlayButton}
              onPress={togglePlayPause}
              activeOpacity={0.8}
            >
              <Text style={styles.playIcon}>{isPlaying ? '║║' : '▶'}</Text>
            </TouchableOpacity>
          </View>

          {/* Bottom Gradient Overlay */}
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.2)', 'rgba(0,0,0,0.5)', 'rgba(0,0,0,0.85)']}
            style={styles.bottomGradient}
          >
            {/* Progress Bar */}
            <View style={styles.progressSection}>
              <View style={styles.timeRow}>
                <Text style={styles.timeText}>{formatTime(currentTime)}</Text>
                <Text style={styles.timeText}>{formatTime(duration)}</Text>
              </View>
              <Slider
                style={styles.slider}
                minimumValue={0}
                maximumValue={duration > 0 ? duration : 100}
                value={currentTime}
                onValueChange={handleValueChange}
                onSlidingStart={handleSlidingStart}
                onSlidingComplete={handleSlidingComplete}
                minimumTrackTintColor={NETFLIX_RED}
                maximumTrackTintColor="rgba(255,255,255,0.3)"
                thumbTintColor={NETFLIX_RED}
                step={0.1}
                disabled={duration === 0}
              />
            </View>

            {/* Bottom Controls */}
            <View style={styles.bottomControls}>
              <View style={styles.leftControls}>
                <TouchableOpacity style={styles.controlBtn} onPress={togglePlayPause}>
                  <Text style={styles.controlIcon}>{isPlaying ? '║' : '▶'}</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.controlBtn} onPress={() => handleSeek('left')}>
                  <Text style={styles.controlIcon}>«</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.controlBtn} onPress={() => handleSeek('right')}>
                  <Text style={styles.controlIcon}>»</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.controlBtn} onPress={toggleMute}>
                  <Text style={[styles.controlIcon, isMuted && styles.controlIconActive]}>
                    {isMuted ? '🔇' : '🔊'}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.rightControls}>
                <TouchableOpacity style={styles.controlBtn} onPress={toggleSubtitles}>
                  <Text style={[styles.controlIcon, showSubtitles && styles.controlIconActive]}>
                    CC
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.controlBtn} onPress={toggleFullscreen}>
                  <Text style={styles.controlIcon}>{isFullscreen ? '[ ]' : '⛶'}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </LinearGradient>
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  videoContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  video: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    zIndex: 5,
  },
  seekIconsContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9,
    pointerEvents: 'none',
  },
  seekIconLeft: {
    position: 'absolute',
    left: '15%',
    top: '40%',
  },
  seekIconRight: {
    position: 'absolute',
    right: '15%',
    top: '40%',
  },
  tapZonesContainer: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
    zIndex: 5, // Below controls (zIndex 10) so buttons remain clickable
  },
  leftTapZone: {
    width: '35%',
    height: '100%',
  },
  centerTapZone: {
    flex: 1, // Take remaining space
    height: '100%',
  },
  rightTapZone: {
    width: '35%',
    height: '100%',
  },
  seekIconContainer: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  seekIconText: {
    fontSize: 18,
    color: 'white',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  controlsContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10,
  },
  topGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingTop: 12,
    paddingBottom: 35,
    zIndex: 13,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  backIcon: {
    fontSize: 32,
    color: 'white',
    fontWeight: '300',
  },
  videoTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: 'white',
    letterSpacing: 0.3,
  },
  spacer: {
    width: 36,
  },
  centerControls: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 11,
  },
  centerPlayButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.9)',
  },
  playIcon: {
    fontSize: 32,
    color: 'white',
  },
  bottomGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingTop: 50,
    paddingBottom: 15,
    zIndex: 12,
  },
  progressSection: {
    paddingHorizontal: 18,
    marginBottom: 8,
    zIndex: 999,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
    zIndex: 999,
  },
  timeText: {
    color: 'rgba(255,255,255,0.95)',
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  slider: {
    width: '100%',
    height: 30,
    zIndex: 999,
  },
  bottomControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 8,
    zIndex: 100,
  },
  leftControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rightControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  controlBtn: {
    padding: 8,
    marginHorizontal: 5,
    zIndex: 100,
  },
  controlIcon: {
    fontSize: 20,
    color: 'white',
    fontWeight: '400',
  },
  controlIconActive: {
    color: NETFLIX_RED,
  },
});

export default NetflixPlayer;
