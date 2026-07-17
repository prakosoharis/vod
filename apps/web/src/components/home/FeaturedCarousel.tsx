import { useEffect, useState } from 'react'
import { Info, Play } from 'lucide-react'
import type { Content } from '@/types'

interface FeaturedCarouselProps {
  contents: Content[]
  onInfoClick?: (content: Content) => void
  onPlayClick?: (content: Content) => void
  autoPlayInterval?: number
}

const formatRating = (rating: Content['rating']) => {
  const value = Number(rating)
  return Number.isFinite(value) ? value.toFixed(1) : null
}

const FeaturedCarousel = ({
  contents,
  onInfoClick,
  onPlayClick,
  autoPlayInterval = 6500,
}: FeaturedCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    if (paused || contents.length <= 1) return
    const timer = window.setInterval(
      () => setCurrentIndex((index) => (index + 1) % contents.length),
      autoPlayInterval,
    )
    return () => window.clearInterval(timer)
  }, [autoPlayInterval, contents.length, paused])

  if (!contents.length) return null
  const current = contents[currentIndex]
  const rating = formatRating(current.rating)

  return (
    <section
      className="nusantara-hero"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-roledescription="carousel"
      aria-label="Pilihan utama SMASH"
    >
      {contents.map((content, index) => (
        <div
          className={`nusantara-hero__art ${index === currentIndex ? 'is-active' : ''}`}
          key={content.id}
          style={{
            backgroundImage: `url("${content.backdrop_url || content.thumbnail_url}")`,
          }}
          aria-hidden={index !== currentIndex}
        />
      ))}
      <div className="nusantara-hero__wash" />
      <div className="nusantara-hero__content">
        <p className="nusantara-eyebrow">SMASH PILIHAN</p>
        <h1>{current.title}</h1>
        <div className="nusantara-meta">
          {current.year && <span>{current.year}</span>}
          {rating && <b>{rating}</b>}
          {current.genre?.[0] && <span>{current.genre[0]}</span>}
          {current.duration && <span>{current.duration}</span>}
          <b>{current.type === 'SERIES' ? `SERIES · ${current.episodes?.length || 0} EP` : 'FILM'}</b>
        </div>
        {current.description && <p className="nusantara-hero__description">{current.description}</p>}
        <div className="nusantara-actions">
          <button className="nusantara-button is-primary" onClick={() => onPlayClick?.(current)}>
            <Play aria-hidden="true" fill="currentColor" />
            Tonton Sekarang
          </button>
          {onInfoClick && (
            <button className="nusantara-button is-secondary" onClick={() => onInfoClick(current)}>
              <Info aria-hidden="true" />
              Lihat Detail
            </button>
          )}
        </div>
      </div>
      {contents.length > 1 && (
        <div className="nusantara-hero__index" aria-label={`Slide ${currentIndex + 1} dari ${contents.length}`}>
          <strong>{String(currentIndex + 1).padStart(2, '0')}</strong>
          <i />
          <span>{String(contents.length).padStart(2, '0')}</span>
        </div>
      )}
      <div className="nusantara-hero__dots">
        {contents.map((content, index) => (
          <button
            key={content.id}
            className={index === currentIndex ? 'is-active' : ''}
            onClick={() => setCurrentIndex(index)}
            aria-label={`Tampilkan ${content.title}`}
          />
        ))}
      </div>
    </section>
  )
}

export default FeaturedCarousel
