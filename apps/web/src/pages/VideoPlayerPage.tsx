import { useParams, useNavigate } from 'react-router-dom'
import { useEffect, useState, useRef } from 'react'
import {
  ArrowLeft,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Settings,
  SkipForward,
  ThumbsUp,
  Plus
} from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { contentService } from '@/services/content.service'
import ContentRow from '@/components/home/ContentRow'
import type { Content } from '@/types'

const VideoPlayerPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const videoRef = useRef<HTMLVideoElement>(null)

  // Video state
  const [isPlaying, setIsPlaying] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [showQualityMenu, setShowQualityMenu] = useState(false)
  const [selectedQuality, setSelectedQuality] = useState('Auto')

  // Controls timeout
  const controlsTimeoutRef = useRef<NodeJS.Timeout>()

  // Fetch content data
  const { data: content, isLoading, error } = useQuery<Content>({
    queryKey: ['content', id],
    queryFn: () => contentService.getContentById(id!),
    enabled: !!id
  })

  // Fetch similar content for "More Like This"
  const { data: similarContent } = useQuery<Content[]>({
    queryKey: ['similar-content', content?.genre],
    queryFn: async () => {
      if (!content?.genre?.[0]) return []
      const response = await contentService.getAllContent({
        genre: content.genre[0],
        limit: 10
      })
      return response.data.filter(item => item.id !== content.id)
    },
    enabled: !!content?.genre?.[0]
  })

  // Auto-hide controls
  useEffect(() => {
    if (isPlaying && showControls) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false)
      }, 3000)
    }

    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current)
      }
    }
  }, [showControls, isPlaying])

  // Show controls on mouse move
  const handleMouseMove = () => {
    setShowControls(true)
    if (isPlaying) {
      // Reset timer
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current)
      }
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false)
      }, 3000)
    }
  }

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const toggleMute = () => {
    if (videoRef.current) {
      const newMutedState = !isMuted
      videoRef.current.muted = newMutedState
      setIsMuted(newMutedState)
    }
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value)
    if (videoRef.current) {
      videoRef.current.volume = newVolume
      setVolume(newVolume)
      setIsMuted(newVolume === 0)
    }
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value)
    setCurrentTime(time)
    if (videoRef.current) {
      videoRef.current.currentTime = time
    }
  }

  const toggleFullscreen = () => {
    if (videoRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen()
      } else {
        videoRef.current.requestFullscreen()
      }
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleQualityChange = (quality: string) => {
    setSelectedQuality(quality)
    setShowQualityMenu(false)
    // In real implementation, change video source here
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error || !content) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Konten tidak ditemukan</h1>
          <button
            onClick={() => navigate('/browse')}
            className="px-6 py-2 bg-primary hover:bg-primary/90 text-white rounded"
          >
            Kembali ke Browse
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Video Player Container */}
      <div
        className="relative w-full bg-black"
        onMouseMove={handleMouseMove}
        style={{ height: 'calc(100vh - 200px)' }}
      >
        {/* Back Button (always visible) */}
        <button
          onClick={() => navigate('/browse')}
          className="absolute top-4 left-4 z-20 flex items-center gap-2 px-4 py-2 bg-black/50 hover:bg-black/70 rounded transition-colors"
        >
          <ArrowLeft size={20} />
          <span className="text-white">Kembali</span>
        </button>

        {/* Next Episode (for series) */}
        {content.type === 'SERIES' && isPlaying && (
          <div className="absolute top-4 right-4 z-20">
            <button className="flex items-center gap-2 px-4 py-2 bg-black/50 hover:bg-black/70 rounded transition-colors">
              <SkipForward size={20} />
              <span className="text-white">Episode Berikutnya</span>
            </button>
          </div>
        )}

        {/* Video Element */}
        <video
          ref={videoRef}
          className="w-full h-full object-contain"
          src={content.video_url || "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"}
          onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
          onLoadedMetadata={(e) => {
            setDuration(e.currentTarget.duration)
            setCurrentTime(0)
          }}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onClick={togglePlay}
        />

        {/* Controls Overlay */}
        <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/70 to-transparent transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          <div className="p-6">
            {/* Progress Bar */}
            <div className="mb-4">
              <input
                type="range"
                min="0"
                max={duration}
                value={currentTime}
                onChange={handleSeek}
                className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
                style={{
                  background: `linear-gradient(to right, #e50914 0%, #e50914 ${(currentTime / duration) * 100}%, #4b5563 ${(currentTime / duration) * 100}%, #4b5563 100%)`
                }}
              />
              <div className="flex justify-between text-xs text-white mt-1">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Control Buttons */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {/* Play/Pause */}
                <button
                  onClick={togglePlay}
                  className="text-white hover:text-primary transition-colors"
                >
                  {isPlaying ? <Pause size={24} /> : <Play size={24} />}
                </button>

                {/* Volume Control */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={toggleMute}
                    className="text-white hover:text-primary transition-colors"
                  >
                    {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                    className="w-20 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                {/* Time Display */}
                <span className="text-white text-sm">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>

              <div className="flex items-center gap-4">
                {/* Quality Selector */}
                <div className="relative">
                  <button
                    onClick={() => setShowQualityMenu(!showQualityMenu)}
                    className="flex items-center gap-2 text-white hover:text-primary transition-colors"
                  >
                    <Settings size={20} />
                    <span className="text-sm">{selectedQuality}</span>
                  </button>

                  {showQualityMenu && (
                    <div className="absolute bottom-full right-0 mb-2 bg-black/90 rounded p-2 min-w-[100px]">
                      {['Auto', '1080p', '720p', '480p'].map(quality => (
                        <button
                          key={quality}
                          onClick={() => handleQualityChange(quality)}
                          className={`block w-full text-left px-2 py-1 text-sm hover:bg-white/20 rounded ${
                            selectedQuality === quality ? 'text-primary' : 'text-white'
                          }`}
                        >
                          {quality}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Fullscreen */}
                <button
                  onClick={toggleFullscreen}
                  className="text-white hover:text-primary transition-colors"
                >
                  <Maximize size={24} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Center Play Button (when paused) */}
        {!isPlaying && (
          <button
            onClick={togglePlay}
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-all hover:scale-110"
          >
            <Play size={40} fill="white" className="ml-1" />
          </button>
        )}
      </div>

      {/* Below Player Content */}
      <div className="max-w-7xl mx-auto px-8 py-8">
        {/* Content Info */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">{content.title}</h1>
              <div className="flex items-center gap-4 text-gray-400 text-sm">
                <span>{content.year}</span>
                <span>{content.rating}</span>
                <span>{content.duration}</span>
                {content.type === 'SERIES' && <span className="px-2 py-1 bg-gray-700 rounded text-xs">SERIES</span>}
              </div>
            </div>
          </div>

          <p className="text-gray-300 mb-6 max-w-3xl">{content.description}</p>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4">
            <button className="flex items-center gap-2 px-6 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors">
              <Plus size={20} />
              <span>Daftar Saya</span>
            </button>
            <button className="flex items-center gap-2 px-6 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors">
              <ThumbsUp size={20} />
              <span>Suka</span>
            </button>
          </div>
        </div>

        {/* More Like This Section */}
        {similarContent && similarContent.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-white mb-4">Mirip dengan {content.title}</h2>
            <ContentRow contents={similarContent} />
          </div>
        )}
      </div>
    </div>
  )
}

export default VideoPlayerPage