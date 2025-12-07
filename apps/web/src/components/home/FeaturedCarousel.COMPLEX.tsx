import React, { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Play, Info } from 'lucide-react'
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
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const [isHovered, setIsHovered] = useState(false)

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying || isHovered || contents.length <= 1) return

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) =>
        prevIndex === contents.length - 1 ? 0 : prevIndex + 1
      )
    }, autoPlayInterval)

    return () => clearInterval(interval)
  }, [isAutoPlaying, isHovered, contents.length, autoPlayInterval])

  const goToSlide = (index: number) => {
    setCurrentIndex(index)
    setIsAutoPlaying(false)
  }

  const goToPrevious = () => {
    setCurrentIndex(currentIndex === 0 ? contents.length - 1 : currentIndex - 1)
    setIsAutoPlaying(false)
  }

  const goToNext = () => {
    setCurrentIndex(currentIndex === contents.length - 1 ? 0 : currentIndex + 1)
    setIsAutoPlaying(false)
  }

  const handleMouseEnter = () => setIsHovered(true)
  const handleMouseLeave = () => {
    setIsHovered(false)
    setTimeout(() => setIsAutoPlaying(true), 3000)
  }

  if (!contents || contents.length === 0) {
    return null
  }

  if (contents.length < 3) {
    return null
  }

  const currentContent = contents[currentIndex]

  return (
    <div
      className="relative w-full h-[80vh] sm:h-[70vh] text-cream-50"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
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

      {/* Warm Vignette Overlay */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(26,22,20,0.9)_100%)]" />

      {/* Warm Gradient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-r from-warm-charcoal-100 via-warm-charcoal-100/70 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-warm-charcoal-100/90 via-warm-charcoal-100/40 to-transparent" />

      {/* Bottom Warm Gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-warm-charcoal-100 to-transparent" />

      {/* SIMPLIFIED Navigation - Prev/Next only */}
      <div className="absolute top-6 right-6 flex items-center gap-3 z-20">
        <button
          onClick={goToPrevious}
          className="p-3 rounded-xl bg-warm-charcoal-50/60 backdrop-blur-sm hover:bg-accent-500/80 text-cream-50 transition-all duration-300 shadow-warm-lg hover:shadow-coffee-glow"
          aria-label="Previous"
        >
          <ChevronLeft size={24} />
        </button>
        <button
          onClick={goToNext}
          className="p-3 rounded-xl bg-warm-charcoal-50/60 backdrop-blur-sm hover:bg-accent-500/80 text-cream-50 transition-all duration-300 shadow-warm-lg hover:shadow-coffee-glow"
          aria-label="Next"
        >
          <ChevronRight size={24} />
        </button>
      </div>

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 px-8 sm:px-12 pb-12 sm:pb-20">
        <div className="max-w-3xl xl:max-w-4xl">
          <h1 className="text-5xl sm:text-6xl xl:text-7xl font-bold tracking-tight mb-4 sm:mb-6 drop-shadow-[0_4px_12px_rgba(44,24,16,0.9)]">
            {currentContent.title}
          </h1>

          {currentContent.description && (
            <p className="text-lg sm:text-xl mb-6 sm:mb-8 line-clamp-2 text-cream-100 drop-shadow-[0_2px_8px_rgba(44,24,16,0.9)] leading-relaxed">
              {currentContent.description}
            </p>
          )}

          {/* Simplified Metadata - ONE line only */}
          <div className="flex items-center gap-4 text-base mb-6 sm:mb-8 text-cream-100">
            {currentContent.year && <span className="font-medium">{currentContent.year}</span>}
            {currentContent.rating && (
              <span className="px-3 py-1 rounded-lg bg-warm-charcoal-50/60 backdrop-blur-sm border border-cream-50/20">
                {currentContent.rating}
              </span>
            )}
            {currentContent.genre?.[0] && (
              <span className="px-3 py-1 rounded-lg bg-accent-500/20 text-accent-200 backdrop-blur-sm">
                {currentContent.genre[0]}
              </span>
            )}
          </div>

          {/* Buttons - ROUNDED & WARM */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Link to={`/watch/${currentContent.id}`}>
              <button className="flex items-center justify-center gap-3 px-10 py-4 bg-accent-500 text-cream-50 font-bold text-lg rounded-xl hover:bg-accent-600 active:scale-95 transition-all duration-200 shadow-warm-xl hover:shadow-coffee-glow">
                <Play className="h-6 w-6" fill="currentColor" />
                <span>Tonton Sekarang</span>
              </button>
            </Link>
            <button
              onClick={() => onInfoClick?.(currentContent)}
              className="flex items-center justify-center gap-3 px-10 py-4 bg-warm-charcoal-50/80 text-cream-50 font-semibold text-lg rounded-xl hover:bg-warm-charcoal-50 backdrop-blur-sm border border-cream-50/30 transition-all duration-200 shadow-warm-lg"
            >
              <Info className="h-6 w-6" />
              <span>Info</span>
            </button>
          </div>
        </div>
      </div>

      {/* CLEAN Progress Dots - Warm colors */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex justify-center gap-2 z-20">
        {contents.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`h-2 rounded-full transition-all duration-300 ${
              index === currentIndex
                ? 'bg-accent-500 w-10 shadow-coffee-glow'
                : 'bg-cream-100/40 w-2 hover:bg-cream-100/60'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  )
}

export default FeaturedCarousel
