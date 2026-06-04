//
//  MidtransPackage.swift
//  AlkamusVodMobile
//
//  Created by Claude
//  Copyright © 2025 Alkamus. All rights reserved.
//

import Foundation
#if canImport(React)
import React
#endif

@objc(MidtransPackage)
class MidtransPackage: NSObject {

  @objc
  func nativeModules() -> [AnyClass] {
    return [MidtransModule.self]
  }

  // Required method for RCTBridge
  @objc
  static func requiresMainQueueSetup() -> Bool {
    return true
  }
}
