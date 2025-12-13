import Fastify, { FastifyInstance, FastifyRequest, FastifyReply, FastifyError } from 'fastify';
import cors from '@fastify/cors';
import multipart from '@fastify/multipart';
import fastifyStatic from '@fastify/static';
import dotenv from 'dotenv';
import { registerJwt } from './utils/jwt.js';
import { authRoutes } from './routes/auth.js';
import { userRoutes } from './routes/user.js';
import { contentRoutes } from './routes/content.js';
import { uploadRoutes } from './routes/upload.js';
import { eventRoutes } from './routes/event.js';
import paymentRoutes from './routes/payment.js';
import prisma from './config/database.js';


// Load environment variables
dotenv.config();

// Register plugins and routes
async function build(): Promise<FastifyInstance> {
  const isDev = process.env.NODE_ENV === 'development';

  const fastify: FastifyInstance = Fastify({
    logger: {
      level: isDev ? 'debug' : 'info',
    },
  });

  // CORS
  await fastify.register(cors, {
    origin: ['https://mostara.id', 'https://api.mostara.id', 'https://backoffice.mostara.id', '*'],
    credentials: true,
  });

  // Multipart for file uploads
  await fastify.register(multipart, {
    limits: {
      fileSize: 100 * 1024 * 1024, // 100MB
    },
  });

  // JWT
  await registerJwt(fastify);

  // Static file serving for uploads (use fixed absolute path)
  await fastify.register(fastifyStatic, {
    root: '/var/www/vod/apps/api/uploads',
    prefix: '/api/uploads/',
    decorateReply: false,
  });

  // Request logging hook (development only)
  if (isDev) {
    fastify.addHook('onRequest', async (request: FastifyRequest) => {
      fastify.log.info(`${request.method} ${request.url}`);
    });
  }

  // Health check endpoint with database connection verification
  fastify.get('/health', async (_request: FastifyRequest, reply: FastifyReply) => {
    try {
      // Verify database connection
      await prisma.$queryRaw`SELECT 1`;
      
      return reply.send({
        status: 'ok',
        timestamp: new Date().toISOString(),
        database: 'connected',
      });
    } catch (error) {
      fastify.log.error({ error }, 'Database health check failed');
      return reply.code(503).send({
        status: 'error',
        timestamp: new Date().toISOString(),
        database: 'disconnected',
        message: 'Database connection failed',
      });
    }
  });

  // Register routes
  await fastify.register(authRoutes, { prefix: '/api/auth' });
  await fastify.register(userRoutes, { prefix: '/api/user' });
  await fastify.register(contentRoutes, { prefix: '/api/content' });
  await fastify.register(eventRoutes, { prefix: '/api/events' });
  await fastify.register(paymentRoutes, { prefix: '/api/payment' });
  await fastify.register(uploadRoutes, { prefix: '/api' });

  // Global error handler
  fastify.setErrorHandler((error: FastifyError, request: FastifyRequest, reply: FastifyReply) => {
    const statusCode = error.statusCode || 500;
    const message = error.message || 'Internal Server Error';

    // Log error details
    fastify.log.error({
      error: {
        message,
        stack: isDev ? error.stack : undefined,
        statusCode,
        code: error.code,
      },
      request: {
        method: request.method,
        url: request.url,
        headers: request.headers,
      },
    });

    // Format error response consistently
    const response: any = {
      error: {
        message,
        statusCode,
      },
    };

    // Include additional details in development
    if (isDev && error.stack) {
      response.error.stack = error.stack;
    }

    // Include validation errors if present
    if (error.validation) {
      response.error.validation = error.validation;
    }

    return reply.code(statusCode).send(response);
  });

  // 404 handler
  fastify.setNotFoundHandler((request: FastifyRequest, reply: FastifyReply) => {
    reply.code(404).send({
      error: {
        message: `Route ${request.method} ${request.url} not found`,
        statusCode: 404,
      },
    });
  });

  return fastify;
}

// Start server
let serverInstance: FastifyInstance | null = null;

async function start(): Promise<void> {
  try {
    serverInstance = await build();
    const port = parseInt(process.env.PORT || '3001', 10);
    const host = process.env.HOST || '0.0.0.0';

    await serverInstance.listen({ port, host });
    console.log(`🚀 Server listening on http://${host}:${port}`);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

// Handle graceful shutdown
async function shutdown(): Promise<void> {
  if (serverInstance) {
    await serverInstance.close();
  }
  process.exit(0);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

// Start the server
start();

