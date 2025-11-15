package com.alkamus.vod

import android.app.Application
import dagger.hilt.android.HiltAndroidApp
import timber.log.Timber

/**
 * Custom Application class for AlkamusVOD app
 * Initializes Hilt dependency injection and logging
 */
@HiltAndroidApp
class VODApplication : Application() {

    override fun onCreate() {
        super.onCreate()

        // Initialize Timber for logging
        if (BuildConfig.DEBUG) {
            Timber.plant(Timber.DebugTree())
        } else {
            Timber.plant(ReleaseTree())
        }

        Timber.d("VOD Application started")
    }

    /**
     * Custom Timber tree for release builds that logs to Crashlytics or other crash reporting
     */
    private class ReleaseTree : Timber.Tree() {
        override fun isLoggable(tag: String?, priority: Int): Boolean {
            // Only log WARN, ERROR, and WTF in release
            return priority >= android.util.Log.WARN
        }

        override fun log(priority: Int, tag: String?, message: String, t: Throwable?) {
            // Log to Crashlytics or other crash reporting service
            if (priority == android.util.Log.ERROR || priority == android.util.Log.WTF) {
                // TODO: Add Crashlytics logging
                // FirebaseCrashlytics.getInstance().recordException(t ?: RuntimeException(message))
            }
        }
    }
}