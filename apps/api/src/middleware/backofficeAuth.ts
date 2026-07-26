import { BackofficeRole } from '@prisma/client';
import { FastifyReply, FastifyRequest } from 'fastify';
import prisma from '../config/database.js';

export interface BackofficeIdentity {
  id: string;
  email: string;
  full_name: string;
  role: BackofficeRole;
  publisher_id: string | null;
}

export async function authenticateBackoffice(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  try {
    const payload = await request.jwtVerify<{
      realm?: string;
      staffId?: string;
      purpose?: string;
    }>();
    if (payload.realm !== 'backoffice' || payload.purpose !== 'access' || !payload.staffId) {
      return reply.code(401).send({ error: 'Token backoffice tidak valid' });
    }

    const staff = await prisma.backofficeUser.findUnique({
      where: { id: payload.staffId },
      select: {
        id: true,
        email: true,
        full_name: true,
        role: true,
        publisher_id: true,
        is_active: true,
      },
    });
    if (!staff?.is_active || (staff.role === 'PUBLISHER' && !staff.publisher_id)) {
      return reply.code(401).send({ error: 'Akun backoffice tidak aktif atau tidak valid' });
    }
    (request as any).backofficeUser = {
      id: staff.id,
      email: staff.email,
      full_name: staff.full_name,
      role: staff.role,
      publisher_id: staff.publisher_id,
    } satisfies BackofficeIdentity;
  } catch {
    return reply.code(401).send({ error: 'Silakan login ke backoffice' });
  }
}

export function allowBackofficeRoles(roles: BackofficeRole[]) {
  return async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const staff = (request as any).backofficeUser as BackofficeIdentity | undefined;
    if (!staff || !roles.includes(staff.role)) {
      return reply.code(403).send({ error: 'Anda tidak memiliki akses untuk tindakan ini' });
    }
  };
}

