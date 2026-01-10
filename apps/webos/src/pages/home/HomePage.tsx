import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../../stores';
import { contentService, userService } from '../../services';
import { Content } from '../../types';
import { cn } from '../../utils';
import Header from '../../components/layout/Header';
import FeaturedCarousel from '../../components/home/FeaturedCarousel';
import ContentCard from '../../components/content/ContentCard';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const [selectedContent, setSelectedContent] = useState<Content | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const [loadSecondary, setLoadSecondary] = useState(false);
  const [loadGenre, setLoadGenre] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setLoadSecondary(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setLoadGenre(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  const { data: featured, isLoading: loadingFeatured, refetch: refetchFeatured } = useQuery({
    queryKey: ['featured'],
    queryFn: () => contentService.getFeaturedContent(),
  });

  const { data: continueWatching, isLoading: loadingContinue } = useQuery({
    queryKey: ['continue-watching'],
    queryFn: () => userService.getContinueWatching(),
    enabled: isAuthenticated,
  });

  const { data: indonesian, isLoading: loadingIndonesian } = useQuery({
    queryKey: ['indonesian'],
    queryFn: () => contentService.getIndonesianContent(),
    enabled: loadSecondary,
  });

  const { data: newReleases, isLoading: loadingNewReleases } = useQuery({
    queryKey: ['new-releases'],
    queryFn: () => contentService.getNewReleases(),
    enabled: loadSecondary,
  });

  const { data: action, isLoading: loadingAction } = useQuery({
    queryKey: ['genre', 'Action'],
    queryFn: () => contentService.getActionContent(),
    enabled: loadGenre,
  });

  const { data: drama, isLoading: loadingDrama } = useQuery({
    queryKey: ['genre', 'Drama'],
    queryFn: () => contentService.getDramaContent(),
    enabled: loadGenre,
  });

  const handleContentPress = (content: Content) => {
    navigate(`/content/${content.id}`);
  };

  const handleInfoPress = (content: Content) => {
    navigate(`/content/${content.id}`);
  };

  const handlePlayPress = (content: Content) => {
    navigate(`/player/${content.id}`);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refetchFeatured();
    } finally {
      setRefreshing(false);
    }
  };

  const renderSectionHeader = (title: string) => (
    <h2 className="text-3xl font-bold text-primary-50 mb-4 px-8">{title}</h2>
  );

  const renderContentList = (contents: Content[] = [], showLock: boolean = false) => (
    <div className="flex gap-4 overflow-x-auto px-8 pb-4 scrollbar-thin">
      {contents.map((content) => (
        <ContentCard
          key={content.id}
          content={content}
          onPress={handleContentPress}
          onInfoPress={handleInfoPress}
          showLock={showLock}
          size="medium"
        />
      ))}
    </div>
  );

  const renderLoadingSkeleton = () => (
    <div className="flex gap-4 px-8">
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className="flex-shrink-0 w-32 h-48 bg-surface rounded-lg animate-pulse"
        />
      ))}
    </div>
  );

  if (loadingFeatured && !refreshing) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="pt-20">
        {featured && featured.length > 0 && (
          <FeaturedCarousel
            contents={featured.slice(0, 5)}
            onPlayPress={handlePlayPress}
            onInfoPress={handleInfoPress}
          />
        )}

        {isAuthenticated && continueWatching && continueWatching.length > 0 && (
          <section className="mb-12">
            {renderSectionHeader('Lanjut Tonton')}
            {renderContentList(continueWatching)}
          </section>
        )}

        {loadSecondary && (
          <section className="mb-12">
            {loadingIndonesian ? (
              renderLoadingSkeleton()
            ) : indonesian && indonesian.length > 0 ? (
              <>
                {renderSectionHeader('Buatan Indonesia')}
                {renderContentList(indonesian, !isAuthenticated)}
              </>
            ) : null}
          </section>
        )}

        {loadSecondary && (
          <section className="mb-12">
            {loadingNewReleases ? (
              renderLoadingSkeleton()
            ) : newReleases && newReleases.length > 0 ? (
              <>
                {renderSectionHeader('Rilis Terbaru')}
                {renderContentList(newReleases, !isAuthenticated)}
              </>
            ) : null}
          </section>
        )}

        {loadGenre && (
          <section className="mb-12">
            {loadingAction ? (
              renderLoadingSkeleton()
            ) : action && action.length > 0 ? (
              <>
                {renderSectionHeader('Aksi')}
                {renderContentList(action, !isAuthenticated)}
              </>
            ) : null}
          </section>
        )}

        {loadGenre && (
          <section className="mb-12">
            {loadingDrama ? (
              renderLoadingSkeleton()
            ) : drama && drama.length > 0 ? (
              <>
                {renderSectionHeader('Drama')}
                {renderContentList(drama, !isAuthenticated)}
              </>
            ) : null}
          </section>
        )}

        <div className="h-32" />
      </div>
    </div>
  );
};

export default HomePage;
