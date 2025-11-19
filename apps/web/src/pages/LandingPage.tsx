import React, { useMemo, useState, useEffect } from 'react';
import { Lock, Play } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/authStore';
import ContentRow from '@/components/home/ContentRow';
import FeaturedCarousel from '@/components/home/FeaturedCarousel';
import ContentDetailModal from '@/components/content/ContentDetailModal';
import { AuthModal } from '@/components/auth/AuthModal';
import { contentService } from '@/services/content.service';
import type { Content } from '@/types';

// Custom ContentCard with login protection
const ProtectedContentCard = ({ content, onInfoClick }: { content: Content; onInfoClick?: (content: Content) => void }) => {
  const [isHovered, setIsHovered] = useState(false)
  const { isAuthenticated } = useAuthStore()
  const [showAuthModal, setShowAuthModal] = useState(false)

  const handlePlayClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!isAuthenticated) {
      setShowAuthModal(true)
    } else {
      // Navigate to watch page
      window.location.href = `/watch/${content.id}`
    }
  }

  return (
    <>
      <div
        className="relative min-w-[250px] h-[140px] cursor-pointer transition-transform duration-300 hover:scale-105"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Thumbnail */}
        <img
          src={content.thumbnail_url}
          alt={content.title}
          className="w-full h-full object-cover rounded"
        />

        {/* Lock overlay for non-authenticated users */}
        {!isAuthenticated && (
          <div className="absolute inset-0 bg-black/60 rounded flex items-center justify-center">
            <Lock className="w-8 h-8 text-gray-300" />
          </div>
        )}

        {/* Hover Overlay */}
        {isHovered && (
          <div className="absolute inset-0 bg-black/80 rounded p-4 flex flex-col justify-between">
            {/* Title & Metadata */}
            <div>
              <h3 className="font-bold text-sm mb-1">{content.title}</h3>
              <p className="text-xs text-gray-400">
                {content.year} • {content.genre?.[0] ?? 'General'}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handlePlayClick}
                className={`p-2 rounded-full transition-all duration-200 ${
                  isAuthenticated
                    ? 'bg-white text-black hover:bg-gray-200'
                    : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                }`}
                title={isAuthenticated ? "Putar" : "Login untuk menonton"}
              >
                <Play size={16} fill={isAuthenticated ? "black" : "none"} />
              </button>
              <button
                className="p-2 border border-white rounded-full hover:bg-white/10 transition-colors"
                onClick={(e) => {
                  e.stopPropagation()
                  onInfoClick?.(content)
                }}
                title="Info Lebih Lanjut"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        title="Login untuk Menonton Video"
        subtitle="Nikmati konten eksklusif dengan akun Anda"
      />
    </>
  )
}

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

export const LandingPage: React.FC = () => {
  const {} = useAuthStore()

  // State for staggered loading
  const [loadSecondary, setLoadSecondary] = useState(false)
  const [loadGenre, setLoadGenre] = useState(false)

  // State for modal
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedContent, setSelectedContent] = useState<Content | null>(null)

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

  // Fetch similar content for modal
  const { data: similarContent } = useQuery<Content[]>({
    queryKey: ['similar-content', selectedContent?.genre],
    queryFn: async () => {
      if (!selectedContent?.genre?.[0]) return []
      const response = await contentService.getAllContent({
        genre: selectedContent.genre[0],
        limit: 10
      })
      return response.data.filter(item => item.id !== selectedContent.id)
    },
    enabled: !!selectedContent?.genre?.[0]
  })

  // Modal handlers
  const openModal = (content: Content) => {
    setSelectedContent(content)
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setSelectedContent(null)
  }

  const handleContentChange = (content: Content) => {
    setSelectedContent(content)
  }

  // Only show initial loading for priority 1 content
  const isLoadingInitial = useMemo(
    () => loadingFeatured || loadingTrending,
    [loadingFeatured, loadingTrending]
  )

  if (isLoadingInitial) {
    return <LoadingSkeleton />
  }

  return (
    <div className="bg-black min-h-screen">
      {/* Featured Carousel */}
      {featured && featured.length >= 3 && (
        <FeaturedCarousel
          contents={featured}
          onInfoClick={openModal}
          autoPlayInterval={5000}
        />
      )}

      {/* Negative margin to overlap hero */}
      <div className="relative -mt-22 z-10 space-y-12 pb-20 pt-8">
        {/* 1. Trending Now */}
        {trending && trending.length > 0 && (
          <ContentRow
            title="Trending Sekarang"
            contents={trending}
            onInfoClick={openModal}
            ContentCardComponent={ProtectedContentCard}
          />
        )}

        {/* 2. Made in Indonesia (Priority 2) */}
        {loadSecondary && (
          <>
            {loadingIndonesian ? (
              <div className="px-12">
                <h2 className="text-2xl font-bold mb-4">Buatan Indonesia</h2>
                <div className="h-40 w-full bg-gray-800 rounded animate-pulse" />
              </div>
            ) : indonesian && indonesian.length > 0 ? (
              <ContentRow
                title="Buatan Indonesia"
                contents={indonesian}
                onInfoClick={openModal}
                ContentCardComponent={ProtectedContentCard}
              />
            ) : null}
          </>
        )}

        {/* 3. New Releases (Priority 2) */}
        {loadSecondary && (
          <>
            {loadingNewReleases ? (
              <div className="px-12">
                <h2 className="text-2xl font-bold mb-4">Rilis Terbaru</h2>
                <div className="h-40 w-full bg-gray-800 rounded animate-pulse" />
              </div>
            ) : newReleases && newReleases.length > 0 ? (
              <ContentRow
                title="Rilis Terbaru"
                contents={newReleases}
                onInfoClick={openModal}
                ContentCardComponent={ProtectedContentCard}
              />
            ) : null}
          </>
        )}

        {/* 4. Genre rows (Priority 3) */}
        {loadGenre && (
          <>
            {loadingAction ? (
              <div className="px-12">
                <h2 className="text-2xl font-bold mb-4">Aksi</h2>
                <div className="h-40 w-full bg-gray-800 rounded animate-pulse" />
              </div>
            ) : action && action.length > 0 ? (
              <ContentRow
                title="Aksi"
                contents={action}
                onInfoClick={openModal}
                ContentCardComponent={ProtectedContentCard}
              />
            ) : null}

            {loadingDrama ? (
              <div className="px-12">
                <h2 className="text-2xl font-bold mb-4">Drama</h2>
                <div className="h-40 w-full bg-gray-800 rounded animate-pulse" />
              </div>
            ) : drama && drama.length > 0 ? (
              <ContentRow
                title="Drama"
                contents={drama}
                onInfoClick={openModal}
                ContentCardComponent={ProtectedContentCard}
              />
            ) : null}
          </>
        )}
      </div>

      {/* Content Detail Modal */}
      <ContentDetailModal
        content={selectedContent}
        isOpen={modalOpen}
        onClose={closeModal}
        similarContent={similarContent}
        onContentChange={handleContentChange}
      />
    </div>
  )
};

export default LandingPage;

