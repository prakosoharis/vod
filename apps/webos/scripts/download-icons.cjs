const fs = require('fs');
const path = require('path');
const https = require('https');

const destDir = path.join(__dirname, '..');

// Download and convert logo to icon
function downloadImage(url, filename) {
  https.get(url, (res) => {
    const file = fs.createWriteStream(path.join(destDir, filename));
    res.pipe(file);
    file.on('finish', () => {
      file.close();
      console.log(`✓ Downloaded ${filename}`);
    });
  }).on('error', (err) => {
    console.error(`✗ Error downloading ${filename}:`, err.message);
  });
}

// Note: This will download the logo, but you might need to resize it
// to proper dimensions (icon.png: 80x80, largeIcon.png: 130x130, bgImage.png: 1920x1080)
console.log('Downloading logo files...');
console.log('Note: You will need to resize these files to proper dimensions');
console.log('icon.png: 80x80, largeIcon.png: 130x130, bgImage.png: 1920x1080');

downloadImage('https://api.mostara.id/api/uploads/logos/logo1.jpg', 'icon.png');
downloadImage('https://api.mostara.id/api/uploads/logos/logo1.jpg', 'largeIcon.png');
downloadImage('https://api.mostara.id/api/uploads/logos/logo1.jpg', 'bgImage.png');

console.log('\nAfter downloading, use an image editor to resize:');
console.log('- icon.png to 80x80 pixels');
console.log('- largeIcon.png to 130x130 pixels');
console.log('- bgImage.png to 1920x1080 pixels');
