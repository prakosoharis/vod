package com.alkamus.vod.di

import com.alkamus.vod.data.repository.ContentRepositoryImpl
import com.alkamus.vod.data.repository.AuthRepositoryImpl
import com.alkamus.vod.data.repository.UserRepositoryImpl
import com.alkamus.vod.domain.repository.ContentRepository
import com.alkamus.vod.domain.repository.AuthRepository
import com.alkamus.vod.domain.repository.UserRepository
import dagger.Binds
import dagger.Module
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton

/**
 * Hilt module for repository bindings
 */
@Module
@InstallIn(SingletonComponent::class)
abstract class RepositoryModule {

    @Binds
    @Singleton
    abstract fun bindContentRepository(
        contentRepositoryImpl: ContentRepositoryImpl
    ): ContentRepository

    @Binds
    @Singleton
    abstract fun bindAuthRepository(
        authRepositoryImpl: AuthRepositoryImpl
    ): AuthRepository

    @Binds
    @Singleton
    abstract fun bindUserRepository(
        userRepositoryImpl: UserRepositoryImpl
    ): UserRepository
}