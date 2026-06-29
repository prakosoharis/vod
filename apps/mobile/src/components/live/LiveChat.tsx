import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from 'react-native';
import { io, Socket } from 'socket.io-client';
import { SafeIcon } from '../ui';
import { COLORS, THEME } from '../../constants';
import { useAuthStore } from '../../store/authStore';

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

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const LiveChat: React.FC<LiveChatProps> = ({ chatServer, broadcastId }) => {
  const { user } = useAuthStore();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  const socketRef = useRef<Socket | null>(null);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    console.log('=== LIVE CHAT INIT ===');
    console.log('Chat server:', chatServer);
    console.log('Broadcast ID:', broadcastId);
    initializeChat();

    return () => {
      if (socketRef.current) {
        socketRef.current.emit('leave-broadcast', broadcastId);
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [broadcastId]);

  const initializeChat = () => {
    try {
      const wsPath = '/socket.io/';

      // Handle URL properly
      let wsUrl = chatServer;
      if (wsUrl.endsWith('/')) {
        wsUrl = wsUrl.slice(0, -1);
      }

      console.log('=== SOCKET CONNECTION ===');
      console.log('WebSocket URL:', wsUrl);
      console.log('WebSocket Path:', wsPath);
      console.log('Trying transports: websocket, polling');

      let socket: Socket | null = null;
      try {
        socket = io(wsUrl, {
          path: wsPath,
          transports: ['websocket', 'polling'],
          secure: wsUrl.startsWith('https'),
          rejectUnauthorized: false,
          timeout: 10000,
          reconnection: true,
          reconnectionAttempts: 3,
          reconnectionDelay: 1000,
          forceNew: true,
        });
      } catch (socketError) {
        console.error('Failed to create socket:', socketError);
        setConnectionError('Unable to create socket connection');
        return;
      }

      if (!socket) {
        console.error('Socket is null after creation');
        setConnectionError('Socket creation failed');
        return;
      }

      socketRef.current = socket;

      socket.on('connect', () => {
        console.log('✅ SOCKET CONNECTED');
        setIsConnected(true);
        setConnectionError(null);
        socket?.emit('join-broadcast', broadcastId);
      });

      socket.on('disconnect', (reason: any) => {
        console.log('❌ SOCKET DISCONNECTED - Reason:', reason);
        setIsConnected(false);
        if (reason === 'transport close') {
          setConnectionError('Connection closed by server');
        } else if (reason === 'ping timeout') {
          setConnectionError('Connection timeout');
        }
      });

      socket.on('recent-messages', (previousMessages: ChatMessage[]) => {
        console.log('=== RECEIVED MESSAGES ===');
        console.log('Message count:', previousMessages.length);
        if (previousMessages.length > 0) {
          console.log('Messages:', JSON.stringify(previousMessages, null, 2));
        }
        setMessages(previousMessages);
        setTimeout(() => scrollToBottom(false), 100);
      });

      socket.on('chat-message', (message: ChatMessage) => {
        console.log('=== NEW CHAT MESSAGE ===');
        console.log('Message:', JSON.stringify(message, null, 2));
        setMessages((prev) => [...prev, message]);
        setTimeout(() => scrollToBottom(true), 100);
      });

      socket.on('connect_error', (error: any) => {
        console.error('❌ SOCKET CONNECTION ERROR:', error);
        console.error('Error details:', error?.message || JSON.stringify(error));
        setIsConnected(false);
        setConnectionError(error?.message || 'Failed to connect to chat server');
      });

      socket.io.on('reconnect_attempt', (attempt: number) => {
        console.log('🔄 Reconnection attempt:', attempt);
      });

      socket.io.on('reconnect_failed', () => {
        console.error('❌ Reconnection failed');
        setConnectionError('Unable to connect to chat server');
      });
    } catch (error) {
      console.error('Chat initialization error:', error);
      setIsConnected(false);
      setConnectionError('Failed to initialize chat');
    }
  };

  const sendMessage = () => {
    if (newMessage.trim() && socketRef.current && isConnected) {
      const username =
        user?.full_name || user?.email?.split('@')[0] || 'Anonymous';
      socketRef.current.emit('send-chat', {
        broadcast_id: broadcastId,
        username,
        message: newMessage.trim(),
        is_host_message: false,
      });
      setNewMessage('');
    }
  };

  const scrollToBottom = (animated: boolean = true) => {
    if (messages.length > 0 && flatListRef.current) {
      flatListRef.current.scrollToEnd({ animated });
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => (
    <View style={styles.messageContainer}>
      <View style={styles.messageHeader}>
        <Text
          style={[
            styles.username,
            item.is_host_message && styles.hostUsername,
          ]}
        >
          {item.is_host_message && '[HOST] '}
          {item.username}
        </Text>
        <Text style={styles.timestamp}>{formatTimestamp(item.created_at)}</Text>
      </View>
      <Text style={styles.messageText}>{item.message}</Text>
    </View>
  );

  const renderEmptyState = () => {
    if (connectionError) {
      return (
        <View style={styles.emptyContainer}>
          <SafeIcon name="error-outline" size={48} color={COLORS.red[500]} />
          <Text style={styles.emptyText}>Chat Unavailable</Text>
          <Text style={styles.emptySubtext}>Unable to connect to chat server</Text>
        </View>
      );
    }
    return (
      <View style={styles.emptyContainer}>
        <SafeIcon name="chat-bubble-outline" size={48} color={COLORS.cream[200]} />
        <Text style={styles.emptyText}>No messages yet.</Text>
        <Text style={styles.emptySubtext}>Start the conversation!</Text>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <SafeIcon name="chat-bubble" size={20} color={COLORS.cream[50]} />
          <Text style={styles.headerTitle}>Live Chat</Text>
        </View>
        <View style={styles.connectionStatus}>
          {isConnected ? (
            <View style={styles.connectedStatus}>
              <SafeIcon name="wifi" size={14} color={COLORS.green[500]} />
              <Text style={styles.connectedText}>Connected</Text>
            </View>
          ) : (
            <View style={styles.disconnectedStatus}>
              <SafeIcon name="wifi-off" size={14} color={COLORS.red[500]} />
              <Text style={styles.disconnectedText}>Offline</Text>
            </View>
          )}
        </View>
      </View>

      {/* Messages List */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={[
          styles.messagesList,
          messages.length === 0 && styles.messagesListEmpty,
        ]}
        showsVerticalScrollIndicator={true}
      />

      {/* Input */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={newMessage}
          onChangeText={setNewMessage}
          placeholder={isConnected ? 'Type a message...' : (connectionError ? 'Chat unavailable' : 'Connecting...')}
          placeholderTextColor={COLORS.cream[200]}
          editable={isConnected}
          maxLength={500}
          multiline
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            (!isConnected || !newMessage.trim()) && styles.sendButtonDisabled,
          ]}
          onPress={sendMessage}
          disabled={!isConnected || !newMessage.trim()}
        >
          <SafeIcon
            name="send"
            size={20}
            color={isConnected && newMessage.trim() ? COLORS.cream[50] : COLORS.cream[200]}
          />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.warmCharcoal[100],
    maxWidth: SCREEN_HEIGHT > 800 ? 400 : 300,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: THEME.spacing.md,
    paddingVertical: THEME.spacing.sm,
    backgroundColor: COLORS.warmCharcoal[50],
    borderBottomWidth: 1,
    borderBottomColor: `${COLORS.cream[200]}20`,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: THEME.spacing.sm,
  },
  headerTitle: {
    fontSize: THEME.typography.fontSize.md,
    fontWeight: THEME.typography.fontWeight.semibold,
    color: COLORS.cream[50],
  },
  connectionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  connectedStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: THEME.spacing.xs,
  },
  connectedText: {
    fontSize: THEME.typography.fontSize.xs,
    color: COLORS.green[500],
  },
  disconnectedStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: THEME.spacing.xs,
  },
  disconnectedText: {
    fontSize: THEME.typography.fontSize.xs,
    color: COLORS.red[500],
  },
  messagesList: {
    flexGrow: 1,
    paddingHorizontal: THEME.spacing.md,
    paddingTop: THEME.spacing.md,
  },
  messagesListEmpty: {
    justifyContent: 'center',
  },
  messageContainer: {
    marginBottom: THEME.spacing.md,
  },
  messageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: THEME.spacing.xs,
    gap: THEME.spacing.sm,
  },
  username: {
    fontSize: THEME.typography.fontSize.sm,
    fontWeight: THEME.typography.fontWeight.semibold,
    color: COLORS.blue[400],
  },
  hostUsername: {
    color: COLORS.yellow[400],
  },
  timestamp: {
    fontSize: THEME.typography.fontSize.xs,
    color: COLORS.cream[200],
  },
  messageText: {
    fontSize: THEME.typography.fontSize.sm,
    color: COLORS.cream[200],
    lineHeight: THEME.typography.lineHeight.normal * THEME.typography.fontSize.sm,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: THEME.spacing.xxl * 2,
  },
  emptyText: {
    fontSize: THEME.typography.fontSize.md,
    fontWeight: THEME.typography.fontWeight.medium,
    color: COLORS.cream[50],
    marginTop: THEME.spacing.md,
  },
  emptySubtext: {
    fontSize: THEME.typography.fontSize.sm,
    color: COLORS.cream[200],
    marginTop: THEME.spacing.xs,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: THEME.spacing.md,
    paddingVertical: THEME.spacing.md,
    backgroundColor: COLORS.warmCharcoal[50],
    borderTopWidth: 1,
    borderTopColor: `${COLORS.cream[200]}20`,
    gap: THEME.spacing.sm,
  },
  input: {
    flex: 1,
    backgroundColor: COLORS.warmCharcoal[100],
    borderRadius: THEME.borderRadius.md,
    paddingHorizontal: THEME.spacing.md,
    paddingVertical: THEME.spacing.sm,
    fontSize: THEME.typography.fontSize.sm,
    color: COLORS.cream[50],
    maxHeight: 100,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.accent[500],
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: COLORS.warmCharcoal[50],
  },
});

export default LiveChat;
