import { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { MessageCircle, Send, Wifi, WifiOff } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';

interface ChatMessage {
  id: number;
  username: string;
  message: string;
  timestamp: string;
  userId: string;
}

interface LiveChatProps {
  chatServer: string;
}

const LiveChat: React.FC<LiveChatProps> = ({ chatServer }) => {
  const { user } = useAuthStore();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [viewerCount, setViewerCount] = useState(0);

  const socketRef = useRef<Socket | null>(null);
  const chatMessagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    initializeChat();

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  const initializeChat = () => {
    try {
      socketRef.current = io(chatServer, {
        path: '/socket.io/',
        transports: ['websocket', 'polling'],
        secure: true,
        rejectUnauthorized: false
      });

      socketRef.current.on('connect', () => {
        console.log('Connected to chat server');
        setIsConnected(true);
        socketRef.current?.emit('userInfo', {
          username: user?.full_name || user?.email?.split('@')[0] || 'Anonymous'
        });
      });

      socketRef.current.on('disconnect', () => {
        console.log('Disconnected from chat server');
        setIsConnected(false);
      });

      socketRef.current.on('message', (message: ChatMessage) => {
        setMessages(prev => [...prev, message]);
        setTimeout(() => {
          chatMessagesRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }, 100);
      });

      socketRef.current.on('previousMessages', (previousMessages: ChatMessage[]) => {
        setMessages(previousMessages);
      });

      socketRef.current.on('viewerCount', (count: number) => {
        setViewerCount(count);
      });

      socketRef.current.on('connect_error', (error) => {
        console.error('Failed to connect to chat server:', error);
        setIsConnected(false);
      });

    } catch (error) {
      console.error('Failed to connect to chat server:', error);
      setIsConnected(false);
    }
  };

  const sendMessage = () => {
    if (newMessage.trim() && socketRef.current && isConnected) {
      socketRef.current.emit('message', newMessage.trim());
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
                <span className="text-xs">{viewerCount}</span>
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
                  <span className="font-semibold text-sm text-blue-400 min-w-0">
                    {message.username}
                  </span>
                  <span className="text-xs text-gray-500 flex-shrink-0">
                    {formatTimestamp(message.timestamp)}
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