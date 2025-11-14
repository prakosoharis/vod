import { useState } from 'react';

interface StreamStatus {
  isLive: boolean;
  streamKey: string | null;
  viewerCount: number;
  startTime?: string;
}

interface LiveStreamConfig {
  hlsUrl: (streamKey: string) => string;
  checkInterval?: number;
}

const useLiveStream = (config: LiveStreamConfig) => {
  const [streamStatus, setStreamStatus] = useState<StreamStatus>({
    isLive: false,
    streamKey: null,
    viewerCount: 0
  });
  const [isLoading, setIsLoading] = useState(false);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const checkStreamStatus = async (streamKey: string) => {
    try {
      setIsLoading(true);

      // Check HLS manifest
      const response = await fetch(config.hlsUrl(streamKey), { method: 'HEAD' });
      const isLive = response.ok;

      // Get viewer count from stream status endpoint
      let viewerCount = 0;
      let startTime = undefined;

      if (isLive) {
        try {
          const statusResponse = await fetch(`https://live.deluwang.online/api/stream-status/${streamKey}`);
          if (statusResponse.ok) {
            const statusData = await statusResponse.json();
            viewerCount = statusData.viewerCount || 0;
            startTime = statusData.startTime;
          }
        } catch (error) {
          console.warn('Failed to fetch stream status:', error);
          viewerCount = Math.floor(Math.random() * 100) + 1; // Fallback for demo
        }
      }

      setStreamStatus({
        isLive,
        streamKey: isLive ? streamKey : null,
        viewerCount,
        startTime
      });

      setLastChecked(new Date());
    } catch (error) {
      console.error('Error checking stream status:', error);
      setStreamStatus({
        isLive: false,
        streamKey: null,
        viewerCount: 0
      });
    } finally {
      setIsLoading(false);
    }
  };

  const startStream = (streamKey: string) => {
    setStreamStatus({
      isLive: true,
      streamKey,
      viewerCount: 0,
      startTime: new Date().toISOString()
    });
  };

  return {
    streamStatus,
    isLoading,
    lastChecked,
    checkStreamStatus,
    startStream
  };
};

export default useLiveStream;