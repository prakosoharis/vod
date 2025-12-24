#!/bin/bash

# ================================================================
# HLS Transcoder - Stop Script
# ================================================================
# This script stops all HLS transcoder containers
# ================================================================

echo "=========================================="
echo "HLS Transcoder - Stop All Containers"
echo "=========================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Function to stop containers for a specific compose file
stop_containers() {
    local compose_file=$1
    local env_name=$2

    if docker-compose -f "$compose_file" ps -q 2>/dev/null | grep -q .; then
        echo "Stopping $env_name containers..."
        docker-compose -f "$compose_file" down
        echo "${GREEN}✓ $env_name containers stopped${NC}"
        return 0
    else
        echo "${YELLOW}ℹ No $env_name containers running${NC}"
        return 1
    fi
}

stopped_any=false

# Try to stop production containers
if [ -f docker-compose.prod.yml ]; then
    if stop_containers "docker-compose.prod.yml" "production"; then
        stopped_any=true
    fi
    echo ""
fi

# Try to stop local/dev containers
if [ -f docker-compose.local.yml ]; then
    if stop_containers "docker-compose.local.yml" "local/development"; then
        stopped_any=true
    fi
    echo ""
fi

# Try to stop default containers
if [ -f docker-compose.yml ]; then
    if stop_containers "docker-compose.yml" "default"; then
        stopped_any=true
    fi
    echo ""
fi

if [ "$stopped_any" = false ]; then
    echo "${YELLOW}No HLS transcoder containers were running${NC}"
else
    echo "${GREEN}=========================================="
    echo "✓ All containers stopped successfully"
    echo "==========================================${NC}"
fi

echo ""
echo "To start containers again:"
echo "  Local:       ./deploy-local.sh"
echo "  Production:  ./deploy-prod.sh"
echo ""
