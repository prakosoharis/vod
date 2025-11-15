# AlkamusVOD Android App

A modern Android video streaming application built with Kotlin, Jetpack Compose, and Clean Architecture that mirrors the web application's functionality and design.

## 🎯 Features

### Core Features
- **Video Streaming Platform** - Complete VOD service with movies and series
- **Live Streaming** - Real-time video broadcasting with HLS streaming
- **User Management** - Authentication, profiles, and personalized experience
- **Content Discovery** - Browse, search, and recommendations system
- **Watchlist Management** - Save and organize favorite content
- **Video Progress Tracking** - Resume watching from where you left off
- **Live Chat** - Real-time messaging during live streams

### Technical Features
- **Clean Architecture** - MVVM pattern with separation of concerns
- **Jetpack Compose** - Modern declarative UI framework
- **Hilt Dependency Injection** - Modern DI framework
- **Room Database** - Local caching and offline support
- **Retrofit** - Type-safe API client
- **ExoPlayer** - Advanced video playback
- **Material Design 3** - Netflix-inspired dark theme
- **Paging 3** - Efficient pagination for large datasets

## 📱 App Structure

```
apps/android/
├── app/
│   ├── src/main/java/com/alkamus/vod/
│   │   ├── di/                    # Dependency Injection
│   │   ├── data/                  # Data Layer
│   │   │   ├── local/            # Local database
│   │   │   ├── remote/           # API calls
│   │   │   └── repository/       # Repository implementations
│   │   ├── domain/               # Domain Layer
│   │   │   ├── model/            # Domain models
│   │   │   ├── repository/       # Repository interfaces
│   │   │   └── usecase/          # Business logic
│   │   ├── presentation/         # Presentation Layer
│   │   │   ├── ui/               # UI components
│   │   │   ├── navigation/       # Navigation
│   │   │   └── theme/            # Theme & styling
│   │   └── utils/                # Utility classes
│   └── src/main/res/             # Android resources
├── build.gradle.kts              # Root build file
├── settings.gradle.kts           # Project settings
└── gradle.properties            # Gradle properties
```

## 🛠️ Setup Instructions

### Prerequisites
- **Android Studio** Arctic Fox or later
- **Android SDK** API level 24+ (Android 7.0)
- **JDK** 8 or later
- **Git** for version control

### Installation Steps

1. **Clone the Repository**
   ```bash
   git clone <repository-url>
   cd vod/apps/android
   ```

2. **Open in Android Studio**
   - Open Android Studio
   - Select "Open an existing project"
   - Navigate to `apps/android` directory

3. **Sync Project**
   - Android Studio will automatically sync the project
   - Wait for Gradle sync to complete

4. **Configure Build Variants**
   - Go to `Build > Build Variants`
   - Select `debug` for development or `release` for production

5. **Update API Configuration**
   - Open `app/build.gradle.kts`
   - Update `BASE_URL` and `WEBSOCKET_URL` to match your backend

6. **Run the App**
   - Connect Android device or start emulator
   - Click the Run button (▶️) or press `Ctrl+R`

### Configuration

#### API Configuration
Update the following in `app/build.gradle.kts`:
```kotlin
defaultConfig {
    buildConfigField("String", "BASE_URL", "\"http://your-api-url.com\"")
    buildConfigField("String", "WEBSOCKET_URL", "\"http://your-websocket-url.com\"")
}
```

#### Database Configuration
The app uses Room database with the following settings:
- Database name: `vod_database`
- Version: `1`
- Migrations: Automatic destructive migration (for development)

## 🎨 Design System

### Color Palette (Netflix-inspired)
- **Primary Red**: `#e50914`
- **Background Black**: `#0a0a0a`
- **Card Background**: `#1a1a1a`
- **Text Primary**: `#ffffff`
- **Text Secondary**: `#b3b3b3`

### Typography
- **Font Family**: Inter (matching web app)
- **Hero Titles**: 56sp, Black weight
- **Section Titles**: 32sp, SemiBold
- **Body Text**: 16sp, Regular

### Shapes
- **Cards**: 8-12dp corner radius
- **Buttons**: 4-8dp corner radius
- **Dialogs**: 16dp corner radius

## 🔧 Development

### Building the App
```bash
# Debug build
./gradlew assembleDebug

# Release build
./gradlew assembleRelease

# Install debug APK
./gradlew installDebug
```

### Testing
```bash
# Unit tests
./gradlew test

# Android tests
./gradlew connectedAndroidTest

# Test coverage
./gradlew jacocoTestReport
```

### Code Style
The project uses:
- **Kotlin** coding conventions
- **Detekt** for static analysis
- **Ktlint** for formatting

## 📦 Dependencies

### Core Libraries
- **Compose BOM** - UI framework
- **Navigation Compose** - Navigation
- **Hilt** - Dependency injection
- **Room** - Database
- **Retrofit** - Network calls
- **ExoPlayer** - Video playback

### UI Libraries
- **Material Design 3** - Design system
- **Coil** - Image loading
- **Accompanist** - Compose utilities
- **Lottie** - Animations

### Testing Libraries
- **JUnit** - Unit testing
- **Mockito** - Mocking
- **Espresso** - UI testing
- **Compose Testing** - UI testing for Compose

## 🚀 Deployment

### Generate Signed APK
1. Go to `Build > Generate Signed Bundle/APK`
2. Select `APK`
3. Create or use existing keystore
4. Choose release build variant
5. Generate APK

### Publishing to Play Store
1. Create Play Console account
2. Upload signed APK or App Bundle
3. Fill store listing
4. Submit for review

## 🔒 Security

### Network Security
- HTTPS required for production
- Network Security Configuration for HTTP during development
- Certificate pinning for enhanced security

### Data Security
- JWT tokens for authentication
- Encrypted local storage
- Secure data transmission

## 🐛 Troubleshooting

### Common Issues

**Gradle Sync Fails**
- Check internet connection
- Update Android Studio
- Clear Gradle cache: `./gradlew clean`

**Build Fails**
- Check Android SDK installation
- Update build tools
- Verify Java version

**Runtime Issues**
- Check Logcat for errors
- Verify API configuration
- Test with different network conditions

### Performance Optimization
- Enable R8/ProGuard minification
- Use APK analyzer to reduce size
- Optimize image loading
- Monitor memory usage

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Submit pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

---

Built with ❤️ using modern Android development practices.