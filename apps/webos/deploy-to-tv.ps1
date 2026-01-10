# TV Deployment Helper Script

Write-Host "=== Mostara VOD - TV Deployment Helper ===" -ForegroundColor Cyan
Write-Host ""

# Get TV IP
Write-Host "1. Masukkan IP Address TV Anda:" -ForegroundColor Yellow
$tvIp = Read-Host "   Contoh: 192.168.1.100"

Write-Host ""

# Validate IP
if ($tvIp -match "^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$") {
    Write-Host "✓ IP address valid: $tvIp" -ForegroundColor Green
} else {
    Write-Host "✗ IP address tidak valid!" -ForegroundColor Red
    Write-Host "   Format: 192.168.1.100" -ForegroundColor Gray
    exit 1
}

Write-Host ""

# Step 1: Check connection
Write-Host "2. Testing connection to TV..." -ForegroundColor Yellow
$pingResult = Test-Connection -ComputerName $tvIp -Count 2 -Quiet
if ($pingResult) {
    Write-Host "✓ TV terhubung!" -ForegroundColor Green
} else {
    Write-Host "✗ TV tidak terhubung!" -ForegroundColor Red
    Write-Host "   Pastikan:" -ForegroundColor Yellow
    Write-Host "   - TV sudah nyala" -ForegroundColor Gray
    Write-Host "   - Developer Mode sudah di-enable di TV" -ForegroundColor Gray
    Write-Host "   - Computer dan TV di network yang sama" -ForegroundColor Gray
    Write-Host "   - IP address benar" -ForegroundColor Gray
    Write-Host ""
    Write-Host "   Untuk enable Developer Mode:" -ForegroundColor Cyan
    Write-Host "   TV Settings → All Settings → General → Developer Mode" -ForegroundColor Gray
    exit 1
}

Write-Host ""

# Step 2: Setup device
Write-Host "3. Setup TV device..." -ForegroundColor Yellow
$deviceInfo = "developer@$tvIp:9992"
Write-Host "   Device info: $deviceInfo" -ForegroundColor Gray

try {
    ares-setup-device --remove tv 2>$null
    $setupResult = ares-setup-device --deviceinfo $deviceInfo --device tv --info "name:Mostara TV"
    Write-Host "✓ Device setup successful!" -ForegroundColor Green
} catch {
    Write-Host "✗ Device setup failed!" -ForegroundColor Red
    Write-Host "   Error: $_" -ForegroundColor Gray
    exit 1
}

Write-Host ""

# Step 3: Verify devices
Write-Host "4. Verify available devices..." -ForegroundColor Yellow
ares-device-info

Write-Host ""

# Step 4: Build app
Write-Host "5. Building application..." -ForegroundColor Yellow
$projectDir = "C:\Users\HARIS\Documents\LC\vod\apps\webos"
Set-Location $projectDir

try {
    $buildResult = npm run build:webos 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Build successful!" -ForegroundColor Green
    } else {
        Write-Host "✗ Build failed!" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "✗ Build error!" -ForegroundColor Red
    Write-Host "   Error: $_" -ForegroundColor Gray
    exit 1
}

Write-Host ""

# Step 5: Install app
Write-Host "6. Installing app to TV..." -ForegroundColor Yellow
$distDir = Join-Path $projectDir "dist"
$packageFile = Join-Path $distDir "com.mostara.webos_1.0.0_ipk_all.ipk"

if (Test-Path $packageFile) {
    Set-Location $distDir
    try {
        $installResult = ares-install (Split-Path $packageFile -Leaf) tv 2>&1
        Write-Host "✓ Install successful!" -ForegroundColor Green
    } catch {
        Write-Host "✗ Install failed!" -ForegroundColor Red
        Write-Host "   Error: $_" -ForegroundColor Gray
        exit 1
    }
} else {
    Write-Host "✗ Package file not found!" -ForegroundColor Red
    Write-Host "   Expected: $packageFile" -ForegroundColor Gray
    exit 1
}

Write-Host ""

# Step 6: Launch app
Write-Host "7. Launching app on TV..." -ForegroundColor Yellow
try {
    $launchResult = ares-launch com.mostara.webos tv 2>&1
    Write-Host "✓ App launched!" -ForegroundColor Green
} catch {
    Write-Host "✗ Launch failed!" -ForegroundColor Red
    Write-Host "   Error: $_" -ForegroundColor Gray
    Write-Host "   Coba manual: ares-launch com.mostara.webos tv" -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# Success!
Write-Host "====================================" -ForegroundColor Green
Write-Host "🎉 Deployment Berhasil!" -ForegroundColor Green
Write-Host "====================================" -ForegroundColor Green
Write-Host ""
Write-Host "Aplikasi sekarang berjalan di TV Anda!" -ForegroundColor White
Write-Host ""
Write-Host "Commands untuk debugging:" -ForegroundColor Yellow
Write-Host "  ares-inspect com.mostara.webos tv    # Buka Chrome DevTools" -ForegroundColor Cyan
Write-Host "  ares-remove com.mostara.webos tv       # Uninstall dari TV" -ForegroundColor Cyan
Write-Host "  ares-log com.mostara.webos tv         # Lihat logs" -ForegroundColor Cyan
Write-Host ""

# Optional: Open inspector
$openInspector = Read-Host "Buka inspector untuk debugging? (y/n)"
if ($openInspector -eq 'y' -or $openInspector -eq 'Y') {
    Write-Host ""
    Write-Host "Membuka inspector..." -ForegroundColor Yellow
    ares-inspect com.mostara.webos tv
}

Write-Host ""
Write-Host "Done!" -ForegroundColor Green
