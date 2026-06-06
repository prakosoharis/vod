#!/bin/bash

# ================================================================
# Deploy Script for Ubuntu Server
# ================================================================
# Usage: ./deploy-docker.sh [--init]
#
# --init  First-time setup (stops old containers, migrates)
# ================================================================

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo "=========================================="
echo "VOD Platform - Docker Deployment"
echo "=========================================="

# Check Docker
if ! docker info > /dev/null 2>&1; then
  echo -e "${RED}Docker is not running${NC}"
  exit 1
fi

if [ "$1" = "--init" ]; then
  echo ""
  echo -e "${YELLOW}First-time deployment detected${NC}"
  echo ""

  # Step 1: Stop old containers that are no longer needed
  echo "Step 1: Stopping old unused containers..."
  for container in nginx-rtmp live-chat; do
    if docker ps --format '{{.Names}}' | grep -q "^${container}$"; then
      echo "  Stopping $container..."
      docker stop "$container"
      docker rm "$container"
      echo "  Stopped and removed $container"
    else
      echo "  $container not running (skipped)"
    fi
  done

  # Step 2: Handle existing postgres
  echo ""
  echo "Step 2: Checking existing PostgreSQL..."
  if docker ps --format '{{.Names}}' | grep -q "streamkita-postgres"; then
    echo "  Found existing streamkita-postgres container"
    echo "  Creating database backup before migration..."
    mkdir -p ./backups
    docker exec streamkita-postgres pg_dump -U streamkita streamkita_dev > "./backups/pre-migration-$(date +%Y%m%d_%H%M%S).sql"
    echo "  Backup created in ./backups/"

    echo "  Stopping old postgres container..."
    docker stop streamkita-postgres
    docker rm streamkita-postgres
    echo "  Old postgres stopped (data preserved in volume)"
  fi

  echo ""
  echo -e "${GREEN}Init setup complete${NC}"
fi

# Step 3: Check .env file
echo ""
echo "Step 3: Checking .env file..."
if [ ! -f .env ]; then
  echo -e "${YELLOW}  .env not found. Creating from template...${NC}"
  cp .env.docker .env
  echo "  Created .env from .env.docker"
  echo -e "${YELLOW}  IMPORTANT: Edit .env with production values before continuing${NC}"
  echo "  Required: JWT_SECRET, IVS keys, MIDTRANS keys"
  echo ""
  read -p "  Edit .env now? (y/N): " -n 1 -r
  echo
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    ${EDITOR:-nano} .env
  else
    echo "  Continuing with default values..."
  fi
fi

# Step 4: Build and start
echo ""
echo "Step 4: Building and starting services..."
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build

# Step 5: Wait and verify
echo ""
echo "Step 5: Verifying services..."
sleep 10

echo ""
echo "Container Status:"
docker compose -f docker-compose.yml -f docker-compose.prod.yml ps

# Health checks
echo ""
echo "Health Checks:"
echo -n "  API:      "
if curl -sf http://localhost:3001/health > /dev/null 2>&1; then
  echo -e "${GREEN}OK${NC}"
else
  echo -e "${YELLOW}Starting...${NC}"
fi

echo -n "  Web:      "
if curl -sf http://localhost:3000/health > /dev/null 2>&1; then
  echo -e "${GREEN}OK${NC}"
else
  echo -e "${YELLOW}Starting...${NC}"
fi

echo ""
echo -e "${GREEN}=========================================="
echo "Deployment complete!"
echo "==========================================${NC}"
echo ""
echo "Services (localhost only):"
echo "  Web:          http://localhost:3000"
echo "  API:          http://localhost:3001"
echo "  Backoffice:   http://localhost:3006"
echo "  WebSocket:    ws://localhost:3002"
echo ""
echo "HLS Transcoder (separate):"
echo "  Transcode:    http://localhost:8089"
echo "  MinIO:        http://localhost:9001"
echo ""
echo "Useful commands:"
echo "  Logs:         docker compose logs -f"
echo "  API logs:     docker compose logs -f api"
echo "  Restart:      docker compose restart"
echo "  Stop:         docker compose down"
echo "  Rebuild:      docker compose up -d --build"
echo ""
