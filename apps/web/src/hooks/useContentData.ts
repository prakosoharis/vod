import { useQuery } from '@tanstack/react-query';
import { contentService } from '@/services/content.service';
import type { Content } from '@/types';


interface UseContentDataProps {
  contentId?: string;
  enabled?: boolean;
}

interface UseContentDataReturn {
  content: Content | undefined;
  similarContent: Content[] | undefined;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

const useContentData = ({ contentId, enabled = true }: UseContentDataProps): UseContentDataReturn => {
  // Fetch content data
  const {
    data: content,
    isLoading: contentLoading,
    error: contentError,
    refetch: refetchContent
  } = useQuery<Content>({
    queryKey: ['content', contentId],
    queryFn: () => contentService.getContentById(contentId!),
    enabled: !!contentId && enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000 // 10 minutes (gcTime replaced cacheTime)
  });

  // Fetch similar content for "More Like This"
  const {
    data: similarContent,
    isLoading: similarLoading,
    error: similarError
  } = useQuery<Content[]>({
    queryKey: ['similar-content', content?.genre],
    queryFn: async () => {
      if (!content?.genre?.[0]) return [];

      try {
        const response = await contentService.getAllContent({
          genre: content.genre[0],
          limit: 12 // Get more similar content for better recommendations
        });

        // Filter out current content and limit results
        return response.data
          .filter(item => item.id !== content.id)
          .slice(0, 8);
      } catch (error) {
        return [];
      }
    },
    enabled: !!content?.genre?.[0] && enabled,
    staleTime: 15 * 60 * 1000, // 15 minutes - similar content changes less frequently
    gcTime: 30 * 60 * 1000 // 30 minutes (gcTime replaced cacheTime)
  });

  const isLoading = contentLoading || similarLoading;
  const error = contentError || similarError;

  const refetch = () => {
    refetchContent();
  };

  return {
    content,
    similarContent,
    isLoading,
    error: error as Error | null,
    refetch
  };
};

export default useContentData;