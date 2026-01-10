import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { liveService } from '../../services';
import { LiveStream } from '../../types';
import { cn } from '../../utils';
import Header from '../../components/layout/Header';
import VideoPlayer from '../../components/video/VideoPlayer';
import { Content } from '../../types';
import Button from '../../components/ui/Button';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Icon from '../../components/ui/Icon';

const LivePage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedStream, setSelectedStream] = useState<LiveStream | null>(null);

  const { data: streams, isLoading } = useQuery({
    queryKey: ['live-streams'],
    queryFn: () => liveService.getLiveStreams(),
  });

  const handleStreamPress = (stream: LiveStream) => {
    const content: Content = {
      id: stream.id,
      title: stream.title,
      description: null,
      genre: [],
      year: null,
      rating: null,
      duration: 'Live',
      thumbnail_url: stream.thumbnail_url,
      backdrop_url: null,
      video_url: null,
      trailer_url: null,
      hls_url: stream.hls_url,
      hls_cdn_url: null,
      cast: [],
      type: 'SERIES',
      featured: false,
      created_at: stream.started_at,
    };

    setSelectedStream(stream);
    navigate(`/player/${stream.id}`, { state: { content, isLive: true } });
  };

  if (isLoading) {
    return <LoadingSpinner fullScreen />;
  }

  if (selectedStream) {
    const content: Content = {
      id: selectedStream.id,
      title: selectedStream.title,
      description: null,
      genre: [],
      year: null,
      rating: null,
      duration: 'Live',
      thumbnail_url: selectedStream.thumbnail_url,
      backdrop_url: null,
      video_url: null,
      trailer_url: null,
      hls_url: selectedStream.hls_url,
      hls_cdn_url: null,
      cast: [],
      type: 'SERIES',
      featured: false,
      created_at: selectedStream.started_at,
    };

    return (
      <div className="w-full h-screen bg-black">
        <VideoPlayer content={content} onClose={() => setSelectedStream(null)} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="pt-24 px-8 pb-16">
        <h1 className="text-5xl font-bold text-primary-50 mb-8">Live Streaming</h1>

        {streams && streams.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {streams.map((stream) => (
              <div
                key={stream.id}
                className="relative bg-surface rounded-xl overflow-hidden shadow-lg cursor-pointer transition-all duration-200 hover:scale-105"
                onClick={() => handleStreamPress(stream)}
              >
                <div className="relative aspect-video">
                  <img
                    src={stream.thumbnail_url}
                    alt={stream.title}
                    className="w-full h-full object-cover"
                  />
                  {stream.is_live && (
                    <div className="absolute top-4 left-4 bg-accent-500 px-3 py-1 rounded-full flex items-center gap-2">
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                      <span className="text-white text-sm font-semibold">LIVE</span>
                    </div>
                  )}
                  <div className="absolute top-4 right-4 bg-black/70 px-3 py-1 rounded-full">
                    <span className="text-white text-sm">
                      👁 {stream.viewers}
                    </span>
                  </div>
                </div>

                <div className="p-4">
                  <h3 className="text-xl font-bold text-white mb-2">
                    {stream.title}
                  </h3>
                  <div className="flex items-center gap-2 text-gray-400">
                    <Icon name="Clock" size={16} />
                    <span className="text-sm">
                      {new Date(stream.started_at).toLocaleDateString('id-ID')}
                    </span>
                  </div>
                </div>

                <div className="absolute inset-0 bg-black/0 hover:bg-black/30 transition-colors flex items-center justify-center opacity-0 hover:opacity-100">
                  <div className="bg-accent-500 rounded-full p-4">
                    <Icon name="Play" size={32} className="text-white" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <Icon name="Radio" size={64} className="text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-xl">Tidak ada stream aktif saat ini</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LivePage;
