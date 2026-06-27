/**
 * Live Service - WebSocket chat for live broadcasts
 *
 * Matches Android mobile app's socket events:
 *   - join-broadcast (when connecting to a broadcast room)
 *   - leave-broadcast (when leaving)
 *   - send-chat (to send a message)
 *   - chat-message (incoming new message)
 *   - recent-messages (initial batch of messages on join)
 */
import { io, Socket } from 'socket.io-client';
import { SOCKET_URL } from '../constants';

export interface ChatMessage {
  id: string;
  broadcast_id: string;
  username: string;
  message: string;
  is_host_message: boolean;
  created_at: string;
}

export interface StreamData {
  id: string;
  title: string;
  description?: string;
  thumbnail_url: string;
  stream_url: string;
  is_live: boolean;
  viewer_count: number;
  created_at: string;
}

type MessageListener = (messages: ChatMessage[]) => void;
type SingleMessageListener = (message: ChatMessage) => void;
type ConnectionListener = (isConnected: boolean) => void;
type ErrorListener = (error: string) => void;

class LiveService {
  private socket: Socket | null = null;
  private currentBroadcastId: string | null = null;
  private messageListeners: SingleMessageListener[] = [];
  private recentMessagesListeners: MessageListener[] = [];
  private connectionListeners: ConnectionListener[] = [];
  private errorListeners: ErrorListener[] = [];

  connect(broadcastId: string) {
    if (this.socket) {
      this.disconnect();
    }

    this.currentBroadcastId = broadcastId;

    try {
      this.socket = io(SOCKET_URL, {
        path: '/ws/socket.io/',
        transports: ['websocket', 'polling'],
        secure: SOCKET_URL.startsWith('https'),
        rejectUnauthorized: false,
        timeout: 10000,
        reconnection: true,
        reconnectionAttempts: 3,
        reconnectionDelay: 1000,
        forceNew: true,
        autoConnect: true,
      });
    } catch (e) {
      console.error('Failed to create socket:', e);
      this.notifyError('Unable to create socket connection');
      return;
    }

    this.socket.on('connect', () => {
      console.log('✅ [LiveService] Connected to', SOCKET_URL);
      this.notifyConnection(true);
      this.socket?.emit('join-broadcast', broadcastId);
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ [LiveService] Disconnected:', reason);
      this.notifyConnection(false);
    });

    // Initial batch of recent messages when joining a broadcast
    this.socket.on('recent-messages', (messages: ChatMessage[]) => {
      console.log(`[LiveService] Received ${messages?.length || 0} recent messages`);
      this.recentMessagesListeners.forEach((l) => l(messages || []));
    });

    // New incoming message
    this.socket.on('chat-message', (message: ChatMessage) => {
      this.messageListeners.forEach((l) => l(message));
    });

    this.socket.on('connect_error', (error: any) => {
      console.error('❌ [LiveService] Connection error:', error?.message || error);
      this.notifyConnection(false);
      this.notifyError(error?.message || 'Failed to connect to chat server');
    });

    this.socket.io.on('reconnect_failed', () => {
      console.error('❌ [LiveService] Reconnection failed');
      this.notifyError('Unable to connect to chat server');
    });
  }

  disconnect() {
    if (this.socket && this.currentBroadcastId) {
      try {
        this.socket.emit('leave-broadcast', this.currentBroadcastId);
      } catch (e) {
        // ignore
      }
    }
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.currentBroadcastId = null;
    this.messageListeners = [];
    this.recentMessagesListeners = [];
    this.connectionListeners = [];
    this.errorListeners = [];
  }

  /**
   * Send a chat message to the current broadcast
   */
  sendMessage(message: string, username: string) {
    if (!this.socket || !this.socket.connected || !this.currentBroadcastId) {
      console.warn('Cannot send message: socket not connected');
      return false;
    }
    this.socket.emit('send-chat', {
      broadcast_id: this.currentBroadcastId,
      username,
      message: message.trim(),
      is_host_message: false,
    });
    return true;
  }

  // Listeners
  onMessage(callback: SingleMessageListener) {
    this.messageListeners.push(callback);
  }

  onRecentMessages(callback: MessageListener) {
    this.recentMessagesListeners.push(callback);
  }

  onConnectionChange(callback: ConnectionListener) {
    this.connectionListeners.push(callback);
  }

  onError(callback: ErrorListener) {
    this.errorListeners.push(callback);
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  private notifyConnection(isConnected: boolean) {
    this.connectionListeners.forEach((l) => l(isConnected));
  }

  private notifyError(error: string) {
    this.errorListeners.forEach((l) => l(error));
  }
}

export const liveService = new LiveService();
