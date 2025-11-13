import { getProfile, updateProfile, getWatchlist, addToWatchlist, removeFromWatchlist, getWatchProgress, updateWatchProgress, getContinueWatching, getAllUsers, createUser, updateUser, getUserById, } from '../controllers/userController';
import { authenticateRequest } from '../middleware/auth';
export async function userRoutes(fastify) {
    // Profile
    fastify.get('/profile', { preHandler: [authenticateRequest] }, getProfile);
    fastify.put('/profile', { preHandler: [authenticateRequest] }, updateProfile);
    // Admin User Management
    fastify.get('/all', { preHandler: [authenticateRequest] }, getAllUsers);
    fastify.post('/', { preHandler: [authenticateRequest] }, createUser);
    fastify.get('/:id', getUserById);
    fastify.put('/:id', { preHandler: [authenticateRequest] }, updateUser);
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
//# sourceMappingURL=user.js.map