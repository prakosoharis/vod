//
//  MidtransModule.m
//  AlkamusVodMobile
//
//  Created by Claude
//  Copyright © 2025 Alkamus. All rights reserved.
//

#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>
#import <MidtransKit/MidtransKit.h>

@interface MidtransModule () <RCTBridgeModule>
@end

@implementation MidtransModule {
  MidtransKit *_midtransSDK;
}

RCT_EXPORT_MODULE();

- (instancetype)init {
  if (self = [super init]) {
    _midtransSDK = nil;
  }
  return self;
}

RCT_EXPORT_METHOD(initialize:(NSString *)clientKey
                  merchantUrl:(NSString *)merchantUrl
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
  dispatch_async(dispatch_get_main_queue(), ^{
    @try {
      // Configure Midtrans SDK with sandbox mode
      [MidtransConfig shared].clientKey = clientKey;
      [MidtransConfig shared].merchantServerURL = [NSURL URLWithString:merchantUrl];
      [MidtransConfig shared].environment = MIDTransEnvironmentSandbox; // Match Android SANDBOX mode

      // Set up theme colors matching Android
      MidtransTheme *theme = [[MidtransTheme alloc] init];
      theme.primaryColor = [self colorFromHexString:@"#C67D4B"];
      theme.secondaryColor = [self colorFromHexString:@"#2C1810"];
      theme.backgroundColor = [self colorFromHexString:@"#1A1614"];
      [MidtransConfig shared].theme = theme;

      // Enable logging for development
      #ifdef DEBUG
      [MidtransConfig shared].printLog = YES;
      #else
      [MidtransConfig shared].printLog = NO;
      #endif

      self->_midtransSDK = [MidtransKit sharedKit];

      resolve(@"Midtrans SDK initialized successfully");
    } @catch (NSError *error) {
      reject(@"INIT_ERROR", @"Failed to initialize Midtrans", error);
    }
  });
}

RCT_EXPORT_METHOD(startPayment:(NSString *)snapToken
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
  dispatch_async(dispatch_get_main_queue(), ^{
    if (!self->_midtransSDK) {
      reject(@"NOT_INITIALIZED", @"Midtrans SDK not initialized", nil);
      return;
    }

    // Get current view controller
    UIViewController *rootViewController = [self getCurrentViewController];
    if (!rootViewController) {
      reject(@"NO_VIEWCONTROLLER", @"No view controller found", nil);
      return;
    }

    // Start payment UI flow
    __weak MidtransModule *weakSelf = self;
    [self->_midtransSDK startPaymentWithSnapToken:snapToken
                               viewController:rootViewController
                                       completion:^(MidtransTransactionResult *result) {
      [weakSelf sendPaymentResult:result];
    }];

    resolve(@"Payment UI launched");
  });
}

RCT_EXPORT_METHOD(cleanup:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
  _midtransSDK = nil;
  resolve(@"Midtrans SDK cleaned up");
}

// Helper methods
- (UIViewController *)getCurrentViewController {
  UIWindow *window = [UIApplication sharedApplication].keyWindow;
  if (window.windowLevel != UIWindowLevelNormal) {
    NSArray *windows = [UIApplication sharedApplication].windows;
    for (UIWindow *tempWindow in windows) {
      if (tempWindow.windowLevel == UIWindowLevelNormal) {
        window = tempWindow;
        break;
      }
    }
  }
  UIViewController *rootViewController = window.rootViewController;
  return rootViewController;
}

- (void)sendPaymentResult:(MidtransTransactionResult *)result {
  NSMutableDictionary *params = [NSMutableDictionary dictionary];

  switch (result.status) {
    case MIDTransTransactionStatusSuccess:
      params[@"status"] = @"success";
      if (result.data) {
        params[@"transactionId"] = result.data.transactionId ?: @"";
        params[@"paymentType"] = result.data.paymentType ?: @"";
        params[@"statusMessage"] = result.data.statusMessage ?: @"";
      }
      break;

    case MIDTransTransactionStatusPending:
      params[@"status"] = @"pending";
      if (result.data) {
        params[@"transactionId"] = result.data.transactionId ?: @"";
        params[@"paymentType"] = result.data.paymentType ?: @"";
        params[@"statusMessage"] = result.data.statusMessage ?: @"";
      }
      break;

    case MIDTransTransactionStatusFailed:
      params[@"status"] = @"failed";
      params[@"message"] = result.data.statusMessage ?: @"Transaction failed";
      break;

    case MIDTransTransactionStatusCancel:
      params[@"status"] = @"canceled";
      params[@"message"] = @"Transaction canceled by user";
      break;

    case MIDTransTransactionStatusInvalid:
      params[@"status"] = @"invalid";
      params[@"message"] = @"Invalid transaction";
      break;

    default:
      params[@"status"] = @"unknown";
      params[@"message"] = @"Unknown error occurred";
      break;
  }

  [self sendEventWithName:@"MidtransPaymentResult" body:params];
}

- (UIColor *)colorFromHexString:(NSString *)hexString {
  unsigned rgbValue = 0;
  NSScanner *scanner = [NSScanner scannerWithString:hexString];
  [scanner scanHexInt:&rgbValue];

  return [UIColor colorWithRed:((rgbValue & 0xFF0000) >> 16) / 255.0
                         green:((rgbValue & 0x00FF00) >> 8) / 255.0
                          blue:(rgbValue & 0x0000FF) / 255.0
                         alpha:1.0];
}

- (NSArray<NSString *> *)supportedEvents {
  return @[@"MidtransPaymentResult"];
}

@end
