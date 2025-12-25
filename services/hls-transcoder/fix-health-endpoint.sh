#!/bin/bash

# ================================================================
# Quick Fix: Nginx Container Health Endpoint
# ================================================================
# Adds /health file to nginx container to fix unhealthy status
# No rebuild required - instant fix
# ================================================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}==========================================${NC}"
echo "Fixing Nginx Container Health Endpoint"
echo -e "${BLUE}==========================================${NC}"
echo ""

# Check if nginx container is running
if ! docker ps | grep -q hls-nginx-prod; then
    echo -e "${RED}✗ Nginx container not running!${NC}"
    echo "  Please start containers first with: ./deploy-prod.sh"
    exit 1
fi

echo -e "${YELLOW}Adding /health file to nginx container...${NC}"

# Add health file directly to running container
docker exec hls-nginx-prod sh -c 'echo "OK" > /usr/share/nginx/html/health'

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Health file created successfully${NC}"
else
    echo -e "${RED}✗ Failed to create health file${NC}"
    exit 1
fi

echo ""
echo -e "${YELLOW}Testing health endpoint...${NC}"

# Wait a moment for health check to run
sleep 2

# Test health endpoint
RESPONSE=$(docker exec hls-nginx-prod wget -qO- http://localhost/health 2>/dev/null)
if [ "$RESPONSE" = "OK" ]; then
    echo -e "${GREEN}✓ Health endpoint is working!${NC}"
    echo "  Response: $RESPONSE"
else
    echo -e "${RED}✗ Health endpoint test failed${NC}"
    echo "  Response: $RESPONSE"
    exit 1
fi

echo ""
echo -e "${YELLOW}Waiting for container health status to update...${NC}"
echo "  (This may take up to 30 seconds)"

# Wait for health check to pass (max 60 seconds)
for i in {1..12}; do
    sleep 5
    STATUS=$(docker inspect --format='{{.State.Health.Status}}' hls-nginx-prod 2>/dev/null || echo "unknown")
    echo -n "  Check $i/12: Status = $STATUS"

    if [ "$STATUS" = "healthy" ]; then
        echo -e " ${GREEN}✓${NC}"
        break
    else
        echo ""
    fi
done

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo "Final Container Status:"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

docker ps --filter "name=hls-" --format "table {{.Names}}\t{{.Status}}"

echo ""

# Check if nginx is now healthy
if docker ps | grep hls-nginx-prod | grep -q "healthy"; then
    echo -e "${GREEN}═══════════════════════════════════════${NC}"
    echo -e "${GREEN}✓ SUCCESS! Nginx container is now healthy${NC}"
    echo -e "${GREEN}═══════════════════════════════════════${NC}"
    echo ""
    echo "Upload should now work properly at:"
    echo "  https://transcode.mostara.id"
    echo ""
else
    echo -e "${YELLOW}⚠ Container may still be starting up${NC}"
    echo "  Wait a few more minutes and check with:"
    echo "  docker ps --filter 'name=hls-nginx-prod'"
    echo ""
fi

echo "To verify upload functionality:"
echo "  1. Visit https://transcode.mostara.id"
echo "  2. Try uploading a video file"
echo "  3. Check logs if issues persist: docker logs hls-nginx-prod"
echo ""
