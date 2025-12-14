import React, { useState, useEffect } from 'react'
import { Play, Info } from 'lucide-react'
import type { Content } from '@/types'

interface FeaturedCarouselProps {
  contents: Content[]
  onInfoClick?: (content: Content) => void
  onPlayClick?: (content: Content) => void
  autoPlayInterval?: number
}

const FeaturedCarousel: React.FC<FeaturedCarouselProps> = ({
  contents,
  onInfoClick,
  onPlayClick,
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
    <>
      {/* MOBILE VIEW - Cinematic Hero Style */}
      <div className="md:hidden relative w-full h-[85vh] text-cream-50 bg-warm-charcoal-100">
        {/* Background Poster Images with Blur */}
        {contents.map((content, index) => (
          <div
            key={content.id}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentIndex ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <img
              src={content.thumbnail_url}
              alt={content.title}
              className="w-full h-full object-cover"
            />
          </div>
        ))}

        {/* Dark Overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-warm-charcoal-100/40 via-warm-charcoal-100/60 to-warm-charcoal-100" />

        {/* Content - Centered Cinematic Layout */}
        <div className="absolute inset-0 flex flex-col items-center justify-end px-6 pb-8">
          <div className="w-full max-w-md space-y-4 text-center">
            {/* Title */}
            <h1 className="text-3xl font-bold leading-tight drop-shadow-2xl">
              {currentContent.title}
            </h1>

            {/* Metadata - Year, Rating, Genre */}
            <div className="flex items-center justify-center gap-3 text-sm text-cream-100">
              {currentContent.year && <span>{currentContent.year}</span>}
              {currentContent.year && currentContent.duration && <span>•</span>}
              {currentContent.duration && <span>{currentContent.duration}</span>}
              {currentContent.genre && currentContent.genre.length > 0 && (
                <>
                  <span>•</span>
                  <span>{currentContent.genre[0]}</span>
                </>
              )}
            </div>

            {/* Buttons */}
            <div className="space-y-3">
              {/* Play Button - White/Prominent */}
              <button
                onClick={() => onPlayClick?.(currentContent)}
                className="w-full group flex items-center justify-center gap-2 px-8 py-3 bg-cream-50 text-warm-charcoal-100 font-bold text-base rounded-md hover:bg-cream-100 active:scale-95 transition-all duration-300 shadow-lg"
              >
                <Play className="h-5 w-5 group-hover:scale-110 transition-transform" fill="currentColor" />
                <span>Putar</span>
              </button>

              {/* Info Button */}
              {onInfoClick && (
                <button
                  onClick={() => onInfoClick(currentContent)}
                  className="w-full group flex items-center justify-center gap-2 px-8 py-3 bg-warm-charcoal-50/80 backdrop-blur-md text-cream-50 font-semibold text-base rounded-md hover:bg-warm-charcoal-50 active:scale-95 transition-all duration-300 border border-cream-100/30"
                >
                  <Info className="h-5 w-5 group-hover:scale-110 transition-transform" />
                  <span>Info Lebih Lanjut</span>
                </button>
              )}
            </div>

            {/* Progress Dots */}
            {contents.length > 1 && (
              <div className="flex justify-center gap-1.5 pt-4">
                {contents.map((_, index) => (
                  <div
                    key={index}
                    className={`h-1.5 rounded-full transition-all duration-500 ${
                      index === currentIndex
                        ? 'bg-accent-500 w-6'
                        : 'bg-cream-100/30 w-1.5'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* TABLET/DESKTOP VIEW - Original Horizontal Layout */}
      <div className="hidden md:block relative w-full aspect-video md:max-h-[70vh] text-cream-50 bg-warm-charcoal-100">
        {/* Background Images */}
        {contents.map((content, index) => (
          <div
            key={content.id}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentIndex ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <img
              src={content.backdrop_url || content.thumbnail_url}
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
        <div className="absolute bottom-0 left-0 right-0 px-12 pb-16 pt-6">
          <div className="max-w-2xl space-y-2">
            {/* Small label - Personal touch */}
            <div className="inline-block px-5 py-2 bg-accent-500/30 backdrop-blur-md rounded-full border-2 border-accent-400/60 shadow-lg shadow-accent-500/40">
              <span className="text-sm font-bold text-accent-300 drop-shadow-lg">Pilihan Untuk Anda</span>
            </div>

            {/* Title - Responsive size */}
            <h1 className="text-5xl font-bold leading-tight drop-shadow-2xl">
              {currentContent.title}
            </h1>

            {/* Description */}
            {currentContent.description && (
              <p className="text-lg leading-relaxed line-clamp-2 text-cream-100/90 drop-shadow-lg">
                {currentContent.description}
              </p>
            )}

            {/* Action Buttons */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => onPlayClick?.(currentContent)}
                className="group flex items-center gap-3 px-10 py-4 bg-gradient-to-r from-accent-500 to-accent-600 text-cream-50 font-semibold text-lg rounded-full hover:from-accent-600 hover:to-accent-700 active:scale-95 transition-all duration-300 shadow-lg shadow-accent-500/20 hover:shadow-2xl hover:shadow-accent-500/40"
              >
                <Play className="h-6 w-6 group-hover:scale-110 transition-transform" fill="currentColor" />
                <span>Tonton Sekarang</span>
              </button>

              {/* Info Button */}
              {onInfoClick && (
                <button
                  onClick={() => onInfoClick(currentContent)}
                  className="group flex items-center gap-3 px-10 py-4 bg-warm-charcoal-50/80 backdrop-blur-md text-cream-50 font-semibold text-lg rounded-full hover:bg-warm-charcoal-50 active:scale-95 transition-all duration-300 border-2 border-cream-100/30 shadow-lg"
                >
                  <Info className="h-6 w-6 group-hover:scale-110 transition-transform" />
                  <span>Info Lebih Lanjut</span>
                </button>
              )}
            </div>
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
    </>
  )
}

export default FeaturedCarousel
