import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';
import { FastifyReply, FastifyRequest } from 'fastify';
import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import prisma from '../config/database.js';
import { LEGAL_VERSIONS } from '../routes/legal.js';
import {
  authConfig, classifyIdentifier, createOtp, createRefreshToken, hashIdentifier,
  hashOtp, hashRefreshToken, maskDestination, normalizeEmail, secureEqual, validatePassword,
} from '../auth/authCore.js';
import { getOtpProvider } from '../auth/otpProvider.js';
import { generateToken } from '../utils/jwt.js';

const platformSchema = z.enum(['web', 'android', 'ios']);
const registrationSchema = z.object({
  method: z.literal('email'),
  full_name: z.string().trim().min(2).max(100),
  email: z.string().email(),
  password: z.string(),
  legal_consent: z.literal(true),
  terms_version: z.literal(LEGAL_VERSIONS.terms),
  privacy_version: z.literal(LEGAL_VERSIONS.privacy),
  source_platform: platformSchema,
  device_name: z.string().max(120).optional(),
});

const publicUser = (user: any) => ({
  id: user.id,
  username: user.username,
  email: user.email,
  phone: user.phone_e164,
  full_name: user.full_name,
  avatar_url: user.avatar_url,
  account_status: user.account_status,
});

const requestIpHash = (request: FastifyRequest): string => hashIdentifier(request.ip || 'unknown');
const refreshCookieName = 'smash_refresh';
const refreshCookie = (token: string, maxAgeSeconds: number): string => [
  `${refreshCookieName}=${encodeURIComponent(token)}`,
  'Path=/api/auth',
  'HttpOnly',
  'SameSite=Lax',
  ...(process.env.NODE_ENV === 'production' ? ['Secure'] : []),
  `Max-Age=${maxAgeSeconds}`,
].join('; ');
const readCookie = (request: FastifyRequest, name: string): string | undefined => {
  const pair = String(request.headers.cookie || '').split(';')
    .map((item) => item.trim()).find((item) => item.startsWith(`${name}=`));
  return pair ? decodeURIComponent(pair.slice(name.length + 1)) : undefined;
};
const sendSession = (reply: FastifyReply, platform: string, data: any) => {
  if (platform === 'web') {
    reply.header('set-cookie', refreshCookie(data.refresh_token, authConfig().refreshDays * 86_400));
    const { refresh_token: _privateRefresh, ...safe } = data;
    return reply.send(safe);
  }
  return reply.send(data);
};

async function enforceOtpSendLimit(destinationHash: string): Promise<void> {
  const config = authConfig();
  const since = new Date(Date.now() - 3_600_000);
  const count = await prisma.otpChallenge.count({
    where: { destination_hash: destinationHash, created_at: { gte: since } },
  });
  if (count >= config.otpMaxSendsPerHour) {
    throw Object.assign(new Error('Terlalu banyak permintaan kode. Coba lagi nanti.'), { statusCode: 429 });
  }
}

async function deliverChallenge(
  userId: string,
  purpose: 'REGISTRATION' | 'PASSWORD_RESET',
  channel: 'EMAIL' | 'WHATSAPP',
  destination: string,
) {
  const config = authConfig();
  const destinationHash = hashIdentifier(destination);
  await enforceOtpSendLimit(destinationHash);
  const id = crypto.randomUUID();
  const otp = createOtp();
  const now = Date.now();
  await prisma.$transaction(async (tx) => {
    await tx.otpChallenge.updateMany({
      where: { user_id: userId, purpose, consumed_at: null },
      data: { consumed_at: new Date() },
    });
    await tx.otpChallenge.create({
      data: {
        id,
        user_id: userId,
        purpose,
        channel,
        destination,
        destination_hash: destinationHash,
        otp_hash: hashOtp(id, otp),
        expires_at: new Date(now + config.otpTtlSeconds * 1000),
        resend_after: new Date(now + config.otpResendSeconds * 1000),
        max_attempts: config.otpMaxAttempts,
      },
    });
  });
  try {
    const result = await getOtpProvider(channel).send({
      channel, purpose, destination, otp,
      expiresMinutes: Math.ceil(config.otpTtlSeconds / 60),
      idempotencyKey: id,
    });
    await prisma.otpChallenge.update({
      where: { id },
      data: { provider_message_id: result.messageId },
    });
  } catch (error) {
    await prisma.otpChallenge.update({ where: { id }, data: { consumed_at: new Date() } });
    throw error;
  }
  return {
    challenge_id: id,
    destination_masked: maskDestination(destination),
    expires_in: config.otpTtlSeconds,
    resend_after: config.otpResendSeconds,
  };
}

async function createSession(thisArg: FastifyInstance, user: any, request: FastifyRequest, platform: string, deviceName?: string) {
  const refreshToken = createRefreshToken();
  const config = authConfig();
  const session = await prisma.authSession.create({
    data: {
      user_id: user.id,
      refresh_token_hash: hashRefreshToken(refreshToken),
      platform,
      device_name: deviceName,
      ip_hash: requestIpHash(request),
      user_agent: request.headers['user-agent'],
      expires_at: new Date(Date.now() + config.refreshDays * 86_400_000),
    },
  });
  const accessToken = generateToken(thisArg, {
    userId: user.id,
    email: user.email ?? undefined,
    sessionId: session.id,
  });
  return { user: publicUser(user), token: accessToken, access_token: accessToken, refresh_token: refreshToken };
}

export async function startRegistration(this: FastifyInstance, request: FastifyRequest, reply: FastifyReply) {
  try {
    const body = registrationSchema.parse(request.body);
    validatePassword(body.password);
    const email = normalizeEmail(body.email);
    const duplicate = await prisma.user.findFirst({
      where: { email_normalized: email },
    });
    if (duplicate?.account_status === 'PENDING_VERIFICATION') {
      await prisma.user.delete({ where: { id: duplicate.id } });
    } else if (duplicate) {
      return reply.code(409).send({ error: 'Data registrasi tidak dapat digunakan.' });
    }
    const passwordHash = await bcrypt.hash(body.password, 12);
    const user = await prisma.$transaction(async (tx) => {
      const created = await tx.user.create({
        data: {
          email, email_normalized: email,
          full_name: body.full_name,
          password_hash: passwordHash,
          account_status: 'PENDING_VERIFICATION',
        },
      });
      await tx.legalConsent.createMany({
        data: ['TERMS', 'PRIVACY'].map((document_type) => ({
          user_id: created.id,
          document_type: document_type as 'TERMS' | 'PRIVACY',
          document_version: document_type === 'TERMS' ? body.terms_version : body.privacy_version,
          source_platform: body.source_platform,
          user_agent: request.headers['user-agent'],
        })),
      });
      return created;
    });
    const challenge = await deliverChallenge(
      user.id, 'REGISTRATION', 'EMAIL', email,
    );
    return reply.code(202).send({ ...challenge, method: 'email' });
  } catch (error: any) {
    if (error instanceof z.ZodError) return reply.code(400).send({ error: 'Data registrasi tidak valid.' });
    request.log.warn({ err: { message: error.message } }, 'Registration start failed');
    return reply.code(error.statusCode || 503).send({ error: error.statusCode ? error.message : 'Layanan verifikasi belum tersedia. Coba lagi nanti.' });
  }
}

export async function verifyRegistration(this: FastifyInstance, request: FastifyRequest, reply: FastifyReply) {
  const parsed = z.object({
    challenge_id: z.string().uuid(), otp: z.string().regex(/^\d{6}$/),
    source_platform: platformSchema, device_name: z.string().max(120).optional(),
  }).safeParse(request.body);
  if (!parsed.success) return reply.code(400).send({ error: 'Kode verifikasi tidak valid.' });
  const { challenge_id, otp, source_platform, device_name } = parsed.data;
  try {
    const result = await prisma.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT id FROM otp_challenges WHERE id = ${challenge_id} FOR UPDATE`;
      const challenge = await tx.otpChallenge.findUnique({ where: { id: challenge_id }, include: { user: true } });
      if (!challenge || challenge.purpose !== 'REGISTRATION' || challenge.consumed_at ||
          challenge.expires_at <= new Date() || challenge.attempts >= challenge.max_attempts) return null;
      if (!secureEqual(challenge.otp_hash, hashOtp(challenge.id, otp))) {
        await tx.otpChallenge.update({ where: { id: challenge.id }, data: { attempts: { increment: 1 } } });
        return null;
      }
      await tx.otpChallenge.update({ where: { id: challenge.id }, data: { consumed_at: new Date() } });
      return tx.user.update({
        where: { id: challenge.user_id },
        data: {
          account_status: 'ACTIVE',
          ...(challenge.channel === 'EMAIL' ? { email_verified_at: new Date() } : { phone_verified_at: new Date() }),
        },
      });
    });
    if (!result) return reply.code(400).send({ error: 'Kode verifikasi salah atau kedaluwarsa.' });
    return sendSession(reply, source_platform, await createSession(this, result, request, source_platform, device_name));
  } catch {
    return reply.code(400).send({ error: 'Kode verifikasi salah atau kedaluwarsa.' });
  }
}

export async function resendRegistration(request: FastifyRequest, reply: FastifyReply) {
  const parsed = z.object({ challenge_id: z.string().uuid() }).safeParse(request.body);
  if (!parsed.success) return reply.code(400).send({ error: 'Permintaan tidak valid.' });
  const previous = await prisma.otpChallenge.findUnique({ where: { id: parsed.data.challenge_id } });
  if (!previous || previous.purpose !== 'REGISTRATION' || previous.resend_after > new Date()) {
    return reply.code(429).send({ error: 'Kode belum dapat dikirim ulang.' });
  }
  try {
    return reply.send(await deliverChallenge(previous.user_id, 'REGISTRATION', previous.channel, previous.destination));
  } catch {
    return reply.code(503).send({ error: 'Kode belum dapat dikirim. Coba lagi nanti.' });
  }
}

export async function loginWithIdentifier(this: FastifyInstance, request: FastifyRequest, reply: FastifyReply) {
  const parsed = z.object({
    identifier: z.string().min(1).optional(),
    email: z.string().min(1).optional(),
    password: z.string().min(1),
    source_platform: platformSchema.default('web'), device_name: z.string().max(120).optional(),
  }).refine((body) => Boolean(body.identifier || body.email)).safeParse(request.body);
  const generic = { error: 'Data login tidak sesuai. Periksa kembali dan coba lagi.' };
  if (!parsed.success) return reply.code(401).send(generic);
  let identifier;
  try {
    identifier = classifyIdentifier(parsed.data.identifier || parsed.data.email!);
  } catch {
    return reply.code(401).send(generic);
  }
  const identifierHash = hashIdentifier(identifier.normalized);
  const ipHash = requestIpHash(request);
  const config = authConfig();
  const since = new Date(Date.now() - config.loginWindowSeconds * 1000);
  const [identifierFailures, ipFailures] = await Promise.all([
    prisma.loginAttempt.count({
      where: { identifier_hash: identifierHash, succeeded: false, created_at: { gte: since } },
    }),
    prisma.loginAttempt.count({
      where: { ip_hash: ipHash, succeeded: false, created_at: { gte: since } },
    }),
  ]);
  if (identifierFailures >= config.loginMaxAttempts || ipFailures >= config.loginMaxAttempts * 5) {
    return reply.code(429).send({ error: 'Terlalu banyak percobaan. Coba lagi nanti.' });
  }
  const user = await prisma.user.findFirst({ where: { email_normalized: identifier.normalized } });
  const valid = Boolean(user?.password_hash) && await bcrypt.compare(parsed.data.password, user!.password_hash!);
  const active = user?.account_status === 'ACTIVE' && !user.deleted_at;
  await prisma.loginAttempt.create({
    data: {
      user_id: user?.id, identifier_hash: identifierHash, ip_hash: ipHash,
      platform: parsed.data.source_platform, succeeded: Boolean(valid && active),
      reason: valid && active ? null : 'INVALID_CREDENTIALS_OR_STATUS',
    },
  });
  if (!valid || !active) return reply.code(401).send(generic);
  return sendSession(
    reply,
    parsed.data.source_platform,
    await createSession(this, user, request, parsed.data.source_platform, parsed.data.device_name),
  );
}

export async function refreshSession(this: FastifyInstance, request: FastifyRequest, reply: FastifyReply) {
  const parsed = z.object({ refresh_token: z.string().min(32).optional() }).safeParse(request.body || {});
  const presentedToken = parsed.success
    ? (parsed.data.refresh_token || readCookie(request, refreshCookieName))
    : undefined;
  if (!presentedToken) return reply.code(401).send({ error: 'Session tidak valid.' });
  const hash = hashRefreshToken(presentedToken);
  const session = await prisma.authSession.findUnique({ where: { refresh_token_hash: hash }, include: { user: true } });
  if (!session || session.revoked_at || session.expires_at <= new Date() || session.user.account_status !== 'ACTIVE') {
    if (session?.user_id) await prisma.authSession.updateMany({ where: { user_id: session.user_id }, data: { revoked_at: new Date() } });
    return reply.code(401).send({ error: 'Session tidak valid.' });
  }
  const nextToken = createRefreshToken();
  const next = await prisma.authSession.create({
    data: {
      user_id: session.user_id, refresh_token_hash: hashRefreshToken(nextToken),
      platform: session.platform, device_name: session.device_name,
      ip_hash: requestIpHash(request), user_agent: request.headers['user-agent'],
      expires_at: session.expires_at,
    },
  });
  await prisma.authSession.update({ where: { id: session.id }, data: { revoked_at: new Date(), replaced_by_id: next.id } });
  const access = generateToken(this, { userId: session.user_id, email: session.user.email ?? undefined, sessionId: next.id });
  const response = { token: access, access_token: access, refresh_token: nextToken };
  return sendSession(reply, session.platform, response);
}

export async function logoutSession(request: FastifyRequest, reply: FastifyReply) {
  const sessionId = (request.user as any)?.sessionId;
  if (sessionId) await prisma.authSession.updateMany({ where: { id: sessionId }, data: { revoked_at: new Date() } });
  reply.header('set-cookie', refreshCookie('', 0));
  return reply.code(204).send();
}

export async function logoutAllSessions(request: FastifyRequest, reply: FastifyReply) {
  await prisma.authSession.updateMany({
    where: { user_id: (request.user as any).userId, revoked_at: null },
    data: { revoked_at: new Date() },
  });
  return reply.code(204).send();
}

export async function listSessions(request: FastifyRequest, reply: FastifyReply) {
  const sessions = await prisma.authSession.findMany({
    where: { user_id: (request.user as any).userId, revoked_at: null, expires_at: { gt: new Date() } },
    select: { id: true, device_name: true, platform: true, created_at: true, last_used_at: true, expires_at: true },
    orderBy: { last_used_at: 'desc' },
  });
  return reply.send({ sessions });
}

export async function forgotPassword(request: FastifyRequest, reply: FastifyReply) {
  const generic = { message: 'Jika akun ditemukan, instruksi pemulihan akan dikirim melalui email terdaftar.' };
  const parsed = z.object({ email: z.string().email() }).safeParse(request.body);
  if (!parsed.success) return reply.send(generic);
  try {
    const identifier = classifyIdentifier(parsed.data.email);
    const user = await prisma.user.findFirst({ where: { email_normalized: identifier.normalized } });
    if (user?.account_status === 'ACTIVE') {
      const destination = user.email_verified_at && user.email
        ? { channel: 'EMAIL' as const, value: user.email }
        : null;
      if (destination) await deliverChallenge(user.id, 'PASSWORD_RESET', destination.channel, destination.value);
    }
  } catch {
    // Enumeration-safe response; provider failures are not exposed here.
  }
  return reply.send(generic);
}

export async function verifyRecovery(this: FastifyInstance, request: FastifyRequest, reply: FastifyReply) {
  const parsed = z.object({ challenge_id: z.string().uuid(), otp: z.string().regex(/^\d{6}$/) }).safeParse(request.body);
  if (!parsed.success) return reply.code(400).send({ error: 'Kode pemulihan salah atau kedaluwarsa.' });
  const challenge = await prisma.$transaction(async (tx) => {
    await tx.$queryRaw`SELECT id FROM otp_challenges WHERE id = ${parsed.data.challenge_id} FOR UPDATE`;
    const current = await tx.otpChallenge.findUnique({ where: { id: parsed.data.challenge_id } });
    if (!current || current.purpose !== 'PASSWORD_RESET' || current.consumed_at ||
        current.expires_at <= new Date() || current.attempts >= current.max_attempts) return null;
    if (!secureEqual(current.otp_hash, hashOtp(current.id, parsed.data.otp))) {
      await tx.otpChallenge.update({ where: { id: current.id }, data: { attempts: { increment: 1 } } });
      return null;
    }
    await tx.otpChallenge.update({ where: { id: current.id }, data: { consumed_at: new Date() } });
    return current;
  });
  if (!challenge) {
    return reply.code(400).send({ error: 'Kode pemulihan salah atau kedaluwarsa.' });
  }
  const recoveryToken = this.jwt.sign(
    { userId: challenge.user_id, purpose: 'password-reset', challengeId: challenge.id },
    { expiresIn: '10m' },
  );
  return reply.send({ recovery_token: recoveryToken });
}

export async function resetPassword(this: FastifyInstance, request: FastifyRequest, reply: FastifyReply) {
  const parsed = z.object({ recovery_token: z.string(), password: z.string() }).safeParse(request.body);
  if (!parsed.success) return reply.code(400).send({ error: 'Permintaan reset tidak valid.' });
  try {
    validatePassword(parsed.data.password);
    const payload = this.jwt.verify<any>(parsed.data.recovery_token);
    if (payload.purpose !== 'password-reset' || !payload.userId) throw new Error();
    const passwordHash = await bcrypt.hash(parsed.data.password, 12);
    await prisma.$transaction([
      prisma.user.update({ where: { id: payload.userId }, data: { password_hash: passwordHash } }),
      prisma.authSession.updateMany({ where: { user_id: payload.userId, revoked_at: null }, data: { revoked_at: new Date() } }),
    ]);
    return reply.send({ message: 'Password berhasil diperbarui. Silakan masuk kembali.' });
  } catch {
    return reply.code(400).send({ error: 'Token reset tidak valid atau kedaluwarsa.' });
  }
}

export async function socialUnavailable(request: FastifyRequest, reply: FastifyReply) {
  const provider = String((request.params as any).provider || '').toUpperCase();
  if (!['GOOGLE', 'FACEBOOK'].includes(provider)) return reply.code(404).send({ error: 'Provider tidak tersedia.' });
  const required = provider === 'GOOGLE'
    ? ['GOOGLE_OAUTH_CLIENT_ID', 'GOOGLE_OAUTH_REDIRECT_URIS']
    : ['FACEBOOK_APP_ID', 'FACEBOOK_OAUTH_REDIRECT_URIS'];
  const configured = required.every((key) => Boolean(process.env[key]));
  return reply.code(configured ? 501 : 503).send({
    error: configured
      ? 'Pertukaran authorization code provider belum diaktifkan.'
      : 'Login sosial belum dikonfigurasi.',
  });
}
