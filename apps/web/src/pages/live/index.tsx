'use client';

import { useState, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { MediaPlayer, PlayerEventType } from 'amazon-ivs-player';

interface BroadcastEvent {
  id: string;
  title: string;
  description?: string;
  scheduled_time: string;
  category: string;
  chat_enabled: boolean;
  status: 'SCHEDULED' | 'LIVE' | 'ENDED' | 'CANCELLED';
  playback_url: string;
  created_at: string;
}

interface ChatMessage {
  id: string;
  username: string;
  message: string;
  is_host_message: boolean;
  created_at: string;
}

export default function LivePage() {
  const [broadcasts, setBroadcasts] = useState<BroadcastEvent[]>([]);
  const [currentBroadcast, setCurrentBroadcast] = useState<BroadcastEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [viewerCount, setViewerCount] = useState(0);

  const playerRef = useRef<any>(null);
  const socketRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3002';

  // Fetch broadcasts
  useEffect(() => {
    fetchBroadcasts();
  }, []);

  // WebSocket connection
  useEffect(() => {
    const socket = io(WS_URL);

    socket.on('connect', () => {
      console.log('Connected to chat WebSocket');
    });

    socket.on('recent-messages', (messages: ChatMessage[]) => {
      setChatMessages(messages);
    });

    socket.on('chat-message', (message: ChatMessage) => {
      setChatMessages((prev) => [...prev, message]);
    });

    socket.on('broadcast-status-update', (data: any) => {
      if (currentBroadcast && data.broadcast_id === currentBroadcast.id) {
        setCurrentBroadcast((prev: any) => ({ ...prev, status: data.status }));
        setBroadcasts((prev: any[]) =>
          prev.map((b: any) => (b.id === data.broadcast_id ? { ...b, status: data.status } : b))
        );
      }
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
    };
  }, []);

  // Auto-scroll chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // Join broadcast room
  useEffect(() => {
    if (socketRef.current && currentBroadcast) {
      socketRef.current.emit('leave-broadcast', currentBroadcast.id);
      socketRef.current.emit('join-broadcast', currentBroadcast.id);
    }
  }, [socketRef, currentBroadcast]);

  // Initialize player
  useEffect(() => {
    if (currentBroadcast && currentBroadcast.status === 'LIVE') {
      initializePlayer();
    }

    return () => {
      if (playerRef.current) {
        playerRef.current.dispose();
        playerRef.current = null;
      }
    };
  }, [currentBroadcast]);

  const fetchBroadcasts = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/broadcasts`);
      const data = await response.json();
      setBroadcasts(data);

      // Auto-select first LIVE broadcast
      const liveBroadcast = data.find((b: BroadcastEvent) => b.status === 'LIVE');
      if (liveBroadcast) {
        setCurrentBroadcast(liveBroadcast);
      }
    } catch (error) {
      console.error('Error fetching broadcasts:', error);
    } finally {
      setLoading(false);
    }
  };

  const initializePlayer = () => {
    if (!currentBroadcast || !currentBroadcast.playback_url) return;

    // Create player
    const player = MediaPlayer.createFrom(currentBroadcast.playback_url);
    playerRef.current = player;

    // Attach player to DOM
    const videoEl = document.getElementById('ivs-player') as HTMLVideoElement;
    if (videoEl) {
      player.attachHTMLVideoElement(videoEl);

      // Setup player events
      player.addEventListener(PlayerEventType.PlayerStateChange, (state) => {
        console.log('Player state:', state);
      });

      player.addEventListener(PlayerEventType.Error, (error) => {
        console.error('Player error:', error);
      });
    }
  };

  const handleSelectBroadcast = (broadcast: BroadcastEvent) => {
    setCurrentBroadcast(broadcast);
  };

  const sendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !socketRef.current || !currentBroadcast) return;

    const messageData = {
      broadcast_id: currentBroadcast.id,
      username: 'Viewer', // Bisa diganti nanti kalau ada auth
      message: chatInput,
      is_host_message: false,
    };

    socketRef.current.emit('send-chat', messageData);
    setChatInput('');
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  // Filter broadcasts by status
  const liveBroadcasts = broadcasts.filter((b) => b.status === 'LIVE');
  const scheduledBroadcasts = broadcasts.filter((b) => b.status === 'SCHEDULED');
  const endedBroadcasts = broadcasts.filter((b) => b.status === 'ENDED');

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold mb-2">🎥 Live Streaming</h1>
          <p className="text-gray-600">Watch live streams and interact with broadcasters</p>
        </header>

        {/* Filters */}
        <div className="mb-6">
          <div className="flex gap-2 border-b border-gray-300">
            <button
              onClick={() => setBroadcasts(broadcasts)}
              className={`px-4 py-2 font-medium ${
                !liveBroadcasts.length && !scheduledBroadcasts.length && !endedBroadcasts.length
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              All ({broadcasts.length})
            </button>
            <button
              onClick={() => setBroadcasts(liveBroadcasts)}
              className={`px-4 py-2 font-medium ${
                liveBroadcasts.length === broadcasts.length
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Live Now ({liveBroadcasts.length})
            </button>
            <button
              onClick={() => setBroadcasts(scheduledBroadcasts)}
              className={`px-4 py-2 font-medium ${
                scheduledBroadcasts.length === broadcasts.length
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Scheduled ({scheduledBroadcasts.length})
            </button>
            <button
              onClick={() => setBroadcasts(endedBroadcasts)}
              className={`px-4 py-2 font-medium ${
                endedBroadcasts.length === broadcasts.length
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Ended ({endedBroadcasts.length})
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left - Broadcast List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Broadcasts</h2>

              {loading ? (
                <div className="text-center py-8 text-gray-500">Loading...</div>
              ) : broadcasts.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No broadcasts yet
                </div>
              ) : (
                <div className="space-y-3">
                  {broadcasts.map((broadcast) => (
                    <div
                      key={broadcast.id}
                      onClick={() => handleSelectBroadcast(broadcast)}
                      className={`p-4 rounded-lg cursor-pointer transition ${
                        currentBroadcast?.id === broadcast.id
                          ? 'bg-blue-600 text-white shadow-lg'
                          : 'bg-gray-100 hover:bg-gray-200'
                      }`}
                    >
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex-1">
                          <h3 className="font-medium">{broadcast.title}</h3>
                          <p className="text-sm opacity-75">{broadcast.category}</p>
                        </div>
                        <div
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            broadcast.status === 'LIVE'
                              ? 'bg-red-600 text-white'
                              : broadcast.status === 'ENDED'
                                ? 'bg-gray-500 text-white'
                                : 'bg-yellow-500 text-white'
                          }`}
                        >
                          {broadcast.status}
                        </div>
                      </div>
                      {broadcast.description && (
                        <p className="text-sm opacity-75">{broadcast.description}</p>
                      )}
                      <div className="text-xs opacity-50 mt-1">
                        {new Date(broadcast.scheduled_time).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Center - Video Player */}
          <div className="lg:col-span-2">
            {currentBroadcast ? (
              <div className="space-y-6">
                {/* Video Player */}
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold">{currentBroadcast.title}</h2>
                    {currentBroadcast.status === 'LIVE' && (
                      <div className="flex items-center gap-2">
                        <span className="inline-block w-3 h-3 bg-red-600 rounded-full animate-pulse"></span>
                        <span className="text-sm font-medium text-red-600">LIVE</span>
                      </div>
                    )}
                  </div>

                  {currentBroadcast.status === 'LIVE' ? (
                    <div>
                      <video
                        id="ivs-player"
                        className="w-full aspect-video bg-black rounded"
                        playsInline
                      />
                      <div className="mt-2 text-sm text-gray-500">
                        Stream is live
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-100 p-8 rounded text-center">
                      <p className="text-gray-500 mb-2">
                        {currentBroadcast.status === 'SCHEDULED'
                          ? `Scheduled: ${new Date(currentBroadcast.scheduled_time).toLocaleString()}`
                          : currentBroadcast.status === 'ENDED'
                            ? 'Stream has ended'
                            : 'Stream not available'
                        }
                      </p>
                    </div>
                  )}

                  {currentBroadcast.description && (
                    <div className="mt-4 p-4 bg-gray-50 rounded">
                      <h3 className="font-medium mb-2">About this stream</h3>
                      <p className="text-sm opacity-75">{currentBroadcast.description}</p>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="font-semibold mb-3">Stream Info</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Category:</span>
                      <span className="font-medium">{currentBroadcast.category}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Chat:</span>
                      <span className="font-medium">
                        {currentBroadcast.chat_enabled ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Started:</span>
                      <span className="font-medium">
                        {currentBroadcast.started_at
                          ? new Date(currentBroadcast.started_at).toLocaleTimeString()
                          : 'Not started'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Viewers:</span>
                      <span className="font-medium">{currentBroadcast.viewer_count}</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow p-12 text-center text-gray-500">
                Select a broadcast to start watching
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
