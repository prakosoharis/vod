import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Radio, Square, RefreshCw, Monitor, Settings, Play, Wifi } from 'lucide-react';

// Import extracted components
import LiveVideoPlayer from '@/components/live/LiveVideoPlayer';
import LiveChat from '@/components/live/LiveChat';
import StreamStatus from '@/components/live/StreamStatus';

// Import custom hook
import useLiveStream from '@/hooks/useLiveStream';

const LiveStreamingPage = () => {
  const [defaultStreamKey] = useState('deluwang-live');

  // Configuration
  const CONFIG = {
    HLS_URL: (streamKey: string) => `https://live.deluwang.online/hls/${streamKey}/index.m3u8`,
    CHAT_SERVER: 'https://live.deluwang.online',
    RECONNECT_INTERVAL: 5000
  };

  const {
    streamStatus,
    isLoading,
    lastChecked,
    checkStreamStatus,
    startStream
  } = useLiveStream({
    hlsUrl: CONFIG.HLS_URL,
    checkInterval: 30000
  });

  // Auto-check for stream on mount and set up interval
  useEffect(() => {
    setTimeout(() => {
      checkStreamStatus(defaultStreamKey);
    }, 1000);

    const interval = setInterval(() => {
      checkStreamStatus(defaultStreamKey);
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [defaultStreamKey, checkStreamStatus]);

  const handleGoLive = (streamKey: string) => {
    startStream(streamKey);
  };

  const refreshStream = () => {
    checkStreamStatus(defaultStreamKey);
  };

  const copyOBSSettings = () => {
    const obsSettings = `Server: rtmp://161.97.65.21/live
Stream Key: ${defaultStreamKey}

NOTE: Gunakan Direct IP karena Cloudflare tidak support RTMP.
HLS untuk penonton tetap pakai: https://live.deluwang.online/hls/${defaultStreamKey}/index.m3u8`;

    navigator.clipboard.writeText(obsSettings).then(() => {
      alert('✅ Settings copied to clipboard!\n\n' + obsSettings);
    }).catch(() => {
      prompt('Copy these OBS settings:', obsSettings);
    });
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 py-6">
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
          <div className="lg:col-span-2 space-y-4">
            <LiveVideoPlayer
              streamUrl={CONFIG.HLS_URL(defaultStreamKey)}
              isLive={streamStatus.isLive}
              viewerCount={streamStatus.viewerCount}
              isLoading={isLoading}
              onCheckStream={refreshStream}
            />

            {/* Stream Control */}
            <StreamStatus
              streamStatus={streamStatus}
              defaultStreamKey={defaultStreamKey}
              lastChecked={lastChecked}
              onCheckStream={refreshStream}
              onGoLive={handleGoLive}
              isLoading={isLoading}
            />
          </div>

          {/* Chat Section */}
          <div className="lg:col-span-1">
            <LiveChat chatServer={CONFIG.CHAT_SERVER} />
          </div>
        </div>

        {/* Info Section - Instruksi untuk Streamer */}
        <div className="mt-8">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Monitor className="text-red-500" />
                Instruksi untuk Streamer (Jika ingin menjadi broadcaster)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold text-white flex items-center gap-2">
                    <Settings size={16} />
                    OBS Studio Settings
                  </h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Server:</span>
                      <div className="flex items-center gap-2">
                        <code className="bg-gray-800 px-2 py-1 rounded text-xs">rtmp://161.97.65.21/live</code>
                        <Button size="sm" onClick={copyOBSSettings} className="text-xs px-2 py-1">
                          Copy
                        </Button>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Stream Key:</span>
                      <code className="bg-gray-800 px-2 py-1 rounded text-xs">{defaultStreamKey}</code>
                    </div>
                  </div>

                  <div className="mt-4">
                    <h4 className="font-semibold text-white mb-2 flex items-center gap-2">
                      <Wifi size={16} />
                      Connection Status
                    </h4>
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${streamStatus.isLive ? 'bg-green-500' : 'bg-gray-500'}`} />
                      <span className="text-sm">
                        {streamStatus.isLive ? 'Stream Active' : 'No Stream Detected'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold text-white flex items-center gap-2">
                    <Play size={16} />
                    Cara Memulai Streaming
                  </h4>
                  <ol className="space-y-2 text-sm text-gray-300">
                    <li className="flex items-start gap-2">
                      <span className="text-red-500 font-bold">1.</span>
                      <span>Install OBS Studio di laptop/PC Anda</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-500 font-bold">2.</span>
                      <span>Settings → Stream → Service: Custom</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-500 font-bold">3.</span>
                      <span>Masukkan server dan stream key di atas</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-500 font-bold">4.</span>
                      <span>Setup video source (game, webcam, etc.)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-500 font-bold">5.</span>
                      <span>Klik "Start Streaming" di OBS</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-500 font-bold">6.</span>
                      <span>Refresh halaman ini untuk melihat stream</span>
                    </li>
                  </ol>

                  <div className="bg-yellow-900/30 border border-yellow-800 rounded-lg p-3 text-xs mb-3">
                    <p className="text-yellow-300 font-medium mb-1">⚠️ Penting:</p>
                    <p className="text-yellow-200">
                      Gunakan <strong>Direct IP (rtmp://161.97.65.21)</strong> untuk OBS karena Cloudflare tidak support RTMP protocol.
                      Penonton tetap menggunakan HTTPS domain untuk menonton.
                    </p>
                  </div>
                  <div className="bg-red-900/30 border border-red-800 rounded-lg p-3 text-xs">
                    <p className="text-red-300 font-medium mb-1">🎯 Catatan:</p>
                    <p className="text-red-200">
                      Stream akan otomatis terdeteksi dan tayang di halaman ini. User lain bisa menonton dan chat dalam real-time.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default LiveStreamingPage;