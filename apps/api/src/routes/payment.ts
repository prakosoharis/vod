import { FastifyInstance } from 'fastify';
import {
  rentContent,
  buyEventTicket,
  buyBroadcastTicket,
  checkBroadcastAccess,
  handleWebhook,
  devWebhookSimulator,
  getTransactionStatus,
  checkContentAccess,
  getUserRentals,
} from '../controllers/paymentController.js';
import { authMiddleware } from '../middleware/auth.js';
import { requireVerifiedEmail } from '../middleware/verifiedEmail.js';

export default async function paymentRoutes(fastify: FastifyInstance) {
  // Webhook - no auth required (called by Midtrans server)
  fastify.post('/webhook', handleWebhook);

  // Protected routes
  fastify.register(async (protectedRoutes) => {
    protectedRoutes.addHook('onRequest', authMiddleware);

    // Rental
    protectedRoutes.post<{ Body: { content_id: string } }>('/rental/rent', { preHandler: [requireVerifiedEmail] }, rentContent);
    protectedRoutes.get('/rental/me', getUserRentals);

    // Event tickets
    protectedRoutes.post<{ Body: { event_id: string } }>('/event/buy-ticket', { preHandler: [requireVerifiedEmail] }, buyEventTicket);
    protectedRoutes.post<{ Params: { broadcastId: string } }>('/broadcast/:broadcastId/ticket', { preHandler: [requireVerifiedEmail] }, buyBroadcastTicket);
    protectedRoutes.get('/broadcast/:broadcastId/access', checkBroadcastAccess);

    // Access check
    protectedRoutes.get('/access/:contentId', checkContentAccess);

    // Transaction status
    protectedRoutes.get('/transaction/:orderId', getTransactionStatus);

    // Dev webhook simulator (sandbox only, requires auth for ownership check)
    protectedRoutes.post('/dev-webhook/:orderId', devWebhookSimulator);
  });
}
