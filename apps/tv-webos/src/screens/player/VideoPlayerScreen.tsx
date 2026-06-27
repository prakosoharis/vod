/**
 * Video Player Screen - wraps TVVideoPlayer with content loading + watch progress
 *
 * Same flow as mobile app: just play the video directly.
 * Backend gates access at the HLS level (returns 403 if no access).
 * If HLS fails with access error, TVVideoPlayer will call onAccessDenied.
 */
import { useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { TVVideoPlayer } from '@/components/video/TVVideoPlayer';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { SubscriptionGate } from '@/components/SubscriptionGate';
import { contentService, userService } from '@/services';
import { COLORS } from '@/constants';

export function VideoPlayerScreen() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [initialPosition, setInitialPosition] = useState(0);
  const [showPaygate, setShowPaygate] = useState(false);
  const lastSyncRef = useRef(0);

  // Fetch content
  const { data: content, isLoading } = useQuery({
    queryKey: ['content', 'play', id],
    queryFn: () => contentService.getContentById(id!),
    enabled: !!id,
  });

  // Get watch progress for resume
  useQuery({
    queryKey: ['watch-progress', id],
    queryFn: () => userService.getWatchProgress(id!),
    enabled: !!id,
    onSuccess: (data) => {
      if (data?.progress_seconds) {
        setInitialPosition(data.progress_seconds);
        lastSyncRef.current = data.progress_seconds;
      }
    },
  });

  // If HLS playback fails due to access denied, show paywall
  if (showPaygate) {
    return (
      <SubscriptionGate
        contentTitle={content?.title}
        mode="play"
        onSuccess={() => {
          setShowPaygate(false);
          // Force reload to retry playback
          navigate(`/player/${id}`, { replace: true });
        }}
        onBack={() => navigate(-1)}
      />
    );
  }

  if (isLoading || !content) {
    return <LoadingSpinner label="Memuat video..." />;
  }

  // Determine video URL (prioritize HLS)
  const videoUrl = content.hls_cdn_url || content.hls_url || content.video_url;

  if (!videoUrl) {
    return (
      <div
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
          background: COLORS.warmCharcoal[100],
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 64,
        }}
      >
        <h1 style={{ color: COLORS.error, fontSize: 40, marginBottom: 16 }}>
          Video tidak tersedia
        </h1>
        <p style={{ color: COLORS.cream[100], fontSize: 24, marginBottom: 32, textAlign: 'center' }}>
          URL video tidak ditemukan untuk "{content.title}"
        </p>
        <button
          onClick={() => navigate(-1)}
          style={{
            padding: '16px 32px',
            background: COLORS.accent[500],
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            fontSize: 22,
            fontWeight: 'bold',
            cursor: 'pointer',
          }}
        >
          Kembali
        </button>
      </div>
    );
  }

  const handleProgress = (current: number, _total: number) => {
    if (Math.abs(current - lastSyncRef.current) > 30) {
      lastSyncRef.current = current;
      userService.updateWatchProgress(id!, Math.floor(current)).catch((e) =>
        console.warn('Failed to sync progress:', e)
      );
    }
  };

  const handleEnded = () => {
    userService.updateWatchProgress(id!, 0).catch(() => {});
    navigate(-1);
  };

  return (
    <TVVideoPlayer
      source={videoUrl}
      title={content.title}
      initialPosition={initialPosition}
      onBack={() => navigate(-1)}
      onProgress={handleProgress}
      onEnded={handleEnded}
      onAccessDenied={() => setShowPaygate(true)}
    />
  );
}

export default VideoPlayerScreen;
