import assert from 'node:assert/strict';
import test from 'node:test';
import { build } from './server.js';
import prisma from './config/database.js';
import {
  normalizeEmail, normalizeIndonesianPhone, normalizeUsername, validatePassword,
} from './auth/authCore.js';

process.env.AUTH_PROVIDER_MODE = 'mock';
process.env.AUTH_TEST_OTP = '482913';
process.env.OTP_HASH_SECRET = 'test-otp-hash-secret-with-at-least-24-characters';
process.env.AUTH_HASH_SECRET = 'test-auth-hash-secret-with-at-least-24-characters';

test('normalization and password policy', () => {
  assert.equal(normalizeEmail(' User@Example.COM '), 'user@example.com');
  assert.equal(normalizeUsername(' User.Name '), 'user.name');
  assert.equal(normalizeIndonesianPhone('0812-3456-7890'), '+6281234567890');
  assert.equal(normalizeIndonesianPhone('81234567890'), '+6281234567890');
  assert.equal(normalizeIndonesianPhone('+6281234567890'), '+6281234567890');
  assert.throws(() => normalizeUsername('admin'));
  assert.throws(() => validatePassword('short'));
  assert.doesNotThrow(() => validatePassword('correct horse battery staple'));
});

test('pending registration, OTP single use, identifier login, recovery, and session rotation', async (context) => {
  const app = await build({ startWebSocket: false });
  const suffix = `${Date.now()}${Math.floor(Math.random() * 1000)}`;
  const email = `auth-${suffix}@example.test`;
  const username = `auth${suffix}`.slice(0, 30);
  const password = 'production test passphrase';
  let userId = '';

  context.after(async () => {
    if (userId) await prisma.user.deleteMany({ where: { id: userId } });
    await app.close();
  });

  const started = await app.inject({
    method: 'POST',
    url: '/api/auth/register/start',
    payload: {
      method: 'email', email, username, full_name: 'Auth Test',
      password, legal_consent: true,
      terms_version: '2026-07-25', privacy_version: '2026-07-25',
      source_platform: 'web',
    },
  });
  assert.equal(started.statusCode, 202, started.body);
  const challengeId = started.json().challenge_id;
  const challenge = await prisma.otpChallenge.findUniqueOrThrow({ where: { id: challengeId } });
  userId = challenge.user_id;
  assert.notEqual(challenge.otp_hash, process.env.AUTH_TEST_OTP);
  const pending = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  assert.equal(pending.account_status, 'PENDING_VERIFICATION');
  assert.equal(pending.email_verified_at, null);

  const earlyResend = await app.inject({
    method: 'POST', url: '/api/auth/register/resend',
    payload: { challenge_id: challengeId },
  });
  assert.equal(earlyResend.statusCode, 429);

  const pendingLogin = await app.inject({
    method: 'POST', url: '/api/auth/login',
    payload: { identifier: email, password, source_platform: 'web' },
  });
  assert.equal(pendingLogin.statusCode, 401);

  const wrong = await app.inject({
    method: 'POST', url: '/api/auth/register/verify',
    payload: { challenge_id: challengeId, otp: '000000', source_platform: 'web' },
  });
  assert.equal(wrong.statusCode, 400);

  const verified = await app.inject({
    method: 'POST', url: '/api/auth/register/verify',
    payload: { challenge_id: challengeId, otp: process.env.AUTH_TEST_OTP, source_platform: 'android' },
  });
  assert.equal(verified.statusCode, 200, verified.body);
  assert.ok(verified.json().refresh_token);
  const active = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  assert.equal(active.account_status, 'ACTIVE');
  assert.ok(active.email_verified_at);
  const consents = await prisma.legalConsent.findMany({ where: { user_id: userId } });
  assert.equal(consents.length, 2);

  const reused = await app.inject({
    method: 'POST', url: '/api/auth/register/verify',
    payload: { challenge_id: challengeId, otp: process.env.AUTH_TEST_OTP, source_platform: 'web' },
  });
  assert.equal(reused.statusCode, 400);

  for (const identifier of [email.toUpperCase(), username.toUpperCase()]) {
    const login = await app.inject({
      method: 'POST', url: '/api/auth/login',
      payload: { identifier, password, source_platform: 'web' },
    });
    assert.equal(login.statusCode, 200, login.body);
  }

  const bad = await app.inject({
    method: 'POST', url: '/api/auth/login',
    payload: { identifier: email, password: 'not-the-password', source_platform: 'web' },
  });
  assert.equal(bad.statusCode, 401);
  assert.equal(bad.json().error, 'Data login tidak sesuai. Periksa kembali dan coba lagi.');

  const refreshToken = verified.json().refresh_token;
  const refreshed = await app.inject({
    method: 'POST', url: '/api/auth/refresh', payload: { refresh_token: refreshToken },
  });
  assert.equal(refreshed.statusCode, 200, refreshed.body);
  assert.notEqual(refreshed.json().refresh_token, refreshToken);
  const reuse = await app.inject({
    method: 'POST', url: '/api/auth/refresh', payload: { refresh_token: refreshToken },
  });
  assert.equal(reuse.statusCode, 401);
  const activeSessionsAfterReuse = await prisma.authSession.count({
    where: { user_id: userId, revoked_at: null },
  });
  assert.equal(activeSessionsAfterReuse, 0);

  const forgot = await app.inject({
    method: 'POST', url: '/api/auth/forgot-password',
    payload: { identifier: email },
  });
  assert.equal(forgot.statusCode, 200);
  assert.match(forgot.json().message, /Jika akun ditemukan/);
  const recovery = await prisma.otpChallenge.findFirstOrThrow({
    where: { user_id: userId, purpose: 'PASSWORD_RESET', consumed_at: null },
    orderBy: { created_at: 'desc' },
  });
  const recoveryVerified = await app.inject({
    method: 'POST', url: '/api/auth/recovery/verify',
    payload: { challenge_id: recovery.id, otp: process.env.AUTH_TEST_OTP },
  });
  assert.equal(recoveryVerified.statusCode, 200, recoveryVerified.body);
  const newPassword = 'a newer production passphrase';
  const reset = await app.inject({
    method: 'POST', url: '/api/auth/recovery/reset',
    payload: { recovery_token: recoveryVerified.json().recovery_token, password: newPassword },
  });
  assert.equal(reset.statusCode, 200, reset.body);
  const oldLogin = await app.inject({
    method: 'POST', url: '/api/auth/login',
    payload: { identifier: email, password, source_platform: 'web' },
  });
  assert.equal(oldLogin.statusCode, 401);
  const newLogin = await app.inject({
    method: 'POST', url: '/api/auth/login',
    payload: { identifier: email, password: newPassword, source_platform: 'web' },
  });
  assert.equal(newLogin.statusCode, 200, newLogin.body);
});

test('phone registration normalizes Indonesian number and login accepts local format', async (context) => {
  const app = await build({ startWebSocket: false });
  const suffix = `${Date.now()}`.slice(-8);
  const localPhone = `0812${suffix}`;
  const username = `phone${suffix}`;
  const password = 'phone registration passphrase';
  let userId = '';
  context.after(async () => {
    if (userId) await prisma.user.deleteMany({ where: { id: userId } });
    await app.close();
  });
  const started = await app.inject({
    method: 'POST', url: '/api/auth/register/start',
    payload: {
      method: 'phone', phone: localPhone, username, full_name: 'Phone Test',
      password, legal_consent: true, terms_version: '2026-07-25',
      privacy_version: '2026-07-25', source_platform: 'android',
    },
  });
  assert.equal(started.statusCode, 202, started.body);
  const challenge = await prisma.otpChallenge.findUniqueOrThrow({
    where: { id: started.json().challenge_id },
  });
  userId = challenge.user_id;
  const verified = await app.inject({
    method: 'POST', url: '/api/auth/register/verify',
    payload: { challenge_id: challenge.id, otp: process.env.AUTH_TEST_OTP, source_platform: 'android' },
  });
  assert.equal(verified.statusCode, 200, verified.body);
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  assert.equal(user.phone_e164, normalizeIndonesianPhone(localPhone));
  assert.ok(user.phone_verified_at);
  assert.equal(user.email, null);
  const login = await app.inject({
    method: 'POST', url: '/api/auth/login',
    payload: { identifier: localPhone, password, source_platform: 'android' },
  });
  assert.equal(login.statusCode, 200, login.body);
});
