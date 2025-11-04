import { useEffect, useState } from 'react';
import { ContentRow } from '@/components/home/ContentRow';
import { contentService } from '@/services/content.service';
import type { Content, ContentCategory } from '@/types';
import { useAuthStore } from '@/stores/authStore';
import { useNavigate } from 'react-router-dom';

export function BrowsePage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const [content, setContent] = useState<Content[]>([]);
  const [categories, setCategories] = useState<ContentCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      try {
        const [contentData, categoriesData] = await Promise.all([
          contentService.getContent(1, 20),
          contentService.getCategories(),
        ]);
        setContent(contentData.data);
        setCategories(categoriesData);
      } catch (error) {
        console.error('Error fetching content:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated, navigate]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Browse Content</h1>
      {content.length > 0 ? (
        <ContentRow title="All Content" contents={content} />
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          No content available at the moment.
        </div>
      )}
    </div>
  );
}

