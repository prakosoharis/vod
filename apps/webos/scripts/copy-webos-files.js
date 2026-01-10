const fs = require('fs');
const path = require('path');

const sourceDir = path.join(__dirname, '..');
const destDir = path.join(sourceDir, 'dist');

// Files to copy
const filesToCopy = [
  'appinfo.json',
  'manifest.json'
];

console.log('Copying WebOS config files to dist...');

filesToCopy.forEach(file => {
  const sourcePath = path.join(sourceDir, file);
  const destPath = path.join(destDir, file);

  if (fs.existsSync(sourcePath)) {
    fs.copyFileSync(sourcePath, destPath);
    console.log(`✓ Copied ${file}`);
  } else {
    console.error(`✗ Source file not found: ${file}`);
    process.exit(1);
  }
});

console.log('\nAll files copied successfully!');
