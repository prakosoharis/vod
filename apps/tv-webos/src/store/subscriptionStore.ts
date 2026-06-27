import { create } from 'zustand';
import { apiService } from '../services/api';
import { SubscriptionInfo, SubscriptionStatus } from '../types';

interface SubscriptionState {
  info: SubscriptionInfo | null;
  isLoading: boolean;
  lastChecked: number | null;
  refresh: () => Promise<SubscriptionInfo | null>;
  setStatus: (status: SubscriptionStatus) => void;
  reset: () => void;
}

/**
 * Map raw subscription data from /payment/subscription/me to SubscriptionInfo.
 *
 * API response shape (matches mobile app):
 * {
 *   id: string,
 *   plan_id: string,
 *   start_date: string,
 *   end_date: string,
 *   started_at?: string,
 *   expired_at?: string,
 *   status: 'active' | 'expired' | 'cancelled' | 'ACTIVE' | 'EXPIRED' | 'CANCELLED',
 *   auto_renew: boolean
 * }
 *
 * Or null if user never subscribed.
 */
function mapToSubscriptionInfo(data: any): SubscriptionInfo {
  if (!data) {
    return { status: 'none' };
  }

  const rawStatus = (data.status || '').toLowerCase();
  let status: SubscriptionStatus;

  switch (rawStatus) {
    case 'active':
      status = 'active';
      break;
    case 'trial':
      status = 'trial';
      break;
    case 'expired':
    case 'cancelled':
      status = 'expired';
      break;
    default:
      // Has record but unknown status — treat as none
      status = 'none';
  }

  return {
    status,
    plan: data.plan_id || data.plan,
    expires_at: data.end_date || data.expired_at || data.expires_at,
  };
}

export const useSubscriptionStore = create<SubscriptionState>((set, get) => ({
  info: null,
  isLoading: false,
  lastChecked: null,

  refresh: async () => {
    set({ isLoading: true });
    try {
      const data = await apiService.getSubscriptionStatus();
      console.log('[Subscription] Raw API response:', data);
      const info = mapToSubscriptionInfo(data);
      console.log('[Subscription] Mapped info:', info);
      set({ info, isLoading: false, lastChecked: Date.now() });
      return info;
    } catch (e) {
      // Network/API error — safer to gate content (treat as none)
      console.warn('[Subscription] Check failed:', e);
      const info: SubscriptionInfo = { status: 'none' };
      set({ info, isLoading: false, lastChecked: Date.now() });
      return info;
    }
  },

  setStatus: (status: SubscriptionStatus) => {
    const current = get().info;
    set({ info: { ...(current || {}), status } });
  },

  reset: () => {
    set({ info: null, isLoading: false, lastChecked: null });
  },
}));
