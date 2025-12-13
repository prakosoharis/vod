import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { LiveEvent } from '@/types';

interface EventRowProps {
  title: string;
  events: LiveEvent[];
}

const EVENT_TYPE_LABELS: Record<string, string> = {
  GALA_PREMIERE: 'Gala Premiere',
  STANDUP_COMEDY: 'Stand Up Comedy',
  CONCERT: 'Konser',
  SPECIAL_EVENT: 'Event Spesial',
};

const EVENT_TYPE_COLORS: Record<string, string> = {
  GALA_PREMIERE: 'bg-accent-500/20 text-accent-500',
  STANDUP_COMEDY: 'bg-cream-50/20 text-cream-50',
  CONCERT: 'bg-accent-600/20 text-accent-600',
  SPECIAL_EVENT: 'bg-warm-charcoal-50/50 text-cream-100',
};

const EventRow: React.FC<EventRowProps> = ({ title, events }) => {
  const navigate = useNavigate();

  if (!events || events.length === 0) return null;

  const formatShortDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
    }).format(date);
  };

  const formatShortTime = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <div className="px-12">
      {/* Title */}
      <h2 className="text-3xl font-bold text-cream-50 mb-6">{title}</h2>

      {/* Horizontal Scroll - COMPACT */}
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
        {events.map((event) => (
          <button
            key={event.id}
            onClick={() => navigate('/live')}
            className="group flex-shrink-0 w-80 bg-warm-charcoal-50 rounded-xl overflow-hidden hover:scale-105 transition-all duration-300 cursor-pointer"
          >
            {/* Thumbnail */}
            <div className="w-full h-44 overflow-hidden">
              <img
                src={event.thumbnail_url}
                alt={event.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              />
            </div>

            {/* Info - COMPACT */}
            <div className="p-4 space-y-2">
              {/* Badge + Date/Time in one line */}
              <div className="flex items-center justify-between">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-bold ${EVENT_TYPE_COLORS[event.event_type] || EVENT_TYPE_COLORS.SPECIAL_EVENT}`}
                >
                  {EVENT_TYPE_LABELS[event.event_type] || 'Event'}
                </span>
                <span className="text-cream-100 text-xs">
                  {formatShortDate(event.scheduled_at)} • {formatShortTime(event.scheduled_at)}
                </span>
              </div>

              {/* Title */}
              <h3 className="text-lg font-bold text-cream-50 line-clamp-2 group-hover:text-accent-500 transition-colors">
                {event.title}
              </h3>

              {/* Host */}
              {event.host_name && (
                <p className="text-cream-200 text-sm">
                  {event.host_name}
                </p>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default EventRow;
