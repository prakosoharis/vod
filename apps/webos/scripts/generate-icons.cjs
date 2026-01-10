const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

const outputDir = path.join(__dirname, '..');

function createIcon(width, height, filename, text, fontSize, bgColor, textColor) {
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // Background
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, width, height);

  // Text
  ctx.fillStyle = textColor;
  ctx.font = `bold ${fontSize}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, width / 2, height / 2);

  // Save to file
  const buffer = canvas.toBuffer('image/png');
  const outputPath = path.join(outputDir, filename);
  fs.writeFileSync(outputPath, buffer);
  console.log(`✓ Created ${filename} (${width}x${height})`);
}

console.log('Creating WebOS icons...\n');

// Colors
const primaryColor = '#914B19'; // Deep espresso brown
const creamColor = '#F4EDE3'; // Cream
const bgColor = '#1A1614'; // Warm charcoal

// Create icons
createIcon(80, 80, 'icon.png', 'M', 48, primaryColor, creamColor);
createIcon(130, 130, 'largeIcon.png', 'M', 80, primaryColor, creamColor);

// Background image with full name
const bgCanvas = createCanvas(1920, 1080);
const bgCtx = bgCanvas.getContext('2d');
bgCtx.fillStyle = bgColor;
bgCtx.fillRect(0, 0, 1920, 1080);
bgCtx.fillStyle = primaryColor;
bgCtx.font = 'bold 200px Arial';
bgCtx.textAlign = 'center';
bgCtx.textBaseline = 'middle';
bgCtx.fillText('MOSTARA', 960, 540);

const bgBuffer = bgCanvas.toBuffer('image/png');
const bgOutputPath = path.join(outputDir, 'bgImage.png');
fs.writeFileSync(bgOutputPath, bgBuffer);
console.log(`✓ Created bgImage.png (1920x1080)`);

console.log('\n✅ All icons created successfully!');
console.log('Location: C:\\Users\\HARIS\\Documents\\LC\\vod\\apps\\webos\\');
