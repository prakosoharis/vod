/**
 * TV Video Player - HLS.js + custom D-pad controls
 *
 * Replaces react-native-video on web.
 * Features:
 *   - HLS streaming (hls.js)
 *   - D-pad navigation (left/right = seek, up/down = volume, OK = play/pause)
 *   - Quality selection (Auto, 1080p, 720p, 480p, 360p)
 *   - Playback speed (0.5x - 2x)
 *   - Resume from last position (via parent)
 *   - Watch progress sync (via parent callback)
 *   - Controls auto-hide after 5s of inactivity
 */
import { useEffect, useRef, useState, useCallback } from 'react';
import Hls, { type Level } from 'hls.js';
import {
  PlayIcon,
  PauseIcon,
  BackIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  SettingsIcon,
  ClockIcon,
} from '@/components/icons';
import { Focusable } from '@/components/Focusable';
import { setFocus, getCurrentFocus } from '@/lib/spatialNavigation';
import { COLORS, THEME, VIDEO_QUALITY_OPTIONS, VIDEO_PLAYBACK_SPEEDS, SEEK_STEP, SEEK_LONG_STEP } from '@/constants';

interface TVVideoPlayerProps {
  source: string;
  title: string;
  initialPosition?: number; // seconds
  onBack: () => void;
  onProgress?: (currentSeconds: number, totalSeconds: number) => void;
  onEnded?: () => void;
  onAccessDenied?: () => void;  // Called when HLS returns 403/access error
}

export function TVVideoPlayer({
  source,
  title,
  initialPosition = 0,
  onBack,
  onProgress,
  onEnded,
  onAccessDenied,
}: TVVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hideControlsTimerRef = useRef<number | null>(null);
  const progressSyncRef = useRef<number | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [showQualityMenu, setShowQualityMenu] = useState(false);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [currentLevel, setCurrentLevel] = useState(-1); // -1 = auto
  const [currentSpeed, setCurrentSpeed] = useState(1);
  const [levels, setLevels] = useState<Level[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [lastSyncTime, setLastSyncTime] = useState(initialPosition);

  // Setup HLS player
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    setError(null);
    setIsLoading(true);

    // Check if source is HLS (.m3u8)
    const isHls = source.toLowerCase().includes('.m3u8');

    if (isHls && Hls.isSupported()) {
      // Use hls.js
      const hls = new Hls({
        // Tuning for TV (smoother buffering)
        manifestLoadingTimeOut: 10000,
        manifestLoadingMaxRetry: 3,
        levelLoadingTimeOut: 10000,
        fragLoadingTimeOut: 20000,
        enableWorker: true,
        lowLatencyMode: false,
        // ABR settings - prefer quality over smoothness for VOD
        maxBufferLength: 30,
        maxMaxBufferLength: 60,
        startLevel: -1, // auto
      });

      hls.loadSource(source);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, (_, data) => {
        setLevels(hls.levels.slice());
        setIsLoading(false);
        if (initialPosition > 0) {
          video.currentTime = initialPosition;
        }
      });

      hls.on(Hls.Events.LEVEL_SWITCHED, (_, data) => {
        setCurrentLevel(data.level);
      });

      hls.on(Hls.Events.ERROR, (_, data) => {
        console.warn('HLS error:', data);

        // Detect access denied (HTTP 401/403) — backend gates the stream
        const responseCode = data.response?.code;
        if (
          data.type === Hls.ErrorTypes.NETWORK_ERROR &&
          (responseCode === 401 || responseCode === 403)
        ) {
          console.warn('Access denied by backend (HTTP ' + responseCode + ')');
          hls.destroy();
          hlsRef.current = null;
          if (onAccessDenied) {
            onAccessDenied();
          } else {
            setError('Akses ditolak. Silakan berlangganan terlebih dahulu.');
          }
          return;
        }

        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              // Try to recover once
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              hls.recoverMediaError();
              break;
            default:
              setError('Gagal memuat video. Silakan coba lagi nanti.');
              hls.destroy();
              break;
          }
        }
      });

      hlsRef.current = hls;

      return () => {
        hls.destroy();
        hlsRef.current = null;
      };
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Native HLS (Safari / webOS webkit)
      video.src = source;
      setIsLoading(false);
      return () => {
        video.removeAttribute('src');
        video.load();
      };
    } else {
      // Fallback: try as regular video
      video.src = source;
      setIsLoading(false);
      return () => {
        video.removeAttribute('src');
        video.load();
      };
    }
  }, [source, initialPosition, onAccessDenied]);

  // Video event handlers
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onLoadedMetadata = () => {
      setDuration(video.duration);
      if (initialPosition > 0 && video.currentTime === 0) {
        video.currentTime = initialPosition;
      }
    };
    const onTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      setBuffered(video.buffered.length > 0 ? video.buffered.end(video.buffered.length - 1) : 0);
    };
    const onWaiting = () => setIsLoading(true);
    const onPlaying = () => setIsLoading(false);
    const handleVideoEnded = () => onEnded?.();
    const onError = () => setError('Video playback error');

    video.addEventListener('play', onPlay);
    video.addEventListener('pause', onPause);
    video.addEventListener('loadedmetadata', onLoadedMetadata);
    video.addEventListener('timeupdate', onTimeUpdate);
    video.addEventListener('waiting', onWaiting);
    video.addEventListener('playing', onPlaying);
    video.addEventListener('ended', handleVideoEnded);
    video.addEventListener('error', onError);

    return () => {
      video.removeEventListener('play', onPlay);
      video.removeEventListener('pause', onPause);
      video.removeEventListener('loadedmetadata', onLoadedMetadata);
      video.removeEventListener('timeupdate', onTimeUpdate);
      video.removeEventListener('waiting', onWaiting);
      video.removeEventListener('playing', onPlaying);
      video.removeEventListener('ended', handleVideoEnded);
      video.removeEventListener('error', onError);
    };
  }, [onEnded, initialPosition]);

  // Periodic progress sync to parent
  useEffect(() => {
    if (!onProgress) return;
    progressSyncRef.current = window.setInterval(() => {
      const video = videoRef.current;
      if (!video || !video.duration) return;
      onProgress(video.currentTime, video.duration);
    }, 5000);
    return () => {
      if (progressSyncRef.current) {
        clearInterval(progressSyncRef.current);
      }
    };
  }, [onProgress]);

  // Controls auto-hide
  const showControlsTemporarily = useCallback(() => {
    setShowControls(true);
    if (hideControlsTimerRef.current) {
      clearTimeout(hideControlsTimerRef.current);
    }
    hideControlsTimerRef.current = window.setTimeout(() => {
      if (!showSettings && !showQualityMenu && !showSpeedMenu) {
        setShowControls(false);
      }
    }, 5000);
  }, [showSettings, showQualityMenu, showSpeedMenu]);

  useEffect(() => {
    showControlsTemporarily();
    return () => {
      if (hideControlsTimerRef.current) {
        clearTimeout(hideControlsTimerRef.current);
      }
    };
  }, [showControlsTemporarily]);

  // Toggle play/pause
  const togglePlayPause = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play();
    } else {
      video.pause();
    }
  }, []);

  // Seek by amount
  const seek = useCallback((delta: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = Math.max(0, Math.min(video.duration, video.currentTime + delta));
    showControlsTemporarily();
  }, [showControlsTemporarily]);

  // Set quality
  const setQuality = useCallback((level: number) => {
    const hls = hlsRef.current;
    if (!hls) return;
    hls.currentLevel = level; // -1 = auto
    setCurrentLevel(level);
    setShowQualityMenu(false);
  }, []);

  // Set speed
  const setSpeed = useCallback((speed: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.playbackRate = speed;
    setCurrentSpeed(speed);
    setShowSpeedMenu(false);
  }, []);

  // Keyboard / Remote control handler
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      const video = videoRef.current;
      if (!video) return;
      const target = e.target as HTMLElement;

      // If focused on a settings menu, let it handle the keys
      if (target.dataset.focusKey?.startsWith('settings-')) return;

      // Settings menu navigation
      if (showQualityMenu || showSpeedMenu) {
        if (e.key === 'Backspace' || e.key === 'Escape' || e.keyCode === 409) {
          setShowQualityMenu(false);
          setShowSpeedMenu(false);
          setFocus('player-settings');
          e.preventDefault();
        }
        return;
      }

      switch (e.key) {
        case 'Enter':
        case ' ':
          // OK button → play/pause (only if focus is on player area, not settings)
          if (getCurrentFocus() === 'player-toggle' || getCurrentFocus()?.startsWith('player-')) {
            togglePlayPause();
            showControlsTemporarily();
            e.preventDefault();
          }
          break;
        case 'ArrowLeft':
          if (e.shiftKey) {
            seek(-SEEK_LONG_STEP);
          } else {
            seek(-SEEK_STEP);
          }
          break;
        case 'ArrowRight':
          if (e.shiftKey) {
            seek(SEEK_LONG_STEP);
          } else {
            seek(SEEK_STEP);
          }
          break;
        case 'ArrowUp':
          // Volume up
          video.volume = Math.min(1, video.volume + 0.1);
          setVolume(video.volume);
          setIsMuted(video.volume === 0);
          showControlsTemporarily();
          e.preventDefault();
          break;
        case 'ArrowDown':
          // Volume down
          video.volume = Math.max(0, video.volume - 0.1);
          setVolume(video.volume);
          setIsMuted(video.volume === 0);
          showControlsTemporarily();
          e.preventDefault();
          break;
        case 'Backspace':
        case 'Escape':
        case 'e.keyCode === 409':
          if (showSettings) {
            setShowSettings(false);
          } else {
            onBack();
          }
          e.preventDefault();
          break;
      }

      // webOS Back key
      if (e.keyCode === 409) {
        if (showSettings) {
          setShowSettings(false);
        } else {
          onBack();
        }
        e.preventDefault();
      }
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [togglePlayPause, seek, onBack, showSettings, showQualityMenu, showSpeedMenu, showControlsTemporarily]);

  // Format time
  const formatTime = (sec: number) => {
    if (!sec || isNaN(sec)) return '0:00';
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = Math.floor(sec % 60);
    if (h > 0) {
      return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const bufferedPercent = duration > 0 ? (buffered / duration) * 100 : 0;

  // Error state
  if (error) {
    return (
      <div style={{ position: 'absolute', top: 0,
          right: 0,
          bottom: 0,
          left: 0, background: '#000', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
        <p style={{ color: COLORS.error, fontSize: 36, fontWeight: 'bold' }}>{error}</p>
        <Focusable focusKey="player-error-back" onEnter={onBack}>
          <button
            style={{
              marginTop: 32,
              padding: '16px 48px',
              background: COLORS.accent[500],
              color: '#fff',
              borderRadius: 8,
              fontSize: 24,
              fontWeight: 'bold',
            }}
          >
            Kembali
          </button>
        </Focusable>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      style={{
        position: 'absolute',
        top: 0,
          right: 0,
          bottom: 0,
          left: 0,
        background: '#000',
        zIndex: THEME.zIndex.player,
        overflow: 'hidden',
      }}
      onClick={() => {
        if (showControls) {
          togglePlayPause();
        } else {
          showControlsTemporarily();
        }
      }}
    >
      {/* Video element */}
      <video
        ref={videoRef}
        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
        playsInline
        autoPlay
      />

      {/* Loading indicator */}
      {isLoading && (
        <div
          style={{
            position: 'absolute',
            top: 0,
          right: 0,
          bottom: 0,
          left: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
          }}
        >
          <div
            style={{
              width: 80,
              height: 80,
              border: '4px solid rgba(198, 125, 75, 0.2)',
              borderTopColor: COLORS.accent[500],
              borderRadius: '50%',
              animation: 'spin 0.9s linear infinite',
            }}
          />
        </div>
      )}

      {/* Top gradient + Title bar */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          padding: '32px 48px',
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.85), transparent)',
          transform: showControls ? 'translateY(0)' : 'translateY(-100%)',
          transition: 'transform 0.3s',
          pointerEvents: showControls ? 'auto' : 'none',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <Focusable focusKey="player-back" onEnter={onBack} focusScale={1.1}>
            <button
              style={{
                background: 'rgba(0,0,0,0.5)',
                border: 'none',
                borderRadius: '50%',
                width: 64,
                height: 64,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <BackIcon size={32} color={COLORS.cream[50]} />
            </button>
          </Focusable>
          <div>
            <h1
              style={{
                margin: 0,
                color: COLORS.cream[50],
                fontSize: 36,
                fontWeight: 'bold',
              }}
            >
              {title}
            </h1>
          </div>
        </div>
      </div>

      {/* Center play/pause indicator */}
      {!isLoading && showControls && (
        <div
          style={{
            position: 'absolute',
            top: 0,
          right: 0,
          bottom: 0,
          left: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
          }}
        >
          <Focusable focusKey="player-toggle" onEnter={togglePlayPause} focusScale={1.15}>
            <button
              style={{
                width: 120,
                height: 120,
                borderRadius: '50%',
                background: 'rgba(0,0,0,0.6)',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              {isPlaying ? (
                <PauseIcon size={56} color={COLORS.cream[50]} />
              ) : (
                <PlayIcon size={56} color={COLORS.cream[50]} />
              )}
            </button>
          </Focusable>
        </div>
      )}

      {/* Bottom controls */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          padding: '40px 48px',
          background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)',
          transform: showControls ? 'translateY(0)' : 'translateY(100%)',
          transition: 'transform 0.3s',
          pointerEvents: showControls ? 'auto' : 'none',
        }}
      >
        {/* Progress bar */}
        <div
          style={{
            position: 'relative',
            height: 8,
            background: 'rgba(255,255,255,0.2)',
            borderRadius: 4,
            marginBottom: 24,
            cursor: 'pointer',
            overflow: 'hidden',
          }}
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const pct = (e.clientX - rect.left) / rect.width;
            const video = videoRef.current;
            if (video && video.duration) {
              video.currentTime = pct * video.duration;
            }
          }}
        >
          {/* Buffered */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              bottom: 0,
              width: `${bufferedPercent}%`,
              background: 'rgba(255,255,255,0.3)',
              transition: 'width 0.3s',
            }}
          />
          {/* Played */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              bottom: 0,
              width: `${progressPercent}%`,
              background: COLORS.accent[500],
              transition: 'width 0.1s linear',
            }}
          />
        </div>

        {/* Time + buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
          {/* Time */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, color: COLORS.cream[50], fontSize: 22 }}>
            <ClockIcon size={22} color={COLORS.cream[100]} />
            <span>{formatTime(currentTime)} / {formatTime(duration)}</span>
          </div>

          {/* Seek backward */}
          <Focusable focusKey="player-seek-back" onEnter={() => seek(-SEEK_STEP)} focusScale={1.1}>
            <button
              style={{
                background: 'rgba(0,0,0,0.5)',
                border: 'none',
                borderRadius: '50%',
                width: 56,
                height: 56,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <ChevronLeftIcon size={32} color={COLORS.cream[50]} />
            </button>
          </Focusable>

          {/* Seek forward */}
          <Focusable focusKey="player-seek-forward" onEnter={() => seek(SEEK_STEP)} focusScale={1.1}>
            <button
              style={{
                background: 'rgba(0,0,0,0.5)',
                border: 'none',
                borderRadius: '50%',
                width: 56,
                height: 56,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <ChevronRightIcon size={32} color={COLORS.cream[50]} />
            </button>
          </Focusable>

          <div style={{ flex: 1 }} />

          {/* Quality button */}
          <Focusable focusKey="player-settings" onEnter={() => setShowQualityMenu((v) => !v)} focusScale={1.1}>
            <button
              style={{
                background: showQualityMenu ? COLORS.accent[500] : 'rgba(0,0,0,0.5)',
                border: 'none',
                borderRadius: 8,
                padding: '12px 20px',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                color: COLORS.cream[50],
                fontSize: 20,
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              <SettingsIcon size={24} color={COLORS.cream[50]} />
              <span>
                {currentLevel === -1 ? 'Auto' : `${levels[currentLevel]?.height || 0}p`}
              </span>
            </button>
          </Focusable>

          {/* Speed button */}
          <Focusable focusKey="player-speed" onEnter={() => setShowSpeedMenu((v) => !v)} focusScale={1.1}>
            <button
              style={{
                background: showSpeedMenu ? COLORS.accent[500] : 'rgba(0,0,0,0.5)',
                border: 'none',
                borderRadius: 8,
                padding: '12px 20px',
                color: COLORS.cream[50],
                fontSize: 20,
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              {currentSpeed}x
            </button>
          </Focusable>
        </div>

        {/* Quality dropdown */}
        {showQualityMenu && (
          <div
            style={{
              position: 'absolute',
              bottom: 130,
              right: 180,
              background: COLORS.warmCharcoal[200],
              borderRadius: 12,
              padding: 16,
              minWidth: 220,
              boxShadow: THEME.shadows.large,
            }}
          >
            <div style={{ color: COLORS.cream[200], fontSize: 18, marginBottom: 12, fontWeight: '600' }}>
              Kualitas
            </div>
            <Focusable
              focusKey="settings-quality-auto"
              onEnter={() => setQuality(-1)}
              focusScale={1.02}
            >
              <div style={{
                padding: '12px 16px',
                background: currentLevel === -1 ? COLORS.accent[500] + '30' : 'transparent',
                borderRadius: 6,
                color: currentLevel === -1 ? COLORS.accent[400] : COLORS.cream[50],
                fontSize: 20,
                fontWeight: currentLevel === -1 ? '700' : '500',
                cursor: 'pointer',
              }}>
                Auto
              </div>
            </Focusable>
            {levels.map((level, idx) => {
              const height = level.height || 0;
              const label = height >= 1080 ? '1080p' : height >= 720 ? '720p' : height >= 480 ? '480p' : height >= 360 ? '360p' : `${height}p`;
              return (
                <Focusable
                  key={idx}
                  focusKey={`settings-quality-${idx}`}
                  onEnter={() => setQuality(idx)}
                  focusScale={1.02}
                >
                  <div style={{
                    padding: '12px 16px',
                    background: currentLevel === idx ? COLORS.accent[500] + '30' : 'transparent',
                    borderRadius: 6,
                    color: currentLevel === idx ? COLORS.accent[400] : COLORS.cream[50],
                    fontSize: 20,
                    fontWeight: currentLevel === idx ? '700' : '500',
                    cursor: 'pointer',
                  }}>
                    {label} {level.bitrate ? `(${Math.round(level.bitrate / 1000)} kbps)` : ''}
                  </div>
                </Focusable>
              );
            })}
          </div>
        )}

        {/* Speed dropdown */}
        {showSpeedMenu && (
          <div
            style={{
              position: 'absolute',
              bottom: 130,
              right: 60,
              background: COLORS.warmCharcoal[200],
              borderRadius: 12,
              padding: 16,
              minWidth: 180,
              boxShadow: THEME.shadows.large,
            }}
          >
            <div style={{ color: COLORS.cream[200], fontSize: 18, marginBottom: 12, fontWeight: '600' }}>
              Kecepatan
            </div>
            {VIDEO_PLAYBACK_SPEEDS.map((speed) => (
              <Focusable
                key={speed}
                focusKey={`settings-speed-${speed}`}
                onEnter={() => setSpeed(speed)}
                focusScale={1.02}
              >
                <div style={{
                  padding: '12px 16px',
                  background: currentSpeed === speed ? COLORS.accent[500] + '30' : 'transparent',
                  borderRadius: 6,
                  color: currentSpeed === speed ? COLORS.accent[400] : COLORS.cream[50],
                  fontSize: 20,
                  fontWeight: currentSpeed === speed ? '700' : '500',
                  cursor: 'pointer',
                }}>
                  {speed}x {speed === 1 && '(Normal)'}
                </div>
              </Focusable>
            ))}
          </div>
        )}

        {/* Help hint */}
        <div
          style={{
            marginTop: 24,
            color: COLORS.cream[200],
            fontSize: 16,
            opacity: 0.7,
          }}
        >
          OK: Play/Pause • ←→: Seek 10s • ↑↓: Volume • Back: Kembali
        </div>
      </div>
    </div>
  );
}

export default TVVideoPlayer;
