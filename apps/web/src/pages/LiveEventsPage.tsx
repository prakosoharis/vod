import React, { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { eventService } from '@/services/event.service';
import useLiveStream from '@/hooks/useLiveStream';
import EventRow from '@/components/home/EventRow';
import { Radio, Calendar } from 'lucide-react';
import Layout from '@/components/layout/Layout';

const LiveEventsPage: React.FC = () => {
  const navigate = useNavigate();

  // Live streaming check
  const HLS_URL = (streamKey: string) => `https://live.mostara.id/hls/${streamKey}/index.m3u8`;
  const { streamStatus, checkStreamStatus } = useLiveStream({
    hlsUrl: HLS_URL,
    checkInterval: 30000
  });

  useEffect(() => {
    checkStreamStatus('deluwang-live');
    const interval = setInterval(() => {
      checkStreamStatus('deluwang-live');
    }, 30000);
    return () => clearInterval(interval);
  }, [checkStreamStatus]);

  // Get upcoming events
  const { data: upcomingEvents, isLoading } = useQuery({
    queryKey: ['upcoming-events'],
    queryFn: () => eventService.getUpcomingEvents(20),
  });

  return (
    <Layout>
      <div className="min-h-screen bg-warm-charcoal-100 pt-32 px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-12">
            <Radio className="w-12 h-12 text-accent-500" />
            <div>
              <h1 className="text-5xl font-bold text-cream-50">Live Events</h1>
              <p className="text-xl text-cream-100 mt-2">
                Gala premiere, stand up comedy, dan acara spesial
              </p>
            </div>
          </div>

          {/* Live NOW Banner */}
          {streamStatus.isLive && (
            <div className="mb-16">
              <button
                onClick={() => navigate('/live')}
                className="w-full bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-600 hover:to-accent-700 rounded-2xl p-12 transition-all duration-300 transform hover:scale-[1.02] cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <Radio className="w-16 h-16 text-cream-50 animate-pulse" />
                    <div className="text-left">
                      <span className="inline-block px-4 py-1 bg-cream-50 text-primary-500 rounded-full text-sm font-bold mb-3">
                        LIVE SEKARANG
                      </span>
                      <h2 className="text-4xl font-bold text-cream-50 mb-2">Streaming Sedang Berlangsung</h2>
                      <p className="text-cream-100 text-lg">Klik untuk menonton sekarang</p>
                    </div>
                  </div>
                  <div className="bg-cream-50 text-primary-500 px-10 py-4 rounded-2xl font-bold text-2xl">
                    TONTON
                  </div>
                </div>
              </button>
            </div>
          )}

          {/* Upcoming Events */}
          <div>
            <div className="flex items-center gap-3 mb-8">
              <Calendar className="w-10 h-10 text-accent-500" />
              <h2 className="text-4xl font-bold text-cream-50">Jadwal Mendatang</h2>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-64 bg-warm-charcoal-50 rounded-2xl animate-pulse" />
                ))}
              </div>
            ) : upcomingEvents && upcomingEvents.length > 0 ? (
              <EventRow title="" events={upcomingEvents} />
            ) : (
              <div className="bg-warm-charcoal-50 rounded-2xl p-16 text-center border border-cream-50/10">
                <Calendar className="w-24 h-24 text-accent-400 mx-auto mb-6" />
                <h3 className="text-3xl font-bold text-cream-50 mb-4">
                  Belum Ada Jadwal
                </h3>
                <p className="text-cream-100 text-lg">
                  Event baru akan segera diumumkan. Stay tuned!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default LiveEventsPage;
