import { useCallback, useEffect, useMemo, useState } from 'react'
import { ArrowRight, Calendar, Clock, Play, Radio, Search } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import Layout from '@/components/layout/Layout'

interface BroadcastEvent {
  id: string
  title: string
  description?: string
  scheduled_time: string
  category: string
  status: 'SCHEDULED' | 'LIVE' | 'ENDED' | 'CANCELLED'
  viewer_count: number
  ticket_price?: number | string
  thumbnail_url?: string
  backdrop_url?: string
}

type LiveTab = 'LIVE' | 'SCHEDULED' | 'ENDED'

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api'
const API_ORIGIN = API_URL.replace(/\/api\/?$/, '')

const resolveImage = (url?: string) => {
  if (!url) return ''
  if (/^https?:\/\//.test(url) || API_URL.startsWith('/')) return url
  return `${API_ORIGIN}${url.startsWith('/') ? url : `/${url}`}`
}

const formatSchedule = (value: string) => new Intl.DateTimeFormat('id-ID', {
  weekday: 'short',
  day: 'numeric',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
  timeZoneName: 'short',
}).format(new Date(value))

const formatPrice = (price?: number | string) => {
  const value = Number(price || 0)
  return value > 0 ? `Rp${value.toLocaleString('id-ID')}` : 'Gratis'
}

const LiveEventsPage = () => {
  const navigate = useNavigate()
  const [broadcasts, setBroadcasts] = useState<BroadcastEvent[]>([])
  const [activeTab, setActiveTab] = useState<LiveTab>('LIVE')
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [failed, setFailed] = useState(false)

  const fetchBroadcasts = useCallback(async (showLoading = false) => {
    if (showLoading) setLoading(true)
    try {
      const response = await fetch(`${API_URL}/broadcasts`)
      if (!response.ok) throw new Error('Gagal mengambil event')
      setBroadcasts(await response.json())
      setFailed(false)
    } catch {
      setFailed(true)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchBroadcasts(true)
    const interval = window.setInterval(() => fetchBroadcasts(), 15_000)
    return () => window.clearInterval(interval)
  }, [fetchBroadcasts])

  const counts = useMemo(() => ({
    LIVE: broadcasts.filter((event) => event.status === 'LIVE').length,
    SCHEDULED: broadcasts.filter((event) => event.status === 'SCHEDULED').length,
    ENDED: broadcasts.filter((event) => event.status === 'ENDED').length,
  }), [broadcasts])

  useEffect(() => {
    if (!loading && counts.LIVE === 0 && activeTab === 'LIVE') {
      setActiveTab(counts.SCHEDULED > 0 ? 'SCHEDULED' : 'ENDED')
    }
  }, [activeTab, counts, loading])

  const featured = broadcasts.find((event) => event.status === 'LIVE')
    || broadcasts.find((event) => event.status === 'SCHEDULED')
    || broadcasts[0]

  const filtered = broadcasts
    .filter((event) => event.status === activeTab)
    .filter((event) => {
      const keyword = query.trim().toLocaleLowerCase('id-ID')
      return !keyword
        || event.title.toLocaleLowerCase('id-ID').includes(keyword)
        || event.category.toLocaleLowerCase('id-ID').includes(keyword)
        || event.description?.toLocaleLowerCase('id-ID').includes(keyword)
    })

  const openEvent = (event: BroadcastEvent) => navigate(`/live/${event.id}`)

  return (
    <Layout>
      <div className="smash-live">
        {featured ? (
          <section
            className="smash-live__hero"
            style={{ backgroundImage: `url("${resolveImage(featured.backdrop_url || featured.thumbnail_url)}")` }}
          >
            <div className="smash-live__hero-wash" />
            <div className="smash-live__hero-content">
              <p>SIARAN LANGSUNG DARI NUSANTARA</p>
              <h1>{featured.title}</h1>
              <span>{featured.description || 'Saksikan pertunjukan dan cerita pilihan, langsung dari berbagai penjuru Indonesia.'}</span>
              <div className="smash-live__facts">
                <b className={featured.status === 'LIVE' ? 'is-live' : ''}>
                  {featured.status === 'LIVE' ? <><i /> LIVE</> : <><Calendar /> AKAN DATANG</>}
                </b>
                {featured.status === 'LIVE' && <span>{Number(featured.viewer_count || 0).toLocaleString('id-ID')} menonton</span>}
                <span>{formatPrice(featured.ticket_price)}</span>
              </div>
              <button className="nusantara-button is-primary" onClick={() => openEvent(featured)}>
                {featured.status === 'LIVE' ? <Play fill="currentColor" /> : <Calendar />}
                {featured.status === 'LIVE' ? 'Tonton Sekarang' : 'Lihat Event'}
              </button>
            </div>
          </section>
        ) : (
          <section className="smash-live__hero is-empty">
            <div className="smash-live__hero-content">
              <p>SIARAN LANGSUNG DARI NUSANTARA</p>
              <h1>Panggung cerita<br />dari seluruh Indonesia.</h1>
              <span>Event live terbaru akan segera hadir di SMASH.</span>
            </div>
          </section>
        )}

        <nav className="smash-live__tabs" aria-label="Status live event">
          <button className={activeTab === 'LIVE' ? 'is-active' : ''} onClick={() => setActiveTab('LIVE')}>
            Live Sekarang <b>{counts.LIVE}</b>
          </button>
          <button className={activeTab === 'SCHEDULED' ? 'is-active' : ''} onClick={() => setActiveTab('SCHEDULED')}>
            Akan Datang <b>{counts.SCHEDULED}</b>
          </button>
          <button className={activeTab === 'ENDED' ? 'is-active' : ''} onClick={() => setActiveTab('ENDED')}>
            Selesai <b>{counts.ENDED}</b>
          </button>
        </nav>

        <section className="smash-live__events">
          <header>
            <div>
              <small>{activeTab === 'LIVE' ? 'SEDANG BERLANGSUNG' : activeTab === 'SCHEDULED' ? 'JANGAN LEWATKAN' : 'ARSIP SIARAN'}</small>
              <h2>{activeTab === 'LIVE' ? 'Live Sekarang' : activeTab === 'SCHEDULED' ? 'Live & Akan Datang' : 'Event Selesai'}</h2>
            </div>
            <label>
              <Search />
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cari event..." />
            </label>
          </header>

          {loading ? (
            <div className="smash-live__grid is-loading">
              {Array.from({ length: 6 }).map((_, index) => <div key={index} />)}
            </div>
          ) : failed ? (
            <div className="nusantara-empty">
              <Radio />
              <h3>Event belum dapat dimuat</h3>
              <p>Periksa koneksi Anda, lalu coba kembali.</p>
              <button className="nusantara-button is-primary" onClick={() => fetchBroadcasts(true)}>Coba Lagi</button>
            </div>
          ) : filtered.length === 0 ? (
            <div className="nusantara-empty">
              <Radio />
              <h3>{query ? 'Event tidak ditemukan' : 'Belum ada event di kategori ini'}</h3>
              <p>{query ? 'Coba gunakan kata kunci yang berbeda.' : 'Kembali lagi untuk melihat jadwal terbaru dari SMASH.'}</p>
            </div>
          ) : (
            <div className="smash-live__grid">
              {filtered.map((event) => (
                <article key={event.id} onClick={() => openEvent(event)}>
                  <div
                    className="smash-live-card__art"
                    style={{ backgroundImage: `url("${resolveImage(event.thumbnail_url || event.backdrop_url)}")` }}
                  >
                    <span className={event.status === 'LIVE' ? 'is-live' : ''}>
                      {event.status === 'LIVE' ? '● LIVE' : event.status === 'ENDED' ? 'SELESAI' : formatSchedule(event.scheduled_time)}
                    </span>
                    <button aria-label={`Buka ${event.title}`}><Play fill="currentColor" /></button>
                  </div>
                  <div className="smash-live-card__copy">
                    <small>{event.category} · {formatPrice(event.ticket_price)}</small>
                    <h3>{event.title}</h3>
                    <p>
                      {event.status === 'LIVE'
                        ? `${Number(event.viewer_count || 0).toLocaleString('id-ID')} sedang menonton`
                        : event.status === 'ENDED'
                          ? 'Siaran telah selesai'
                          : formatSchedule(event.scheduled_time)}
                    </p>
                    <button onClick={(click) => { click.stopPropagation(); openEvent(event) }}>
                      {event.status === 'LIVE' ? 'Tonton Live' : event.status === 'ENDED' ? 'Lihat Detail' : 'Ingatkan Saya'}
                      <ArrowRight />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
          <p className="smash-live__timezone"><Clock /> Waktu ditampilkan sesuai zona waktu perangkat Anda</p>
        </section>
      </div>
    </Layout>
  )
}

export default LiveEventsPage
