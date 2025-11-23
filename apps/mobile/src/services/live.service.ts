import { io, Socket } from 'socket.io-client';
import { SOCKET_URL } from '../constants';

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

export interface ChatMessage {
  id: string;
  user_id: string;
  username: string;
  message: string;
  timestamp: string;
}

export class LiveService {
  private socket: Socket | null = null;
  private messageListeners: ((message: ChatMessage) => void)[] = [];
  private viewerCountListeners: ((count: number) => void)[] = [];

  connect(streamId: string) {
    if (this.socket) {
      this.disconnect();
    }

    this.socket = io(SOCKET_URL, {
      transports: ['websocket'],
      autoConnect: true,
    });

    this.socket.on('connect', () => {
      console.log('Connected to live stream');
      this.socket?.emit('join-stream', { streamId });
    });

    this.socket.on('chat-message', (message: ChatMessage) => {
      this.messageListeners.forEach(listener => listener(message));
    });

    this.socket.on('viewer-count', (count: number) => {
      this.viewerCountListeners.forEach(listener => listener(count));
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from live stream');
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.messageListeners = [];
    this.viewerCountListeners = [];
  }

  sendMessage(message: string, username: string) {
    if (this.socket && this.socket.connected) {
      this.socket.emit('chat-message', {
        message,
        username,
      });
    }
  }

  onMessage(callback: (message: ChatMessage) => void) {
    this.messageListeners.push(callback);
  }

  onViewerCount(callback: (count: number) => void) {
    this.viewerCountListeners.push(callback);
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

export const liveService = new LiveService();