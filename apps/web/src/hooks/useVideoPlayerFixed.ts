import { useState, useRef, useEffect, useCallback } from 'react';

interface VideoPlayerState {
  isPlaying: boolean;
  showControls: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  showQualityMenu: boolean;
  selectedQuality: string;
}

interface VideoPlayerOptions {
  autoHideControls?: boolean;
  autoHideDelay?: number;
}

const useVideoPlayer = (options: VideoPlayerOptions = {}) => {
  const {
    autoHideControls = true,
    autoHideDelay = 3000
  } = options;

  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const timeUpdateIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [state, setState] = useState<VideoPlayerState>({
    isPlaying: false,
    showControls: true,
    currentTime: 0,
    duration: 0,
    volume: 1,
    isMuted: false,
    showQualityMenu: false,
    selectedQuality: 'Auto'
  });

  // Update state helper
  const updateState = useCallback((updates: Partial<VideoPlayerState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  // Toggle play/pause
  const togglePlay = useCallback(() => {
    if (videoRef.current) {
      if (state.isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch(() => {
        // Silently handle autoplay error
        });
      }
      updateState({ isPlaying: !state.isPlaying });
    }
  }, [state.isPlaying, updateState]);

  // Handle volume change
  const handleVolumeChange = useCallback((newVolume: number) => {
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      updateState({
        volume: newVolume,
        isMuted: newVolume === 0
      });
    }
  }, [updateState]);

  // Toggle mute
  const toggleMute = useCallback(() => {
    if (videoRef.current) {
      const newMuted = !state.isMuted;
      videoRef.current.muted = newMuted;
      updateState({ isMuted: newMuted });
    }
  }, [state.isMuted, updateState]);

  // Seek to time
  const seekTo = useCallback((time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      updateState({ currentTime: time });
    }
  }, [updateState]);

  // Toggle fullscreen
  const toggleFullscreen = useCallback(() => {
    if (videoRef.current) {
      if (!document.fullscreenElement) {
        videoRef.current.requestFullscreen().catch(() => {
          // Silently handle fullscreen error
        });
      } else {
        document.exitFullscreen().catch(() => {
          // Silently handle fullscreen error
        });
      }
    }
  }, []);

  // Show controls
  const showControlsHandler = useCallback(() => {
    updateState({ showControls: true });

    if (state.isPlaying && autoHideControls) {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }

      controlsTimeoutRef.current = setTimeout(() => {
        updateState({ showControls: false });
      }, autoHideDelay);
    }
  }, [state.isPlaying, autoHideControls, autoHideDelay, updateState]);

  // Hide controls
  const hideControls = useCallback(() => {
    updateState({ showControls: false });
  }, [updateState]);

  // Toggle quality menu
  const toggleQualityMenu = useCallback(() => {
    updateState({ showQualityMenu: !state.showQualityMenu });
  }, [state.showQualityMenu, updateState]);

  // Select quality
  const selectQuality = useCallback((quality: string) => {
    updateState({
      selectedQuality: quality,
      showQualityMenu: false
    });
  }, [updateState]);

  // Format time helper
  const formatTime = useCallback((seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);

    if (h > 0) {
      return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${m}:${s.toString().padStart(2, '0')}`;
  }, []);

  // Auto-hide controls effect
  useEffect(() => {
    if (state.isPlaying && state.showControls && autoHideControls) {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }

      controlsTimeoutRef.current = setTimeout(() => {
        updateState({ showControls: false });
      }, autoHideDelay);
    }

    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [state.isPlaying, state.showControls, autoHideControls, autoHideDelay, updateState]);

  // Polling fallback for time updates - ensures progress bar works even outside fullscreen
  useEffect(() => {
    if (state.isPlaying) {
      timeUpdateIntervalRef.current = setInterval(() => {
        const video = videoRef.current;
        if (video && !video.paused && !video.ended) {
          updateState({
            currentTime: video.currentTime,
            duration: video.duration || state.duration
          });
        }
      }, 250); // Update 4 times per second for smooth progress bar
    } else {
      if (timeUpdateIntervalRef.current) {
        clearInterval(timeUpdateIntervalRef.current);
        timeUpdateIntervalRef.current = null;
      }
    }

    return () => {
      if (timeUpdateIntervalRef.current) {
        clearInterval(timeUpdateIntervalRef.current);
        timeUpdateIntervalRef.current = null;
      }
    };
  }, [state.isPlaying, state.duration, updateState]);

  // Video element event listeners
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedMetadata = () => {
      updateState({ duration: video.duration });
    };

    const handleTimeUpdate = () => {
      updateState({ currentTime: video.currentTime });
    };

    const handlePlay = () => {
      updateState({ isPlaying: true });
    };

    const handlePause = () => {
      updateState({ isPlaying: false });
    };

    const handleVolumeChange = () => {
      updateState({
        volume: video.volume,
        isMuted: video.muted
      });
    };

    const handleDurationChange = () => {
      updateState({ duration: video.duration });
    };

    const handleProgress = () => {
      updateState({ currentTime: video.currentTime });
    };

    const handleSeeking = () => {
      updateState({ currentTime: video.currentTime });
    };

    const handleSeeked = () => {
      updateState({ currentTime: video.currentTime });
    };

    // Add all event listeners for comprehensive time tracking
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('volumechange', handleVolumeChange);
    video.addEventListener('durationchange', handleDurationChange);
    video.addEventListener('progress', handleProgress);
    video.addEventListener('seeking', handleSeeking);
    video.addEventListener('seeked', handleSeeked);

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('volumechange', handleVolumeChange);
      video.removeEventListener('durationchange', handleDurationChange);
      video.removeEventListener('progress', handleProgress);
      video.removeEventListener('seeking', handleSeeking);
      video.removeEventListener('seeked', handleSeeked);
    };
  }, [updateState]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      if (timeUpdateIntervalRef.current) {
        clearInterval(timeUpdateIntervalRef.current);
      }
    };
  }, []);

  return {
    videoRef,
    state,
    actions: {
      togglePlay,
      handleVolumeChange,
      toggleMute,
      seekTo,
      toggleFullscreen,
      showControls: showControlsHandler,
      hideControls,
      toggleQualityMenu,
      selectQuality,
      formatTime
    }
  };
};

export default useVideoPlayer;