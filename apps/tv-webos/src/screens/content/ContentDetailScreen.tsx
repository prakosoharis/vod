/**
 * Content Detail Screen
 * Shows backdrop, description, cast, similar content
 */
import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Focusable } from '@/components/Focusable';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ContentRow } from '@/components/ContentRow';
import { PlayIcon, BackIcon, StarIcon, PlusIcon, CheckIcon } from '@/components/icons';
import { contentService, userService } from '@/services';
import { setFocus } from '@/lib/spatialNavigation';
import { formatRating } from '@/lib/format';
import { COLORS, THEME } from '@/constants';

export function ContentDetailScreen() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: content, isLoading } = useQuery({
    queryKey: ['content', 'detail', id],
    queryFn: () => contentService.getContentById(id!),
    enabled: !!id,
  });

  const { data: similar } = useQuery({
    queryKey: ['content', 'similar', id],
    queryFn: () =>
      content && content.genre && content.genre.length > 0
        ? contentService.getSimilarContent(content.genre, content.id)
        : Promise.resolve([]),
    enabled: !!content,
  });

  const { data: myList } = useQuery({
    queryKey: ['user', 'my-list'],
    queryFn: () => userService.getWatchlist(),
  });

  const isInMyList = myList?.some((c) => c.id === id);

  useEffect(() => {
    if (content) {
      setTimeout(() => setFocus('detail-play'), 200);
    }
  }, [content]);

  if (isLoading || !content) {
    return <LoadingSpinner label="Memuat detail..." />;
  }

  const handlePlay = () => {
    // Just play directly — backend gates access at HLS level.
    // If access denied, TVVideoPlayer will call onAccessDenied and show paywall.
    navigate(`/player/${id}`);
  };

  const handleToggleMyList = async () => {
    if (isInMyList) {
      await userService.removeFromWatchlist(id!);
    } else {
      await userService.addToWatchlist(id!);
    }
  };

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
          right: 0,
          bottom: 0,
          left: 0,
        background: COLORS.warmCharcoal[100],
        overflowY: 'auto',
      }}
    >
      {/* Hero backdrop */}
      <div
        style={{
          position: 'relative',
          height: 720,
          width: '100%',
          overflow: 'hidden',
        }}
      >
        {content.backdrop_url && (
          <img
            src={content.backdrop_url}
            alt={content.title}
            style={{
              position: 'absolute',
              top: 0,
          right: 0,
          bottom: 0,
          left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        )}

        {/* Gradient overlay */}
        <div
          style={{
            position: 'absolute',
            top: 0,
          right: 0,
          bottom: 0,
          left: 0,
            background: `
              linear-gradient(to top, ${COLORS.warmCharcoal[100]} 0%, transparent 60%),
              linear-gradient(to right, ${COLORS.warmCharcoal[100]} 0%, transparent 70%)
            `,
          }}
        />

        {/* Back button */}
        <div style={{ position: 'absolute', top: 32, left: 32 }}>
          <Focusable focusKey="detail-back" onEnter={() => navigate(-1)} focusScale={1.1}>
            <button
              style={{
                background: 'rgba(0,0,0,0.6)',
                border: 'none',
                borderRadius: '50%',
                width: 64,
                height: 64,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <BackIcon size={32} color={COLORS.cream[50]} />
            </button>
          </Focusable>
        </div>

        {/* Content info */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            padding: `0 ${THEME.spacing.xxxl}px ${THEME.spacing.xxl}px`,
            maxWidth: 1100,
          }}
        >
          {content.type && (
            <div
              style={{
                display: 'inline-block',
                background: COLORS.accent[500] + '30',
                color: COLORS.accent[400],
                padding: '6px 16px',
                borderRadius: 4,
                fontSize: 14,
                fontWeight: 'bold',
                letterSpacing: 1,
                marginBottom: 16,
              }}
            >
              {content.type === 'MOVIE' ? 'FILM' : 'SERIES'}
            </div>
          )}

          <h1
            style={{
              color: COLORS.cream[50],
              fontSize: 80,
              fontWeight: THEME.typography.fontWeight.bold,
              margin: 0,
              marginBottom: 16,
              lineHeight: 1.1,
              textShadow: '0 4px 32px rgba(0,0,0,0.8)',
            }}
          >
            {content.title}
          </h1>

          <div
            style={{
              display: 'flex',
              gap: 20,
              alignItems: 'center',
              marginBottom: 16,
              color: COLORS.cream[100],
              fontSize: 22,
              flexWrap: 'wrap',
            }}
          >
            {(() => {
              const rating = formatRating(content.rating);
              return rating ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <StarIcon size={22} />
                  {rating}
                </span>
              ) : null;
            })()}
            {content.year && <span>{content.year}</span>}
            {content.duration && <span>{content.duration}</span>}
            {content.genre?.map((g) => (
              <span
                key={g}
                style={{
                  background: COLORS.warmCharcoal[200] + '80',
                  padding: '4px 12px',
                  borderRadius: 4,
                  fontSize: 16,
                }}
              >
                {g}
              </span>
            ))}
          </div>

          {content.description && (
            <p
              style={{
                color: COLORS.cream[100],
                fontSize: 24,
                lineHeight: 1.6,
                margin: 0,
                marginBottom: 28,
                maxWidth: 900,
              }}
            >
              {content.description}
            </p>
          )}

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            <Focusable focusKey="detail-play" onEnter={handlePlay} focusScale={1.05}>
              <button
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '20px 48px',
                  background: COLORS.accent[500],
                  color: '#fff',
                  border: 'none',
                  borderRadius: 12,
                  fontSize: 28,
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                }}
              >
                <PlayIcon size={32} color="#fff" />
                Putar
              </button>
            </Focusable>

            <Focusable focusKey="detail-mylist" onEnter={handleToggleMyList} focusScale={1.05}>
              <button
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '20px 32px',
                  background: 'rgba(255,255,255,0.15)',
                  color: COLORS.cream[50],
                  border: `2px solid ${COLORS.cream[100]}`,
                  borderRadius: 12,
                  fontSize: 24,
                  fontWeight: '600',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                }}
              >
                {isInMyList ? <CheckIcon size={28} color={COLORS.cream[50]} /> : <PlusIcon size={28} color={COLORS.cream[50]} />}
                {isInMyList ? 'Di Daftar Saya' : 'Tambah ke Daftar'}
              </button>
            </Focusable>
          </div>
        </div>
      </div>

      {/* Cast & Details */}
      <div
        style={{
          padding: `${THEME.spacing.xl}px ${THEME.spacing.xxxl}px ${THEME.spacing.xxxl}px`,
        }}
      >
        {content.cast && content.cast.length > 0 && (
          <div style={{ marginBottom: THEME.spacing.xxl }}>
            <h2
              style={{
                color: COLORS.cream[50],
                fontSize: THEME.typography.fontSize.xxl,
                fontWeight: 'bold',
                margin: 0,
                marginBottom: 20,
              }}
            >
              Pemeran
            </h2>
            <div style={{ display: 'flex', gap: THEME.spacing.lg, flexWrap: 'wrap' }}>
              {content.cast.map((c, idx) => (
                <div
                  key={idx}
                  style={{
                    background: COLORS.warmCharcoal[200],
                    padding: '16px 24px',
                    borderRadius: 12,
                    minWidth: 240,
                  }}
                >
                  <div style={{ color: COLORS.cream[50], fontSize: 20, fontWeight: 'bold' }}>
                    {c.name}
                  </div>
                  <div style={{ color: COLORS.cream[200], fontSize: 16, marginTop: 4 }}>
                    {c.role}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Similar content */}
        {similar && similar.length > 0 && (
          <ContentRow
            title="Konten Serupa"
            contents={similar}
            focusPrefix="detail-similar"
            onSelect={(c) => navigate(`/content/${c.id}`)}
            rowIndex={0}
            variant="poster"
          />
        )}
      </div>
    </div>
  );
}

export default ContentDetailScreen;
