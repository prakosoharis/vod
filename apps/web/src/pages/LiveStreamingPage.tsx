import { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import Hls from 'hls.js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Radio, Send, MessageCircle, Maximize2, Volume2, VolumeX, Eye, Square, RefreshCw, Play, Settings, Monitor, Wifi } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';

interface ChatMessage {
  id: number;
  username: string;
  message: string;
  timestamp: string;
  userId: string;
}

interface StreamStatus {
  isLive: boolean;
  streamKey: string | null;
  viewerCount: number;
  startTime?: string;
}

const LiveStreamingPage = () => {
  const { user } = useAuthStore();
  const videoRef = useRef<HTMLVideoElement>(null);
  const chatMessagesRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);
  const hlsRef = useRef<Hls | null>(null);

  // Stream state
  const [streamStatus, setStreamStatus] = useState<StreamStatus>({
    isLive: false,
    streamKey: null,
    viewerCount: 0
  });
  const [defaultStreamKey] = useState('deluwang-live');
  const [isMuted, setIsMuted] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  // Chat state
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [viewerCount, setViewerCount] = useState(0);

  // Configuration
  const CONFIG = {
    HLS_URL: (streamKey: string) => `https://live.deluwang.online/hls/${streamKey}/index.m3u8`,
    CHAT_SERVER: 'https://live.deluwang.online',
    RECONNECT_INTERVAL: 5000
  };

  // Initialize chat connection and auto-detect stream
  useEffect(() => {
    initializeChat();
    // Auto-check for stream on mount
    setTimeout(() => {
      checkStreamStatus();
    }, 1000);

    const interval = setInterval(() => {
      checkStreamStatus();
    }, 30000); // Check every 30 seconds

    return () => {
      clearInterval(interval);
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }
    };
  }, []);

  const initializeChat = () => {
    try {
      socketRef.current = io(CONFIG.CHAT_SERVER, {
        path: '/socket.io/',
        transports: ['websocket', 'polling'],
        secure: true,
        rejectUnauthorized: false
      });

      socketRef.current.on('connect', () => {
        console.log('Connected to chat server');
        setIsConnected(true);
        socketRef.current?.emit('userInfo', {
          username: user?.full_name || user?.email?.split('@')[0] || 'Anonymous'
        });
      });

      socketRef.current.on('disconnect', () => {
        console.log('Disconnected from chat server');
        setIsConnected(false);
      });

      socketRef.current.on('previousMessages', (msgs: ChatMessage[]) => {
        const systemMessage: ChatMessage = {
          id: Date.now(),
          username: 'System',
          message: '🎉 Selamat datang di Live Streaming Deluwang! Chat akan muncul di sini.',
          timestamp: new Date().toISOString(),
          userId: 'system'
        };
        setMessages([systemMessage, ...msgs.slice(-20)]);
      });

      socketRef.current.on('newMessage', (message: ChatMessage) => {
        setMessages(prev => [...prev, message]);
      });

      socketRef.current.on('streamStatus', (status: StreamStatus) => {
        setStreamStatus(status);
        if (status.isLive && status.streamKey) {
          if (!hlsRef.current || streamStatus.streamKey !== status.streamKey) {
            loadStream(status.streamKey);
          }
        }
      });

      socketRef.current.on('userCount', (count: number) => {
        setViewerCount(count);
      });

    } catch (error) {
      console.error('Failed to connect to chat server:', error);
    }
  };

  // Check stream status
  const checkStreamStatus = async () => {
    try {
      const response = await fetch(CONFIG.HLS_URL(defaultStreamKey), {
        method: 'HEAD',
        cache: 'no-cache'
      });

      const isStreamAvailable = response.ok;
      setStreamStatus(prev => ({
        ...prev,
        isLive: isStreamAvailable,
        streamKey: isStreamAvailable ? defaultStreamKey : null
      }));

      if (isStreamAvailable && !hlsRef.current) {
        loadStream(defaultStreamKey);
      } else if (!isStreamAvailable && hlsRef.current) {
        // Stream went offline
        if (videoRef.current) {
          videoRef.current.pause();
        }
        hlsRef.current.destroy();
        hlsRef.current = null;
      }

      setLastChecked(new Date());
    } catch (error) {
      // Stream is definitely offline
      setStreamStatus(prev => ({
        ...prev,
        isLive: false,
        streamKey: null
      }));
      setLastChecked(new Date());
    }
  };

  // Load stream
  const loadStream = (streamKey: string) => {
    const video = videoRef.current;
    if (!video) return;

    setIsLoading(true);
    const hlsUrl = CONFIG.HLS_URL(streamKey);

    if (Hls.isSupported()) {
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }

      hlsRef.current = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90,
        maxBufferLength: 30,
        maxMaxBufferLength: 300,
      });

      hlsRef.current.loadSource(hlsUrl);
      hlsRef.current.attachMedia(video);

      hlsRef.current.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch(e => {
          console.error('Autoplay failed:', e);
        });
        setIsLoading(false);
      });

      hlsRef.current.on(Hls.Events.ERROR, (_, data) => {
        console.error('HLS Error:', data);
        if (data.fatal) {
          setIsLoading(false);
        }
      });

    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = hlsUrl;
      video.addEventListener('loadedmetadata', () => {
        video.play().catch(e => {
          console.error('Autoplay failed:', e);
        });
        setIsLoading(false);
      });
    }
  };

  // Toggle fullscreen
  const toggleFullscreen = () => {
    const videoContainer = document.querySelector('.video-container');
    if (!document.fullscreenElement && videoContainer) {
      videoContainer.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  // Manual refresh stream status
  const refreshStream = () => {
    setIsLoading(true);
    checkStreamStatus();
  };

  // Send chat message
  const sendMessage = () => {
    const message = newMessage.trim();
    if (message && socketRef.current && isConnected) {
      socketRef.current.emit('sendMessage', {
        username: user?.full_name || user?.email?.split('@')[0] || 'Anonymous',
        message
      });
      setNewMessage('');
    }
  };

  // Scroll to bottom of chat
  useEffect(() => {
    if (chatMessagesRef.current) {
      chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
    }
  }, [messages]);

  // Format timestamp
  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Copy OBS settings to clipboard
  const copyOBSSettings = () => {
    const obsSettings = `Server: rtmp://161.97.65.21/live
Stream Key: ${defaultStreamKey}

NOTE: Gunakan Direct IP karena Cloudflare tidak support RTMP.
HLS untuk penonton tetap pakai: https://live.deluwang.online/hls/${defaultStreamKey}/index.m3u8`;

    navigator.clipboard.writeText(obsSettings).then(() => {
      alert('✅ Settings copied to clipboard!\n\n' + obsSettings);
    }).catch(err => {
      console.error('Failed to copy:', err);
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

            <div className="flex items-center gap-4">
              {/* Viewer Count */}
              <div className="flex items-center gap-2 bg-gray-800 px-3 py-2 rounded-lg">
                <Eye size={16} />
                <span className="text-sm">{viewerCount} viewers</span>
              </div>

              {/* Connection Status */}
              <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${isConnected ? 'bg-green-900/50 text-green-400' : 'bg-red-900/50 text-red-400'}`}>
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'} animate-pulse`} />
                <span className="text-sm">{isConnected ? 'Chat Connected' : 'Chat Disconnected'}</span>
              </div>
            </div>
          </div>

          {/* Viewer Control Buttons */}
          <div className="flex flex-wrap gap-3 mt-4">
            <Button
              onClick={refreshStream}
              variant="outline"
              className="border-gray-600 text-white hover:bg-gray-800"
              disabled={isLoading}
            >
              <RefreshCw size={16} className={`mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh Stream
            </Button>
            {streamStatus.isLive && (
              <Button
                onClick={toggleFullscreen}
                variant="outline"
                className="border-gray-600 text-white hover:bg-gray-800"
              >
                <Maximize2 size={16} className="mr-2" />
                Fullscreen
              </Button>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Video Player Section */}
          <div className="lg:col-span-2">
            <Card className="bg-gray-900 border-gray-800">
              <CardContent className="p-0">
                <div className="video-container relative">
                  {/* Video Player */}
                  <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                    <video
                      ref={videoRef}
                      className="w-full h-full"
                      controls
                      muted={isMuted}
                      playsInline
                    />

                    {/* Loading Overlay */}
                    {isLoading && (
                      <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                        <div className="text-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mx-auto mb-2"></div>
                          <p className="text-white">Memuat stream...</p>
                        </div>
                      </div>
                    )}

                    {/* Offline Overlay */}
                    {!streamStatus.isLive && !isLoading && (
                      <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
                        <div className="text-center max-w-md mx-auto px-6">
                          <Square size={48} className="text-gray-400 mx-auto mb-4" />
                          <h3 className="text-2xl font-semibold text-white mb-2">🎬 Stream Sedang Offline</h3>
                          <p className="text-gray-400 mb-4">
                            Tidak ada live stream yang sedang berlangsung saat ini.<br/>
                            Refresh halaman atau tunggu streamer memulai siaran.
                          </p>
                          <div className="space-y-3">
                            <Button
                              onClick={refreshStream}
                              className="bg-red-600 hover:bg-red-700 text-white w-full"
                              disabled={isLoading}
                            >
                              <RefreshCw size={16} className={`mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                              {isLoading ? 'Memeriksa...' : 'Periksa Kembali'}
                            </Button>
                            <p className="text-xs text-gray-500">
                              Auto-refresh setiap 30 detik
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Volume Control */}
                    <button
                      onClick={() => setIsMuted(!isMuted)}
                      className="absolute bottom-4 right-4 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full"
                    >
                      {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                    </button>
                  </div>
                </div>

                {/* Stream Info */}
                <div className="p-4 border-t border-gray-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-white">Live Stream - Deluwang</h3>
                      <p className="text-sm text-gray-400">
                        Channel: <code className="bg-gray-800 px-2 py-1 rounded text-xs">{defaultStreamKey}</code>
                      </p>
                    </div>
                    {streamStatus.isLive && (
                      <div className="text-red-500 text-sm font-medium flex items-center gap-1">
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                        LIVE NOW
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Chat Section */}
          <div className="lg:col-span-1">
            <Card className="bg-gray-900 border-gray-800 h-[600px] flex flex-col">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <MessageCircle size={18} />
                  Live Chat
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col p-0">
                {/* Messages Container */}
                <div
                  ref={chatMessagesRef}
                  className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[400px]"
                >
                  {messages.map((msg) => (
                    <div key={msg.id} className="bg-gray-800 rounded-lg p-3">
                      <div className="flex items-start gap-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-sm text-red-400">
                              {msg.username}
                            </span>
                            <span className="text-xs text-gray-500">
                              {formatTime(msg.timestamp)}
                            </span>
                          </div>
                          <p className="text-white text-sm break-words">{msg.message}</p>
                        </div>
                      </div>
                    </div>
                  ))}

                  {messages.length === 1 && (
                    <div className="text-center text-gray-400 py-8">
                      <MessageCircle size={48} className="mx-auto mb-4 opacity-50" />
                      <p>Belum ada pesan. Jadilah yang pertama!</p>
                    </div>
                  )}
                </div>

                {/* Chat Input */}
                <div className="border-t border-gray-800 p-4">
                  <div className="flex gap-2">
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Ketik pesan..."
                      onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                      className="bg-gray-800 border-gray-700 text-white placeholder-gray-400 flex-1"
                      maxLength={200}
                      disabled={!isConnected}
                    />
                    <Button
                      onClick={sendMessage}
                      size="icon"
                      className="bg-red-600 hover:bg-red-700 text-white"
                      disabled={!isConnected || !newMessage.trim()}
                    >
                      <Send size={16} />
                    </Button>
                  </div>
                  {!isConnected && (
                    <p className="text-xs text-red-400 mt-2">Chat terputus. Silakan refresh halaman.</p>
                  )}
                </div>
              </CardContent>
            </Card>
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