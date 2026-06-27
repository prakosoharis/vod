/**
 * ContentRow - horizontally scrollable list of content cards
 * TV-friendly: each card is focusable, D-pad left/right moves between cards
 */
import { useEffect, useRef, useState } from 'react';
import { ContentCard } from './ContentCard';
import { Content } from '@/types';
import { COLORS, THEME } from '@/constants';
import { ChevronLeftIcon, ChevronRightIcon } from './icons';

interface ContentRowProps {
  title: string;
  contents: Content[];
  focusPrefix: string; // unique prefix for focus keys
  onSelect: (content: Content) => void;
  rowIndex: number;
  variant?: 'poster' | 'landscape';
  size?: 'sm' | 'md' | 'lg';
  emptyText?: string;
  progressMap?: Record<string, number>; // contentId → progress percentage
}

export function ContentRow({
  title,
  contents,
  focusPrefix,
  onSelect,
  rowIndex,
  variant = 'poster',
  size = 'md',
  emptyText = 'No content available',
  progressMap,
}: ContentRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const updateScrollState = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 10);
  };

  useEffect(() => {
    updateScrollState();
  }, [contents]);

  if (!contents || contents.length === 0) {
    return null;
  }

  return (
    <section
      style={{
        marginBottom: THEME.spacing.xxl,
      }}
    >
      <h2
        style={{
          color: COLORS.cream[50],
          fontSize: THEME.typography.fontSize.xl,
          fontWeight: THEME.typography.fontWeight.bold,
          margin: 0,
          marginBottom: THEME.spacing.md,
          padding: `0 ${THEME.spacing.xxxl}px`,
        }}
      >
        {title}
      </h2>

      <div
        style={{
          position: 'relative',
        }}
      >
        {/* Scroll left indicator */}
        {canScrollLeft && (
          <div
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              bottom: 0,
              width: 80,
              background: `linear-gradient(to right, ${COLORS.warmCharcoal[100]}, transparent)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              pointerEvents: 'none',
              zIndex: 5,
            }}
          >
            <ChevronLeftIcon size={40} color={COLORS.cream[200]} />
          </div>
        )}

        <div
          ref={scrollRef}
          onScroll={updateScrollState}
          style={{
            display: 'flex',
            gap: THEME.spacing.md,
            overflowX: 'auto',
            overflowY: 'hidden',
            scrollBehavior: 'smooth',
            padding: `${THEME.spacing.sm}px ${THEME.spacing.xxxl}px`,
            paddingBottom: THEME.spacing.lg,
            scrollbarWidth: 'none',
          }}
        >
          {contents.map((content, idx) => (
            <div
              key={content.id}
              style={{
                flexShrink: 0,
              }}
            >
              <ContentCard
                content={content}
                focusKey={`${focusPrefix}-${content.id}`}
                onSelect={onSelect}
                row={rowIndex}
                col={idx}
                variant={variant}
                size={size}
                progress={progressMap?.[content.id]}
              />
            </div>
          ))}
        </div>

        {/* Scroll right indicator */}
        {canScrollRight && (
          <div
            style={{
              position: 'absolute',
              right: 0,
              top: 0,
              bottom: 0,
              width: 80,
              background: `linear-gradient(to left, ${COLORS.warmCharcoal[100]}, transparent)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              pointerEvents: 'none',
              zIndex: 5,
            }}
          >
            <ChevronRightIcon size={40} color={COLORS.cream[200]} />
          </div>
        )}
      </div>
    </section>
  );
}

export default ContentRow;
