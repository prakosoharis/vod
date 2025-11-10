import { FastifyReply, FastifyRequest } from 'fastify';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import prisma from '../config/database.js';
import { generateToken } from '../utils/jwt.js';
import type { FastifyInstance } from 'fastify';

const registerSchema = z.object({
  email: z.string().email(),
  full_name: z.string().min(1).optional(),
  password: z.string().min(8),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function register(
  this: FastifyInstance,
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  try {
    const body = registerSchema.parse(request.body);

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: body.email },
    });

    if (existingUser) {
      reply.code(409).send({ error: 'Email already exists' });
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(body.password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: body.email,
        full_name: body.full_name,
        password_hash: hashedPassword,
      },
      select: {
        id: true,
        email: true,
        full_name: true,
        avatar_url: true,
        created_at: true,
      },
    });

    // Generate token
    const token = generateToken(this, {
      userId: user.id,
      email: user.email,
    });

    reply.code(201).send({
      user,
      token,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      reply.code(400).send({ error: 'Validation error', details: error.errors });
      return;
    }

    reply.code(500).send({ error: 'Internal server error' });
  }
}

export async function login(
  this: FastifyInstance,
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  try {
    const body = loginSchema.parse(request.body);
    console.log('🔍 Login attempt for email:', body.email);

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: body.email },
    });

    if (!user) {
      console.log('❌ User not found:', body.email);
      reply.code(401).send({ error: 'Invalid email or password' });
      return;
    }

    console.log('✅ User found:', user.email, 'ID:', user.id);

    // Verify password
    const isValidPassword = await bcrypt.compare(body.password, user.password_hash);
    console.log('🔑 Password verification result:', isValidPassword);

    if (!isValidPassword) {
      console.log('❌ Invalid password for:', body.email);
      reply.code(401).send({ error: 'Invalid email or password' });
      return;
    }

    console.log('✅ Login successful for:', body.email);

    // Generate token
    const token = generateToken(this, {
      userId: user.id,
      email: user.email,
    });

    reply.send({
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        avatar_url: user.avatar_url,
      },
      token,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      reply.code(400).send({ error: 'Validation error', details: error.errors });
      return;
    }

    reply.code(500).send({ error: 'Internal server error' });
  }
}

export async function getMe(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  try {
    if (!request.user) {
      reply.code(401).send({ error: 'Unauthorized' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: (request.user as any).userId },
      select: {
        id: true,
        email: true,
        full_name: true,
        avatar_url: true,
        created_at: true,
        updated_at: true,
      },
    });

    if (!user) {
      reply.code(404).send({ error: 'User not found' });
      return;
    }

    reply.send({ user });
  } catch (error) {
    reply.code(500).send({ error: 'Internal server error' });
  }
}

