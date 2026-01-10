# Cara Testing Mostara VOD di WebOS TV Asli

## Persiapan di TV

### Step 1: Enable Developer Mode

1. Nyalakan TV LG WebOS Anda
2. Buka **Settings** (Pengaturan)
3. Pilih **All Settings** (Semua Pengaturan)
4. Cari menu **General** (Umum)
5. Gulir ke bawah dan cari **Developer Mode** (Mode Pengembang)

**Jika tidak ada:**
- Pastikan TV model Anda support Developer Mode (LG webOS TV 3.0+)
- Check di: https://webostv.developer.lge.com/discover/specifications/tv-specifications

### Step 2: Buka Developer Mode App

1. Buka aplikasi **Developer Mode** dari TV
2. Anda akan diminta untuk:
   - **Enable Developer Mode**
   - **Set password** (catat password ini!)
3. Setelah enable, TV akan restart

### Step 3: Set IP Address TV

1. Setelah TV restart, buka lagi **Developer Mode**
2. Note IP address TV (biasanya di bagian atas)
3. Contoh: `192.168.1.100`

**Alternatif:**
- Settings → Network → Wi-Fi/LAN Connection → IP Address

---

## Persiapan di Computer

### Step 1: Pastikan ares CLI sudah install

```powershell
# Cek ares CLI
ares-version

# Jika error, install LG webOS TV SDK
# Download dari: https://webostv.developer.lge.com/sdk/sdk-download/
```

### Step 2: Setup Computer ke TV

**Pastikan computer dan TV di network yang sama (WiFi/LAN yang sama)**

```powershell
# Add TV sebagai device
ares-setup-device --deviceinfo tv --device tv --info "name:Mostara TV"

# Atau dengan IP spesifik (ganti dengan IP TV Anda)
ares-setup-device --deviceinfo developer@192.168.1.100:9992 --device tv --info "name:Mostara TV"
```

**Parameter:**
- `--deviceinfo` - IP:port TV (default: `developer@IP:9992`)
- `--device` - Nama device (contoh: `tv`)
- `--info` - Info tambahan (opsional)

### Step 3: Verify Connection

```powershell
# Cek semua device
ares-device-info

# Harus muncul:
# name       deviceinfo               connection  profile
# ---------  ------------------------  ----------  -------
# tv         developer@192.168.1.100  ssh         ose
```

---

## Build dan Deploy ke TV

### Step 1: Build Aplikasi

```powershell
cd C:\Users\HARIS\Documents\LC\vod\apps\webos
npm run build:webos
```

### Step 2: Install ke TV

```powershell
cd dist

# Install ke TV
ares-install com.mostara.webos_1.0.0_ipk_all.ipk tv
```

### Step 3: Launch Aplikasi

```powershell
# Launch aplikasi di TV
ares-launch com.mostara.webos tv
```

Aplikasi sekarang akan terbuka di TV Anda!

---

## Debugging di TV

### Buka Inspector (Chrome DevTools)

```powershell
# Buka inspector untuk debugging
ares-inspect com.mostara.webos tv
```

Ini akan membuka Chrome dengan DevTools yang terhubung ke TV:
- Console - Lihat error
- Network - Monitor API calls
- Elements - Inspect DOM
- Sources - Debug JavaScript

### View Logs di TV

**Cara 1: WebOS Inspector**
- Buka `ares-inspect` seperti di atas
- Cek tab **Console**

**Cara 2: TV Settings**
- Buka Developer Mode di TV
- Pilih **View Logs**
- Akan menampilkan log aplikasi

---

## Troubleshooting

### Error: "Connection refused" / "Cannot connect"

**Penyebab:**
- TV tidak di network yang sama dengan computer
- Developer Mode belum di-enable
- IP address salah
- Firewall memblokir port 9992

**Solusi:**
```powershell
# 1. Cek IP TV
# Settings → Network → IP Address

# 2. Ping TV dari computer
ping 192.168.1.100

# 3. Cek port 9992 terbuka
netstat -ano | findstr :9992

# 4. Disable firewall sementara (Windows)
# Windows Security → Firewall → Turn off

# 5. Setup ulang device
ares-setup-device --remove tv
ares-setup-device --deviceinfo developer@192.168.1.100:9992 --device tv --info "name:Mostara TV"
```

### Error: "No meta file"

**Penyebab:** appinfo.json tidak ada di dist folder

**Solusi:**
```powershell
cd C:\Users\HARIS\Documents\LC\vod\apps\webos
npm run build:webos
```

### Aplikasi tidak bisa di-launch

**Coba ini:**
```powershell
# 1. Remove dulu
ares-remove com.mostara.webos tv

# 2. Install ulang
ares-install .\com.mostara.webos_1.0.0_ipk_all.ipk tv

# 3. Launch lagi
ares-launch com.mostara.webos tv
```

### Performance Issue di TV

**Solusi:**
- Reduce bundle size (code splitting)
- Optimize images
- Check for memory leaks in inspector

---

## Update Aplikasi (Hot Reload)

Setiap ada perubahan:

```powershell
# 1. Build ulang
cd C:\Users\HARIS\Documents\LC\vod\apps\webos
npm run build:webos

# 2. Install ulang (akan menimpa versi lama)
cd dist
ares-install .\com.mostara.webos_1.0.0_ipk_all.ipk tv

# 3. Launch
ares-launch com.mostara.webos tv
```

**Tips:**
- Increment version di `package.json` setiap ada perubahan signifikan
- Aplikasi versi baru akan menimpa versi lama otomatis

---

## Uninstall Aplikasi

```powershell
# Remove dari TV
ares-remove com.mostara.webos tv

# Atau dari TV:
# Settings → Apps → Mostara VOD → Delete
```

---

## Testing Checklist

Sebelum deploy ke production, pastikan:

- [ ] Navigasi dengan remote control berjalan smooth
- [ ] Login/Register berfungsi
- [ ] Video playback (HLS) berjalan
- [ ] Payment flow berfungsi (Midtrans)
- [ ] Profile page berfungsi
- [ ] Search/filter berfungsi
- [ ] UI responsive di TV screen
- [ ] Tidak ada error di console
- [ ] Performance acceptable (fast loading)

---

## Quick Reference Commands

```powershell
# Setup TV
ares-setup-device --deviceinfo developer@192.168.1.100:9992 --device tv --info "name:Mostara TV"

# Check devices
ares-device-info

# Build
npm run build:webos

# Install
ares-install .\com.mostara.webos_1.0.0_ipk_all.ipk tv

# Launch
ares-launch com.mostara.webos tv

# Inspect/Debug
ares-inspect com.mostara.webos tv

# Remove
ares-remove com.mostara.webos tv

# Log from TV
ares-log com.mostara.webos tv
```

---

## Next Steps

Setelah testing sukses:

1. **Optimize performance** - Reduce bundle size, lazy loading
2. **Fix bugs** - Semua error dari inspector
3. **Update version** - Increment di `package.json`
4. **Final testing** - Test semua fitur di berbagai kondisi
5. **Publish** - Upload ke LG Content Store

---

## Tips Penting

- **Testing di browser dulu** - Coba semua fitur di browser sebelum deploy ke TV
- **Gunakan WiFi yang sama** - Computer dan TV harus di network yang sama
- **Disable VPN** - VPN bisa memblokir koneksi ke TV
- **Catat password Developer Mode** - Jangan lupa password yang di-set
- **Backup package** - Simpan .ipk yang sudah jadi

---

## Support

- **WebOS Developer Site:** https://webostv.developer.lge.com
- **Forum:** https://webostv.developer.lge.com/develop/forum
- **Documentation:** https://webostv.developer.lge.com/develop/web-application

---

## Summary: Langkah Paling Cepat

```powershell
# 1. Enable Developer Mode di TV (dari TV Settings)
# 2. Catat IP TV

# 3. Setup computer ke TV
ares-setup-device --deviceinfo developer@192.168.1.100:9992 --device tv --info "name:Mostara TV"

# 4. Build
cd C:\Users\HARIS\Documents\LC\vod\apps\webos
npm run build:webos

# 5. Install ke TV
cd dist
ares-install .\com.mostara.webos_1.0.0_ipk_all.ipk tv

# 6. Launch di TV
ares-launch com.mostara.webos tv

# 7. Debug (opsional)
ares-inspect com.mostara.webos tv
```

Selesai! Aplikasi sudah berjalan di TV Anda. 🎉
