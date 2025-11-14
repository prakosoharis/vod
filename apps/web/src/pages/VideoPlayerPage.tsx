import { useParams, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
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
  Plus,
  Share2
} from 'lucide-react'

// Import custom hooks
import useVideoPlayer from '@/hooks/useVideoPlayer'
import useContentData from '@/hooks/useContentData'
import { useContentModal } from '@/hooks/useModal'

// Import components
import ContentRow from '@/components/home/ContentRow'
import ContentDetailModal from '@/components/content/ContentDetailModal'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

const VideoPlayerPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()

  // Use custom hooks
  const {
    videoRef,
    state: videoState,
    actions: videoActions
  } = useVideoPlayer({
    autoHideControls: true,
    autoHideDelay: 3000
  })

  const {
    content,
    similarContent,
    isLoading,
    error
  } = useContentData({
    contentId: id,
    enabled: !!id
  })

  const {
    isOpen: modalOpen,
    data: selectedContent,
    open: openModal,
    close: closeModal
  } = useContentModal()

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Prevent default for video controls
      if (e.target instanceof HTMLInputElement) return

      switch (e.key.toLowerCase()) {
        case ' ':
        case 'spacebar':
          e.preventDefault()
          videoActions.togglePlay()
          break
        case 'f':
          e.preventDefault()
          videoActions.toggleFullscreen()
          break
        case 'm':
          e.preventDefault()
          videoActions.toggleMute()
          break
        case 'arrowleft':
          e.preventDefault()
          if (videoRef.current) {
            videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime - 10)
          }
          break
        case 'arrowright':
          e.preventDefault()
          if (videoRef.current) {
            videoRef.current.currentTime = Math.min(videoState.duration, videoRef.current.currentTime + 10)
          }
          break
        case 'arrowup':
          e.preventDefault()
          videoActions.handleVolumeChange(Math.min(1, videoState.volume + 0.1))
          break
        case 'arrowdown':
          e.preventDefault()
          videoActions.handleVolumeChange(Math.max(0, videoState.volume - 0.1))
          break
        case 'escape':
          e.preventDefault()
          if (document.fullscreenElement) {
            document.exitFullscreen()
          }
          break
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [videoActions, videoState.duration, videoRef])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <LoadingSpinner size="lg" />
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
            className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
          >
            Kembali ke Browse
          </button>
        </div>
      </div>
    )
  }

  const handleContentChange = (newContent: typeof content) => {
    openModal(newContent)
  }

  return (
    <div className="bg-black min-h-screen">
      {/* Video Player Container */}
      <div
        className="relative w-full bg-black"
        onMouseMove={videoActions.showControls}
        style={{ paddingTop: '56.25%' }}
      >
        {/* Back Button */}
        <button
          onClick={() => navigate('/browse')}
          className="absolute top-3 left-3 md:top-4 md:left-4 z-20
                     flex items-center gap-1.5 md:gap-2
                     px-2 py-1.5 md:px-3 md:py-2
                     bg-black/60 hover:bg-black/80 backdrop-blur-sm
                     rounded
                     transition-all duration-200
                     text-sm md:text-base text-white font-medium"
        >
          <ArrowLeft size={16} className="md:w-5 md:h-5" />
          <span>Kembali</span>
        </button>

        {/* Next Episode (for series) */}
        {content.type === 'SERIES' && videoState.isPlaying && (
          <div className="absolute top-4 right-4 z-20">
            <button className="flex items-center gap-2 px-4 py-2 bg-black/50 hover:bg-black/70 rounded transition-colors">
              <SkipForward size={20} />
              <span className="text-white">Episode Berikutnya</span>
            </button>
          </div>
        )}

        {/* Video Container */}
        <div className="absolute inset-0">
          <video
            ref={videoRef}
            className="w-full h-full object-contain"
            src={content.video_url || "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"}
            onClick={videoActions.togglePlay}
          />
        </div>

        {/* Controls Overlay */}
        <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/50 to-transparent transition-opacity duration-300 ${videoState.showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          <div className="p-3 md:p-4">
            {/* Progress Bar */}
            <div className="mb-2 md:mb-4">
              <input
                type="range"
                min="0"
                max={videoState.duration}
                value={videoState.currentTime}
                onChange={(e) => videoActions.seekTo(parseFloat(e.target.value))}
                className="w-full h-1 md:h-0.5 appearance-none bg-gray-600 rounded-lg cursor-pointer
                         [&::-webkit-slider-thumb]:appearance-none
                         [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3
                         [&::-webkit-slider-thumb]:md:w-2 md:[&::-webkit-slider-thumb]:h-2
                         [&::-webkit-slider-thumb]:rounded-full
                         [&::-webkit-slider-thumb]:bg-red-600
                         [&::-moz-range-thumb]:appearance-none
                         [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:h-3
                         [&::-moz-range-thumb]:md:w-2 md:[&::-moz-range-thumb]:h-2
                         [&::-moz-range-thumb]:rounded-full
                         [&::-moz-range-thumb]:bg-red-600
                         [&::-moz-range-thumb]:border-none"
                style={{
                  background: `linear-gradient(to right, #e50914 0%, #e50914 ${(videoState.currentTime / videoState.duration) * 100}%, #4b5563 ${(videoState.currentTime / videoState.duration) * 100}%, #4b5563 100%)`
                }}
              />
              <div className="flex justify-between text-xs md:text-sm text-white mt-1">
                <span>{videoActions.formatTime(videoState.currentTime)}</span>
                <span>{videoActions.formatTime(videoState.duration)}</span>
              </div>
            </div>

            {/* Control Buttons */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 md:gap-3">
                {/* Play/Pause */}
                <button
                  onClick={videoActions.togglePlay}
                  className="p-2 md:p-1.5 hover:bg-white/10 rounded-full transition"
                >
                  {videoState.isPlaying ? <Pause size={24} className="md:w-5 md:h-5" /> : <Play size={24} className="md:w-5 md:h-5" />}
                </button>

                {/* Volume Control */}
                <div className="hidden sm:flex items-center gap-2 md:gap-2">
                  <button
                    onClick={videoActions.toggleMute}
                    className="p-2 md:p-1.5 hover:bg-white/10 rounded-full transition"
                  >
                    {videoState.isMuted ? <VolumeX size={24} className="md:w-5 md:h-5" /> : <Volume2 size={24} className="md:w-5 md:h-5" />}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={videoState.isMuted ? 0 : videoState.volume}
                    onChange={(e) => videoActions.handleVolumeChange(parseFloat(e.target.value))}
                    className="hidden md:block w-20 h-1 appearance-none bg-gray-600 rounded-lg
                             [&::-webkit-slider-thumb]:appearance-none
                             [&::-webkit-slider-thumb]:w-2 [&::-webkit-slider-thumb]:h-2
                             [&::-webkit-slider-thumb]:rounded-full
                             [&::-webkit-slider-thumb]:bg-white
                             [&::-moz-range-thumb]:appearance-none
                             [&::-moz-range-thumb]:w-2 [&::-moz-range-thumb]:h-2
                             [&::-moz-range-thumb]:rounded-full
                             [&::-moz-range-thumb]:bg-white
                             [&::-moz-range-thumb]:border-none"
                  />
                </div>

                {/* Time Display */}
                <span className="text-sm md:text-sm text-white">
                  {videoActions.formatTime(videoState.currentTime)} / {videoActions.formatTime(videoState.duration)}
                </span>
              </div>

              <div className="flex items-center gap-2 md:gap-3">
                {/* Quality Selector */}
                <div className="relative">
                  <button
                    onClick={videoActions.toggleQualityMenu}
                    className="flex items-center gap-1 md:gap-2 p-2 md:p-1.5 hover:bg-white/10 rounded transition"
                  >
                    <Settings size={20} className="md:w-5 md:h-5" />
                    <span className="text-sm md:text-sm hidden md:inline">{videoState.selectedQuality}</span>
                  </button>

                  {videoState.showQualityMenu && (
                    <div className="absolute bottom-full right-0 mb-2 bg-black/90 rounded p-2 min-w-[100px]">
                      {['Auto', '1080p', '720p', '480p'].map(quality => (
                        <button
                          key={quality}
                          onClick={() => videoActions.selectQuality(quality)}
                          className={`block w-full text-left px-2 py-1 text-sm hover:bg-white/20 rounded ${
                            videoState.selectedQuality === quality ? 'text-red-500' : 'text-white'
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
                  onClick={videoActions.toggleFullscreen}
                  className="p-2 md:p-1.5 hover:bg-white/10 rounded-full transition"
                >
                  <Maximize size={24} className="md:w-5 md:h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Center Play Button (when paused) */}
        {!videoState.isPlaying && (
          <button
            onClick={videoActions.togglePlay}
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-20 h-20 md:w-16 md:h-16 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-all duration-300"
          >
            <Play size={40} fill="white" className="ml-1 md:w-8 md:h-8" />
          </button>
        )}
      </div>

      {/* Content Info Section */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 md:py-10">
        {/* Title */}
        <h1 className="text-2xl md:text-3xl font-bold mb-2 md:mb-3 text-white">
          {content?.title}
        </h1>

        {/* Metadata */}
        <div className="flex items-center gap-3 md:gap-4 text-sm md:text-base text-gray-400 mb-4">
          <span>{content?.year}</span>
          <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
          <span>⭐ {content?.rating}</span>
          <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
          <span>{content?.duration}</span>
          <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
          <div className="flex gap-1">
            {content?.genre?.slice(0, 3).map((g, i) => (
              <span key={i} className="text-xs md:text-sm">{g}</span>
            ))}
          </div>
        </div>

        {/* Description */}
        <p className="text-sm md:text-base text-gray-300 leading-relaxed mb-6 max-w-3xl">
          {content?.description}
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2 md:gap-3 mb-8">
          <button
            onClick={() => {/* Add to watchlist functionality */}}
            className="flex items-center justify-center gap-2
                       px-4 py-2 md:px-5 md:py-2.5
                       bg-gray-800/80 hover:bg-gray-700
                       border border-gray-700
                       rounded
                       text-sm md:text-base font-medium text-white
                       transition-all duration-200
                       min-w-[120px] md:min-w-[140px]"
          >
            <Plus size={18} className="md:w-5 md:h-5" />
            <span>Daftar Saya</span>
          </button>

          <button
            onClick={() => {/* Like functionality */}}
            className="flex items-center justify-center gap-2
                       px-4 py-2 md:px-5 md:py-2.5
                       bg-gray-800/80 hover:bg-gray-700
                       border border-gray-700
                       rounded
                       text-sm md:text-base font-medium text-white
                       transition-all duration-200
                       min-w-[100px] md:min-w-[120px]"
          >
            <ThumbsUp size={18} className="md:w-5 md:h-5" />
            <span>Suka</span>
          </button>

          <button
            className="flex items-center justify-center gap-2
                       px-4 py-2 md:px-5 md:py-2.5
                       bg-gray-800/80 hover:bg-gray-700
                       border border-gray-700
                       rounded
                       text-sm md:text-base font-medium text-white
                       transition-all duration-200"
          >
            <Share2 size={18} className="md:w-5 md:h-5" />
            <span>Bagikan</span>
          </button>
        </div>

        {/* Cast Section (Optional) */}
        {false && (content as any)?.cast && (content as any).cast.length > 0 && (
          <div className="border-t border-gray-800 pt-6">
            <h2 className="text-lg md:text-xl font-semibold mb-4 text-white">
              Pemain & Kru
            </h2>
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
              {(content as any).cast.slice(0, 10).map((member: any, idx: number) => (
                <div key={idx} className="flex-shrink-0 text-center">
                  <div className="w-16 h-16 md:w-20 md:h-20 bg-gray-800 rounded-full mb-2" />
                  <p className="text-xs md:text-sm font-medium max-w-[80px] truncate text-white">
                    {member.name}
                  </p>
                  <p className="text-xs text-gray-500">{member.role}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* More Like This Section */}
      {similarContent && similarContent.length > 0 && content && (
        <div className="max-w-7xl mx-auto px-4 md:px-8 pb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Mirip dengan {content.title}</h2>
          <ContentRow title="" contents={similarContent} onInfoClick={openModal} />
        </div>
      )}

      {/* Content Detail Modal */}
      <ContentDetailModal
        content={selectedContent}
        isOpen={modalOpen}
        onClose={closeModal}
        similarContent={similarContent?.filter(item => item.id !== selectedContent?.id)}
        onContentChange={handleContentChange}
      />
    </div>
  )
}

export default VideoPlayerPage