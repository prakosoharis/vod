import { useQuery } from '@tanstack/react-query'
import { userService } from '@/services/auth.service'
import { ContentCard } from '@/components/home/ContentCard'
import Layout from '@/components/layout/Layout'

const MyListPage = () => {
  const { data: watchlist, isLoading, error } = useQuery({
    queryKey: ['watchlist'],
    queryFn: () => userService.getWatchlist()
  })

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen bg-black flex items-center justify-center">
          <div className="text-white">Loading...</div>
        </div>
      </Layout>
    )
  }

  if (error) {
    return (
      <Layout>
        <div className="min-h-screen bg-black flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white mb-4">Error</h1>
            <p className="text-gray-400">Gagal memuat daftar Anda. Silakan coba lagi.</p>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="min-h-screen bg-black pt-24 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-bold mb-8 text-white">Daftar Saya</h1>

          {!watchlist || watchlist.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-400 text-xl mb-4">
                Daftar Anda masih kosong
              </p>
              <p className="text-gray-500 mb-6">
                Tambahkan film dan series favorit Anda ke daftar
              </p>
              <a
                href="/browse"
                className="inline-block px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                onClick={(e) => {
                  e.preventDefault()
                  window.location.href = '/browse'
                }}
              >
                Jelajahi Konten
              </a>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {watchlist.map((item: any) => (
                <ContentCard key={item.content_id || item.id} content={item} />
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}

export default MyListPage