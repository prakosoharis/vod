import { FastifyReply, FastifyRequest } from 'fastify';
import prisma from '../config/database.js';

export async function getMe(
  request: FastifyRequest,
  reply: FastifyReply,
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
        username: true,
        phone_e164: true,
        account_status: true,
        email_verified_at: true,
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
    const { phone_e164, ...rest } = user;
    reply.send({ user: { ...rest, phone: phone_e164, email_verified: Boolean(rest.email_verified_at) } });
  } catch {
    reply.code(500).send({ error: 'Internal server error' });
  }
}
