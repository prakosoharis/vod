import { FastifyInstance } from 'fastify';
import {
  getAllContent,
  getContentById,
  getFeaturedContent,
  getTrendingContent,
  searchContent,
  createContent,
  updateContent,
} from '../controllers/contentController.js';
import { authenticateRequest } from '../middleware/auth.js';

export async function contentRoutes(fastify: FastifyInstance): Promise<void> {
  // Get all content with pagination and filters (public)
  fastify.get('/', getAllContent);

  // Admin Content Management
  fastify.post('/', { preHandler: [authenticateRequest] }, createContent);
  fastify.put('/:id', { preHandler: [authenticateRequest] }, updateContent);

  // Get single content by ID (public)
  fastify.get('/:id', getContentById);

  // Get featured content (public)
  fastify.get('/featured', getFeaturedContent);

  // Get trending content (public)
  fastify.get('/trending', getTrendingContent);

  // Search content (public)
  fastify.get('/search', searchContent);
}

