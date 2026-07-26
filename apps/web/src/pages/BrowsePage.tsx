import { useMemo, useState } from 'react'
import { Search, SlidersHorizontal } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate, useSearchParams } from 'react-router-dom'
import ContentDetailModal from '@/components/content/ContentDetailModal'
import { ContentCard } from '@/components/home/ContentCard'
import PaymentOptionsModal from '@/components/payment/PaymentOptionsModal'
import { contentService } from '@/services/content.service'
import { paymentService } from '@/services/payment.service'
import { useAuthStore } from '@/stores/authStore'
import type { Content } from '@/types'

const contentTypes = [
  { label: 'Semua', value: '' },
  { label: 'Film', value: 'MOVIE' },
  { label: 'Serial', value: 'SERIES' },
]

const genres = ['Drama', 'Comedy', 'Action', 'Horror', 'Romance', 'Documentary', 'Family', 'Indonesian']

const BrowsePage = () => {
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const { isAuthenticated } = useAuthStore()
  const [selectedContent, setSelectedContent] = useState<Content | null>(null)
  const [paymentContent, setPaymentContent] = useState<Content | null>(null)
  const [type, setType] = useState(params.get('type') || '')
  const [genre, setGenre] = useState(params.get('genre') || '')
  const [query, setQuery] = useState(params.get('search') || '')
  const [sort, setSort] = useState<'newest' | 'az'>('newest')
  const collection = params.get('collection') as 'latest' | 'movie_picks' | 'popular_series' | null

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['browse-catalog', type, genre, collection],
    queryFn: () => contentService.getAllContent({
      limit: 100,
      type: type || undefined,
      genre: genre || undefined,
      homepage_section: collection || undefined,
    }),
  })

  const results = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase('id-ID')
    const filtered = (data?.data || []).filter((content) =>
      !normalized ||
      content.title.toLocaleLowerCase('id-ID').includes(normalized) ||
      content.genre?.some((item) => item.toLocaleLowerCase('id-ID').includes(normalized)),
    )
    return [...filtered].sort((a, b) => sort === 'az'
      ? a.title.localeCompare(b.title, 'id-ID')
      : new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  }, [data?.data, query, sort])

  const updateFilters = (nextType = type, nextGenre = genre, nextQuery = query) => {
    const next = new URLSearchParams()
    if (nextType) next.set('type', nextType)
    if (nextGenre) next.set('genre', nextGenre)
    if (nextQuery.trim()) next.set('search', nextQuery.trim())
    setParams(next, { replace: true })
  }
  const collectionTitle = collection === 'latest'
    ? 'Rilis Terbaru'
    : collection === 'movie_picks'
      ? 'Film Pilihan'
      : collection === 'popular_series'
        ? 'Serial Populer'
        : null

  const play = async (content: Content) => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/watch/${content.id}` } })
      return
    }
    try {
      const access = await paymentService.checkContentAccess(content.id)
      if (!access.data.has_access) return setPaymentContent(content)
      const firstEpisode = content.type === 'SERIES' ? content.episodes?.[0] : null
      navigate(`/watch/${content.id}${firstEpisode ? `?episode=${firstEpisode.id}` : ''}`)
    } catch {
      setPaymentContent(content)
    }
  }

  return (
    <div className="nusantara-browse">
      <header className="nusantara-browse__heading">
        <h1>Jelajah</h1>
        <p>Temukan film dan serial pilihan untuk Anda.</p>
      </header>

      <section className="nusantara-browse__toolbar">
        <form
          onSubmit={(event) => {
            event.preventDefault()
            updateFilters()
          }}
        >
          <Search />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onBlur={() => updateFilters(type, genre, query)}
            placeholder="Cari judul atau genre..."
          />
        </form>
        <div className="nusantara-browse__filters">
          {contentTypes.map((item) => (
            <button
              key={item.label}
              className={type === item.value ? 'is-active' : ''}
              onClick={() => {
                setType(item.value)
                updateFilters(item.value, genre, query)
              }}
            >
              {item.label}
            </button>
          ))}
          <select
            aria-label="Pilih genre"
            value={genre}
            onChange={(event) => {
              setGenre(event.target.value)
              updateFilters(type, event.target.value, query)
            }}
          >
            <option value="">Semua genre</option>
            {genres.map((item) => <option value={item} key={item}>{item}</option>)}
          </select>
        </div>
      </section>

      <section className="nusantara-browse__catalog">
        <header>
          <div>
            <small>KOLEKSI SMASH</small>
            <h2>{collectionTitle || genre || contentTypes.find((item) => item.value === type)?.label || 'Semua Cerita'}</h2>
            {!isLoading && <p>{results.length} tayangan ditemukan</p>}
          </div>
          <label><SlidersHorizontal /><select value={sort} onChange={(event) => setSort(event.target.value as 'newest' | 'az')}><option value="newest">Terbaru</option><option value="az">A–Z</option></select></label>
        </header>

        {isLoading ? (
          <div className="nusantara-browse__grid is-loading">
            {Array.from({ length: 12 }).map((_, index) => <div key={index} />)}
          </div>
        ) : isError ? (
          <div className="nusantara-empty"><h3>Koleksi belum dapat dimuat</h3><p>Periksa koneksi Anda, lalu coba kembali.</p><button className="nusantara-button is-primary" onClick={() => refetch()}>Coba Lagi</button></div>
        ) : results.length === 0 ? (
          <div className="nusantara-empty"><h3>Tidak ada cerita yang ditemukan</h3><p>Coba kata kunci atau filter lain.</p><button className="nusantara-button is-secondary" onClick={() => { setQuery(''); setType(''); setGenre(''); setParams({}) }}>Hapus Filter</button></div>
        ) : (
          <div className="nusantara-browse__grid">
            {results.map((content) => (
              <ContentCard content={content} key={content.id} onInfoClick={setSelectedContent} onPlayClick={play} />
            ))}
          </div>
        )}
      </section>

      <ContentDetailModal
        content={selectedContent}
        isOpen={Boolean(selectedContent)}
        onClose={() => setSelectedContent(null)}
        similarContent={[]}
        onContentChange={setSelectedContent}
      />
      {paymentContent && <PaymentOptionsModal content={paymentContent} isOpen onClose={() => setPaymentContent(null)} />}
    </div>
  )
}

export default BrowsePage
