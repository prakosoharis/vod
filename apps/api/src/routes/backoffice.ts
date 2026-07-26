import { BackofficeRole, ContentType, Prisma } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import prisma from '../config/database.js';
import {
  allowBackofficeRoles,
  authenticateBackoffice,
  BackofficeIdentity,
} from '../middleware/backofficeAuth.js';
import { createContent, getContentRentals, updateContent } from '../controllers/contentController.js';
import {
  getAllUsers,
  createUser,
  getUserById,
  getUserRentalsAdmin,
  updateUser,
} from '../controllers/userController.js';

const managementRoles: BackofficeRole[] = ['SUPERUSER', 'ADMIN'];
const staffView = {
  id: true, email: true, full_name: true, role: true, publisher_id: true,
  is_active: true, created_at: true, updated_at: true,
  publisher: { select: { id: true, name: true } },
} satisfies Prisma.BackofficeUserSelect;

function identity(request: FastifyRequest): BackofficeIdentity {
  return (request as any).backofficeUser;
}

async function assertPublisherOwnsContent(request: FastifyRequest, reply: FastifyReply) {
  const staff = identity(request);
  if (staff.role !== 'PUBLISHER') return;
  const { id } = request.params as { id: string };
  const content = await prisma.content.findUnique({ where: { id }, select: { publisher_id: true } });
  if (!content || content.publisher_id !== staff.publisher_id) {
    return reply.code(404).send({ error: 'Konten tidak ditemukan' });
  }
}

export async function backofficeRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.post('/auth/login', async (request, reply) => {
    const body = request.body as { email?: string; password?: string };
    const email = body.email?.trim().toLowerCase();
    if (!email || !body.password) return reply.code(400).send({ error: 'Email dan password wajib diisi' });

    const staff = await prisma.backofficeUser.findUnique({
      where: { email },
      include: { publisher: { select: { id: true, name: true } } },
    });
    if (!staff?.is_active || !(await bcrypt.compare(body.password, staff.password_hash))) {
      return reply.code(401).send({ error: 'Email atau password tidak valid' });
    }
    if (staff.role === 'PUBLISHER' && !staff.publisher_id) {
      return reply.code(403).send({ error: 'Akun publisher belum terhubung ke data publisher' });
    }
    const token = fastify.jwt.sign(
      { realm: 'backoffice', purpose: 'access', staffId: staff.id },
      { expiresIn: process.env.BACKOFFICE_ACCESS_TOKEN_TTL || '8h' },
    );
    const { password_hash: _password, ...user } = staff;
    return reply.send({ token, user });
  });

  fastify.get('/auth/me', { preHandler: [authenticateBackoffice] }, async (request) => {
    const staff = await prisma.backofficeUser.findUnique({
      where: { id: identity(request).id },
      select: staffView,
    });
    return { user: staff };
  });

  fastify.get('/staff', {
    preHandler: [authenticateBackoffice, allowBackofficeRoles(['SUPERUSER'])],
  }, async () => prisma.backofficeUser.findMany({ select: staffView, orderBy: { created_at: 'desc' } }));

  fastify.post('/staff', {
    preHandler: [authenticateBackoffice, allowBackofficeRoles(['SUPERUSER'])],
  }, async (request, reply) => {
    const body = request.body as {
      email?: string; full_name?: string; password?: string;
      role?: BackofficeRole; publisher_id?: string | null;
    };
    if (!body.email || !body.full_name || !body.password || !['ADMIN', 'PUBLISHER'].includes(body.role || '')) {
      return reply.code(400).send({ error: 'Nama, email, password, dan role ADMIN/PUBLISHER wajib diisi' });
    }
    if (body.password.length < 10) return reply.code(400).send({ error: 'Password minimal 10 karakter' });
    if (body.role === 'PUBLISHER' && !body.publisher_id) {
      return reply.code(400).send({ error: 'Akun publisher wajib memilih publisher' });
    }
    try {
      const staff = await prisma.backofficeUser.create({
        data: {
          email: body.email.trim().toLowerCase(),
          full_name: body.full_name.trim(),
          password_hash: await bcrypt.hash(body.password, 12),
          role: body.role!,
          publisher_id: body.role === 'PUBLISHER' ? body.publisher_id : null,
        },
        select: staffView,
      });
      return reply.code(201).send(staff);
    } catch (error: any) {
      if (error?.code === 'P2002') return reply.code(409).send({ error: 'Email backoffice sudah terdaftar' });
      throw error;
    }
  });

  fastify.patch('/staff/:id', {
    preHandler: [authenticateBackoffice, allowBackofficeRoles(['SUPERUSER'])],
  }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = request.body as {
      email?: string; full_name?: string; password?: string; role?: BackofficeRole;
      publisher_id?: string | null; is_active?: boolean;
    };
    if (body.role && !['ADMIN', 'PUBLISHER'].includes(body.role)) {
      return reply.code(400).send({ error: 'Superuser tidak dapat dibuat atau diubah melalui menu ini' });
    }
    if (body.password && body.password.length < 10) {
      return reply.code(400).send({ error: 'Password minimal 10 karakter' });
    }
    const role = body.role;
    if (role === 'PUBLISHER' && !body.publisher_id) {
      return reply.code(400).send({ error: 'Akun publisher wajib memilih publisher' });
    }
    const target = await prisma.backofficeUser.findUnique({ where: { id }, select: { role: true } });
    if (!target) return reply.code(404).send({ error: 'Akun backoffice tidak ditemukan' });
    if (target.role === 'SUPERUSER' && (body.role || body.is_active === false)) {
      return reply.code(400).send({ error: 'Role dan status superuser tidak dapat diubah' });
    }
    try {
      return await prisma.backofficeUser.update({
        where: { id },
        data: {
          ...(body.email ? { email: body.email.trim().toLowerCase() } : {}),
          ...(body.full_name ? { full_name: body.full_name.trim() } : {}),
          ...(body.password ? { password_hash: await bcrypt.hash(body.password, 12) } : {}),
          ...(role ? { role, publisher_id: role === 'PUBLISHER' ? body.publisher_id : null } : {}),
          ...(body.is_active !== undefined ? { is_active: body.is_active } : {}),
        },
        select: staffView,
      });
    } catch (error: any) {
      if (error?.code === 'P2002') return reply.code(409).send({ error: 'Email backoffice sudah digunakan' });
      throw error;
    }
  });

  fastify.get('/publishers', { preHandler: [authenticateBackoffice] }, async (request) => {
    const staff = identity(request);
    return prisma.publisher.findMany({
      where: staff.role === 'PUBLISHER' ? { id: staff.publisher_id! } : undefined,
      include: { _count: { select: { contents: true, staff_users: true } } },
      orderBy: { name: 'asc' },
    });
  });
  fastify.post('/publishers', {
    preHandler: [authenticateBackoffice, allowBackofficeRoles(managementRoles)],
  }, async (request, reply) => {
    const body = request.body as { name?: string; address?: string; pic_name?: string; pic_phone?: string };
    if (!body.name || !body.address || !body.pic_name || !body.pic_phone) {
      return reply.code(400).send({ error: 'Nama, alamat, PIC, dan nomor telepon PIC wajib diisi' });
    }
    return reply.code(201).send(await prisma.publisher.create({ data: body as Required<typeof body> }));
  });
  fastify.put('/publishers/:id', {
    preHandler: [authenticateBackoffice, allowBackofficeRoles(managementRoles)],
  }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = request.body as { name?: string; address?: string; pic_name?: string; pic_phone?: string };
    return reply.send(await prisma.publisher.update({ where: { id }, data: body }));
  });

  fastify.get('/content', { preHandler: [authenticateBackoffice] }, async (request) => {
    const staff = identity(request);
    const query = request.query as { type?: ContentType; page?: string; limit?: string };
    const page = Math.max(Number(query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(query.limit) || 20, 1), 100);
    const where: Prisma.ContentWhereInput = {
      ...(query.type ? { type: query.type } : {}),
      ...(staff.role === 'PUBLISHER' ? { publisher_id: staff.publisher_id! } : {}),
    };
    const [data, total] = await Promise.all([
      prisma.content.findMany({
        where, skip: (page - 1) * limit, take: limit,
        include: {
          rental_price: true,
          episodes: { orderBy: [{ season_number: 'asc' }, { episode_number: 'asc' }] },
          publisher: true,
          _count: { select: { rentals: true } },
        },
        orderBy: { created_at: 'desc' },
      }),
      prisma.content.count({ where }),
    ]);
    return { data, total, page, totalPages: Math.ceil(total / limit) };
  });
  fastify.get('/content/:id', {
    preHandler: [authenticateBackoffice, assertPublisherOwnsContent],
  }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const result = await prisma.content.findUnique({
      where: { id },
      include: { rental_price: true, episodes: true, publisher: true, _count: { select: { rentals: true } } },
    });
    return result ? reply.send(result) : reply.code(404).send({ error: 'Konten tidak ditemukan' });
  });
  fastify.post('/content', {
    preHandler: [authenticateBackoffice, allowBackofficeRoles(managementRoles)],
  }, createContent);
  fastify.put('/content/:id', {
    preHandler: [authenticateBackoffice, allowBackofficeRoles(managementRoles)],
  }, updateContent);
  fastify.get('/content/:id/rentals', {
    preHandler: [authenticateBackoffice, assertPublisherOwnsContent],
  }, getContentRentals);

  fastify.get('/users', {
    preHandler: [authenticateBackoffice, allowBackofficeRoles(managementRoles)],
  }, getAllUsers);
  fastify.post('/users', {
    preHandler: [authenticateBackoffice, allowBackofficeRoles(managementRoles)],
  }, createUser);
  fastify.get('/users/:id', {
    preHandler: [authenticateBackoffice, allowBackofficeRoles(managementRoles)],
  }, getUserById);
  fastify.get('/users/:id/rentals', {
    preHandler: [authenticateBackoffice, allowBackofficeRoles(managementRoles)],
  }, getUserRentalsAdmin);
  fastify.put('/users/:id', {
    preHandler: [authenticateBackoffice, allowBackofficeRoles(managementRoles)],
  }, updateUser);
}
