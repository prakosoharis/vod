import { HeroBanner } from '@/components/home/HeroBanner';
import { ContentRow } from '@/components/home/ContentRow';
import { contentService } from '@/services/content.service';
import { useEffect, useState } from 'react';
import type { Content } from '@/types';

export function LandingPage() {
  const [featuredContent, setFeaturedContent] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const content = await contentService.getFeaturedContent();
        setFeaturedContent(content);
      } catch (error) {
        console.error('Error fetching featured content:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeatured();
  }, []);

  return (
    <div>
      <HeroBanner content={featuredContent[0]} />
      <div className="container mx-auto py-8">
        {loading ? (
          <div className="text-center py-12">Loading...</div>
        ) : (
          <>
            {featuredContent.length > 1 && (
              <ContentRow title="Featured Content" contents={featuredContent.slice(1)} />
            )}
          </>
        )}
      </div>
    </div>
  );
}

