import { FastifyInstance } from 'fastify';
import {
  getSubscriptionPlans,
  createSubscription,
  rentContent,
  buyEventTicket,
  handleWebhook,
  getTransactionStatus,
  getUserSubscription,
  checkContentAccess,
  getUserRentals,
  cancelSubscription,
} from '../controllers/paymentController.js';
import { authMiddleware } from '../middleware/auth.js';

export default async function paymentRoutes(fastify: FastifyInstance) {
  // Public routes
  fastify.get('/subscription/plans', getSubscriptionPlans);

  // Webhook - no auth required
  fastify.post('/webhook', handleWebhook);

  // Protected routes
  fastify.register(async (protectedRoutes) => {
    protectedRoutes.addHook('onRequest', authMiddleware);

    // Subscription
    protectedRoutes.post('/subscription/subscribe', createSubscription);
    protectedRoutes.get('/subscription/me', getUserSubscription);
    protectedRoutes.post('/subscription/cancel', cancelSubscription);

    // Rental
    protectedRoutes.post('/rental/rent', rentContent);
    protectedRoutes.get('/rental/me', getUserRentals);

    // Event tickets
    protectedRoutes.post('/event/buy-ticket', buyEventTicket);

    // Access check
    protectedRoutes.get('/access/:contentId', checkContentAccess);

    // Transaction status
    protectedRoutes.get('/transaction/:orderId', getTransactionStatus);
  });
}
