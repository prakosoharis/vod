package com.alkamus.vod.utils

import java.text.SimpleDateFormat
import java.util.*

/**
 * Date utilities for formatting and parsing dates
 */
object DateUtils {

    private const val ISO_8601_FORMAT = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'"
    private const val READABLE_FORMAT = "MMM dd, yyyy"
    private const val SHORT_FORMAT = "MMM dd"
    private const val TIME_FORMAT = "h:mm a"
    private const val YEAR_FORMAT = "yyyy"

    private val defaultLocale = Locale.getDefault()

    /**
     * Format ISO date string to readable format
     */
    fun formatIsoDate(isoDateString: String): String {
        return try {
            val isoFormat = SimpleDateFormat(ISO_8601_FORMAT, defaultLocale)
            isoFormat.timeZone = TimeZone.getTimeZone("UTC")
            val date = isoFormat.parse(isoDateString)

            val readableFormat = SimpleDateFormat(READABLE_FORMAT, defaultLocale)
            readableFormat.timeZone = TimeZone.getDefault()
            date?.let { readableFormat.format(it) } ?: isoDateString
        } catch (e: Exception) {
            isoDateString
        }
    }

    /**
     * Format date to short format (e.g., "Jan 15")
     */
    fun formatDateShort(date: Date): String {
        val format = SimpleDateFormat(SHORT_FORMAT, defaultLocale)
        return format.format(date)
    }

    /**
     * Format date to time format (e.g., "3:30 PM")
     */
    fun formatTime(date: Date): String {
        val format = SimpleDateFormat(TIME_FORMAT, defaultLocale)
        return format.format(date)
    }

    /**
     * Format date to year only (e.g., "2023")
     */
    fun formatYear(date: Date): String {
        val format = SimpleDateFormat(YEAR_FORMAT, defaultLocale)
        return format.format(date)
    }

    /**
     * Get time ago string (e.g., "2 hours ago")
     */
    fun getTimeAgo(date: Date): String {
        val now = System.currentTimeMillis()
        val diff = now - date.time

        val seconds = diff / 1000
        val minutes = seconds / 60
        val hours = minutes / 60
        val days = hours / 24
        val weeks = days / 7
        val months = days / 30
        val years = days / 365

        return when {
            years > 0 -> "${years} year${if (years > 1) "s" else ""} ago"
            months > 0 -> "${months} month${if (months > 1) "s" else ""} ago"
            weeks > 0 -> "${weeks} week${if (weeks > 1) "s" else ""} ago"
            days > 0 -> "${days} day${if (days > 1) "s" else ""} ago"
            hours > 0 -> "${hours} hour${if (hours > 1) "s" else ""} ago"
            minutes > 0 -> "${minutes} minute${if (minutes > 1) "s" else ""} ago"
            seconds > 30 -> "$seconds seconds ago"
            else -> "Just now"
        }
    }

    /**
     * Format duration in minutes to readable string (e.g., "2h 30m")
     */
    fun formatDuration(minutes: Int): String {
        val hours = minutes / 60
        val remainingMinutes = minutes % 60

        return when {
            hours > 0 -> "${hours}h ${remainingMinutes}m"
            remainingMinutes > 0 -> "${remainingMinutes}m"
            else -> "0m"
        }
    }

    /**
     * Format episode information (e.g., "S01 E05")
     */
    fun formatEpisodeInfo(seasonNumber: Int, episodeNumber: Int): String {
        return String.format("S%02d E%02d", seasonNumber, episodeNumber)
    }

    /**
     * Format episode title (e.g., "Season 1 Episode 5")
     */
    fun formatEpisodeTitle(seasonNumber: Int, episodeNumber: Int): String {
        return "Season $seasonNumber Episode $episodeNumber"
    }

    /**
     * Parse string to date with various formats
     */
    fun parseDate(dateString: String): Date? {
        val formats = listOf(
            ISO_8601_FORMAT,
            READABLE_FORMAT,
            SHORT_FORMAT,
            "yyyy-MM-dd",
            "yyyy-MM-dd HH:mm:ss",
            "MMM dd, yyyy HH:mm:ss"
        )

        for (format in formats) {
            try {
                val sdf = SimpleDateFormat(format, defaultLocale)
                return sdf.parse(dateString)
            } catch (e: Exception) {
                // Continue to next format
            }
        }
        return null
    }

    /**
     * Check if date is today
     */
    fun isToday(date: Date): Boolean {
        val today = Calendar.getInstance()
        val calendar = Calendar.getInstance()
        calendar.time = date

        return today.get(Calendar.YEAR) == calendar.get(Calendar.YEAR) &&
                today.get(Calendar.DAY_OF_YEAR) == calendar.get(Calendar.DAY_OF_YEAR)
    }

    /**
     * Check if date is yesterday
     */
    fun isYesterday(date: Date): Boolean {
        val yesterday = Calendar.getInstance()
        yesterday.add(Calendar.DAY_OF_YEAR, -1)

        val calendar = Calendar.getInstance()
        calendar.time = date

        return yesterday.get(Calendar.YEAR) == calendar.get(Calendar.YEAR) &&
                yesterday.get(Calendar.DAY_OF_YEAR) == calendar.get(Calendar.DAY_OF_YEAR)
    }

    /**
     * Check if date is this week
     */
    fun isThisWeek(date: Date): Boolean {
        val today = Calendar.getInstance()
        val calendar = Calendar.getInstance()
        calendar.time = date

        return today.get(Calendar.YEAR) == calendar.get(Calendar.YEAR) &&
                today.get(Calendar.WEEK_OF_YEAR) == calendar.get(Calendar.WEEK_OF_YEAR)
    }

    /**
     * Check if date is this year
     */
    fun isThisYear(date: Date): Boolean {
        val today = Calendar.getInstance()
        val calendar = Calendar.getInstance()
        calendar.time = date

        return today.get(Calendar.YEAR) == calendar.get(Calendar.YEAR)
    }

    /**
     * Get age from birth date
     */
    fun getAge(birthDate: Date): Int {
        val today = Calendar.getInstance()
        val birthCalendar = Calendar.getInstance()
        birthCalendar.time = birthDate

        var age = today.get(Calendar.YEAR) - birthCalendar.get(Calendar.YEAR)
        if (today.get(Calendar.DAY_OF_YEAR) < birthCalendar.get(Calendar.DAY_OF_YEAR)) {
            age--
        }
        return age
    }
}