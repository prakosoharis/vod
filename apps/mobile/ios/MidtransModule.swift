//
//  MidtransModule.swift
//  AlkamusVodMobile
//
//  Created by Claude
//  Copyright © 2025 Alkamus. All rights reserved.
//

import Foundation
#if canImport(MidtransKit)
import MidtransKit
#endif
import React

#if !canImport(MidtransKit)
// Provide minimal placeholders so the file compiles without the SDK
private enum MidtransSDKAvailabilityError: Error { case unavailable }
#endif

@objc(MidtransModule)
class MidtransModule: NSObject {

  #if canImport(MidtransKit)
  private var midtransSDK: MidtransKit?
  #else
  private var midtransSDK: Any?
  #endif

  override init() {
    super.init()
  }

  @objc(initialize:merchantUrl:resolver:rejecter:)
  func initialize(clientKey: String, merchantUrl: String, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
    #if canImport(MidtransKit)
    DispatchQueue.main.async {
      do {
        MidtransConfig.shared().clientKey = clientKey
        MidtransConfig.shared().merchantServerURL = URL(string: merchantUrl)
        MidtransConfig.shared().environment = .sandbox

        let theme = MidtransTheme()
        theme.primaryColor = "#C67D4B".toUIColor()
        theme.secondaryColor = "#2C1810".toUIColor()
        theme.backgroundColor = "#1A1614".toUIColor()
        MidtransConfig.shared().theme = theme

        #if DEBUG
        MidtransConfig.shared().printLog = true
        #else
        MidtransConfig.shared().printLog = false
        #endif

        self.midtransSDK = MidtransKit.shared()
        resolve("Midtrans SDK initialized successfully")
      } catch let error as NSError {
        reject("INIT_ERROR", "Failed to initialize Midtrans: \(error.localizedDescription)", error)
      }
    }
    #else
    reject("MIDTRANS_IOS_SDK_MISSING", "MidtransKit is not linked in this build. Add the Midtrans iOS SDK to use payments.", nil)
    #endif
  }

  @objc(startPayment:resolver:rejecter:)
  func startPayment(snapToken: String, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
    #if canImport(MidtransKit)
    DispatchQueue.main.async {
      guard let sdk = self.midtransSDK else {
        reject("NOT_INITIALIZED", "Midtrans SDK not initialized", nil)
        return
      }
      guard let windowScene = UIApplication.shared.connectedScenes.first as? UIWindowScene,
            let rootViewController = windowScene.windows.first?.rootViewController else {
        reject("NO_VIEWCONTROLLER", "No view controller found", nil)
        return
      }
      sdk.startPayment(withSnapToken: snapToken, viewController: rootViewController) { [weak self] result in
        self?.sendPaymentResult(result: result)
      }
      resolve("Payment UI launched")
    }
    #else
    reject("MIDTRANS_IOS_SDK_MISSING", "MidtransKit is not linked in this build. Add the Midtrans iOS SDK to use payments.", nil)
    #endif
  }

  #if canImport(MidtransKit)
  private func sendPaymentResult(result: MidtransTransactionResult) {
    var params: [String: Any] = [:]
    switch result.status {
    case .success:
      params["status"] = "success"
      if let response = result.data {
        params["transactionId"] = response.transactionId ?? ""
        params["paymentType"] = response.paymentType ?? ""
        params["statusMessage"] = response.statusMessage ?? ""
      }
    case .pending:
      params["status"] = "pending"
      if let response = result.data {
        params["transactionId"] = response.transactionId ?? ""
        params["paymentType"] = response.paymentType ?? ""
        params["statusMessage"] = response.statusMessage ?? ""
      }
    case .failed:
      params["status"] = "failed"
      params["message"] = result.data?.statusMessage ?? "Transaction failed"
    case .cancel:
      params["status"] = "canceled"
      params["message"] = "Transaction canceled by user"
    case .invalid:
      params["status"] = "invalid"
      params["message"] = "Invalid transaction"
    default:
      params["status"] = "unknown"
      params["message"] = "Unknown error occurred"
    }
    // TODO: Emit event to JS via RCTEventEmitter if needed.
    // Example (after converting this class to RCTEventEmitter):
    // self.sendEvent(withName: "MidtransPaymentResult", body: params)
  }
  #endif

  @objc(cleanup:rejecter:)
  func cleanup(resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
    midtransSDK = nil
    resolve("Midtrans SDK cleaned up")
  }

  // Required methods for EventEmitter
  @objc(addListener:)
  func addListener(eventName: String) {
    // Required for EventEmitter setup
  }

  @objc(removeListeners:)
  func removeListeners(count: Int) {
    // Required for EventEmitter setup
  }

  // Constants
  @objc
  static func requiresMainQueueSetup() -> Bool {
    return true
  }
}

// Extension for hex color to UIColor conversion
extension String {
  func toUIColor() -> UIColor {
    var hexSanitized = self.trimmingCharacters(in: .whitespacesAndNewlines)
    hexSanitized = hexSanitized.replacingOccurrences(of: "#", with: "")

    var rgb: UInt64 = 0

    Scanner(string: hexSanitized).scanHexInt64(&rgb)

    let red = CGFloat((rgb & 0xFF0000) >> 16) / 255.0
    let green = CGFloat((rgb & 0x00FF00) >> 8) / 255.0
    let blue = CGFloat(rgb & 0x0000FF) / 255.0

    return UIColor(red: red, green: green, blue: blue, alpha: 1.0)
  }
}
