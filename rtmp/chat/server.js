const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const app = express();
app.use(cors());

const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : ["https://mostara.id"],
    methods: ["GET", "POST"],
    credentials: true
  }
});

const PORT = process.env.PORT || 3007;

// Simple rate limiting (in-memory)
const messageCounts = new Map();
const RATE_LIMIT = 10; // messages per minute
const RATE_WINDOW = 60 * 1000; // 1 minute

// Store chat messages and user counts
let messages = [];
let connectedUsers = new Set();
let streamStatus = {
  isLive: false,
  streamKey: null,
  viewerCount: 0
};

// API Routes
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    connectedUsers: connectedUsers.size,
    messagesCount: messages.length,
    streamStatus
  });
});

app.get('/messages', (req, res) => {
  res.json(messages);
});

app.get('/stream-status', (req, res) => {
  res.json(streamStatus);
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  connectedUsers.add(socket.id);
  streamStatus.viewerCount = connectedUsers.size;

  // Send existing messages and stream status to new user
  socket.emit('previousMessages', messages.slice(-50)); // Last 50 messages
  socket.emit('streamStatus', streamStatus);
  socket.emit('userCount', connectedUsers.size);

  // Broadcast updated user count
  io.emit('userCount', connectedUsers.size);

  // Handle new message
  socket.on('sendMessage', (data) => {
    // Simple rate limiting check
    const now = Date.now();
    const userMessages = messageCounts.get(socket.id) || [];
    const recentMessages = userMessages.filter(time => now - time < RATE_WINDOW);

    if (recentMessages.length >= RATE_LIMIT) {
      socket.emit('rateLimited', 'Please wait before sending another message');
      return;
    }

    recentMessages.push(now);
    messageCounts.set(socket.id, recentMessages);

    const message = {
      id: Date.now(),
      username: data.username || 'Anonymous',
      message: data.message,
      timestamp: new Date().toISOString(),
      userId: socket.id
    };

    messages.push(message);

    // Keep only last 200 messages
    if (messages.length > 200) {
      messages = messages.slice(-200);
    }

    // Broadcast to all users
    io.emit('newMessage', message);
  });

  // Handle user info
  socket.on('userInfo', (data) => {
    socket.username = data.username || 'Anonymous';
    socket.broadcast.emit('userJoined', {
      username: socket.username,
      userId: socket.id
    });
  });

  // Stream control (for admin/streamer)
  socket.on('setStreamStatus', (data) => {
    streamStatus = {
      ...streamStatus,
      ...data,
      viewerCount: connectedUsers.size
    };
    io.emit('streamStatus', streamStatus);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    connectedUsers.delete(socket.id);
    streamStatus.viewerCount = connectedUsers.size;

    socket.broadcast.emit('userLeft', {
      username: socket.username,
      userId: socket.id
    });

    // Broadcast updated user count
    io.emit('userCount', connectedUsers.size);
    io.emit('streamStatus', streamStatus);
  });
});

// Error handling
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🔴 Deluwang Live Chat Server running on port ${PORT}`);
  console.log(`📱 WebSocket ready for connections`);
});