import { FastifyRequest, FastifyReply } from 'fastify';
import { broadcastService } from '../services/broadcastService';

export class BroadcastController {
  // Create new broadcast
  async create(req: FastifyRequest, reply: FastifyReply) {
    try {
      const input = req.body as any;
      const broadcast = await broadcastService.create(input);
      return reply.code(201).send(broadcast);
    } catch (error: any) {
      return reply.code(500).send({ error: error.message });
    }
  }

  // Get all broadcasts
  async getAll(req: FastifyRequest, reply: FastifyReply) {
    try {
      const { status } = req.query as any;
      const broadcasts = await broadcastService.getAll(status);
      return reply.send(broadcasts);
    } catch (error: any) {
      return reply.code(500).send({ error: error.message });
    }
  }

  // Get broadcast by ID
  async getById(req: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = req.params as any;
      const broadcast = await broadcastService.getById(id);
      return reply.send(broadcast);
    } catch (error: any) {
      if (error.message === 'Broadcast not found') {
        return reply.code(404).send({ error: error.message });
      }
      return reply.code(500).send({ error: error.message });
    }
  }

  // Update broadcast
  async update(req: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = req.params as any;
      const input = req.body as any;
      const broadcast = await broadcastService.update(id, input);
      return reply.send(broadcast);
    } catch (error: any) {
      if (error.message === 'Broadcast not found') {
        return reply.code(404).send({ error: error.message });
      }
      return reply.code(500).send({ error: error.message });
    }
  }

  // Delete broadcast
  async delete(req: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = req.params as any;
      const result = await broadcastService.delete(id);
      return reply.send(result);
    } catch (error: any) {
      return reply.code(500).send({ error: error.message });
    }
  }

  // Update status
  async updateStatus(req: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = req.params as any;
      const { status } = req.body as any;
      const broadcast = await broadcastService.updateStatus(id, status);
      return reply.send(broadcast);
    } catch (error: any) {
      if (error.message === 'Broadcast not found') {
        return reply.code(404).send({ error: error.message });
      }
      return reply.code(500).send({ error: error.message });
    }
  }

  // Get stream info
  async getStreamInfo(req: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = req.params as any;
      const streamInfo = await broadcastService.getStreamInfo(id);
      return reply.send(streamInfo);
    } catch (error: any) {
      if (error.message === 'Broadcast not found') {
        return reply.code(404).send({ error: error.message });
      }
      return reply.code(500).send({ error: error.message });
    }
  }

  // Get chat messages
  async getChatMessages(req: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = req.params as any;
      const { limit } = req.query as any;
      const messages = await broadcastService.getChatMessages(id, parseInt(limit) || 50);
      return reply.send(messages);
    } catch (error: any) {
      return reply.code(500).send({ error: error.message });
    }
  }
}

export const broadcastController = new BroadcastController();
