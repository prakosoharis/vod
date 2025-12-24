#!/bin/bash

# ================================================================
# HLS Transcoder - Production Deployment Script
# ================================================================
# This script deploys the HLS transcoder to production server
# ================================================================

set -e  # Exit on error

echo "=========================================="
echo "HLS Transcoder - Production Deployment"
echo "=========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if docker is running
if ! docker info > /dev/null 2>&1; then
    echo "${RED}❌ Error: Docker is not running${NC}"
    exit 1
fi

# Check if docker-compose is available
if ! command -v docker-compose &> /dev/null; then
    echo "${RED}❌ Error: docker-compose is not installed${NC}"
    exit 1
fi

echo "✓ Docker is running"
echo ""

# Check if .env.production exists
if [ ! -f .env.production ]; then
    echo "${RED}❌ Error: .env.production file not found${NC}"
    echo ""
    echo "Please create .env.production file:"
    echo "  1. Copy template: cp .env.production.example .env.production"
    echo "  2. Edit with secure credentials: nano .env.production"
    echo "  3. Run this script again"
    echo ""
    exit 1
fi

# Validate production credentials
echo "Validating production configuration..."

# Check if default passwords are still being used
if grep -q "password123" .env.production; then
    echo "${RED}❌ Error: Default password detected in .env.production${NC}"
    echo "Please update MINIO_ROOT_PASSWORD with a strong password"
    exit 1
fi

if grep -q "admin_production_2025" .env.production && grep -q "CHANGE_THIS" .env.production; then
    echo "${YELLOW}⚠ Warning: Template password detected. Please update credentials.${NC}"
    read -p "Continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo "✓ Configuration validated"
echo ""

# Create logs directory if not exists
mkdir -p logs/backend logs/nginx

# Confirmation prompt
echo "${YELLOW}⚠ This will deploy to PRODUCTION environment${NC}"
echo ""
echo "Docker containers will bind to localhost only (127.0.0.1)"
echo "Make sure Nginx reverse proxy is configured on the host"
echo ""
read -p "Continue with production deployment? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Deployment cancelled"
    exit 0
fi

# Pull latest images
echo ""
echo "Pulling latest images..."
docker-compose -f docker-compose.prod.yml pull

# Stop existing containers
echo ""
echo "Stopping existing containers (if any)..."
docker-compose -f docker-compose.prod.yml down 2>/dev/null || true
echo "✓ Containers stopped"

# Build and start containers
echo ""
echo "Building and starting production containers..."
docker-compose -f docker-compose.prod.yml --env-file .env.production up -d --build

# Wait for services to be healthy
echo ""
echo "Waiting for services to be healthy..."
sleep 10

# Check container status
echo ""
echo "Container status:"
docker-compose -f docker-compose.prod.yml ps

echo ""
echo "${GREEN}=========================================="
echo "✓ Production deployment successful!"
echo "==========================================${NC}"
echo ""
echo "Services are now running (localhost only):"
echo "  Nginx Container:   127.0.0.1:8089 (internal)"
echo "  MinIO Console:     127.0.0.1:9001 (internal)"
echo "  MinIO API:         127.0.0.1:9000 (internal)"
echo ""
echo "Public access (via Nginx host reverse proxy):"
echo "  Frontend & API:    https://transcode.mostara.id"
echo "  MinIO Console:     https://minio.mostara.id"
echo ""
echo "Next steps:"
echo "  1. Verify Nginx host reverse proxy is configured"
echo "  2. Test public access: curl https://transcode.mostara.id/health"
echo "  3. Monitor logs: docker-compose -f docker-compose.prod.yml logs -f"
echo ""
echo "Useful commands:"
echo "  View logs:     docker-compose -f docker-compose.prod.yml logs -f"
echo "  Stop:          docker-compose -f docker-compose.prod.yml down"
echo "  Restart:       docker-compose -f docker-compose.prod.yml restart"
echo "  Status:        docker-compose -f docker-compose.prod.yml ps"
echo ""
