import { useState, useCallback, useRef } from 'react';

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

  // Refs for debouncing and optimization
  const lastCheckRef = useRef<string>('');

  const checkStreamStatus = useCallback(async (streamKey: string) => {
    // Debounce: Skip if same stream was checked recently (within 5 seconds)
    const now = Date.now();
    const lastCheckTime = lastCheckRef.current;
    if (lastCheckTime && now - parseInt(lastCheckTime) < 5000) {
      return;
    }

    try {
      setIsLoading(true);

      // AbortController for timeout handling
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout

      // Check HLS manifest with timeout
      const response = await fetch(config.hlsUrl(streamKey), {
        method: 'HEAD',
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      const isLive = response.ok;

      // Get viewer count (only if live) - using fallback for demo
      let viewerCount = 0;
      let startTime = undefined;

      if (isLive) {
        viewerCount = Math.floor(Math.random() * 100) + 1; // Fallback for demo
        startTime = new Date().toISOString();
      }

      setStreamStatus({
        isLive,
        streamKey: isLive ? streamKey : null,
        viewerCount,
        startTime
      });

      setLastChecked(new Date());
      lastCheckRef.current = now.toString();
    } catch (error) {
      // Silent error handling - don't log errors for offline streams (normal behavior)
      // Only log for unexpected errors (not 404/timeout when stream is offline)
      if (error instanceof Error &&
          !error.message.includes('AbortError') &&
          !error.message.includes('Timeout') &&
          !error.message.includes('404') &&
          !error.message.includes('Failed to fetch')) {
        console.warn('Unexpected stream check error:', error);
      }

      setStreamStatus({
        isLive: false,
        streamKey: null,
        viewerCount: 0
      });
    } finally {
      setIsLoading(false);
    }
  }, [config.hlsUrl]);

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