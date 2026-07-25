import crypto from 'node:crypto';

const RESERVED_USERNAMES = new Set([
  'admin', 'administrator', 'support', 'smashstream', 'system', 'official',
  'help', 'security', 'billing', 'payment', 'moderator', 'root',
]);

const integerEnv = (name: string, fallback: number, min = 1): number => {
  const value = Number(process.env[name] ?? fallback);
  if (!Number.isInteger(value) || value < min) {
    throw new Error(`${name} must be an integer greater than or equal to ${min}`);
  }
  return value;
};

export const authConfig = () => ({
  otpTtlSeconds: integerEnv('AUTH_OTP_TTL_SECONDS', 300),
  otpResendSeconds: integerEnv('AUTH_OTP_RESEND_SECONDS', 60),
  otpMaxAttempts: integerEnv('AUTH_OTP_MAX_ATTEMPTS', 5),
  otpMaxSendsPerHour: integerEnv('AUTH_OTP_MAX_SENDS_PER_HOUR', 5),
  loginMaxAttempts: integerEnv('AUTH_LOGIN_MAX_ATTEMPTS', 10),
  loginWindowSeconds: integerEnv('AUTH_LOGIN_WINDOW_SECONDS', 900),
  refreshDays: integerEnv('AUTH_REFRESH_TOKEN_DAYS', 30),
});

export function normalizeEmail(value: string): string {
  return value.normalize('NFKC').trim().toLowerCase();
}

export function normalizeUsername(value: string): string {
  const normalized = value.normalize('NFKC').trim().toLowerCase();
  if (normalized.length < 3 || normalized.length > 30) {
    throw new Error('Username harus terdiri dari 3–30 karakter.');
  }
  if (!/^[a-z0-9](?:[a-z0-9._-]*[a-z0-9])?$/.test(normalized)) {
    throw new Error('Username hanya boleh memakai huruf, angka, titik, garis bawah, atau tanda hubung.');
  }
  if (RESERVED_USERNAMES.has(normalized)) {
    throw new Error('Username tersebut tidak dapat digunakan.');
  }
  return normalized;
}

export function normalizeIndonesianPhone(value: string): string {
  let digits = value.normalize('NFKC').replace(/[^\d+]/g, '');
  if (digits.startsWith('+')) digits = digits.slice(1);
  if (digits.startsWith('0')) digits = `62${digits.slice(1)}`;
  else if (digits.startsWith('8')) digits = `62${digits}`;
  if (!/^628[1-9]\d{6,11}$/.test(digits)) {
    throw new Error('Nomor HP Indonesia tidak valid.');
  }
  return `+${digits}`;
}

export function validatePassword(password: string): void {
  if (password.length < 10 || password.length > 128) {
    throw new Error('Password harus terdiri dari 10–128 karakter.');
  }
}

export function classifyIdentifier(value: string):
  | { type: 'email'; normalized: string }
  | { type: 'phone'; normalized: string }
  | { type: 'username'; normalized: string } {
  const input = value.normalize('NFKC').trim();
  if (input.includes('@')) return { type: 'email', normalized: normalizeEmail(input) };
  if (/^[+\d][\d\s().-]+$/.test(input)) {
    return { type: 'phone', normalized: normalizeIndonesianPhone(input) };
  }
  return { type: 'username', normalized: normalizeUsername(input) };
}

function requiredSecret(name: string): string {
  const value = process.env[name];
  if (!value || value.length < 24) {
    if (process.env.NODE_ENV === 'test') return `test-only-${name}-secret-at-least-24-characters`;
    throw new Error(`${name} must be configured with at least 24 characters`);
  }
  return value;
}

export const hashOtp = (challengeId: string, otp: string): string =>
  crypto.createHmac('sha256', requiredSecret('OTP_HASH_SECRET'))
    .update(`${challengeId}:${otp}`)
    .digest('hex');

export const hashIdentifier = (value: string): string =>
  crypto.createHmac('sha256', requiredSecret('AUTH_HASH_SECRET')).update(value).digest('hex');

export const hashRefreshToken = (value: string): string =>
  crypto.createHash('sha256').update(value).digest('hex');

export const secureEqual = (left: string, right: string): boolean => {
  const a = Buffer.from(left, 'hex');
  const b = Buffer.from(right, 'hex');
  return a.length === b.length && crypto.timingSafeEqual(a, b);
};

export const createOtp = (): string => {
  if (process.env.NODE_ENV === 'test' && /^\d{6}$/.test(process.env.AUTH_TEST_OTP || '')) {
    return process.env.AUTH_TEST_OTP!;
  }
  return crypto.randomInt(0, 1_000_000).toString().padStart(6, '0');
};
export const createRefreshToken = (): string => crypto.randomBytes(48).toString('base64url');
export const maskDestination = (value: string): string => {
  if (value.includes('@')) {
    const [name, domain] = value.split('@');
    return `${name.slice(0, 2)}***@${domain}`;
  }
  return `${value.slice(0, 4)}******${value.slice(-3)}`;
};
