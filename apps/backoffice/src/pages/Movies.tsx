import { useState, useEffect } from 'react'
import { MagnifyingGlassIcon, FilmIcon, PlayIcon, PlusIcon, PencilIcon, StarIcon } from '@heroicons/react/24/outline'
import { moviesApi } from '../services/api'
import { Movie } from '../types'
import { toast } from 'react-toastify'

export default function Movies() {
  const [movies, setMovies] = useState<Movie[]>([])
  const [filteredMovies, setFilteredMovies] = useState<Movie[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    genre: '',
    year: new Date().getFullYear(),
    rating: '4.0',
    duration: '',
    thumbnail_url: '',
    backdrop_url: '',
    video_url: '',
    hls_url: '',
    trailer_url: '',
    cast: '',
    type: 'MOVIE',
    featured: false
  })

  useEffect(() => {
    fetchMovies()
  }, [])

  useEffect(() => {
    const filtered = movies.filter(movie =>
      movie.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      movie.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredMovies(filtered)
  }, [searchTerm, movies])

  const fetchMovies = async () => {
    try {
      const data = await moviesApi.getAll({ type: 'MOVIE' })
      setMovies(data.data || [])
      setFilteredMovies(data.data || [])
    } catch (error) {
      console.error('Error fetching movies:', error)
      toast.error('Gagal memuat data film')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateMovie = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const newMovie = await moviesApi.create({
        title: formData.title,
        description: formData.description,
        genre: formData.genre.split(',').map(g => g.trim()).filter(g => g),
        year: formData.year,
        rating: formData.rating,
        duration: formData.duration,
        thumbnail_url: formData.thumbnail_url,
        backdrop_url: formData.backdrop_url,
        video_url: formData.video_url,
        hls_url: formData.hls_url,
        trailer_url: formData.trailer_url,
        cast: formData.cast.split(',').map(c => {
          const [name, role] = c.trim().split(' as ')
          return { name: name.trim(), role: role?.trim() || 'Actor' }
        }).filter(c => c.name),
        type: formData.type as 'MOVIE' | 'SERIES',
        featured: formData.featured
      })
      setShowCreateModal(false)
      resetForm()
      fetchMovies()
      toast.success(`Film "${newMovie.title}" berhasil ditambahkan!`)
    } catch (error: any) {
      console.error('Error creating movie:', error)
      const errorMessage = error.response?.data?.error || error.message || 'Gagal menambahkan film'
      toast.error(errorMessage)
    }
  }

  const handleUpdateMovie = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedMovie) return
    try {
      const updatedMovie = await moviesApi.update(selectedMovie.id, {
        title: formData.title,
        description: formData.description,
        genre: formData.genre.split(',').map(g => g.trim()).filter(g => g),
        year: formData.year,
        rating: formData.rating,
        duration: formData.duration,
        thumbnail_url: formData.thumbnail_url,
        backdrop_url: formData.backdrop_url,
        video_url: formData.video_url,
        hls_url: formData.hls_url,
        trailer_url: formData.trailer_url,
        cast: formData.cast.split(',').map(c => {
          const [name, role] = c.trim().split(' as ')
          return { name: name.trim(), role: role?.trim() || 'Actor' }
        }).filter(c => c.name),
        type: formData.type as 'MOVIE' | 'SERIES',
        featured: formData.featured
      })
      setShowEditModal(false)
      setSelectedMovie(null)
      resetForm()
      fetchMovies()
      toast.success(`Film "${updatedMovie.title}" berhasil diperbarui!`)
    } catch (error: any) {
      console.error('Error updating movie:', error)
      const errorMessage = error.response?.data?.error || error.message || 'Gagal memperbarui film'
      toast.error(errorMessage)
    }
  }

  const openEditModal = (movie: Movie) => {
    setSelectedMovie(movie)
    setFormData({
      title: movie.title,
      description: movie.description || '',
      genre: movie.genre.join(', '),
      year: movie.year,
      rating: movie.rating.toString(),
      duration: movie.duration,
      thumbnail_url: movie.thumbnail_url || '',
      backdrop_url: movie.backdrop_url || '',
      video_url: movie.video_url || '',
      hls_url: movie.hls_url || '',
      trailer_url: movie.trailer_url || '',
      cast: movie.cast.map(c => `${c.name} as ${c.role}`).join(', '),
      type: movie.type,
      featured: movie.featured
    })
    setShowEditModal(true)
  }

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      genre: '',
      year: new Date().getFullYear(),
      rating: '4.0',
      duration: '',
      thumbnail_url: '',
      backdrop_url: '',
      video_url: '',
      hls_url: '',
      trailer_url: '',
      cast: '',
      type: 'MOVIE',
      featured: false
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Konten Film</h1>
          <p className="mt-2 text-sm text-gray-600">
            Kelola dan pantau semua konten film yang tersedia di platform VOD
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-primary flex items-center"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Tambah Film
        </button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
          </div>
          <input
            type="text"
            className="input-field pl-10"
            placeholder="Cari berdasarkan judul atau deskripsi film..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Movies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredMovies.length > 0 ? (
          filteredMovies.map((movie) => (
            <div key={movie.id} className="card hover:shadow-lg transition-shadow duration-300">
              {/* Movie Poster */}
              <div className="relative aspect-[3/4] rounded-lg overflow-hidden mb-4 bg-gray-100">
                {movie.thumbnail_url ? (
                  <img
                    src={movie.thumbnail_url}
                    alt={movie.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = 'https://via.placeholder.com/300x450?text=No+Image'
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <FilmIcon className="h-16 w-16 text-gray-400" />
                  </div>
                )}

                {/* Status Badges */}
                <div className="absolute top-2 left-2 flex flex-col gap-1">
                  {movie.featured && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-400 text-yellow-900">
                      <StarIcon className="h-3 w-3 mr-1" />
                      Featured
                    </span>
                  )}
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-400 text-blue-900">
                    {movie.type}
                  </span>
                </div>

                {/* Edit Button */}
                <div className="absolute top-2 right-2">
                  <button
                    onClick={() => openEditModal(movie)}
                    className="p-2 bg-white bg-opacity-90 rounded-full shadow-md hover:bg-opacity-100 transition-all"
                  >
                    <PencilIcon className="h-4 w-4 text-gray-700" />
                  </button>
                </div>
              </div>

              {/* Movie Info */}
              <div className="space-y-2">
                <h3 className="font-semibold text-gray-900 line-clamp-1">
                  {movie.title}
                </h3>

                <p className="text-sm text-gray-600 line-clamp-2">
                  {movie.description || 'Tidak ada deskripsi'}
                </p>

                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center">
                    <PlayIcon className="h-4 w-4 mr-1" />
                    {movie.duration}
                  </div>
                  <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                    ⭐ {movie.rating}
                  </span>
                </div>

                {/* Genre */}
                <div className="flex flex-wrap gap-1">
                  {movie.genre.map((g, index) => (
                    <span key={index} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                      {g}
                    </span>
                  ))}
                </div>

                {/* Links */}
                <div className="pt-2 border-t border-gray-100 space-y-1">
                  {movie.hls_url && (
                    <div className="text-xs">
                      <span className="font-medium text-green-700">HLS:</span>
                      <a
                        href={movie.hls_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-1 text-green-600 hover:text-green-700 truncate block"
                      >
                        {movie.hls_url}
                      </a>
                    </div>
                  )}
                  {movie.video_url && (
                    <div className="text-xs">
                      <span className="font-medium text-gray-700">Video:</span>
                      <a
                        href={movie.video_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-1 text-primary-600 hover:text-primary-700 truncate block"
                      >
                        {movie.video_url}
                      </a>
                    </div>
                  )}
                  {movie.trailer_url && (
                    <div className="text-xs">
                      <span className="font-medium text-gray-700">Trailer:</span>
                      <a
                        href={movie.trailer_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-1 text-primary-600 hover:text-primary-700 truncate block"
                      >
                        {movie.trailer_url}
                      </a>
                    </div>
                  )}
                </div>

                {/* Dates */}
                <div className="pt-2 text-xs text-gray-500 border-t border-gray-100">
                  <div>Tahun: {movie.year}</div>
                  <div>Dibuat: {new Date(movie.created_at).toLocaleDateString('id-ID')}</div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <FilmIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Tidak ada film</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm ? 'Tidak ada film yang cocok dengan pencarian Anda' : 'Belum ada film yang tersedia'}
            </p>
          </div>
        )}
      </div>

      {/* Create Movie Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-lg bg-white max-h-[90vh] overflow-y-auto">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Tambah Film Baru</h3>
              <form onSubmit={handleCreateMovie}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Judul Film</label>
                  <input
                    type="text"
                    required
                    className="input-field"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Masukkan judul film"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Deskripsi</label>
                  <textarea
                    required
                    rows={3}
                    className="input-field"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Masukkan deskripsi film"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Genre (pisahkan dengan koma)</label>
                  <input
                    type="text"
                    required
                    className="input-field"
                    value={formData.genre}
                    onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                    placeholder="Action, Drama, Thriller"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tahun</label>
                    <input
                      type="number"
                      required
                      min="1900"
                      max={new Date().getFullYear() + 10}
                      className="input-field"
                      value={formData.year}
                      onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Rating (1-5)</label>
                    <input
                      type="number"
                      required
                      min="1"
                      max="5"
                      step="0.1"
                      className="input-field"
                      value={formData.rating}
                      onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Durasi</label>
                  <input
                    type="text"
                    required
                    className="input-field"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    placeholder="120 min atau 10 episodes"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Thumbnail URL</label>
                  <input
                    type="url"
                    className="input-field"
                    value={formData.thumbnail_url}
                    onChange={(e) => setFormData({ ...formData, thumbnail_url: e.target.value })}
                    placeholder="https://example.com/poster.jpg"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Backdrop URL</label>
                  <input
                    type="url"
                    className="input-field"
                    value={formData.backdrop_url}
                    onChange={(e) => setFormData({ ...formData, backdrop_url: e.target.value })}
                    placeholder="https://example.com/backdrop.jpg"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Video URL</label>
                  <input
                    type="url"
                    className="input-field"
                    value={formData.video_url}
                    onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                    placeholder="https://example.com/video.mp4"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">HLS URL (Opsional - Adaptive Streaming)</label>
                  <input
                    type="url"
                    className="input-field"
                    value={formData.hls_url}
                    onChange={(e) => setFormData({ ...formData, hls_url: e.target.value })}
                    placeholder="http://localhost:8080/videos/abc-123/playlist.m3u8"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    💡 Kosongkan jika tidak menggunakan HLS. Player akan prioritaskan HLS jika diisi.
                  </p>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Trailer URL</label>
                  <input
                    type="url"
                    className="input-field"
                    value={formData.trailer_url}
                    onChange={(e) => setFormData({ ...formData, trailer_url: e.target.value })}
                    placeholder="https://example.com/trailer.mp4"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Cast (nama as role, pisahkan dengan koma)</label>
                  <input
                    type="text"
                    className="input-field"
                    value={formData.cast}
                    onChange={(e) => setFormData({ ...formData, cast: e.target.value })}
                    placeholder="John Doe as Actor, Jane Smith as Actress"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tipe</label>
                  <select
                    required
                    className="input-field"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as 'MOVIE' | 'SERIES' })}
                  >
                    <option value="MOVIE">Film</option>
                    <option value="SERIES">Series</option>
                  </select>
                </div>

                <div className="mb-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="mr-2"
                      checked={formData.featured}
                      onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                    />
                    <span className="text-sm font-medium text-gray-700">Tampilkan di Featured</span>
                  </label>
                </div>

                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => {
                      setShowCreateModal(false)
                      resetForm()
                    }}
                  >
                    Batal
                  </button>
                  <button type="submit" className="btn-primary">
                    Simpan
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Movie Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-lg bg-white max-h-[90vh] overflow-y-auto">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Edit Film</h3>
              <form onSubmit={handleUpdateMovie}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Judul Film</label>
                  <input
                    type="text"
                    required
                    className="input-field"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Masukkan judul film"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Deskripsi</label>
                  <textarea
                    required
                    rows={3}
                    className="input-field"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Masukkan deskripsi film"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Genre (pisahkan dengan koma)</label>
                  <input
                    type="text"
                    required
                    className="input-field"
                    value={formData.genre}
                    onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                    placeholder="Action, Drama, Thriller"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tahun</label>
                    <input
                      type="number"
                      required
                      min="1900"
                      max={new Date().getFullYear() + 10}
                      className="input-field"
                      value={formData.year}
                      onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Rating (1-5)</label>
                    <input
                      type="number"
                      required
                      min="1"
                      max="5"
                      step="0.1"
                      className="input-field"
                      value={formData.rating}
                      onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Durasi</label>
                  <input
                    type="text"
                    required
                    className="input-field"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    placeholder="120 min atau 10 episodes"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Thumbnail URL</label>
                  <input
                    type="url"
                    className="input-field"
                    value={formData.thumbnail_url}
                    onChange={(e) => setFormData({ ...formData, thumbnail_url: e.target.value })}
                    placeholder="https://example.com/poster.jpg"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Backdrop URL</label>
                  <input
                    type="url"
                    className="input-field"
                    value={formData.backdrop_url}
                    onChange={(e) => setFormData({ ...formData, backdrop_url: e.target.value })}
                    placeholder="https://example.com/backdrop.jpg"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Video URL</label>
                  <input
                    type="url"
                    className="input-field"
                    value={formData.video_url}
                    onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                    placeholder="https://example.com/video.mp4"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">HLS URL (Opsional - Adaptive Streaming)</label>
                  <input
                    type="url"
                    className="input-field"
                    value={formData.hls_url}
                    onChange={(e) => setFormData({ ...formData, hls_url: e.target.value })}
                    placeholder="http://localhost:8080/videos/abc-123/playlist.m3u8"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    💡 Kosongkan jika tidak menggunakan HLS. Player akan prioritaskan HLS jika diisi.
                  </p>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Trailer URL</label>
                  <input
                    type="url"
                    className="input-field"
                    value={formData.trailer_url}
                    onChange={(e) => setFormData({ ...formData, trailer_url: e.target.value })}
                    placeholder="https://example.com/trailer.mp4"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Cast (nama as role, pisahkan dengan koma)</label>
                  <input
                    type="text"
                    className="input-field"
                    value={formData.cast}
                    onChange={(e) => setFormData({ ...formData, cast: e.target.value })}
                    placeholder="John Doe as Actor, Jane Smith as Actress"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tipe</label>
                  <select
                    required
                    className="input-field"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as 'MOVIE' | 'SERIES' })}
                  >
                    <option value="MOVIE">Film</option>
                    <option value="SERIES">Series</option>
                  </select>
                </div>

                <div className="mb-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="mr-2"
                      checked={formData.featured}
                      onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                    />
                    <span className="text-sm font-medium text-gray-700">Tampilkan di Featured</span>
                  </label>
                </div>

                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => {
                      setShowEditModal(false)
                      setSelectedMovie(null)
                      resetForm()
                    }}
                  >
                    Batal
                  </button>
                  <button type="submit" className="btn-primary">
                    Update
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}