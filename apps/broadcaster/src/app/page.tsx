'use client';

import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

interface BroadcastEvent {
  id: string;
  title: string;
  description?: string;
  scheduled_time: string;
  category: string;
  chat_enabled: boolean;
  status: 'SCHEDULED' | 'LIVE' | 'ENDED' | 'CANCELLED';
  stream_key: string;
  rtmp_url: string;
  playback_url: string;
  thumbnail_url?: string;
  backdrop_url?: string;
  ticket_price?: number | string;
  created_at: string;
}

interface ChatMessage {
  id: string;
  username: string;
  message: string;
  is_host_message: boolean;
  created_at: string;
}

interface BroadcastEditForm {
  title: string;
  description: string;
  category: string;
  scheduled_time: string;
  chat_enabled: boolean;
  ticket_price: string;
  stream_key: string;
  rtmp_url: string;
  playback_url: string;
  thumbnail_url: string;
  backdrop_url: string;
}

export default function BroadcasterPage() {
  const [broadcasts, setBroadcasts] = useState<BroadcastEvent[]>([]);
  const [currentBroadcast, setCurrentBroadcast] = useState<BroadcastEvent | null>(null);
  const [loading, setLoading] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [chatEnabled, setChatEnabled] = useState(true);
  const [eventImage, setEventImage] = useState<File | null>(null);
  const [eventImagePreview, setEventImagePreview] = useState('');
  const [ticketPrice, setTicketPrice] = useState('0');
  const [editEventImage, setEditEventImage] = useState<File | null>(null);
  const [editEventImagePreview, setEditEventImagePreview] = useState('');
  const [editForm, setEditForm] = useState<BroadcastEditForm>({
    title: '',
    description: '',
    category: '',
    scheduled_time: '',
    chat_enabled: true,
    ticket_price: '0',
    stream_key: '',
    rtmp_url: '',
    playback_url: '',
    thumbnail_url: '',
    backdrop_url: '',
  });

  // Chat state
  const [chatInput, setChatInput] = useState('');
  const [socket, setSocket] = useState<any>(null);
  const [showStreamKey, setShowStreamKey] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3002';
  const apiOrigin = API_URL.replace(/\/api\/?$/, '');

  const resolveAssetUrl = (url?: string) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    return `${apiOrigin}${url.startsWith('/') ? url : `/${url}`}`;
  };

  const formatDateTimeLocal = (date?: string) => {
    if (!date) return '';
    const parsed = new Date(date);
    if (Number.isNaN(parsed.getTime())) return '';
    const offset = parsed.getTimezoneOffset();
    const localDate = new Date(parsed.getTime() - offset * 60000);
    return localDate.toISOString().slice(0, 16);
  };

  // Fetch broadcasts on load
  useEffect(() => {
    fetchBroadcasts();
  }, []);

  useEffect(() => {
    if (!currentBroadcast) return;

    setEditForm({
      title: currentBroadcast.title || '',
      description: currentBroadcast.description || '',
      category: currentBroadcast.category || '',
      scheduled_time: formatDateTimeLocal(currentBroadcast.scheduled_time),
      chat_enabled: currentBroadcast.chat_enabled,
      ticket_price: String(Number(currentBroadcast.ticket_price || 0)),
      stream_key: currentBroadcast.stream_key || '',
      rtmp_url: currentBroadcast.rtmp_url || '',
      playback_url: currentBroadcast.playback_url || '',
      thumbnail_url: currentBroadcast.thumbnail_url || '',
      backdrop_url: currentBroadcast.backdrop_url || '',
    });
    setEditEventImage(null);
    setEditEventImagePreview('');
  }, [currentBroadcast]);

  // WebSocket connection
  useEffect(() => {
    const wsPath = WS_URL.includes('/ws') ? '/ws' : '/socket.io/';
    const wsBaseUrl = WS_URL.replace('/ws', '');

    const socketInstance = io(wsBaseUrl, {
      transports: ['websocket', 'polling'],
      path: wsPath,
    });

    socketInstance.on('connect', () => {
      console.log('Connected to chat WebSocket');
    });

    socketInstance.on('recent-messages', (messages: ChatMessage[]) => {
      setChatMessages(messages);
    });

    socketInstance.on('chat-message', (message: ChatMessage) => {
      setChatMessages((prev) => [...prev, message]);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  // Auto-scroll chat to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // Join broadcast room when current broadcast changes
  useEffect(() => {
    if (socket && currentBroadcast) {
      socket.emit('leave-broadcast', currentBroadcast.id);
      socket.emit('join-broadcast', currentBroadcast.id);
    }
  }, [socket, currentBroadcast]);

  const fetchBroadcasts = async () => {
    try {
      const response = await fetch(`${API_URL}/api/broadcasts`);
      const data = await response.json();
      setBroadcasts(data);
    } catch (error) {
      console.error('Error fetching broadcasts:', error);
    }
  };

  const uploadEventImage = async (file: File | null) => {
    if (!file) return undefined;

    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_URL}/api/upload?type=broadcast`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to upload broadcast image');
    }

    const result = await response.json();
    return result.data?.url as string | undefined;
  };

  const createBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const uploadedImageUrl = await uploadEventImage(eventImage);

      const response = await fetch(`${API_URL}/api/broadcasts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          category,
          chat_enabled: chatEnabled,
          thumbnail_url: uploadedImageUrl,
          backdrop_url: uploadedImageUrl,
          ticket_price: Math.max(0, Number(ticketPrice) || 0),
        }),
      });

      if (response.ok) {
        const newBroadcast = await response.json();
        setBroadcasts([newBroadcast, ...broadcasts]);
        setCurrentBroadcast(newBroadcast);

        // Reset form
        setTitle('');
        setDescription('');
        setCategory('');
        setChatEnabled(true);
        setEventImage(null);
        setEventImagePreview('');
        setTicketPrice('0');

        alert('Broadcast created successfully!');
      } else {
        throw new Error('Failed to create broadcast');
      }
    } catch (error) {
      console.error('Error creating broadcast:', error);
      alert('Error creating broadcast');
    } finally {
      setLoading(false);
    }
  };

  const updateBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentBroadcast) return;

    setLoading(true);

    try {
      const uploadedImageUrl = await uploadEventImage(editEventImage);
      const thumbnailUrl = uploadedImageUrl || editForm.thumbnail_url || undefined;
      const backdropUrl = uploadedImageUrl || editForm.backdrop_url || thumbnailUrl;

      const response = await fetch(`${API_URL}/api/broadcasts/${currentBroadcast.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editForm.title,
          description: editForm.description,
          category: editForm.category,
          scheduled_time: editForm.scheduled_time
            ? new Date(editForm.scheduled_time).toISOString()
            : undefined,
          chat_enabled: editForm.chat_enabled,
          ticket_price: Math.max(0, Number(editForm.ticket_price) || 0),
          stream_key: editForm.stream_key,
          rtmp_url: editForm.rtmp_url,
          playback_url: editForm.playback_url,
          thumbnail_url: thumbnailUrl,
          backdrop_url: backdropUrl,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update broadcast');
      }

      const updated = await response.json();
      setCurrentBroadcast(updated);
      setBroadcasts((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
      setEditEventImage(null);
      setEditEventImagePreview('');
      alert('Broadcast updated successfully!');
    } catch (error) {
      console.error('Error updating broadcast:', error);
      alert('Error updating broadcast');
    } finally {
      setLoading(false);
    }
  };

  const deleteBroadcast = async (broadcast: BroadcastEvent) => {
    const confirmed = window.confirm(`Delete broadcast "${broadcast.title}"? Event ini akan hilang dari web dan aplikasi.`);
    if (!confirmed) return;

    try {
      const response = await fetch(`${API_URL}/api/broadcasts/${broadcast.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete broadcast');
      }

      setBroadcasts((prev) => prev.filter((item) => item.id !== broadcast.id));
      if (currentBroadcast?.id === broadcast.id) {
        setCurrentBroadcast(null);
        setChatMessages([]);
      }
    } catch (error) {
      console.error('Error deleting broadcast:', error);
      alert('Error deleting broadcast');
    }
  };

  const updateStatus = async (status: 'LIVE' | 'ENDED' | 'CANCELLED') => {
    if (!currentBroadcast) return;

    try {
      const response = await fetch(`${API_URL}/api/broadcasts/${currentBroadcast.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        const updated = await response.json();
        setCurrentBroadcast(updated);

        // Update in list
        setBroadcasts(broadcasts.map((b) => (b.id === updated.id ? updated : b)));
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Error updating status');
    }
  };

  const sendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !currentBroadcast || !socket) return;

    const messageData = {
      broadcast_id: currentBroadcast.id,
      username: 'Host',
      message: chatInput,
      is_host_message: true,
    };

    socket.emit('send-chat', messageData);
    setChatInput('');
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold mb-2">🎥 Live Broadcaster</h1>
          <p className="text-gray-400">Manage live streams and interact with viewers</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel - Create Broadcast */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Create New Broadcast</h2>

              <form onSubmit={createBroadcast} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Title *</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Category *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                    required
                  >
                    <option value="">Select category</option>
                    <option value="Sports">Sports</option>
                    <option value="Music">Music</option>
                    <option value="Education">Education</option>
                    <option value="Gaming">Gaming</option>
                    <option value="News">News</option>
                    <option value="Entertainment">Entertainment</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Event Image</label>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      setEventImage(file);
                      setEventImagePreview(file ? URL.createObjectURL(file) : '');
                    }}
                    className="w-full px-3 py-2 bg-gray-700 rounded border border-gray-600 focus:border-blue-500 focus:outline-none text-sm"
                  />
                  {eventImagePreview && (
                    <img
                      src={eventImagePreview}
                      alt="Event preview"
                      className="mt-3 h-32 w-full rounded object-cover border border-gray-700"
                    />
                  )}
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="chatEnabled"
                    checked={chatEnabled}
                    onChange={(e) => setChatEnabled(e.target.checked)}
                    className="mr-2"
                  />
                  <label htmlFor="chatEnabled" className="text-sm">Enable Live Chat</label>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Ticket Price (Rp)</label>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    value={ticketPrice}
                    onChange={(e) => setTicketPrice(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                    placeholder="0 untuk gratis"
                  />
                  <p className="mt-1 text-xs text-gray-400">Isi 0 jika broadcast gratis.</p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 py-2 px-4 rounded font-medium"
                >
                  {loading ? 'Creating...' : 'Create Broadcast'}
                </button>
              </form>
            </div>

            {/* Broadcast List */}
            <div className="bg-gray-800 rounded-lg p-6 mt-6">
              <h2 className="text-xl font-semibold mb-4">Your Broadcasts</h2>
              <div className="space-y-2">
                {broadcasts.map((broadcast) => (
                  <div
                    key={broadcast.id}
                    onClick={() => setCurrentBroadcast(broadcast)}
                    className={`p-3 rounded cursor-pointer transition ${
                      currentBroadcast?.id === broadcast.id
                        ? 'bg-blue-600 border border-blue-500'
                        : 'bg-gray-700 hover:bg-gray-600'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {broadcast.thumbnail_url ? (
                        <img
                          src={resolveAssetUrl(broadcast.thumbnail_url)}
                          alt={broadcast.title}
                          className="h-14 w-20 flex-shrink-0 rounded object-cover bg-gray-900"
                        />
                      ) : (
                        <div className="h-14 w-20 flex-shrink-0 rounded bg-gray-900 flex items-center justify-center text-gray-500 text-xs">
                          No image
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="font-medium truncate">{broadcast.title}</div>
                        <div className="text-sm text-gray-300 truncate">{broadcast.category}</div>
                        <div className="text-xs text-gray-400">
                          {Number(broadcast.ticket_price || 0) > 0
                            ? `Rp ${Number(broadcast.ticket_price).toLocaleString('id-ID')}`
                            : 'Free'}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <div className={`px-2 py-1 rounded text-xs ${
                          broadcast.status === 'LIVE' ? 'bg-red-600' :
                          broadcast.status === 'ENDED' ? 'bg-gray-600' :
                          'bg-yellow-600'
                        }`}>
                          {broadcast.status}
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteBroadcast(broadcast);
                          }}
                          className="rounded bg-red-600/20 px-2 py-1 text-xs text-red-200 hover:bg-red-600/40"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Center Panel - Stream Info */}
          <div className="lg:col-span-1">
            {currentBroadcast ? (
              <div className="bg-gray-800 rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Broadcast Detail & Edit</h2>

                <form onSubmit={updateBroadcast} className="space-y-4">
                  {(editEventImagePreview || currentBroadcast.thumbnail_url) && (
                    <img
                      src={editEventImagePreview || resolveAssetUrl(currentBroadcast.thumbnail_url)}
                      alt={currentBroadcast.title}
                      className="h-44 w-full rounded-lg object-cover border border-gray-700"
                    />
                  )}

                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-400">Status</label>
                    <div className={`inline-block px-3 py-1 rounded text-sm font-medium ${
                      currentBroadcast.status === 'LIVE' ? 'bg-red-600' :
                      currentBroadcast.status === 'ENDED' ? 'bg-gray-600' :
                      'bg-yellow-600'
                    }`}>
                      {currentBroadcast.status}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Title</label>
                    <input
                      type="text"
                      value={editForm.title}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, title: e.target.value }))}
                      className="w-full px-3 py-2 bg-gray-700 rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Description</label>
                    <textarea
                      value={editForm.description}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, description: e.target.value }))}
                      className="w-full px-3 py-2 bg-gray-700 rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                      rows={3}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Category</label>
                    <select
                      value={editForm.category}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, category: e.target.value }))}
                      className="w-full px-3 py-2 bg-gray-700 rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                      required
                    >
                      <option value="">Select category</option>
                      <option value="Sports">Sports</option>
                      <option value="Music">Music</option>
                      <option value="Education">Education</option>
                      <option value="Gaming">Gaming</option>
                      <option value="News">News</option>
                      <option value="Entertainment">Entertainment</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Scheduled Time</label>
                    <input
                      type="datetime-local"
                      value={editForm.scheduled_time}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, scheduled_time: e.target.value }))}
                      className="w-full px-3 py-2 bg-gray-700 rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Event Image</label>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null;
                        setEditEventImage(file);
                        setEditEventImagePreview(file ? URL.createObjectURL(file) : '');
                      }}
                      className="w-full px-3 py-2 bg-gray-700 rounded border border-gray-600 focus:border-blue-500 focus:outline-none text-sm"
                    />
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="editChatEnabled"
                      checked={editForm.chat_enabled}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, chat_enabled: e.target.checked }))}
                      className="mr-2"
                    />
                    <label htmlFor="editChatEnabled" className="text-sm">Enable Live Chat</label>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Ticket Price (Rp)</label>
                    <input
                      type="number"
                      min="0"
                      step="1000"
                      value={editForm.ticket_price}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, ticket_price: e.target.value }))}
                      className="w-full px-3 py-2 bg-gray-700 rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-400">RTMP URL</label>
                    <textarea
                      value={editForm.rtmp_url}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, rtmp_url: e.target.value }))}
                      className="w-full px-3 py-2 bg-gray-900 rounded border border-gray-600 focus:border-blue-500 focus:outline-none font-mono text-sm"
                      rows={3}
                    />
                    <button
                      type="button"
                      onClick={() => copyToClipboard(editForm.rtmp_url)}
                      className="mt-2 text-sm text-blue-400 hover:text-blue-300"
                    >
                      📋 Copy RTMP URL
                    </button>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-400">Playback URL</label>
                    <textarea
                      value={editForm.playback_url}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, playback_url: e.target.value }))}
                      className="w-full px-3 py-2 bg-gray-900 rounded border border-gray-600 focus:border-blue-500 focus:outline-none font-mono text-sm"
                      rows={3}
                    />
                    <button
                      type="button"
                      onClick={() => copyToClipboard(editForm.playback_url)}
                      className="mt-2 text-sm text-blue-400 hover:text-blue-300"
                    >
                      📋 Copy Playback URL
                    </button>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-400">Stream Key</label>
                    <div className="bg-gray-900 p-3 rounded border border-gray-600">
                      <textarea
                        value={showStreamKey ? editForm.stream_key : '•••••••••••••••••••••••••••••••••••••••••'}
                        onChange={(e) => {
                          if (!showStreamKey) return;
                          setEditForm((prev) => ({ ...prev, stream_key: e.target.value }));
                        }}
                        readOnly={!showStreamKey}
                        className="w-full bg-transparent focus:outline-none font-mono text-sm resize-none"
                        rows={3}
                      />
                      <div className="mt-2 flex gap-3 text-sm">
                        <button
                          type="button"
                          onClick={() => setShowStreamKey(!showStreamKey)}
                          className="text-blue-400 hover:text-blue-300"
                        >
                          {showStreamKey ? '🙈 Hide' : '👁️ Show'}
                        </button>
                        {showStreamKey && (
                          <button
                            type="button"
                            onClick={() => copyToClipboard(editForm.stream_key)}
                            className="text-blue-400 hover:text-blue-300"
                          >
                            📋 Copy
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 py-2 px-4 rounded font-medium"
                  >
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>

                  <div className="border-t border-gray-700 pt-4">
                    <h3 className="font-medium mb-2">⚡ Quick Start with OBS:</h3>
                    <ol className="text-sm text-gray-300 space-y-1 list-decimal list-inside">
                      <li>Copy RTMP URL & Stream Key above</li>
                      <li>Open OBS Studio</li>
                      <li>Settings → Stream</li>
                      <li>Select Service: Custom</li>
                      <li>Paste RTMP URL to Server</li>
                      <li>Paste Stream Key to Stream Key</li>
                      <li>Click "Start Streaming"</li>
                    </ol>
                  </div>

                  <div className="flex gap-2">
                    {currentBroadcast.status !== 'LIVE' && (
                      <button
                        type="button"
                        onClick={() => updateStatus('LIVE')}
                        className="flex-1 bg-red-600 hover:bg-red-700 py-2 px-4 rounded font-medium"
                      >
                        🔴 Go Live
                      </button>
                    )}
                    {currentBroadcast.status === 'LIVE' && (
                      <button
                        type="button"
                        onClick={() => updateStatus('ENDED')}
                        className="flex-1 bg-gray-600 hover:bg-gray-700 py-2 px-4 rounded font-medium"
                      >
                        ⏹️ End Stream
                      </button>
                    )}
                  </div>
                </form>
              </div>
            ) : (
              <div className="bg-gray-800 rounded-lg p-6 text-center text-gray-400">
                Select or create a broadcast to see details
              </div>
            )}
          </div>

          {/* Right Panel - Live Chat */}
          <div className="lg:col-span-1">
            {currentBroadcast && currentBroadcast.chat_enabled ? (
              <div className="bg-gray-800 rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">💬 Live Chat</h2>

                <div className="mb-4 text-sm text-gray-400">
                  Chat enabled - Viewers can send messages
                </div>

                <div className="h-96 overflow-y-auto mb-4 space-y-2">
                  {chatMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`p-2 rounded ${msg.is_host_message ? 'bg-blue-900 border border-blue-700' : 'bg-gray-700'}`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">
                          {msg.username}
                        </span>
                        {msg.is_host_message && (
                          <span className="text-xs bg-red-600 px-1 py-0.5 rounded">HOST</span>
                        )}
                      </div>
                      <div className="text-sm">{msg.message}</div>
                      <div className="text-xs text-gray-400 mt-1">
                        {new Date(msg.created_at).toLocaleTimeString()}
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                <form onSubmit={sendChat} className="flex gap-2">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 px-3 py-2 bg-gray-700 rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded"
                  >
                    Send
                  </button>
                </form>
              </div>
            ) : (
              <div className="bg-gray-800 rounded-lg p-6 text-center text-gray-400">
                {currentBroadcast
                  ? 'Chat is disabled for this broadcast'
                  : 'Select a broadcast to view chat'}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
