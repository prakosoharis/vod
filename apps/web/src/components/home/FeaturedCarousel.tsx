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
    <div className="relative w-full h-[45vh] text-cream-50">
      {/* Background Images */}
      {contents.map((content, index) => (
        <div
          key={content.id}
          className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ${
            index === currentIndex ? 'opacity-100' : 'opacity-0'
          }`}
          style={{ backgroundImage: `url(${content.backdrop_url})` }}
        />
      ))}

      {/* Warm Inviting Gradient - Coffee House Vibe */}
      <div className="absolute inset-0 bg-gradient-to-r from-warm-charcoal-100 via-warm-charcoal-100/80 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-warm-charcoal-100 via-warm-charcoal-100/40 to-transparent" />
      {/* Subtle warm glow from bottom */}
      <div className="absolute inset-0 bg-gradient-to-t from-accent-500/10 via-transparent to-transparent" />

      {/* Content - Intimate & Breathable */}
      <div className="absolute bottom-0 left-0 right-0 px-12 pb-24">
        <div className="max-w-2xl space-y-6">
          {/* Small label - Personal touch */}
          <div className="inline-block px-4 py-1.5 bg-accent-500/20 backdrop-blur-sm rounded-full border border-accent-500/30">
            <span className="text-sm font-medium text-accent-400">Pilihan Untuk Anda</span>
          </div>

          {/* Title - More intimate size */}
          <h1 className="text-5xl font-bold leading-tight drop-shadow-2xl">
            {currentContent.title}
          </h1>

          {/* Description - Warm & inviting */}
          {currentContent.description && (
            <p className="text-lg leading-relaxed line-clamp-2 text-cream-100/90 drop-shadow-lg">
              {currentContent.description}
            </p>
          )}

          {/* Inviting Button with warm glow */}
          <Link to={`/watch/${currentContent.id}`}>
            <button className="group flex items-center gap-3 px-10 py-4 bg-gradient-to-r from-accent-500 to-accent-600 text-cream-50 font-semibold text-lg rounded-full hover:from-accent-600 hover:to-accent-700 active:scale-95 transition-all duration-300 shadow-lg shadow-accent-500/20 hover:shadow-2xl hover:shadow-accent-500/40">
              <Play className="h-6 w-6 group-hover:scale-110 transition-transform" fill="currentColor" />
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
