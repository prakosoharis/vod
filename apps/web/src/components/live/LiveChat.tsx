import { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { MessageCircle, Send, Wifi, WifiOff } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';

interface ChatMessage {
  id: string;
  broadcast_id: string;
  username: string;
  message: string;
  is_host_message: boolean;
  created_at: string;
}

interface LiveChatProps {
  chatServer: string;
  broadcastId: string;
}

const LiveChat: React.FC<LiveChatProps> = ({ chatServer, broadcastId }) => {
  const { user } = useAuthStore();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);

  const socketRef = useRef<Socket | null>(null);
  const chatMessagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    initializeChat();

    return () => {
      if (socketRef.current) {
        socketRef.current.emit('leave-broadcast', broadcastId);
        socketRef.current.disconnect();
      }
    };
  }, [broadcastId]);

  const initializeChat = () => {
    try {
      const wsPath = chatServer.includes('/ws') ? '/ws' : '/socket.io/';
      const wsUrl = chatServer.replace('/ws', '');

      socketRef.current = io(wsUrl, {
        path: wsPath,
        transports: ['websocket', 'polling'],
        secure: true,
        rejectUnauthorized: false
      });

      socketRef.current.on('connect', () => {
        setIsConnected(true);
        socketRef.current?.emit('join-broadcast', broadcastId);
      });

      socketRef.current.on('disconnect', () => {
        setIsConnected(false);
      });

      socketRef.current.on('recent-messages', (previousMessages: ChatMessage[]) => {
        setMessages(previousMessages);
      });

      socketRef.current.on('chat-message', (message: ChatMessage) => {
        setMessages(prev => [...prev, message]);
        setTimeout(() => {
          chatMessagesRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }, 100);
      });

      socketRef.current.on('connect_error', () => {
        setIsConnected(false);
      });

    } catch (error) {
      setIsConnected(false);
    }
  };

  const sendMessage = () => {
    if (newMessage.trim() && socketRef.current && isConnected) {
      const username = user?.full_name || user?.email?.split('@')[0] || 'Anonymous';
      socketRef.current.emit('send-chat', {
        broadcast_id: broadcastId,
        username,
        message: newMessage.trim(),
        is_host_message: false
      });
      setNewMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            Live Chat
          </CardTitle>
          <div className="flex items-center gap-2">
            {isConnected ? (
              <div className="flex items-center gap-1 text-green-500">
                <Wifi className="w-4 h-4" />
                <span className="text-xs">Connected</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-red-500">
                <WifiOff className="w-4 h-4" />
                <span className="text-xs">Offline</span>
              </div>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
        {/* Messages container */}
        <div
          ref={chatMessagesRef}
          className="flex-1 overflow-y-auto px-4 space-y-2 min-h-0"
          style={{ maxHeight: '400px' }}
        >
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No messages yet. Start the conversation!</p>
            </div>
          ) : (
            messages.map((message) => (
              <div key={message.id} className="break-words">
                <div className="flex items-start gap-2">
                  <span className={`font-semibold text-sm min-w-0 ${
                    message.is_host_message ? 'text-yellow-400' : 'text-blue-400'
                  }`}>
                    {message.is_host_message && '[HOST] '}
                    {message.username}
                  </span>
                  <span className="text-xs text-gray-500 flex-shrink-0">
                    {formatTimestamp(message.created_at)}
                  </span>
                </div>
                <p className="text-sm text-gray-300 ml-0 break-words">
                  {message.message}
                </p>
              </div>
            ))
          )}
        </div>

        {/* Message input */}
        <div className="p-4 border-t border-gray-800">
          <div className="flex gap-2">
            <Input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={
                isConnected
                  ? "Type a message..."
                  : "Connecting to chat..."
              }
              disabled={!isConnected}
              className="flex-1 bg-gray-800 border-gray-700 text-white placeholder-gray-500"
              maxLength={500}
            />
            <Button
              onClick={sendMessage}
              disabled={!isConnected || !newMessage.trim()}
              size="icon"
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LiveChat;