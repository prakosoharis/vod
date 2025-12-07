import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import ContentRow from '@/components/home/ContentRow';
import FeaturedCarousel from '@/components/home/FeaturedCarousel';
import ContentDetailModal from '@/components/content/ContentDetailModal';
import { contentService } from '@/services/content.service';
import useLiveStream from '@/hooks/useLiveStream';
import { Radio } from 'lucide-react';
import type { Content } from '@/types';

// Simple Loading
const LoadingSkeleton = () => (
  <div className="bg-warm-charcoal-100 min-h-screen">
    <div className="h-[45vh] w-full bg-warm-charcoal-50 animate-pulse" />
    <div className="py-12 px-12 space-y-12">
      {[1, 2].map((i) => (
        <div key={i} className="space-y-6">
          <div className="h-8 w-48 bg-warm-charcoal-50 rounded animate-pulse" />
          <div className="h-48 w-full bg-warm-charcoal-50 rounded-2xl animate-pulse" />
        </div>
      ))}
    </div>
  </div>
)

export const LandingPage: React.FC = () => {
  const navigate = useNavigate()
  const {} = useAuthStore()
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedContent, setSelectedContent] = useState<Content | null>(null)

  // Live streaming check
  const HLS_URL = (streamKey: string) => `https://live.mostara.id/hls/${streamKey}/index.m3u8`
  const { streamStatus, checkStreamStatus } = useLiveStream({
    hlsUrl: HLS_URL,
    checkInterval: 30000
  })

  useEffect(() => {
    checkStreamStatus('deluwang-live')
    const interval = setInterval(() => {
      checkStreamStatus('deluwang-live')
    }, 30000)
    return () => clearInterval(interval)
  }, [checkStreamStatus])

  // SIMPLE: Load everything at once - NO staggered delays!
  const { data: featured, isLoading: loadingFeatured } = useQuery<Content[]>({
    queryKey: ['featured'],
    queryFn: () => contentService.getFeaturedContent(),
  })

  // VOD CONTENT - Film & Serial only
  const { data: movies, isLoading: loadingMovies } = useQuery<Content[]>({
    queryKey: ['movies'],
    queryFn: async () => {
      const response = await contentService.getAllContent({ type: 'MOVIE', limit: 20 })
      return response.data
    },
  })

  const { data: series, isLoading: loadingSeries } = useQuery<Content[]>({
    queryKey: ['series'],
    queryFn: async () => {
      const response = await contentService.getAllContent({ type: 'SERIES', limit: 20 })
      return response.data
    },
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

  // Simple loading
  if (loadingFeatured || loadingMovies || loadingSeries) {
    return <LoadingSkeleton />
  }

  return (
    <div className="bg-warm-charcoal-100 min-h-screen">
      {/* Hero - Simple, Clean */}
      {featured && featured.length > 0 && (
        <FeaturedCarousel
          contents={featured}
          onInfoClick={openModal}
          autoPlayInterval={5000}
        />
      )}

      {/* Live Streaming Banner - Only show when live */}
      {streamStatus.isLive && (
        <div className="px-12 pt-24">
          <button
            onClick={() => navigate('/live')}
            className="w-full bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-600 hover:to-accent-700 rounded-2xl p-8 transition-all duration-300 transform hover:scale-[1.02] cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Radio className="w-8 h-8 text-cream-50 animate-pulse" />
                <div className="text-left">
                  <h2 className="text-2xl font-bold text-cream-50 mb-1">Live Sekarang</h2>
                  <p className="text-cream-100 text-sm">Streaming sedang berlangsung - Klik untuk menonton</p>
                </div>
              </div>
              <div className="bg-cream-50 text-primary-500 px-6 py-2 rounded-full font-bold">
                TONTON
              </div>
            </div>
          </button>
        </div>
      )}

      {/* VOD Content ONLY - Film & Serial */}
      <div className={streamStatus.isLive ? "pt-12 space-y-12" : "pt-16 space-y-12"}>

        {/* Film - Personal & Curated */}
        {movies && movies.length > 0 && (
          <ContentRow
            title="Film Pilihan Malam Ini"
            contents={movies}
            onInfoClick={openModal}
          />
        )}

        {/* Serial - Engaging & Fun */}
        {series && series.length > 0 && (
          <ContentRow
            title="Serial yang Bikin Ketagihan"
            contents={series}
            onInfoClick={openModal}
          />
        )}

      </div>

      {/* Modal */}
      <ContentDetailModal
        content={selectedContent}
        isOpen={modalOpen}
        onClose={closeModal}
        similarContent={[]}
        onContentChange={() => {}}
      />
    </div>
  )
};

export default LandingPage;
