import { Check, Info, Play, Plus } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { userService } from '@/services/auth.service'
import type { Content } from '@/types'

interface ContentCardProps {
  content: Content
  onInfoClick?: (content: Content) => void
  onPlayClick?: (content: Content) => void
}

const ContentCard = ({ content, onInfoClick, onPlayClick }: ContentCardProps) => {
  const [isInList, setIsInList] = useState(false)
  const queryClient = useQueryClient()
  const mutation = useMutation({
    mutationFn: () => isInList
      ? userService.removeFromWatchlist(content.id)
      : userService.addToWatchlist(content.id),
    onMutate: () => setIsInList((value) => !value),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['watchlist'] }),
    onError: () => setIsInList((value) => !value),
  })

  return (
    <article className="nusantara-poster-card">
      <div
        className="nusantara-poster-card__art"
        onClick={() => onInfoClick?.(content)}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            onInfoClick?.(content)
          }
        }}
        role="button"
        tabIndex={0}
        aria-label={`Lihat detail ${content.title}`}
      >
        <img src={content.thumbnail_url} alt="" loading="lazy" />
        <span className="nusantara-poster-card__badge">
          {content.type === 'SERIES' ? `SERIES${content.episodes?.length ? ` · ${content.episodes.length} EP` : ''}` : content.featured ? 'FILM PILIHAN' : 'FILM'}
        </span>
        <span className="nusantara-poster-card__overlay">
          <button
            className="nusantara-round-action is-play"
            onClick={(event) => {
              event.stopPropagation()
              onPlayClick?.(content)
            }}
            aria-label={`Tonton ${content.title}`}
          >
            <Play fill="currentColor" />
          </button>
          <button
            className="nusantara-round-action"
            onClick={(event) => {
              event.stopPropagation()
              mutation.mutate()
            }}
            aria-label={isInList ? 'Hapus dari Daftar Saya' : 'Tambahkan ke Daftar Saya'}
          >
            {isInList ? <Check /> : <Plus />}
          </button>
          <span className="nusantara-round-action" aria-hidden="true"><Info /></span>
        </span>
      </div>
      <button className="nusantara-poster-card__copy" onClick={() => onInfoClick?.(content)}>
        <strong>{content.title}</strong>
        <small>{[content.type === 'SERIES' ? 'Series' : 'Film', content.genre?.[0], content.year].filter(Boolean).join(' · ')}</small>
      </button>
    </article>
  )
}

export { ContentCard }
