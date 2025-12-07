import { FastifyInstance } from 'fastify';
import {
  getAllEvents,
  getCurrentLiveEvent,
  getEventById,
  createEvent,
  updateEvent,
  setEventLiveStatus,
} from '../controllers/eventController.js';
import { authenticateRequest } from '../middleware/auth.js';

export async function eventRoutes(fastify: FastifyInstance): Promise<void> {
  // Get all events (public - upcoming by default)
  fastify.get('/', getAllEvents);

  // Get current live event (public)
  fastify.get('/live', getCurrentLiveEvent);

  // Get single event by ID (public)
  fastify.get('/:id', getEventById);

  // Admin Event Management
  fastify.post('/', { preHandler: [authenticateRequest] }, createEvent);
  fastify.put('/:id', { preHandler: [authenticateRequest] }, updateEvent);
  fastify.patch('/:id/live-status', { preHandler: [authenticateRequest] }, setEventLiveStatus);
}
