#!/bin/bash

echo "========================================"
echo "HLS Transcoder - Quick Start"
echo "========================================"
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "[INFO] Creating .env from template..."
    cp .env.example .env
    echo "[OK] .env created"
    echo ""
fi

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "[ERROR] Docker is not running!"
    echo "Please start Docker and try again."
    exit 1
fi

echo "[INFO] Starting Docker containers..."
echo ""

# Start services
docker-compose up -d

if [ $? -eq 0 ]; then
    echo ""
    echo "========================================"
    echo "SUCCESS! Services are starting..."
    echo "========================================"
    echo ""
    echo "Please wait 30 seconds for all services to be ready."
    echo ""
    echo "Access URLs:"
    echo "  Frontend:      http://localhost:8080"
    echo "  Backend API:   http://localhost:5000"
    echo "  MinIO Console: http://localhost:9001"
    echo ""
    echo "Default MinIO Credentials:"
    echo "  Username: admin"
    echo "  Password: password123"
    echo ""
    echo "========================================"
    echo ""

    # Wait and show logs
    sleep 5
    echo "[INFO] Showing logs... (Press Ctrl+C to exit)"
    docker-compose logs -f
else
    echo ""
    echo "[ERROR] Failed to start services!"
    echo "Run 'docker-compose logs' to see errors."
    exit 1
fi
