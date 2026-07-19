import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ArrowRight, Radio } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import ContentDetailModal from '@/components/content/ContentDetailModal'
import ContentRow from '@/components/home/ContentRow'
import FeaturedCarousel from '@/components/home/FeaturedCarousel'
import PaymentOptionsModal from '@/components/payment/PaymentOptionsModal'
import { contentService } from '@/services/content.service'
import { paymentService } from '@/services/payment.service'
import { userService, type ContentWithProgress } from '@/services/user.service'
import { useAuthStore } from '@/stores/authStore'
import type { Content } from '@/types'

const API_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.smashstream.id/api'

interface BroadcastSummary {
  id: string
  title: string
  description?: string | null
  thumbnail_url?: string | null
  backdrop_url?: string | null
  viewer_count?: number
  is_free?: boolean
}

const LandingSkeleton = () => (
  <div className="nusantara-loading">
    <div className="nusantara-loading__hero" />
    <div className="nusantara-loading__line" />
    <div className="nusantara-loading__rail" />
  </div>
)

export const LandingPage = () => {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthStore()
  const [selectedContent, setSelectedContent] = useState<Content | null>(null)
  const [paymentContent, setPaymentContent] = useState<Content | null>(null)

  const { data: featured = [], isLoading: loadingFeatured } = useQuery({
    queryKey: ['featured'],
    queryFn: contentService.getFeaturedContent,
  })
  const { data: latest = [], isLoading: loadingLatest } = useQuery({
    queryKey: ['latest-releases'],
    queryFn: async () => (await contentService.getAllContent({
      type: 'MOVIE',
      homepage_section: 'latest',
      limit: 10,
    })).data,
  })
  const { data: movies = [] } = useQuery({
    queryKey: ['homepage-movie-picks'],
    queryFn: async () => (await contentService.getAllContent({
      type: 'MOVIE',
      homepage_section: 'movie_picks',
      limit: 20,
    })).data,
  })
  const { data: series = [] } = useQuery({
    queryKey: ['homepage-popular-series'],
    queryFn: async () => (await contentService.getAllContent({
      type: 'SERIES',
      homepage_section: 'popular_series',
      limit: 20,
    })).data,
  })
  const { data: continueWatching = [] } = useQuery<ContentWithProgress[]>({
    queryKey: ['continue-watching'],
    queryFn: userService.getContinueWatching,
    enabled: isAuthenticated,
  })
  const { data: liveBroadcasts = [] } = useQuery<BroadcastSummary[]>({
    queryKey: ['live-broadcasts'],
    queryFn: async () => {
      const response = await fetch(`${API_URL}/broadcasts?status=LIVE`)
      if (!response.ok) throw new Error('Gagal mengambil siaran langsung')
      return response.json()
    },
    refetchInterval: 30_000,
  })

  const play = async (content: Content) => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/watch/${content.id}` } })
      return
    }
    try {
      const access = await paymentService.checkContentAccess(content.id)
      if (!access.data.has_access) {
        setPaymentContent(content)
        return
      }
      const firstEpisode = content.type === 'SERIES' ? content.episodes?.[0] : null
      navigate(`/watch/${content.id}${firstEpisode ? `?episode=${firstEpisode.id}` : ''}`)
    } catch {
      setPaymentContent(content)
    }
  }

  if (loadingFeatured || loadingLatest) return <LandingSkeleton />
  const live = liveBroadcasts[0]
  const editorial = movies[0] || latest[0]

  return (
    <div className="nusantara-home">
      <FeaturedCarousel
        contents={featured}
        onInfoClick={setSelectedContent}
        onPlayClick={play}
      />

      <div className="nusantara-home__content">
        {isAuthenticated && continueWatching.length > 0 && (
          <ContentRow
            title="Lanjutkan Menonton"
            contents={continueWatching}
            onInfoClick={setSelectedContent}
            onPlayClick={play}
          />
        )}
        <ContentRow title="Rilis Terbaru" contents={latest} onInfoClick={setSelectedContent} onPlayClick={play} viewAllHref="/browse?collection=latest" />

        {live && (
          <section className="nusantara-live-feature">
            <header className="nusantara-section__head">
              <div>
                <small>SEDANG BERLANGSUNG</small>
                <h2>Live Sekarang</h2>
              </div>
              <button onClick={() => navigate('/live-events')}>Lihat semua <ArrowRight /></button>
            </header>
            <article>
              <div
                className="nusantara-live-feature__art"
                style={{ backgroundImage: `url("${live.backdrop_url || live.thumbnail_url || ''}")` }}
              >
                <span><i /> LIVE</span>
              </div>
              <div className="nusantara-live-feature__copy">
                <small>EKSKLUSIF SMASH · SIARAN LANGSUNG</small>
                <h3>{live.title}</h3>
                <p>{live.description || 'Saksikan cerita dan pertunjukan pilihan langsung dari berbagai penjuru Nusantara.'}</p>
                <div>
                  {typeof live.viewer_count === 'number' && <span>● {live.viewer_count.toLocaleString('id-ID')} menonton</span>}
                  <b>{live.is_free === false ? 'Bertiket' : 'Gratis'}</b>
                </div>
                <button className="nusantara-button is-primary" onClick={() => navigate(`/live/${live.id}`)}>
                  <Radio /> Tonton Live
                </button>
              </div>
            </article>
          </section>
        )}

        {editorial && (
          <section className="nusantara-editorial">
            <div style={{ backgroundImage: `url("${editorial.backdrop_url || editorial.thumbnail_url}")` }} />
            <article>
              <small>PILIHAN EDITOR</small>
              <h2>Cerita yang tinggal<br />setelah layar gelap.</h2>
              <p>{editorial.description || 'Temukan cerita pilihan tentang rumah, kehilangan, dan keberanian untuk memulai kembali.'}</p>
              <button onClick={() => setSelectedContent(editorial)}>
                Jelajahi cerita <ArrowRight />
              </button>
            </article>
          </section>
        )}

        <ContentRow title="Film Pilihan" contents={movies} onInfoClick={setSelectedContent} onPlayClick={play} viewAllHref="/browse?collection=movie_picks" />
        <ContentRow title="Serial Populer" contents={series} onInfoClick={setSelectedContent} onPlayClick={play} viewAllHref="/browse?collection=popular_series" />
      </div>

      <ContentDetailModal
        content={selectedContent}
        isOpen={Boolean(selectedContent)}
        onClose={() => setSelectedContent(null)}
        similarContent={[]}
        onContentChange={setSelectedContent}
      />
      {paymentContent && (
        <PaymentOptionsModal
          content={paymentContent}
          isOpen
          onClose={() => setPaymentContent(null)}
        />
      )}
    </div>
  )
}

export default LandingPage
