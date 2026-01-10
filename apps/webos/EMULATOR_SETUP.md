# WebOS Emulator Setup Guide

## Cara Mudah Menemukan IP dan Port Emulator

### Method 1: Gunakan Script Helper (Recommended)

Jalankan script ini di PowerShell:

```powershell
cd C:\Users\HARIS\Documents\LC\vod\apps\webos
.\check-emulator.ps1
```

Script ini akan:
- Cek apakah emulator berjalan
- Cek port yang terbuka
- Menampilkan device yang tersedia
- Memberikan instruksi langkah demi langkah

---

### Method 2: Setup Otomatis

Jika emulator sudah berjalan, jalankan:

```powershell
# Setup device otomatis (akan mencari emulator sendiri)
ares-setup-device --default
```

Lalu:

```powershell
# Install
ares-install .\com.mostara.webos_1.0.0_ipk_all.ipk emulator

# Launch
ares-launch com.mostara.webos emulator
```

---

### Method 3: Cara Manual

**Step 1: Buka LG webOS TV IDE**

1. Buka aplikasi "LG webOS TV IDE" dari desktop/start menu
2. Pilih menu **Tools** → **TV Emulator**
3. Klik **Open Emulator** atau **Create Emulator**
4. Tunggu sampai emulator loading selesai (tampilan TV muncul)

**Step 2: Cek IP di Emulator**

Setelah emulator terbuka:
1. Di window emulator, lihat bagian bawah atau kanan
2. Ada informasi seperti: `developer@127.0.0.1:6622`
3. Gunakan IP dan port tersebut

**Step 3: Setup Device**

```powershell
# Setup device dengan info dari emulator
ares-setup-device --deviceinfo emulator --device emulator --icon emulator
```

**Step 4: Install & Launch**

```powershell
cd C:\Users\HARIS\Documents\LC\vod\apps\webos\dist

# Install
ares-install .\com.mostara.webos_1.0.0_ipk_all.ipk emulator

# Launch
ares-launch com.mostara.webos emulator
```

---

### Method 4: Browser Testing (Tanpa Emulator!)

Jika emulator bermasalah, gunakan browser untuk testing:

```powershell
cd C:\Users\HARIS\Documents\LC\vod\apps\webos

# Jalankan dev server
npm run dev
```

Lalu buka: **http://localhost:5173**

**Controls:**
- **Arrow Keys** - Navigasi
- **Enter** - Pilih item
- **Backspace** - Kembali
- **Escape** - Home

Ini akan memberikan pengalaman yang sangat mirip dengan TV!

---

## Troubleshooting

### Error: "Connection refused"

**Penyebab:** Emulator belum berjalan atau port salah

**Solusi:**
1. Pastikan emulator WebOS sudah berjalan
2. Jalankan script helper: `.\check-emulator.ps1`
3. Setup ulang device: `ares-setup-device --remove emulator && ares-setup-device --deviceinfo emulator --device emulator --icon emulator`

### Error: "No meta file"

**Penyebab:** appinfo.json tidak ada di dist folder

**Solusi:**
```powershell
cd C:\Users\HARIS\Documents\LC\vod\apps\webos
npm run build:webos
```

### Emulator tidak bisa dibuka

**Solusi:**
1. Uninstall LG webOS TV SDK
2. Install ulang dari: https://webostv.developer.lge.com/sdk/sdk-download/
3. Pastikan choose "TV Emulator" saat installasi

---

## Quick Reference Commands

```powershell
# Check available devices
ares-device-info

# Setup device (auto)
ares-setup-device --default

# Setup device (manual)
ares-setup-device --deviceinfo emulator --device emulator --icon emulator

# Remove device
ares-setup-device --remove emulator

# Install app
ares-install .\com.mostara.webos_1.0.0_ipk_all.ipk emulator

# Launch app
ares-launch com.mostara.webos emulator

# Remove app
ares-remove com.mostara.webos emulator

# Inspect (debug)
ares-inspect com.mostara.webos emulator
```

---

## Rekomendasi

**Untuk development cepat:**
Gunakan browser testing - lebih mudah dan cepat!

**Untuk testing di TV asli:**
Gunakan WebOS emulator hanya untuk final testing sebelum deploy ke TV asli.

---

## Summary: Cara Paling Mudah

1. **Jalankan script helper:**
   ```powershell
   .\check-emulator.ps1
   ```

2. **Ikuti instruksi dari script**

3. **Atau gunakan browser (lebih cepat):**
   ```powershell
   npm run dev
   # Buka http://localhost:5173
   ```
