import axios from 'axios';
import nodemailer from 'nodemailer';

export type OtpDelivery = {
  channel: 'EMAIL' | 'WHATSAPP';
  purpose: 'REGISTRATION' | 'PASSWORD_RESET';
  destination: string;
  otp: string;
  expiresMinutes: number;
  idempotencyKey: string;
  actionUrl?: string;
};

export interface OtpProvider {
  send(delivery: OtpDelivery): Promise<{ messageId: string }>;
}

class MockOtpProvider implements OtpProvider {
  async send(delivery: OtpDelivery): Promise<{ messageId: string }> {
    if (process.env.NODE_ENV !== 'test' && process.env.NODE_ENV !== 'development') {
      throw new Error('Mock OTP provider is forbidden outside development/test');
    }
    // OTP is intentionally not logged or returned.
    return { messageId: `mock-${delivery.idempotencyKey}` };
  }
}

class MetaWhatsAppProvider implements OtpProvider {
  async send(delivery: OtpDelivery): Promise<{ messageId: string }> {
    const required = [
      'META_WHATSAPP_PHONE_NUMBER_ID',
      'META_WHATSAPP_ACCESS_TOKEN',
      'META_WHATSAPP_OTP_TEMPLATE_NAME',
      'META_WHATSAPP_OTP_TEMPLATE_LANGUAGE',
      'META_WHATSAPP_API_VERSION',
    ] as const;
    for (const key of required) {
      if (!process.env[key]) throw new Error(`OTP provider is not configured: ${key}`);
    }
    const response = await axios.post(
      `https://graph.facebook.com/${process.env.META_WHATSAPP_API_VERSION}/${process.env.META_WHATSAPP_PHONE_NUMBER_ID}/messages`,
      {
        messaging_product: 'whatsapp',
        to: delivery.destination.replace(/^\+/, ''),
        type: 'template',
        template: {
          name: process.env.META_WHATSAPP_OTP_TEMPLATE_NAME,
          language: { code: process.env.META_WHATSAPP_OTP_TEMPLATE_LANGUAGE },
          components: [{ type: 'body', parameters: [{ type: 'text', text: delivery.otp }] }],
        },
      },
      {
        timeout: 10_000,
        headers: { Authorization: `Bearer ${process.env.META_WHATSAPP_ACCESS_TOKEN}` },
      },
    );
    const messageId = response.data?.messages?.[0]?.id;
    if (!messageId) throw new Error('WhatsApp provider did not accept the OTP message');
    return { messageId };
  }
}

class SmtpEmailProvider implements OtpProvider {
  async send(delivery: OtpDelivery): Promise<{ messageId: string }> {
    const required = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASSWORD', 'SMTP_FROM_EMAIL'] as const;
    for (const key of required) {
      if (!process.env[key]) throw new Error(`OTP provider is not configured: ${key}`);
    }
    const port = Number.parseInt(process.env.SMTP_PORT!, 10);
    if (!Number.isInteger(port) || port < 1 || port > 65_535) {
      throw new Error('OTP provider is not configured: SMTP_PORT');
    }
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
      secure: port === 465,
      requireTLS: port !== 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
      connectionTimeout: 10_000,
      greetingTimeout: 10_000,
      socketTimeout: 15_000,
    });
    const senderName = process.env.SMTP_FROM_NAME || 'SMASH';
    const info = await transporter.sendMail({
      from: { name: senderName, address: process.env.SMTP_FROM_EMAIL! },
      to: delivery.destination,
      subject: delivery.purpose === 'PASSWORD_RESET'
        ? 'Kode pemulihan akun SMASH'
        : 'Verifikasi email akun SMASH',
      text: delivery.purpose === 'REGISTRATION' && delivery.actionUrl
        ? `Verifikasi email SMASH Anda melalui tautan berikut: ${delivery.actionUrl}. Tautan berlaku selama ${delivery.expiresMinutes} menit.`
        : `Kode ${delivery.purpose === 'REGISTRATION' ? 'verifikasi' : 'pemulihan'} SMASH Anda adalah ${delivery.otp}. Kode berlaku selama ${delivery.expiresMinutes} menit. Jangan berikan kode ini kepada siapa pun.`,
      html: delivery.purpose === 'REGISTRATION' && delivery.actionUrl
        ? `<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;padding:32px;color:#171717"><h1 style="font-size:24px">Verifikasi email SMASH</h1><p>Tekan tombol berikut untuk mengaktifkan akun Anda.</p><p style="margin:28px 0"><a href="${delivery.actionUrl}" style="display:inline-block;background:#e53935;color:#fff;text-decoration:none;padding:14px 24px;border-radius:10px;font-weight:700">Verifikasi Email</a></p><p>Tautan hanya berlaku selama ${delivery.expiresMinutes} menit.</p><p style="color:#666;font-size:13px">Jika tombol tidak dapat dibuka, salin tautan ini ke browser:<br>${delivery.actionUrl}</p><p style="color:#666">Abaikan email ini jika Anda tidak membuat akun SMASH.</p></div>`
        : `<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;padding:24px;color:#171717"><h1 style="font-size:24px">${delivery.purpose === 'REGISTRATION' ? 'Verifikasi akun' : 'Pulihkan akun'} SMASH</h1><p>Gunakan kode berikut untuk melanjutkan:</p><p style="font-size:32px;font-weight:700;letter-spacing:8px;color:#e53935">${delivery.otp}</p><p>Kode berlaku selama ${delivery.expiresMinutes} menit.</p><p style="color:#666">Jangan berikan kode ini kepada siapa pun. Abaikan email ini jika Anda tidak melakukan permintaan.</p></div>`,
      headers: { 'X-Entity-Ref-ID': delivery.idempotencyKey },
    });
    if (!info.messageId) throw new Error('Email provider did not accept the OTP message');
    return { messageId: info.messageId };
  }
}

export function getOtpProvider(channel: 'EMAIL' | 'WHATSAPP'): OtpProvider {
  if (process.env.AUTH_PROVIDER_MODE === 'mock') return new MockOtpProvider();
  return channel === 'WHATSAPP' ? new MetaWhatsAppProvider() : new SmtpEmailProvider();
}
