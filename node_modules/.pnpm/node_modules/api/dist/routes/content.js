import { getAllContent, getContentById, getFeaturedContent, getTrendingContent, searchContent, } from '../controllers/contentController.js';
export async function contentRoutes(fastify) {
    // Get all content with pagination and filters (public)
    fastify.get('/', getAllContent);
    // Get single content by ID (public)
    fastify.get('/:id', getContentById);
    // Get featured content (public)
    fastify.get('/featured', getFeaturedContent);
    // Get trending content (public)
    fastify.get('/trending', getTrendingContent);
    // Search content (public)
    fastify.get('/search', searchContent);
}
//# sourceMappingURL=content.js.map