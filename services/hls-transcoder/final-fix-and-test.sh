#!/bin/bash

# ================================================================
# Final Fix & Test - Complete Solution
# ================================================================
# This script will:
# 1. Fix nginx health check
# 2. Restart nginx container if needed
# 3. Test upload endpoint
# 4. Verify everything is working
# ================================================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${CYAN}==========================================${NC}"
echo -e "${CYAN}   HLS Transcoder - Final Fix & Test${NC}"
echo -e "${CYAN}==========================================${NC}"
echo ""

# ================================================================
# Step 1: Verify Health File Exists
# ================================================================
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}Step 1: Checking Health File${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

if [ -f "./frontend-test/health" ]; then
    echo -e "${GREEN}✓ Health file exists on host${NC}"
    cat ./frontend-test/health
else
    echo -e "${YELLOW}⚠ Health file not found, creating...${NC}"
    echo "OK" > ./frontend-test/health
    echo -e "${GREEN}✓ Health file created${NC}"
fi

echo ""

# ================================================================
# Step 2: Check Current Nginx Status
# ================================================================
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}Step 2: Current Container Status${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

docker ps --filter "name=hls-" --format "table {{.Names}}\t{{.Status}}"

echo ""

# Check if nginx is unhealthy
if docker ps | grep hls-nginx-prod | grep -q "unhealthy"; then
    NGINX_UNHEALTHY=true
    echo -e "${RED}⚠ Nginx container is UNHEALTHY${NC}"
else
    NGINX_UNHEALTHY=false
    echo -e "${GREEN}✓ Nginx container is healthy${NC}"
fi

echo ""

# ================================================================
# Step 3: Test Health Endpoint from Container
# ================================================================
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}Step 3: Testing Health Endpoint${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

echo -n "Testing /health from inside nginx container: "
HEALTH_RESPONSE=$(docker exec hls-nginx-prod cat /usr/share/nginx/html/health 2>&1)
if [ "$HEALTH_RESPONSE" = "OK" ]; then
    echo -e "${GREEN}✓ File exists in container${NC}"
    NEED_RESTART=false
else
    echo -e "${RED}✗ File not found in container${NC}"
    echo "  Response: $HEALTH_RESPONSE"
    NEED_RESTART=true
fi

echo -n "Testing /health via HTTP: "
HTTP_RESPONSE=$(docker exec hls-nginx-prod wget -qO- http://localhost/health 2>&1)
if [ "$HTTP_RESPONSE" = "OK" ]; then
    echo -e "${GREEN}✓ HTTP endpoint working${NC}"
else
    echo -e "${RED}✗ HTTP endpoint not working${NC}"
    echo "  Response: $HTTP_RESPONSE"
    NEED_RESTART=true
fi

echo ""

# ================================================================
# Step 4: Fix if Needed
# ================================================================
if [ "$NEED_RESTART" = true ] || [ "$NGINX_UNHEALTHY" = true ]; then
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${YELLOW}Step 4: Applying Fix${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

    echo -e "${YELLOW}Restarting nginx container to reload mounted files...${NC}"
    docker-compose -f docker-compose.prod.yml restart nginx

    echo ""
    echo -e "${YELLOW}Waiting for nginx to become healthy (max 60 seconds)...${NC}"

    for i in {1..12}; do
        sleep 5
        STATUS=$(docker inspect --format='{{.State.Health.Status}}' hls-nginx-prod 2>/dev/null || echo "unknown")
        echo -n "  Check $i/12: $STATUS"

        if [ "$STATUS" = "healthy" ]; then
            echo -e " ${GREEN}✓${NC}"
            break
        else
            echo ""
        fi
    done

    echo ""
else
    echo -e "${GREEN}✓ No fix needed, nginx is working${NC}"
    echo ""
fi

# ================================================================
# Step 5: Verify All Containers
# ================================================================
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}Step 5: Final Container Status${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

docker ps --filter "name=hls-" --format "table {{.Names}}\t{{.Status}}"

echo ""

# ================================================================
# Step 6: Test Backend Connectivity
# ================================================================
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}Step 6: Testing Backend Connectivity${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

echo -n "Nginx → Backend health check: "
if docker exec hls-nginx-prod wget -qO- http://backend:5000/health 2>/dev/null | grep -q "healthy"; then
    echo -e "${GREEN}✓ Connected${NC}"
else
    echo -e "${RED}✗ Cannot connect${NC}"
fi

echo ""

# ================================================================
# Step 7: Test Upload Endpoint
# ================================================================
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}Step 7: Testing Upload Endpoint${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

echo "Creating small test file..."
TEST_FILE="/tmp/test-upload-$$.txt"
echo "test video file" > $TEST_FILE

echo -n "Testing upload via nginx container (127.0.0.1:8089): "
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" \
    -X POST \
    -F "video=@$TEST_FILE" \
    http://127.0.0.1:8089/api/upload 2>/dev/null)

if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "201" ]; then
    echo -e "${GREEN}✓ HTTP $HTTP_CODE - Upload endpoint working!${NC}"
elif [ "$HTTP_CODE" = "400" ]; then
    echo -e "${GREEN}✓ HTTP $HTTP_CODE - Backend reachable (rejected test file as expected)${NC}"
elif [ "$HTTP_CODE" = "502" ] || [ "$HTTP_CODE" = "503" ] || [ "$HTTP_CODE" = "504" ]; then
    echo -e "${RED}✗ HTTP $HTTP_CODE - Gateway error${NC}"
else
    echo -e "${YELLOW}⚠ HTTP $HTTP_CODE${NC}"
fi

rm -f $TEST_FILE

echo ""

# ================================================================
# Step 8: Final Summary
# ================================================================
echo -e "${CYAN}==========================================${NC}"
echo -e "${CYAN}           FINAL SUMMARY${NC}"
echo -e "${CYAN}==========================================${NC}"
echo ""

ALL_HEALTHY=true

# Check each container
for container in hls-nginx-prod hls-backend-prod hls-minio-prod; do
    STATUS=$(docker inspect --format='{{.State.Health.Status}}' $container 2>/dev/null || echo "unknown")
    echo -n "$container: "
    if [ "$STATUS" = "healthy" ]; then
        echo -e "${GREEN}✓ Healthy${NC}"
    else
        echo -e "${RED}✗ $STATUS${NC}"
        ALL_HEALTHY=false
    fi
done

echo ""

if [ "$ALL_HEALTHY" = true ]; then
    echo -e "${GREEN}═══════════════════════════════════════${NC}"
    echo -e "${GREEN}✓ SUCCESS! All containers are healthy${NC}"
    echo -e "${GREEN}═══════════════════════════════════════${NC}"
    echo ""
    echo "🎉 Upload should now work at:"
    echo "   https://transcode.mostara.id"
    echo ""
    echo "You can verify by:"
    echo "   1. Opening https://transcode.mostara.id in browser"
    echo "   2. Uploading a video file"
    echo "   3. Checking the result"
    echo ""
else
    echo -e "${YELLOW}⚠ Some containers are not healthy${NC}"
    echo ""
    echo "Next steps:"
    echo "   1. Check logs: docker logs <container-name>"
    echo "   2. Wait a few more minutes for health checks"
    echo "   3. If issues persist, run: ./diagnose-upload.sh"
    echo ""
fi

echo "For detailed monitoring:"
echo "   docker logs -f hls-nginx-prod     # Nginx logs"
echo "   docker logs -f hls-backend-prod   # Backend logs"
echo "   docker ps --filter 'name=hls-'    # Container status"
echo ""
