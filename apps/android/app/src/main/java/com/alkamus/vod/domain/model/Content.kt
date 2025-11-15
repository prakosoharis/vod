package com.alkamus.vod.domain.model

import android.os.Parcelable
import kotlinx.parcelize.Parcelize
import java.util.Date

/**
 * Domain model for video content (movies and series)
 */
@Parcelize
data class Content(
    val id: String,
    val title: String,
    val description: String,
    val type: ContentType,
    val thumbnailUrl: String,
    val backdropUrl: String,
    val videoUrl: String? = null,
    val trailerUrl: String? = null,
    val duration: Int? = null, // in minutes for movies
    val year: Int,
    val rating: Float,
    val genres: List<String>,
    val cast: List<String>,
    val featured: Boolean = false,
    val isLive: Boolean = false,
    val seasons: List<Season>? = null, // for series
    val episodeCount: Int? = null, // for series
    val createdAt: Date,
    val updatedAt: Date,
    // User-specific fields
    val isInWatchlist: Boolean = false,
    val watchProgress: WatchProgress? = null
) : Parcelable

/**
 * Content type enum
 */
enum class ContentType {
    MOVIE,
    SERIES
}

/**
 * Season model for series
 */
@Parcelize
data class Season(
    val id: String,
    val contentId: String,
    val seasonNumber: Int,
    val title: String? = null,
    val description: String? = null,
    val episodeCount: Int,
    val episodes: List<Episode>
) : Parcelable

/**
 * Episode model for series
 */
@Parcelize
data class Episode(
    val id: String,
    val seasonId: String,
    val episodeNumber: Int,
    val title: String,
    val description: String,
    val duration: Int, // in minutes
    val thumbnailUrl: String,
    val videoUrl: String? = null,
    val airedDate: Date? = null
) : Parcelable

/**
 * Watch progress model
 */
@Parcelize
data class WatchProgress(
    val contentId: String,
    val episodeId: String? = null, // null for movies
    val progressSeconds: Int,
    val totalSeconds: Int,
    val lastWatched: Date,
    val isCompleted: Boolean = false
) : Parcelable

/**
 * Content search filter
 */
data class ContentFilter(
    val query: String? = null,
    val genres: List<String> = emptyList(),
    val types: List<ContentType> = emptyList(),
    val year: Int? = null,
    val ratingMin: Float? = null,
    val ratingMax: Float? = null,
    val featured: Boolean? = null,
    val sortBy: SortOption = SortOption.RECENT
)

/**
 * Sorting options for content
 */
enum class SortOption {
    RECENT,
    TITLE_ASC,
    TITLE_DESC,
    YEAR_ASC,
    YEAR_DESC,
    RATING_ASC,
    RATING_DESC
}

/**
 * Content list response
 */
data class ContentListResponse(
    val contents: List<Content>,
    val page: Int,
    val totalPages: Int,
    val totalItems: Int,
    val hasMore: Boolean
)