/**
 * HLS Video Player Component for React/Next.js
 *
 * Drop this into: apps/web/src/components/video/HLSPlayer.tsx
 *
 * Install dependency: npm install hls.js
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import Hls from 'hls.js';

interface HLSPlayerProps {
  hlsUrl: string;
  poster?: string;
  autoPlay?: boolean;
  controls?: boolean;
  className?: string;
  onError?: (error: Error) => void;
  onQualityChange?: (quality: string) => void;
}

export const HLSPlayer: React.FC<HLSPlayerProps> = ({
  hlsUrl,
  poster,
  autoPlay = false,
  controls = true,
  className = '',
  onError,
  onQualityChange
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const qualityButtonRef = useRef<HTMLButtonElement>(null);
  const moreOptionsButtonRef = useRef<HTMLButtonElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentQuality, setCurrentQuality] = useState<string>('Auto');
  const [availableQualities, setAvailableQualities] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showQualityMenu, setShowQualityMenu] = useState(false);
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const [showPlaybackSpeedMenu, setShowPlaybackSpeedMenu] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Update time and duration
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => setCurrentTime(video.currentTime);
    const handleDurationChange = () => setDuration(video.duration);
    const handleVolumeChange = () => {
      setVolume(video.volume);
      setIsMuted(video.muted);
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('durationchange', handleDurationChange);
    video.addEventListener('volumechange', handleVolumeChange);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('durationchange', handleDurationChange);
      video.removeEventListener('volumechange', handleVolumeChange);
    };
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Check if HLS is supported
    if (Hls.isSupported()) {
      console.log('[HLS] Initializing HLS.js player');

      const hls = new Hls({
        debug: false,
        enableWorker: true,
        lowLatencyMode: false,
        backBufferLength: 90,
        maxBufferLength: 30,
        maxMaxBufferLength: 600,
        maxBufferSize: 60 * 1000 * 1000, // 60 MB
      });

      hlsRef.current = hls;

      // Load source
      hls.loadSource(hlsUrl);
      hls.attachMedia(video);

      // Event: Manifest loaded
      hls.on(Hls.Events.MANIFEST_PARSED, (_event, data) => {
        console.log('[HLS] Manifest parsed, levels:', data.levels.length);

        // Extract available qualities
        const qualities = data.levels.map(level => {
          if (level.height >= 1080) return '1080p';
          if (level.height >= 720) return '720p';
          if (level.height >= 480) return '480p';
          return '360p';
        });
        const allQualities = ['Auto', ...qualities];
        console.log('[HLS] Available qualities:', allQualities);
        setAvailableQualities(allQualities);

        // Set loading false and ensure controls are visible
        setIsLoading(false);
        setShowControls(true);
        console.log('[HLS] Controls visible, qualities:', allQualities.length);

        // Auto-play if enabled
        if (autoPlay) {
          video.play().catch(err => {
            console.warn('[HLS] Autoplay failed:', err);
          });
        }
      });

      // Event: Level switched (quality change)
      hls.on(Hls.Events.LEVEL_SWITCHED, (_event, data) => {
        const level = hls.levels[data.level];
        const quality = level.height >= 1080 ? '1080p'
          : level.height >= 720 ? '720p'
          : level.height >= 480 ? '480p'
          : '360p';

        console.log('[HLS] Quality switched to:', quality);
        setCurrentQuality(quality);
        onQualityChange?.(quality);
      });

      // Event: Error handling
      hls.on(Hls.Events.ERROR, (_event, data) => {
        console.error('[HLS] Error:', data.type, data.details, data.fatal);

        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              console.error('[HLS] Fatal network error, trying to recover...');
              hls.startLoad();
              break;

            case Hls.ErrorTypes.MEDIA_ERROR:
              console.error('[HLS] Fatal media error, trying to recover...');
              hls.recoverMediaError();
              break;

            default:
              console.error('[HLS] Unrecoverable error, destroying player');
              setError('Failed to load video. Please try again.');
              onError?.(new Error(data.details));
              hls.destroy();
              break;
          }
        }
      });

      // Cleanup
      return () => {
        console.log('[HLS] Cleaning up HLS instance');
        hls.destroy();
      };

    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Native HLS support (Safari)
      console.log('[HLS] Using native HLS support');
      video.src = hlsUrl;

      video.addEventListener('loadedmetadata', () => {
        setIsLoading(false);
        setShowControls(true);
        if (autoPlay) {
          video.play().catch(err => {
            console.warn('[HLS] Autoplay failed:', err);
          });
        }
      });

      video.addEventListener('error', () => {
        setError('Failed to load video. Please try again.');
        onError?.(new Error('Native HLS playback error'));
      });

    } else {
      setError('HLS playback is not supported in this browser.');
      console.error('[HLS] HLS not supported');
    }

  }, [hlsUrl, autoPlay, onError, onQualityChange]);

  // Manual quality selection
  const changeQuality = (quality: string) => {
    if (!hlsRef.current) return;

    const hls = hlsRef.current;

    if (quality === 'Auto') {
      hls.currentLevel = -1; // Auto quality
      setCurrentQuality('Auto');
    } else {
      // Find level index for selected quality
      const qualityHeight = parseInt(quality);
      const levelIndex = hls.levels.findIndex(level => level.height === qualityHeight);

      if (levelIndex !== -1) {
        hls.currentLevel = levelIndex;
        setCurrentQuality(quality);
      }
    }
  };

  // Auto-hide controls after 3 seconds of inactivity
  const handleMouseMove = useCallback(() => {
    setShowControls(true);

    // Clear existing timeout
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }

    // Only auto-hide if video is playing
    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000); // Hide after 3 seconds
    }
  }, [isPlaying]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
        setIsPlaying(true);
        // Start auto-hide timer
        handleMouseMove();
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
        setShowControls(true); // Always show controls when paused
      }
    }
  };

  const toggleFullscreen = () => {
    if (containerRef.current) {
      if (!document.fullscreenElement) {
        containerRef.current.requestFullscreen();
      } else {
        document.exitFullscreen();
      }
    }
  };

  // Detect fullscreen change
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!videoRef.current) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    videoRef.current.currentTime = pos * duration;
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
    }
  };

  const formatTime = (seconds: number): string => {
    if (!isFinite(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const changePlaybackSpeed = (speed: number) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
      setPlaybackSpeed(speed);
      setShowPlaybackSpeedMenu(false);
      setShowMoreOptions(false);
    }
  };

  const togglePictureInPicture = async () => {
    if (!videoRef.current) return;

    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else {
        await videoRef.current.requestPictureInPicture();
      }
      setShowMoreOptions(false);
    } catch (error) {
      console.error('PiP error:', error);
    }
  };

  const playbackSpeeds = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className={`hls-player-wrapper ${className} relative overflow-visible`}>
      <div
        ref={containerRef}
        className="relative bg-black overflow-visible"
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setShowControls(true)}
        onMouseLeave={() => {
          // Clear timeout when mouse leaves
          if (controlsTimeoutRef.current) {
            clearTimeout(controlsTimeoutRef.current);
          }
        }}
      >
        {/* Video Element - No native controls */}
        <video
          ref={videoRef}
          controls={false}
          poster={poster}
          className="w-full h-full"
          playsInline
          preload="metadata"
          onClick={togglePlay}
          onPlay={() => {
            setIsPlaying(true);
            handleMouseMove();
          }}
          onPause={() => {
            setIsPlaying(false);
            setShowControls(true);
          }}
        />

        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-20">
            <div className="text-white text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-red-600 mb-4 mx-auto"></div>
              <p className="text-lg">Loading video...</p>
            </div>
          </div>
        )}

        {/* Error Overlay */}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-90 z-20">
            <div className="text-white text-center p-6">
              <div className="text-6xl mb-4">⚠️</div>
              <p className="text-xl mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-red-600 hover:bg-red-700 rounded-md font-semibold transition-colors"
              >
                Reload Page
              </button>
            </div>
          </div>
        )}

        {/* Custom Controls Overlay - Netflix Style */}
        {!isLoading && !error && (
          <div
            className={`absolute inset-0 transition-opacity duration-300 ${
              showControls ? 'opacity-100' : 'opacity-0'
            }`}
            style={{
              pointerEvents: 'none',
              zIndex: 9999
            }}
          >
            {/* Top Gradient */}
            <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-black/70 to-transparent" style={{ pointerEvents: 'none' }} />

            {/* Bottom Controls */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/70 to-transparent px-6 pb-4 pt-2 overflow-visible" style={{ pointerEvents: 'auto' }}>
              {/* Progress Bar */}
              <div className="mb-3">
                <div
                  className="group/progress w-full h-1 bg-gray-600 rounded-full cursor-pointer hover:h-2 transition-all"
                  onClick={handleSeek}
                >
                  <div
                    className="h-full bg-red-600 rounded-full relative"
                    style={{ width: `${(currentTime / duration) * 100 || 0}%` }}
                  >
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-red-600 rounded-full opacity-0 group-hover/progress:opacity-100 transition-opacity" />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4" style={{ pointerEvents: 'auto' }}>
                {/* Play/Pause Button */}
                <button
                  onClick={togglePlay}
                  className="text-white hover:text-red-500 transition-colors"
                  style={{ pointerEvents: 'auto' }}
                >
                  {isPlaying ? (
                    <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
                    </svg>
                  ) : (
                    <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  )}
                </button>

                {/* Volume */}
                <button
                  onClick={toggleMute}
                  className="text-white hover:text-red-500 transition-colors"
                  style={{ pointerEvents: 'auto' }}
                >
                  {isMuted || volume === 0 ? (
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
                    </svg>
                  ) : (
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
                    </svg>
                  )}
                </button>

                {/* Time Display */}
                <div className="text-white text-sm font-medium">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </div>

                {/* Spacer */}
                <div className="flex-1" />

                {/* Quality Selector */}
                {availableQualities.length > 0 && (
                  <div className="relative" style={{ zIndex: 9999 }}>
                    <button
                      ref={qualityButtonRef}
                      onClick={() => {
                        setShowQualityMenu(!showQualityMenu);
                        setShowMoreOptions(false);
                      }}
                      className="flex items-center gap-2 px-3 py-2 bg-black/50 hover:bg-black/70 rounded text-white text-sm font-medium transition-colors border border-white/20"
                      style={{
                        position: 'relative',
                        zIndex: 9999,
                        pointerEvents: 'auto'
                      }}
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                      </svg>
                      {currentQuality}
                    </button>

                    {/* Quality Dropdown Menu */}
                    {showQualityMenu && (
                      <div
                        className="absolute bg-black/95 backdrop-blur-md rounded-lg shadow-xl overflow-hidden border border-white/10 min-w-[140px]"
                        style={{
                          bottom: '100%',
                          right: 0,
                          marginBottom: '8px',
                          zIndex: 2147483647,
                          pointerEvents: 'auto'
                        }}
                      >
                        {availableQualities.map(quality => (
                          <button
                            key={quality}
                            onClick={() => {
                              changeQuality(quality);
                              setShowQualityMenu(false);
                            }}
                            className={`w-full text-left px-4 py-3 hover:bg-red-600 transition-colors text-sm font-medium ${
                              currentQuality === quality ? 'bg-red-700 text-white' : 'text-gray-300'
                            }`}
                            style={{ pointerEvents: 'auto' }}
                          >
                            <div className="flex items-center justify-between">
                              <span>{quality}</span>
                              {currentQuality === quality && (
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                                </svg>
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Fullscreen Button */}
                <button
                  onClick={toggleFullscreen}
                  className="text-white hover:text-red-500 transition-colors"
                  style={{
                    position: 'relative',
                    zIndex: 9999,
                    pointerEvents: 'auto'
                  }}
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/>
                  </svg>
                </button>

                {/* More Options Button */}
                <div className="relative" style={{ zIndex: 9999 }}>
                  <button
                    ref={moreOptionsButtonRef}
                    onClick={() => {
                      setShowMoreOptions(!showMoreOptions);
                      setShowQualityMenu(false);
                    }}
                    className="flex items-center justify-center w-10 h-10 bg-black/50 hover:bg-black/70 rounded text-white transition-colors border border-white/20"
                    title="More Options"
                    style={{
                      position: 'relative',
                      zIndex: 9999,
                      pointerEvents: 'auto'
                    }}
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
                    </svg>
                  </button>

                  {/* More Options Dropdown */}
                  {showMoreOptions && (
                    <>
                      {/* More Options Menu */}
                      <div
                        className="absolute bg-black/95 backdrop-blur-md rounded-lg shadow-xl border border-white/10 min-w-[200px]"
                        style={{
                          bottom: '100%',
                          right: 0,
                          marginBottom: '8px',
                          zIndex: 2147483647,
                          pointerEvents: 'auto'
                        }}
                      >
                        {/* Playback Speed */}
                        <button
                          onClick={() => setShowPlaybackSpeedMenu(!showPlaybackSpeedMenu)}
                          className="w-full text-left px-4 py-3 hover:bg-red-600 transition-colors text-sm font-medium text-gray-300 flex items-center justify-between"
                          style={{ pointerEvents: 'auto' }}
                        >
                          <span>Playback Speed</span>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-400">{playbackSpeed}x</span>
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/>
                            </svg>
                          </div>
                        </button>

                        {/* Picture in Picture */}
                        <button
                          onClick={togglePictureInPicture}
                          className="w-full text-left px-4 py-3 hover:bg-red-600 transition-colors text-sm font-medium text-gray-300 flex items-center gap-3"
                          style={{ pointerEvents: 'auto' }}
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M19 7h-8v6h8V7zm2-4H3c-1.1 0-2 .9-2 2v14c0 1.1.9 1.98 2 1.98h18c1.1 0 2-.88 2-1.98V5c0-1.1-.9-2-2-2zm0 16.01H3V4.98h18v14.03z"/>
                          </svg>
                          <span>Picture in Picture</span>
                        </button>

                        {/* Playback Speed Submenu - Nested inside More Options */}
                        {showPlaybackSpeedMenu && (
                          <div
                            className="absolute bg-black/95 backdrop-blur-md rounded-lg shadow-xl border border-white/10"
                            style={{
                              bottom: 0,
                              right: '100%',
                              marginRight: '8px',
                              zIndex: 2147483648,
                              minWidth: '100px',
                              maxWidth: '120px',
                              pointerEvents: 'auto'
                            }}
                          >
                            {playbackSpeeds.map(speed => (
                              <button
                                key={speed}
                                onClick={() => changePlaybackSpeed(speed)}
                                className={`w-full text-left px-3 py-2 hover:bg-red-600 transition-colors text-sm font-medium ${
                                  playbackSpeed === speed ? 'bg-red-700 text-white' : 'text-gray-300'
                                }`}
                                style={{ pointerEvents: 'auto' }}
                              >
                                <div className="flex items-center justify-between gap-2">
                                  <span className="whitespace-nowrap">{speed === 1 ? 'Normal' : `${speed}x`}</span>
                                  {playbackSpeed === speed && (
                                    <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                                    </svg>
                                  )}
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Center Play Button (when paused) */}
            {!isPlaying && showControls && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <button
                  onClick={togglePlay}
                  className="w-20 h-20 bg-red-600/90 hover:bg-red-600 rounded-full flex items-center justify-center transition-all transform hover:scale-110 shadow-2xl pointer-events-auto"
                >
                  <svg className="w-10 h-10 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default HLSPlayer;

/**
 * USAGE EXAMPLE:
 *
 * import HLSPlayer from '@/components/video/HLSPlayer';
 *
 * function VideoPage() {
 *   const hlsUrl = "http://localhost:8080/videos/abc-123/playlist.m3u8";
 *
 *   return (
 *     <div className="container">
 *       <h1>Watch Movie</h1>
 *       <HLSPlayer
 *         hlsUrl={hlsUrl}
 *         poster="/poster.jpg"
 *         autoPlay={false}
 *         controls={true}
 *         onError={(error) => console.error('Player error:', error)}
 *         onQualityChange={(quality) => console.log('Quality changed:', quality)}
 *       />
 *     </div>
 *   );
 * }
 */
