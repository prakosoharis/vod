import { X, Play, Plus, Share2, Star } from 'lucide-react'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import ContentRow from '../home/ContentRow'
import type { Content } from '@/types'

// Extended types for content with additional properties
interface ContentWithDetails extends Omit<Content, 'cast'> {
  cast?: Array<{
    name: string
    role: string
    avatar_url?: string
  }>
}

interface ContentDetailModalProps {
  content: Content | null
  isOpen: boolean
  onClose: () => void
  similarContent?: Content[]
  onContentChange?: (content: Content) => void
}

const ContentDetailModal = ({ content, isOpen, onClose, similarContent = [], onContentChange }: ContentDetailModalProps) => {
  const navigate = useNavigate()

  // Close on ESC key and prevent background scroll
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEsc)
      document.body.style.overflow = 'hidden' // Prevent background scroll
    }

    return () => {
      document.removeEventListener('keydown', handleEsc)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  // Action button handlers
  const handlePlayClick = () => {
    // Navigate to video player and close modal
    if (content) {
      navigate(`/watch/${content.id}`)
      onClose()
    }
  }

  const handleAddToList = () => {
    // Placeholder for watchlist functionality
    if (content) {
      console.log('Added to watchlist:', content.title)
      // TODO: Implement watchlist API call
      // Show feedback to user
      alert(`"${content.title}" ditambahkan ke daftar menonton!`)
    }
  }

  const handleShare = () => {
    // Placeholder for share functionality
    if (content && navigator.share) {
      navigator.share({
        title: content.title,
        text: content.description || `Tonton ${content.title} di Alkamus!`,
        url: `${window.location.origin}/watch/${content.id}`
      }).catch(() => console.log('Share cancelled'))
    } else if (content) {
      // Fallback: Copy to clipboard
      navigator.clipboard.writeText(`${window.location.origin}/watch/${content.id}`)
      alert('Link disalin ke clipboard!')
    }
  }

  // Mock cast data if not provided
  const mockCast = [
    { name: 'John Doe', role: 'Director', avatar_url: undefined },
    { name: 'Jane Smith', role: 'Producer', avatar_url: undefined },
    { name: 'Bob Johnson', role: 'Main Actor', avatar_url: undefined },
    { name: 'Alice Brown', role: 'Supporting Actor', avatar_url: undefined },
    { name: 'Charlie Wilson', role: 'Writer', avatar_url: undefined },
  ]

  if (!isOpen || !content) return null

  const contentWithDetails = content as ContentWithDetails
  const cast = contentWithDetails.cast || mockCast

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-start justify-center overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative bg-gray-900 max-w-6xl w-full my-4 md:my-6 mx-2 md:mx-4 rounded-lg shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-black/50 rounded-full hover:bg-black/70 text-white transition-colors duration-200"
          aria-label="Close modal"
        >
          <X size={24} />
        </button>

        {/* Backdrop Section */}
        <div className="relative h-[50vh] md:h-[60vh] rounded-t-lg overflow-hidden">
          <img
            src={contentWithDetails.backdrop_url || content.thumbnail_url}
            alt={content.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.src = content.thumbnail_url || 'https://via.placeholder.com/1200x600?text=No+Backdrop'
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/70 to-transparent" />

          {/* Content Info on Backdrop */}
          <div className="absolute bottom-0 left-0 right-0 p-4 md:p-8 max-w-4xl">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-white">{content.title}</h1>
            <div className="flex flex-wrap items-center gap-2 md:gap-4 mb-4 text-white/90 text-sm md:text-base">
              <span>{content.year}</span>
              <span className="flex items-center gap-1">
                <Star size={16} className="text-yellow-400 fill-yellow-400" />
                {content.rating ? (typeof content.rating === 'number' ? content.rating.toFixed(1) : content.rating) : 'N/A'}
              </span>
              {contentWithDetails.duration && <span>{contentWithDetails.duration}</span>}
              {content.genre?.slice(0, 3).map(g => (
                <span key={g} className="px-2 py-1 bg-white/20 rounded text-xs md:text-sm whitespace-nowrap">{g}</span>
              ))}
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={handlePlayClick}
                className="px-6 md:px-8 py-3 bg-red-600 hover:bg-red-700 rounded text-white font-semibold flex items-center gap-2 transition-colors duration-200 transform hover:scale-105 active:scale-95"
              >
                <Play size={20} fill="white" /> Putar
              </button>
              <button
                onClick={handleAddToList}
                className="px-4 md:px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded text-white flex items-center gap-2 transition-colors duration-200 transform hover:scale-105 active:scale-95"
              >
                <Plus size={20} /> Daftar Saya
              </button>
              <button
                onClick={handleShare}
                className="px-4 md:px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded text-white flex items-center gap-2 transition-colors duration-200 transform hover:scale-105 active:scale-95"
              >
                <Share2 size={20} /> Bagikan
              </button>
            </div>
          </div>
        </div>

        {/* Description Section */}
        <div className="p-4 md:p-8">
          <h2 className="text-xl md:text-2xl font-semibold mb-3 text-white">Sinopsis</h2>
          <p className="text-gray-300 leading-relaxed text-sm md:text-base">
            {content.description || 'Tidak ada deskripsi yang tersedia untuk konten ini.'}
          </p>
        </div>

        {/* Cast Section */}
        <div className="px-4 md:px-8 pb-8">
          <h2 className="text-xl md:text-2xl font-semibold mb-4 text-white">Pemain & Kru</h2>
          <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
            {cast.slice(0, 10).map((member, idx) => (
              <div key={idx} className="flex-shrink-0 text-center">
                <div className="w-16 md:w-24 h-16 md:h-24 bg-gray-700 rounded-full mb-2 flex items-center justify-center text-gray-400">
                  {member.avatar_url ? (
                    <img
                      src={member.avatar_url}
                      alt={member.name}
                      className="w-full h-full rounded-full object-cover"
                      onError={() => {}}
                    />
                  ) : (
                    <span className="text-lg md:text-xl font-bold">
                      {member.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </span>
                  )}
                </div>
                <p className="text-xs md:text-sm font-medium text-white truncate w-16 md:w-24">{member.name}</p>
                <p className="text-xs text-gray-400 truncate w-16 md:w-24">{member.role}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Similar Content Section */}
        {similarContent && similarContent.length > 0 && (
          <div className="px-4 md:px-8 pb-8">
            <h2 className="text-xl md:text-2xl font-semibold mb-4 text-white">Lebih Seperti Ini</h2>
            <ContentRow title="" contents={similarContent} onInfoClick={onContentChange} />
          </div>
        )}
      </div>
    </div>
  )
}

export default ContentDetailModal