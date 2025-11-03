import fastifyJwt from '@fastify/jwt';
import { FastifyInstance } from 'fastify';
import jwt from 'jsonwebtoken';

export interface JWTPayload {
  userId: string;
  email: string;
}

export async function registerJwt(fastify: FastifyInstance): Promise<void> {
  await fastify.register(fastifyJwt, {
    secret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
  });
}

// Overloads to support both legacy Fastify-based usage and new standalone utility
export function generateToken(fastify: FastifyInstance, payload: JWTPayload): string;
export function generateToken(userId: string): string;
export function generateToken(arg1: FastifyInstance | string, arg2?: JWTPayload): string {
  // Legacy: fastify instance + payload
  if (typeof arg1 !== 'string' && arg2) {
    return arg1.jwt.sign(arg2, { expiresIn: '7d' });
  }

  // New: userId only, using jsonwebtoken and env secret
  const userId = arg1 as string;
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not configured');
  }
  return jwt.sign({ userId }, secret, { expiresIn: '7d' });
}

// Overloads to support both legacy Fastify-based usage and new standalone utility
export function verifyToken(fastify: FastifyInstance, token: string): Promise<JWTPayload>;
export function verifyToken(token: string): { userId: string } | null;
export function verifyToken(arg1: FastifyInstance | string, arg2?: string): Promise<JWTPayload> | ({ userId: string } | null) {
  // Legacy: fastify instance + token
  if (typeof arg1 !== 'string' && typeof arg2 === 'string') {
    return arg1.jwt.verify<JWTPayload>(arg2);
  }

  // New: token only, using jsonwebtoken and env secret
  const token = arg1 as string;
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    return null;
  }
  try {
    const decoded = jwt.verify(token, secret);
    if (typeof decoded === 'string') return null;
    if (decoded && typeof (decoded as any).userId === 'string') {
      return { userId: (decoded as any).userId };
    }
    return null;
  } catch (err) {
    // Swallow all verification errors and return null as requested
    return null;
  }
}

