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
const CONTROL_TIMEOUT = 4000;
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
  const [showControls, setShowControls] = useState(true);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [wasPlayingBeforeScrub, setWasPlayingBeforeScrub] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Animation States
  const controlsOpacity = useRef(new Animated.Value(1)).current;
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

  const handleSeek = (direction: 'left' | 'right') => {
    const seekTime = direction === 'left' ? -SEEK_AMOUNT : SEEK_AMOUNT;
    const newTime = Math.max(0, Math.min(currentTime + seekTime, duration));

    if (videoRef.current) {
      videoRef.current.seek(newTime);
      setCurrentTime(newTime);
    }

    // Animate seek icon
    const animation = direction === 'left' ? seekAnimationLeft : seekAnimationRight;
    animation.setValue(1);
    Animated.sequence([
      Animated.timing(animation, {
        toValue: 1.2,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(animation, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

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
      {/* Video Component - FULL SCREEN */}
      <Video
        ref={videoRef}
        source={{ uri: source }}
        style={styles.video}
        resizeMode={isFullscreen ? 'cover' : 'contain'}
        paused={!isPlaying}
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

      {/* Loading Indicator */}
      {(isLoading || isBuffering) && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={NETFLIX_RED} />
        </View>
      )}

      {/* Tap zones - HANYA untuk double-tap seek, tidak menutupi bottom controls */}
      {!showControls && (
        <View style={styles.tapZonesContainer}>
          <TouchableWithoutFeedback onPress={() => handleSideTap('left')}>
            <View style={styles.leftTapZone}>
              <Animated.View
                style={[
                  styles.seekIconContainer,
                  {
                    opacity: seekAnimationLeft,
                    transform: [{ scale: seekAnimationLeft }],
                  },
                ]}
                pointerEvents="none"
              >
                <Text style={styles.seekIconText}>⏪ 10s</Text>
              </Animated.View>
            </View>
          </TouchableWithoutFeedback>

          <TouchableWithoutFeedback onPress={toggleControls}>
            <View style={styles.centerTapZone} />
          </TouchableWithoutFeedback>

          <TouchableWithoutFeedback onPress={() => handleSideTap('right')}>
            <View style={styles.rightTapZone}>
              <Animated.View
                style={[
                  styles.seekIconContainer,
                  {
                    opacity: seekAnimationRight,
                    transform: [{ scale: seekAnimationRight }],
                  },
                ]}
                pointerEvents="none"
              >
                <Text style={styles.seekIconText}>10s ⏩</Text>
              </Animated.View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      )}

      {/* Controls Overlay - SELALU DI ATAS */}
      {showControls && (
        <Animated.View
          style={[styles.controlsContainer, { opacity: controlsOpacity }]}
        >
          {/* Top Area - Transparent tap zone untuk back */}
          <TouchableOpacity
            style={styles.backTapZone}
            onPress={onBack}
            activeOpacity={0.3}
          >
            <LinearGradient
              colors={['rgba(0,0,0,0.3)', 'transparent']}
              style={styles.backGradient}
              pointerEvents="none"
            >
              <Text style={styles.videoTitle} numberOfLines={1}>
                {title}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Center Play/Pause Button */}
          <View style={styles.centerControls}>
            <TouchableOpacity
              style={styles.centerPlayButton}
              onPress={togglePlayPause}
              activeOpacity={0.8}
            >
              <Text style={styles.playIcon}>{isPlaying ? '❚❚' : '▶'}</Text>
            </TouchableOpacity>
          </View>

          {/* Bottom Gradient Overlay */}
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.4)', 'rgba(0,0,0,0.8)']}
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
                  <Text style={styles.controlIcon}>{isPlaying ? '❚❚' : '▶'}</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.controlBtn} onPress={() => handleSeek('left')}>
                  <Text style={styles.controlIcon}>⏪</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.controlBtn} onPress={() => handleSeek('right')}>
                  <Text style={styles.controlIcon}>⏩</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.controlBtn}>
                  <Text style={styles.controlIcon}>🔊</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.rightControls}>
                <TouchableOpacity style={styles.controlBtn}>
                  <Text style={styles.controlIcon}>CC</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.controlBtn}>
                  <Text style={styles.controlIcon}>⚙</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.controlBtn} onPress={toggleFullscreen}>
                  <Text style={styles.controlIcon}>{isFullscreen ? '⊡' : '⛶'}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </LinearGradient>

          {/* Transparent tap area untuk hide controls - tidak menutupi bottom controls */}
          <TouchableWithoutFeedback onPress={toggleControls}>
            <View style={styles.hideTapArea} />
          </TouchableWithoutFeedback>
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    backgroundColor: '#000',
  },
  video: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    zIndex: 5,
  },
  tapZonesContainer: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
    zIndex: 8,
  },
  leftTapZone: {
    width: '35%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerTapZone: {
    width: '30%',
    height: '100%',
  },
  rightTapZone: {
    width: '35%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  seekIconContainer: {
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 10,
    paddingHorizontal: 25,
    paddingVertical: 20,
  },
  seekIconText: {
    fontSize: 24,
    color: 'white',
    fontWeight: 'bold',
  },
  controlsContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10,
  },
  backTapZone: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '30%',
    height: '25%',
    zIndex: 11,
  },
  backGradient: {
    flex: 1,
    justifyContent: 'center',
    paddingLeft: 20,
    paddingTop: 10,
  },
  videoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.9)',
  },
  centerControls: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 11,
  },
  centerPlayButton: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.8)',
  },
  playIcon: {
    fontSize: 40,
    color: 'white',
  },
  bottomGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingTop: 60,
    paddingBottom: 20,
    zIndex: 12,
  },
  progressSection: {
    paddingHorizontal: 20,
    marginBottom: 10,
    zIndex: 999,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
    zIndex: 999,
  },
  timeText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  slider: {
    width: '100%',
    height: 40,
    zIndex: 999,
  },
  bottomControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 10,
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
    padding: 10,
    marginHorizontal: 8,
    zIndex: 100,
  },
  controlIcon: {
    fontSize: 28,
    color: 'white',
  },
  hideTapArea: {
    position: 'absolute',
    top: '25%',
    left: '30%',
    right: 0,
    bottom: 180,
    zIndex: 1,
  },
});

export default NetflixPlayer;
