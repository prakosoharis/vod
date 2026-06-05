import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
import Hls from 'hls.js';
import Layout from '@/components/layout/Layout';
import { useAuthStore } from '@/stores/authStore';
import {
  Radio,
  Send,
  Wifi,
  WifiOff,
  Users,
  ArrowLeft,
  MessageCircle,
  Tag,
  Clock,
  Calendar,
  Volume2,
  VolumeX,
  Maximize2,
  Monitor,
  RefreshCw,
} from 'lucide-react';

interface BroadcastEvent {
  id: string;
  title: string;
  description?: string;
  scheduled_time: string;
  category: string;
  chat_enabled: boolean;
  status: 'SCHEDULED' | 'LIVE' | 'ENDED' | 'CANCELLED';
  playback_url: string;
  viewer_count: number;
  started_at?: string;
  ended_at?: string;
  created_at: string;
}

interface ChatMessage {
  id: string;
  broadcast_id: string;
  username: string;
  message: string;
  is_host_message: boolean;
  created_at: string;
}

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';
const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:3002';

const LiveBroadcastPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [broadcast, setBroadcast] = useState<BroadcastEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Chat state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatConnected, setIsChatConnected] = useState(false);
  const [typingUser, setTypingUser] = useState<string | null>(null);

  // Video state
  const [isMuted, setIsMuted] = useState(true);

  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fetch broadcast data
  useEffect(() => {
    if (!id) return;
    fetchBroadcast();
  }, [id]);

  const fetchBroadcast = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_URL}/broadcasts/${id}`);
      if (!response.ok) {
        throw new Error('Broadcast tidak ditemukan');
      }
      const data = await response.json();
      setBroadcast(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Initialize HLS player
  useEffect(() => {
    if (!broadcast || !videoRef.current) return;

    const playbackUrl = broadcast.playback_url;
    if (!playbackUrl) return;

    // Only play if LIVE or ENDED
    if (broadcast.status !== 'LIVE' && broadcast.status !== 'ENDED') return;

    // Clean up previous instance
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: broadcast.status === 'LIVE',
        backBufferLength: 90,
        maxLoadingDelay: 4,
        maxMaxBufferLength: 30,
        maxBufferSize: 60 * 1000 * 1000,
      });

      hlsRef.current = hls;

      hls.loadSource(playbackUrl);
      hls.attachMedia(videoRef.current);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        videoRef.current?.play().catch(() => {});
      });

      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (
          data.type === Hls.ErrorTypes.NETWORK_ERROR ||
          data.type === Hls.ErrorTypes.MEDIA_ERROR
        ) {
          return;
        }
        console.warn('HLS Error:', data.details);
      });
    } else if (videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
      // Safari native HLS
      videoRef.current.src = playbackUrl;
      videoRef.current.play().catch(() => {});
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [broadcast?.id, broadcast?.status, broadcast?.playback_url]);

  // WebSocket chat connection
  useEffect(() => {
    if (!id) return;

    const socket = io(WS_URL, {
      transports: ['websocket', 'polling'],
    });

    socket.on('connect', () => {
      console.log('Connected to chat server');
      setIsChatConnected(true);
      socket.emit('join-broadcast', id);
    });

    socket.on('disconnect', () => {
      setIsChatConnected(false);
    });

    socket.on('connect_error', () => {
      setIsChatConnected(false);
    });

    socket.on('recent-messages', (messages: ChatMessage[]) => {
      setChatMessages(messages);
    });

    socket.on('chat-message', (message: ChatMessage) => {
      setChatMessages((prev) => [...prev, message]);
    });

    socket.on('user-typing', (data: { username: string }) => {
      setTypingUser(data.username);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      typingTimeoutRef.current = setTimeout(() => {
        setTypingUser(null);
      }, 3000);
    });

    socket.on('chat-error', (data: { error: string }) => {
      console.error('Chat error:', data.error);
    });

    socketRef.current = socket;

    return () => {
      socket.emit('leave-broadcast', id);
      socket.disconnect();
      socketRef.current = null;
    };
  }, [id]);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const sendChat = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!chatInput.trim() || !socketRef.current || !isChatConnected || !id) return;

      const username = user?.full_name || user?.email?.split('@')[0] || 'Viewer';

      socketRef.current.emit('send-chat', {
        broadcast_id: id,
        username,
        message: chatInput.trim(),
        is_host_message: false,
      });

      socketRef.current.emit('typing', { broadcast_id: id, username });
      setChatInput('');
    },
    [chatInput, isChatConnected, id, user]
  );

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const toggleFullscreen = () => {
    if (videoRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        videoRef.current.requestFullscreen();
      }
    }
  };

  const togglePiP = async () => {
    if (videoRef.current) {
      try {
        if (document.pictureInPictureElement) {
          await document.exitPictureInPicture();
        } else {
          await videoRef.current.requestPictureInPicture();
        }
      } catch {}
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'LIVE':
        return 'text-red-400';
      case 'SCHEDULED':
        return 'text-yellow-400';
      case 'ENDED':
        return 'text-gray-400';
      default:
        return 'text-gray-500';
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-[#0f0f0f] pt-24 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="animate-pulse space-y-6">
              <div className="h-8 w-32 bg-white/10 rounded" />
              <div className="aspect-video bg-white/5 rounded-2xl" />
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !broadcast) {
    return (
      <Layout>
        <div className="min-h-screen bg-[#0f0f0f] pt-24 px-6">
          <div className="max-w-7xl mx-auto text-center py-20">
            <h2 className="text-2xl font-bold text-white mb-4">{error || 'Broadcast tidak ditemukan'}</h2>
            <button
              onClick={() => navigate('/live-events')}
              className="px-6 py-3 bg-white text-black rounded-xl font-medium hover:bg-white/90 transition"
            >
              Kembali ke Live Events
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-[#0f0f0f] pt-6 pb-16">
        <div className="max-w-7xl mx-auto px-6">
          {/* Back button */}
          <button
            onClick={() => navigate('/live-events')}
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition mb-6 text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Live Events
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content - Video + Info */}
            <div className="lg:col-span-2 space-y-6">
              {/* Video Player */}
              <div className="relative aspect-video bg-black rounded-2xl overflow-hidden">
                {/* Live badge */}
                {broadcast.status === 'LIVE' && (
                  <div className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-red-600 text-white px-3 py-1.5 rounded-lg text-sm font-bold">
                    <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                    LIVE
                  </div>
                )}

                {/* Viewer count */}
                {broadcast.status === 'LIVE' && (
                  <div className="absolute top-4 right-4 z-10 flex items-center gap-2 bg-black/60 text-white px-3 py-1.5 rounded-lg text-sm">
                    <Users className="w-4 h-4" />
                    {broadcast.viewer_count}
                  </div>
                )}

                <video
                  ref={videoRef}
                  className="w-full h-full object-contain"
                  playsInline
                  muted={isMuted}
                />

                {/* Video controls */}
                {(broadcast.status === 'LIVE' || broadcast.status === 'ENDED') && (
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                    <div className="flex items-center gap-2">
                      <button onClick={toggleMute} className="p-2 text-white hover:bg-white/20 rounded-lg transition">
                        {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                      </button>
                      <button onClick={toggleFullscreen} className="p-2 text-white hover:bg-white/20 rounded-lg transition">
                        <Maximize2 className="w-5 h-5" />
                      </button>
                      <button onClick={togglePiP} className="p-2 text-white hover:bg-white/20 rounded-lg transition">
                        <Monitor className="w-5 h-5" />
                      </button>
                      <div className="flex-1" />
                      <button onClick={fetchBroadcast} className="p-2 text-white hover:bg-white/20 rounded-lg transition">
                        <RefreshCw className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Stream not live overlay */}
                {broadcast.status === 'SCHEDULED' && (
                  <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                    <div className="text-center">
                      <Clock className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
                      <h3 className="text-xl font-bold text-white mb-2">Belum Dimulai</h3>
                      <p className="text-gray-400">
                        {formatDate(broadcast.scheduled_time)} - {new Date(broadcast.scheduled_time).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                )}

                {/* Stream ended overlay */}
                {broadcast.status === 'ENDED' && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center pointer-events-none">
                    <div className="text-center">
                      <h3 className="text-lg font-medium text-white/80">Siaran telah berakhir</h3>
                    </div>
                  </div>
                )}
              </div>

              {/* Broadcast Info */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h1 className="text-2xl font-bold text-white">{broadcast.title}</h1>
                    <div className="flex items-center gap-4 mt-2">
                      <span className={`text-sm font-semibold ${getStatusColor(broadcast.status)}`}>
                        {broadcast.status === 'LIVE' && 'Sedang Berlangsung'}
                        {broadcast.status === 'SCHEDULED' && 'Akan Datang'}
                        {broadcast.status === 'ENDED' && 'Siaran Berakhir'}
                      </span>
                      <span className="text-sm text-gray-500 flex items-center gap-1">
                        <Tag className="w-3 h-3" />
                        {broadcast.category}
                      </span>
                    </div>
                  </div>
                </div>

                {broadcast.description && (
                  <p className="text-gray-400 mt-4 leading-relaxed">{broadcast.description}</p>
                )}

                <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-white/10 text-sm text-gray-500">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" />
                    {formatDate(broadcast.scheduled_time)}
                  </div>
                  {broadcast.started_at && (
                    <div className="flex items-center gap-1.5">
                      <Radio className="w-4 h-4" />
                      Dimulai: {new Date(broadcast.started_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  )}
                  <div className="flex items-center gap-1.5">
                    <Users className="w-4 h-4" />
                    {broadcast.viewer_count} viewers
                  </div>
                </div>
              </div>
            </div>

            {/* Chat Panel */}
            <div className="lg:col-span-1">
              <div className="bg-white/5 border border-white/10 rounded-2xl h-[calc(100vh-160px)] flex flex-col overflow-hidden">
                {/* Chat Header */}
                <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageCircle className="w-5 h-5 text-white" />
                    <span className="font-semibold text-white text-sm">Live Chat</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {isChatConnected ? (
                      <div className="flex items-center gap-1 text-green-400">
                        <Wifi className="w-3.5 h-3.5" />
                        <span className="text-xs">Connected</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-red-400">
                        <WifiOff className="w-3.5 h-3.5" />
                        <span className="text-xs">Offline</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Chat Messages */}
                <div className="flex-1 overflow-y-auto px-4 py-3 space-y-1 min-h-0">
                  {!broadcast.chat_enabled ? (
                    <div className="flex items-center justify-center h-full text-gray-500 text-sm">
                      Chat dinonaktifkan
                    </div>
                  ) : chatMessages.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-gray-500 text-sm">
                      Belum ada pesan. Mulai percakapan!
                    </div>
                  ) : (
                    chatMessages.map((msg) => (
                      <div key={msg.id} className="py-1">
                        <div className="flex items-baseline gap-2">
                          <span
                            className={`text-sm font-semibold ${
                              msg.is_host_message ? 'text-yellow-400' : 'text-blue-400'
                            }`}
                          >
                            {msg.is_host_message && '[HOST] '}
                            {msg.username}
                          </span>
                          <span className="text-[10px] text-gray-600">
                            {new Date(msg.created_at).toLocaleTimeString('id-ID', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                        <p className="text-sm text-gray-300 break-words">{msg.message}</p>
                      </div>
                    ))
                  )}
                  <div ref={chatEndRef} />

                  {/* Typing indicator */}
                  {typingUser && (
                    <div className="text-xs text-gray-500 italic pt-1">
                      {typingUser} sedang mengetik...
                    </div>
                  )}
                </div>

                {/* Chat Input */}
                {broadcast.chat_enabled && (
                  <form onSubmit={sendChat} className="px-4 py-3 border-t border-white/10">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        placeholder={
                          isChatConnected ? 'Ketik pesan...' : 'Menghubungkan...'
                        }
                        disabled={!isChatConnected}
                        className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-white/25 disabled:opacity-50 transition"
                        maxLength={500}
                      />
                      <button
                        type="submit"
                        disabled={!isChatConnected || !chatInput.trim()}
                        className="p-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:hover:bg-red-600 text-white rounded-lg transition"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default LiveBroadcastPage;
