import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { contentService } from '../../services';
import VideoPlayer from '../../components/video/VideoPlayer';

const VideoPlayerPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const { data: content, isLoading } = useQuery({
    queryKey: ['content', id],
    queryFn: () => contentService.getContentById(id!),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="w-full h-screen bg-background flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-white/20 border-t-accent-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!content) {
    return (
      <div className="w-full h-screen bg-background flex items-center justify-center">
        <p className="text-primary-50 text-xl">Konten tidak ditemukan</p>
      </div>
    );
  }

  return <VideoPlayer content={content} />;
};

export default VideoPlayerPage;
