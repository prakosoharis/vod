import { NativeModules, NativeEventEmitter, EmitterSubscription, Platform } from 'react-native';

interface MidtransModuleInterface {
  initialize(clientKey: string, merchantUrl: string): Promise<string>;
  startPayment(snapToken: string): Promise<string>;
  cleanup(): Promise<string>;
  addListener(eventName: string): void;
  removeListeners(count: number): void;
}

export interface PaymentResult {
  status: 'success' | 'pending' | 'failed' | 'canceled' | 'invalid' | 'error' | 'unknown';
  transactionId?: string;
  orderId?: string;
  paymentType?: string;
  grossAmount?: string;
  message?: string;
  statusMessage?: string;
}

// Get the native module - iOS implementation is not ready yet
const { MidtransModule } = NativeModules;

// Safe mock for iOS development - Android has full implementation
const mockMidtransModule: MidtransModuleInterface = {
  initialize: async (clientKey: string, merchantUrl: string) => {
    console.log('[MidtransModule] MOCK: initialize called - iOS native module not implemented yet');
    return 'Midtrans SDK initialized (mock)';
  },
  startPayment: async (snapToken: string) => {
    console.log('[MidtransModule] MOCK: startPayment called - iOS native module not implemented yet');

    // Simulate payment success after 2 seconds
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve('Payment UI launched (mock)');
      }, 2000);
    });
  },
  cleanup: async () => {
    console.log('[MidtransModule] MOCK: cleanup called');
    return 'Midtrans SDK cleaned up (mock)';
  },
  addListener: (eventName: string) => {
    console.log('[MidtransModule] MOCK: addListener called');
  },
  removeListeners: (count: number) => {
    console.log('[MidtransModule] MOCK: removeListeners called');
  }
};

// Use native module for Android, mock for iOS
const midtransModule: MidtransModuleInterface = MidtransModule || mockMidtransModule;

// Use mock event emitter for iOS since native module doesn't exist yet
let eventEmitter: NativeEventEmitter | null = null;
try {
  // Only use NativeEventEmitter if module exists (Android)
  if (MidtransModule) {
    eventEmitter = new NativeEventEmitter(MidtransModule);
  }
} catch (error) {
  console.warn('[MidtransModule] Native event emitter not available (iOS - using mock)');
}

class Midtrans {
  private static instance: Midtrans;
  private listener: EmitterSubscription | null = null;
  private isInitialized = false;

  private constructor() {}

  static getInstance(): Midtrans {
    if (!Midtrans.instance) {
      Midtrans.instance = new Midtrans();
    }
    return Midtrans.instance;
  }

  async initialize(clientKey: string, merchantUrl: string): Promise<void> {
    if (this.isInitialized) {
      console.log('Midtrans SDK already initialized');
      return;
    }

    try {
      await midtransModule.initialize(clientKey, merchantUrl);
      this.isInitialized = true;
      console.log('Midtrans SDK initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Midtrans SDK:', error);
      throw error;
    }
  }

  async startPayment(snapToken: string): Promise<PaymentResult> {
    if (!this.isInitialized) {
      throw new Error('Midtrans SDK not initialized. Call initialize() first.');
    }

    return new Promise((resolve, reject) => {
      // Remove previous listener if exists
      if (this.listener) {
        this.listener.remove();
      }

      // Set up listener for payment result
      this.listener = eventEmitter.addListener(
        'MidtransPaymentResult',
        (result: PaymentResult) => {
          console.log('Payment result received:', result);
          resolve(result);

          // Clean up listener
          if (this.listener) {
            this.listener.remove();
            this.listener = null;
          }
        }
      );

      // Start payment UI
      midtransModule
        .startPayment(snapToken)
        .then(() => {
          console.log('Payment UI started');
        })
        .catch((error) => {
          console.error('Failed to start payment UI:', error);
          if (this.listener) {
            this.listener.remove();
            this.listener = null;
          }
          reject(error);
        });
    });
  }

  cleanup(): void {
    if (this.listener) {
      this.listener.remove();
      this.listener = null;
    }
  }
}

export default Midtrans.getInstance();
