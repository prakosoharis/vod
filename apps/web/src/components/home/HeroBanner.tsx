import { Play, Info } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { Content } from '@/types'
import { useMemo } from 'react'

export interface HeroBannerProps {
  content: Content
}

export const HeroBanner = ({ content }: HeroBannerProps) => {
  if (!content) return null

  const year = useMemo(() => {
    if (!content.release_date) return undefined
    try {
      return new Date(content.release_date).getFullYear()
    } catch {
      return undefined
    }
  }, [content.release_date])

  return (
    <div className="relative w-full h-[80vh] sm:h-[70vh] text-white">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${content.backdrop_url})` }}
      />

      {/* Vignette overlay */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(0,0,0,0.8)_100%)]" />

      {/* Gradient Overlays (stronger for readability) */}
      <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

      {/* Bottom gradient - IMPORTANT for overlap effect */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent" />

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 px-6 sm:px-12 pb-10 sm:pb-16">
        <div className="max-w-3xl xl:max-w-4xl drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)]">
          <h1 className="text-4xl sm:text-5xl xl:text-6xl font-extrabold tracking-tight mb-3 sm:mb-4">
            {content.title}
          </h1>
          {content.description && (
            <p className="text-base sm:text-lg mb-4 sm:mb-6 line-clamp-3 text-gray-200 drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] leading-relaxed">
              {content.description}
            </p>
          )}

          {/* Metadata */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-sm sm:text-base mb-4 sm:mb-6 text-gray-200">
            {year && <span className="opacity-90">{year}</span>}
            {content.rating && (
              <span className="px-2 py-0.5 rounded bg-white/20 backdrop-blur-sm border border-white/20">
                {content.rating}
              </span>
            )}
            {Array.isArray(content.genres) && content.genres.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {content.genres.slice(0, 3).map((g) => (
                  <span
                    key={typeof g === 'string' ? g : (g as any).name}
                    className="px-2 py-0.5 rounded bg-white/10 border border-white/10 backdrop-blur-[1px]"
                  >
                    {typeof g === 'string' ? g : (g as any).name}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <Link to={`/watch/${content.id}`}>
              <button className="flex items-center justify-center gap-2 px-8 sm:px-10 py-3 sm:py-3.5 bg-white text-black font-bold rounded-md hover:bg-white/90 active:bg-white/80 transition-colors shadow focus:outline-none focus:ring-2 focus:ring-white/60">
                <Play className="h-5 w-5" />
                <span>Putar</span>
              </button>
            </Link>
            <button className="flex items-center justify-center gap-2 px-8 sm:px-10 py-3 sm:py-3.5 bg-white/15 text-white font-bold rounded-md hover:bg-white/20 active:bg-white/10 transition-colors border border-white/25 focus:outline-none focus:ring-2 focus:ring-white/40">
              <Info className="h-5 w-5" />
              <span>Info Lebih Lanjut</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HeroBanner
