/**
 * Live Screen - shows live broadcasts and scheduled events
 */
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Sidebar } from '@/components/Sidebar';
import { ContentRow } from '@/components/ContentRow';
import { Focusable } from '@/components/Focusable';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { LiveIcon } from '@/components/icons';
import { broadcastService, type BroadcastEvent } from '@/services';
import { setFocus } from '@/lib/spatialNavigation';
import { COLORS, THEME } from '@/constants';

export function LiveScreen() {
  const navigate = useNavigate();

  const { data: broadcasts, isLoading } = useQuery({
    queryKey: ['broadcasts', 'all'],
    queryFn: () => broadcastService.getBroadcasts(),
    refetchInterval: 30000, // refresh every 30s to update live status
  });

  useEffect(() => {
    setTimeout(() => setFocus('live-first'), 300);
  }, []);

  const liveNow = (broadcasts || []).filter((b) => b.status === 'LIVE');
  const scheduled = (broadcasts || []).filter((b) => b.status === 'SCHEDULED');
  const ended = (broadcasts || []).filter((b) => b.status === 'ENDED');

  const handleSelect = (event: BroadcastEvent) => {
    navigate(`/live-stream/${event.id}`);
  };

  return (
    <div style={{ position: 'absolute', top: 0,
          right: 0,
          bottom: 0,
          left: 0, background: COLORS.warmCharcoal[100] }}>
      <Sidebar activeKey="live" />

      <div
        style={{
          position: 'absolute',
          left: 320,
          top: 0,
          right: 0,
          bottom: 0,
          overflowY: 'auto',
          padding: `${THEME.spacing.xxl}px ${THEME.spacing.xxxl}px`,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: THEME.spacing.md,
            marginBottom: THEME.spacing.xxl,
          }}
        >
          <LiveIcon size={48} color={COLORS.error} />
          <h1
            style={{
              color: COLORS.cream[50],
              fontSize: THEME.typography.fontSize.xxxl,
              fontWeight: THEME.typography.fontWeight.bold,
              margin: 0,
            }}
          >
            Live Streaming
          </h1>
        </div>

        {isLoading ? (
          <LoadingSpinner label="Memuat live streams..." fullScreen={false} />
        ) : !broadcasts || broadcasts.length === 0 ? (
          <div
            style={{
              padding: THEME.spacing.xxxl,
              textAlign: 'center',
              color: COLORS.cream[200],
              fontSize: 24,
            }}
          >
            Belum ada live streaming saat ini
          </div>
        ) : (
          <>
            {/* Live Now Section */}
            {liveNow.length > 0 && (
              <section style={{ marginBottom: THEME.spacing.xxl }}>
                <h2
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    color: COLORS.cream[50],
                    fontSize: THEME.typography.fontSize.xxl,
                    fontWeight: THEME.typography.fontWeight.bold,
                    margin: 0,
                    marginBottom: THEME.spacing.md,
                  }}
                >
                  <div
                    className="live-pulse"
                    style={{
                      background: COLORS.error,
                      color: '#fff',
                      padding: '6px 16px',
                      borderRadius: 6,
                      fontSize: 16,
                      fontWeight: 'bold',
                      letterSpacing: 1,
                    }}
                  >
                    ● LIVE NOW
                  </div>
                </h2>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(420px, 1fr))',
                    gap: THEME.spacing.md,
                  }}
                >
                  {liveNow.map((event, idx) => (
                    <Focusable
                      key={event.id}
                      focusKey={idx === 0 ? 'live-first' : `live-${event.id}`}
                      onEnter={() => handleSelect(event)}
                      focusScale={1.05}
                      row={idx}
                    >
                      <div
                        style={{
                          background: COLORS.warmCharcoal[200],
                          borderRadius: THEME.borderRadius.lg,
                          overflow: 'hidden',
                          cursor: 'pointer',
                          border: `2px solid ${COLORS.error}`,
                        }}
                      >
                        <div
                          style={{
                            position: 'relative',
                            width: '100%',
                            height: 240,
                            background: `linear-gradient(135deg, ${COLORS.error}40 0%, ${COLORS.warmCharcoal[300]} 100%)`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          {event.thumbnail_url && (
                            <img
                              src={event.thumbnail_url}
                              alt={event.title}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                          )}
                          <div
                            style={{
                              position: 'absolute',
                              top: 12,
                              left: 12,
                              background: COLORS.error,
                              color: '#fff',
                              padding: '6px 14px',
                              borderRadius: 6,
                              fontSize: 14,
                              fontWeight: 'bold',
                              letterSpacing: 1,
                            }}
                            className="live-pulse"
                          >
                            ● LIVE
                          </div>
                          <div
                            style={{
                              position: 'absolute',
                              top: 12,
                              right: 12,
                              background: 'rgba(0,0,0,0.7)',
                              color: '#fff',
                              padding: '6px 14px',
                              borderRadius: 6,
                              fontSize: 14,
                              fontWeight: 'bold',
                            }}
                          >
                            {event.viewer_count || 0} viewers
                          </div>
                        </div>
                        <div style={{ padding: 20 }}>
                          <div
                            className="text-truncate"
                            style={{
                              color: COLORS.cream[50],
                              fontSize: 22,
                              fontWeight: 'bold',
                              marginBottom: 4,
                            }}
                          >
                            {event.title}
                          </div>
                          {event.description && (
                            <div
                              className="text-truncate-2"
                              style={{
                                color: COLORS.cream[200],
                                fontSize: 16,
                              }}
                            >
                              {event.description}
                            </div>
                          )}
                        </div>
                      </div>
                    </Focusable>
                  ))}
                </div>
              </section>
            )}

            {/* Scheduled */}
            {scheduled.length > 0 && (
              <section style={{ marginBottom: THEME.spacing.xxl }}>
                <h2
                  style={{
                    color: COLORS.cream[50],
                    fontSize: THEME.typography.fontSize.xxl,
                    fontWeight: THEME.typography.fontWeight.bold,
                    margin: 0,
                    marginBottom: THEME.spacing.md,
                  }}
                >
                  Akan Datang
                </h2>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(420px, 1fr))',
                    gap: THEME.spacing.md,
                  }}
                >
                  {scheduled.map((event) => (
                    <Focusable
                      key={event.id}
                      focusKey={`live-scheduled-${event.id}`}
                      onEnter={() => handleSelect(event)}
                      focusScale={1.05}
                    >
                      <div
                        style={{
                          background: COLORS.warmCharcoal[200],
                          borderRadius: THEME.borderRadius.lg,
                          overflow: 'hidden',
                          cursor: 'pointer',
                        }}
                      >
                        <div
                          style={{
                            position: 'relative',
                            width: '100%',
                            height: 240,
                            background: COLORS.warmCharcoal[300],
                          }}
                        >
                          {event.thumbnail_url && (
                            <img
                              src={event.thumbnail_url}
                              alt={event.title}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                          )}
                          <div
                            style={{
                              position: 'absolute',
                              bottom: 0,
                              left: 0,
                              right: 0,
                              padding: 16,
                              background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)',
                            }}
                          >
                            <div style={{ color: COLORS.warning, fontSize: 14, fontWeight: 'bold', marginBottom: 4 }}>
                              📅 {new Date(event.scheduled_time).toLocaleString('id-ID', {
                                day: 'numeric',
                                month: 'long',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </div>
                          </div>
                        </div>
                        <div style={{ padding: 20 }}>
                          <div
                            className="text-truncate"
                            style={{
                              color: COLORS.cream[50],
                              fontSize: 22,
                              fontWeight: 'bold',
                              marginBottom: 4,
                            }}
                          >
                            {event.title}
                          </div>
                          {event.category && (
                            <div style={{ color: COLORS.accent[400], fontSize: 16 }}>
                              {event.category}
                            </div>
                          )}
                        </div>
                      </div>
                    </Focusable>
                  ))}
                </div>
              </section>
            )}

            {/* Ended (VOD replays) */}
            {ended.length > 0 && (
              <section>
                <h2
                  style={{
                    color: COLORS.cream[100],
                    fontSize: THEME.typography.fontSize.xxl,
                    fontWeight: THEME.typography.fontWeight.bold,
                    margin: 0,
                    marginBottom: THEME.spacing.md,
                  }}
                >
                  Selesai (Tayangan Ulang)
                </h2>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(420px, 1fr))',
                    gap: THEME.spacing.md,
                  }}
                >
                  {ended.slice(0, 8).map((event) => (
                    <Focusable
                      key={event.id}
                      focusKey={`live-ended-${event.id}`}
                      onEnter={() => handleSelect(event)}
                      focusScale={1.05}
                    >
                      <div
                        style={{
                          background: COLORS.warmCharcoal[200],
                          borderRadius: THEME.borderRadius.lg,
                          overflow: 'hidden',
                          cursor: 'pointer',
                          opacity: 0.85,
                        }}
                      >
                        <div
                          style={{
                            position: 'relative',
                            width: '100%',
                            height: 200,
                            background: COLORS.warmCharcoal[300],
                          }}
                        >
                          {event.thumbnail_url && (
                            <img
                              src={event.thumbnail_url}
                              alt={event.title}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                          )}
                          <div
                            style={{
                              position: 'absolute',
                              top: 12,
                              left: 12,
                              background: COLORS.warmCharcoal[400],
                              color: COLORS.cream[50],
                              padding: '6px 14px',
                              borderRadius: 6,
                              fontSize: 14,
                              fontWeight: 'bold',
                            }}
                          >
                            SELESAI
                          </div>
                        </div>
                        <div style={{ padding: 16 }}>
                          <div className="text-truncate" style={{ color: COLORS.cream[100], fontSize: 20, fontWeight: 'bold' }}>
                            {event.title}
                          </div>
                        </div>
                      </div>
                    </Focusable>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default LiveScreen;
