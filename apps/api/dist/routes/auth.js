import { register, login, getMe } from '../controllers/authController.js';
import { authenticateRequest } from '../middleware/auth.js';
export async function authRoutes(fastify) {
    const userBase = {
        type: 'object',
        properties: {
            id: { type: 'string' },
            email: { type: 'string', format: 'email' },
            full_name: { type: 'string', nullable: true },
            avatar_url: { type: 'string', nullable: true },
        },
        required: ['id', 'email'],
        additionalProperties: false,
    };
    const userRegister = {
        type: 'object',
        properties: {
            ...userBase.properties,
            created_at: { type: 'string', format: 'date-time' },
        },
        required: [...userBase.required, 'created_at'],
        additionalProperties: false,
    };
    const userMe = {
        type: 'object',
        properties: {
            ...userBase.properties,
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' },
        },
        required: [...userBase.required, 'created_at', 'updated_at'],
        additionalProperties: false,
    };
    fastify.post('/register', {
        schema: {
            tags: ['auth'],
            body: {
                type: 'object',
                properties: {
                    email: { type: 'string', format: 'email' },
                    password: { type: 'string', minLength: 8 },
                    full_name: { type: 'string' },
                },
                required: ['email', 'password'],
                additionalProperties: false,
            },
            response: {
                201: {
                    type: 'object',
                    properties: {
                        user: userRegister,
                        token: { type: 'string' },
                    },
                    required: ['user', 'token'],
                    additionalProperties: false,
                },
            },
        },
    }, register.bind(fastify));
    fastify.post('/login', {
        schema: {
            tags: ['auth'],
            body: {
                type: 'object',
                properties: {
                    email: { type: 'string', format: 'email' },
                    password: { type: 'string', minLength: 1 },
                },
                required: ['email', 'password'],
                additionalProperties: false,
            },
            response: {
                200: {
                    type: 'object',
                    properties: {
                        user: userBase,
                        token: { type: 'string' },
                    },
                    required: ['user', 'token'],
                    additionalProperties: false,
                },
            },
        },
    }, login.bind(fastify));
    fastify.get('/me', {
        preHandler: [authenticateRequest],
        schema: {
            tags: ['auth'],
            response: {
                200: {
                    type: 'object',
                    properties: {
                        user: userMe,
                    },
                    required: ['user'],
                    additionalProperties: false,
                },
            },
        },
    }, getMe);
}
//# sourceMappingURL=auth.js.map