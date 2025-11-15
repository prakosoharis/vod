package com.alkamus.vod.utils

import android.content.Context
import android.content.Intent
import android.net.Uri
import android.widget.Toast
import androidx.fragment.app.Fragment
import androidx.lifecycle.LifecycleOwner
import androidx.lifecycle.lifecycleScope
import com.alkamus.vod.domain.utils.Result
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.collectLatest
import kotlinx.coroutines.launch
import java.text.SimpleDateFormat
import java.util.*

/**
 * Extension functions for common operations
 */

// Context extensions
fun Context.showToast(message: String, duration: Int = Toast.LENGTH_SHORT) {
    Toast.makeText(this, message, duration).show()
}

fun Context.openUrl(url: String) {
    val intent = Intent(Intent.ACTION_VIEW, Uri.parse(url))
    if (intent.resolveActivity(packageManager) != null) {
        startActivity(intent)
    }
}

fun Context.shareText(text: String, subject: String = "") {
    val intent = Intent(Intent.ACTION_SEND).apply {
        type = "text/plain"
        putExtra(Intent.EXTRA_TEXT, text)
        putExtra(Intent.EXTRA_SUBJECT, subject)
    }
    startActivity(Intent.createChooser(intent, null))
}

// Fragment extensions
fun Fragment.showToast(message: String, duration: Int = Toast.LENGTH_SHORT) {
    requireContext().showToast(message, duration)
}

fun Fragment.openUrl(url: String) {
    requireContext().openUrl(url)
}

fun Fragment.shareText(text: String, subject: String = "") {
    requireContext().shareText(text, subject)
}

// Lifecycle extensions
fun LifecycleOwner.launchWhenStarted(block: suspend () -> Unit) {
    lifecycleScope.launch {
        block()
    }
}

fun <T> LifecycleOwner.collectWhenStarted(
    flow: Flow<T>,
    action: suspend (T) -> Unit
) {
    lifecycleScope.launch {
        flow.collectLatest { action(it) }
    }
}

// Result extensions
fun <T> Result<T>.doOnSuccess(action: (T) -> Unit): Result<T> {
    if (this is Result.Success) action(data)
    return this
}

fun <T> Result<T>.doOnError(action: (Throwable) -> Unit): Result<T> {
    if (this is Result.Error) action(exception)
    return this
}

fun <T> Result<T>.doOnLoading(action: () -> Unit): Result<T> {
    if (this is Result.Loading) action()
    return this
}

// String extensions
fun String.formatAsDuration(): String {
    val minutes = this.toIntOrNull() ?: return this
    val hours = minutes / 60
    val remainingMinutes = minutes % 60

    return when {
        hours > 0 -> "${hours}h ${remainingMinutes}m"
        remainingMinutes > 0 -> "${remainingMinutes}m"
        else -> "0m"
    }
}

fun String.formatAsYear(): String {
    return this.takeIf { it.length >= 4 } ?: this
}

fun String.formatAsRating(): String {
    return try {
        val rating = this.toFloat()
        String.format("%.1f", rating)
    } catch (e: NumberFormatException) {
        this
    }
}

fun String.isEmailValid(): Boolean {
    return android.util.Patterns.EMAIL_ADDRESS.matcher(this).matches()
}

// Date extensions
fun Date.formatAsReadable(): String {
    val sdf = SimpleDateFormat("MMM dd, yyyy", Locale.getDefault())
    return sdf.format(this)
}

fun Date.formatAsTimeAgo(): String {
    val now = System.currentTimeMillis()
    val diff = now - time

    val seconds = diff / 1000
    val minutes = seconds / 60
    val hours = minutes / 60
    val days = hours / 24

    return when {
        days > 0 -> "${days}d ago"
        hours > 0 -> "${hours}h ago"
        minutes > 0 -> "${minutes}m ago"
        else -> "just now"
    }
}

// Number extensions
fun Int.formatAsDuration(): String {
    val hours = this / 60
    val minutes = this % 60

    return when {
        hours > 0 -> "${hours}h ${minutes}m"
        minutes > 0 -> "${minutes}m"
        else -> "0m"
    }
}

fun Float.formatAsRating(): String {
    return String.format("%.1f", this)
}

fun Int.formatAsFileSize(): String {
    val kb = this / 1024.0
    val mb = kb / 1024.0
    val gb = mb / 1024.0

    return when {
        gb >= 1 -> String.format("%.1f GB", gb)
        mb >= 1 -> String.format("%.1f MB", mb)
        kb >= 1 -> String.format("%.1f KB", kb)
        else -> "$this B"
    }
}

// List extensions
fun <T> List<T>.takeIfNotEmpty(): List<T>? = if (isNotEmpty()) this else null

fun <T> List<T>.getOrNull(index: Int): T? = getOrNull(index)

fun <T> List<T>.safeGet(index: Int, default: T): T = getOrNull(index) ?: default

fun <T> List<T>.getRandomItem(): T? = if (isNotEmpty()) this[Random.nextInt(size)] else null

fun <T> List<T>.shuffleRandomly(): List<T> = this.shuffled()

fun <T> List<T>.takeRandom(count: Int): List<T> = this.shuffled().take(count)

// Color extensions
fun Int.toHexString(): String = String.format("#%06X", (0xFFFFFF and this))

// Validation extensions
fun String.isValidPassword(): Boolean {
    return this.length >= 6
}

fun String.isStrongPassword(): Boolean {
    return this.length >= 8 &&
            this.any { it.isUpperCase() } &&
            this.any { it.isLowerCase() } &&
            this.any { it.isDigit() }
}

// Utility extensions
fun Boolean?.orFalse(): Boolean = this ?: false

fun Boolean?.orTrue(): Boolean = this ?: true

fun <T> T?.orNull(): T? = this

fun <T> T?.orDefault(default: T): T = this ?: default

fun <T> T?.takeIfNotNull(): T? = this