@echo off
echo ========================================
echo Fix RNCSlider Native Module
echo ========================================
echo.

echo [1/6] Installing dependencies...
cd apps\mobile
call npm install
if errorlevel 1 (
    echo ERROR: npm install failed!
    pause
    exit /b 1
)

echo.
echo [2/6] Cleaning Android build cache...
cd android
call gradlew.bat clean
if errorlevel 1 (
    echo WARNING: Gradle clean failed, continuing...
)

echo.
echo [3/6] Removing build directories...
rd /s /q app\build 2>nul
rd /s /q build 2>nul
rd /s /q .gradle\8.8 2>nul
rd /s /q .gradle\9.0.0 2>nul

echo.
echo [4/6] Clearing Metro cache...
cd ..
rd /s /q node_modules\.cache 2>nul
del /q /f %TEMP%\metro-* 2>nul
del /q /f %TEMP%\haste-* 2>nul
del /q /f %TEMP%\react-* 2>nul

echo.
echo [5/6] Ensuring ADB reverse is set up...
cd ..\..
adb reverse tcp:8081 tcp:8081

echo.
echo [6/6] Rebuilding Android app with native modules...
echo This will take a few minutes...
cd apps\mobile
call npx react-native run-android

echo.
echo ========================================
echo Done!
echo ========================================
echo.
echo If the app is running:
echo 1. Make sure Metro bundler is running (./start-metro-fix.bat)
echo 2. Reload the app (double tap R in emulator)
echo.
pause
