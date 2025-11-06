import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { HeroBanner } from '@/components/home/HeroBanner'
import ContentRow from '@/components/home/ContentRow'
import { contentService } from '@/services/content.service'
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
  // Featured content for the hero banner
  const { data: featured, isLoading: loadingFeatured } = useQuery<Content[]>({
    queryKey: ['featured'],
    queryFn: () => contentService.getFeaturedContent(),
  })

  // Trending content row
  const { data: trending, isLoading: loadingTrending } = useQuery<Content[]>({
    queryKey: ['trending'],
    queryFn: () => contentService.getTrendingContent(),
  })

  // Continue watching based on user progress
  const { data: continueWatching, isLoading: loadingContinue } = useQuery<Content[]>({
    queryKey: ['continue-watching'],
    queryFn: () => contentService.getContinueWatching(),
  })

  // Genre-based content rows (example: Action and Drama)
  const { data: action, isLoading: loadingAction } = useQuery<Content[]>({
    queryKey: ['genre', 'Action'],
    queryFn: () => contentService.getByGenre('Action'),
  })

  const { data: drama, isLoading: loadingDrama } = useQuery<Content[]>({
    queryKey: ['genre', 'Drama'],
    queryFn: () => contentService.getByGenre('Drama'),
  })

  const isLoadingAny = useMemo(
    () => loadingFeatured || loadingTrending || loadingContinue || loadingAction || loadingDrama,
    [loadingFeatured, loadingTrending, loadingContinue, loadingAction, loadingDrama]
  )

  if (isLoadingAny) {
    return <LoadingSkeleton />
  }

  const heroContent = (featured && featured[0]) as Content | undefined

  return (
    <div className="bg-black min-h-screen">
      {heroContent && <HeroBanner content={heroContent} />}

      {/* Negative margin to overlap hero */}
      <div className="relative -mt-32 z-10 pt-24 space-y-12 pb-20">
        {trending && trending.length > 0 && (
          <ContentRow title="Trending Sekarang" contents={trending} />
        )}

        {continueWatching && continueWatching.length > 0 && (
          <ContentRow title="Lanjutkan Menonton" contents={continueWatching} />
        )}

        {action && action.length > 0 && (
          <ContentRow title="Aksi Pilihan" contents={action} />
        )}

        {drama && drama.length > 0 && (
          <ContentRow title="Drama Populer" contents={drama} />
        )}
      </div>
    </div>
  )
}

export default BrowsePage
