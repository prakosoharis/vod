/**
 * HLS Video Player Component for React/Next.js
 *
 * Drop this into: apps/web/src/components/video/HLSPlayer.tsx
 *
 * Install dependency: npm install hls.js
 */

import React, { useEffect, useRef, useState } from 'react';
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
  const hlsRef = useRef<Hls | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentQuality, setCurrentQuality] = useState<string>('Auto');
  const [availableQualities, setAvailableQualities] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

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
        setIsLoading(false);

        // Extract available qualities
        const qualities = data.levels.map(level => {
          if (level.height >= 1080) return '1080p';
          if (level.height >= 720) return '720p';
          if (level.height >= 480) return '480p';
          return '360p';
        });
        setAvailableQualities(['Auto', ...qualities]);

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

  return (
    <div className={`hls-player-wrapper ${className}`}>
      <div className="relative">
        {/* Video Element */}
        <video
          ref={videoRef}
          controls={controls}
          poster={poster}
          className="w-full h-full"
          playsInline
          preload="metadata"
        />

        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="text-white">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-2"></div>
              <p>Loading video...</p>
            </div>
          </div>
        )}

        {/* Error Overlay */}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-80">
            <div className="text-white text-center p-4">
              <p className="text-xl mb-2">⚠️ {error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded"
              >
                Reload Page
              </button>
            </div>
          </div>
        )}

        {/* Quality Selector (Optional) */}
        {!isLoading && !error && availableQualities.length > 1 && (
          <div className="absolute bottom-16 right-4 bg-black bg-opacity-70 rounded p-2">
            <select
              value={currentQuality}
              onChange={(e) => changeQuality(e.target.value)}
              className="bg-transparent text-white border border-white rounded px-2 py-1"
            >
              {availableQualities.map(quality => (
                <option key={quality} value={quality}>
                  {quality}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Quality Badge */}
      {!isLoading && !error && (
        <div className="mt-2 text-sm text-gray-400">
          Current Quality: <span className="font-semibold">{currentQuality}</span>
        </div>
      )}
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
