import axios, { AxiosInstance } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL, MIDTRANS_CONFIG } from '../constants';

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  duration_days: number;
  features: string[];
  is_active: boolean;
}

export interface PaymentResponse {
  snap_token: string;
  token?: string;
  transaction_id: string;
  order_id: string;
  gross_amount: number;
  redirect_url?: string;
}

export interface AccessCheckResponse {
  has_access: boolean;
  access_type: 'subscription' | 'rental' | 'free' | 'ticket' | null;
  expires_at: string | null;
  ticket_price?: number;
  can_buy_ticket?: boolean;
}

const unwrapPaymentResponse = (response: any): PaymentResponse => {
  const data = response.data?.data || response.data;
  const snapToken = data.snap_token || data.token;
  const snapHost = MIDTRANS_CONFIG.isProduction
    ? 'https://app.midtrans.com'
    : 'https://app.sandbox.midtrans.com';

  return {
    ...data,
    snap_token: snapToken,
    transaction_id: data.transaction_id || data.order_id,
    gross_amount: data.gross_amount || data.amount || 0,
    redirect_url: data.redirect_url || (snapToken ? `${snapHost}/snap/v2/vtweb/${snapToken}` : undefined),
  };
};

export interface Subscription {
  id: string;
  plan_id: string;
  start_date: string;
  end_date: string;
  started_at?: string;
  expired_at?: string;
  status: 'active' | 'expired' | 'cancelled' | 'ACTIVE' | 'EXPIRED' | 'CANCELLED';
  auto_renew: boolean;
}

const normalizeFeatures = (features: unknown): string[] => {
  if (Array.isArray(features)) {
    return features.map(String);
  }

  if (typeof features === 'string') {
    try {
      const parsed = JSON.parse(features);
      if (Array.isArray(parsed)) {
        return parsed.map(String);
      }
    } catch {
      return features
        .split(',')
        .map((feature) => feature.trim())
        .filter(Boolean);
    }
  }

  return [];
};

const normalizePlan = (plan: any): SubscriptionPlan => ({
  ...plan,
  price: Number(plan.price || 0),
  duration_days: Number(plan.duration_days || 0),
  features: normalizeFeatures(plan.features),
  is_active: Boolean(plan.is_active),
});

class PaymentService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      async (config) => {
        const token = await AsyncStorage.getItem('@auth_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          await AsyncStorage.multiRemove(['@auth_token', '@user_data']);
        }
        return Promise.reject(error);
      }
    );
  }

  // Subscription Plans
  async getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    const response = await this.client.get('/payment/subscription/plans');
    const plans = response.data?.data || response.data || [];
    return Array.isArray(plans) ? plans.map(normalizePlan) : [];
  }

  async getMySubscription(): Promise<Subscription | null> {
    try {
      const response = await this.client.get('/payment/subscription/me');
      // API returns { success: true, data: { ... } }
      return response.data?.data || response.data || null;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  }

  async subscribe(planId: string): Promise<PaymentResponse> {
    const response = await this.client.post('/payment/subscription/subscribe', {
      plan_id: planId,
    });
    return unwrapPaymentResponse(response);
  }

  async cancelSubscription(): Promise<void> {
    await this.client.post('/payment/subscription/cancel');
  }

  // Content Rental
  async rentContent(contentId: string): Promise<PaymentResponse> {
    const response = await this.client.post('/payment/rental/rent', {
      content_id: contentId,
    });
    return unwrapPaymentResponse(response);
  }

  async getMyRentals(): Promise<any[]> {
    const response = await this.client.get('/payment/rental/me');
    return response.data?.data || response.data || [];
  }

  // Event Tickets
  async buyEventTicket(eventId: string): Promise<PaymentResponse> {
    const response = await this.client.post('/payment/event/buy-ticket', {
      event_id: eventId,
    });
    return unwrapPaymentResponse(response);
  }

  async buyBroadcastTicket(broadcastId: string): Promise<PaymentResponse> {
    const response = await this.client.post(`/payment/broadcast/${broadcastId}/ticket`);
    return unwrapPaymentResponse(response);
  }

  async checkBroadcastAccess(broadcastId: string): Promise<AccessCheckResponse> {
    const response = await this.client.get(`/payment/broadcast/${broadcastId}/access`);
    return response.data?.data || response.data;
  }

  async simulateDevWebhook(orderId: string): Promise<void> {
    await this.client.post(`/payment/dev-webhook/${orderId}`);
  }

  // Access Check
  async checkContentAccess(contentId: string): Promise<AccessCheckResponse> {
    const response = await this.client.get(`/payment/access/${contentId}`);
    // API returns { success: true, data: { ... } }
    return response.data?.data || response.data;
  }

  // Verify Payment Status (after Midtrans callback)
  async verifyPaymentStatus(transactionId: string): Promise<{
    status: string;
    transaction_status: string;
    fraud_status: string;
  }> {
    const response = await this.client.get(`/payment/verify/${transactionId}`);
    return response.data;
  }
}

export const paymentService = new PaymentService();
export default paymentService;
