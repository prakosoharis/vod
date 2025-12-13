import React, { useState, useEffect } from 'react'
import { Play } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { Content } from '@/types'

interface FeaturedCarouselProps {
  contents: Content[]
  onInfoClick?: (content: Content) => void
  autoPlayInterval?: number
}

const FeaturedCarousel: React.FC<FeaturedCarouselProps> = ({
  contents,
  onInfoClick,
  autoPlayInterval = 5000
}) => {
  const [currentIndex, setCurrentIndex] = useState(0)

  // Simple auto-play
  useEffect(() => {
    if (contents.length <= 1) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev === contents.length - 1 ? 0 : prev + 1))
    }, autoPlayInterval)

    return () => clearInterval(interval)
  }, [contents.length, autoPlayInterval])

  if (!contents || contents.length === 0) return null

  const currentContent = contents[currentIndex]

  return (
    <div className="relative w-full aspect-video md:max-h-[70vh] text-cream-50 bg-warm-charcoal-100">
      {/* Background Images */}
      {contents.map((content, index) => (
        <div
          key={content.id}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentIndex ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <img
            src={content.backdrop_url}
            alt={content.title}
            className="w-full h-full object-cover"
          />
        </div>
      ))}

      {/* Warm Inviting Gradient - Lighter for image visibility */}
      <div className="absolute inset-0 bg-gradient-to-r from-warm-charcoal-100/60 via-warm-charcoal-100/20 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-warm-charcoal-100/80 via-warm-charcoal-100/10 to-transparent" />
      {/* Subtle warm glow from bottom */}
      <div className="absolute inset-0 bg-gradient-to-t from-accent-500/20 via-transparent to-transparent" />

      {/* Content - Intimate & Breathable */}
      <div className="absolute bottom-0 left-0 right-0 px-4 md:px-12 pb-6 md:pb-16 pt-2 md:pt-6">
        <div className="max-w-2xl space-y-1.5 md:space-y-2">
          {/* Small label - Personal touch */}
          <div className="inline-block px-3 py-1 md:px-5 md:py-2 bg-accent-500/30 backdrop-blur-md rounded-full border md:border-2 border-accent-400/60 shadow-lg shadow-accent-500/40">
            <span className="text-xs md:text-sm font-bold text-accent-300 drop-shadow-lg">Pilihan Untuk Anda</span>
          </div>

          {/* Title - Responsive size */}
          <h1 className="text-2xl md:text-5xl font-bold leading-tight drop-shadow-2xl">
            {currentContent.title}
          </h1>

          {/* Description - Hidden on mobile, visible on tablet+ */}
          {currentContent.description && (
            <p className="hidden md:block text-lg leading-relaxed line-clamp-2 text-cream-100/90 drop-shadow-lg">
              {currentContent.description}
            </p>
          )}

          {/* Inviting Button with warm glow - Responsive */}
          <Link to={`/watch/${currentContent.id}`}>
            <button className="group flex items-center gap-2 md:gap-3 px-6 py-2.5 md:px-10 md:py-4 bg-gradient-to-r from-accent-500 to-accent-600 text-cream-50 font-semibold text-sm md:text-lg rounded-full hover:from-accent-600 hover:to-accent-700 active:scale-95 transition-all duration-300 shadow-lg shadow-accent-500/20 hover:shadow-2xl hover:shadow-accent-500/40">
              <Play className="h-4 w-4 md:h-6 md:w-6 group-hover:scale-110 transition-transform" fill="currentColor" />
              <span>Tonton Sekarang</span>
            </button>
          </Link>
        </div>
      </div>

      {/* Simple Progress Dots */}
      {contents.length > 1 && (
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-2">
          {contents.map((_, index) => (
            <div
              key={index}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                index === currentIndex
                  ? 'bg-accent-500 w-12'
                  : 'bg-cream-100/30 w-1.5'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default FeaturedCarousel
