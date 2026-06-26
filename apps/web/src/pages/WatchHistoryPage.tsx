import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../stores/authStore';
import { userService } from '../services/user.service';
import { ContentCard } from '../components/content/ContentCard';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import Layout from '../components/layout/Layout';

const WatchHistoryPage = () => {
  const { isAuthenticated } = useAuthStore();

  // Fetch watch history (continue watching data)
  const { data: continueWatching, isLoading, error, refetch } = useQuery({
    queryKey: ['continue-watching'],
    queryFn: () => userService.getContinueWatching(),
    enabled: isAuthenticated,
  });

  useEffect(() => {
    if (isAuthenticated) {
      refetch();
    }
  }, [isAuthenticated, refetch]);

  // Format duration from seconds to readable format
  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}j ${minutes}m ${secs}d`;
    }
    if (minutes > 0) {
      return `${minutes}m ${secs}d`;
    }
    return `${secs}d`;
  };

  // Format date to Indonesian format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInHours < 1) {
      return 'Baru saja';
    } else if (diffInHours < 24) {
      return `${diffInHours} jam yang lalu`;
    } else if (diffInDays === 1) {
      return 'Kemarin';
    } else if (diffInDays < 7) {
      return `${diffInDays} hari yang lalu`;
    } else {
      return date.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
      });
    }
  };

  // Calculate progress percentage
  const getProgressPercentage = (content: any) => {
    if (!content.duration) return 0;
    const durationInSeconds = parseDurationToSeconds(content.duration);
    if (durationInSeconds === 0) return 0;
    return Math.min((content.progress_seconds / durationInSeconds) * 100, 100);
  };

  // Parse duration string like "2h 30m" to seconds
  const parseDurationToSeconds = (duration: string): number => {
    const hoursMatch = duration.match(/(\d+)\s*j/);
    const minutesMatch = duration.match(/(\d+)\s*m/);

    let totalSeconds = 0;
    if (hoursMatch) {
      totalSeconds += parseInt(hoursMatch[1]) * 3600;
    }
    if (minutesMatch) {
      totalSeconds += parseInt(minutesMatch[1]) * 60;
    }
    return totalSeconds || 0;
  };

  if (!isAuthenticated) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-4">Perlu Login</h2>
            <p className="text-gray-400">Silakan login untuk melihat riwayat tontonan Anda</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-black to-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Riwayat Tontonan</h1>
            <p className="text-gray-400">Lanjutkan menonton dari where you left off</p>
          </div>

          {/* Content */}
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <LoadingSpinner />
            </div>
          ) : error ? (
            <div className="text-center py-20">
              <p className="text-red-500 mb-4">Gagal memuat riwayat tontonan</p>
              <button
                onClick={() => refetch()}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                Coba Lagi
              </button>
            </div>
          ) : !continueWatching || continueWatching.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-20 h-20 mx-auto mb-4 bg-gray-800 rounded-full flex items-center justify-center">
                <svg
                  className="w-10 h-10 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Belum ada riwayat</h3>
              <p className="text-gray-400 mb-6">Mulai menonton konten untuk melihat riwayat di sini</p>
              <a
                href="/browse"
                className="inline-block px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-semibold"
              >
                Jelajah Konten
              </a>
            </div>
          ) : (
            <>
              {/* Stats */}
              <div className="mb-8 p-4 bg-gray-800 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Total konten ditonton</p>
                    <p className="text-2xl font-bold text-white">{continueWatching.length}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-400 text-sm">Terakhir dilihat</p>
                    <p className="text-lg font-semibold text-white">
                      {continueWatching.length > 0 &&
                        formatDate(continueWatching[0].last_watched)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Continue Watching Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {continueWatching.map((content) => {
                  const progressPercentage = getProgressPercentage(content);
                  return (
                    <div key={content.id} className="relative group">
                      {/* Progress Bar */}
                      <div className="absolute top-0 left-0 right-0 z-10 bg-gray-800 h-1 rounded-t-lg overflow-hidden">
                        <div
                          className="h-full bg-red-600 transition-all duration-300"
                          style={{ width: `${progressPercentage}%` }}
                        />
                      </div>

                      {/* Content Card */}
                      <ContentCard content={content} />

                      {/* Progress Info */}
                      <div className="mt-2">
                        <div className="flex items-center justify-between text-xs text-gray-400">
                          <span>{formatDuration(content.progress_seconds)}</span>
                          <span>{formatDate(content.last_watched)}</span>
                        </div>
                        <div className="mt-1 h-1 bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-red-600 rounded-full"
                            style={{ width: `${progressPercentage}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default WatchHistoryPage;
