import { useMemo, useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { HeroBanner } from '@/components/home/HeroBanner'
import ContentRow from '@/components/home/ContentRow'
import { contentService } from '@/services/content.service'
import { userService } from '@/services/auth.service'
import type { Content } from '@/types'

const LoadingSkeleton = () => {
  return (
    <div className="bg-black min-h-screen">
      <div className="h-[80vh] w-full bg-gray-800 animate-pulse" />
      <div className="-mt-32 relative z-10 space-y-12 pb-20 px-4 sm:px-6 lg:px-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="space-y-4">
            <div className="h-6 w-48 bg-gray-800 rounded animate-pulse" />
            <div className="h-40 w-full bg-gray-800 rounded animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  )
}

const BrowsePage = () => {
  // State for staggered loading
  const [loadSecondary, setLoadSecondary] = useState(false)
  const [loadGenre, setLoadGenre] = useState(false)

  // Load secondary content after 1 second
  useEffect(() => {
    const timer = setTimeout(() => setLoadSecondary(true), 1000)
    return () => clearTimeout(timer)
  }, [])

  // Load genre content after 2 seconds
  useEffect(() => {
    const timer = setTimeout(() => setLoadGenre(true), 2000)
    return () => clearTimeout(timer)
  }, [])

  // Priority 1: Featured content (immediate load)
  const { data: featured, isLoading: loadingFeatured } = useQuery<Content[]>({
    queryKey: ['featured'],
    queryFn: () => contentService.getFeaturedContent(),
  })

  // Priority 1: Continue Watching (immediate load, if logged in)
  const { data: continueWatching, isLoading: loadingContinue } = useQuery<Content[]>({
    queryKey: ['continue-watching'],
    queryFn: () => userService.getContinueWatching(),
    enabled: !!localStorage.getItem('token'), // Only if logged in
  })

  // Priority 1: Trending (immediate load)
  const { data: trending, isLoading: loadingTrending } = useQuery<Content[]>({
    queryKey: ['trending'],
    queryFn: () => contentService.getTrendingContent(),
  })

  // Priority 2: Load after 1 second delay
  const { data: indonesian, isLoading: loadingIndonesian } = useQuery<Content[]>({
    queryKey: ['indonesian'],
    queryFn: async () => {
      const response = await contentService.getAllContent({ genre: 'Indonesian', limit: 20 })
      return response.data
    },
    enabled: loadSecondary,
  })

  const { data: newReleases, isLoading: loadingNewReleases } = useQuery<Content[]>({
    queryKey: ['new-releases'],
    queryFn: async () => {
      const response = await contentService.getAllContent({ limit: 20 })
      return response.data
    },
    enabled: loadSecondary,
  })

  const { data: popularMovies, isLoading: loadingPopularMovies } = useQuery<Content[]>({
    queryKey: ['popular-movies'],
    queryFn: async () => {
      const response = await contentService.getAllContent({ type: 'MOVIE', limit: 20 })
      return response.data
    },
    enabled: loadSecondary,
  })

  // Priority 3: Load after 2 seconds delay
  const { data: action, isLoading: loadingAction } = useQuery<Content[]>({
    queryKey: ['genre', 'Action'],
    queryFn: async () => {
      const response = await contentService.getAllContent({ genre: 'Action', limit: 20 })
      return response.data
    },
    enabled: loadGenre,
  })

  const { data: drama, isLoading: loadingDrama } = useQuery<Content[]>({
    queryKey: ['genre', 'Drama'],
    queryFn: async () => {
      const response = await contentService.getAllContent({ genre: 'Drama', limit: 20 })
      return response.data
    },
    enabled: loadGenre,
  })

  const { data: horror, isLoading: loadingHorror } = useQuery<Content[]>({
    queryKey: ['genre', 'Horror'],
    queryFn: async () => {
      const response = await contentService.getAllContent({ genre: 'Horror', limit: 20 })
      return response.data
    },
    enabled: loadGenre,
  })

  const { data: comedy, isLoading: loadingComedy } = useQuery<Content[]>({
    queryKey: ['genre', 'Comedy'],
    queryFn: async () => {
      const response = await contentService.getAllContent({ genre: 'Comedy', limit: 20 })
      return response.data
    },
    enabled: loadGenre,
  })

  // Only show initial loading for priority 1 content
  const isLoadingInitial = useMemo(
    () => loadingFeatured || loadingTrending || loadingContinue,
    [loadingFeatured, loadingTrending, loadingContinue]
  )

  if (isLoadingInitial) {
    return <LoadingSkeleton />
  }

  const heroContent = (featured && featured[0]) as Content | undefined

  return (
    <div className="bg-black min-h-screen">
      {heroContent && <HeroBanner content={heroContent} />}

      {/* Negative margin to overlap hero */}
      <div className="relative -mt-22 z-10 space-y-12 pb-20 pt-8">
        {/* 1. Continue Watching (conditional) */}
        {continueWatching && continueWatching.length > 0 && (
          <ContentRow title="Lanjutkan Menonton" contents={continueWatching} />
        )}

        {/* 2. Trending Now */}
        {trending && trending.length > 0 && (
          <ContentRow title="Trending Sekarang" contents={trending} />
        )}

        {/* 3. Made in Indonesia (Priority 2) */}
        {loadSecondary && (
          <>
            {loadingIndonesian ? (
              <div className="px-12">
                <h2 className="text-2xl font-bold mb-4">Buatan Indonesia</h2>
                <div className="h-40 w-full bg-gray-800 rounded animate-pulse" />
              </div>
            ) : indonesian && indonesian.length > 0 ? (
              <ContentRow title="Buatan Indonesia" contents={indonesian} />
            ) : null}
          </>
        )}

        {/* 4. New Releases (Priority 2) */}
        {loadSecondary && (
          <>
            {loadingNewReleases ? (
              <div className="px-12">
                <h2 className="text-2xl font-bold mb-4">Rilis Terbaru</h2>
                <div className="h-40 w-full bg-gray-800 rounded animate-pulse" />
              </div>
            ) : newReleases && newReleases.length > 0 ? (
              <ContentRow title="Rilis Terbaru" contents={newReleases} />
            ) : null}
          </>
        )}

        {/* 5. Popular Movies (Priority 2) */}
        {loadSecondary && (
          <>
            {loadingPopularMovies ? (
              <div className="px-12">
                <h2 className="text-2xl font-bold mb-4">Film Populer</h2>
                <div className="h-40 w-full bg-gray-800 rounded animate-pulse" />
              </div>
            ) : popularMovies && popularMovies.length > 0 ? (
              <ContentRow title="Film Populer" contents={popularMovies} />
            ) : null}
          </>
        )}

        {/* 6. Genre rows (Priority 3) */}
        {loadGenre && (
          <>
            {loadingAction ? (
              <div className="px-12">
                <h2 className="text-2xl font-bold mb-4">Aksi</h2>
                <div className="h-40 w-full bg-gray-800 rounded animate-pulse" />
              </div>
            ) : action && action.length > 0 ? (
              <ContentRow title="Aksi" contents={action} />
            ) : null}

            {loadingDrama ? (
              <div className="px-12">
                <h2 className="text-2xl font-bold mb-4">Drama</h2>
                <div className="h-40 w-full bg-gray-800 rounded animate-pulse" />
              </div>
            ) : drama && drama.length > 0 ? (
              <ContentRow title="Drama" contents={drama} />
            ) : null}

            {loadingHorror ? (
              <div className="px-12">
                <h2 className="text-2xl font-bold mb-4">Horror</h2>
                <div className="h-40 w-full bg-gray-800 rounded animate-pulse" />
              </div>
            ) : horror && horror.length > 0 ? (
              <ContentRow title="Horror" contents={horror} />
            ) : null}

            {loadingComedy ? (
              <div className="px-12">
                <h2 className="text-2xl font-bold mb-4">Komedi</h2>
                <div className="h-40 w-full bg-gray-800 rounded animate-pulse" />
              </div>
            ) : comedy && comedy.length > 0 ? (
              <ContentRow title="Komedi" contents={comedy} />
            ) : null}
          </>
        )}
      </div>
    </div>
  )
}

export default BrowsePage
