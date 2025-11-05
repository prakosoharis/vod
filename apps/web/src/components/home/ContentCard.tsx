import { Link } from 'react-router-dom';
import type { Content } from '@/types';

interface ContentCardProps {
  content: Content;
}

export function ContentCard({ content }: ContentCardProps) {
  return (
    <Link to={`/content/${content.id}`} className="group">
      <div className="relative overflow-hidden rounded-lg bg-card border transition-transform group-hover:scale-105">
        <div className="aspect-video relative">
          <img
            src={content.thumbnail_url}
            alt={content.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.src = 'https://via.placeholder.com/400x225?text=No+Image';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors">
            {content.title}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {content.description}
          </p>
          {content.rating !== null && content.rating !== undefined && (
            <div className="mt-2 text-sm text-muted-foreground">
              ⭐ {typeof content.rating === 'number' ? content.rating.toFixed(1) : content.rating}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

