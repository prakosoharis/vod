import { useState, useEffect } from 'react'
import { UserGroupIcon, FilmIcon, PlayIcon } from '@heroicons/react/24/outline'
import { usersApi, moviesApi } from '../services/api'
import { User, Movie } from '../types'

interface StatCard {
  title: string
  value: number
  icon: React.ElementType
  color: string
}

export default function Dashboard() {
  const [users, setUsers] = useState<User[]>([])
  const [movies, setMovies] = useState<Movie[]>([])
  const [loading, setLoading] = useState(true)

  console.log('Dashboard component - Rendering with loading:', loading)

  useEffect(() => {
    console.log('Dashboard component - useEffect called')
    const fetchData = async () => {
      try {
        const [usersData, moviesData] = await Promise.all([
          usersApi.getAll(),
          moviesApi.getAll({ type: 'MOVIE' })
        ])
        setUsers(usersData)
        setMovies(moviesData.data || [])
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const stats: StatCard[] = [
    {
      title: 'Total User MOST',
      value: users.length,
      icon: UserGroupIcon,
      color: 'bg-blue-500',
    },
    {
      title: 'Total Konten Film',
      value: movies.length,
      icon: FilmIcon,
      color: 'bg-green-500',
    },
    {
      title: 'Film Featured',
      value: movies.filter(movie => movie.featured).length,
      icon: PlayIcon,
      color: 'bg-yellow-500',
    },
  ]

  const recentUsers = users.slice(0, 5)
  const recentMovies = movies.slice(0, 5)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-sm text-gray-600">
          Selamat datang di dashboard VOD Backoffice
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <div key={stat.title} className="card">
            <div className="flex items-center">
              <div className={`${stat.color} flex-shrink-0 rounded-lg p-3`}>
                <stat.icon className="h-6 w-6 text-white" aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">{stat.title}</dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">{stat.value}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Recent Users */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">User Terbaru</h3>
          <div className="overflow-hidden">
            <ul className="divide-y divide-gray-200">
              {recentUsers.length > 0 ? (
                recentUsers.map((user) => (
                  <li key={user.id} className="py-3">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {user.full_name}
                        </p>
                        <p className="text-sm text-gray-500 truncate">
                          {user.email}
                        </p>
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(user.created_at).toLocaleDateString('id-ID')}
                      </div>
                    </div>
                  </li>
                ))
              ) : (
                <li className="py-3 text-sm text-gray-500">Belum ada user terdaftar</li>
              )}
            </ul>
          </div>
        </div>

        {/* Recent Movies */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Film Terbaru</h3>
          <div className="overflow-hidden">
            <ul className="divide-y divide-gray-200">
              {recentMovies.length > 0 ? (
                recentMovies.map((movie) => (
                  <li key={movie.id} className="py-3">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {movie.title}
                        </p>
                        <p className="text-sm text-gray-500 truncate">
                          {movie.duration}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        {movie.featured && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            Featured
                          </span>
                        )}
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {movie.type}
                        </span>
                      </div>
                    </div>
                  </li>
                ))
              ) : (
                <li className="py-3 text-sm text-gray-500">Belum ada film tersedia</li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}