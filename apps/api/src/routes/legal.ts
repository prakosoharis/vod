import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import bcrypt from 'bcryptjs';
import { createWriteStream } from 'node:fs';
import { mkdir, unlink } from 'node:fs/promises';
import path from 'node:path';
import { pipeline } from 'node:stream/promises';
import { Transform } from 'node:stream';
import { createHmac, randomUUID } from 'node:crypto';
import { z } from 'zod';
import prisma from '../config/database.js';
import { authenticateRequest } from '../middleware/auth.js';

export const LEGAL_VERSIONS = {
  terms: '2026-07-25',
  privacy: '2026-07-25',
} as const;

const categories = [
  'ACCOUNT_LOGIN',
  'PAYMENT',
  'COIN',
  'RENTAL_VOD',
  'LIVE_STREAMING',
  'PLAYBACK',
  'REFUND',
  'PRIVACY_DATA',
  'CONTENT_REPORT',
  'OTHER',
] as const;

const contactSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(254),
  phone: z.string().trim().max(30).optional(),
  category: z.enum(categories),
  transaction_number: z.string().trim().max(120).optional(),
  subject: z.string().trim().min(3).max(180),
  message: z.string().trim().min(10).max(5000),
  privacy_consent: z.literal('true'),
  website: z.string().max(0).optional(),
  form_started_at: z.coerce.number().int().positive(),
});

const CONTACT_WINDOW_MS = 15 * 60 * 1000;
const CONTACT_LIMIT = 5;

export async function resetLegalRateLimitsForTests(): Promise<void> {
  if (process.env.NODE_ENV !== 'test') {
    throw new Error('Rate-limit reset is only available in the test environment');
  }
  await prisma.supportRateLimitAttempt.deleteMany();
}

async function enforceContactRateLimit(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<boolean> {
  const now = Date.now();
  const hashSecret = process.env.RATE_LIMIT_HASH_SECRET || process.env.JWT_SECRET;
  if (!hashSecret) {
    reply.code(503).send({ error: 'Proteksi anti-spam belum dikonfigurasi.' });
    return false;
  }
  const keyHash = createHmac('sha256', hashSecret).update(request.ip).digest('hex');
  const cutoff = new Date(now - CONTACT_WINDOW_MS);
  const accepted = await prisma.$transaction(async (tx) => {
    await tx.$queryRaw<Array<{ locked: number }>>`
      SELECT 1::int AS locked
      FROM pg_advisory_xact_lock(hashtext(${keyHash}))
    `;
    const recent = await tx.supportRateLimitAttempt.count({
      where: { key_hash: keyHash, created_at: { gte: cutoff } },
    });
    if (recent >= CONTACT_LIMIT) return false;
    await tx.supportRateLimitAttempt.create({ data: { key_hash: keyHash } });
    return true;
  });
  if (!accepted) {
    reply.code(429).send({ error: 'Terlalu banyak permintaan. Silakan coba kembali nanti.' });
    return false;
  }
  if (Math.random() < 0.01) {
    await prisma.supportRateLimitAttempt.deleteMany({
      where: { created_at: { lt: cutoff } },
    }).catch(() => undefined);
  }
  return true;
}

function cleanText(value: string): string {
  return value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '').trim();
}

export async function legalRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.get('/legal/config', async () => ({
    versions: LEGAL_VERSIONS,
    support_email: 'email@smashstream.id',
    account_deletion_cooling_off_days:
      process.env.ACCOUNT_DELETION_COOLING_OFF_DAYS || '[BELUM DIKONFIGURASI]',
  }));

  fastify.post('/support/contact', async (request, reply) => {
    if (!(await enforceContactRateLimit(request, reply))) return;

    const fields: Record<string, string> = {};
    let attachmentUrl: string | undefined;
    let attachmentPath: string | undefined;

    if (request.isMultipart()) {
      for await (const part of request.parts()) {
        if (part.type === 'file') {
          if (!part.filename) continue;
          if (attachmentPath) {
            await unlink(attachmentPath).catch(() => undefined);
            return reply.code(400).send({ error: 'Hanya satu lampiran yang diperbolehkan.' });
          }
          const allowedExtensionsByMime = new Map<string, Set<string>>([
            ['image/jpeg', new Set(['.jpg', '.jpeg'])],
            ['image/png', new Set(['.png'])],
            ['image/webp', new Set(['.webp'])],
            ['application/pdf', new Set(['.pdf'])],
          ]);
          const originalExtension = path.extname(part.filename).toLowerCase();
          const allowedExtensions = allowedExtensionsByMime.get(part.mimetype);
          if (!allowedExtensions?.has(originalExtension)) {
            return reply.code(400).send({ error: 'Tipe lampiran tidak didukung.' });
          }
          const extension = part.mimetype === 'application/pdf'
            ? '.pdf'
            : part.mimetype === 'image/png'
              ? '.png'
              : part.mimetype === 'image/webp' ? '.webp' : '.jpg';
          const fileName = `${randomUUID()}${extension}`;
          const directory = path.join(process.env.UPLOADS_PATH || '/app/uploads', 'support');
          await mkdir(directory, { recursive: true });
          const destination = path.join(directory, fileName);
          attachmentPath = destination;
          let received = 0;
          const maxBytes = 5 * 1024 * 1024;
          const limiter = new Transform({
            transform(chunk, _encoding, callback) {
              received += chunk.length;
              callback(received > maxBytes ? new Error('ATTACHMENT_TOO_LARGE') : null, chunk);
            },
          });
          try {
            await pipeline(part.file, limiter, createWriteStream(destination, { flags: 'wx' }));
          } catch (error: any) {
            await unlink(destination).catch(() => undefined);
            if (error.message === 'ATTACHMENT_TOO_LARGE') {
              return reply.code(400).send({ error: 'Ukuran lampiran maksimal 5 MB.' });
            }
            throw error;
          }
          attachmentUrl = `/api/uploads/support/${fileName}`;
        } else {
          fields[part.fieldname] = String(part.value);
        }
      }
    } else {
      Object.assign(fields, request.body as Record<string, string>);
    }

    const parsed = contactSchema.safeParse(fields);
    if (!parsed.success) {
      if (attachmentPath) await unlink(attachmentPath).catch(() => undefined);
      return reply.code(400).send({ error: 'Data formulir tidak valid.', details: parsed.error.flatten() });
    }
    if (Date.now() - parsed.data.form_started_at < 2500) {
      if (attachmentPath) await unlink(attachmentPath).catch(() => undefined);
      return reply.code(400).send({ error: 'Formulir dikirim terlalu cepat.' });
    }

    const ticketNumber = `SMASH-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${randomUUID().slice(0, 8).toUpperCase()}`;
    try {
      await prisma.$transaction(async (tx) => {
        const ticket = await tx.supportTicket.create({
          data: {
            ticket_number: ticketNumber,
            name: cleanText(parsed.data.name),
            email: parsed.data.email.toLowerCase(),
            phone: parsed.data.phone ? cleanText(parsed.data.phone) : null,
            category: parsed.data.category,
            transaction_number: parsed.data.transaction_number
              ? cleanText(parsed.data.transaction_number)
              : null,
            subject: cleanText(parsed.data.subject),
            message: cleanText(parsed.data.message),
            attachment_url: attachmentUrl,
          },
        });
        await tx.complianceAuditLog.create({
          data: {
            event_type: parsed.data.category === 'REFUND'
              ? 'REFUND_REQUESTED'
              : 'SUPPORT_TICKET_CREATED',
            subject_type: 'SUPPORT_TICKET',
            subject_id: ticket.id,
            source_platform: String(request.headers['x-platform'] || 'web'),
            metadata: { category: parsed.data.category, ticket_number: ticketNumber },
          },
        });
      });
    } catch (error) {
      if (attachmentPath) await unlink(attachmentPath).catch(() => undefined);
      throw error;
    }

    return reply.code(201).send({ ticket_number: ticketNumber });
  });

  fastify.get(
    '/account-deletion',
    { preHandler: [authenticateRequest] },
    async (request, reply) => {
      const userId = (request.user as any).userId;
      const deletionRequest = await prisma.accountDeletionRequest.findFirst({
        where: { user_id: userId, status: 'PENDING' },
        orderBy: { requested_at: 'desc' },
      });
      return reply.send({ request: deletionRequest });
    }
  );

  fastify.post(
    '/account-deletion',
    { preHandler: [authenticateRequest] },
    async (request, reply) => {
      const body = z.object({
        password: z.string().min(1),
        source_platform: z.enum(['web', 'android', 'ios']),
      }).parse(request.body);
      const userId = (request.user as any).userId;
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user || !user.password_hash || !(await bcrypt.compare(body.password, user.password_hash))) {
        return reply.code(401).send({ error: 'Autentikasi ulang gagal.' });
      }
      const existing = await prisma.accountDeletionRequest.findFirst({
        where: { user_id: userId, status: 'PENDING' },
      });
      if (existing) return reply.code(409).send({ error: 'Permintaan penghapusan sudah aktif.' });

      const coolingOffDays = Number(process.env.ACCOUNT_DELETION_COOLING_OFF_DAYS);
      if (!Number.isInteger(coolingOffDays) || coolingOffDays < 1) {
        return reply.code(503).send({
          error: 'Masa tunggu penghapusan akun belum dikonfigurasi oleh bisnis.',
        });
      }
      const scheduledFor = new Date(Date.now() + coolingOffDays * 86_400_000);
      const deletionRequest = await prisma.$transaction(async (tx) => {
        const created = await tx.accountDeletionRequest.create({
          data: {
            user_id: userId,
            scheduled_for: scheduledFor,
            source_platform: body.source_platform,
          },
        });
        await tx.complianceAuditLog.create({
          data: {
            user_id: userId,
            event_type: 'ACCOUNT_DELETION_REQUESTED',
            subject_type: 'ACCOUNT_DELETION_REQUEST',
            subject_id: created.id,
            source_platform: body.source_platform,
          },
        });
        return created;
      });
      return reply.code(201).send({ request: deletionRequest });
    }
  );

  fastify.post(
    '/account-deletion/cancel',
    { preHandler: [authenticateRequest] },
    async (request, reply) => {
      const userId = (request.user as any).userId;
      const active = await prisma.accountDeletionRequest.findFirst({
        where: { user_id: userId, status: 'PENDING' },
      });
      if (!active) return reply.code(404).send({ error: 'Tidak ada permintaan aktif.' });
      const cancelled = await prisma.$transaction(async (tx) => {
        const updated = await tx.accountDeletionRequest.update({
          where: { id: active.id },
          data: { status: 'CANCELLED', cancelled_at: new Date() },
        });
        await tx.complianceAuditLog.create({
          data: {
            user_id: userId,
            event_type: 'ACCOUNT_DELETION_CANCELLED',
            subject_type: 'ACCOUNT_DELETION_REQUEST',
            subject_id: active.id,
            source_platform: active.source_platform,
          },
        });
        return updated;
      });
      return reply.send({ request: cancelled });
    }
  );
}
