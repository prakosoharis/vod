import { useEffect, useMemo, useRef, useState } from 'react'
import { Check, Loader2, Pause, Play, Plus, Share2, Volume2, VolumeX, X } from 'lucide-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import PaymentOptionsModal from '../payment/PaymentOptionsModal'
import ContentRow from '../home/ContentRow'
import { paymentService } from '@/services/payment.service'
import { userService } from '@/services/user.service'
import { useAuthStore } from '@/stores/authStore'
import type { Content } from '@/types'

interface ContentDetailModalProps {
  content: Content | null
  isOpen: boolean
  onClose: () => void
  similarContent?: Content[]
  onContentChange?: (content: Content) => void
}

const formatRating = (rating: Content['rating']) => {
  const value = Number(rating)
  return Number.isFinite(value) ? value.toFixed(1) : null
}

const ContentDetailModal = ({
  content,
  isOpen,
  onClose,
  similarContent = [],
  onContentChange,
}: ContentDetailModalProps) => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const trailerRef = useRef<HTMLVideoElement>(null)
  const { isAuthenticated } = useAuthStore()
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [trailerPlaying, setTrailerPlaying] = useState(true)
  const [trailerMuted, setTrailerMuted] = useState(true)
  const [trailerFailed, setTrailerFailed] = useState(false)
  const [inList, setInList] = useState(false)
  const [selectedSeason, setSelectedSeason] = useState(1)

  const { data: accessInfo, isLoading: checkingAccess } = useQuery({
    queryKey: ['content-access', content?.id],
    queryFn: () => content ? paymentService.checkContentAccess(content.id) : null,
    enabled: isOpen && !!content && isAuthenticated,
  })
  const hasAccess = accessInfo?.data?.has_access ?? false
  const { data: watchlist = [] } = useQuery({
    queryKey: ['watchlist'],
    queryFn: userService.getWatchlist,
    enabled: isAuthenticated,
  })

  const watchlistMutation = useMutation({
    mutationFn: async () => {
      if (!content) throw new Error('Konten tidak tersedia')
      const removing = inList
      if (removing) await userService.removeFromWatchlist(content.id)
      else await userService.addToWatchlist(content.id)
      return { removing }
    },
    onSuccess: ({ removing }) => {
      queryClient.setQueryData<Content[]>(['watchlist'], (current = []) =>
        removing
          ? current.filter((item) => item.id !== content?.id)
          : current.some((item) => item.id === content?.id) || !content
            ? current
            : [content, ...current],
      )
      setInList(!removing)
      queryClient.invalidateQueries({ queryKey: ['watchlist'] })
    },
    onError: (error: any) => {
      window.alert(error.response?.data?.error || 'Gagal memperbarui Daftar Saya')
    },
  })

  useEffect(() => {
    if (!isOpen) return
    setTrailerPlaying(true)
    setTrailerMuted(true)
    setTrailerFailed(false)
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleEscape)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = ''
    }
  }, [content?.id, isOpen, onClose])

  const seasons = useMemo(
    () => Array.from(new Set((content?.episodes || []).map((episode) => episode.season_number))).sort((a, b) => a - b),
    [content?.episodes],
  )
  const visibleEpisodes = useMemo(
    () => (content?.episodes || []).filter((episode) => episode.season_number === selectedSeason),
    [content?.episodes, selectedSeason],
  )

  useEffect(() => {
    if (seasons.length) setSelectedSeason(seasons[0])
  }, [content?.id, seasons.join(',')])

  useEffect(() => {
    setInList(Boolean(content && watchlist.some((item) => item.id === content.id)))
  }, [content?.id, watchlist])

  if (!isOpen || !content) return null

  const playOrPurchase = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/watch/${content.id}` } })
      return
    }
    if (!hasAccess) {
      setShowPaymentModal(true)
      return
    }
    onClose()
    const firstEpisode = content.type === 'SERIES' ? content.episodes?.[0] : null
    navigate(`/watch/${content.id}${firstEpisode ? `?episode=${firstEpisode.id}` : ''}`)
  }

  const playEpisode = (episodeId: string) => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/watch/${content.id}?episode=${episodeId}` } })
    } else if (!hasAccess) {
      setShowPaymentModal(true)
    } else {
      onClose()
      navigate(`/watch/${content.id}?episode=${episodeId}`)
    }
  }

  const toggleTrailer = async () => {
    const video = trailerRef.current
    if (!video) return
    if (video.paused) {
      await video.play()
      setTrailerPlaying(true)
    } else {
      video.pause()
      setTrailerPlaying(false)
    }
  }

  const share = async () => {
    const url = `${window.location.origin}/watch/${content.id}`
    if (navigator.share) {
      await navigator.share({ title: content.title, text: content.description || undefined, url }).catch(() => undefined)
    } else {
      await navigator.clipboard.writeText(url)
    }
  }

  const trailerAvailable = Boolean(content.trailer_url) && !trailerFailed
  const seriesReady = content.type !== 'SERIES' || Boolean(content.episodes?.length)
  const cast = content.cast || []
  const rating = formatRating(content.rating)

  return (
    <>
      <div className="nusantara-detail" role="dialog" aria-modal="true" aria-labelledby="content-detail-title">
        <button className="nusantara-detail__close" onClick={onClose} aria-label="Tutup detail">
          <X />
        </button>
        <article className="nusantara-detail__card">
          <div className="nusantara-detail__media">
            {trailerAvailable ? (
              <video
                ref={trailerRef}
                src={content.trailer_url || undefined}
                poster={content.backdrop_url || content.thumbnail_url}
                autoPlay
                muted={trailerMuted}
                loop
                playsInline
                onPlay={() => setTrailerPlaying(true)}
                onPause={() => setTrailerPlaying(false)}
                onError={() => setTrailerFailed(true)}
              />
            ) : (
              <img src={content.backdrop_url || content.thumbnail_url} alt="" />
            )}
            <div className="nusantara-detail__wash" />
            <div className="nusantara-detail__title">
              <small>{trailerAvailable ? 'TRAILER · SMASH PREMIERE' : 'SMASH PILIHAN'}</small>
              <h2 id="content-detail-title">{content.title}</h2>
            </div>
            {trailerAvailable && (
              <div className="nusantara-trailer-controls">
                <button onClick={toggleTrailer}>
                  {trailerPlaying ? <Pause /> : <Play fill="currentColor" />}
                  <span>{trailerPlaying ? 'Jeda' : 'Putar'}</span>
                </button>
                <button
                  onClick={() => {
                    setTrailerMuted((value) => !value)
                    if (trailerRef.current) trailerRef.current.muted = !trailerMuted
                  }}
                >
                  {trailerMuted ? <VolumeX /> : <Volume2 />}
                  <span>{trailerMuted ? 'Aktifkan suara' : 'Bisukan'}</span>
                </button>
              </div>
            )}
          </div>

          <div className="nusantara-detail__body">
            <section>
              <div className="nusantara-meta">
                {content.year && <span>{content.year}</span>}
                {rating && <b>{rating}</b>}
                {content.duration && <span>{content.duration}</span>}
                <b>{content.type === 'SERIES' ? 'SERIAL' : 'FILM'}</b>
              </div>
              <p className="nusantara-detail__synopsis">
                {content.description || 'Sinopsis untuk tayangan ini belum tersedia.'}
              </p>
              {cast.length > 0 && (
                <p className="nusantara-detail__credits">
                  <b>Pemeran</b> {cast.slice(0, 5).map((member) => member.name).join(', ')}
                </p>
              )}
              {content.genre?.length > 0 && (
                <p className="nusantara-detail__credits">
                  <b>Genre</b> {content.genre.join(', ')}
                </p>
              )}
            </section>

            <aside>
              <small>{hasAccess ? 'SIAP DITONTON' : 'AKSES TAYANGAN'}</small>
              <h3>{hasAccess ? 'Akses aktif' : 'Pilih cara menonton'}</h3>
              <p>
                {hasAccess
                  ? 'Anda sudah memiliki akses penuh ke tayangan ini.'
                  : `Sewa tayangan ini untuk akses selama ${content.rental_price?.duration_hours || 0} jam.`}
              </p>
              <button className="nusantara-button is-primary" onClick={playOrPurchase} disabled={checkingAccess || !seriesReady}>
                {checkingAccess ? <Loader2 className="animate-spin" /> : <Play fill="currentColor" />}
                {checkingAccess ? 'Memeriksa akses' : !seriesReady ? 'Episode Belum Tersedia' : hasAccess ? 'Tonton Sekarang' : isAuthenticated ? `Sewa ${content.type === 'SERIES' ? 'Series' : 'Film'}` : 'Masuk untuk Menonton'}
              </button>
              <div className="nusantara-detail__secondary-actions">
                <button
                  onClick={() => {
                    if (!isAuthenticated) {
                      navigate('/login', { state: { from: window.location.pathname } })
                      return
                    }
                    watchlistMutation.mutate()
                  }}
                  disabled={watchlistMutation.isPending}
                >
                  {inList ? <Check /> : <Plus />}
                  {inList ? 'Tersimpan' : 'Daftar Saya'}
                </button>
                <button onClick={share}><Share2 /> Bagikan</button>
              </div>
            </aside>
          </div>

          {!hasAccess && (
            <div className="nusantara-detail__notice">
              <b>Tayangan tersedia melalui rental</b>
              <span>Pilih opsi yang paling sesuai. Pembayaran diproses melalui metode pembayaran Indonesia.</span>
            </div>
          )}

          {content.type === 'SERIES' && (
            <section className="nusantara-detail__episodes">
              <header>
                <div><small>DAFTAR EPISODE</small><h3>{content.episodes?.length || 0} episode tersedia</h3></div>
                {!hasAccess && <span>Sewa series untuk membuka semua episode</span>}
              </header>
              {seasons.length > 0 && (
                <nav className="nusantara-detail__season-tabs" aria-label="Pilih season">
                  {seasons.map((season) => (
                    <button
                      key={season}
                      className={selectedSeason === season ? 'is-active' : ''}
                      onClick={() => setSelectedSeason(season)}
                    >
                      Season {season}
                      <small>{content.episodes?.filter((episode) => episode.season_number === season).length || 0} episode</small>
                    </button>
                  ))}
                </nav>
              )}
              <div>
                {visibleEpisodes.map((episode) => (
                  <button key={episode.id} onClick={() => playEpisode(episode.id)}>
                    <img src={episode.thumbnail_url || content.thumbnail_url} alt="" />
                    <span><small>S{episode.season_number} · E{episode.episode_number}</small><b>{episode.title}</b><em>{episode.duration}</em></span>
                    <Play fill="currentColor" />
                  </button>
                ))}
                {!visibleEpisodes.length && <p>Episode untuk season ini belum tersedia.</p>}
              </div>
            </section>
          )}

          {similarContent.length > 0 && (
            <div className="nusantara-detail__similar">
              <ContentRow
                title="Cerita Serupa"
                contents={similarContent}
                onInfoClick={onContentChange}
                onPlayClick={(next) => {
                  onClose()
                  navigate(`/watch/${next.id}`)
                }}
              />
            </div>
          )}
        </article>

        <div className="nusantara-detail__sticky">
          <p><small>{hasAccess ? 'Akses sewa aktif' : 'Perlu disewa'}</small><b>{content.title}</b></p>
          <button className="nusantara-button is-primary" onClick={playOrPurchase} disabled={!seriesReady}>
            <Play fill="currentColor" /> {!seriesReady ? 'Belum Tersedia' : hasAccess ? 'Tonton Sekarang' : `Sewa ${content.type === 'SERIES' ? 'Series' : 'Film'}`}
          </button>
        </div>
      </div>

      <PaymentOptionsModal
        content={content}
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
      />
    </>
  )
}

export default ContentDetailModal
