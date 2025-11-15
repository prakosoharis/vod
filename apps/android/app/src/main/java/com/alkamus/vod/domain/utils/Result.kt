package com.alkamus.vod.domain.utils

/**
 * A generic wrapper class for handling success and error states
 */
sealed class Result<out T> {
    data class Success<T>(val data: T) : Result<T>()
    data class Error(val exception: Throwable) : Result<Nothing>()
    object Loading : Result<Nothing>()

    val isSuccess: Boolean
        get() = this is Success

    val isError: Boolean
        get() = this is Error

    val isLoading: Boolean
        get() = this is Loading

    /**
     * Returns the data if success, null otherwise
     */
    fun getOrNull(): T? = when (this) {
        is Success -> data
        else -> null
    }

    /**
     * Returns the data if success, throws exception if error
     */
    fun getOrThrow(): T = when (this) {
        is Success -> data
        is Error -> throw exception
        is Loading -> throw IllegalStateException("Result is still loading")
    }

    /**
     * Maps the success value to another type
     */
    inline fun <R> map(transform: (T) -> R): Result<R> = when (this) {
        is Success -> Success(transform(data))
        is Error -> this
        is Loading -> this
    }

    /**
     * Executes an action on the success value
     */
    inline fun onSuccess(action: (T) -> Unit): Result<T> {
        if (this is Success) action(data)
        return this
    }

    /**
     * Executes an action on the error
     */
    inline fun onError(action: (Throwable) -> Unit): Result<T> {
        if (this is Error) action(exception)
        return this
    }

    /**
     * Executes an action while loading
     */
    inline fun onLoading(action: () -> Unit): Result<T> {
        if (this is Loading) action()
        return this
    }
}

/**
 * Creates a Success result
 */
fun <T> Result.Companion.success(data: T): Result<T> = Result.Success(data)

/**
 * Creates an Error result
 */
fun Result.Companion.error(exception: Throwable): Result<Nothing> = Result.Error(exception)

/**
 * Creates a Loading result
 */
fun Result.Companion.loading(): Result<Nothing> = Result.Loading

/**
 * Wraps a suspending function call with try-catch and returns Result
 */
suspend fun <T> safeCall(action: suspend () -> T): Result<T> {
    return try {
        Result.success(action())
    } catch (e: Exception) {
        Result.error(e)
    }
}