/**
 * Live Chat Component - WebSocket-based chat for live broadcasts
 *
 * Matches Android mobile app behavior:
 *   - Connects to SOCKET_URL/api.smashstream.id
 *   - Events: join-broadcast, recent-messages, chat-message
 *   - ChatMessage shape: { id, broadcast_id, username, message, is_host_message, created_at }
 *
 * On TV, chat is read-only (typing via remote is painful).
 * Users can send messages via mobile app.
 */
import { useEffect, useRef, useState } from 'react';
import { liveService, type ChatMessage } from '@/services';
import { ChatIcon, SendIcon, WifiIcon, WifiOffIcon, ErrorIcon } from '@/components/icons';
import { COLORS, THEME } from '@/constants';

interface LiveChatProps {
  broadcastId: string;
  initialViewerCount?: number;
  onClose: () => void;
}

export function LiveChat({
  broadcastId,
  initialViewerCount = 0,
  onClose,
}: LiveChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [viewerCount] = useState(initialViewerCount);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!broadcastId) return;

    // Wire up listeners BEFORE connect so we don't miss events
    const handleRecent = (msgs: ChatMessage[]) => {
      setMessages(msgs);
      setTimeout(scrollToBottom, 100);
    };
    const handleMessage = (msg: ChatMessage) => {
      setMessages((prev) => [...prev.slice(-200), msg]);
      setTimeout(scrollToBottom, 100);
    };
    const handleConnection = (connected: boolean) => setIsConnected(connected);
    const handleError = (err: string) => setConnectionError(err);

    liveService.onRecentMessages(handleRecent);
    liveService.onMessage(handleMessage);
    liveService.onConnectionChange(handleConnection);
    liveService.onError(handleError);

    // Connect to broadcast room
    liveService.connect(broadcastId);

    return () => {
      liveService.disconnect();
    };
  }, [broadcastId]);

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  const formatTime = (timestamp: string) => {
    try {
      const d = new Date(timestamp);
      return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        background: COLORS.warmCharcoal[100],
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: `${THEME.spacing.md}px ${THEME.spacing.lg}px`,
          borderBottom: `1px solid ${COLORS.warmCharcoal[50]}`,
          background: COLORS.warmCharcoal[50],
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: THEME.spacing.sm }}>
          <ChatIcon size={28} color={COLORS.cream[50]} />
          <span
            style={{
              color: COLORS.cream[50],
              fontSize: 20,
              fontWeight: THEME.typography.fontWeight.semibold,
            }}
          >
            Live Chat
          </span>
        </div>

        {/* Connection status */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '4px 10px',
            borderRadius: 12,
            background: isConnected ? COLORS.green[500] + '20' : COLORS.red[500] + '20',
          }}
        >
          {isConnected ? (
            <>
              <WifiIcon size={16} color={COLORS.green[500]} />
              <span style={{ color: COLORS.green[500], fontSize: 14, fontWeight: '600' }}>
                Connected
              </span>
            </>
          ) : (
            <>
              <WifiOffIcon size={16} color={COLORS.red[500]} />
              <span style={{ color: COLORS.red[500], fontSize: 14, fontWeight: '600' }}>
                Offline
              </span>
            </>
          )}
        </div>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: THEME.spacing.md,
          display: 'flex',
          flexDirection: 'column',
          gap: THEME.spacing.sm,
        }}
      >
        {connectionError ? (
          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              padding: 32,
            }}
          >
            <ErrorIcon size={48} color={COLORS.red[500]} />
            <div
              style={{
                color: COLORS.cream[50],
                fontSize: 20,
                fontWeight: '600',
                marginTop: 16,
              }}
            >
              Chat Unavailable
            </div>
            <div style={{ color: COLORS.cream[200], fontSize: 16, marginTop: 8 }}>
              {connectionError}
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              padding: 32,
            }}
          >
            <ChatIcon size={48} color={COLORS.cream[200]} />
            <div
              style={{
                color: COLORS.cream[50],
                fontSize: 20,
                fontWeight: '600',
                marginTop: 16,
              }}
            >
              No messages yet
            </div>
            <div style={{ color: COLORS.cream[200], fontSize: 16, marginTop: 8 }}>
              {isConnected
                ? 'Chat akan muncul di sini saat penonton lain mengirim pesan'
                : 'Menghubungkan ke chat server...'}
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              style={{
                background: COLORS.warmCharcoal[200] + '80',
                borderRadius: THEME.borderRadius.md,
                padding: `${THEME.spacing.sm}px ${THEME.spacing.md}px`,
                borderLeft: msg.is_host_message
                  ? `3px solid ${COLORS.yellow[400]}`
                  : 'none',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 4,
                  gap: THEME.spacing.sm,
                }}
              >
                <span
                  style={{
                    color: msg.is_host_message ? COLORS.yellow[400] : COLORS.blue[500],
                    fontSize: 16,
                    fontWeight: THEME.typography.fontWeight.semibold,
                  }}
                >
                  {msg.is_host_message && (
                    <span
                      style={{
                        background: COLORS.yellow[400],
                        color: COLORS.warmCharcoal[100],
                        padding: '2px 6px',
                        borderRadius: 4,
                        fontSize: 11,
                        fontWeight: 'bold',
                        marginRight: 6,
                      }}
                    >
                      HOST
                    </span>
                  )}
                  {msg.username}
                </span>
                <span style={{ color: COLORS.cream[200], fontSize: 14 }}>
                  {formatTime(msg.created_at)}
                </span>
              </div>
              <div style={{ color: COLORS.cream[50], fontSize: 16, lineHeight: 1.4, wordBreak: 'break-word' }}>
                {msg.message}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer (TV = read-only notice) */}
      <div
        style={{
          padding: `${THEME.spacing.md}px ${THEME.spacing.lg}px`,
          borderTop: `1px solid ${COLORS.warmCharcoal[50]}`,
          background: COLORS.warmCharcoal[50],
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: THEME.spacing.sm,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: THEME.spacing.xs,
            color: COLORS.cream[200],
            fontSize: 14,
          }}
        >
          <SendIcon size={16} color={COLORS.cream[200]} />
          <span>Untuk mengirim chat, gunakan aplikasi mobile</span>
        </div>
        <button
          onClick={onClose}
          style={{
            background: 'transparent',
            border: 'none',
            color: COLORS.cream[200],
            fontSize: 24,
            cursor: 'pointer',
            padding: '0 8px',
            lineHeight: 1,
          }}
          aria-label="Tutup chat"
        >
          ×
        </button>
      </div>
    </div>
  );
}

export default LiveChat;
