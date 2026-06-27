/**
 * Content Card - poster + title + meta
 * Used in horizontal rows (Netflix-style)
 */
import { useState } from 'react';
import { Focusable } from './Focusable';
import { PlayIcon, StarIcon } from './icons';
import { Content } from '@/types';
import { COLORS, THEME } from '@/constants';
import { formatRating } from '@/lib/format';

interface ContentCardProps {
  content: Content;
  focusKey: string;
  onSelect: (content: Content) => void;
  row?: number;
  col?: number;
  variant?: 'poster' | 'landscape';
  progress?: number; // 0-100 watch progress bar
  size?: 'sm' | 'md' | 'lg';
}

export function ContentCard({
  content,
  focusKey,
  onSelect,
  row,
  col,
  variant = 'poster',
  progress,
  size = 'md',
}: ContentCardProps) {
  const [imgError, setImgError] = useState(false);

  const dimensions = {
    sm: variant === 'poster'
      ? THEME.dimensions.posterSmall
      : THEME.dimensions.landscapeSmall,
    md: variant === 'poster'
      ? THEME.dimensions.poster
      : THEME.dimensions.landscape,
    lg: variant === 'poster'
      ? THEME.dimensions.posterLarge
      : THEME.dimensions.landscapeLarge,
  };

  const dim = dimensions[size];

  return (
    <Focusable
      focusKey={focusKey}
      onEnter={() => onSelect(content)}
      row={row}
      col={col}
      focusScale={1.08}
    >
      <div
        style={{
          width: dim.width,
          background: COLORS.warmCharcoal[200],
          borderRadius: THEME.borderRadius.lg,
          overflow: 'hidden',
          boxShadow: THEME.shadows.medium,
        }}
      >
        {/* Image / Thumbnail */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: dim.height,
            background: `linear-gradient(135deg, ${COLORS.primary[700]} 0%, ${COLORS.warmCharcoal[300]} 100%)`,
            overflow: 'hidden',
          }}
        >
          {!imgError && (variant === 'poster' ? content.thumbnail_url : content.backdrop_url || content.thumbnail_url) ? (
            <img
              src={variant === 'poster' ? content.thumbnail_url : (content.backdrop_url || content.thumbnail_url) as string}
              alt={content.title}
              onError={() => setImgError(true)}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
              loading="lazy"
            />
          ) : (
            <div
              style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: THEME.spacing.md,
                textAlign: 'center',
                color: COLORS.cream[100],
                fontSize: THEME.typography.fontSize.md,
                fontWeight: THEME.typography.fontWeight.semibold,
              }}
              className="text-truncate-3"
            >
              {content.title}
            </div>
          )}

          {/* Year overlay (top-left) */}
          <div
            style={{
              position: 'absolute',
              top: 8,
              left: 8,
              background: 'rgba(0,0,0,0.7)',
              color: COLORS.cream[50],
              padding: '4px 8px',
              borderRadius: 4,
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            {content.year || ''}
          </div>

          {/* Rating (top-right) */}
          {(() => {
            const rating = formatRating(content.rating);
            return rating ? (
              <div
                style={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  background: 'rgba(0,0,0,0.7)',
                  color: '#FBBF24',
                  padding: '4px 8px',
                  borderRadius: 4,
                  fontSize: 14,
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                <StarIcon size={12} />
                {rating}
              </div>
            ) : null;
          })()}

          {/* Progress bar (bottom) */}
          {progress !== undefined && progress > 0 && (
            <div
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: 4,
                background: 'rgba(0,0,0,0.6)',
              }}
            >
              <div
                style={{
                  width: `${Math.min(100, progress)}%`,
                  height: '100%',
                  background: COLORS.accent[500],
                }}
              />
            </div>
          )}

          {/* Featured badge */}
          {content.featured && (
            <div
              style={{
                position: 'absolute',
                bottom: 8,
                left: 8,
                background: COLORS.accent[500],
                color: '#fff',
                padding: '4px 10px',
                borderRadius: 4,
                fontSize: 12,
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: 0.5,
              }}
            >
              Featured
            </div>
          )}
        </div>

        {/* Title */}
        <div
          style={{
            padding: `${THEME.spacing.sm}px ${THEME.spacing.md}px`,
            background: COLORS.warmCharcoal[200],
          }}
        >
          <div
            className="text-truncate"
            style={{
              color: COLORS.cream[50],
              fontSize: THEME.typography.fontSize.sm,
              fontWeight: THEME.typography.fontWeight.semibold,
            }}
          >
            {content.title}
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: THEME.spacing.xs,
              marginTop: 4,
              fontSize: THEME.typography.fontSize.xs,
              color: COLORS.cream[200],
            }}
          >
            <span>{content.duration}</span>
            {content.genre && content.genre[0] && (
              <>
                <span>•</span>
                <span>{content.genre[0]}</span>
              </>
            )}
          </div>
        </div>
      </div>
    </Focusable>
  );
}

export default ContentCard;
