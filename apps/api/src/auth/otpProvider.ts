import axios from 'axios';

export type OtpDelivery = {
  channel: 'EMAIL' | 'WHATSAPP';
  destination: string;
  otp: string;
  expiresMinutes: number;
  idempotencyKey: string;
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

class UnconfiguredEmailProvider implements OtpProvider {
  async send(): Promise<{ messageId: string }> {
    throw new Error('Transactional email provider is not configured');
  }
}

export function getOtpProvider(channel: 'EMAIL' | 'WHATSAPP'): OtpProvider {
  if (process.env.AUTH_PROVIDER_MODE === 'mock') return new MockOtpProvider();
  return channel === 'WHATSAPP' ? new MetaWhatsAppProvider() : new UnconfiguredEmailProvider();
}
