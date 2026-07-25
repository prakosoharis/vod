import Fastify from 'fastify';
import cors from '@fastify/cors';
import multipart from '@fastify/multipart';
import fastifyStatic from '@fastify/static';
import dotenv from 'dotenv';
import { pathToFileURL } from 'node:url';
import { registerJwt } from './utils/jwt.js';
import { authRoutes } from './routes/auth.js';
import { userRoutes } from './routes/user.js';
import { contentRoutes } from './routes/content.js';
import { uploadRoutes } from './routes/upload.js';
import { eventRoutes } from './routes/event.js';
import paymentRoutes from './routes/payment.js';
import { broadcastRoutes } from './routes/broadcastRoutes.js';
import { legalRoutes } from './routes/legal.js';
import { getChatWebSocket } from './websocket/chatWebSocket.js';
import prisma from './config/database.js';
// Load environment variables
dotenv.config();
// Register plugins and routes
export async function build(options = {}) {
    const isDev = process.env.NODE_ENV === 'development';
    const fastify = Fastify({
        logger: {
            level: isDev ? 'debug' : 'info',
        },
    });
    const configuredOrigins = process.env.CORS_ALLOWED_ORIGINS
        ?.split(',')
        .map((origin) => origin.trim())
        .filter(Boolean);
    const allowedOrigins = configuredOrigins?.length
        ? configuredOrigins
        : [
            'https://smashstream.id',
            'https://api.smashstream.id',
            'https://backoffice.smashstream.id',
            'https://broadcaster.smashstream.id',
            ...(isDev ? ['http://localhost:3000', 'http://127.0.0.1:3000'] : []),
        ];
    // CORS
    await fastify.register(cors, {
        origin: allowedOrigins,
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
    // Static file serving for uploads
    const uploadsPath = process.env.UPLOADS_PATH || '/app/uploads';
    await fastify.register(fastifyStatic, {
        root: uploadsPath,
        prefix: '/api/uploads/',
        decorateReply: false,
    });
    // Request logging hook (development only)
    if (isDev) {
        fastify.addHook('onRequest', async (request) => {
            fastify.log.info(`${request.method} ${request.url}`);
        });
    }
    // Health check endpoint with database connection verification
    fastify.get('/health', async (_request, reply) => {
        try {
            // Verify database connection
            await prisma.$queryRaw `SELECT 1`;
            return reply.send({
                status: 'ok',
                timestamp: new Date().toISOString(),
                database: 'connected',
            });
        }
        catch (error) {
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
    await fastify.register(broadcastRoutes, { prefix: '/api' });
    await fastify.register(legalRoutes, { prefix: '/api' });
    // Start WebSocket server for chat
    if (options.startWebSocket !== false) {
        const wsPath = process.env.WEBSOCKET_PATH || '/ws';
        const chatWebSocket = getChatWebSocket(wsPath);
        chatWebSocket.start(parseInt(process.env.WEBSOCKET_PORT || '3002', 10));
    }
    // Global error handler
    fastify.setErrorHandler((error, request, reply) => {
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
                headers: {
                    'content-type': request.headers['content-type'],
                    'user-agent': request.headers['user-agent'],
                    'x-request-id': request.headers['x-request-id'],
                },
            },
        });
        // Format error response consistently
        const response = {
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
    fastify.setNotFoundHandler((request, reply) => {
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
let serverInstance = null;
async function start() {
    try {
        serverInstance = await build({ startWebSocket: true });
        const port = parseInt(process.env.PORT || '3001', 10);
        const host = process.env.HOST || '0.0.0.0';
        await serverInstance.listen({ port, host });
        console.log(`🚀 Server listening on http://${host}:${port}`);
    }
    catch (error) {
        console.error(error);
        process.exit(1);
    }
}
// Handle graceful shutdown
async function shutdown() {
    if (serverInstance) {
        await serverInstance.close();
    }
    process.exit(0);
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
const isMainModule = process.argv[1]
    ? import.meta.url === pathToFileURL(process.argv[1]).href
    : false;
if (isMainModule) {
    start();
}
//# sourceMappingURL=server.js.map