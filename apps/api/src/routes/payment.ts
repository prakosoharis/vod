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

export default async function paymentRoutes(fastify: FastifyInstance) {
  // Webhook - no auth required (called by Midtrans server)
  fastify.post('/webhook', handleWebhook);

  // Protected routes
  fastify.register(async (protectedRoutes) => {
    protectedRoutes.addHook('onRequest', authMiddleware);

    // Rental
    protectedRoutes.post('/rental/rent', rentContent);
    protectedRoutes.get('/rental/me', getUserRentals);

    // Event tickets
    protectedRoutes.post('/event/buy-ticket', buyEventTicket);
    protectedRoutes.post('/broadcast/:broadcastId/ticket', buyBroadcastTicket);
    protectedRoutes.get('/broadcast/:broadcastId/access', checkBroadcastAccess);

    // Access check
    protectedRoutes.get('/access/:contentId', checkContentAccess);

    // Transaction status
    protectedRoutes.get('/transaction/:orderId', getTransactionStatus);

    // Dev webhook simulator (sandbox only, requires auth for ownership check)
    protectedRoutes.post('/dev-webhook/:orderId', devWebhookSimulator);
  });
}
