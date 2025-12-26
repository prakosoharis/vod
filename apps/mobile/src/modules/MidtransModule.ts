import { NativeModules, NativeEventEmitter, EmitterSubscription } from 'react-native';

interface MidtransModuleInterface {
  initialize(clientKey: string, merchantUrl: string): Promise<string>;
  startPayment(snapToken: string): Promise<string>;
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
}

const { MidtransModule } = NativeModules;

if (!MidtransModule) {
  throw new Error('MidtransModule is not available. Make sure the native module is properly linked.');
}

const midtransModule: MidtransModuleInterface = MidtransModule;
const eventEmitter = new NativeEventEmitter(MidtransModule);

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
