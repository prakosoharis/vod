import { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Content } from '@/types';
import { ContentCard } from './ContentCard';

export interface ContentRowProps {
  title: string;
  contents: Content[];
}

const ContentRow = ({ title, contents }: ContentRowProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      // Adjust amount if needed for small screens
      const base = 800;
      const vw = typeof window !== 'undefined' ? Math.max(window.innerWidth, 320) : 1280;
      const responsive = vw < 640 ? Math.round(base * 0.5) : base; // ~400px on mobile, 800px otherwise
      const scrollAmount = direction === 'left' ? -responsive : responsive;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  if (!contents || contents.length === 0) return null;

  return (
    <div className="px-12">
      <h2 className="text-2xl font-bold mb-4">{title}</h2>
      <div className="relative group">
        {/* Left Arrow */}
        <button
          type="button"
          aria-label="Scroll left"
          onClick={() => scroll('left')}
          className="absolute left-0 top-0 bottom-0 z-10 w-12 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
        >
          <ChevronLeft size={32} />
        </button>

        {/* Scrollable Container */}
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-scroll overflow-y-hidden scrollbar-hide scroll-smooth"
        >
          {contents.map((content) => (
            <div key={content.id} className="shrink-0 w-[60vw] sm:w-[40vw] md:w-[30vw] lg:w-[22vw] xl:w-[18vw]">
              <ContentCard content={content} />
            </div>
          ))}
        </div>

        {/* Right Arrow */}
        <button
          type="button"
          aria-label="Scroll right"
          onClick={() => scroll('right')}
          className="absolute right-0 top-0 bottom-0 z-10 w-12 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
        >
          <ChevronRight size={32} />
        </button>
      </div>
    </div>
  );
};

export default ContentRow;
