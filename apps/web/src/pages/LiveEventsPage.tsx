import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Radio, Calendar, Clock, Users, Play, Filter, Search, Tag, Video } from 'lucide-react';

interface BroadcastEvent {
  id: string;
  title: string;
  description?: string;
  scheduled_time: string;
  category: string;
  chat_enabled: boolean;
  status: 'SCHEDULED' | 'LIVE' | 'ENDED' | 'CANCELLED';
  viewer_count: number;
  started_at?: string;
  ended_at?: string;
  created_at: string;
}

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

const LiveEventsPage: React.FC = () => {
  const navigate = useNavigate();
  const [broadcasts, setBroadcasts] = useState<BroadcastEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'LIVE' | 'SCHEDULED' | 'ENDED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchBroadcasts();
  }, []);

  const fetchBroadcasts = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/broadcasts`);
      const data = await response.json();
      setBroadcasts(data);
    } catch (error) {
      console.error('Error fetching broadcasts:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredBroadcasts = broadcasts.filter((b) => {
    const matchesFilter = activeFilter === 'ALL' || b.status === activeFilter;
    const matchesSearch =
      !searchQuery ||
      b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.description && b.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  const liveBroadcasts = broadcasts.filter((b) => b.status === 'LIVE');
  const scheduledBroadcasts = broadcasts.filter((b) => b.status === 'SCHEDULED');
  const endedBroadcasts = broadcasts.filter((b) => b.status === 'ENDED');

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'LIVE':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-500/20 text-red-400 border border-red-500/30">
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            LIVE
          </span>
        );
      case 'SCHEDULED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
            <Clock className="w-3 h-3" />
            SCHEDULED
          </span>
        );
      case 'ENDED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-gray-500/20 text-gray-400 border border-gray-500/30">
            ENDED
          </span>
        );
      default:
        return null;
    }
  };

  const getCategoryIcon = (category: string) => {
    const colors: Record<string, string> = {
      Sports: 'from-blue-600 to-blue-800',
      Music: 'from-purple-600 to-purple-800',
      Education: 'from-green-600 to-green-800',
      Gaming: 'from-orange-600 to-orange-800',
      Entertainment: 'from-pink-600 to-pink-800',
      Talk: 'from-teal-600 to-teal-800',
    };
    return colors[category] || 'from-gray-600 to-gray-800';
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Layout>
      <div className="min-h-screen bg-[#0f0f0f]">
        {/* Hero Header */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-red-900/30 via-transparent to-purple-900/20" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#0f0f0f]" />
          <div className="relative max-w-7xl mx-auto px-6 pt-32 pb-12">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-red-500/20 rounded-xl border border-red-500/30">
                <Radio className="w-8 h-8 text-red-400" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-white">Live Events</h1>
                <p className="text-gray-400 text-lg mt-1">
                  Tonton siaran langsung, acara spesial, dan konten eksklusif
                </p>
              </div>
            </div>

            {/* Stats */}
            <div className="flex gap-6 mt-8">
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse" />
                <span className="text-red-400 font-semibold">{liveBroadcasts.length}</span> Live Now
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Calendar className="w-4 h-4 text-yellow-400" />
                <span className="text-yellow-400 font-semibold">{scheduledBroadcasts.length}</span> Upcoming
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Video className="w-4 h-4 text-gray-400" />
                <span className="font-semibold">{endedBroadcasts.length}</span> Completed
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 pb-16">
          {/* Live Now Section */}
          {liveBroadcasts.length > 0 && (
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                Sedang Berlangsung
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {liveBroadcasts.map((broadcast) => (
                  <button
                    key={broadcast.id}
                    onClick={() => navigate(`/live/${broadcast.id}`)}
                    className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-red-900/40 to-red-950/60 border border-red-500/20 p-6 text-left transition-all duration-300 hover:border-red-500/50 hover:shadow-lg hover:shadow-red-500/10 hover:scale-[1.02]"
                  >
                    <div className="absolute top-4 right-4">
                      {getStatusBadge(broadcast.status)}
                    </div>
                    <div className="flex items-start gap-4">
                      <div className={`flex-shrink-0 w-14 h-14 rounded-xl bg-gradient-to-br ${getCategoryIcon(broadcast.category)} flex items-center justify-center`}>
                        <Play className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-xl font-bold text-white group-hover:text-red-300 transition-colors truncate">
                          {broadcast.title}
                        </h3>
                        <div className="flex items-center gap-3 mt-2">
                          <span className="inline-flex items-center gap-1 text-sm text-gray-400">
                            <Tag className="w-3.5 h-3.5" />
                            {broadcast.category}
                          </span>
                          <span className="inline-flex items-center gap-1 text-sm text-gray-400">
                            <Users className="w-3.5 h-3.5" />
                            {broadcast.viewer_count} viewers
                          </span>
                        </div>
                        {broadcast.description && (
                          <p className="text-sm text-gray-500 mt-2 line-clamp-2">{broadcast.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="mt-4 flex items-center gap-2 text-red-400 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                      <Play className="w-4 h-4" />
                      Tonton Sekarang
                    </div>
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="Cari broadcast..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-white/25 transition-colors"
              />
            </div>
            <div className="flex gap-2">
              {(['ALL', 'LIVE', 'SCHEDULED', 'ENDED'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    activeFilter === filter
                      ? 'bg-white text-black'
                      : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/10'
                  }`}
                >
                  {filter === 'ALL' ? 'Semua' : filter === 'LIVE' ? 'Live' : filter === 'SCHEDULED' ? 'Akan Datang' : 'Selesai'}
                </button>
              ))}
            </div>
          </div>

          {/* Broadcast Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white/5 rounded-2xl p-6 animate-pulse">
                  <div className="h-5 bg-white/10 rounded w-3/4 mb-3" />
                  <div className="h-4 bg-white/10 rounded w-1/2 mb-4" />
                  <div className="h-3 bg-white/10 rounded w-full mb-2" />
                  <div className="h-3 bg-white/10 rounded w-2/3" />
                </div>
              ))}
            </div>
          ) : filteredBroadcasts.length === 0 ? (
            <div className="text-center py-20">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-white/5 rounded-full mb-6">
                <Filter className="w-10 h-10 text-gray-600" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Tidak ada broadcast ditemukan</h3>
              <p className="text-gray-500">Coba ubah filter atau kata kunci pencarian</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredBroadcasts
                .filter((b) => b.status !== 'LIVE') // Live broadcasts shown above
                .map((broadcast) => (
                  <button
                    key={broadcast.id}
                    onClick={() => navigate(`/live/${broadcast.id}`)}
                    className="group relative overflow-hidden rounded-2xl bg-white/5 border border-white/10 p-5 text-left transition-all duration-300 hover:bg-white/10 hover:border-white/20 hover:scale-[1.02]"
                  >
                    {/* Category gradient bar */}
                    <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${getCategoryIcon(broadcast.category)}`} />

                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className={`flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br ${getCategoryIcon(broadcast.category)} flex items-center justify-center`}>
                        <Video className="w-5 h-5 text-white" />
                      </div>
                      {getStatusBadge(broadcast.status)}
                    </div>

                    <h3 className="text-lg font-semibold text-white group-hover:text-white/90 transition-colors line-clamp-1">
                      {broadcast.title}
                    </h3>

                    <div className="flex items-center gap-3 mt-2 text-sm text-gray-500">
                      <span className="inline-flex items-center gap-1">
                        <Tag className="w-3 h-3" />
                        {broadcast.category}
                      </span>
                    </div>

                    {broadcast.description && (
                      <p className="text-sm text-gray-500 mt-3 line-clamp-2">{broadcast.description}</p>
                    )}

                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/5">
                      <div className="text-xs text-gray-600">
                        <Calendar className="w-3 h-3 inline mr-1" />
                        {formatDate(broadcast.scheduled_time)}
                      </div>
                      <div className="text-xs text-gray-600">
                        <Clock className="w-3 h-3 inline mr-1" />
                        {formatTime(broadcast.scheduled_time)}
                      </div>
                    </div>

                    {broadcast.viewer_count > 0 && (
                      <div className="flex items-center gap-1 mt-2 text-xs text-gray-600">
                        <Users className="w-3 h-3" />
                        {broadcast.viewer_count} viewers
                      </div>
                    )}
                  </button>
                ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default LiveEventsPage;
