# Windows Firewall Setup untuk Metro Bundler

## Masalah
BlueStacks tidak bisa connect ke Metro Bundler karena Windows Firewall block port 8081.

## Solusi - Buka Port 8081 di Windows Firewall

### Cara 1: Via Windows Settings (MUDAH)

1. **Buka Windows Security**
   - Tekan `Windows + I` untuk buka Settings
   - Klik **Privacy & Security** → **Windows Security**
   - Klik **Firewall & network protection**

2. **Buka Advanced Settings**
   - Klik **Advanced settings**
   - Akan muncul "Windows Defender Firewall with Advanced Security"

3. **Buat Inbound Rule Baru**
   - Klik **Inbound Rules** di panel kiri
   - Klik **New Rule...** di panel kanan

4. **Konfigurasi Rule:**
   - **Rule Type:** Pilih **Port** → Next
   - **Protocol:** Pilih **TCP**
   - **Specific local ports:** Ketik **8081** → Next
   - **Action:** Pilih **Allow the connection** → Next
   - **Profile:** Centang semua (Domain, Private, Public) → Next
   - **Name:** Ketik **Metro Bundler Port 8081** → Finish

5. **Restart Metro Bundler**
   - Close terminal Metro yang lama
   - Jalankan ulang: `npm start -- --reset-cache --host 0.0.0.0`

---

### Cara 2: Via Command Prompt (CEPAT - PERLU ADMIN)

1. **Buka Command Prompt sebagai Administrator**
   - Tekan `Windows + X`
   - Pilih **Terminal (Admin)** atau **Command Prompt (Admin)**

2. **Jalankan perintah ini:**
   ```cmd
   netsh advfirewall firewall add rule name="Metro Bundler 8081" dir=in action=allow protocol=TCP localport=8081
   ```

3. **Verify rule dibuat:**
   ```cmd
   netsh advfirewall firewall show rule name="Metro Bundler 8081"
   ```

---

### Cara 3: Nonaktifkan Firewall Sementara (TESTING ONLY)

**⚠️ HANYA UNTUK TESTING - JANGAN LAKUKAN INI PERMANEN!**

1. Buka Windows Security → Firewall & network protection
2. Klik network profile yang aktif (Private network/Public network)
3. Toggle **OFF** Microsoft Defender Firewall
4. Test aplikasi
5. **PENTING:** Toggle **ON** lagi setelah testing!

---

## Verifikasi

Setelah setup firewall, test dengan:

```bash
# Di PC, cek Metro running:
netstat -ano | findstr :8081

# Di BlueStacks, test koneksi:
adb shell "ping -c 2 192.168.18.30"
```

## Setelah Firewall Fix

1. Buka aplikasi di BlueStacks
2. Tekan `Ctrl+M` untuk Dev Menu
3. Settings → Debug server host & port
4. Masukkan: `192.168.18.30:8081`
5. OK → Kembali ke Dev Menu → Reload

Aplikasi seharusnya sudah connect ke Metro!
