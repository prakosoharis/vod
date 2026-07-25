import assert from 'node:assert/strict';
import { mkdir, readdir } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import Fastify from 'fastify';
import { build } from './server.js';
import prisma from './config/database.js';
import { LEGAL_VERSIONS, resetLegalRateLimitsForTests } from './routes/legal.js';
import { runAccountDeletionWorker } from './workers/accountDeletionWorker.js';
import { registerJwt } from './utils/jwt.js';

const uploadsPath = '/tmp/vod-api-legal-tests';
process.env.UPLOADS_PATH = uploadsPath;
process.env.ACCOUNT_DELETION_COOLING_OFF_DAYS = '7';

function multipartPayload(
  fields: Record<string, string>,
  file?: { filename: string; mimetype: string; contents: Buffer },
): { payload: Buffer; contentType: string } {
  const boundary = `----smash-test-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const chunks: Buffer[] = [];
  for (const [name, value] of Object.entries(fields)) {
    chunks.push(Buffer.from(
      `--${boundary}\r\nContent-Disposition: form-data; name="${name}"\r\n\r\n${value}\r\n`,
    ));
  }
  if (file) {
    chunks.push(Buffer.from(
      `--${boundary}\r\nContent-Disposition: form-data; name="attachment"; filename="${file.filename}"\r\nContent-Type: ${file.mimetype}\r\n\r\n`,
    ));
    chunks.push(file.contents);
    chunks.push(Buffer.from('\r\n'));
  }
  chunks.push(Buffer.from(`--${boundary}--\r\n`));
  return {
    payload: Buffer.concat(chunks),
    contentType: `multipart/form-data; boundary=${boundary}`,
  };
}

test('legal, support, consent, CORS, and account deletion lifecycle', async (context) => {
  await mkdir(uploadsPath, { recursive: true });
  const app = await build({ startWebSocket: false });
  const email = `legal-auto-${Date.now()}@example.test`;
  const password = 'LegalAuto!123';
  let userId: string | undefined;
  let ticketNumber: string | undefined;

  context.after(async () => {
    if (ticketNumber) {
      await prisma.complianceAuditLog.deleteMany({
        where: { metadata: { path: ['ticket_number'], equals: ticketNumber } },
      });
      await prisma.supportTicket.deleteMany({ where: { ticket_number: ticketNumber } });
    }
    if (userId) {
      await prisma.complianceAuditLog.deleteMany({ where: { user_id: userId } });
      await prisma.user.deleteMany({ where: { id: userId } });
    }
    await app.close();
  });

  await context.test('CORS accepts configured origin and rejects arbitrary origin', async () => {
    const allowed = await app.inject({
      method: 'GET',
      url: '/api/legal/config',
      headers: { origin: 'http://localhost:3000' },
    });
    assert.equal(allowed.statusCode, 200);
    assert.equal(allowed.headers['access-control-allow-origin'], 'http://localhost:3000');

    const rejected = await app.inject({
      method: 'GET',
      url: '/api/legal/config',
      headers: { origin: 'https://attacker.example' },
    });
    assert.equal(rejected.statusCode, 200);
    assert.equal(rejected.headers['access-control-allow-origin'], undefined);
  });

  await context.test('JWT configuration fails closed for a missing or weak secret', async () => {
    const originalSecret = process.env.JWT_SECRET;
    process.env.JWT_SECRET = 'short';
    const isolatedApp = Fastify();
    await assert.rejects(
      registerJwt(isolatedApp),
      /JWT_SECRET must be configured with at least 24 characters/,
    );
    process.env.JWT_SECRET = originalSecret;
    await isolatedApp.close();
  });

  await context.test('registration rejects missing/false consent and stores accepted versions', async () => {
    const baseBody = {
      email,
      password,
      full_name: 'Legal Automated Test',
      terms_version: LEGAL_VERSIONS.terms,
      privacy_version: LEGAL_VERSIONS.privacy,
      source_platform: 'web',
    };
    const missing = await app.inject({
      method: 'POST',
      url: '/api/auth/register',
      payload: baseBody,
    });
    assert.equal(missing.statusCode, 400);

    const rejected = await app.inject({
      method: 'POST',
      url: '/api/auth/register',
      payload: { ...baseBody, legal_consent: false },
    });
    assert.equal(rejected.statusCode, 400);

    const accepted = await app.inject({
      method: 'POST',
      url: '/api/auth/register',
      headers: { 'user-agent': 'VOD-Automated-Legal-Test/1.0' },
      payload: { ...baseBody, legal_consent: true },
    });
    assert.equal(accepted.statusCode, 201);
    const body = accepted.json();
    userId = body.user.id;
    assert.ok(body.token);

    const consents = await prisma.legalConsent.findMany({
      where: { user_id: userId },
      orderBy: { document_type: 'asc' },
    });
    assert.equal(consents.length, 2);
    assert.deepEqual(consents.map((item) => item.document_type).sort(), ['PRIVACY', 'TERMS']);
    assert.ok(consents.every((item) => item.document_version === LEGAL_VERSIONS.terms));
    assert.ok(consents.every((item) => item.source_platform === 'web'));
    assert.ok(consents.every((item) => item.accepted_at instanceof Date));

    const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
    assert.notEqual(user.password_hash, password);
    assert.match(user.password_hash, /^\$2[aby]\$\d{2}\$/);

    const token = body.token as string;
    (context as typeof context & { token?: string }).token = token;
  });

  await context.test('contact creates ticket and enforces attachment controls and anti-spam', async () => {
    await resetLegalRateLimitsForTests();
    const formStartedAt = String(Date.now() - 5_000);
    const fields = {
      name: 'Legal Tester',
      email: 'support-automated@example.test',
      category: 'PRIVACY_DATA',
      subject: 'Automated legal support',
      message: 'Automated support ticket validation message.',
      privacy_consent: 'true',
      website: '',
      form_started_at: formStartedAt,
    };
    const valid = multipartPayload(fields, {
      filename: 'evidence.png',
      mimetype: 'image/png',
      contents: Buffer.from([0x89, 0x50, 0x4e, 0x47]),
    });
    const created = await app.inject({
      method: 'POST',
      url: '/api/support/contact',
      headers: { 'content-type': valid.contentType, 'x-platform': 'web' },
      payload: valid.payload,
    });
    assert.equal(created.statusCode, 201);
    ticketNumber = created.json().ticket_number;
    assert.match(ticketNumber!, /^SMASH-\d{8}-[A-F0-9]{8}$/);

    const ticket = await prisma.supportTicket.findUniqueOrThrow({
      where: { ticket_number: ticketNumber },
    });
    assert.equal(ticket.status, 'OPEN');
    assert.match(ticket.attachment_url || '', /^\/api\/uploads\/support\/[0-9a-f-]+\.png$/);

    const mismatched = multipartPayload(fields, {
      filename: 'payload.exe',
      mimetype: 'image/png',
      contents: Buffer.from([0x89, 0x50, 0x4e, 0x47]),
    });
    const mismatchResponse = await app.inject({
      method: 'POST',
      url: '/api/support/contact',
      headers: { 'content-type': mismatched.contentType },
      payload: mismatched.payload,
    });
    assert.equal(mismatchResponse.statusCode, 400);

    const honeypot = await app.inject({
      method: 'POST',
      url: '/api/support/contact',
      payload: { ...fields, website: 'bot-value' },
    });
    assert.equal(honeypot.statusCode, 400);

    const tooFast = await app.inject({
      method: 'POST',
      url: '/api/support/contact',
      payload: { ...fields, form_started_at: Date.now() },
    });
    assert.equal(tooFast.statusCode, 400);

    await resetLegalRateLimitsForTests();
    for (let index = 0; index < 5; index += 1) {
      const response = await app.inject({
        method: 'POST',
        url: '/api/support/contact',
        headers: { 'x-forwarded-for': `198.51.100.${index + 1}` },
        payload: { ...fields, website: 'bot-value' },
      });
      assert.equal(response.statusCode, 400);
    }
    const limited = await app.inject({
      method: 'POST',
      url: '/api/support/contact',
      headers: { 'x-forwarded-for': '203.0.113.200' },
      payload: { ...fields, website: 'bot-value' },
    });
    assert.equal(limited.statusCode, 429);
    assert.ok((await readdir(path.join(uploadsPath, 'support'))).length >= 1);
  });

  await context.test('account deletion requires auth and password, exposes status, and cancels', async () => {
    assert.ok(userId);
    const login = await app.inject({
      method: 'POST',
      url: '/api/auth/login',
      payload: { email, password },
    });
    const token = login.json().token as string;

    const unauthenticated = await app.inject({ method: 'GET', url: '/api/account-deletion' });
    assert.equal(unauthenticated.statusCode, 401);

    const wrongPassword = await app.inject({
      method: 'POST',
      url: '/api/account-deletion',
      headers: { authorization: `Bearer ${token}` },
      payload: { password: 'WrongPassword!9', source_platform: 'web' },
    });
    assert.equal(wrongPassword.statusCode, 401);

    const created = await app.inject({
      method: 'POST',
      url: '/api/account-deletion',
      headers: { authorization: `Bearer ${token}` },
      payload: { password, source_platform: 'web' },
    });
    assert.equal(created.statusCode, 201);
    const request = created.json().request;
    assert.equal(request.status, 'PENDING');
    const coolingDays = (
      new Date(request.scheduled_for).getTime() - new Date(request.requested_at).getTime()
    ) / 86_400_000;
    assert.ok(Math.abs(coolingDays - 7) < 0.001);

    const status = await app.inject({
      method: 'GET',
      url: '/api/account-deletion',
      headers: { authorization: `Bearer ${token}` },
    });
    assert.equal(status.statusCode, 200);
    assert.equal(status.json().request.status, 'PENDING');

    const cancelled = await app.inject({
      method: 'POST',
      url: '/api/account-deletion/cancel',
      headers: { authorization: `Bearer ${token}` },
      payload: {},
    });
    assert.equal(cancelled.statusCode, 200);
    assert.equal(cancelled.json().request.status, 'CANCELLED');

    const finalStatus = await app.inject({
      method: 'GET',
      url: '/api/account-deletion',
      headers: { authorization: `Bearer ${token}` },
    });
    assert.equal(finalStatus.statusCode, 200);
    assert.equal(finalStatus.json().request, null);
  });

  await context.test('deletion worker is dry-run by default and anonymizes only when approved', async () => {
    assert.ok(userId);
    const dueRequest = await prisma.accountDeletionRequest.create({
      data: {
        user_id: userId,
        source_platform: 'web',
        scheduled_for: new Date(Date.now() - 60_000),
      },
    });

    const dryRun = await runAccountDeletionWorker({
      dryRun: true,
      limit: 10,
      requestIds: [dueRequest.id],
    });
    assert.equal(dryRun.dry_run, true);
    assert.ok(dryRun.eligible >= 1);
    const stillPending = await prisma.accountDeletionRequest.findUniqueOrThrow({
      where: { id: dueRequest.id },
    });
    assert.equal(stillPending.status, 'PENDING');

    process.env.ACCOUNT_DELETION_EXECUTION_ENABLED = 'true';
    process.env.ACCOUNT_DELETION_POLICY_VERSION = 'automated-test-policy';
    const executed = await runAccountDeletionWorker({
      dryRun: false,
      limit: 10,
      requestIds: [dueRequest.id],
    });
    delete process.env.ACCOUNT_DELETION_EXECUTION_ENABLED;
    delete process.env.ACCOUNT_DELETION_POLICY_VERSION;
    assert.equal(executed.completed, 1);
    assert.equal(executed.failed, 0);

    const completedRequest = await prisma.accountDeletionRequest.findUniqueOrThrow({
      where: { id: dueRequest.id },
    });
    assert.equal(completedRequest.status, 'COMPLETED');
    assert.ok(completedRequest.completed_at);

    const anonymized = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
    assert.ok(anonymized.deleted_at);
    assert.match(anonymized.email, /^deleted-[0-9a-f-]+@deleted\.invalid$/);
    assert.equal(anonymized.full_name, null);

    const loginAfterDeletion = await app.inject({
      method: 'POST',
      url: '/api/auth/login',
      payload: { email: anonymized.email, password },
    });
    assert.equal(loginAfterDeletion.statusCode, 401);
  });
});
