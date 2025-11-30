@echo off
echo ========================================
echo   Mostara APK Release Builder
echo ========================================
echo.

REM Get version from app.json
echo [1/4] Checking version...
cd apps\mobile
for /f "tokens=2 delims=:" %%a in ('findstr /C:"\"version\"" app.json') do set VERSION=%%a
set VERSION=%VERSION:"=%
set VERSION=%VERSION:,=%
set VERSION=%VERSION: =%
echo Version: %VERSION%
cd ..\..
echo.

REM Clean previous build
echo [2/4] Cleaning previous build...
cd apps\mobile\android
call gradlew.bat clean >nul 2>&1
cd ..\..\..
echo Clean completed!
echo.

REM Build release APK
echo [3/4] Building release APK...
echo This may take a few minutes, please wait...
cd apps\mobile\android
call gradlew.bat assembleRelease
if errorlevel 1 (
    echo.
    echo ========================================
    echo ERROR: Build failed!
    echo ========================================
    cd ..\..\..
    pause
    exit /b 1
)
cd ..\..\..
echo.
echo Build completed!
echo.

REM Copy APK to root
echo [4/4] Copying APK to root directory...
copy apps\mobile\android\app\build\outputs\apk\release\app-release.apk Mostara-v%VERSION%.apk >nul
echo.

echo ========================================
echo   BUILD SUCCESS!
echo ========================================
echo.
echo APK Location: Mostara-v%VERSION%.apk
echo APK Size:
dir Mostara-v%VERSION%.apk | findstr /C:"Mostara"
echo.
echo To install on device/emulator:
echo   adb install Mostara-v%VERSION%.apk
echo.
echo Or copy the APK to your Android device and install manually.
echo ========================================
echo.
pause
