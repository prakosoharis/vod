/**
 * Home Screen - Featured hero + content rows (Netflix-style)
 */
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Sidebar } from '@/components/Sidebar';
import { ContentRow } from '@/components/ContentRow';
import { Focusable } from '@/components/Focusable';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { PlayIcon, StarIcon, ChevronRightIcon } from '@/components/icons';
import { contentService, userService } from '@/services';
import { setFocus } from '@/lib/spatialNavigation';
import { formatRating } from '@/lib/format';
import { Content } from '@/types';
import { COLORS, THEME } from '@/constants';

export function HomeScreen() {
  const navigate = useNavigate();
  const [featuredIndex] = useState(0);

  // Featured content (hero)
  const { data: featured, isLoading: featuredLoading } = useQuery({
    queryKey: ['content', 'featured'],
    queryFn: () => contentService.getFeaturedContent(),
  });

  const { data: trending } = useQuery({
    queryKey: ['content', 'trending'],
    queryFn: () => contentService.getTrendingContent(),
  });

  const { data: allContent } = useQuery({
    queryKey: ['content', 'all'],
    queryFn: () => contentService.getAllContent({ limit: 30 }),
  });

  const { data: continueWatching } = useQuery({
    queryKey: ['content', 'continue-watching'],
    queryFn: () => userService.getContinueWatching(),
  });

  // Set focus to hero on mount
  useEffect(() => {
    setTimeout(() => setFocus('home-hero-play'), 300);
  }, []);

  const handleSelectContent = (content: Content) => {
    navigate(`/content/${content.id}`);
  };

  if (featuredLoading && !featured) {
    return <LoadingSpinner label="Memuat konten..." />;
  }

  const heroContent = featured && featured.length > 0
    ? featured[featuredIndex % featured.length]
    : allContent?.data?.[0];

  return (
    <div style={{ position: 'absolute', top: 0,
          right: 0,
          bottom: 0,
          left: 0, background: COLORS.warmCharcoal[100] }}>
      <Sidebar activeKey="home" />

      {/* Main content area */}
      <div
        style={{
          position: 'absolute',
          left: 320,
          top: 0,
          right: 0,
          bottom: 0,
          overflowY: 'auto',
          paddingBottom: THEME.spacing.xxxl,
        }}
      >
        {/* Hero Featured */}
        {heroContent && (
          <section
            style={{
              position: 'relative',
              height: 600,
              marginBottom: THEME.spacing.xxl,
              overflow: 'hidden',
            }}
          >
            {/* Backdrop image */}
            {heroContent.backdrop_url && (
              <img
                src={heroContent.backdrop_url}
                alt={heroContent.title}
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
                  linear-gradient(to right, ${COLORS.warmCharcoal[100]} 0%, transparent 70%),
                  linear-gradient(to top, ${COLORS.warmCharcoal[100]} 0%, transparent 50%)
                `,
              }}
            />

            {/* Content */}
            <div
              style={{
                position: 'relative',
                padding: `${THEME.spacing.xxxl}px ${THEME.spacing.xxxl}px`,
                paddingTop: 80,
                maxWidth: 800,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-end',
              }}
            >
              {/* Featured badge */}
              <div
                style={{
                  display: 'inline-block',
                  background: COLORS.accent[500],
                  color: '#fff',
                  padding: '6px 16px',
                  borderRadius: 4,
                  fontSize: 14,
                  fontWeight: 700,
                  letterSpacing: 1,
                  marginBottom: 16,
                  width: 'fit-content',
                }}
              >
                FEATURED
              </div>

              {/* Title */}
              <h1
                style={{
                  color: COLORS.cream[50],
                  fontSize: 72,
                  fontWeight: THEME.typography.fontWeight.bold,
                  margin: 0,
                  marginBottom: 16,
                  lineHeight: 1.1,
                  textShadow: '0 4px 24px rgba(0,0,0,0.6)',
                }}
              >
                {heroContent.title}
              </h1>

              {/* Meta */}
              <div
                style={{
                  display: 'flex',
                  gap: 16,
                  alignItems: 'center',
                  marginBottom: 16,
                  color: COLORS.cream[100],
                  fontSize: 22,
                }}
              >
                {(() => {
                  const rating = formatRating(heroContent.rating);
                  return rating ? (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <StarIcon size={20} />
                      {rating}
                    </span>
                  ) : null;
                })()}
                {heroContent.year && <span>{heroContent.year}</span>}
                {heroContent.duration && <span>{heroContent.duration}</span>}
                {heroContent.genre?.[0] && (
                  <span style={{ color: COLORS.accent[400] }}>
                    {heroContent.genre[0]}
                  </span>
                )}
              </div>

              {/* Description */}
              {heroContent.description && (
                <p
                  className="text-truncate-2"
                  style={{
                    color: COLORS.cream[100],
                    fontSize: 22,
                    lineHeight: 1.5,
                    margin: 0,
                    marginBottom: 32,
                    maxWidth: 700,
                  }}
                >
                  {heroContent.description}
                </p>
              )}

              {/* Action buttons */}
              <div style={{ display: 'flex', gap: 16 }}>
                <Focusable focusKey="home-hero-play" onEnter={() => navigate(`/player/${heroContent.id}`)} focusScale={1.05}>
                  <button
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: '18px 36px',
                      background: COLORS.accent[500],
                      color: '#fff',
                      border: 'none',
                      borderRadius: 12,
                      fontSize: 26,
                      fontWeight: THEME.typography.fontWeight.bold,
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                    }}
                  >
                    <PlayIcon size={28} color="#fff" />
                    Putar Sekarang
                  </button>
                </Focusable>

                <Focusable focusKey="home-hero-detail" onEnter={() => navigate(`/content/${heroContent.id}`)} focusScale={1.05}>
                  <button
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: '18px 36px',
                      background: 'rgba(255,255,255,0.15)',
                      color: COLORS.cream[50],
                      border: `2px solid ${COLORS.cream[100]}`,
                      borderRadius: 12,
                      fontSize: 26,
                      fontWeight: THEME.typography.fontWeight.semibold,
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                      backdropFilter: 'blur(8px)',
                    }}
                  >
                    Detail
                    <ChevronRightIcon size={28} color={COLORS.cream[50]} />
                  </button>
                </Focusable>
              </div>
            </div>
          </section>
        )}

        {/* Continue Watching */}
        {continueWatching && continueWatching.length > 0 && (
          <ContentRow
            title="Lanjut Menonton"
            contents={continueWatching}
            focusPrefix="home-cw"
            onSelect={handleSelectContent}
            rowIndex={0}
            variant="landscape"
            progressMap={continueWatching.reduce((acc: Record<string, number>, c: any) => {
              if (c.progress_seconds && c.duration) {
                acc[c.id] = (c.progress_seconds / 60) / (c.duration ? 1 : 1) * 100;
              }
              return acc;
            }, {})}
          />
        )}

        {/* Trending */}
        {trending && trending.length > 0 && (
          <ContentRow
            title="Trending Sekarang"
            contents={trending}
            focusPrefix="home-trending"
            onSelect={handleSelectContent}
            rowIndex={1}
            variant="poster"
          />
        )}

        {/* Featured */}
        {featured && featured.length > 1 && (
          <ContentRow
            title="Pilihan Untuk Anda"
            contents={featured}
            focusPrefix="home-featured"
            onSelect={handleSelectContent}
            rowIndex={2}
            variant="poster"
          />
        )}

        {/* All Content */}
        {allContent?.data && allContent.data.length > 0 && (
          <ContentRow
            title="Semua Konten"
            contents={allContent.data}
            focusPrefix="home-all"
            onSelect={handleSelectContent}
            rowIndex={3}
            variant="poster"
          />
        )}
      </div>
    </div>
  );
}

export default HomeScreen;
