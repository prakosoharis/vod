import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import ContentRow from '@/components/home/ContentRow';
import FeaturedCarousel from '@/components/home/FeaturedCarousel';
import ContentDetailModal from '@/components/content/ContentDetailModal';
import { contentService } from '@/services/content.service';
import useLiveStream from '@/hooks/useLiveStream';
import { Radio, Play } from 'lucide-react';
import type { Content } from '@/types';

// Simple Loading
const LoadingSkeleton = () => (
  <div className="bg-warm-charcoal-100 min-h-screen">
    <div className="h-[40vh] w-full bg-warm-charcoal-50 animate-pulse" />
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

  // LATEST RELEASES - Rilis Terbaru
  const { data: latestReleases, isLoading: loadingLatest } = useQuery<Content[]>({
    queryKey: ['latest-releases'],
    queryFn: async () => {
      const response = await contentService.getAllContent({ limit: 20 })
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
  if (loadingFeatured || loadingMovies || loadingSeries || loadingLatest) {
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

      {/* Rilis Terbaru - Mobile Priority Section */}
      {latestReleases && latestReleases.length > 0 && (
        <div className="pt-8 md:pt-16">
          <ContentRow
            title="Rilis Terbaru"
            contents={latestReleases}
            onInfoClick={openModal}
          />
        </div>
      )}

      {/* Live Streaming Banner - Only show when live */}
      {streamStatus.isLive && (
        <div className="px-6 md:px-12 pt-12 md:pt-24">
          <button
            onClick={() => navigate('/live')}
            className="w-full bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-600 hover:to-accent-700 rounded-2xl p-6 md:p-8 transition-all duration-300 transform hover:scale-[1.02] cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Radio className="w-6 h-6 md:w-8 md:h-8 text-cream-50 animate-pulse" />
                <div className="text-left">
                  <h2 className="text-xl md:text-2xl font-bold text-cream-50 mb-1">Live Sekarang</h2>
                  <p className="text-cream-100 text-xs md:text-sm">Streaming sedang berlangsung - Klik untuk menonton</p>
                </div>
              </div>
              <div className="bg-cream-50 text-primary-500 px-4 py-1.5 md:px-6 md:py-2 rounded-full font-bold text-sm md:text-base">
                TONTON
              </div>
            </div>
          </button>
        </div>
      )}

      {/* TONIGHT'S PICK - Signature Hero Card */}
      {!streamStatus.isLive && movies && movies.length > 0 && (
        <div className="pt-16 px-6 md:px-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1.5 h-8 bg-accent-500 rounded-full"></div>
            <h2 className="text-3xl font-bold text-cream-50">Tontonan Malam Ini</h2>
          </div>

          <Link to={`/watch/${movies[0].id}`}>
            <div className="group relative bg-gradient-to-r from-warm-charcoal-50 to-warm-charcoal-100 rounded-2xl md:rounded-3xl overflow-hidden hover:shadow-2xl hover:shadow-accent-500/40 transition-all duration-500 border md:border-2 border-accent-500/30 shadow-lg shadow-accent-500/10">
              <div className="flex flex-col md:flex-row gap-4 md:gap-8 p-4 md:p-8">
                {/* Poster */}
                <div className="flex-shrink-0 w-32 md:w-64 mx-auto md:mx-0">
                  <img
                    src={movies[0].thumbnail_url}
                    alt={movies[0].title}
                    className="w-full aspect-[2/3] object-cover rounded-xl md:rounded-2xl shadow-2xl shadow-accent-500/30 group-hover:scale-105 transition-transform duration-500"
                  />
                </div>

                {/* Info */}
                <div className="flex-1 flex flex-col justify-center space-y-3 md:space-y-5 text-center md:text-left">
                  <div className="inline-block self-center md:self-start px-4 py-1.5 md:px-5 md:py-2 bg-accent-500/30 backdrop-blur-md rounded-full border md:border-2 border-accent-400/60 shadow-lg shadow-accent-500/40">
                    <span className="text-xs md:text-sm font-bold text-accent-300 drop-shadow-lg">Pilihan Spesial Hari Ini</span>
                  </div>

                  <h3 className="text-2xl md:text-4xl font-bold text-cream-50 leading-tight">
                    {movies[0].title}
                  </h3>

                  <p className="hidden md:block text-lg text-cream-100 leading-relaxed line-clamp-3">
                    {movies[0].description}
                  </p>

                  <div className="flex items-center justify-center md:justify-start gap-2 md:gap-4 text-xs md:text-base text-cream-200">
                    <span>{movies[0].year}</span>
                    <span>•</span>
                    <span>{movies[0].duration}</span>
                    {movies[0].genre && movies[0].genre.length > 0 && (
                      <>
                        <span>•</span>
                        <span>{movies[0].genre[0]}</span>
                      </>
                    )}
                  </div>

                  <button className="self-center md:self-start group/btn flex items-center gap-2 md:gap-3 px-6 py-2.5 md:px-10 md:py-4 bg-gradient-to-r from-accent-500 to-accent-600 text-cream-50 font-semibold text-sm md:text-lg rounded-full hover:from-accent-600 hover:to-accent-700 transition-all duration-300 shadow-lg shadow-accent-500/30 hover:shadow-2xl hover:shadow-accent-500/50">
                    <Play className="h-4 w-4 md:h-6 md:w-6 group-hover/btn:scale-110 transition-transform" fill="currentColor" />
                    <span>Mulai Nonton</span>
                  </button>
                </div>
              </div>
            </div>
          </Link>
        </div>
      )}

      {/* VOD Content - Film & Serial */}
      <div className="pt-16 space-y-12">

        {/* Film - Personal & Curated */}
        {movies && movies.length > 1 && (
          <ContentRow
            title="Film Lainnya"
            contents={movies.slice(1)}
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
