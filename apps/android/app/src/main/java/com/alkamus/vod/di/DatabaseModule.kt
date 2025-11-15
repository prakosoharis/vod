package com.alkamus.vod.di

import android.content.Context
import androidx.room.Room
import com.alkamus.vod.data.local.database.VODDatabase
import com.alkamus.vod.data.local.dao.ContentDao
import com.alkamus.vod.data.local.dao.UserDao
import com.alkamus.vod.domain.utils.Constants
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.android.qualifiers.ApplicationContext
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton

/**
 * Hilt module for database dependencies
 */
@Module
@InstallIn(SingletonComponent::class)
object DatabaseModule {

    @Provides
    @Singleton
    fun provideVODDatabase(
        @ApplicationContext context: Context
    ): VODDatabase {
        return Room.databaseBuilder(
            context,
            VODDatabase::class.java,
            Constants.DATABASE_NAME
        )
            .fallbackToDestructiveMigration()
            .build()
    }

    @Provides
    fun provideContentDao(database: VODDatabase): ContentDao {
        return database.contentDao()
    }

    @Provides
    fun provideUserDao(database: VODDatabase): UserDao {
        return database.userDao()
    }
}