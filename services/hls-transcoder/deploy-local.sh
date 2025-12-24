#!/bin/bash

# ================================================================
# HLS Transcoder - Local Development Deployment Script
# ================================================================
# This script deploys the HLS transcoder for local development
# ================================================================

set -e  # Exit on error

echo "=========================================="
echo "HLS Transcoder - Local Deployment"
echo "=========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Error: Docker is not running"
    exit 1
fi

# Check if docker-compose is available
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Error: docker-compose is not installed"
    exit 1
fi

echo "✓ Docker is running"
echo ""

# Check if .env exists, if not copy from example
if [ ! -f .env ]; then
    echo "${YELLOW}⚠ .env file not found. Creating from .env.example...${NC}"
    if [ -f .env.example ]; then
        cp .env.example .env
        echo "✓ .env created. Please review and update if needed."
    else
        echo "❌ Error: .env.example not found"
        exit 1
    fi
    echo ""
fi

# Stop existing containers
echo "Stopping existing containers (if any)..."
docker-compose -f docker-compose.local.yml down 2>/dev/null || true
echo "✓ Containers stopped"
echo ""

# Build and start containers
echo "Building and starting containers..."
docker-compose -f docker-compose.local.yml up -d --build

echo ""
echo "${GREEN}=========================================="
echo "✓ Deployment successful!"
echo "==========================================${NC}"
echo ""
echo "Services are now running:"
echo "  Frontend:      http://localhost:8089"
echo "  API:           http://localhost:8089/api/"
echo "  Backend:       http://localhost:5000"
echo "  Video Stream:  http://localhost:8089/videos/"
echo "  MinIO Console: http://localhost:9001"
echo "  MinIO API:     http://localhost:9000"
echo ""
echo "MinIO Credentials (default):"
echo "  Username: admin"
echo "  Password: password123"
echo ""
echo "Useful commands:"
echo "  View logs:     docker-compose -f docker-compose.local.yml logs -f"
echo "  Stop:          docker-compose -f docker-compose.local.yml down"
echo "  Restart:       docker-compose -f docker-compose.local.yml restart"
echo ""
