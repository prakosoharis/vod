@echo off
echo ============================================
echo Fix Android Metro Connection
echo ============================================
echo.

REM Kill any existing Metro process
echo [1/5] Stopping Metro Bundler...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul

REM Restart ADB
echo [2/5] Restarting ADB...
adb kill-server
adb start-server
timeout /t 2 /nobreak >nul

REM Setup port forwarding
echo [3/5] Setting up port forwarding...
adb reverse tcp:8081 tcp:8081
adb forward tcp:8081 tcp:8081
echo.

REM Show instructions
echo [4/5] Starting Metro Bundler...
echo.
echo ============================================
echo MANUAL STEPS REQUIRED IN EMULATOR:
echo ============================================
echo 1. Open the app on emulator
echo 2. Press Ctrl+M to open Dev Menu
echo 3. Select "Settings"
echo 4. Select "Debug server host & port for device"
echo 5. Enter: 10.0.2.2:8081
echo 6. Click OK
echo 7. Press Ctrl+M again and select "Reload"
echo ============================================
echo.
echo Press any key to start Metro Bundler...
pause >nul

REM Start Metro
echo [5/5] Starting Metro...
cd /d "%~dp0apps\mobile"
call npm start -- --reset-cache --host 0.0.0.0
