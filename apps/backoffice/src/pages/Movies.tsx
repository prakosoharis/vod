import { useEffect, useMemo, useState } from 'react'
import { FilmIcon, MagnifyingGlassIcon, PencilIcon, PlusIcon, RectangleStackIcon, TrashIcon, UserGroupIcon } from '@heroicons/react/24/outline'
import { toast } from 'react-toastify'
import { moviesApi, publishersApi } from '../services/api'
import type { Episode, Movie, RentalReport, Publisher } from '../types'
import { useAuth } from '../hooks/useAuth'

type FormState = {
  title: string; description: string; genre: string; year: number; rating: string; duration: string
  thumbnail_url: string; backdrop_url: string; video_url: string; hls_url: string; trailer_url: string
  cast: string; type: 'MOVIE' | 'SERIES'; featured: boolean; rental_price: number
  show_in_latest: boolean; show_in_movie_picks: boolean; show_in_popular_series: boolean
  rental_duration_hours: number; rental_active: boolean; episodes: Episode[]
  publisher_id: string
}

const emptyForm = (type: 'MOVIE' | 'SERIES' = 'MOVIE'): FormState => ({
  title: '', description: '', genre: '', year: new Date().getFullYear(), rating: '4.0', duration: '',
  thumbnail_url: '', backdrop_url: '', video_url: '', hls_url: '', trailer_url: '', cast: '', type,
  featured: false, show_in_latest: false, show_in_movie_picks: false, show_in_popular_series: false,
  rental_price: 15000, rental_duration_hours: 48, rental_active: true, episodes: [], publisher_id: '',
})

const blankEpisode = (episodes: Episode[]): Episode => ({
  season_number: 1, episode_number: episodes.length + 1, title: '', description: '', duration: '',
  thumbnail_url: '', video_url: '', hls_url: '', is_published: true,
})

export default function Movies() {
  const { user } = useAuth()
  const readOnly = user?.role === 'PUBLISHER'
  const [contents, setContents] = useState<Movie[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'ALL' | 'MOVIE' | 'SERIES'>('ALL')
  const [editing, setEditing] = useState<Movie | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<FormState>(emptyForm())
  const [reportFor, setReportFor] = useState<Movie | null>(null)
  const [report, setReport] = useState<RentalReport | null>(null)
  const [publishers, setPublishers] = useState<Publisher[]>([])

  const load = async () => {
    try {
      const response = await moviesApi.getAll({ limit: 100 })
      setContents(response.data || [])
    } catch { toast.error('Gagal memuat konten') } finally { setLoading(false) }
  }
  useEffect(() => {
    load()
    if (!readOnly) publishersApi.getAll().then(setPublishers).catch(() => toast.error('Gagal memuat publisher'))
  }, [readOnly])

  const visible = useMemo(() => contents.filter((item) =>
    (filter === 'ALL' || item.type === filter) &&
    `${item.title} ${item.description || ''}`.toLowerCase().includes(search.toLowerCase())
  ), [contents, filter, search])

  const openCreate = (type: 'MOVIE' | 'SERIES') => {
    setEditing(null); setForm(emptyForm(type)); setShowForm(true)
  }
  const openEdit = (item: Movie) => {
    setEditing(item)
    setForm({
      title: item.title, description: item.description || '', genre: item.genre.join(', '), year: item.year,
      rating: String(item.rating), duration: item.duration, thumbnail_url: item.thumbnail_url || '',
      backdrop_url: item.backdrop_url || '', video_url: item.video_url || '', hls_url: item.hls_url || '',
      trailer_url: item.trailer_url || '', cast: (item.cast || []).map((c) => `${c.name} as ${c.role}`).join(', '),
      type: item.type, featured: item.featured, show_in_latest: item.show_in_latest ?? false,
      show_in_movie_picks: item.show_in_movie_picks ?? false, show_in_popular_series: item.show_in_popular_series ?? false,
      rental_price: Number(item.rental_price?.price || 15000),
      rental_duration_hours: item.rental_price?.duration_hours || 48,
      rental_active: item.rental_price?.is_active ?? true, episodes: item.episodes || [],
      publisher_id: item.publisher_id || '',
    })
    setShowForm(true)
  }
  const payload = {
    title: form.title, description: form.description, genre: form.genre.split(',').map((v) => v.trim()).filter(Boolean),
    year: form.year, rating: form.rating, duration: form.duration, thumbnail_url: form.thumbnail_url,
    backdrop_url: form.backdrop_url, video_url: form.type === 'MOVIE' ? form.video_url : '',
    hls_url: form.type === 'MOVIE' ? form.hls_url : '', trailer_url: form.trailer_url,
    cast: form.cast.split(',').map((value) => { const [name, role] = value.trim().split(' as '); return { name, role: role || 'Actor' } }).filter((v) => v.name),
    type: form.type, featured: form.featured, show_in_latest: form.type === 'MOVIE' && form.show_in_latest,
    show_in_movie_picks: form.type === 'MOVIE' && form.show_in_movie_picks,
    show_in_popular_series: form.type === 'SERIES' && form.show_in_popular_series,
    rental_price_amount: form.rental_price,
    rental_duration_hours: form.rental_duration_hours, rental_active: form.rental_active,
    episodes: form.type === 'SERIES' ? form.episodes.map((episode) => ({
      season_number: episode.season_number,
      episode_number: episode.episode_number,
      title: episode.title,
      description: episode.description || '',
      duration: episode.duration,
      thumbnail_url: episode.thumbnail_url || '',
      video_url: episode.video_url || '',
      hls_url: episode.hls_url || '',
      is_published: episode.is_published,
    })) : [], publisher_id: form.publisher_id || null,
  }
  const save = async (event: React.FormEvent) => {
    event.preventDefault()
    try {
      if (editing) await moviesApi.update(editing.id, payload)
      else await moviesApi.create(payload)
      toast.success(`${form.type === 'SERIES' ? 'Series' : 'Film'} berhasil ${editing ? 'diperbarui' : 'ditambahkan'}`)
      setShowForm(false); setEditing(null); await load()
    } catch (error: any) { toast.error(error.response?.data?.error || 'Gagal menyimpan konten') }
  }
  const showRentals = async (item: Movie) => {
    setReportFor(item)
    try { setReport(await moviesApi.getRentals(item.id)) } catch { toast.error('Gagal memuat penyewaan') }
  }
  const updateEpisode = (index: number, patch: Partial<Episode>) =>
    setForm({ ...form, episodes: form.episodes.map((episode, i) => i === index ? { ...episode, ...patch } : episode) })

  if (loading) return <div className="flex h-64 items-center justify-center"><div className="h-12 w-12 animate-spin rounded-full border-b-2 border-primary-600"/></div>

  return <div>
    <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
      <div><h1 className="text-3xl font-bold text-gray-900">Film & Series</h1><p className="mt-2 text-sm text-gray-600">{readOnly ? `Katalog milik ${user?.publisher?.name || 'publisher Anda'} (read-only).` : 'Kelola katalog, publisher, tarif rental, dan episode series.'}</p></div>
      {!readOnly && <div className="flex gap-2">
        <button onClick={() => openCreate('MOVIE')} className="btn-primary flex items-center"><PlusIcon className="mr-2 h-5 w-5"/>Tambah Film</button>
        <button onClick={() => openCreate('SERIES')} className="btn-secondary flex items-center"><RectangleStackIcon className="mr-2 h-5 w-5"/>Tambah Series</button>
      </div>}
    </div>
    <div className="mb-6 flex flex-wrap gap-3">
      <div className="relative min-w-[280px] flex-1"><MagnifyingGlassIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400"/><input className="input-field pl-10" placeholder="Cari film atau series..." value={search} onChange={(e) => setSearch(e.target.value)}/></div>
      <div className="flex rounded-lg bg-gray-100 p-1">{(['ALL','MOVIE','SERIES'] as const).map((value) => <button key={value} onClick={() => setFilter(value)} className={`rounded-md px-4 py-2 text-sm ${filter === value ? 'bg-white font-semibold shadow' : 'text-gray-600'}`}>{value === 'ALL' ? 'Semua' : value === 'MOVIE' ? 'Film' : 'Series'}</button>)}</div>
    </div>
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
      {visible.map((item) => <article key={item.id} className="card">
        <div className="relative mb-4 aspect-[3/4] overflow-hidden rounded-lg bg-gray-100">
          {item.thumbnail_url ? <img src={item.thumbnail_url} className="h-full w-full object-cover" alt={item.title}/> : <FilmIcon className="m-auto h-full w-16 text-gray-400"/>}
          <span className={`absolute left-2 top-2 rounded-full px-2 py-1 text-xs font-bold ${item.type === 'SERIES' ? 'bg-purple-600 text-white' : 'bg-blue-500 text-white'}`}>{item.type === 'SERIES' ? `SERIES · ${item.episodes?.length || 0} EPISODE` : 'FILM'}</span>
          {!readOnly && <button onClick={() => openEdit(item)} className="absolute right-2 top-2 rounded-full bg-white p-2 shadow"><PencilIcon className="h-4 w-4"/></button>}
        </div>
        <h3 className="font-semibold text-gray-900">{item.title}</h3><p className="mt-1 line-clamp-2 text-sm text-gray-500">{item.description}</p>
        <div className="mt-3 rounded-lg bg-emerald-50 p-3"><b className="text-emerald-800">Rp {Number(item.rental_price?.price || 0).toLocaleString('id-ID')} · {item.rental_price?.duration_hours || 0} jam</b>
          <button onClick={() => showRentals(item)} className="mt-2 flex text-sm text-emerald-700"><UserGroupIcon className="mr-1 h-4 w-4"/>{item._count?.rentals || 0} kali disewa</button></div>
      </article>)}
    </div>

    {showForm && <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-900/60 p-4">
      <div className="mx-auto my-8 w-full max-w-4xl rounded-xl bg-white p-6 shadow-xl">
        <div className="mb-5 flex justify-between"><div><h2 className="text-xl font-bold">{editing ? 'Edit' : 'Tambah'} {form.type === 'SERIES' ? 'Series' : 'Film'}</h2><p className="text-sm text-gray-500">Tarif dan masa sewa berlaku untuk keseluruhan konten.</p></div><button onClick={() => setShowForm(false)} className="btn-secondary">Tutup</button></div>
        <form onSubmit={save} className="space-y-5">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="md:col-span-2 text-sm font-medium">Publisher
              <select required className="input-field mt-1" value={form.publisher_id} onChange={(e) => setForm({...form,publisher_id:e.target.value})}>
                <option value="">Pilih publisher</option>
                {publishers.map((publisher) => <option key={publisher.id} value={publisher.id}>{publisher.name}</option>)}
              </select>
            </label>
            <label className="md:col-span-2 text-sm font-medium">Judul<input required className="input-field mt-1" value={form.title} onChange={(e) => setForm({...form,title:e.target.value})}/></label>
            <label className="md:col-span-2 text-sm font-medium">Deskripsi<textarea required className="input-field mt-1" rows={3} value={form.description} onChange={(e) => setForm({...form,description:e.target.value})}/></label>
            <label className="text-sm font-medium">Genre<input required className="input-field mt-1" value={form.genre} onChange={(e) => setForm({...form,genre:e.target.value})} placeholder="Drama, Action"/></label>
            <label className="text-sm font-medium">Cast<input className="input-field mt-1" value={form.cast} onChange={(e) => setForm({...form,cast:e.target.value})} placeholder="Nama as Peran"/></label>
            <label className="text-sm font-medium">Tahun<input required type="number" className="input-field mt-1" value={form.year} onChange={(e) => setForm({...form,year:Number(e.target.value)})}/></label>
            <label className="text-sm font-medium">Rating<input required type="number" min="1" max="5" step=".1" className="input-field mt-1" value={form.rating} onChange={(e) => setForm({...form,rating:e.target.value})}/></label>
            <label className="text-sm font-medium">Durasi / jumlah episode<input required className="input-field mt-1" value={form.duration} onChange={(e) => setForm({...form,duration:e.target.value})} placeholder={form.type === 'SERIES' ? '8 episode' : '120 min'}/></label>
            <label className="text-sm font-medium">Trailer URL<input type="url" className="input-field mt-1" value={form.trailer_url} onChange={(e) => setForm({...form,trailer_url:e.target.value})}/></label>
            <label className="text-sm font-medium">Thumbnail URL<input required type="url" className="input-field mt-1" value={form.thumbnail_url} onChange={(e) => setForm({...form,thumbnail_url:e.target.value})}/></label>
            <label className="text-sm font-medium">Backdrop URL<input type="url" className="input-field mt-1" value={form.backdrop_url} onChange={(e) => setForm({...form,backdrop_url:e.target.value})}/></label>
          </div>
          <section className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
            <h3 className="mb-3 font-bold text-emerald-900">Pengaturan Rental</h3>
            <div className="grid gap-4 md:grid-cols-3">
              <label className="text-sm font-medium">Harga (Rp)<input required type="number" min="1" className="input-field mt-1" value={form.rental_price} onChange={(e) => setForm({...form,rental_price:Number(e.target.value)})}/></label>
              <label className="text-sm font-medium">Masa sewa (jam)<input required type="number" min="1" className="input-field mt-1" value={form.rental_duration_hours} onChange={(e) => setForm({...form,rental_duration_hours:Number(e.target.value)})}/></label>
              <label className="flex items-center gap-2 pt-7"><input type="checkbox" checked={form.rental_active} onChange={(e) => setForm({...form,rental_active:e.target.checked})}/>Rental aktif</label>
            </div>
          </section>
          {form.type === 'MOVIE' ? <section className="grid gap-4 rounded-xl border p-4 md:grid-cols-2"><h3 className="md:col-span-2 font-bold">Sumber Video Film</h3>
            <label className="text-sm font-medium">Video URL<input type="url" className="input-field mt-1" value={form.video_url} onChange={(e) => setForm({...form,video_url:e.target.value})}/></label>
            <label className="text-sm font-medium">HLS URL<input type="url" className="input-field mt-1" value={form.hls_url} onChange={(e) => setForm({...form,hls_url:e.target.value})}/></label></section>
          : <section className="rounded-xl border border-purple-200 bg-purple-50/40 p-4">
            <div className="mb-4 flex justify-between"><div><h3 className="font-bold text-purple-900">Daftar Episode</h3><p className="text-xs text-gray-500">Satu rental series membuka semua episode selama masa sewa.</p></div>
              <button type="button" className="btn-secondary flex items-center" onClick={() => setForm({...form,episodes:[...form.episodes,blankEpisode(form.episodes)]})}><PlusIcon className="mr-1 h-4 w-4"/>Tambah Episode</button></div>
            <div className="space-y-4">{form.episodes.map((episode,index) => <div key={index} className="rounded-lg border bg-white p-4">
              <div className="mb-3 flex justify-between"><b>Episode {index + 1}</b><button type="button" onClick={() => setForm({...form,episodes:form.episodes.filter((_,i)=>i!==index)})} className="text-red-600"><TrashIcon className="h-5 w-5"/></button></div>
              <div className="grid gap-3 md:grid-cols-4">
                <label className="text-xs">Season<input required type="number" min="1" className="input-field mt-1" value={episode.season_number} onChange={(e)=>updateEpisode(index,{season_number:Number(e.target.value)})}/></label>
                <label className="text-xs">Nomor episode<input required type="number" min="1" className="input-field mt-1" value={episode.episode_number} onChange={(e)=>updateEpisode(index,{episode_number:Number(e.target.value)})}/></label>
                <label className="text-xs md:col-span-2">Judul<input required className="input-field mt-1" value={episode.title} onChange={(e)=>updateEpisode(index,{title:e.target.value})}/></label>
                <label className="text-xs">Durasi<input required className="input-field mt-1" value={episode.duration} onChange={(e)=>updateEpisode(index,{duration:e.target.value})} placeholder="45 min"/></label>
                <label className="text-xs md:col-span-3">Deskripsi<input className="input-field mt-1" value={episode.description || ''} onChange={(e)=>updateEpisode(index,{description:e.target.value})}/></label>
                <label className="text-xs md:col-span-2">Video URL<input type="url" className="input-field mt-1" value={episode.video_url || ''} onChange={(e)=>updateEpisode(index,{video_url:e.target.value})}/></label>
                <label className="text-xs md:col-span-2">HLS URL<input type="url" className="input-field mt-1" value={episode.hls_url || ''} onChange={(e)=>updateEpisode(index,{hls_url:e.target.value})}/></label>
                <label className="text-xs md:col-span-4">Thumbnail episode<input type="url" className="input-field mt-1" value={episode.thumbnail_url || ''} onChange={(e)=>updateEpisode(index,{thumbnail_url:e.target.value})}/></label>
              </div></div>)}
              {!form.episodes.length && <p className="py-6 text-center text-sm text-gray-500">Belum ada episode. Klik “Tambah Episode”.</p>}</div>
          </section>}
          <section className="rounded-xl border border-amber-200 bg-amber-50 p-4">
            <h3 className="font-bold text-amber-900">Penempatan di Homepage</h3>
            <p className="mb-3 text-xs text-gray-600">Admin menentukan sendiri konten yang tampil pada setiap bagian.</p>
            <div className="grid gap-3 md:grid-cols-2">
              <label className="flex items-center gap-2"><input type="checkbox" checked={form.featured} onChange={(e)=>setForm({...form,featured:e.target.checked})}/>Carousel slideshow</label>
              {form.type === 'MOVIE' && <label className="flex items-center gap-2"><input type="checkbox" checked={form.show_in_latest} onChange={(e)=>setForm({...form,show_in_latest:e.target.checked})}/>Rilis Terbaru (maks. 10)</label>}
              {form.type === 'MOVIE' && <label className="flex items-center gap-2"><input type="checkbox" checked={form.show_in_movie_picks} onChange={(e)=>setForm({...form,show_in_movie_picks:e.target.checked})}/>Film Pilihan</label>}
              {form.type === 'SERIES' && <label className="flex items-center gap-2"><input type="checkbox" checked={form.show_in_popular_series} onChange={(e)=>setForm({...form,show_in_popular_series:e.target.checked})}/>Serial Populer</label>}
            </div>
          </section>
          <div className="flex justify-end gap-2"><button type="button" className="btn-secondary" onClick={()=>setShowForm(false)}>Batal</button><button className="btn-primary">Simpan {form.type === 'SERIES' ? 'Series' : 'Film'}</button></div>
        </form>
      </div>
    </div>}

    {report && reportFor && <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 p-4"><div className="w-full max-w-4xl rounded-xl bg-white p-6">
      <div className="mb-4 flex justify-between"><div><h3 className="text-xl font-bold">Penyewaan “{reportFor.title}”</h3><p className="text-sm text-gray-500">{report.summary.total_rentals} transaksi · {report.summary.active_rentals} aktif</p></div><button className="btn-secondary" onClick={()=>setReport(null)}>Tutup</button></div>
      <div className="max-h-[60vh] overflow-auto"><table className="min-w-full text-sm"><thead><tr><th className="p-3 text-left">User</th><th className="p-3 text-left">Mulai</th><th className="p-3 text-left">Berakhir</th><th className="p-3 text-left">Harga</th></tr></thead><tbody>{report.rentals.map((r)=><tr className="border-t" key={r.id}><td className="p-3">{r.user?.full_name || r.user?.email}</td><td className="p-3">{new Date(r.rented_at).toLocaleString('id-ID')}</td><td className="p-3">{new Date(r.expired_at).toLocaleString('id-ID')}</td><td className="p-3">Rp {Number(r.price_paid).toLocaleString('id-ID')}</td></tr>)}</tbody></table></div>
    </div></div>}
  </div>
}
