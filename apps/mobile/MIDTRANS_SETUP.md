# Midtrans Payment Integration Setup

## Overview
This mobile app uses **native Midtrans SDK** integration for payment processing. The integration uses the same credentials as the backend API.

## Current Configuration

### Credentials (SANDBOX MODE)
```
Client Key: Mid-client-VMvBYBwPbEvGFUO3
Merchant ID: G136369276
Server Key: Mid-server-E1QfM1RZh0-YifOOs580USnD
```

### Files Modified
1. **android/app/build.gradle** - Added Midtrans SDK dependency
2. **MidtransModule.kt** - Native Android bridge
3. **MidtransPackage.kt** - React Native package registration
4. **MainApplication.kt** - Package registration
5. **constants/index.ts** - Midtrans config (hardcoded)

## Setup Instructions

### 1. Update Configuration
Edit `src/constants/index.ts` and update:
```typescript
export const API_BASE_URL = 'YOUR_API_URL';
export const MIDTRANS_CONFIG = {
  clientKey: 'YOUR_CLIENT_KEY',
  merchantId: 'YOUR_MERCHANT_ID',
  isProduction: false, // Change to true for production
  merchantBaseUrl: 'YOUR_API_URL/api/payment', // Note: /api/payment, not just /payment
};
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Android Build
```bash
cd android
./gradlew clean
cd ..
npx react-native run-android
```

## Usage

### Initialize Midtrans (Automatic)
Midtrans SDK is automatically initialized when PricingScreen mounts:
```typescript
import { MIDTRANS_CONFIG } from '../../constants';
import Midtrans from '../../modules/MidtransModule';

await Midtrans.initialize(
  MIDTRANS_CONFIG.clientKey,
  MIDTRANS_CONFIG.merchantBaseUrl
);
```

### Start Payment
```typescript
// 1. Create payment session
const paymentResponse = await paymentService.subscribe(planId);

// 2. Launch Midtrans UI
const result = await Midtrans.startPayment(paymentResponse.snap_token);

// 3. Handle result
if (result.status === 'success') {
  // Payment successful
  await paymentService.verifyPaymentStatus(paymentResponse.transaction_id);
}
```

## Payment Flow

```
User selects plan
    ↓
PaymentService.subscribe(planId)
    ↓
Backend creates payment session
    ↓
Returns snap_token
    ↓
Midtrans.startPayment(snap_token)
    ↓
Native Midtrans UI opens
    ↓
User completes payment
    ↓
Payment result callback
    ↓
Verify with backend
    ↓
Navigate to success screen
```

## Payment Result Statuses

- **success** - Payment completed successfully
- **pending** - Payment pending (e.g., bank transfer waiting for confirmation)
- **failed** - Payment failed
- **canceled** - User canceled payment
- **invalid** - Invalid payment parameters
- **error** - Unknown error occurred

## Testing

### Sandbox Test Cards
Use these test credit cards in sandbox mode:

**Success:**
- Card: 4811 1111 1111 1114
- CVV: 123
- Exp: 01/25

**Challenge:**
- Card: 4911 1111 1111 1113
- CVV: 123
- Exp: 01/25

**Failure:**
- Card: 4911 1111 1111 1149
- CVV: 123
- Exp: 01/25

### Test E-wallets
- GoPay: Use any phone number, will auto-succeed
- ShopeePay: Use any phone number, will auto-succeed

## Production Setup

### 1. Update Configuration
Edit `src/constants/index.ts`:
```typescript
export const MIDTRANS_CONFIG = {
  clientKey: 'Mid-client-YOUR_PRODUCTION_KEY',
  merchantId: 'YOUR_PRODUCTION_MERCHANT_ID',
  isProduction: true, // IMPORTANT: Set to true
  merchantBaseUrl: 'https://your-production-api.com/api/payment',
};
```

### 2. Update Gradle Dependency
Change in `android/app/build.gradle`:
```gradle
// From (SANDBOX):
implementation 'com.midtrans:uikit:2.3.0-SANDBOX'

// To (PRODUCTION):
implementation 'com.midtrans:uikit:2.3.0'
```

**Note**: SDK v2.3.0 is the latest stable version. Version 2.8.0 does not exist.

### 3. Rebuild App
```bash
cd android
./gradlew clean
cd ..
npx react-native run-android --variant=release
```

## Troubleshooting

### SDK Not Initialized Error
Make sure Midtrans is initialized before calling `startPayment()`. The PricingScreen automatically initializes on mount.

### Payment UI Not Opening
Check logs for initialization errors:
```bash
adb logcat | grep Midtrans
```

### Invalid Client Key
Verify your `.env` file has the correct `MIDTRANS_CLIENT_KEY`.

### Gradle Build Errors
Clean and rebuild:
```bash
cd android
./gradlew clean
./gradlew assembleDebug
```

## Security Notes

1. **Client Key** - Safe to embed in mobile app (public key)
2. **Server Key** - NEVER expose in mobile app (only use on backend)
3. **Snap Token** - Always create on backend, never client-side
4. **API URLs** - Change to production URLs before releasing to Play Store
5. **Hardcoded Credentials** - For production, consider using build variants or environment-specific configs

## Resources

- [Midtrans Mobile SDK Docs](https://docs.midtrans.com/en/mobile-sdk/android)
- [Snap Payment Flow](https://docs.midtrans.com/en/snap/overview)
- [Test Credentials](https://docs.midtrans.com/en/technical-reference/sandbox-test)
