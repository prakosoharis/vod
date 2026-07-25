import { FastifyInstance } from 'fastify';
import { getMe } from '../controllers/authController.js';
import { authenticateRequest } from '../middleware/auth.js';
import {
  forgotPassword, listSessions, loginWithIdentifier, logoutAllSessions,
  logoutSession, refreshSession, resendRegistration, resetPassword,
  socialUnavailable, startRegistration, verifyRecovery, verifyRegistration,
} from '../controllers/authV2Controller.js';

export async function authRoutes(fastify: FastifyInstance): Promise<void> {
  const userBase = {
    type: 'object',
    properties: {
      id: { type: 'string' },
      email: { type: 'string', format: 'email', nullable: true },
      username: { type: 'string', nullable: true },
      phone: { type: 'string', nullable: true },
      account_status: { type: 'string', nullable: true },
      full_name: { type: 'string', nullable: true },
      avatar_url: { type: 'string', nullable: true },
    },
    required: ['id'],
    additionalProperties: false,
  } as const;

  const userMe = {
    type: 'object',
    properties: {
      ...userBase.properties,
      created_at: { type: 'string', format: 'date-time' },
      updated_at: { type: 'string', format: 'date-time' },
    },
    required: [...userBase.required, 'created_at', 'updated_at'],
    additionalProperties: false,
  } as const;

  fastify.post('/register', startRegistration.bind(fastify));
  fastify.post('/register/start', startRegistration.bind(fastify));
  fastify.post('/register/verify', verifyRegistration.bind(fastify));
  fastify.post('/register/resend', resendRegistration);

  fastify.post(
    '/login',
    {
      schema: {
        tags: ['auth'],
        body: {
          type: 'object',
          properties: {
            identifier: { type: 'string', minLength: 1 },
            email: { type: 'string', minLength: 1 },
            password: { type: 'string', minLength: 1 },
            source_platform: { type: 'string', enum: ['web', 'android', 'ios'] },
            device_name: { type: 'string' },
          },
          required: ['password'],
          anyOf: [{ required: ['identifier'] }, { required: ['email'] }],
          additionalProperties: false,
        },
      },
    },
    loginWithIdentifier.bind(fastify)
  );

  fastify.post('/refresh', refreshSession.bind(fastify));
  fastify.post('/logout', { preHandler: [authenticateRequest] }, logoutSession);
  fastify.post('/logout-all', { preHandler: [authenticateRequest] }, logoutAllSessions);
  fastify.get('/sessions', { preHandler: [authenticateRequest] }, listSessions);
  fastify.post('/forgot-password', forgotPassword);
  fastify.post('/recovery/verify', verifyRecovery.bind(fastify));
  fastify.post('/recovery/reset', resetPassword.bind(fastify));
  fastify.post('/oauth/:provider', socialUnavailable);

  fastify.get(
    '/me',
    {
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
    },
    getMe
  );
}
