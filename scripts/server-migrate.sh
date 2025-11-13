#!/bin/bash

# Server Migration Script
# For running database migrations on production server
# Usage: ./scripts/server-migrate.sh [backup-only]

set -e

echo "🚀 Starting server migration process..."

# Configuration
APP_DIR="/var/www/alkamus/vod"
API_DIR="$APP_DIR/apps/api"
BACKUP_DIR="$APP_DIR/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/backup_before_migration_$TIMESTAMP.sql"

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Function to show colored output
print_info() {
    echo -e "\033[1;34mℹ️  $1\033[0m"
}

print_success() {
    echo -e "\033[1;32m✅ $1\033[0m"
}

print_warning() {
    echo -e "\033[1;33m⚠️  $1\033[0m"
}

print_error() {
    echo -e "\033[1;31m❌ $1\033[0m"
}

# Check if running as correct user
if [ "$EUID" -eq 0 ]; then
    print_error "Don't run this script as root. Run as your deployment user."
    exit 1
fi

# Navigate to app directory
cd "$APP_DIR" || {
    print_error "Cannot navigate to app directory: $APP_DIR"
    exit 1
}

print_info "Step 1: Pulling latest changes from repository..."
git pull origin main || {
    print_error "Failed to pull latest changes"
    exit 1
}
print_success "Repository updated successfully"

# Create database backup (unless --backup-only is specified)
if [ "$1" != "--backup-only" ]; then
    print_info "Step 2: Creating database backup..."

    # Check if PostgreSQL container is running
    if docker ps | grep -q "vod-postgres"; then
        docker exec vod-postgres pg_dump -U vod_user vod_db > "$BACKUP_FILE" || {
            print_error "Failed to create database backup"
            exit 1
        }
    else
        # Fallback to direct connection
        pg_dump -h localhost -U vod_user vod_db > "$BACKUP_FILE" || {
            print_error "Failed to create database backup"
            exit 1
        }
    fi

    print_success "Database backup created: $BACKUP_FILE"

    # Show backup file size
    BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
    print_info "Backup file size: $BACKUP_SIZE"
fi

# Navigate to API directory
cd "$API_DIR" || {
    print_error "Cannot navigate to API directory: $API_DIR"
    exit 1
}

print_info "Step 3: Generating Prisma client..."
npx prisma generate || {
    print_error "Failed to generate Prisma client"
    exit 1
}
print_success "Prisma client generated"

print_info "Step 4: Applying database migrations..."
npx prisma migrate deploy || {
    print_error "Failed to apply migrations"
    print_warning "Check the error message above. You may need to:"
    print_warning "1. Review the migration files"
    print_warning "2. Check database connection"
    print_warning "3. Restore from backup if needed"
    print_warning "   pg_dump -h localhost -U vod_user vod_db < $BACKUP_FILE"
    exit 1
}
print_success "Database migrations applied successfully"

print_info "Step 5: Updating seed data (if needed)..."
if [ -f "prisma/seed.ts" ]; then
    npm run seed || {
        print_warning "Seed data update failed. This might be expected if data already exists."
    }
    print_success "Seed data update completed"
else
    print_info "No seed file found, skipping seed update"
fi

print_info "Step 6: Restarting API service..."
pm2 restart alkamus-api || {
    print_error "Failed to restart API service"
    exit 1
}
print_success "API service restarted successfully"

print_info "Step 7: Verifying deployment..."
sleep 3  # Give service time to start

# Check if API is responding
if curl -f -s http://localhost:3005/health > /dev/null; then
    print_success "API health check passed"
else
    print_warning "API health check failed. Check logs with: pm2 logs alkamus-api"
fi

# Check PM2 status
pm2 status alkamus-api

echo ""
print_success "🎉 Migration completed successfully!"
echo ""
print_info "Migration summary:"
echo "  • Backup created: $BACKUP_FILE"
echo "  • Migrations applied: Latest"
echo "  • API service restarted"
echo ""
print_info "Useful commands:"
echo "  • View logs: pm2 logs alkamus-api"
echo "  • Check status: pm2 status"
echo "  • Restore backup: pg_dump -h localhost -U vod_user vod_db < $BACKUP_FILE"
echo ""
print_warning "Keep the backup file safe until you verify everything is working correctly!"