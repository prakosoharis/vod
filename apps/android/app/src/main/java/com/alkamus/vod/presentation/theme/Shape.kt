package com.alkamus.vod.presentation.theme

import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Shapes
import androidx.compose.ui.unit.dp

// Netflix-inspired shapes matching the web app design
val Shapes = Shapes(
    extraSmall = RoundedCornerShape(4.dp),
    small = RoundedCornerShape(8.dp),
    medium = RoundedCornerShape(12.dp),
    large = RoundedCornerShape(16.dp),
    extraLarge = RoundedCornerShape(28.dp)
)

// Custom shapes for specific components
object VODShapes {
    // Content cards
    val ContentCard = RoundedCornerShape(8.dp)
    val ContentCardLarge = RoundedCornerShape(12.dp)

    // Buttons
    val ButtonShape = RoundedCornerShape(4.dp)
    val ButtonShapeLarge = RoundedCornerShape(8.dp)

    // Video player
    val PlayerOverlay = RoundedCornerShape(0.dp)
    val PlayerControls = RoundedCornerShape(8.dp)

    // Dialogs and modals
    val Dialog = RoundedCornerShape(16.dp)
    val BottomSheet = RoundedCornerShape(topStart = 16.dp, topEnd = 16.dp)

    // Search and input fields
    val SearchField = RoundedCornerShape(24.dp)
    val InputField = RoundedCornerShape(8.dp)

    // Navigation elements
    val BottomNavigation = RoundedCornerShape(0.dp)
    val NavigationRail = RoundedCornerShape(0.dp)

    // Live chat
    val ChatBubble = RoundedCornerShape(16.dp)
    val ChatInput = RoundedCornerShape(24.dp)

    // Featured content overlay
    val FeaturedOverlay = RoundedCornerShape(0.dp)

    // Profile and settings
    val Avatar = RoundedCornerShape(50) // Circle
    val SettingsCard = RoundedCornerShape(12.dp)

    // Progress indicators
    val ProgressBar = RoundedCornerShape(50) // Very rounded
    val EpisodeCard = RoundedCornerShape(12.dp)
}