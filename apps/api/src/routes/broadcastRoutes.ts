import { FastifyInstance } from 'fastify';
import { broadcastController } from '../controllers/broadcastController';

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
