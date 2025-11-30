@echo off
echo ============================================
echo Fix BlueStacks Metro Connection
echo ============================================
echo.
echo Your PC IP: 192.168.18.30
echo Metro Port: 8081
echo.

REM Check if running as admin
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo WARNING: Not running as Administrator
    echo Firewall rule may fail. Right-click and "Run as Administrator" for full setup.
    echo.
    timeout /t 3 /nobreak >nul
)

REM Add Windows Firewall rule for Metro
echo [1/4] Adding Windows Firewall rule for port 8081...
netsh advfirewall firewall add rule name="Metro Bundler Port 8081" dir=in action=allow protocol=TCP localport=8081 >nul 2>&1
if %errorLevel% equ 0 (
    echo    SUCCESS: Firewall rule added
) else (
    echo    SKIPPED: Firewall rule already exists or need admin rights
)
echo.

REM Kill any existing Metro process
echo [2/4] Stopping existing Metro Bundler...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 2 /nobreak >nul

REM Check BlueStacks connection
echo [3/4] Checking BlueStacks connection...
adb devices
echo.

echo [4/4] Setup Instructions:
echo ============================================
echo LANGKAH-LANGKAH DI BLUESTACKS:
echo ============================================
echo 1. Buka aplikasi "alkamus-vod-mobile" di BlueStacks
echo 2. Tekan Ctrl+Shift+D untuk buka Dev Menu
echo    (atau shake gesture di BlueStacks settings)
echo 3. Tap "Settings"
echo 4. Tap "Debug server host & port for device"
echo 5. Masukkan: 192.168.18.30:8081
echo    ^(PENTING: pakai IP ini, bukan localhost^)
echo 6. Tap OK
echo 7. Kembali ke Dev Menu (Ctrl+Shift+D)
echo 8. Tap "Reload"
echo ============================================
echo.
echo Press any key to start Metro Bundler...
pause >nul

REM Start Metro
echo.
echo Starting Metro Bundler on 0.0.0.0:8081...
echo Keep this window open!
echo.
cd /d "%~dp0apps\mobile"
call npm start -- --reset-cache --host 0.0.0.0
