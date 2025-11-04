import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import type { Content } from '@/types';

interface HeroBannerProps {
  content?: Content;
}

export function HeroBanner({ content }: HeroBannerProps) {
  const defaultContent = {
    title: 'Welcome to StreamKita',
    description: 'Discover thousands of movies and TV shows. Stream anytime, anywhere.',
  };

  const displayContent = content || defaultContent;

  return (
    <div className="relative h-[600px] flex items-center justify-center bg-gradient-to-r from-purple-900 via-blue-900 to-indigo-900">
      <div className="absolute inset-0 bg-black/40" />
      <div className="relative z-10 container mx-auto px-4 text-center text-white">
        <h1 className="text-5xl md:text-7xl font-bold mb-6">
          {displayContent.title}
        </h1>
        <p className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto">
          {displayContent.description}
        </p>
        <div className="flex gap-4 justify-center">
          <Link to="/browse">
            <Button size="lg" className="bg-white text-black hover:bg-gray-200">
              Browse Now
            </Button>
          </Link>
          {!content && (
            <Link to="/register">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                Get Started
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

