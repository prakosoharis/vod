import { FastifyInstance } from 'fastify';
import { broadcastController } from '../controllers/broadcastController.js';

export async function broadcastRoutes(fastify: FastifyInstance) {
  // Create broadcast
  fastify.post('/broadcasts', {
    schema: {
      body: {
        type: 'object',
        required: ['title', 'category'],
        properties: {
          title: { type: 'string' },
          description: { type: 'string' },
          scheduled_time: { type: 'string', format: 'date-time' },
          category: { type: 'string' },
          chat_enabled: { type: 'boolean' },
          stream_key: { type: 'string' },
          rtmp_url: { type: 'string' },
          playback_url: { type: 'string' },
          thumbnail_url: { type: 'string' },
          backdrop_url: { type: 'string' },
          ticket_price: { type: 'number', minimum: 0 },
        },
      },
    },
  }, broadcastController.create);

  // Get all broadcasts
  fastify.get('/broadcasts', {
    schema: {
      querystring: {
        status: { type: 'string' },
      },
    },
  }, broadcastController.getAll);

  // Get broadcast by ID
  fastify.get('/broadcasts/:id', {
    schema: {
      params: {
        id: { type: 'string' },
      },
    },
  }, broadcastController.getById);

  fastify.get('/broadcasts/:id/player', {
    schema: {
      params: {
        id: { type: 'string' },
      },
    },
  }, broadcastController.getPlayer);

  // Update broadcast
  fastify.put('/broadcasts/:id', {
    schema: {
      params: {
        id: { type: 'string' },
      },
      body: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          description: { type: 'string' },
          scheduled_time: { type: 'string', format: 'date-time' },
          category: { type: 'string' },
          chat_enabled: { type: 'boolean' },
          stream_key: { type: 'string' },
          rtmp_url: { type: 'string' },
          playback_url: { type: 'string' },
          thumbnail_url: { type: 'string' },
          backdrop_url: { type: 'string' },
          ticket_price: { type: 'number', minimum: 0 },
        },
      },
    },
  }, broadcastController.update);

  // Delete broadcast
  fastify.delete('/broadcasts/:id', {
    schema: {
      params: {
        id: { type: 'string' },
      },
    },
  }, broadcastController.delete);

  // Update broadcast status
  fastify.patch('/broadcasts/:id/status', {
    schema: {
      params: {
        id: { type: 'string' },
      },
      body: {
        type: 'object',
        required: ['status'],
        properties: {
          status: { type: 'string', enum: ['SCHEDULED', 'LIVE', 'ENDED', 'CANCELLED'] },
        },
      },
    },
  }, broadcastController.updateStatus);

  // Get stream info
  fastify.get('/broadcasts/:id/stream-info', {
    schema: {
      params: {
        id: { type: 'string' },
      },
    },
  }, broadcastController.getStreamInfo);

  fastify.get('/broadcasts/:id/playback-status', {
    schema: {
      params: {
        id: { type: 'string' },
      },
    },
  }, broadcastController.getPlaybackStatus);

  // Get chat messages
  fastify.get('/broadcasts/:id/chat', {
    schema: {
      params: {
        id: { type: 'string' },
      },
      querystring: {
        limit: { type: 'number' },
      },
    },
  }, broadcastController.getChatMessages);
}
