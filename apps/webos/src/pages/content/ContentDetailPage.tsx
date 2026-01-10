import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { contentService } from '../../services';
import { Content } from '../../types';
import { cn, formatDate } from '../../utils';
import Header from '../../components/layout/Header';
import Button from '../../components/ui/Button';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Icon from '../../components/ui/Icon';

const ContentDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const { data: content, isLoading } = useQuery({
    queryKey: ['content', id],
    queryFn: () => contentService.getContentById(id!),
    enabled: !!id,
  });

  const handlePlay = () => {
    if (content) {
      navigate(`/player/${content.id}`);
    }
  };

  if (isLoading) {
    return <LoadingSpinner fullScreen />;
  }

  if (!content) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-gray-400 text-xl">Konten tidak ditemukan</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div
        className="relative h-[70vh]"
        style={{
          backgroundImage: `url(${content.backdrop_url || content.thumbnail_url})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
      </div>

      <div className="relative -mt-32 px-8 pb-16">
        <div className="max-w-6xl">
          <h1 className="text-6xl font-bold text-white mb-4">{content.title}</h1>

          <div className="flex items-center gap-6 mb-6 text-gray-300 text-lg">
            {content.year && <span>{content.year}</span>}
            {content.rating && <span>⭐ {content.rating}</span>}
            <span>{content.duration}</span>
            <span className="px-3 py-1 bg-surface rounded-lg">
              {content.type === 'MOVIE' ? 'Film' : 'Serial'}
            </span>
          </div>

          <div className="flex gap-4 mb-8">
            <Button size="lg" onClick={handlePlay} className="gap-2">
              <Icon name="Play" size={24} />
              Putar
            </Button>
          </div>

          {content.description && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-3">Sinopsis</h2>
              <p className="text-gray-300 text-lg leading-relaxed max-w-3xl">
                {content.description}
              </p>
            </div>
          )}

          {content.genre && content.genre.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-3">Genre</h2>
              <div className="flex gap-3 flex-wrap">
                {content.genre.map((genre) => (
                  <span
                    key={genre}
                    className="px-4 py-2 bg-surface text-gray-300 rounded-lg"
                  >
                    {genre}
                  </span>
                ))}
              </div>
            </div>
          )}

          {content.cast && content.cast.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-3">Pemeran</h2>
              <div className="space-y-3">
                {content.cast.map((person, index) => (
                  <div key={index} className="flex gap-4">
                    <span className="text-white font-semibold">{person.name}</span>
                    <span className="text-gray-400">sebagai {person.role}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <h2 className="text-2xl font-bold text-white mb-3">Info</h2>
            <div className="space-y-2 text-gray-300">
              <p>Ditambahkan pada: {formatDate(content.created_at)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentDetailPage;
