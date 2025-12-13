import { FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '../config/database.js';

// Check if user has access to VOD content (either subscription or rental)
export const checkContentAccess = async (
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) => {
  try {
    const userId = (request.user as any)?.userId;
    const contentId = request.params.id;

    if (!userId) {
      return reply.status(401).send({
        success: false,
        error: 'Unauthorized',
        hasAccess: false,
      });
    }

    // Check subscription
    const subscription = await prisma.userSubscription.findFirst({
      where: {
        user_id: userId,
        status: 'ACTIVE',
        expired_at: { gt: new Date() },
      },
    });

    if (subscription) {
      // User has active subscription, grant access
      (request as any).accessType = 'subscription';
      (request as any).expiresAt = subscription.expired_at;
      return;
    }

    // Check rental
    const rental = await prisma.userRental.findFirst({
      where: {
        user_id: userId,
        content_id: contentId,
        expired_at: { gt: new Date() },
      },
    });

    if (rental) {
      // User has rented this content
      (request as any).accessType = 'rental';
      (request as any).expiresAt = rental.expired_at;
      return;
    }

    // No access
    return reply.status(403).send({
      success: false,
      error: 'You need to subscribe or rent this content to watch',
      hasAccess: false,
      requiresPayment: true,
    });
  } catch (error) {
    console.error('Error checking content access:', error);
    return reply.status(500).send({
      success: false,
      error: 'Failed to check access',
    });
  }
};

// Check if user has access to live event (subscription or ticket)
export const checkEventAccess = async (
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) => {
  try {
    const userId = (request.user as any)?.userId;
    const eventId = request.params.id;

    if (!userId) {
      return reply.status(401).send({
        success: false,
        error: 'Unauthorized',
        hasAccess: false,
      });
    }

    // Get event details
    const event = await prisma.liveEvent.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      return reply.status(404).send({
        success: false,
        error: 'Event not found',
      });
    }

    // If event is free
    if (!event.ticket_price || event.ticket_price.toNumber() === 0) {
      (request as any).accessType = 'free';
      return;
    }

    // Check if user bought ticket
    const ticket = await prisma.eventTicket.findUnique({
      where: {
        user_id_event_id: {
          user_id: userId,
          event_id: eventId,
        },
      },
    });

    if (ticket) {
      (request as any).accessType = 'ticket';
      return;
    }

    // No access
    return reply.status(403).send({
      success: false,
      error: 'You need to buy a ticket to watch this event',
      hasAccess: false,
      requiresPayment: true,
      ticketPrice: event.ticket_price,
    });
  } catch (error) {
    console.error('Error checking event access:', error);
    return reply.status(500).send({
      success: false,
      error: 'Failed to check access',
    });
  }
};

// Optional middleware: Just check and return info, don't block
export const getAccessInfo = async (
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) => {
  try {
    const userId = (request.user as any)?.userId;
    const contentId = request.params.id;

    if (!userId) {
      (request as any).accessInfo = { hasAccess: false, accessType: null };
      return;
    }

    // Check subscription
    const subscription = await prisma.userSubscription.findFirst({
      where: {
        user_id: userId,
        status: 'ACTIVE',
        expired_at: { gt: new Date() },
      },
    });

    if (subscription) {
      (request as any).accessInfo = {
        hasAccess: true,
        accessType: 'subscription',
        expiresAt: subscription.expired_at,
      };
      return;
    }

    // Check rental
    const rental = await prisma.userRental.findFirst({
      where: {
        user_id: userId,
        content_id: contentId,
        expired_at: { gt: new Date() },
      },
    });

    if (rental) {
      (request as any).accessInfo = {
        hasAccess: true,
        accessType: 'rental',
        expiresAt: rental.expired_at,
      };
      return;
    }

    (request as any).accessInfo = { hasAccess: false, accessType: null };
  } catch (error) {
    console.error('Error getting access info:', error);
    (request as any).accessInfo = { hasAccess: false, accessType: null, error: true };
  }
};
