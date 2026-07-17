import { useRef } from 'react'
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import type { Content } from '@/types'
import { ContentCard } from './ContentCard'

export interface ContentRowProps {
  title: string
  contents: Content[]
  onInfoClick?: (content: Content) => void
  onPlayClick?: (content: Content) => void
  ContentCardComponent?: React.ComponentType<{
    content: Content
    onInfoClick?: (content: Content) => void
    onPlayClick?: (content: Content) => void
  }>
  viewAllHref?: string
}

const ContentRow = ({
  title,
  contents,
  onInfoClick,
  onPlayClick,
  ContentCardComponent = ContentCard,
  viewAllHref,
}: ContentRowProps) => {
  const navigate = useNavigate()
  const railRef = useRef<HTMLDivElement>(null)
  if (!contents?.length) return null

  const scroll = (direction: -1 | 1) => {
    railRef.current?.scrollBy({
      left: direction * Math.min(window.innerWidth * 0.75, 900),
      behavior: 'smooth',
    })
  }

  return (
    <section className="nusantara-section">
      <header className="nusantara-section__head">
        <h2>{title}</h2>
        <button onClick={() => viewAllHref ? navigate(viewAllHref) : scroll(1)}>
          Lihat semua <ArrowRight />
        </button>
      </header>
      <div className="nusantara-rail-wrap">
        <button className="nusantara-rail-arrow is-left" onClick={() => scroll(-1)} aria-label="Geser ke kiri">
          <ChevronLeft />
        </button>
        <div className="nusantara-rail" ref={railRef}>
          {contents.map((content) => (
            <div className="nusantara-rail__item" key={content.id}>
              <ContentCardComponent
                content={content}
                onInfoClick={onInfoClick}
                onPlayClick={onPlayClick}
              />
            </div>
          ))}
        </div>
        <button className="nusantara-rail-arrow is-right" onClick={() => scroll(1)} aria-label="Geser ke kanan">
          <ChevronRight />
        </button>
      </div>
    </section>
  )
}

export default ContentRow
