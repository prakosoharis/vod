package com.alkamusvodmobile

import android.app.Activity
import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule
import com.midtrans.sdk.corekit.callback.TransactionFinishedCallback
import com.midtrans.sdk.corekit.core.MidtransSDK
import com.midtrans.sdk.corekit.core.TransactionRequest
import com.midtrans.sdk.corekit.core.themes.CustomColorTheme
import com.midtrans.sdk.corekit.models.snap.TransactionResult
import com.midtrans.sdk.uikit.SdkUIFlowBuilder

class MidtransModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    private var midtransSDK: MidtransSDK? = null

    override fun getName(): String {
        return "MidtransModule"
    }

    @ReactMethod
    fun initialize(clientKey: String, merchantUrl: String, promise: Promise) {
        try {
            val sdkBuilder = SdkUIFlowBuilder.init()
                .setClientKey(clientKey)
                .setContext(reactApplicationContext)
                .setTransactionFinishedCallback(object : TransactionFinishedCallback {
                    override fun onTransactionFinished(result: TransactionResult) {
                        sendPaymentResult(result)
                    }
                })
                .setMerchantBaseUrl(merchantUrl)
                .enableLog(true) // Enable for development
                .setColorTheme(CustomColorTheme("#C67D4B", "#2C1810", "#1A1614"))

            midtransSDK = sdkBuilder.buildSDK()
            promise.resolve("Midtrans SDK initialized successfully")
        } catch (e: Exception) {
            promise.reject("INIT_ERROR", "Failed to initialize Midtrans: ${e.message}")
        }
    }

    @ReactMethod
    fun startPayment(snapToken: String, promise: Promise) {
        val activity = currentActivity

        if (activity == null) {
            promise.reject("NO_ACTIVITY", "No current activity found")
            return
        }

        if (midtransSDK == null) {
            promise.reject("NOT_INITIALIZED", "Midtrans SDK not initialized")
            return
        }

        try {
            midtransSDK?.startPaymentUiFlow(activity, snapToken)
            promise.resolve("Payment UI launched")
        } catch (e: Exception) {
            promise.reject("PAYMENT_ERROR", "Failed to start payment: ${e.message}")
        }
    }

    private fun sendPaymentResult(result: TransactionResult) {
        val params = Arguments.createMap()

        when {
            result.response != null -> {
                params.putString("status", when (result.status) {
                    TransactionResult.STATUS_SUCCESS -> "success"
                    TransactionResult.STATUS_PENDING -> "pending"
                    TransactionResult.STATUS_FAILED -> "failed"
                    TransactionResult.STATUS_INVALID -> "invalid"
                    else -> "unknown"
                })
                params.putString("transactionId", result.response.transactionId ?: "")
                params.putString("paymentType", result.response.paymentType ?: "")
                // SDK v2 API compatibility
                params.putString("statusMessage", result.response.statusMessage ?: "")
            }
            result.isTransactionCanceled -> {
                params.putString("status", "canceled")
                params.putString("message", "Transaction canceled by user")
            }
            else -> {
                params.putString("status", "error")
                params.putString("message", "Unknown error occurred")
            }
        }

        reactApplicationContext
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            .emit("MidtransPaymentResult", params)
    }

    @ReactMethod
    fun cleanup(promise: Promise) {
        try {
            midtransSDK = null
            promise.resolve("Midtrans SDK cleaned up")
        } catch (e: Exception) {
            promise.reject("CLEANUP_ERROR", "Failed to cleanup Midtrans: ${e.message}")
        }
    }

    @ReactMethod
    fun addListener(eventName: String) {
        // Required for EventEmitter setup
    }

    @ReactMethod
    fun removeListeners(count: Int) {
        // Required for EventEmitter setup
    }
}
