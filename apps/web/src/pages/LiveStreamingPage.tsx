import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Radio, Square, RefreshCw } from 'lucide-react';

// Import layout
import Layout from '@/components/layout/Layout';

// Import extracted components
import LiveVideoPlayer from '@/components/live/LiveVideoPlayer';
import LiveChat from '@/components/live/LiveChat';

// Import custom hook
import useLiveStream from '@/hooks/useLiveStream';

interface BroadcastEvent {
  id: string;
  title: string;
  status: 'SCHEDULED' | 'LIVE' | 'ENDED' | 'CANCELLED';
}

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';
const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:3002';

const LiveStreamingPage = () => {
  const [defaultStreamKey] = useState('deluwang-live');
  const [liveBroadcastId, setLiveBroadcastId] = useState<string | null>(null);

  // Configuration
  const CONFIG = {
    HLS_URL: (streamKey: string) => `http://localhost:8089/hls/${streamKey}/index.m3u8`,
    CHAT_SERVER: WS_URL,
    RECONNECT_INTERVAL: 5000
  };

  const {
    streamStatus,
    isLoading,
    lastChecked,
    checkStreamStatus
  } = useLiveStream({
    hlsUrl: CONFIG.HLS_URL,
    checkInterval: 30000
  });

  // Fetch live broadcast info
  useEffect(() => {
    const fetchLiveBroadcast = async () => {
      try {
        const response = await fetch(`${API_URL}/broadcasts`);
        if (response.ok) {
          const broadcasts: BroadcastEvent[] = await response.json();
          const liveBroadcast = broadcasts.find(b => b.status === 'LIVE');
          if (liveBroadcast) {
            setLiveBroadcastId(liveBroadcast.id);
          }
        }
      } catch (error) {
        console.error('Error fetching live broadcast:', error);
      }
    };

    fetchLiveBroadcast();
    const interval = setInterval(fetchLiveBroadcast, 60000);
    return () => clearInterval(interval);
  }, []);

  // Auto-check for stream on mount and set up interval
  useEffect(() => {
    setTimeout(() => {
      checkStreamStatus(defaultStreamKey);
    }, 1000);

    const interval = setInterval(() => {
      checkStreamStatus(defaultStreamKey);
    }, 30000);

    return () => clearInterval(interval);
  }, [defaultStreamKey, checkStreamStatus]);

  const refreshStream = () => {
    checkStreamStatus(defaultStreamKey);
  };

  return (
    <Layout>
      <div className="min-h-screen bg-black text-white pt-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-2">
                {streamStatus.isLive ? (
                  <>
                    <Radio className="text-red-500 animate-pulse" />
                    Live Streaming
                  </>
                ) : (
                  <>
                    <Square className="text-gray-400" />
                    Live Streaming
                  </>
                )}
              </h1>
              <p className="text-gray-400">
                {streamStatus.isLive ? 'Streaming sedang berlangsung' : 'Menunggu stream dimulai...'}
              </p>
              {lastChecked && (
                <p className="text-xs text-gray-500">
                  Terakhir diperiksa: {lastChecked.toLocaleTimeString('id-ID')}
                </p>
              )}
            </div>

            {/* Refresh Button */}
            <div className="flex items-center gap-4">
              <Button
                onClick={refreshStream}
                variant="outline"
                className="border-gray-600 text-white hover:bg-gray-800"
                disabled={isLoading}
              >
                <RefreshCw size={16} className={`mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh Stream
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Video Player Section */}
          <div className="lg:col-span-2">
            <LiveVideoPlayer
              streamUrl={CONFIG.HLS_URL(defaultStreamKey)}
              isLive={streamStatus.isLive}
              viewerCount={streamStatus.viewerCount}
              isLoading={isLoading}
              onCheckStream={refreshStream}
            />
          </div>

          {/* Chat Section */}
          <div className="lg:col-span-1">
            {liveBroadcastId ? (
              <LiveChat chatServer={CONFIG.CHAT_SERVER} broadcastId={liveBroadcastId} />
            ) : (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center text-gray-500">
                Tidak ada siaran live saat ini
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default LiveStreamingPage;