import { FastifyReply, FastifyRequest } from 'fastify';
import prisma from '../config/database.js';

export async function requireVerifiedEmail(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const userId = (request.user as any)?.userId;
  if (!userId) {
    return reply.code(401).send({ error: 'Silakan login terlebih dahulu.' });
  }
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email_verified_at: true, account_status: true },
  });
  if (!user?.email_verified_at || user.account_status !== 'ACTIVE') {
    return reply.code(403).send({
      error: 'Verifikasi email diperlukan sebelum melakukan pembelian atau rental.',
      code: 'EMAIL_VERIFICATION_REQUIRED',
    });
  }
}

