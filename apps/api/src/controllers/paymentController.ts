import { FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '../config/database.js';
import { snap } from '../config/midtrans.js';
import crypto from 'crypto';

// Generate unique order ID
const generateOrderId = (): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `ORD-${timestamp}-${random}`;
};

// =============== SUBSCRIPTION ===============

export const getSubscriptionPlans = async (
  _request: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const plans = await prisma.subscriptionPlan.findMany({
      where: { is_active: true },
      orderBy: { price: 'asc' },
    });

    return reply.send({ success: true, data: plans });
  } catch (error) {
    console.error('Error getting subscription plans:', error);
    return reply.status(500).send({ success: false, error: 'Failed to get subscription plans' });
  }
};

export const createSubscription = async (
  request: FastifyRequest<{
    Body: { plan_id: string };
  }>,
  reply: FastifyReply
) => {
  try {
    const userId = (request.user as any).userId;
    const { plan_id } = request.body;

    // Check if user already has active subscription
    const existingSubscription = await prisma.userSubscription.findFirst({
      where: {
        user_id: userId,
        status: 'ACTIVE',
        expired_at: { gt: new Date() },
      },
    });

    if (existingSubscription) {
      return reply.status(400).send({
        success: false,
        error: 'You already have an active subscription',
      });
    }

    // Get plan details
    const plan = await prisma.subscriptionPlan.findUnique({
      where: { id: plan_id },
    });

    if (!plan || !plan.is_active) {
      return reply.status(404).send({ success: false, error: 'Subscription plan not found' });
    }

    // Get user details
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return reply.status(404).send({ success: false, error: 'User not found' });
    }

    // Generate order ID
    const orderId = generateOrderId();

    // Calculate expiration date
    const expiredAt = new Date();
    expiredAt.setDate(expiredAt.getDate() + plan.duration_days);

    // Create transaction with plan info in metadata (subscription created on webhook)
    const transaction = await prisma.transaction.create({
      data: {
        user_id: userId,
        order_id: orderId,
        payment_type: 'SUBSCRIPTION',
        amount: plan.price,
        status: 'PENDING',
        metadata: {
          plan_id: plan.id,
          duration_days: plan.duration_days,
          expired_at: expiredAt.toISOString(),
        },
      },
    });

    // Create Midtrans transaction
    const parameter = {
      transaction_details: {
        order_id: orderId,
        gross_amount: Number(plan.price),
      },
      customer_details: {
        first_name: user.full_name || user.email.split('@')[0],
        email: user.email,
      },
      item_details: [
        {
          id: plan.id,
          name: plan.name,
          price: Number(plan.price),
          quantity: 1,
        },
      ],
      callbacks: {
        finish: `${process.env.FRONTEND_URL}/payment/success?order_id=${orderId}`,
        error: `${process.env.FRONTEND_URL}/payment/error?order_id=${orderId}`,
        pending: `${process.env.FRONTEND_URL}/payment/pending?order_id=${orderId}`,
      },
    };

    const snapTransaction = await snap.createTransaction(parameter);

    // Update transaction with Midtrans token
    await prisma.transaction.update({
      where: { id: transaction.id },
      data: {
        midtrans_token: snapTransaction.token,
        midtrans_transaction_id: orderId,
      },
    });

    return reply.send({
      success: true,
      data: {
        token: snapTransaction.token,
        redirect_url: snapTransaction.redirect_url,
        order_id: orderId,
      },
    });
  } catch (error) {
    console.error('Error creating subscription:', error);
    return reply.status(500).send({ success: false, error: 'Failed to create subscription' });
  }
};

// =============== RENTAL ===============

export const rentContent = async (
  request: FastifyRequest<{
    Body: { content_id: string };
  }>,
  reply: FastifyReply
) => {
  try {
    const userId = (request.user as any).userId;
    const { content_id } = request.body;

    // Check if user already has active subscription
    const activeSubscription = await prisma.userSubscription.findFirst({
      where: {
        user_id: userId,
        status: 'ACTIVE',
        expired_at: { gt: new Date() },
      },
    });

    if (activeSubscription) {
      return reply.status(400).send({
        success: false,
        error: 'You already have an active subscription. No need to rent!',
      });
    }

    // Check if user already rented this content
    const existingRental = await prisma.userRental.findFirst({
      where: {
        user_id: userId,
        content_id: content_id,
        expired_at: { gt: new Date() },
      },
    });

    if (existingRental) {
      return reply.status(400).send({
        success: false,
        error: 'You already have an active rental for this content',
      });
    }

    // Get rental price (fallback to default if not set)
    let rentalPrice = await prisma.rentalPrice.findUnique({
      where: { content_id },
      include: { content: true },
    });

    if (!rentalPrice) {
      // Auto-create default rental price for this content
      rentalPrice = await prisma.rentalPrice.create({
        data: {
          content_id,
          price: 10000,
          duration_hours: 24,
          is_active: true,
        },
        include: { content: true },
      });
    }

    if (!rentalPrice.is_active) {
      return reply.status(400).send({ success: false, error: 'Rental is not available for this content' });
    }

    // Get user details
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return reply.status(404).send({ success: false, error: 'User not found' });
    }

    // Generate order ID
    const orderId = generateOrderId();

    // Calculate expiration
    const expiredAt = new Date();
    expiredAt.setHours(expiredAt.getHours() + rentalPrice.duration_hours);

    // Create transaction
    const transaction = await prisma.transaction.create({
      data: {
        user_id: userId,
        order_id: orderId,
        payment_type: 'RENTAL',
        amount: rentalPrice.price,
        status: 'PENDING',
        metadata: {
          content_id,
          rental_price_id: rentalPrice.id,
          expired_at: expiredAt.toISOString(),
        },
      },
    });

    // Create Midtrans transaction
    const parameter = {
      transaction_details: {
        order_id: orderId,
        gross_amount: Number(rentalPrice.price),
      },
      customer_details: {
        first_name: user.full_name || user.email.split('@')[0],
        email: user.email,
      },
      item_details: [
        {
          id: rentalPrice.content.id,
          name: `Rental: ${rentalPrice.content.title}`,
          price: Number(rentalPrice.price),
          quantity: 1,
        },
      ],
      callbacks: {
        finish: `${process.env.FRONTEND_URL}/payment/success?order_id=${orderId}`,
        error: `${process.env.FRONTEND_URL}/payment/error?order_id=${orderId}`,
        pending: `${process.env.FRONTEND_URL}/payment/pending?order_id=${orderId}`,
      },
    };

    const snapTransaction = await snap.createTransaction(parameter);

    // Update transaction
    await prisma.transaction.update({
      where: { id: transaction.id },
      data: {
        midtrans_token: snapTransaction.token,
        midtrans_transaction_id: orderId,
      },
    });

    return reply.send({
      success: true,
      data: {
        token: snapTransaction.token,
        redirect_url: snapTransaction.redirect_url,
        order_id: orderId,
      },
    });
  } catch (error) {
    console.error('Error renting content:', error);
    return reply.status(500).send({ success: false, error: 'Failed to rent content' });
  }
};

// =============== EVENT TICKET ===============

export const buyEventTicket = async (
  request: FastifyRequest<{
    Body: { event_id: string };
  }>,
  reply: FastifyReply
) => {
  try {
    const userId = (request.user as any).userId;
    const { event_id } = request.body;

    // Check if user already bought ticket
    const existingTicket = await prisma.eventTicket.findUnique({
      where: {
        user_id_event_id: {
          user_id: userId,
          event_id: event_id,
        },
      },
    });

    if (existingTicket) {
      return reply.status(400).send({
        success: false,
        error: 'You already have a ticket for this event',
      });
    }

    // Get event details
    const event = await prisma.liveEvent.findUnique({
      where: { id: event_id },
    });

    if (!event) {
      return reply.status(404).send({ success: false, error: 'Event not found' });
    }

    if (!event.ticket_price || event.ticket_price.toNumber() === 0) {
      return reply.status(400).send({ success: false, error: 'This event is free' });
    }

    // Get user details
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return reply.status(404).send({ success: false, error: 'User not found' });
    }

    // Generate order ID
    const orderId = generateOrderId();

    // Create transaction
    const transaction = await prisma.transaction.create({
      data: {
        user_id: userId,
        order_id: orderId,
        payment_type: 'EVENT_TICKET',
        amount: event.ticket_price,
        status: 'PENDING',
        metadata: {
          event_id: event.id,
        },
      },
    });

    // Create Midtrans transaction
    const parameter = {
      transaction_details: {
        order_id: orderId,
        gross_amount: Number(event.ticket_price),
      },
      customer_details: {
        first_name: user.full_name || user.email.split('@')[0],
        email: user.email,
      },
      item_details: [
        {
          id: event.id,
          name: `Ticket: ${event.title}`,
          price: Number(event.ticket_price),
          quantity: 1,
        },
      ],
      callbacks: {
        finish: `${process.env.FRONTEND_URL}/payment/success?order_id=${orderId}`,
        error: `${process.env.FRONTEND_URL}/payment/error?order_id=${orderId}`,
        pending: `${process.env.FRONTEND_URL}/payment/pending?order_id=${orderId}`,
      },
    };

    const snapTransaction = await snap.createTransaction(parameter);

    // Update transaction
    await prisma.transaction.update({
      where: { id: transaction.id },
      data: {
        midtrans_token: snapTransaction.token,
        midtrans_transaction_id: orderId,
      },
    });

    return reply.send({
      success: true,
      data: {
        token: snapTransaction.token,
        redirect_url: snapTransaction.redirect_url,
        order_id: orderId,
      },
    });
  } catch (error) {
    console.error('Error buying event ticket:', error);
    return reply.status(500).send({ success: false, error: 'Failed to buy event ticket' });
  }
};

// =============== WEBHOOK & STATUS ===============

interface MidtransNotification {
  signature_key: string;
  order_id: string;
  status_code: string;
  gross_amount: string;
  transaction_status: string;
  fraud_status: string;
  payment_type: string;
}

export const handleWebhook = async (
  request: FastifyRequest<{
    Body: MidtransNotification;
  }>,
  reply: FastifyReply
) => {
  try {
    const notification = request.body as MidtransNotification;

    // Verify signature
    const serverKey = process.env.MIDTRANS_SERVER_KEY || '';
    const signatureKey = notification.signature_key;
    const orderId = notification.order_id;
    const statusCode = notification.status_code;
    const grossAmount = notification.gross_amount;

    const expectedSignature = crypto
      .createHash('sha512')
      .update(`${orderId}${statusCode}${grossAmount}${serverKey}`)
      .digest('hex');

    if (signatureKey !== expectedSignature) {
      return reply.status(403).send({ success: false, error: 'Invalid signature' });
    }

    const transactionStatus = notification.transaction_status;
    const fraudStatus = notification.fraud_status;

    // Get transaction
    const transaction = await prisma.transaction.findUnique({
      where: { order_id: orderId },
      include: {
        subscription: true,
      },
    });

    if (!transaction) {
      return reply.status(404).send({ success: false, error: 'Transaction not found' });
    }

    let paymentStatus: 'PENDING' | 'SETTLEMENT' | 'FAILED' | 'EXPIRED' = 'PENDING';

    // Handle payment status
    if (transactionStatus === 'capture') {
      if (fraudStatus === 'accept') {
        paymentStatus = 'SETTLEMENT';
      }
    } else if (transactionStatus === 'settlement') {
      paymentStatus = 'SETTLEMENT';
    } else if (
      transactionStatus === 'cancel' ||
      transactionStatus === 'deny' ||
      transactionStatus === 'expire'
    ) {
      paymentStatus = transactionStatus === 'expire' ? 'EXPIRED' : 'FAILED';
    } else if (transactionStatus === 'pending') {
      paymentStatus = 'PENDING';
    }

    // Update transaction
    await prisma.transaction.update({
      where: { id: transaction.id },
      data: {
        status: paymentStatus,
        payment_method: notification.payment_type,
      },
    });

    // If payment successful, grant access
    if (paymentStatus === 'SETTLEMENT') {
      if (transaction.payment_type === 'SUBSCRIPTION') {
        // Create subscription on successful payment
        const metadata = transaction.metadata as any;
        if (metadata?.plan_id) {
          await prisma.userSubscription.create({
            data: {
              user_id: transaction.user_id,
              plan_id: metadata.plan_id,
              status: 'ACTIVE',
              started_at: new Date(),
              expired_at: new Date(metadata.expired_at),
              auto_renew: true,
            },
          });
        }
      } else if (transaction.payment_type === 'RENTAL') {
        // Create rental access
        const metadata = transaction.metadata as any;
        await prisma.userRental.create({
          data: {
            user_id: transaction.user_id,
            content_id: metadata.content_id,
            rental_price_id: metadata.rental_price_id,
            rented_at: new Date(),
            expired_at: new Date(metadata.expired_at),
            transaction_id: transaction.id,
          },
        });
      } else if (transaction.payment_type === 'EVENT_TICKET') {
        // Create event ticket
        const metadata = transaction.metadata as any;
        await prisma.eventTicket.create({
          data: {
            user_id: transaction.user_id,
            event_id: metadata.event_id,
            purchased_at: new Date(),
            transaction_id: transaction.id,
          },
        });
      }
    }

    return reply.send({ success: true });
  } catch (error) {
    console.error('Error handling webhook:', error);
    return reply.status(500).send({ success: false, error: 'Webhook processing failed' });
  }
};

export const getTransactionStatus = async (
  request: FastifyRequest<{
    Params: { orderId: string };
  }>,
  reply: FastifyReply
) => {
  try {
    const { orderId } = request.params;
    const userId = (request.user as any).userId;

    const transaction = await prisma.transaction.findUnique({
      where: { order_id: orderId },
      include: {
        subscription: {
          include: { plan: true },
        },
        rental: {
          include: { content: true },
        },
        event_ticket: {
          include: { event: true },
        },
      },
    });

    if (!transaction) {
      return reply.status(404).send({ success: false, error: 'Transaction not found' });
    }

    // Check ownership
    if (transaction.user_id !== userId) {
      return reply.status(403).send({ success: false, error: 'Unauthorized' });
    }

    return reply.send({ success: true, data: transaction });
  } catch (error) {
    console.error('Error getting transaction status:', error);
    return reply.status(500).send({ success: false, error: 'Failed to get transaction status' });
  }
};

// =============== USER ACCESS CHECK ===============

export const getUserSubscription = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const userId = (request.user as any).userId;

    const subscription = await prisma.userSubscription.findFirst({
      where: {
        user_id: userId,
        status: 'ACTIVE',
        expired_at: { gt: new Date() },
      },
      include: {
        plan: true,
      },
    });

    return reply.send({
      success: true,
      data: subscription || null,
    });
  } catch (error) {
    console.error('Error getting user subscription:', error);
    return reply.status(500).send({ success: false, error: 'Failed to get subscription' });
  }
};

export const checkContentAccess = async (
  request: FastifyRequest<{
    Params: { contentId: string };
  }>,
  reply: FastifyReply
) => {
  try {
    const userId = (request.user as any).userId;
    const { contentId } = request.params;

    // Check subscription
    const subscription = await prisma.userSubscription.findFirst({
      where: {
        user_id: userId,
        status: 'ACTIVE',
        expired_at: { gt: new Date() },
      },
    });

    if (subscription) {
      return reply.send({
        success: true,
        data: {
          has_access: true,
          access_type: 'subscription',
          expires_at: subscription.expired_at,
        },
      });
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
      return reply.send({
        success: true,
        data: {
          has_access: true,
          access_type: 'rental',
          expires_at: rental.expired_at,
        },
      });
    }

    return reply.send({
      success: true,
      data: {
        has_access: false,
        access_type: null,
        expires_at: null,
      },
    });
  } catch (error) {
    console.error('Error checking content access:', error);
    return reply.status(500).send({ success: false, error: 'Failed to check access' });
  }
};

export const getUserRentals = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const userId = (request.user as any).userId;

    const rentals = await prisma.userRental.findMany({
      where: { user_id: userId },
      include: {
        content: true,
        rental_price: true,
      },
      orderBy: { rented_at: 'desc' },
    });

    return reply.send({ success: true, data: rentals });
  } catch (error) {
    console.error('Error getting user rentals:', error);
    return reply.status(500).send({ success: false, error: 'Failed to get rentals' });
  }
};

export const cancelSubscription = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const userId = (request.user as any).userId;

    const subscription = await prisma.userSubscription.findFirst({
      where: {
        user_id: userId,
        status: 'ACTIVE',
      },
    });

    if (!subscription) {
      return reply.status(404).send({ success: false, error: 'No active subscription found' });
    }

    await prisma.userSubscription.update({
      where: { id: subscription.id },
      data: {
        auto_renew: false,
        cancelled_at: new Date(),
      },
    });

    return reply.send({
      success: true,
      message: 'Subscription will not auto-renew. You can still access until expiration.',
    });
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    return reply.status(500).send({ success: false, error: 'Failed to cancel subscription' });
  }
};

// =============== DEV WEBHOOK (ONLY FOR DEVELOPMENT) ===============

export const devWebhookSimulator = async (
  request: FastifyRequest<{
    Params: { orderId: string };
  }>,
  reply: FastifyReply
) => {
  try {
    // Only allow when using Midtrans sandbox (not production payment)
    if (process.env.MIDTRANS_IS_PRODUCTION === 'true') {
      return reply.status(403).send({ success: false, error: 'Dev webhook not available in production' });
    }

    const { orderId } = request.params;

    // Get transaction
    const transaction = await prisma.transaction.findUnique({
      where: { order_id: orderId },
    });

    if (!transaction) {
      return reply.status(404).send({ success: false, error: 'Transaction not found' });
    }

    // Check ownership
    const userId = (request.user as any).userId;
    if (transaction.user_id !== userId) {
      return reply.status(403).send({ success: false, error: 'Unauthorized' });
    }

    // Already settled - skip
    if (transaction.status === 'SETTLEMENT') {
      return reply.send({ success: true, message: 'Transaction already settled' });
    }

    // Simulate successful payment
    const paymentStatus = 'SETTLEMENT';

    // Update transaction
    await prisma.transaction.update({
      where: { id: transaction.id },
      data: {
        status: paymentStatus,
        payment_method: 'dev-simulator',
      },
    });

    // Grant access based on payment type
    if (paymentStatus === 'SETTLEMENT') {
      if (transaction.payment_type === 'SUBSCRIPTION') {
        // Create subscription on successful payment
        const metadata = transaction.metadata as any;
        if (metadata?.plan_id) {
          await prisma.userSubscription.create({
            data: {
              user_id: transaction.user_id,
              plan_id: metadata.plan_id,
              status: 'ACTIVE',
              started_at: new Date(),
              expired_at: new Date(metadata.expired_at),
              auto_renew: true,
            },
          });
        }
      } else if (transaction.payment_type === 'RENTAL') {
        // Create rental access
        const metadata = transaction.metadata as any;
        await prisma.userRental.create({
          data: {
            user_id: transaction.user_id,
            content_id: metadata.content_id,
            rental_price_id: metadata.rental_price_id,
            rented_at: new Date(),
            expired_at: new Date(metadata.expired_at),
            transaction_id: transaction.id,
          },
        });
      } else if (transaction.payment_type === 'EVENT_TICKET') {
        // Create event ticket
        const metadata = transaction.metadata as any;
        await prisma.eventTicket.create({
          data: {
            user_id: transaction.user_id,
            event_id: metadata.event_id,
            purchased_at: new Date(),
            transaction_id: transaction.id,
          },
        });
      }
    }

    return reply.send({ success: true, message: 'Dev webhook simulated successfully' });
  } catch (error) {
    console.error('Error in dev webhook simulator:', error);
    return reply.status(500).send({ success: false, error: 'Dev webhook simulation failed' });
  }
};
