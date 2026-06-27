#!/bin/bash
# Generate icon assets for webOS TV app
set -e

cd "$(dirname "$0")/.."

echo "🎨 Generating webOS TV icon assets..."

# --- icon.png (80x80) - Small app icon ---
cat > /tmp/icon.svg << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 80 80">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#DF976F"/>
      <stop offset="100%" style="stop-color:#9E643C"/>
    </linearGradient>
  </defs>
  <rect width="80" height="80" rx="16" fill="url(#bg)"/>
  <text x="40" y="56" font-family="-apple-system, sans-serif" font-size="48" font-weight="800" fill="#fff" text-anchor="middle">M</text>
</svg>
EOF
magick -background none -density 300 /tmp/icon.svg -resize 80x80 icon.png
echo "  ✓ icon.png (80x80)"

# --- largeIcon.png (520x400) - Large app icon ---
cat > /tmp/largeIcon.svg << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="520" height="400" viewBox="0 0 520 400">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#DF976F"/>
      <stop offset="100%" style="stop-color:#572D0F"/>
    </linearGradient>
    <radialGradient id="glow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" style="stop-color:#F4EDE3;stop-opacity:0.2"/>
      <stop offset="100%" style="stop-color:#F4EDE3;stop-opacity:0"/>
    </radialGradient>
  </defs>
  <rect width="520" height="400" fill="url(#bg)"/>
  <circle cx="260" cy="200" r="180" fill="url(#glow)"/>
  <text x="260" y="220" font-family="-apple-system, sans-serif" font-size="180" font-weight="800" fill="#fff" text-anchor="middle" letter-spacing="-8">M</text>
  <text x="260" y="320" font-family="-apple-system, sans-serif" font-size="36" font-weight="700" fill="#fff" text-anchor="middle" opacity="0.9">MOSTARA VOD</text>
</svg>
EOF
magick -background none -density 300 /tmp/largeIcon.svg -resize 520x400 largeIcon.png
echo "  ✓ largeIcon.png (520x400)"

# --- splash.png (1920x1080) - Splash background ---
cat > /tmp/splash.svg << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1920" height="1080" viewBox="0 0 1920 1080">
  <defs>
    <radialGradient id="bgGlow" cx="50%" cy="50%" r="70%">
      <stop offset="0%" style="stop-color:#914B19;stop-opacity:0.4"/>
      <stop offset="100%" style="stop-color:#1A1614;stop-opacity:1"/>
    </radialGradient>
    <linearGradient id="logoBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#DF976F"/>
      <stop offset="100%" style="stop-color:#9E643C"/>
    </linearGradient>
  </defs>
  <rect width="1920" height="1080" fill="#1A1614"/>
  <rect width="1920" height="1080" fill="url(#bgGlow)"/>
  <g transform="translate(960, 540)">
    <rect x="-120" y="-120" width="240" height="240" rx="40" fill="url(#logoBg)"/>
    <text x="0" y="40" font-family="-apple-system, sans-serif" font-size="180" font-weight="800" fill="#fff" text-anchor="middle">M</text>
    <text x="0" y="220" font-family="-apple-system, sans-serif" font-size="56" font-weight="700" fill="#F4EDE3" text-anchor="middle">MOSTARA VOD</text>
    <text x="0" y="280" font-family="-apple-system, sans-serif" font-size="28" font-weight="400" fill="#8B7E74" text-anchor="middle">Streaming, Film &amp; Live Event</text>
  </g>
</svg>
EOF
magick -background none -density 300 /tmp/splash.svg -resize 1920x1080 splash.png
echo "  ✓ splash.png (1920x1080)"

# Also copy icon.png to public/ for favicon (dev mode)
if [ -d "public" ]; then
  cp icon.png public/icon.png
  cp splash.png public/splash.png
  echo "  ✓ Copied to public/ for dev mode"
fi

echo ""
echo "✅ All assets generated successfully"
