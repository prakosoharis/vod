import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { contentService } from '../../services';
import { Content } from '../../types';
import { cn } from '../../utils';
import Header from '../../components/layout/Header';
import ContentCard from '../../components/content/ContentCard';
import Input from '../../components/ui/Input';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Icon from '../../components/ui/Icon';

const GENRES = ['All', 'Action', 'Drama', 'Comedy', 'Horror', 'Romance', 'Thriller', 'Indonesia'];
const TYPES = ['All', 'MOVIE', 'SERIES'];

const BrowsePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [selectedType, setSelectedType] = useState('All');

  const { data: contentData, isLoading } = useQuery({
    queryKey: ['browse', searchQuery, selectedGenre, selectedType],
    queryFn: () => contentService.getAllContent({
      search: searchQuery || undefined,
      genre: selectedGenre !== 'All' ? selectedGenre : undefined,
      type: selectedType !== 'All' ? selectedType : undefined,
      limit: 50,
    }),
  });

  const handleContentPress = (content: Content) => {
    navigate(`/content/${content.id}`);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
  };

  if (isLoading && !contentData) {
    return <LoadingSpinner fullScreen />;
  }

  const contents = contentData?.data || [];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="pt-24 px-8 pb-16">
        <h1 className="text-5xl font-bold text-primary-50 mb-8">Jelajah</h1>

        <form onSubmit={handleSearch} className="max-w-2xl mb-12">
          <div className="relative">
            <Input
              type="text"
              placeholder="Cari film, serial, atau genre..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12"
            />
            <Icon
              name="Search"
              size={24}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />
          </div>
        </form>

        <div className="mb-8">
          <h2 className="text-2xl font-bold text-primary-50 mb-4">Genre</h2>
          <div className="flex gap-3 flex-wrap">
            {GENRES.map((genre) => (
              <button
                key={genre}
                onClick={() => setSelectedGenre(genre)}
                className={cn(
                  'px-6 py-3 rounded-full font-semibold transition-all duration-200',
                  selectedGenre === genre
                    ? 'bg-accent-500 text-primary-950'
                    : 'bg-surface text-secondary hover:bg-surface-hover'
                )}
              >
                {genre}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-12">
          <h2 className="text-2xl font-bold text-primary-50 mb-4">Tipe</h2>
          <div className="flex gap-3">
            {TYPES.map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={cn(
                  'px-6 py-3 rounded-full font-semibold transition-all duration-200',
                  selectedType === type
                    ? 'bg-accent-500 text-primary-950'
                    : 'bg-surface text-secondary hover:bg-surface-hover'
                )}
              >
                {type === 'All' ? 'Semua' : type === 'MOVIE' ? 'Film' : 'Serial'}
              </button>
            ))}
          </div>
        </div>

        {contents.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {contents.map((content) => (
              <ContentCard
                key={content.id}
                content={content}
                onPress={handleContentPress}
                size="medium"
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <Icon name="SearchX" size={64} className="text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-xl">Tidak ada hasil ditemukan</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BrowsePage;
