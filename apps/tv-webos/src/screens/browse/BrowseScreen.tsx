/**
 * Browse Screen - grid of all content with category filter
 */
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Sidebar } from '@/components/Sidebar';
import { ContentCard } from '@/components/ContentCard';
import { Focusable } from '@/components/Focusable';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { contentService } from '@/services';
import { setFocus } from '@/lib/spatialNavigation';
import { Content } from '@/types';
import { COLORS, THEME } from '@/constants';

const CATEGORIES = ['Semua', 'Action', 'Drama', 'Indonesian', 'Comedy', 'Horror', 'Romance'];

export function BrowseScreen() {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [searchQuery, setSearchQuery] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['content', 'browse', selectedCategory, searchQuery],
    queryFn: () =>
      contentService.getAllContent({
        genre: selectedCategory !== 'Semua' ? selectedCategory : undefined,
        search: searchQuery || undefined,
        limit: 60,
      }),
  });

  useEffect(() => {
    setTimeout(() => setFocus('browse-cat-Semua'), 200);
  }, []);

  const handleSelectContent = (content: Content) => {
    navigate(`/content/${content.id}`);
  };

  return (
    <div style={{ position: 'absolute', top: 0,
          right: 0,
          bottom: 0,
          left: 0, background: COLORS.warmCharcoal[100] }}>
      <Sidebar activeKey="browse" />

      <div
        style={{
          position: 'absolute',
          left: 320,
          top: 0,
          right: 0,
          bottom: 0,
          overflowY: 'auto',
          padding: `${THEME.spacing.xxl}px ${THEME.spacing.xxxl}px`,
        }}
      >
        <h1
          style={{
            color: COLORS.cream[50],
            fontSize: THEME.typography.fontSize.xxxl,
            fontWeight: THEME.typography.fontWeight.bold,
            margin: 0,
            marginBottom: THEME.spacing.xl,
          }}
        >
          Jelajahi Konten
        </h1>

        {/* Search bar */}
        <div style={{ marginBottom: THEME.spacing.xl }}>
          <Focusable focusKey="browse-search" focusScale={1.0} focusGlow={false}>
            <input
              type="text"
              placeholder="Cari film atau series..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '20px 24px',
                fontSize: 24,
                background: COLORS.warmCharcoal[200],
                border: `2px solid ${COLORS.warmCharcoal[50]}`,
                borderRadius: 12,
                color: COLORS.cream[50],
                fontFamily: 'inherit',
              }}
            />
          </Focusable>
        </div>

        {/* Categories */}
        <div
          style={{
            display: 'flex',
            gap: 12,
            marginBottom: THEME.spacing.xxl,
            flexWrap: 'wrap',
          }}
        >
          {CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <Focusable
                key={cat}
                focusKey={`browse-cat-${cat}`}
                onEnter={() => setSelectedCategory(cat)}
                focusScale={1.05}
              >
                <button
                  style={{
                    padding: '12px 28px',
                    background: isActive ? COLORS.accent[500] : COLORS.warmCharcoal[200],
                    color: isActive ? '#fff' : COLORS.cream[100],
                    border: `2px solid ${isActive ? COLORS.accent[500] : COLORS.warmCharcoal[50]}`,
                    borderRadius: 999,
                    fontSize: 22,
                    fontWeight: isActive ? 'bold' : '500',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                  }}
                >
                  {cat}
                </button>
              </Focusable>
            );
          })}
        </div>

        {/* Grid */}
        {isLoading ? (
          <LoadingSpinner label="Memuat konten..." fullScreen={false} />
        ) : data?.data && data.data.length > 0 ? (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
              gap: `${THEME.spacing.md}px`,
            }}
          >
            {data.data.map((content, idx) => (
              <ContentCard
                key={content.id}
                content={content}
                focusKey={`browse-item-${content.id}`}
                onSelect={handleSelectContent}
                row={Math.floor(idx / 5) + 100}
                col={idx % 5}
                variant="poster"
                size="sm"
              />
            ))}
          </div>
        ) : (
          <div
            style={{
              padding: THEME.spacing.xxxl,
              textAlign: 'center',
              color: COLORS.cream[200],
              fontSize: 24,
            }}
          >
            Tidak ada konten yang ditemukan
          </div>
        )}
      </div>
    </div>
  );
}

export default BrowseScreen;
