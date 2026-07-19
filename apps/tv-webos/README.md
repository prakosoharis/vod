# SMASH VOD - LG webOS TV App

Aplikasi streaming VOD (Video On Demand) dan Live Event untuk **LG webOS TV** (model 2020+, webOS 5.0+).

Dibangun dengan **React + Vite + TypeScript**, menggunakan **hls.js** untuk video streaming dan **spatial navigation** custom untuk remote control.

## Fitur Utama

- **Login & Auth** — JWT-based, sama dengan aplikasi mobile
- **Home Screen** — Hero featured + carousel content (Netflix-style)
- **Browse** — Pencarian & filter berdasarkan kategori
- **Live Streaming** — Broadcast live dengan viewer count & chat
- **Video Player** — HLS streaming, quality selection, playback speed, watch progress sync
- **Subscription Gate** — User belum bayar → scan QR code untuk berlangganan via HP/web (auto-detect ketika pembayaran berhasil)
- **D-pad Navigation** — Full navigasi via remote control TV

## Perbedaan dari Mobile App

| Mobile (Android) | TV (webOS) |
|---|---|
| Tab bar bawah | Sidebar kiri |
| Tap navigation | D-pad (arrow keys) |
| Midtrans payment | QR code → bayar via HP/web |
| AsyncStorage | localStorage |
| react-native-video | hls.js + HTML5 video |
| React Navigation | React Router |

## Quick Start

### 1. Install Dependencies

```bash
cd apps/tv-webos
npm install
```

### 2. Jalankan Dev Server

```bash
npm run dev
```

Server berjalan di `http://localhost:5173` (atau IP local network).

#### Test di Browser (sebagai simulasi remote TV)
1. Buka Chrome/Edge
2. Resize window ke **1920x1080** (FHD) untuk simulasi resolusi TV
3. Gunakan tombol panah keyboard + Enter untuk simulasi remote TV
4. Backspace = tombol Back

#### Test di LG webOS Simulator
1. Download **webOS TV Simulator** dari [webostv.developer.lge.com](https://webostv.developer.lge.com/develop/getting-started/developer-mode)
2. Jalankan Simulator app
3. Set URL tujuan ke dev server: `http://<IP-MAC-ANDA>:5173`

### 3. Build Production

```bash
npm run build
```

Output ada di `dist/web/`.

### 4. Package sebagai IPK (untuk install ke TV)

```bash
npm run package
```

Output: `dist/ipk/com.mostara.vod.tv_1.0.0_all.ipk`

### 5. Install ke webOS Simulator

```bash
# Otomatis (jika emulator sudah ada di ares-setup-device)
npm run deploy-simulator

# Manual
ares-install -d emulator dist/ipk/com.mostara.vod.tv_1.0.0_all.ipk
ares-launch -d emulator com.mostara.vod.tv
```

### 6. Install ke TV Langsung

#### Setup Sekali (Developer Mode)
1. Di TV LG, buka **LG Content Store**
2. Search & install app **"Developer Mode"**
3. Login dengan akun LG Developer (daftar di [developer.lge.com](https://developer.lge.com))
4. Dapatkan **passphrase** dari app

#### Pairing Mac dengan TV
```bash
# Tambah device profile
ares-setup-device -a mytv
# (masukkan IP TV di jaringan lokal, port 9923)

# Dapatkan device key (masukkan passphrase dari app)
ares-novacom --get-key mytv
```

#### Install & Launch
```bash
ares-install -d mytv dist/ipk/com.mostara.vod.tv_1.0.0_all.ipk
ares-launch -d mytv com.mostara.vod.tv
```

#### Debug di TV
```bash
ares-inspect -d mytv com.mostara.vod.tv
# Membuka Chrome DevTools untuk inspect app di TV
```

## Architecture

```
src/
├── components/        # Reusable UI
│   ├── Focusable.tsx              # Wrapper untuk D-pad focus
│   ├── Button.tsx                 # TV button
│   ├── ContentCard.tsx            # Poster card
│   ├── ContentRow.tsx             # Horizontal carousel
│   ├── Sidebar.tsx                # Left nav menu
│   ├── icons.tsx                  # SVG icon library
│   ├── LoadingSpinner.tsx
│   ├── QRCodeDisplay.tsx          # QR generator
│   ├── SubscriptionGate.tsx       # Paywall (replaces Midtrans)
│   ├── video/
│   │   └── TVVideoPlayer.tsx      # hls.js player + D-pad controls
│   └── live/
│       └── LiveChat.tsx
├── screens/           # Page-level components
│   ├── auth/LoginScreen.tsx
│   ├── home/HomeScreen.tsx
│   ├── browse/BrowseScreen.tsx
│   ├── live/LiveScreen.tsx
│   ├── live/LiveStreamScreen.tsx
│   ├── profile/ProfileScreen.tsx
│   ├── content/ContentDetailScreen.tsx
│   ├── player/VideoPlayerScreen.tsx
│   └── subscription/PaygateScreen.tsx
├── navigation/
│   └── AppNavigator.tsx           # Top-level routing
├── services/          # API services (copied from mobile)
│   ├── api.ts                     # Axios + interceptors
│   ├── auth.service.ts
│   ├── content.service.ts
│   ├── user.service.ts
│   ├── broadcast.service.ts
│   └── live.service.ts
├── store/             # Zustand state
│   ├── authStore.ts
│   └── subscriptionStore.ts
├── lib/               # Utilities
│   ├── storage.ts                 # localStorage adapter (replaces AsyncStorage)
│   └── spatialNavigation.ts       # D-pad focus system
├── constants/         # Theme + config
├── types/             # TypeScript types
├── providers/         # React Query provider
├── App.tsx
├── main.tsx
└── index.css
```

## Spatial Navigation (Remote Control)

Aplikasi menggunakan sistem spatial navigation custom:

- Setiap elemen interaktif dibungkus `<Focusable focusKey="...">`
- Arrow keys → navigasi ke elemen terdekat di arah tersebut
- Enter (OK) → trigger `onEnter` callback
- Backspace / keycode 409 → back navigation
- Fokus elemen di-scale 1.05x + glow effect

Lihat: `src/lib/spatialNavigation.ts`

## Video Player Controls

| Remote / Keyboard | Aksi |
|---|---|
| OK / Enter / Space | Play / Pause |
| ←  → | Seek -10s / +10s |
| Shift + ← / → | Seek -30s / +30s |
| ↑ / ↓ | Volume up / down |
| Backspace / Back (409) | Keluar player |
| Settings (quality) | Pilih kualitas (Auto/1080p/720p/480p/360p) |
| Speed | Pilih kecepatan (0.5x - 2x) |

## Konfigurasi Environment

Edit `src/constants/index.ts`:
- `API_BASE_URL` — URL backend API
- `SOCKET_URL` — URL WebSocket untuk live chat
- `WEB_APP_URL` — URL untuk QR code subscribe
- `SUBSCRIPTION_POLL_INTERVAL` — Interval polling status subscription

## Subscription Gate (Pengganti Midtrans)

Karena TV tidak punya kemampuan input kartu kredit via remote dengan baik, flow pembayaran dihilangkan dari TV app. Sebagai gantinya:

1. Saat user mau nonton konten, app cek status subscription
2. Jika belum aktif → tampilkan halaman Subscription Gate
3. User scan QR code dengan HP → buka halaman subscribe di `smashstream.id`
4. App auto-poll status subscription setiap 30 detik
5. Begitu status jadi `active` → otomatis lanjut ke player

Backend endpoint yang dipakai: `GET /user/subscription`

Response yang diharapkan:
```json
{
  "status": "active" | "expired" | "none" | "trial",
  "plan": "...",
  "expires_at": "2024-12-31T23:59:59Z"
}
```

## Target webOS Compatibility

- **Minimum**: webOS 5.0 (LG TV 2020)
- **Recommended**: webOS 6.0+ (LG TV 2021+)
- **Resolution**: 1920×1080 (FHD) — auto-scaled di 4K
- **Browser engine**: Chromium-based (webOS webkit)

## Troubleshooting

### `ares-package` error: "rimraf is not a function"

Bug compatibility Node 22 dengan ares-cli 3.x. Fix (sudah di-applied otomatis saat `npm install` di root):

```bash
# Patch manual jika perlu:
# Edit file:
# /Users/<user>/.nvm/versions/node/<version>/lib/node_modules/@webos-tools/cli/lib/package.js
# Ganti: rimraf = require('rimraf'),
# Dengan: rimraf = function(target, cb) { require('fs').rm(target, { recursive: true, force: true }, cb); },
```

### TV tidak terdeteksi di `ares-setup-device -l`

1. Pastikan Mac & TV di **subnet WiFi yang sama** (bukan guest network)
2. Pastikan firewall macOS tidak block port 9923
3. Coba matikan lalu nyalakan lagi app Developer Mode di TV

### Video tidak muncul / CORS error

1. Pastikan backend `api.smashstream.id` mengizinkan CORS origin:
   - `null` (untuk `file://` origin dari webOS)
   - Domain web TV app
2. Pastikan HLS URL mengembalikan `Access-Control-Allow-Origin: *`

### App crash / blank di TV

1. Cek log TV: `ares-log -d mytv com.mostara.vod.tv`
2. Cek inspector: `ares-inspect -d mytv com.mostara.vod.tv`
3. Pastikan semua polyfill dimuat (TV Chromium lama tidak support ES2022+)

## Build & Deploy Scripts

| Command | Fungsi |
|---|---|
| `npm run dev` | Dev server (HMR) di port 5173 |
| `npm run build` | Build production ke `dist/web/` |
| `npm run typecheck` | TypeScript check tanpa emit |
| `npm run package` | Build + package jadi `.ipk` |
| `npm run deploy-simulator` | Install + launch ke emulator |
| `npm run lint` | ESLint check |

## Roadmap (Post-MVP)

- [ ] QR Login (scan untuk login tanpa input password)
- [ ] Ambient mode (screensaver)
- [ ] Voice search (jika TV support)
- [ ] Multi-profile (jika dibutuhkan)
- [ ] Premium quality 4K HDR
- [ ] Subtitles / Closed Captions
- [ ] Picture-in-Picture
