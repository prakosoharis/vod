import api from './api';

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string | null;
  price: number;
  duration_days: number;
  features: {
    vod: boolean;
    live_discount: number;
  };
  is_active: boolean;
}

export interface UserSubscription {
  id: string;
  user_id: string;
  plan_id: string;
  status: 'ACTIVE' | 'EXPIRED' | 'CANCELLED';
  started_at: string;
  expired_at: string;
  auto_renew: boolean;
  cancelled_at: string | null;
  plan: SubscriptionPlan;
}

export interface UserRental {
  id: string;
  user_id: string;
  content_id: string;
  rented_at: string;
  expired_at: string;
  content: {
    id: string;
    title: string;
    thumbnail_url: string;
    type: string;
  };
  rental_price: {
    price: number;
    duration_hours: number;
  };
}

export interface Transaction {
  id: string;
  order_id: string;
  payment_type: 'RENTAL' | 'SUBSCRIPTION' | 'EVENT_TICKET';
  amount: number;
  status: 'PENDING' | 'SETTLEMENT' | 'FAILED' | 'EXPIRED';
  payment_method: string | null;
  created_at: string;
  rental?: {
    content_id: string;
    content: {
      title: string;
    };
  };
  event_ticket?: {
    event: {
      title: string;
    };
  };
}

export interface PaymentResponse {
  success: boolean;
  data: {
    token: string;
    redirect_url: string;
    order_id: string;
  };
}

export interface AccessInfo {
  success: boolean;
  data: {
    has_access: boolean;
    access_type: 'subscription' | 'rental' | null;
    expires_at: string | null;
  };
}

class PaymentService {
  // Get subscription plans
  async getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    const response = await api.get('/payment/subscription/plans');
    return response.data.data;
  }

  // Subscribe to a plan
  async subscribe(planId: string): Promise<PaymentResponse> {
    const response = await api.post('/payment/subscription/subscribe', {
      plan_id: planId,
    });
    return response.data;
  }

  // Get user subscription
  async getUserSubscription(): Promise<UserSubscription | null> {
    const response = await api.get('/payment/subscription/me');
    return response.data.data;
  }

  // Cancel subscription
  async cancelSubscription(): Promise<void> {
    await api.post('/payment/subscription/cancel');
  }

  // Rent content
  async rentContent(contentId: string): Promise<PaymentResponse> {
    const response = await api.post('/payment/rental/rent', {
      content_id: contentId,
    });
    return response.data;
  }

  // Get user rentals
  async getUserRentals(): Promise<UserRental[]> {
    const response = await api.get('/payment/rental/me');
    return response.data.data;
  }

  // Buy event ticket
  async buyEventTicket(eventId: string): Promise<PaymentResponse> {
    const response = await api.post('/payment/event/buy-ticket', {
      event_id: eventId,
    });
    return response.data;
  }

  // Check content access
  async checkContentAccess(contentId: string): Promise<AccessInfo> {
    const response = await api.get(`/payment/access/${contentId}`);
    return response.data;
  }

  // Get transaction status
  async getTransactionStatus(orderId: string): Promise<Transaction> {
    const response = await api.get(`/payment/transaction/${orderId}`);
    return response.data.data;
  }

  // Open Midtrans Snap popup
  openMidtransSnap(token: string, onSuccess?: (result: any) => void, onError?: (error: any) => void) {
    // @ts-ignore - Midtrans snap library
    if (window.snap) {
      // @ts-ignore
      window.snap.pay(token, {
        onSuccess: (result: any) => {
          console.log('Payment success:', result);
          if (onSuccess) onSuccess(result);
        },
        onPending: (result: any) => {
          console.log('Payment pending:', result);
        },
        onError: (error: any) => {
          console.error('Payment error:', error);
          if (onError) onError(error);
        },
        onClose: () => {
          console.log('Payment popup closed');
        },
      });
    } else {
      console.error('Midtrans Snap not loaded');
      alert('Payment system not ready. Please refresh the page.');
    }
  }
}

// Extend Window interface for Midtrans
declare global {
  interface Window {
    snap: any;
  }
}

export const paymentService = new PaymentService();
