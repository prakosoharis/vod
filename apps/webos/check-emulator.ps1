# WebOS Emulator Helper Script

Write-Host "=== WebOS Emulator Setup Helper ===" -ForegroundColor Cyan
Write-Host ""

# Check if ares commands are available
Write-Host "1. Checking ares CLI tools..." -ForegroundColor Yellow
try {
    $aresVersion = ares-device-info 2>&1
    Write-Host "✓ ares CLI is installed" -ForegroundColor Green
} catch {
    Write-Host "✗ ares CLI not found in PATH" -ForegroundColor Red
    Write-Host "Please add LG webOS TV SDK to your PATH" -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# List all available devices
Write-Host "2. Available devices:" -ForegroundColor Yellow
ares-device-info

Write-Host ""

# Check for emulator processes
Write-Host "3. Checking for WebOS Emulator processes..." -ForegroundColor Yellow
$emulatorProcesses = Get-Process | Where-Object { $_.ProcessName -like "*emulator*" -or $_.ProcessName -like "*webos*" }
if ($emulatorProcesses) {
    Write-Host "✓ Found emulator process:" -ForegroundColor Green
    $emulatorProcesses | Format-Table Id, ProcessName, Path -AutoSize
} else {
    Write-Host "✗ No emulator process running" -ForegroundColor Red
    Write-Host "Please start the WebOS TV Emulator from LG webOS TV IDE" -ForegroundColor Yellow
}

Write-Host ""

# Check common ports
Write-Host "4. Checking common emulator ports..." -ForegroundColor Yellow
$ports = @(6622, 9998, 9999)
$netstatResult = netstat -ano | Select-String "LISTENING"
foreach ($port in $ports) {
    $portInfo = $netstatResult | Select-String ":$port "
    if ($portInfo) {
        $portInfo = $portInfo.ToString().Trim()
        Write-Host "✓ Port $port is in use" -ForegroundColor Green
        Write-Host "  $portInfo" -ForegroundColor Gray
    } else {
        Write-Host "✗ Port $port is not in use" -ForegroundColor Red
    }
}

Write-Host ""

# Instructions for starting emulator
Write-Host "5. How to start WebOS Emulator:" -ForegroundColor Yellow
Write-Host "   Option 1: From LG webOS TV IDE" -ForegroundColor White
Write-Host "     - Open 'LG webOS TV IDE'" -ForegroundColor Gray
Write-Host "     - Go to 'TV Emulator' menu" -ForegroundColor Gray
Write-Host "     - Click 'Open Emulator' or 'Create Emulator'" -ForegroundColor Gray
Write-Host ""
Write-Host "   Option 2: Direct executable (if installed)" -ForegroundColor White
Write-Host "     - Common paths:" -ForegroundColor Gray
Write-Host "       * C:\Program Files\LG\LG webOS TV SDK\Tools\TV Emulator\" -ForegroundColor Gray
Write-Host "       * C:\Program Files (x86)\LG\LG webOS TV SDK\Tools\TV Emulator\" -ForegroundColor Gray
Write-Host ""

# Option to setup device
Write-Host "6. Device Setup Commands:" -ForegroundColor Yellow
Write-Host "   After emulator is running, execute:" -ForegroundColor White
Write-Host "   ares-setup-device --deviceinfo emulator --device emulator --icon emulator" -ForegroundColor Cyan
Write-Host ""

# Option to install
Write-Host "7. Install and Launch Commands:" -ForegroundColor Yellow
Write-Host "   ares-install .\com.mostara.webos_1.0.0_ipk_all.ipk emulator" -ForegroundColor Cyan
Write-Host "   ares-launch com.mostara.webos emulator" -ForegroundColor Cyan
Write-Host ""

# Alternative: Browser testing
Write-Host "8. Alternative: Browser Testing (No emulator needed!)" -ForegroundColor Yellow
Write-Host "   Run: npm run dev" -ForegroundColor Cyan
Write-Host "   Open: http://localhost:5173" -ForegroundColor Cyan
Write-Host "   Use keyboard for navigation (Arrow keys, Enter, Backspace)" -ForegroundColor Gray
Write-Host ""

Write-Host "====================================" -ForegroundColor Cyan
