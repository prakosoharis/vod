import React, { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Play, Info } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { Content } from '@/types'

interface FeaturedCarouselProps {
  contents: Content[]
  onInfoClick?: (content: Content) => void
  autoPlayInterval?: number // in milliseconds
}

const FeaturedCarousel: React.FC<FeaturedCarouselProps> = ({
  contents,
  onInfoClick,
  autoPlayInterval = 5000 // Default 5 seconds
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
    setIsAutoPlaying(false) // Stop auto-play when user manually navigates
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
    // Resume auto-play after 3 seconds of not hovering
    setTimeout(() => setIsAutoPlaying(true), 3000)
  }

  if (!contents || contents.length === 0) {
    return null
  }

  // Only show carousel if we have at least 3 featured items
  if (contents.length < 3) {
    return null
  }

  const currentContent = contents[currentIndex]

  return (
    <div
      className="relative w-full h-[80vh] sm:h-[70vh] text-white"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Background Images for all slides */}
      {contents.map((content, index) => (
        <div
          key={content.id}
          className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ${
            index === currentIndex ? 'opacity-100' : 'opacity-0'
          }`}
          style={{ backgroundImage: `url(${content.backdrop_url})` }}
        />
      ))}

      {/* Vignette overlay */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(0,0,0,0.8)_100%)]" />

      {/* Gradient Overlays (stronger for readability) */}
      <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

      {/* Bottom gradient - IMPORTANT for overlap effect */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent" />

      {/* Navigation Controls */}
      <div className="absolute top-4 right-4 flex items-center gap-4 z-20">
        {/* Auto-play indicator */}
        <div className="flex items-center gap-2 bg-black/40 backdrop-blur-sm px-3 py-2 rounded-full">
          <div className={`w-2 h-2 rounded-full ${isAutoPlaying ? 'bg-green-500' : 'bg-gray-500'}`} />
          <span className="text-sm text-white">
            {isAutoPlaying ? 'Auto' : 'Manual'}
          </span>
        </div>

        {/* Previous/Next buttons */}
        <button
          onClick={goToPrevious}
          className="p-3 rounded-full bg-black/40 backdrop-blur-sm hover:bg-black/60 text-white transition-colors"
          aria-label="Previous slide"
        >
          <ChevronLeft size={24} />
        </button>
        <button
          onClick={goToNext}
          className="p-3 rounded-full bg-black/40 backdrop-blur-sm hover:bg-black/60 text-white transition-colors"
          aria-label="Next slide"
        >
          <ChevronRight size={24} />
        </button>
      </div>

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 px-6 sm:px-12 pb-10 sm:pb-16">
        <div className="max-w-3xl xl:max-w-4xl drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)]">
          <h1 className="text-4xl sm:text-5xl xl:text-6xl font-extrabold tracking-tight mb-3 sm:mb-4">
            {currentContent.title}
          </h1>
          {currentContent.description && (
            <p className="text-base sm:text-lg mb-4 sm:mb-6 line-clamp-3 text-gray-200 drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] leading-relaxed">
              {currentContent.description}
            </p>
          )}

          {/* Metadata */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-sm sm:text-base mb-4 sm:mb-6 text-gray-200">
            {currentContent.year && <span className="opacity-90">{currentContent.year}</span>}
            {currentContent.rating && (
              <span className="px-2 py-0.5 rounded bg-white/20 backdrop-blur-sm border border-white/20">
                {currentContent.rating}
              </span>
            )}
            {Array.isArray(currentContent.genre) && currentContent.genre.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {currentContent.genre.slice(0, 3).map((g: string) => (
                  <span
                    key={g}
                    className="px-2 py-0.5 rounded bg-white/10 border border-white/10 backdrop-blur-[1px]"
                  >
                    {g}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <Link to={`/watch/${currentContent.id}`}>
              <button className="flex items-center justify-center gap-2 px-8 sm:px-10 py-3 sm:py-3.5 bg-white text-black font-bold rounded-md hover:bg-white/90 active:bg-white/80 transition-colors shadow focus:outline-none focus:ring-2 focus:ring-white/60">
                <Play className="h-5 w-5" />
                <span>Putar</span>
              </button>
            </Link>
            <button
              onClick={() => onInfoClick?.(currentContent)}
              className="flex items-center justify-center gap-2 px-8 sm:px-10 py-3 sm:py-3.5 bg-white/15 text-white font-bold rounded-md hover:bg-white/20 active:bg-white/10 transition-colors border border-white/25 focus:outline-none focus:ring-2 focus:ring-white/40"
            >
              <Info className="h-5 w-5" />
              <span>Info Lebih Lanjut</span>
            </button>
          </div>
        </div>
      </div>

      {/* Progress Indicators */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex justify-center gap-2 z-20">
        {contents.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-2 h-2 rounded-full transition-all ${
              index === currentIndex
                ? 'bg-red-600 w-8'
                : 'bg-gray-600 hover:bg-gray-500'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Auto-play Progress Bar */}
      {isAutoPlaying && contents.length > 1 && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-800 z-30">
          <div
            className="h-full bg-red-600 transition-all ease-linear"
            style={{
              width: `${((currentIndex + 1) / contents.length) * 100}%`,
              transitionDuration: `${autoPlayInterval}ms`
            }}
          />
        </div>
      )}
    </div>
  )
}

export default FeaturedCarousel