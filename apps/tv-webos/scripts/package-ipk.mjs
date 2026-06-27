/**
 * IPK Packaging Script for LG webOS TV
 *
 * Builds the Vite project, then packages the output + appinfo.json + icons
 * into a webOS .ipk file using `ares-package`.
 *
 * Usage:
 *   npm run package
 *
 * Output:
 *   dist/ipk/com.mostara.vod.tv_1.0.0_all.ipk
 */
import { existsSync, mkdirSync, copyFileSync, readdirSync, rmSync, readFileSync, writeFileSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

const PKG_DIR = join(root, 'package');
const IPK_DIR = join(root, 'dist', 'ipk');
const BUILD_DIR = join(root, 'dist', 'web');

console.log('📦 Packaging webOS TV App...\n');

// Step 1: Build Vite project
console.log('1️⃣  Building Vite project...');
execSync('npm run build', { cwd: root, stdio: 'inherit' });

// Step 2: Clean previous package directory
console.log('\n2️⃣  Preparing package directory...');
rmSync(PKG_DIR, { recursive: true, force: true });
mkdirSync(PKG_DIR, { recursive: true });

// Step 3: Copy build output
console.log('3️⃣  Copying build output...');
copyRecursive(BUILD_DIR, join(PKG_DIR));

// Vite emits module script tags by default. The TV package is built as an
// IIFE bundle for older webOS TVs, so use a classic deferred script tag.
const indexHtmlPath = join(PKG_DIR, 'index.html');
if (existsSync(indexHtmlPath)) {
  const html = readFileSync(indexHtmlPath, 'utf8')
    .replace(/<script type="module" crossorigin src=/g, '<script defer src=');
  writeFileSync(indexHtmlPath, html);
}

// Step 4: Copy appinfo.json
console.log('4️⃣  Copying appinfo.json...');
copyFileSync(join(root, 'appinfo.json'), join(PKG_DIR, 'appinfo.json'));

// Step 5: Copy icons
console.log('5️⃣  Copying icons...');
['icon.png', 'largeIcon.png', 'splash.png'].forEach((file) => {
  const src = join(root, file);
  if (existsSync(src)) {
    copyFileSync(src, join(PKG_DIR, file));
    console.log(`   ✓ ${file}`);
  } else {
    console.warn(`   ⚠ ${file} not found - generating placeholder`);
  }
});

// Step 6: Package with ares-package
console.log('\n6️⃣  Creating IPK with ares-package...');
mkdirSync(IPK_DIR, { recursive: true });

try {
  execSync(
    `ares-package -o "${IPK_DIR}" "${PKG_DIR}"`,
    { cwd: root, stdio: 'inherit' }
  );
  console.log('\n✅ Packaging complete!\n');

  // List output
  const ipkFiles = readdirSync(IPK_DIR).filter((f) => f.endsWith('.ipk'));
  if (ipkFiles.length > 0) {
    console.log('📦 IPK files:');
    ipkFiles.forEach((f) => console.log(`   ${join(IPK_DIR, f)}`));
    console.log('\n🚀 To install on emulator:');
    console.log(`   ares-install -d emulator "${join(IPK_DIR, ipkFiles[ipkFiles.length - 1])}"`);
    console.log('\n🚀 To install on real TV:');
    console.log(`   ares-install -d <tv-name> "${join(IPK_DIR, ipkFiles[ipkFiles.length - 1])}"`);
  }
} catch (e) {
  console.error('\n❌ ares-package failed:', e.message);
  console.error('\nMake sure ares-cli is installed:');
  console.error('   npm install -g @webos-tools/cli');
  process.exit(1);
}

// Helper: recursive copy
function copyRecursive(src, dest) {
  if (!existsSync(src)) return;
  const entries = readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const s = join(src, entry.name);
    const d = join(dest, entry.name);
    if (entry.isDirectory()) {
      mkdirSync(d, { recursive: true });
      copyRecursive(s, d);
    } else {
      copyFileSync(s, d);
    }
  }
}
