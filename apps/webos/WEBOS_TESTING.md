# Mostara WebOS - Testing Guide

## Prerequisites

1. **LG webOS TV SDK**
   - Download: https://webostv.developer.lge.com/sdk/sdk-download/
   - Install pada system Anda

2. **Node.js & npm** (already installed)

## Testing Methods

### Method 1: Browser Testing (Recommended for Development)

#### Setup

1. Install dependencies:
   ```bash
   cd apps/webos
   npm install
   ```

2. Start development server:
   ```bash
   npm run dev
   ```

3. Open browser at: `http://localhost:5173`

#### Remote Control Testing

Use the provided TV remote tester:
```bash
# Open in browser
open apps/webos/tv-remote-test.html
```

**Keyboard Controls:**
- `Arrow Keys` - Navigate
- `Enter` - Select item
- `Backspace` - Back
- `Escape` - Home
- `Space` - Play/Pause

---

### Method 2: WebOS Emulator Testing

#### Step 1: Prepare App

```bash
# Build for WebOS
npm run build:webos
```

#### Step 2: Setup Emulator

1. Open LG webOS TV IDE
2. Create/Start WebOS Emulator
3. Setup device:
   ```bash
   ares-setup-device --deviceinfo emulator --device emulator --icon emulator
   ```

#### Step 3: Package & Deploy

```bash
# Navigate to dist folder
cd apps/webos/dist

# Package into .ipk
ares-package .

# Install to emulator
ares-install com.mostara.webos_1.0.0_ipk_all.ipk emulator

# Launch app
ares-launch com.mostara.webos emulator
```

---

### Method 3: WebOS TV Real Device Testing

#### Step 1: Enable Developer Mode on TV

1. Go to TV Settings → All Settings → General
2. Turn on Developer Mode App
3. Open Developer Mode App
4. Set TV IP address

#### Step 2: Connect to TV

```bash
# Add TV as device
ares-setup-device --deviceinfo your-tv-ip --device mostara-tv --info "name:Mostara TV"

# Verify connection
ares-device-info
```

#### Step 3: Deploy to TV

```bash
# Build
npm run build:webos

# Package & Install
cd dist
ares-package .
ares-install com.mostara.webos_1.0.0_ipk_all.ipk mostara-tv

# Launch
ares-launch com.mostara.webos mostara-tv
```

---

## Debugging

### WebOS Console

```bash
# Open WebOS Inspector
ares-inspect com.mostara.webos mostara-tv
```

### Browser DevTools

- Open Chrome DevTools (F12)
- Check Console for errors
- Network tab for API calls

---

## Common Issues

### Issue: App won't install on emulator

**Solution:**
```bash
# Remove existing app first
ares-remove com.mostara.webos emulator

# Then reinstall
ares-install com.mostara.webos_1.0.0_ipk_all.ipk emulator
```

### Issue: Keyboard not working in browser

**Solution:**
- Ensure focus is on the app window
- Check `useKeyboardNavigation` hook is initialized

### Issue: API calls failing

**Solution:**
- Check CORS settings
- Verify API_BASE_URL in `src/utils/constants.ts`
- Check if API server is running

---

## Files Modified for WebOS

1. `appinfo.json` - WebOS app configuration
2. `manifest.json` - App manifest
3. `package.json` - Added `build:webos` script
4. `tv-remote-test.html` - Remote control simulator

---

## Next Steps

1. Test basic navigation with arrow keys
2. Test authentication flow
3. Test video playback
4. Test payment flow
5. Deploy to real WebOS TV for final testing
