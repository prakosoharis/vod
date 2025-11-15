package com.alkamus.vod.domain.utils

/**
 * App constants
 */
object Constants {

    // API
    const val BASE_URL = "http://localhost:3001/api/"
    const val WEBSOCKET_URL = "http://localhost:3001"
    const val CONNECT_TIMEOUT = 30L // seconds
    const val READ_TIMEOUT = 30L // seconds
    const val WRITE_TIMEOUT = 30L // seconds

    // Database
    const val DATABASE_NAME = "vod_database"
    const val DATABASE_VERSION = 1

    // Paging
    const val PAGE_SIZE = 20
    const val PREFETCH_DISTANCE = 5

    // Video Player
    const val PLAYER_MIN_BUFFER_MS = 50000
    const val PLAYER_MAX_BUFFER_MS = 50000
    const val PLAYER_BUFFER_FOR_PLAYBACK_MS = 2500
    const val PLAYER_BUFFER_FOR_PLAYBACK_AFTER_REBUFFER_MS = 5000

    // Image Loading
    const val IMAGE_FADE_IN_DURATION = 300

    // Animation
    const val ANIMATION_DURATION_SHORT = 200
    const val ANIMATION_DURATION_MEDIUM = 300
    const val ANIMATION_DURATION_LONG = 500

    // Data Store Keys
    object Preferences {
        const val USER_TOKEN = "user_token"
        const val USER_EMAIL = "user_email"
        const val USER_NAME = "user_name"
        const val STREAMING_QUALITY = "streaming_quality"
        const val DOWNLOAD_QUALITY = "download_quality"
        const val WIFI_ONLY = "wifi_only"
        const val AUTO_PLAY = "auto_play"
        const val IS_LOGGED_IN = "is_logged_in"
        const val THEME_MODE = "theme_mode"
        const val LANGUAGE = "language"
    }

    // Content Types
    const val TYPE_MOVIE = "MOVIE"
    const val TYPE_SERIES = "SERIES"

    // Video Qualities
    const val QUALITY_AUTO = "auto"
    const val QUALITY_HIGH = "high"
    const val QUALITY_MEDIUM = "medium"
    const val QUALITY_LOW = "low"

    // Genres
    val GENRES = listOf(
        "Action",
        "Comedy",
        "Drama",
        "Horror",
        "Romance",
        "Sci-Fi",
        "Thriller",
        "Documentary",
        "Animation",
        "Family",
        "Adventure",
        "Fantasy",
        "Mystery",
        "Crime",
        "War"
    )

    // Intent Keys
    object Intent {
        const val CONTENT_ID = "content_id"
        const val CONTENT_TYPE = "content_type"
        const val VIDEO_URL = "video_url"
        const val TITLE = "title"
        const val IS_LIVE_STREAM = "is_live_stream"
    }

    // Bundle Keys
    object Bundle {
        const val CONTENT = "content"
        const val EPISODE = "episode"
        const val SEASON_NUMBER = "season_number"
        const val EPISODE_NUMBER = "episode_number"
        const val FROM_NOTIFICATION = "from_notification"
    }

    // Notification Channels
    object Notification {
        const val CHANNEL_NEW_CONTENT = "new_content"
        const val CHANNEL_LIVE_STREAM = "live_stream"
        const val CHANNEL_DOWNLOAD = "download"
        const val ID_NEW_CONTENT = 1001
        const val ID_LIVE_STREAM = 1002
        const val ID_DOWNLOAD_COMPLETE = 1003
    }

    // File Names
    const val AUTH_PREFS = "auth_preferences"
    const val USER_PREFS = "user_preferences"

    // Error Codes
    object ErrorCodes {
        const val NETWORK_ERROR = 1001
        const val SERVER_ERROR = 1002
        const val AUTH_ERROR = 1003
        const val NOT_FOUND = 1004
        const val TIMEOUT_ERROR = 1005
        const val UNKNOWN_ERROR = 9999
    }

    // Cache
    const val CACHE_SIZE = 10 * 1024 * 1024L // 10MB
    const val CACHE_MAX_AGE = 5 * 60 * 1000L // 5 minutes

    // Live Streaming
    const val LIVE_BUFFER_MS = 3000
    const val LIVE_MIN_BUFFER_MS = 1000
    const val RECONNECT_DELAY_MS = 5000
    const val MAX_RECONNECT_ATTEMPTS = 3
}