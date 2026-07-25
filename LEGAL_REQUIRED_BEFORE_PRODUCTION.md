# SMASHSTREAM — Required Before Production

Naskah legal dan konfigurasi berikut belum boleh dianggap final sebelum dilengkapi dan ditinjau penasihat hukum Indonesia.

- [ ] Nama legal badan usaha.
- [ ] Alamat legal badan usaha.
- [ ] NIB/NPWP hanya jika diputuskan perlu ditampilkan.
- [ ] Batas usia pengguna dan mekanisme persetujuan orang tua/wali.
- [ ] Masa retensi per kategori data.
- [ ] Nilai production `ACCOUNT_DELETION_COOLING_OFF_DAYS` (development/test sementara: `7` hari).
- [ ] Persetujuan production untuk desain/worker di `ACCOUNT_DELETION_RETENTION_DESIGN.md`,
  termasuk jadwal, owner, retry `FAILED`, dan `ACCOUNT_DELETION_POLICY_VERSION`.
- [ ] Kebijakan penanganan coin dan rental aktif ketika akun dihapus.
- [ ] Jangka waktu/SLA dukungan, hanya jika sudah disetujui bisnis.
- [ ] Batas pengajuan dan waktu pemeriksaan refund, hanya jika disetujui.
- [ ] Mekanisme penyelesaian sengketa/yurisdiksi yang disetujui penasihat hukum.
- [ ] Daftar vendor aktual: payment gateway, CDN, storage, analytics, DRM, email, WhatsApp, social login, dan app store.
- [ ] Verifikasi klaim bahwa SMASHSTREAM tidak menyimpan nomor kartu lengkap.
- [ ] Data Deletion Callback Meta dan signature verification jika Facebook Login diaktifkan.
- [ ] CAPTCHA vendor dan server-side token verification jika risiko spam membutuhkan CAPTCHA eksternal.
- [ ] Kanal/notifikasi internal untuk ticket support baru.
- [ ] Malware scanning lampiran sebelum tim internal mengunduhnya.
- [ ] Jadwal review dan pemilik dokumen Terms/Privacy versi `2026-07-25`.
- [ ] Review aksesibilitas dan copy legal Bahasa Indonesia final.
- [ ] Rencana serta penerjemah untuk versi Bahasa Inggris.

## Konfigurasi yang harus tersedia

```env
ACCOUNT_DELETION_COOLING_OFF_DAYS=[ANGKA_YANG_DISETUJUI]
```

## Catatan implementasi

- Necessary cookies selalu aktif untuk autentikasi dan keamanan.
- Analytics, preferences, dan marketing default-nya tidak aktif sebelum consent.
- Consent Terms dan Privacy disimpan per user, versi dokumen, waktu, dan platform.
- Contact form memakai rate limit per IP, honeypot, minimum submit time, validasi server, whitelist MIME, dan batas lampiran 5 MB.
- Bearer token digunakan untuk endpoint account deletion, sehingga CSRF berbasis cookie tidak relevan pada alur saat ini. Evaluasi ulang jika autentikasi dipindahkan ke cookie.
