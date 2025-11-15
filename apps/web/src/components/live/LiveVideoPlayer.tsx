import { useState, useRef, useEffect } from 'react';
import Hls from 'hls.js';
import { Button } from '@/components/ui/button';
import { Volume2, VolumeX, RefreshCw, Monitor, Maximize2, Wifi } from 'lucide-react';

interface LiveVideoPlayerProps {
  streamUrl: string;
  isLive: boolean;
  viewerCount: number;
  isLoading: boolean;
  onCheckStream: () => void;
}

const LiveVideoPlayer: React.FC<LiveVideoPlayerProps> = ({
  streamUrl,
  isLive,
  viewerCount,
  isLoading,
  onCheckStream
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [isMuted, setIsMuted] = useState(true);

  useEffect(() => {
    // Only initialize HLS when stream is live
    if (!isLive || !videoRef.current || !Hls.isSupported()) {
      // Clean up existing HLS if stream goes offline
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
      return;
    }

    // Clean up existing HLS instance
    if (hlsRef.current) {
      hlsRef.current.destroy();
    }

    const hls = new Hls({
      enableWorker: true,
      lowLatencyMode: true,
      backBufferLength: 90,
      maxLoadingDelay: 4,
      maxMaxBufferLength: 30,
      maxBufferSize: 60 * 1000 * 1000
    });

    hlsRef.current = hls;

    // Only load source if stream is live
    if (isLive) {
      hls.loadSource(streamUrl);
      hls.attachMedia(videoRef.current);
    }

    hls.on(Hls.Events.MANIFEST_PARSED, () => {
      try {
        videoRef.current?.play().catch(() => {
          // Silently handle autoplay error
        });
      } catch (e) {
        // Silently handle autoplay error
      }
    });

    hls.on(Hls.Events.ERROR, (_event, data) => {
      // Handle network errors gracefully when stream is offline
      if (data.type === Hls.ErrorTypes.NETWORK_ERROR ||
          data.type === Hls.ErrorTypes.MEDIA_ERROR ||
          data.details === 'manifestLoadTimeOut' ||
          data.details === 'manifestLoadError') {
        // Don't log network errors to console spam when stream is offline
        return;
      }

      // Log other errors that might be important
      console.warn('HLS Error:', data.details, data.type);
    });

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [streamUrl, isLive]);

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const toggleFullscreen = () => {
    if (videoRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        videoRef.current.requestFullscreen();
      }
    }
  };

  const togglePictureInPicture = async () => {
    if (videoRef.current) {
      try {
        if (document.pictureInPictureElement) {
          await document.exitPictureInPicture();
        } else {
          await videoRef.current.requestPictureInPicture();
        }
      } catch (error) {
        // Silently handle Picture-in-Picture error
      }
    }
  };

  return (
    <div className="relative aspect-video bg-black rounded-lg overflow-hidden shadow-2xl">
      {/* Live indicator */}
      {isLive && (
        <div className="absolute top-4 left-4 z-10 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-2">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
          LIVE
        </div>
      )}

      {/* Viewer count */}
      {isLive && (
        <div className="absolute top-4 right-4 z-10 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-2">
          <Wifi className="w-4 h-4" />
          {viewerCount} viewers
        </div>
      )}

      {/* Video element */}
      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        controls={false}
        muted={isMuted}
        playsInline
      />

      {/* Video controls overlay */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMute}
              className="text-white hover:bg-white/20"
            >
              {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleFullscreen}
              className="text-white hover:bg-white/20"
            >
              <Maximize2 className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={togglePictureInPicture}
              className="text-white hover:bg-white/20"
            >
              <Monitor className="w-5 h-5" />
            </Button>
          </div>

          <div className="flex items-center gap-2">
            {isLoading ? (
              <div className="text-white animate-spin">
                <RefreshCw className="w-5 h-5" />
              </div>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={onCheckStream}
                className="text-white hover:bg-white/20"
              >
                <RefreshCw className="w-5 h-5" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Stream offline overlay */}
      {!isLive && !isLoading && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
          <div className="text-center text-white">
            <div className="text-6xl mb-4">📹</div>
            <h3 className="text-xl font-semibold mb-2">Stream is Offline</h3>
            <p className="text-sm opacity-75">The stream will start soon</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveVideoPlayer;