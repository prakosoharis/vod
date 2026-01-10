import React, { useState, useEffect } from 'react';
import { useFocusable } from '../../hooks';
import { Content } from '../../types';
import { cn } from '../../utils';
import Button from '../ui/Button';
import Icon from '../ui/Icon';

interface FeaturedCarouselProps {
  contents: Content[];
  onPlayPress: (content: Content) => void;
  onInfoPress: (content: Content) => void;
}

const FeaturedCarousel: React.FC<FeaturedCarouselProps> = ({
  contents,
  onPlayPress,
  onInfoPress,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { ref: containerRef, onFocus } = useFocusable('featured-carousel');

  const currentContent = contents[currentIndex];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % contents.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [contents.length]);

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % contents.length);
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + contents.length) % contents.length);
  };

  if (!currentContent) return null;

  return (
    <div
      ref={containerRef as React.RefObject<HTMLDivElement>}
      id="featured-carousel"
      data-focusable
      data-focusable-container="true"
      className="relative w-full h-[70vh] overflow-hidden bg-surface"
      onFocus={onFocus}
      tabIndex={-1}
    >
      <img
        src={currentContent.backdrop_url || currentContent.thumbnail_url}
        alt={currentContent.title}
        className="absolute inset-0 w-full h-full object-cover"
      />

      <div className="absolute inset-0 bg-gradient-to-r from-black via-black/50 to-transparent" />

      <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />

      <div className="absolute bottom-0 left-0 right-0 p-12">
        <h2 className="text-6xl font-bold text-primary-50 mb-4">{currentContent.title}</h2>

        <div className="flex items-center gap-4 mb-6">
          {currentContent.rating && (
            <span className="px-3 py-1 bg-accent-500 text-white rounded-lg font-semibold">
              {currentContent.rating}
            </span>
          )}
          {currentContent.year && (
            <span className="text-xl text-secondary">{currentContent.year}</span>
          )}
          {currentContent.duration && (
            <span className="text-xl text-secondary">{currentContent.duration}</span>
          )}
        </div>

        <div className="flex gap-4">
          <Button
            size="lg"
            onClick={() => onPlayPress(currentContent)}
            className="flex items-center gap-3"
          >
            <Icon name="Play" size={24} />
            Putar
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={() => onInfoPress(currentContent)}
            className="flex items-center gap-3"
          >
            <Icon name="Info" size={24} />
            Info
          </Button>
        </div>
      </div>

      <button
        onClick={goToPrevious}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 p-4 rounded-full transition-all z-10"
      >
        <Icon name="ChevronLeft" size={32} className="text-white" />
      </button>

      <button
        onClick={goToNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 p-4 rounded-full transition-all z-10"
      >
        <Icon name="ChevronRight" size={32} className="text-white" />
      </button>

      <div className="absolute bottom-4 right-4 flex gap-2">
        {contents.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={cn(
              'w-2 h-2 rounded-full transition-all duration-200',
              index === currentIndex ? 'bg-accent-500 w-8' : 'bg-white/50'
            )}
          />
        ))}
      </div>
    </div>
  );
};

export default FeaturedCarousel;
