import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { broadcastService } from '../services/broadcastService';

interface ChatMessage {
  broadcast_id: string;
  username: string;
  message: string;
  is_host_message: boolean;
  created_at: Date;
}

export class ChatWebSocket {
  private io: SocketIOServer;
  private httpServer: ReturnType<typeof createServer>;

  constructor() {
    this.httpServer = createServer();
    this.io = new SocketIOServer(this.httpServer, {
      cors: {
        origin: '*',
        methods: ['GET', 'POST'],
      },
    });
  }

  start(port: number = 3002) {
    this.io.on('connection', (socket) => {
      console.log('⚡ Client connected to chat WebSocket:', socket.id);

      // Join broadcast room
      socket.on('join-broadcast', (broadcastId: string) => {
        socket.join(`broadcast:${broadcastId}`);
        console.log(`📺 Socket ${socket.id} joined broadcast: ${broadcastId}`);

        // Send recent chat messages
        this.loadRecentMessages(broadcastId, socket);
      });

      // Leave broadcast room
      socket.on('leave-broadcast', (broadcastId: string) => {
        socket.leave(`broadcast:${broadcastId}`);
        console.log(`📺 Socket ${socket.id} left broadcast: ${broadcastId}`);
      });

      // Receive chat message
      socket.on('send-chat', async (data: ChatMessage) => {
        try {
          // Save to database
          const chatMessage = await broadcastService.createChatMessage(
            data.broadcast_id,
            data.username,
            data.message,
            data.is_host_message
          );

          // Broadcast to all clients in the room
          this.io.to(`broadcast:${data.broadcast_id}`).emit('chat-message', {
            id: chatMessage.id,
            broadcast_id: chatMessage.broadcast_id,
            username: chatMessage.username,
            message: chatMessage.message,
            is_host_message: chatMessage.is_host_message,
            created_at: chatMessage.created_at,
          });

          console.log(`💬 Chat saved and broadcasted to broadcast: ${data.broadcast_id}`);
        } catch (error: any) {
          console.error('Error saving chat message:', error);
          socket.emit('chat-error', { error: error.message });
        }
      });

      // Typing indicator (optional, untuk UX lebih baik)
      socket.on('typing', (data: { broadcast_id: string; username: string }) => {
        socket.to(`broadcast:${data.broadcast_id}`).emit('user-typing', {
          username: data.username,
        });
      });

      // Disconnect
      socket.on('disconnect', () => {
        console.log('⚡ Client disconnected from chat WebSocket:', socket.id);
      });
    });

    this.httpServer.listen(port, () => {
      console.log(`🔌 Chat WebSocket server listening on port ${port}`);
    });
  }

  private async loadRecentMessages(broadcastId: string, socket: any) {
    try {
      const messages = await broadcastService.getChatMessages(broadcastId, 20);
      socket.emit('recent-messages', messages);
    } catch (error) {
      console.error('Error loading recent messages:', error);
    }
  }

  // Method to send notification (optional - untuk update status dll)
  notifyBroadcastStatus(broadcastId: string, status: string) {
    this.io.to(`broadcast:${broadcastId}`).emit('broadcast-status-update', {
      broadcast_id: broadcastId,
      status,
      timestamp: new Date(),
    });
  }

  getInstance() {
    return this.io;
  }
}

// Singleton instance
let chatWebSocket: ChatWebSocket | null = null;

export function getChatWebSocket(): ChatWebSocket {
  if (!chatWebSocket) {
    chatWebSocket = new ChatWebSocket();
  }
  return chatWebSocket;
}
