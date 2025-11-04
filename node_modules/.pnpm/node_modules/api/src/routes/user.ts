import { FastifyInstance } from 'fastify';
import {
  getProfile,
  updateProfile,
  getWatchlist,
  addToWatchlist,
  removeFromWatchlist,
  getWatchProgress,
  updateWatchProgress,
  getContinueWatching,
} from '../controllers/userController.js';
import { authenticateRequest } from '../middleware/auth.js';

export async function userRoutes(fastify: FastifyInstance): Promise<void> {
  // Profile
  fastify.get('/profile', { preHandler: [authenticateRequest] }, getProfile);
  fastify.put('/profile', { preHandler: [authenticateRequest] }, updateProfile);

  // Watchlist
  fastify.get('/watchlist', { preHandler: [authenticateRequest] }, getWatchlist);
  fastify.post('/watchlist', { preHandler: [authenticateRequest] }, addToWatchlist);
  fastify.delete('/watchlist/:contentId', { preHandler: [authenticateRequest] }, removeFromWatchlist);

  // Watch progress
  fastify.get('/watch-progress/:contentId', { preHandler: [authenticateRequest] }, getWatchProgress);
  fastify.put('/watch-progress/:contentId', { preHandler: [authenticateRequest] }, updateWatchProgress);

  // Continue watching
  fastify.get('/continue-watching', { preHandler: [authenticateRequest] }, getContinueWatching);
}

