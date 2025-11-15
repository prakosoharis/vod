package com.alkamus.vod.domain.model

import android.os.Parcelable
import kotlinx.parcelize.Parcelize
import java.util.Date

/**
 * Domain model for user
 */
@Parcelize
data class User(
    val id: String,
    val email: String,
    val fullName: String,
    val avatarUrl: String? = null,
    val isActive: Boolean = true,
    val createdAt: Date,
    val updatedAt: Date
) : Parcelable

/**
 * User authentication data
 */
@Parcelize
data class AuthData(
    val user: User,
    val token: String,
    val refreshToken: String? = null,
    val expiresIn: Long? = null
) : Parcelable

/**
 * User registration data
 */
data class RegisterRequest(
    val email: String,
    val password: String,
    val fullName: String
)

/**
 * User login data
 */
data class LoginRequest(
    val email: String,
    val password: String
)

/**
 * User profile update data
 */
data class UserProfileUpdate(
    val fullName: String? = null,
    val avatarUrl: String? = null
)