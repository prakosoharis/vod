package com.alkamus.vod.presentation.theme

import android.app.Activity
import android.os.Build
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.ColorScheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.dynamicDarkColorScheme
import androidx.compose.material3.dynamicLightColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.SideEffect
import androidx.compose.ui.graphics.toArgb
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalView
import androidx.core.view.WindowCompat

// Netflix-inspired dark color scheme
private val DarkColorScheme = darkColorScheme(
    primary = PrimaryRed,
    onPrimary = TextPrimary,
    primaryContainer = PrimaryRedDark,
    onPrimaryContainer = TextPrimary,

    secondary = TextSecondary,
    onSecondary = BackgroundBlack,
    secondaryContainer = SurfaceVariant,
    onSecondaryContainer = TextSecondary,

    tertiary = AccentGold,
    onTertiary = BackgroundBlack,
    tertiaryContainer = AccentGoldDark,
    onTertiaryContainer = TextPrimary,

    background = BackgroundBlack,
    onBackground = TextPrimary,

    surface = BackgroundCard,
    onSurface = TextPrimary,
    surfaceVariant = SurfaceVariant,
    onSurfaceVariant = TextSecondary,

    error = Error,
    errorContainer = PrimaryRedDark,
    onError = TextPrimary,
    onErrorContainer = TextPrimary,

    outline = BorderDark,
    outlineVariant = BorderMedium,

    scrim = OverlayDark,

    surfaceTint = PrimaryRed
)

// Light color scheme for completeness (though not used)
private val LightColorScheme = lightColorScheme(
    primary = PrimaryRed,
    onPrimary = TextPrimary,
    primaryContainer = PrimaryRedLight,
    onPrimaryContainer = BackgroundBlack,

    secondary = TextSecondary,
    onSecondary = TextPrimary,
    secondaryContainer = SurfaceVariant,
    onSecondaryContainer = TextSecondary,

    tertiary = AccentGold,
    onTertiary = BackgroundBlack,
    tertiaryContainer = AccentGoldDark,
    onTertiaryContainer = TextPrimary,

    background = TextPrimary,
    onBackground = BackgroundBlack,

    surface = SurfaceVariant,
    onSurface = BackgroundBlack,
    surfaceVariant = BorderMedium,
    onSurfaceVariant = TextSecondary,

    error = Error,
    errorContainer = PrimaryRedLight,
    onError = TextPrimary,
    onErrorContainer = BackgroundBlack,

    outline = BorderMedium,
    outlineVariant = BorderLight,

    scrim = OverlayMedium,

    surfaceTint = PrimaryRed
)

/**
 * AlkamusVOD theme - always uses dark theme to match Netflix-style cinema experience
 */
@Composable
fun AlkamusVODTheme(
    darkTheme: Boolean = true, // Always true for cinema experience
    // Dynamic color is available on Android 12+
    dynamicColor: Boolean = false, // Disabled to maintain consistent brand colors
    content: @Composable () -> Unit
) {
    val colorScheme = DarkColorScheme

    val view = LocalView.current
    if (!view.isInEditMode) {
        SideEffect {
            val window = (view.context as Activity).window
            window.statusBarColor = BackgroundBlack.toArgb()
            window.navigationBarColor = BackgroundBlack.toArgb()
            WindowCompat.getInsetsController(window, view).isAppearanceLightStatusBars = false
            WindowCompat.getInsetsController(window, view).isAppearanceLightNavigationBars = false
        }
    }

    MaterialTheme(
        colorScheme = colorScheme,
        typography = Typography,
        shapes = Shapes,
        content = content
    )
}