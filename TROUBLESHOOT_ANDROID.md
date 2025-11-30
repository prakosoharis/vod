# Troubleshooting React Native Android

## Error: "Could not connect to development server"

### Langkah-langkah solusi:

#### 1. Pastikan Metro Bundler berjalan
```bash
cd apps/mobile
npm start
```

#### 2. Cek device/emulator terhubung
```bash
adb devices
```
Harus muncul device dengan status "device"

#### 3. Setup port forwarding (PENTING!)
```bash
adb reverse tcp:8081 tcp:8081
```

#### 4. Clear cache dan restart
```bash
# Clear Metro cache
npm start -- --reset-cache

# Clear Android build cache
cd android
./gradlew clean
cd ..

# Rebuild app
npm run android
```

#### 5. Jika masih error, restart ADB
```bash
adb kill-server
adb start-server
adb devices
adb reverse tcp:8081 tcp:8081
```

### Tips tambahan:
- Setiap kali restart emulator, jalankan ulang: `adb reverse tcp:8081 tcp:8081`
- Pastikan tidak ada firewall yang block port 8081
- Jika pakai physical device, pastikan USB debugging aktif
- Pastikan device dan PC di network yang sama (jika pakai WiFi debugging)
