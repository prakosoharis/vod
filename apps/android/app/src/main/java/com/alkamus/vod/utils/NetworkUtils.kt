package com.alkamus.vod.utils

import android.content.Context
import android.net.ConnectivityManager
import android.net.Network
import android.net.NetworkCapabilities
import android.net.NetworkRequest
import android.os.Build
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

/**
 * Network utilities for checking connectivity and monitoring network state
 */
class NetworkUtils(private val context: Context) {

    private val connectivityManager = context.getSystemService(Context.CONNECTIVITY_SERVICE) as ConnectivityManager

    private val _isConnected = MutableStateFlow(false)
    val isConnected: StateFlow<Boolean> = _isConnected.asStateFlow()

    private val _networkType = MutableStateFlow(NetworkType.NONE)
    val networkType: StateFlow<NetworkType> = _networkType.asStateFlow()

    private val networkCallback = object : ConnectivityManager.NetworkCallback() {
        override fun onAvailable(network: Network) {
            super.onAvailable(network)
            updateNetworkStatus()
        }

        override fun onLost(network: Network) {
            super.onLost(network)
            updateNetworkStatus()
        }

        override fun onCapabilitiesChanged(network: Network, networkCapabilities: NetworkCapabilities) {
            super.onCapabilitiesChanged(network, networkCapabilities)
            updateNetworkStatus()
        }
    }

    init {
        registerNetworkCallback()
        updateNetworkStatus()
    }

    /**
     * Check if device is connected to internet
     */
    fun isOnline(): Boolean {
        return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            val network = connectivityManager.activeNetwork
            val capabilities = connectivityManager.getNetworkCapabilities(network)
            capabilities?.hasCapability(NetworkCapabilities.NET_CAPABILITY_INTERNET) == true &&
                    capabilities.hasCapability(NetworkCapabilities.NET_CAPABILITY_VALIDATED) == true
        } else {
            @Suppress("DEPRECATION")
            connectivityManager.activeNetworkInfo?.isConnectedOrConnecting == true
        }
    }

    /**
     * Check if connected to WiFi
     */
    fun isWifiConnected(): Boolean {
        return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            val network = connectivityManager.activeNetwork
            val capabilities = connectivityManager.getNetworkCapabilities(network)
            capabilities?.hasTransport(NetworkCapabilities.TRANSPORT_WIFI) == true
        } else {
            @Suppress("DEPRECATION")
            connectivityManager.activeNetworkInfo?.type == ConnectivityManager.TYPE_WIFI
        }
    }

    /**
     * Check if connected to mobile data
     */
    fun isMobileConnected(): Boolean {
        return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            val network = connectivityManager.activeNetwork
            val capabilities = connectivityManager.getNetworkCapabilities(network)
            capabilities?.hasTransport(NetworkCapabilities.TRANSPORT_CELLULAR) == true
        } else {
            @Suppress("DEPRECATION")
            connectivityManager.activeNetworkInfo?.type == ConnectivityManager.TYPE_MOBILE
        }
    }

    /**
     * Get current network speed
     */
    fun getNetworkSpeed(): NetworkSpeed {
        return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            val network = connectivityManager.activeNetwork
            val capabilities = connectivityManager.getNetworkCapabilities(network)
            when {
                capabilities == null -> NetworkSpeed.NONE
                capabilities.hasCapability(NetworkCapabilities.NET_CAPABILITY_TEMPORARILY_NOT_METERED) -> NetworkSpeed.FAST
                capabilities.hasTransport(NetworkCapabilities.TRANSPORT_WIFI) -> NetworkSpeed.FAST
                capabilities.hasTransport(NetworkCapabilities.TRANSPORT_ETHERNET) -> NetworkSpeed.FAST
                capabilities.hasTransport(NetworkCapabilities.TRANSPORT_CELLULAR) -> {
                    when {
                        capabilities.linkDownstreamBandwidthKbps > 5000 -> NetworkSpeed.FAST
                        capabilities.linkDownstreamBandwidthKbps > 1000 -> NetworkSpeed.MEDIUM
                        else -> NetworkSpeed.SLOW
                    }
                }
                else -> NetworkSpeed.UNKNOWN
            }
        } else {
            NetworkSpeed.UNKNOWN
        }
    }

    private fun updateNetworkStatus() {
        val isOnline = isOnline()
        _isConnected.value = isOnline

        _networkType.value = when {
            isWifiConnected() -> NetworkType.WIFI
            isMobileConnected() -> NetworkType.MOBILE
            isOnline -> NetworkType.OTHER
            else -> NetworkType.NONE
        }
    }

    private fun registerNetworkCallback() {
        val networkRequest = NetworkRequest.Builder()
            .addCapability(NetworkCapabilities.NET_CAPABILITY_INTERNET)
            .build()

        connectivityManager.registerNetworkCallback(networkRequest, networkCallback)
    }

    /**
     * Unregister network callback to avoid memory leaks
     */
    fun unregisterNetworkCallback() {
        connectivityManager.unregisterNetworkCallback(networkCallback)
    }
}

/**
 * Network types
 */
enum class NetworkType {
    NONE,
    WIFI,
    MOBILE,
    OTHER
}

/**
 * Network speed categories
 */
enum class NetworkSpeed {
    NONE,
    SLOW,    // < 1 Mbps
    MEDIUM,  // 1-5 Mbps
    FAST,    // > 5 Mbps
    UNKNOWN
}

/**
 * Extension function to check if network speed is suitable for streaming
 */
fun NetworkSpeed.canStreamVideo(): Boolean {
    return this == NetworkSpeed.FAST || this == NetworkSpeed.MEDIUM
}

/**
 * Extension function to check if network is suitable for downloads
 */
fun NetworkSpeed.canDownloadLargeFiles(): Boolean {
    return this == NetworkSpeed.FAST
}