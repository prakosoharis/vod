const fs = require('fs');
const path = require('path');

const sourceDir = path.join(__dirname, '..');
const destDir = path.join(sourceDir, 'dist');

// Files to copy
const filesToCopy = [
  'appinfo.json',
  'manifest.json',
  'icon.png',
  'largeIcon.png',
  'bgImage.png'
];

console.log('Copying WebOS config files to dist...');

filesToCopy.forEach(file => {
  const sourcePath = path.join(sourceDir, file);
  const destPath = path.join(destDir, file);

  if (fs.existsSync(sourcePath)) {
    fs.copyFileSync(sourcePath, destPath);
    console.log(`✓ Copied ${file}`);
  } else {
    console.warn(`⚠ Warning: ${file} not found (will need to add manually)`);
  }
});

console.log('\nCopy process complete!');
console.log('Make sure icon.png, largeIcon.png, and bgImage.png exist in the dist folder before packaging.');
