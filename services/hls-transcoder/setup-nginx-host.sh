#!/bin/bash

# ================================================================
# Setup Nginx Host Reverse Proxy
# ================================================================
# This script sets up Nginx on the host server to proxy requests
# to Docker containers running on localhost
# ================================================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo "=========================================="
echo "Nginx Host Reverse Proxy Setup"
echo "=========================================="
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}Please run as root (use sudo)${NC}"
    exit 1
fi

# Check if Nginx is installed
if ! command -v nginx &> /dev/null; then
    echo -e "${YELLOW}Nginx not installed. Installing...${NC}"
    apt update
    apt install -y nginx
    echo -e "${GREEN}✓ Nginx installed${NC}"
else
    echo "✓ Nginx is installed"
fi

echo ""

# Copy configuration files
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 1: Installing Nginx configurations"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ ! -f "nginx-configs/transcode.mostara.id" ]; then
    echo -e "${RED}Error: nginx-configs/transcode.mostara.id not found${NC}"
    echo "Please run this script from /var/www/vod/services/hls-transcoder/"
    exit 1
fi

# Backup existing configs if they exist
for config in transcode.mostara.id minio.mostara.id; do
    if [ -f "/etc/nginx/sites-available/$config" ]; then
        echo "  Backing up existing $config..."
        cp "/etc/nginx/sites-available/$config" "/etc/nginx/sites-available/$config.backup.$(date +%Y%m%d_%H%M%S)"
    fi
done

# Copy new configs
cp nginx-configs/transcode.mostara.id /etc/nginx/sites-available/
cp nginx-configs/minio.mostara.id /etc/nginx/sites-available/

echo -e "${GREEN}✓ Configuration files copied${NC}"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 2: Enabling sites"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Enable sites (create symlinks)
for config in transcode.mostara.id minio.mostara.id; do
    if [ ! -L "/etc/nginx/sites-enabled/$config" ]; then
        ln -s "/etc/nginx/sites-available/$config" "/etc/nginx/sites-enabled/"
        echo "  ✓ Enabled $config"
    else
        echo "  • $config already enabled"
    fi
done

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 3: Testing Nginx configuration"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if nginx -t; then
    echo -e "${GREEN}✓ Nginx configuration is valid${NC}"
else
    echo -e "${RED}✗ Nginx configuration has errors${NC}"
    echo ""
    echo "Please fix the errors above before continuing"
    exit 1
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 4: Reloading Nginx"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

systemctl reload nginx
echo -e "${GREEN}✓ Nginx reloaded${NC}"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 5: Verification"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check if Nginx is listening on port 80
if netstat -tlnp | grep -q ":80.*nginx"; then
    echo "✓ Nginx is listening on port 80"
else
    echo -e "${YELLOW}⚠ Nginx might not be listening on port 80${NC}"
fi

# Check if Docker containers are accessible
echo ""
echo "Testing Docker container connectivity:"

echo -n "  • Backend (127.0.0.1:5000): "
if curl -sf http://127.0.0.1:5000/health > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${RED}✗ Cannot connect${NC}"
fi

echo -n "  • MinIO API (127.0.0.1:9000): "
if curl -sf http://127.0.0.1:9000/minio/health/live > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${RED}✗ Cannot connect${NC}"
fi

echo -n "  • MinIO Console (127.0.0.1:9001): "
if curl -sf http://127.0.0.1:9001 > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${YELLOW}⚠ Cannot connect (might need authentication)${NC}"
fi

echo -n "  • Nginx Container (127.0.0.1:8089): "
if curl -sf http://127.0.0.1:8089/health > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${RED}✗ Cannot connect${NC}"
fi

echo ""
echo -e "${GREEN}=========================================="
echo "✓ Nginx host setup completed!"
echo "==========================================${NC}"
echo ""
echo -e "${BLUE}Next steps:${NC}"
echo "  1. Ensure DNS records are configured:"
echo "     • transcode.mostara.id → Server IP"
echo "     • minio.mostara.id → Server IP"
echo ""
echo "  2. Test from your local machine:"
echo "     • http://transcode.mostara.id/health"
echo "     • http://minio.mostara.id"
echo ""
echo "  3. If using Cloudflare, ensure:"
echo "     • Proxy is enabled (orange cloud)"
echo "     • SSL mode is 'Full' or 'Flexible'"
echo ""
echo -e "${YELLOW}Troubleshooting:${NC}"
echo "  • View Nginx logs: tail -f /var/log/nginx/transcode.mostara.id.error.log"
echo "  • Check Nginx status: systemctl status nginx"
echo "  • Test config: nginx -t"
echo ""
