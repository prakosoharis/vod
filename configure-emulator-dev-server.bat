@echo off
echo ========================================
echo Configure React Native Dev Server
echo ========================================
echo.
echo Your local IP address is: 192.168.18.30
echo.
echo MANUAL STEPS IN EMULATOR:
echo 1. Shake the device (Ctrl+M or Ctrl+Shift+M)
echo 2. Select "Settings"
echo 3. Select "Debug server host ^& port for device"
echo 4. Enter: 192.168.18.30:8081
echo 5. Go back and select "Reload"
echo.
echo OR use ADB command (automatic):
echo.
pause

echo Setting dev server via ADB...
adb shell input text "192.168.18.30:8081"

echo.
echo Done! Now reload the app in emulator.
echo Press Ctrl+M or Ctrl+Shift+M in emulator, then select "Reload"
pause
