import axios, { AxiosInstance } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../constants';

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
  transaction_id: string;
  order_id: string;
  gross_amount: number;
}

export interface AccessCheckResponse {
  has_access: boolean;
  access_type: 'subscription' | 'rental' | 'free' | null;
  expires_at: string | null;
}

export interface Subscription {
  id: string;
  plan_id: string;
  start_date: string;
  end_date: string;
  status: 'active' | 'expired' | 'cancelled';
  auto_renew: boolean;
}

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
    return response.data;
  }

  async getMySubscription(): Promise<Subscription | null> {
    try {
      const response = await this.client.get('/payment/subscription/me');
      return response.data;
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
    return response.data;
  }

  async cancelSubscription(): Promise<void> {
    await this.client.post('/payment/subscription/cancel');
  }

  // Content Rental
  async rentContent(contentId: string): Promise<PaymentResponse> {
    const response = await this.client.post('/payment/rental/rent', {
      content_id: contentId,
    });
    return response.data;
  }

  async getMyRentals(): Promise<any[]> {
    const response = await this.client.get('/payment/rental/me');
    return response.data;
  }

  // Event Tickets
  async buyEventTicket(eventId: string): Promise<PaymentResponse> {
    const response = await this.client.post('/payment/event/buy-ticket', {
      event_id: eventId,
    });
    return response.data;
  }

  // Access Check
  async checkContentAccess(contentId: string): Promise<AccessCheckResponse> {
    const response = await this.client.get(`/payment/access/${contentId}`);
    return response.data;
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
