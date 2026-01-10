import { apiService } from './api';
import type { SubscriptionPlan } from '../types';

export interface PaymentResponse {
  snap_token: string;
  transaction_id: string;
  gross_amount: number;
}

export const paymentService = {
  async getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    return apiService.getSubscriptionPlans();
  },

  async subscribe(planId: string): Promise<PaymentResponse> {
    return apiService.subscribe(planId);
  },

  async verifyPaymentStatus(transactionId: string): Promise<any> {
    return apiService.verifyPaymentStatus(transactionId);
  },
};
