#!/bin/bash

# ================================================================
# HLS Transcoder - Production Deployment Script
# ================================================================
# This script deploys the HLS transcoder to production server
# Auto-fixes common configuration issues before deployment
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
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Error: Docker is not running${NC}"
    exit 1
fi

# Check if docker-compose is available
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ Error: docker-compose is not installed${NC}"
    exit 1
fi

echo "✓ Docker is running"
echo ""

# ================================================================
# AUTO-FIX: Check and fix common configuration issues
# ================================================================
echo -e "${BLUE}Checking configuration...${NC}"

NEEDS_FIX=false

# Check if docker-compose.prod.yml has invalid build target
if grep -q "target: production" docker-compose.prod.yml || grep -q "target: development" docker-compose.prod.yml; then
    echo -e "${YELLOW}⚠ Found invalid build target in docker-compose.prod.yml${NC}"
    NEEDS_FIX=true
fi

if [ "$NEEDS_FIX" = true ]; then
    echo -e "${YELLOW}Auto-fixing configuration issues...${NC}"

    # Create backup
    BACKUP_FILE="docker-compose.prod.yml.backup.$(date +%Y%m%d_%H%M%S)"
    cp docker-compose.prod.yml "$BACKUP_FILE"
    echo "  ✓ Backup created: $BACKUP_FILE"

    # Fix: Remove invalid build targets
    if grep -q "target: production" docker-compose.prod.yml || grep -q "target: development" docker-compose.prod.yml; then
        sed -i '/target: production/d' docker-compose.prod.yml
        sed -i '/target: development/d' docker-compose.prod.yml
        echo "  ✓ Removed invalid build target from docker-compose.prod.yml"
    fi

    echo -e "${GREEN}✓ Configuration auto-fixed${NC}"
else
    echo "✓ Configuration is valid"
fi

echo ""

# ================================================================
# VALIDATION: Check .env.production
# ================================================================
if [ ! -f .env.production ]; then
    echo -e "${RED}❌ Error: .env.production file not found${NC}"
    echo ""
    echo "Please create .env.production file:"
    echo "  1. Copy template: cp .env.production.example .env.production"
    echo "  2. Edit with secure credentials: nano .env.production"
    echo "  3. Run this script again"
    echo ""
    exit 1
fi

echo "Validating production credentials..."

# Check if default passwords are still being used
if grep -q "password123" .env.production; then
    echo -e "${RED}❌ Error: Default password detected in .env.production${NC}"
    echo "Please update MINIO_ROOT_PASSWORD with a strong password"
    exit 1
fi

if grep -q "admin_production_2025" .env.production && grep -q "CHANGE_THIS" .env.production; then
    echo -e "${YELLOW}⚠ Warning: Template password detected. Please update credentials.${NC}"
    read -p "Continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo "✓ Credentials validated"
echo ""

# Create logs directory if not exists
mkdir -p logs/backend logs/nginx

# ================================================================
# DEPLOYMENT CONFIRMATION
# ================================================================
echo -e "${YELLOW}⚠ This will deploy to PRODUCTION environment${NC}"
echo ""
echo "Configuration:"
echo "  • Docker containers bind to localhost only (127.0.0.1)"
echo "  • Public access via Nginx reverse proxy on host"
echo "  • Domain: transcode.mostara.id"
echo ""
read -p "Continue with production deployment? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Deployment cancelled"
    exit 0
fi

# ================================================================
# DEPLOYMENT PROCESS
# ================================================================

# Pull latest images
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 1: Pulling latest images..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
docker-compose -f docker-compose.prod.yml --env-file .env.production pull 2>&1 | grep -v "WARNING: The following deploy"

# Stop existing containers
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 2: Stopping existing containers..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
docker-compose -f docker-compose.prod.yml --env-file .env.production down 2>/dev/null || true
echo "✓ Containers stopped"

# Build and start containers
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 3: Building and starting containers..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Build and start, capture output
if ! docker-compose -f docker-compose.prod.yml --env-file .env.production up -d --build 2>&1 | grep -v "WARNING: The following deploy"; then
    echo ""
    echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "❌ Build/Start Failed!"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo "Common issues:"
    echo "  • Missing package-lock.json in backend/"
    echo "  • Docker build context errors"
    echo "  • Network connectivity issues"
    echo ""
    echo "View detailed logs:"
    echo "  docker-compose -f docker-compose.prod.yml --env-file .env.production logs"
    echo ""
    exit 1
fi

# Wait for services to be healthy
echo ""
echo "Waiting for services to be healthy..."
sleep 5

# Quick health check
echo -n "Checking MinIO health... "
if docker exec hls-minio-prod curl -sf http://localhost:9000/minio/health/live > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${YELLOW}(starting...)${NC}"
fi

echo -n "Checking Nginx health... "
if docker exec hls-nginx-prod wget -q --spider http://localhost/health > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${YELLOW}(starting...)${NC}"
fi

sleep 5

# Check container status
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Container Status:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
CONTAINER_STATUS=$(docker-compose -f docker-compose.prod.yml --env-file .env.production ps)
echo "$CONTAINER_STATUS"

# Verify all containers are running
RUNNING_COUNT=$(echo "$CONTAINER_STATUS" | grep -c "Up" || true)
if [ "$RUNNING_COUNT" -lt 3 ]; then
    echo ""
    echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "⚠ Warning: Not all containers are running!"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo "Expected: 3 containers (minio, backend, nginx)"
    echo "Running: $RUNNING_COUNT containers"
    echo ""
    echo "Check logs for errors:"
    echo "  docker-compose -f docker-compose.prod.yml --env-file .env.production logs"
    echo ""
    exit 1
fi

# ================================================================
# DEPLOYMENT SUCCESS
# ================================================================
echo ""
echo -e "${GREEN}=========================================="
echo "✓ Production deployment successful!"
echo "==========================================${NC}"
echo ""
echo "Services are now running (localhost only):"
echo "  • Nginx Container:   127.0.0.1:8089 (internal)"
echo "  • MinIO Console:     127.0.0.1:9001 (internal)"
echo "  • MinIO API:         127.0.0.1:9000 (internal)"
echo ""
echo "Public access (via Nginx host reverse proxy):"
echo "  • Frontend & API:    https://transcode.mostara.id"
echo "  • MinIO Console:     https://minio.mostara.id"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "  1. Verify Nginx host reverse proxy is configured"
echo "  2. Test public access:"
echo "     curl https://transcode.mostara.id/health"
echo "     curl -I https://minio.mostara.id"
echo "  3. Monitor logs:"
echo "     docker-compose -f docker-compose.prod.yml --env-file .env.production logs -f"
echo ""
echo -e "${BLUE}Useful commands:${NC}"
echo "  View logs:      docker-compose -f docker-compose.prod.yml --env-file .env.production logs -f"
echo "  View specific:  docker-compose -f docker-compose.prod.yml --env-file .env.production logs -f backend"
echo "  Stop:           docker-compose -f docker-compose.prod.yml --env-file .env.production down"
echo "  Restart:        docker-compose -f docker-compose.prod.yml --env-file .env.production restart"
echo "  Status:         docker-compose -f docker-compose.prod.yml --env-file .env.production ps"
echo ""
