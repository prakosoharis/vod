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
  Modal,
  ScrollView,
} from 'react-native';
import Video from 'react-native-video';
import Slider from '@react-native-community/slider';
import LinearGradient from 'react-native-linear-gradient';
import Orientation from 'react-native-orientation-locker';
import { SafeIcon } from '../ui';
import { COLORS } from '../../constants';

interface HLSPlayerProps {
  source: string;
  onBack: () => void;
  title: string;
  onProgress?: (progress: number) => void;
}

const CONTROL_TIMEOUT = 3000;
const SEEK_AMOUNT = 10;

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const QUALITY_OPTIONS = ['Auto', '1080p', '720p', '480p', '360p'];
const SPEED_OPTIONS = [
  { label: '0.25x', value: 0.25 },
  { label: '0.5x', value: 0.5 },
  { label: '0.75x', value: 0.75 },
  { label: '1x', value: 1.0 },
  { label: '1.25x', value: 1.25 },
  { label: '1.5x', value: 1.5 },
  { label: '1.75x', value: 1.75 },
  { label: '2x', value: 2.0 },
];

const HLSPlayer: React.FC<HLSPlayerProps> = ({ source, onBack, title, onProgress }) => {
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
  const [playbackRate, setPlaybackRate] = useState(1.0);

  // UI State
  const [showControls, setShowControls] = useState(true);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [wasPlayingBeforeScrub, setWasPlayingBeforeScrub] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  // Modal States
  const [showQualityModal, setShowQualityModal] = useState(false);
  const [showMoreModal, setShowMoreModal] = useState(false);
  const [showSpeedModal, setShowSpeedModal] = useState(false);
  const [selectedQuality, setSelectedQuality] = useState('Auto');

  // Animation States
  const controlsOpacity = useRef(new Animated.Value(1)).current;
  const seekAnimationLeft = useRef(new Animated.Value(0)).current;
  const seekAnimationRight = useRef(new Animated.Value(0)).current;

  // Force landscape on mount
  useEffect(() => {
    StatusBar.setHidden(true);
    Orientation.lockToLandscape();

    return () => {
      StatusBar.setHidden(false);
      Orientation.lockToPortrait();
    };
  }, []);

  // Auto-hide controls
  useEffect(() => {
    if (showControls && !isScrubbing && isPlaying && !showQualityModal && !showMoreModal && !showSpeedModal) {
      resetControlsTimer();
    }

    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [showControls, isScrubbing, isPlaying, showQualityModal, showMoreModal, showSpeedModal]);

  // Animate controls visibility
  useEffect(() => {
    Animated.timing(controlsOpacity, {
      toValue: showControls ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [showControls]);

  // Sync progress to parent component
  useEffect(() => {
    if (onProgress && currentTime > 0) {
      onProgress(currentTime);
    }
  }, [currentTime]);

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

  const toggleMute = () => {
    setIsMuted((prev) => !prev);
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
      animation.setValue(0);
    });

    setShowControls(true);
    resetControlsTimer();
  };

  const handleSideTap = (side: 'left' | 'right') => {
    const now = Date.now();
    const timeSinceLastTap = now - lastTapRef.current.time;

    if (timeSinceLastTap < 300 && lastTapRef.current.side === side) {
      handleSeek(side);
      lastTapRef.current = { time: 0, side: null };
    } else {
      lastTapRef.current = { time: now, side };
    }
  };

  // Video event handlers
  const onLoad = (data: any) => {
    setDuration(data.duration);
    setIsLoading(false);
  };

  const onProgressUpdate = (data: any) => {
    if (!isScrubbing) {
      const newTime = data.currentTime || 0;
      setCurrentTime(newTime);
    }
  };

  const onBuffer = ({ isBuffering: buffering }: any) => {
    setIsBuffering(buffering);
  };

  const onError = (error: any) => {
    console.error('Video error:', error);
    setIsLoading(false);
  };

  const handleSlidingStart = () => {
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
    setCurrentTime(value);
  };

  const handleQualitySelect = (quality: string) => {
    setSelectedQuality(quality);
    setShowQualityModal(false);
    setShowControls(true);
    resetControlsTimer();
  };

  const handleSpeedSelect = (speed: number) => {
    setPlaybackRate(speed);
    setShowSpeedModal(false);
    setShowMoreModal(false);
    setShowControls(true);
    resetControlsTimer();
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

  const renderQualityModal = () => (
    <Modal
      visible={showQualityModal}
      transparent
      animationType="slide"
      onRequestClose={() => setShowQualityModal(false)}
    >
      <TouchableWithoutFeedback onPress={() => setShowQualityModal(false)}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback>
            <View style={styles.modalContent}>
              <LinearGradient
                colors={[COLORS.warmCharcoal[50], COLORS.warmCharcoal[100]]}
                style={styles.modalGradient}
              >
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Video Quality</Text>
                  <TouchableOpacity onPress={() => setShowQualityModal(false)}>
                    <SafeIcon name="close" size={28} color={COLORS.cream[50]} />
                  </TouchableOpacity>
                </View>
                <ScrollView style={styles.modalScroll}>
                  {QUALITY_OPTIONS.map((quality) => (
                    <TouchableOpacity
                      key={quality}
                      style={styles.modalOption}
                      onPress={() => handleQualitySelect(quality)}
                    >
                      <Text style={[
                        styles.modalOptionText,
                        selectedQuality === quality && styles.modalOptionTextActive
                      ]}>
                        {quality}
                      </Text>
                      {selectedQuality === quality && (
                        <SafeIcon name="check" size={20} color={COLORS.accent[500]} />
                      )}
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </LinearGradient>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );

  const renderSpeedModal = () => (
    <Modal
      visible={showSpeedModal}
      transparent
      animationType="slide"
      onRequestClose={() => setShowSpeedModal(false)}
    >
      <TouchableWithoutFeedback onPress={() => setShowSpeedModal(false)}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback>
            <View style={styles.modalContent}>
              <LinearGradient
                colors={[COLORS.warmCharcoal[50], COLORS.warmCharcoal[100]]}
                style={styles.modalGradient}
              >
                <View style={styles.modalHeader}>
                  <TouchableOpacity onPress={() => {
                    setShowSpeedModal(false);
                    setShowMoreModal(true);
                  }}>
                    <SafeIcon name="arrow-back" size={24} color={COLORS.cream[50]} />
                  </TouchableOpacity>
                  <Text style={styles.modalTitle}>Playback Speed</Text>
                  <TouchableOpacity onPress={() => {
                    setShowSpeedModal(false);
                    setShowMoreModal(false);
                  }}>
                    <SafeIcon name="close" size={24} color={COLORS.cream[50]} />
                  </TouchableOpacity>
                </View>
                <ScrollView style={styles.modalScroll}>
                  {SPEED_OPTIONS.map((speed) => (
                    <TouchableOpacity
                      key={speed.value}
                      style={styles.modalOption}
                      onPress={() => handleSpeedSelect(speed.value)}
                    >
                      <Text style={[
                        styles.modalOptionText,
                        playbackRate === speed.value && styles.modalOptionTextActive
                      ]}>
                        {speed.label}
                      </Text>
                      {playbackRate === speed.value && (
                        <SafeIcon name="check" size={20} color={COLORS.accent[500]} />
                      )}
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </LinearGradient>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );

  const renderMoreModal = () => (
    <Modal
      visible={showMoreModal}
      transparent
      animationType="slide"
      onRequestClose={() => setShowMoreModal(false)}
    >
      <TouchableWithoutFeedback onPress={() => setShowMoreModal(false)}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback>
            <View style={styles.modalContent}>
              <LinearGradient
                colors={[COLORS.warmCharcoal[50], COLORS.warmCharcoal[100]]}
                style={styles.modalGradient}
              >
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>More Options</Text>
                  <TouchableOpacity onPress={() => setShowMoreModal(false)}>
                    <SafeIcon name="close" size={24} color={COLORS.cream[50]} />
                  </TouchableOpacity>
                </View>
                <View style={styles.modalScroll}>
                  <TouchableOpacity
                    style={styles.modalOption}
                    onPress={() => {
                      setShowMoreModal(false);
                      setShowSpeedModal(true);
                    }}
                  >
                    <View style={styles.modalOptionLeft}>
                      <SafeIcon name="speed" size={24} color={COLORS.cream[200]} />
                      <View style={styles.modalOptionTextContainer}>
                        <Text style={styles.modalOptionText}>Playback Speed</Text>
                        <Text style={styles.modalOptionSubtext}>{playbackRate}x</Text>
                      </View>
                    </View>
                    <SafeIcon name="chevron-right" size={20} color={COLORS.cream[200]} />
                  </TouchableOpacity>
                </View>
              </LinearGradient>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );

  return (
    <View style={styles.container}>
      {/* Video Container */}
      <View style={styles.videoContainer}>
        <Video
          ref={videoRef}
          source={{ uri: source }}
          style={styles.video}
          resizeMode="contain"
          paused={!isPlaying}
          muted={isMuted}
          rate={playbackRate}
          onLoad={onLoad}
          onProgress={onProgressUpdate}
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
          <ActivityIndicator size="large" color={COLORS.accent[500]} />
          <Text style={styles.loadingText}>
            {isLoading ? 'Loading video...' : 'Buffering...'}
          </Text>
        </View>
      )}

      {/* Seek Animation Icons */}
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
          <LinearGradient
            colors={[`${COLORS.accent[500]}90`, `${COLORS.accent[600]}90`]}
            style={styles.seekIconContainer}
          >
            <SafeIcon name="replay-10" size={32} color={COLORS.cream[50]} />
            <Text style={styles.seekIconText}>10s</Text>
          </LinearGradient>
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
          <LinearGradient
            colors={[`${COLORS.accent[500]}90`, `${COLORS.accent[600]}90`]}
            style={styles.seekIconContainer}
          >
            <SafeIcon name="forward-10" size={32} color={COLORS.cream[50]} />
            <Text style={styles.seekIconText}>10s</Text>
          </LinearGradient>
        </Animated.View>
      </View>

      {/* Tap Zones */}
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

      {/* Controls Overlay */}
      {showControls && (
        <Animated.View
          style={[styles.controlsContainer, { opacity: controlsOpacity }]}
        >
          {/* Top Gradient with Back Button */}
          <LinearGradient
            colors={[
              `${COLORS.warmCharcoal[100]}DD`,
              `${COLORS.warmCharcoal[100]}99`,
              `${COLORS.warmCharcoal[100]}44`,
              'transparent',
            ]}
            style={styles.topGradient}
          >
            <View style={styles.topBar}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={onBack}
                activeOpacity={0.7}
              >
                <SafeIcon name="arrow-back" size={24} color={COLORS.cream[50]} />
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
              <LinearGradient
                colors={[`${COLORS.accent[500]}40`, `${COLORS.accent[600]}40`]}
                style={styles.centerPlayGradient}
              >
                <SafeIcon
                  name={isPlaying ? 'pause' : 'play-arrow'}
                  size={40}
                  color={COLORS.cream[50]}
                />
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Bottom Gradient */}
          <LinearGradient
            colors={[
              'transparent',
              `${COLORS.warmCharcoal[100]}44`,
              `${COLORS.warmCharcoal[100]}99`,
              `${COLORS.warmCharcoal[100]}DD`,
            ]}
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
                minimumTrackTintColor={COLORS.accent[500]}
                maximumTrackTintColor={`${COLORS.cream[200]}40`}
                thumbTintColor={COLORS.accent[500]}
                step={0.1}
                disabled={duration === 0}
              />
            </View>

            {/* Bottom Controls */}
            <View style={styles.bottomControls}>
              <View style={styles.leftControls}>
                <TouchableOpacity style={styles.controlBtn} onPress={togglePlayPause}>
                  <SafeIcon
                    name={isPlaying ? 'pause' : 'play-arrow'}
                    size={28}
                    color={COLORS.cream[50]}
                  />
                </TouchableOpacity>

                <TouchableOpacity style={styles.controlBtn} onPress={toggleMute}>
                  <SafeIcon
                    name={isMuted ? 'volume-off' : 'volume-up'}
                    size={28}
                    color={isMuted ? COLORS.accent[500] : COLORS.cream[50]}
                  />
                </TouchableOpacity>

                <View style={styles.qualityBadge}>
                  <Text style={styles.qualityBadgeText}>{selectedQuality}</Text>
                </View>
              </View>

              <View style={styles.rightControls}>
                <TouchableOpacity
                  style={styles.controlBtn}
                  onPress={() => {
                    setShowQualityModal(true);
                    setShowControls(true);
                  }}
                >
                  <SafeIcon name="hd" size={28} color={COLORS.cream[50]} />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.controlBtn}
                  onPress={() => {
                    setShowMoreModal(true);
                    setShowControls(true);
                  }}
                >
                  <SafeIcon name="more-vert" size={28} color={COLORS.cream[50]} />
                </TouchableOpacity>
              </View>
            </View>
          </LinearGradient>
        </Animated.View>
      )}

      {/* Modals */}
      {renderQualityModal()}
      {renderMoreModal()}
      {renderSpeedModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.warmCharcoal[100],
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
    backgroundColor: `${COLORS.warmCharcoal[100]}CC`,
    zIndex: 5,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: COLORS.cream[100],
    fontWeight: '500',
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
  seekIconContainer: {
    borderRadius: 16,
    paddingHorizontal: 24,
    paddingVertical: 20,
    alignItems: 'center',
  },
  seekIconText: {
    fontSize: 14,
    color: COLORS.cream[50],
    fontWeight: '600',
    marginTop: 4,
  },
  tapZonesContainer: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
    zIndex: 5,
  },
  leftTapZone: {
    width: '35%',
    height: '100%',
  },
  centerTapZone: {
    flex: 1,
    height: '100%',
  },
  rightTapZone: {
    width: '35%',
    height: '100%',
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
    paddingTop: 16,
    paddingBottom: 40,
    zIndex: 13,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${COLORS.warmCharcoal[50]}99`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  videoTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.cream[50],
    letterSpacing: 0.3,
  },
  spacer: {
    width: 40,
  },
  centerControls: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 11,
  },
  centerPlayButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: COLORS.cream[50],
  },
  centerPlayGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
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
    marginBottom: 12,
    zIndex: 999,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    zIndex: 999,
  },
  timeText: {
    color: COLORS.cream[50],
    fontSize: 13,
    fontWeight: '600',
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
    paddingHorizontal: 20,
    paddingBottom: 12,
    zIndex: 100,
  },
  leftControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rightControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  controlBtn: {
    padding: 8,
    zIndex: 100,
  },
  qualityBadge: {
    backgroundColor: `${COLORS.accent[500]}40`,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginLeft: 4,
    borderWidth: 1,
    borderColor: `${COLORS.accent[400]}60`,
  },
  qualityBadgeText: {
    color: COLORS.cream[50],
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    maxWidth: 400,
    maxHeight: '70%',
    borderRadius: 16,
    overflow: 'hidden',
  },
  modalGradient: {
    padding: 0,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: `${COLORS.warmCharcoal[50]}80`,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.cream[50],
    letterSpacing: 0.5,
  },
  modalScroll: {
    maxHeight: 400,
  },
  modalOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: `${COLORS.warmCharcoal[50]}40`,
  },
  modalOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 16,
  },
  modalOptionTextContainer: {
    flex: 1,
  },
  modalOptionText: {
    fontSize: 16,
    color: COLORS.cream[100],
    fontWeight: '500',
  },
  modalOptionTextActive: {
    color: COLORS.accent[500],
    fontWeight: '700',
  },
  modalOptionSubtext: {
    fontSize: 14,
    color: COLORS.cream[200],
    marginTop: 2,
  },
});

export default HLSPlayer;
