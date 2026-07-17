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
  Lock,
  CreditCard,
} from 'lucide-react';
import { paymentService } from '@/services/payment.service';

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
  ticket_price?: number | string;
  thumbnail_url?: string;
  backdrop_url?: string;
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

interface PlaybackStatus {
  available: boolean;
  http_status: number | null;
  checked_at: string;
  message: string;
  playback_url: string;
}

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';
const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:3002';

const LiveBroadcastPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, token, isAuthenticated } = useAuthStore();

  const [broadcast, setBroadcast] = useState<BroadcastEvent | null>(null);
  const [hasAccess, setHasAccess] = useState(false);
  const [accessLoading, setAccessLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [streamMessage, setStreamMessage] = useState<string | null>(null);
  const [playbackStatus, setPlaybackStatus] = useState<PlaybackStatus | null>(null);

  // Chat state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatConnected, setIsChatConnected] = useState(false);
  const [typingUser, setTypingUser] = useState<string | null>(null);

  // Video state
  const [isMuted, setIsMuted] = useState(true);
  const [videoElement, setVideoElement] = useState<HTMLVideoElement | null>(null);

  // Refs
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const setVideoNode = useCallback((node: HTMLVideoElement | null) => {
    videoRef.current = node;
    setVideoElement(node);
  }, []);

  // Fetch broadcast data
  useEffect(() => {
    if (!id) return;
    fetchBroadcast();
    checkAccess();
  }, [id, isAuthenticated]);

  useEffect(() => {
    if (!id) return;

    const interval = window.setInterval(async () => {
      await fetchBroadcast(false);

      if (hasAccess) {
        await fetchPlayerBroadcast(false);
      }

      await fetchPlaybackStatus(false);
    }, 10000);

    return () => window.clearInterval(interval);
  }, [id, hasAccess, token]);

  const fetchBroadcast = async (showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true);
      }
      setError(null);
      const response = await fetch(`${API_URL}/broadcasts/${id}`);
      if (!response.ok) {
        throw new Error('Broadcast tidak ditemukan');
      }
      const data = await response.json();
      setBroadcast(data);
      setStreamMessage(null);
      if (Number(data.ticket_price || 0) <= 0) {
        setHasAccess(true);
        setAccessLoading(false);
      }
      if (data.status === 'LIVE' || data.status === 'ENDED') {
        await fetchPlaybackStatus();
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  };

  const checkAccess = async () => {
    if (!id) return;
    if (!isAuthenticated) {
      setHasAccess(false);
      setAccessLoading(false);
      return;
    }

    try {
      setAccessLoading(true);
      const response = await paymentService.checkBroadcastAccess(id);
      setHasAccess(response.data.has_access);
      if (response.data.has_access) {
        await fetchPlayerBroadcast();
        await fetchPlaybackStatus();
      }
    } catch {
      setHasAccess(false);
    } finally {
      setAccessLoading(false);
    }
  };

  const fetchPlayerBroadcast = async (updateState = true) => {
    if (!id) return null;
    const authToken = token || localStorage.getItem('token');

    const response = await fetch(`${API_URL}/broadcasts/${id}/player`, {
      headers: authToken ? { Authorization: `Bearer ${authToken}` } : undefined,
    });

    if (!response.ok) {
      throw new Error('Akses live event belum tersedia');
    }

    const data = await response.json();
    if (updateState) {
      setBroadcast(data);
      setStreamMessage(null);
    }
    return data;
  };

  const fetchPlaybackStatus = async (updateMessage = true) => {
    if (!id) return null;

    try {
      const response = await fetch(`${API_URL}/broadcasts/${id}/playback-status`);
      if (!response.ok) {
        return null;
      }

      const data: PlaybackStatus = await response.json();
      setPlaybackStatus(data);

      if (
        updateMessage &&
        broadcast &&
        (broadcast.status === 'LIVE' || broadcast.status === 'ENDED') &&
        !data.available
      ) {
        setStreamMessage(
          `Sumber video IVS belum aktif. ${data.message} Pastikan encoder/OBS sedang push ke RTMP URL dan stream key event ini.`
        );
      }

      return data;
    } catch {
      return null;
    }
  };

  const handleBuyTicket = async () => {
    if (!id || !broadcast) return;
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (broadcast.status === 'ENDED' || broadcast.status === 'CANCELLED') {
      setError('Penjualan tiket untuk broadcast ini sudah ditutup');
      return;
    }

    try {
      setPaymentLoading(true);
      const response = await paymentService.buyBroadcastTicket(id);
      paymentService.openMidtransSnap(
        response.data.token,
        async () => {
          navigate(`/payment/success?order_id=${response.data.order_id}`);
        },
        () => {
          navigate(`/payment/error?order_id=${response.data.order_id}`);
        }
      );
    } catch (err: any) {
      setError(err.response?.data?.error || 'Gagal membuat pembayaran tiket');
    } finally {
      setPaymentLoading(false);
    }
  };

  // Initialize HLS player
  useEffect(() => {
    if (!broadcast || !videoElement || !hasAccess) return;

    const playbackUrl = broadcast.playback_url;
    if (!playbackUrl) return;
    const video = videoElement;

    const attemptPlayback = () => {
      video.defaultMuted = true;
      video.muted = true;
      video.playsInline = true;
      const playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch((err) => {
          console.warn('Video autoplay blocked or delayed:', err);
          setStreamMessage('Stream sudah tersedia. Tekan video atau tombol refresh jika playback belum mulai otomatis.');
        });
      }
    };

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
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setStreamMessage(null);
        attemptPlayback();
      });

      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (!data.fatal) {
          return;
        }

        console.warn('HLS Error:', data.details);

        if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
          setStreamMessage(
            playbackStatus?.available === false
              ? `Sumber video IVS belum aktif. ${playbackStatus.message} Pastikan encoder/OBS sedang push ke RTMP URL dan stream key event ini.`
              : 'Stream belum siap atau manifest belum tersedia. Halaman akan mencoba memuat ulang otomatis.'
          );
          hls.startLoad();
          return;
        }

        if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
          setStreamMessage('Stream sedang dipulihkan. Mohon tunggu sebentar.');
          hls.recoverMediaError();
          return;
        }

        setStreamMessage('Player tidak bisa memuat stream saat ini. Coba refresh halaman setelah stream benar-benar LIVE.');
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Safari native HLS
      video.src = playbackUrl;
      attemptPlayback();
    }

    video.addEventListener('loadedmetadata', attemptPlayback);
    video.addEventListener('canplay', attemptPlayback);

    return () => {
      video.removeEventListener('loadedmetadata', attemptPlayback);
      video.removeEventListener('canplay', attemptPlayback);
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [broadcast?.id, broadcast?.status, broadcast?.playback_url, hasAccess, playbackStatus?.available, playbackStatus?.message, videoElement]);

  // WebSocket chat connection
  useEffect(() => {
    if (!id || !hasAccess) return;

    const wsUrl = WS_URL;
    const wsPath = wsUrl.includes('/ws') ? '/ws' : '/socket.io/';

    const socket = io(wsUrl.replace('/ws', ''), {
      transports: ['websocket', 'polling'],
      path: wsPath,
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

    socket.on('broadcast-status-update', async (data: { broadcast_id: string; status: BroadcastEvent['status'] }) => {
      if (data.broadcast_id !== id) return;

      setBroadcast((prev) => (prev ? { ...prev, status: data.status } : prev));

      try {
        await fetchBroadcast(false);
        if (data.status === 'LIVE' || data.status === 'ENDED') {
          await fetchPlayerBroadcast(true);
          await fetchPlaybackStatus();
        }
      } catch (error) {
        console.warn('Failed to refresh broadcast after status update:', error);
      }
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
  }, [id, hasAccess]);

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

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  if (loading || accessLoading) {
    return (
      <Layout>
        <div className="smash-broadcast-loading">
          <div />
          <section />
        </div>
      </Layout>
    );
  }

  if (error || !broadcast) {
    return (
      <Layout>
        <div className="smash-broadcast-state">
          <div>
            <Radio />
            <small>LIVE EVENT</small>
            <h2>{error || 'Broadcast tidak ditemukan'}</h2>
            <p>Event ini mungkin sudah tidak tersedia atau koneksi sedang bermasalah.</p>
            <button className="nusantara-button is-primary" onClick={() => navigate('/live-events')}>
              <ArrowLeft /> Kembali ke Live Events
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  if (!hasAccess) {
    const price = Number(broadcast.ticket_price || 0);
    return (
      <Layout>
        <div
          className="smash-broadcast-paywall"
          style={{ backgroundImage: `url("${broadcast.backdrop_url || broadcast.thumbnail_url || ''}")` }}
        >
          <div className="smash-broadcast-paywall__wash" />
          <button className="smash-broadcast__back" onClick={() => navigate('/live-events')}>
            <ArrowLeft /> Kembali ke Live Events
          </button>
          <article>
            <div className="smash-broadcast-paywall__lock"><Lock /></div>
            <small>AKSES LIVE EVENT</small>
            <h1>{broadcast.title}</h1>
            {broadcast.description && <p>{broadcast.description}</p>}
            <div className="smash-broadcast-paywall__facts">
              <span><Calendar /> {formatDate(broadcast.scheduled_time)}</span>
              <span><Tag /> {broadcast.category}</span>
            </div>
            <aside>
              {price > 0 ? (
                <>
                  <small>TIKET LIVE</small>
                  <h2>Rp{price.toLocaleString('id-ID')}</h2>
                  <p>Satu tiket memberikan akses ke siaran langsung dan live chat event ini.</p>
                  {isAuthenticated ? (
                    broadcast.status === 'ENDED' || broadcast.status === 'CANCELLED' ? (
                      <p>Penjualan tiket untuk event ini sudah ditutup.</p>
                    ) : (
                      <button
                        onClick={handleBuyTicket}
                        disabled={paymentLoading}
                        className="nusantara-button is-primary"
                      >
                        <CreditCard />
                        {paymentLoading ? 'Membuat pembayaran...' : 'Beli Tiket'}
                      </button>
                    )
                  ) : (
                    <button
                      onClick={() => navigate('/login')}
                      className="nusantara-button is-primary"
                    >
                      Login untuk Beli Tiket
                    </button>
                  )}
                </>
              ) : (
                <button
                  onClick={checkAccess}
                  className="nusantara-button is-primary"
                >
                  Masuk ke Event Gratis
                </button>
              )}
            </aside>
          </article>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="smash-broadcast">
        <header className="smash-broadcast__topbar">
          <button className="smash-broadcast__back" onClick={() => navigate('/live-events')}>
            <ArrowLeft /> Kembali ke Live Events
          </button>
          <div>
            <span className={isChatConnected ? 'is-connected' : ''}>
              {isChatConnected ? <Wifi /> : <WifiOff />}
              {isChatConnected ? 'Terhubung' : 'Menghubungkan'}
            </span>
          </div>
        </header>

        <div className="smash-broadcast__layout">
          <main>
            <div className="smash-broadcast__player">
                {broadcast.status === 'LIVE' && (
                  <div className="smash-broadcast__live-badge">
                    <i />
                    LIVE
                  </div>
                )}
                {broadcast.status === 'LIVE' && (
                  <div className="smash-broadcast__viewers">
                    <Users /> {Number(broadcast.viewer_count || 0).toLocaleString('id-ID')}
                  </div>
                )}
                <video
                  ref={setVideoNode}
                  playsInline
                  muted={isMuted}
                  autoPlay
                  controls
                />
                {streamMessage && (
                  <div className="smash-broadcast__stream-message">{streamMessage}</div>
                )}
                {(broadcast.status === 'LIVE' || broadcast.status === 'ENDED') && (
                  <div className="smash-broadcast__controls">
                    <button onClick={toggleMute} aria-label={isMuted ? 'Aktifkan suara' : 'Bisukan'}>
                      {isMuted ? <VolumeX /> : <Volume2 />}
                    </button>
                    <button onClick={toggleFullscreen} aria-label="Layar penuh"><Maximize2 /></button>
                    <button onClick={togglePiP} aria-label="Picture in picture"><Monitor /></button>
                    <button onClick={() => fetchBroadcast()} aria-label="Muat ulang"><RefreshCw /></button>
                  </div>
                )}
                {broadcast.status === 'SCHEDULED' && (
                  <div className="smash-broadcast__status-overlay">
                    <div>
                      <Clock />
                      <small>AKAN DATANG</small>
                      <h3>Siaran belum dimulai</h3>
                      <p>
                        {formatDate(broadcast.scheduled_time)} - {new Date(broadcast.scheduled_time).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                )}
                {broadcast.status === 'ENDED' && (
                  <div className="smash-broadcast__ended">
                    <div><small>EVENT SELESAI</small><h3>Siaran telah berakhir</h3></div>
                  </div>
                )}
            </div>

            <article className="smash-broadcast__info">
              <small>LIVE DARI NUSANTARA · {broadcast.category}</small>
              <h1>{broadcast.title}</h1>
              {broadcast.description && <p>{broadcast.description}</p>}
              <div>
                <span><Calendar /> {formatDate(broadcast.scheduled_time)}</span>
                  {broadcast.started_at && (
                    <span><Radio />
                      Dimulai: {new Date(broadcast.started_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  )}
                <span><Users /> {Number(broadcast.viewer_count || 0).toLocaleString('id-ID')} penonton</span>
              </div>
            </article>
          </main>

          <aside className="smash-chat">
            <header>
              <div><MessageCircle /><span>Live Chat</span></div>
              <div className={isChatConnected ? 'is-connected' : ''}>
                {isChatConnected ? <Wifi /> : <WifiOff />}
                <span>{isChatConnected ? 'Terhubung' : 'Offline'}</span>
              </div>
            </header>

            <div className="smash-chat__messages">
              {!broadcast.chat_enabled ? (
                <div className="smash-chat__empty"><MessageCircle /><p>Chat dinonaktifkan untuk event ini.</p></div>
              ) : chatMessages.length === 0 ? (
                <div className="smash-chat__empty"><MessageCircle /><p>Belum ada pesan.<br />Mulai percakapan!</p></div>
              ) : (
                chatMessages.map((msg) => (
                  <article className={msg.is_host_message ? 'is-host' : ''} key={msg.id}>
                    <div>
                      <b>{msg.is_host_message && 'HOST · '}{msg.username}</b>
                      <time>{new Date(msg.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</time>
                    </div>
                    <p>{msg.message}</p>
                  </article>
                ))
              )}
              <div ref={chatEndRef} />
              {typingUser && <p className="smash-chat__typing">{typingUser} sedang mengetik...</p>}
            </div>

            {broadcast.chat_enabled && (
              <form className="smash-chat__form" onSubmit={sendChat}>
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder={isChatConnected ? 'Tulis pesan...' : 'Menghubungkan...'}
                  disabled={!isChatConnected}
                  maxLength={500}
                />
                <button type="submit" disabled={!isChatConnected || !chatInput.trim()} aria-label="Kirim pesan">
                  <Send />
                </button>
              </form>
            )}
          </aside>
        </div>
      </div>
    </Layout>
  );
};

export default LiveBroadcastPage;
