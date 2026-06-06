#!/bin/bash

# Server Migration Script (Docker-based)
# Usage: ./scripts/server-migrate.sh

set -e

echo "Starting server migration process..."

# Configuration
APP_DIR="/var/www/vod"
API_DIR="$APP_DIR/apps/api"
BACKUP_DIR="$APP_DIR/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/backup_before_migration_$TIMESTAMP.sql"

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Navigate to app directory
cd "$APP_DIR" || { echo "Cannot navigate to app directory: $APP_DIR"; exit 1; }

echo "Step 1: Pulling latest changes..."
git pull origin main

echo "Step 2: Creating database backup..."
mkdir -p "$BACKUP_DIR"

# Backup via Docker postgres container
if docker ps --format '{{.Names}}' | grep -q "vod-postgres\|streamkita-postgres"; then
  CONTAINER_NAME=$(docker ps --format '{{.Names}}' | grep -E "vod-postgres|streamkita-postgres" | head -1)
  docker exec "$CONTAINER_NAME" pg_dump -U streamkita streamkita_dev > "$BACKUP_FILE"
  echo "Backup created: $BACKUP_FILE"
else
  echo "Warning: No postgres container found. Trying direct connection..."
  pg_dump -h localhost -U streamkita streamkita_dev > "$BACKUP_FILE" 2>/dev/null || {
    echo "Could not create backup. Proceed with caution."
  }
fi

echo "Step 3: Rebuilding API container..."
docker compose build api

echo "Step 4: Running database migrations..."
docker compose run --rm api npx prisma migrate deploy

echo "Step 5: Restarting services..."
docker compose up -d

echo "Step 6: Verifying deployment..."
sleep 5
if curl -f -s http://localhost:3001/health > /dev/null 2>&1; then
  echo "API health check passed"
else
  echo "Warning: API health check failed. Check: docker compose logs api"
fi

echo ""
echo "Migration completed!"
echo "Backup: $BACKUP_FILE"
echo ""
echo "Useful commands:"
echo "  View logs:  docker compose logs -f"
echo "  Status:     docker compose ps"
echo "  Stop:       docker compose down"
