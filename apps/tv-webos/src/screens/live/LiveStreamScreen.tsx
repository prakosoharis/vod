/**
 * Live Stream Screen - plays broadcast stream + optional live chat
 */
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { TVVideoPlayer } from '@/components/video/TVVideoPlayer';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { LiveChat } from '@/components/live/LiveChat';
import { broadcastService } from '@/services';
import { Focusable } from '@/components/Focusable';
import { BackIcon } from '@/components/icons';
import { COLORS, THEME } from '@/constants';

export function LiveStreamScreen() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [showChat, setShowChat] = useState(true);

  const { data: broadcast, isLoading } = useQuery({
    queryKey: ['broadcast', id],
    queryFn: () => broadcastService.getBroadcastById(id!),
    enabled: !!id,
  });

  if (isLoading || !broadcast) {
    return <LoadingSpinner label="Memuat live stream..." />;
  }

  if (Number(broadcast.ticket_price || 0) > 0) {
    return (
      <div
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
          background: COLORS.warmCharcoal[100],
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 64,
        }}
      >
        <div
          style={{
            background: COLORS.warmCharcoal[50],
            border: `2px solid ${COLORS.accent[500]}`,
            borderRadius: 16,
            padding: 40,
            maxWidth: 760,
            textAlign: 'center',
          }}
        >
          <h1 style={{ color: COLORS.cream[50], fontSize: 40, margin: 0, marginBottom: 16 }}>
            Tiket Diperlukan
          </h1>
          <p style={{ color: COLORS.cream[100], fontSize: 24, lineHeight: 1.5, marginBottom: 20 }}>
            Live event ini membutuhkan tiket seharga Rp {Number(broadcast.ticket_price).toLocaleString('id-ID')}.
          </p>
          <p style={{ color: COLORS.accent[400], fontSize: 24, lineHeight: 1.5, margin: 0 }}>
            Silakan beli tiket melalui smashstream.id atau aplikasi Android, lalu buka kembali event ini.
          </p>
        </div>
        <Focusable focusKey="live-ticket-back" onEnter={() => navigate(-1)} focusScale={1.05}>
          <button
            style={{
              marginTop: 32,
              padding: '16px 32px',
              background: COLORS.accent[500],
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              fontSize: 22,
              fontWeight: 'bold',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <BackIcon size={24} color="#fff" />
            Kembali
          </button>
        </Focusable>
      </div>
    );
  }

  if (!broadcast.playback_url) {
    return (
      <div
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
          background: COLORS.warmCharcoal[100],
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 64,
        }}
      >
        <div
          style={{
            background: COLORS.warning + '20',
            border: `2px solid ${COLORS.warning}`,
            borderRadius: 16,
            padding: 40,
            textAlign: 'center',
          }}
        >
          <h1 style={{ color: COLORS.warning, fontSize: 40, margin: 0, marginBottom: 16 }}>
            Stream Belum Dimulai
          </h1>
          <p style={{ color: COLORS.cream[100], fontSize: 24, marginBottom: 24 }}>
            Live event ini dijadwalkan pada:
          </p>
          <p style={{ color: COLORS.accent[400], fontSize: 28, fontWeight: 'bold', marginBottom: 32 }}>
            {new Date(broadcast.scheduled_time).toLocaleString('id-ID', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>
        <Focusable focusKey="live-back" onEnter={() => navigate(-1)} focusScale={1.05}>
          <button
            style={{
              marginTop: 32,
              padding: '16px 32px',
              background: COLORS.accent[500],
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              fontSize: 22,
              fontWeight: 'bold',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <BackIcon size={24} color="#fff" />
            Kembali
          </button>
        </Focusable>
      </div>
    );
  }

  return (
    <div style={{ position: 'absolute', top: 0,
          right: 0,
          bottom: 0,
          left: 0, background: '#000', display: 'flex' }}>
      {/* Video player (takes most of screen) */}
      <div style={{ flex: 1, position: 'relative' }}>
        <TVVideoPlayer
          source={broadcast.playback_url}
          title={`🔴 ${broadcast.title}`}
          onBack={() => navigate(-1)}
        />
      </div>

      {/* Live chat (right side panel) */}
      {showChat && broadcast.chat_enabled && (
        <div
          style={{
            width: 480,
            background: COLORS.warmCharcoal[200],
            borderLeft: `1px solid ${COLORS.warmCharcoal[50]}`,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <LiveChat
            broadcastId={broadcast.id}
            initialViewerCount={broadcast.viewer_count || 0}
            onClose={() => setShowChat(false)}
          />
        </div>
      )}
    </div>
  );
}

export default LiveStreamScreen;
