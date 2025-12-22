@echo off
echo ========================================
echo HLS Transcoder - Quick Start
echo ========================================
echo.

REM Check if .env exists
if not exist .env (
    echo [INFO] Creating .env from template...
    copy .env.example .env
    echo [OK] .env created
    echo.
)

REM Check if Docker is running
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Docker is not running!
    echo Please start Docker Desktop and try again.
    pause
    exit /b 1
)

echo [INFO] Starting Docker containers...
echo.

REM Start services
docker-compose up -d

if %errorlevel% equ 0 (
    echo.
    echo ========================================
    echo SUCCESS! Services are starting...
    echo ========================================
    echo.
    echo Please wait 30 seconds for all services to be ready.
    echo.
    echo Access URLs:
    echo   Frontend:      http://localhost:8080
    echo   Backend API:   http://localhost:5000
    echo   MinIO Console: http://localhost:9001
    echo.
    echo Default MinIO Credentials:
    echo   Username: admin
    echo   Password: password123
    echo.
    echo ========================================
    echo.

    REM Wait and show logs
    timeout /t 5 /nobreak >nul
    echo [INFO] Showing logs... (Press Ctrl+C to exit)
    docker-compose logs -f
) else (
    echo.
    echo [ERROR] Failed to start services!
    echo Run 'docker-compose logs' to see errors.
    pause
)
