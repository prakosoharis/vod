import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Content } from '../../types';
import { VIDEO_QUALITY_OPTIONS, VIDEO_PLAYBACK_SPEEDS } from '../../utils/constants';
import { cn } from '../../utils';
import Icon from '../ui/Icon';
import Button from '../ui/Button';

interface VideoPlayerProps {
  content: Content;
  onClose?: () => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ content, onClose }) => {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [quality, setQuality] = useState('Auto');
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showQualityMenu, setShowQualityMenu] = useState(false);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const videoUrl = content.hls_url || content.video_url;

  useEffect(() => {
    let hls: any = null;

    if (videoUrl && videoRef.current) {
      if (videoUrl.endsWith('.m3u8') && typeof (window as any).Hls !== 'undefined') {
        hls = new (window as any).Hls();
        hls.loadSource(videoUrl);
        hls.attachMedia(videoRef.current);
      } else {
        videoRef.current.src = videoUrl;
      }
    }

    return () => {
      if (hls) {
        hls.destroy();
      }
    };
  }, [videoUrl]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => setCurrentTime(video.currentTime);
    const handleLoadedMetadata = () => setDuration(video.duration);
    const handleEnded = () => setIsPlaying(false);

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('ended', handleEnded);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('ended', handleEnded);
    };
  }, []);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;

    const time = parseFloat(e.target.value);
    video.currentTime = time;
    setCurrentTime(time);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
    
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      videoRef.current.muted = newVolume === 0;
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    const newMuted = !isMuted;
    setIsMuted(newMuted);
    video.muted = newMuted;
  };

  const handleQualityChange = (newQuality: string) => {
    setQuality(newQuality);
    setShowQualityMenu(false);
  };

  const handleSpeedChange = (newSpeed: number) => {
    setPlaybackSpeed(newSpeed);
    setShowSpeedMenu(false);
    
    if (videoRef.current) {
      videoRef.current.playbackRate = newSpeed;
    }
  };

  const formatTime = (time: number) => {
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = Math.floor(time % 60);

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const showControlsTemporarily = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 3000);
  };

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      navigate(-1);
    }
  };

  return (
    <div
      className="relative w-full h-screen bg-black"
      onMouseMove={showControlsTemporarily}
      onClick={showControlsTemporarily}
    >
      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />

      {showControls && (
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 flex flex-col justify-end">
          <div className="p-8">
            <div className="flex items-center gap-4 mb-4">
              <span className="text-white text-lg">{formatTime(currentTime)}</span>
              <input
                type="range"
                min="0"
                max={duration || 0}
                step="0.1"
                value={currentTime}
                onChange={handleSeek}
                className="flex-1 h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-accent-500"
              />
              <span className="text-white text-lg">{formatTime(duration)}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button size="lg" variant="ghost" onClick={togglePlay}>
                  <Icon name={isPlaying ? 'Pause' : 'Play'} size={32} className="text-white" />
                </Button>

                <div className="flex items-center gap-2">
                  <Button size="lg" variant="ghost" onClick={toggleMute}>
                    <Icon
                      name={isMuted ? 'VolumeX' : volume > 0.5 ? 'Volume2' : 'Volume1'}
                      size={24}
                      className="text-white"
                    />
                  </Button>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                    className="w-24 h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-accent-500"
                  />
                </div>

                <div className="relative">
                  <Button
                    size="lg"
                    variant="ghost"
                    onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                  >
                    <span className="text-white text-lg">{playbackSpeed}x</span>
                  </Button>
                  {showSpeedMenu && (
                    <div className="absolute bottom-full left-0 mb-2 bg-surface rounded-lg shadow-xl overflow-hidden">
                      {VIDEO_PLAYBACK_SPEEDS.map((speed) => (
                        <button
                          key={speed}
                          onClick={() => handleSpeedChange(speed)}
                          className={cn(
                            'block w-full px-4 py-2 text-left text-white hover:bg-surface-hover transition-colors',
                            speed === playbackSpeed && 'bg-accent-500'
                          )}
                        >
                          {speed}x
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="relative">
                  <Button
                    size="lg"
                    variant="ghost"
                    onClick={() => setShowQualityMenu(!showQualityMenu)}
                  >
                    <span className="text-white text-lg">{quality}</span>
                  </Button>
                  {showQualityMenu && (
                    <div className="absolute bottom-full left-0 mb-2 bg-surface rounded-lg shadow-xl overflow-hidden">
                      {VIDEO_QUALITY_OPTIONS.map((q) => (
                        <button
                          key={q}
                          onClick={() => handleQualityChange(q)}
                          className={cn(
                            'block w-full px-4 py-2 text-left text-white hover:bg-surface-hover transition-colors',
                            q === quality && 'bg-accent-500'
                          )}
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <Button size="lg" variant="ghost" onClick={handleClose}>
                <Icon name="X" size={32} className="text-white" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {!isPlaying && !showControls && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
          <Button size="lg" variant="outline" onClick={togglePlay} className="rounded-full p-6">
            <Icon name="Play" size={48} className="text-white" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;
