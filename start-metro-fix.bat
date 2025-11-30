@echo off
echo ========================================
echo Metro Bundler Fix for Windows
echo ========================================
echo.

REM Kill any existing Metro processes
echo [1/6] Stopping existing Metro processes...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul

REM Clear React Native cache
echo [2/6] Clearing React Native cache...
cd apps\mobile
if exist node_modules\.cache rd /s /q node_modules\.cache
if exist %TEMP%\metro-* rd /s /q %TEMP%\metro-*
if exist %TEMP%\haste-* rd /s /q %TEMP%\haste-*
if exist %TEMP%\react-* rd /s /q %TEMP%\react-*

REM Setup ADB reverse
echo [3/6] Setting up ADB reverse port forwarding...
adb reverse tcp:8081 tcp:8081
adb reverse tcp:8097 tcp:8097

REM Show device info
echo [4/6] Connected devices:
adb devices
echo.

REM Allow firewall (might need admin rights)
echo [5/6] Checking Windows Firewall...
netsh advfirewall firewall show rule name="Node.js" >nul 2>&1
if errorlevel 1 (
    echo Adding firewall rule for Node.js...
    netsh advfirewall firewall add rule name="Node.js" dir=in action=allow program="%ProgramFiles%\nodejs\node.exe" enable=yes
)

REM Start Metro with host binding
echo [6/6] Starting Metro Bundler with host binding to 0.0.0.0...
echo.
echo Metro will start now. Press Ctrl+C to stop.
echo.
echo If this doesn't work, try these manual steps:
echo 1. In emulator, shake device (Ctrl+M or Ctrl+Shift+M)
echo 2. Go to "Settings" ^> "Change Bundle Location"
echo 3. Enter: 192.168.18.30:8081
echo.
echo ========================================
echo.

npm start -- --host 0.0.0.0 --reset-cache
