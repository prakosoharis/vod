#!/bin/bash

# ================================================================
# Fix Backend Connectivity Issues
# ================================================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}==========================================${NC}"
echo "Fixing Backend Connectivity"
echo -e "${BLUE}==========================================${NC}"
echo ""

# ================================================================
# 1. Check Backend Container Status
# ================================================================
echo -e "${YELLOW}1. Checking Backend Container...${NC}"
echo ""

if ! docker ps | grep -q hls-backend-prod; then
    echo -e "${RED}✗ Backend container not running!${NC}"
    exit 1
fi

echo "Backend container is running"
echo ""

# ================================================================
# 2. Check Backend Logs for Errors
# ================================================================
echo -e "${YELLOW}2. Backend Logs (last 30 lines):${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
docker logs hls-backend-prod --tail=30
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# ================================================================
# 3. Check if Backend Process is Running
# ================================================================
echo -e "${YELLOW}3. Checking Backend Process...${NC}"
echo ""

echo "Processes in backend container:"
docker exec hls-backend-prod ps aux || docker exec hls-backend-prod ps
echo ""

# ================================================================
# 4. Test Backend Health Endpoint Directly
# ================================================================
echo -e "${YELLOW}4. Testing Backend Endpoints...${NC}"
echo ""

echo -n "Testing /health endpoint: "
if docker exec hls-backend-prod wget -qO- http://localhost:5000/health 2>/dev/null; then
    echo -e "${GREEN}✓ OK${NC}"
else
    echo -e "${YELLOW}wget failed, trying with curl...${NC}"
    if docker exec hls-backend-prod curl -f http://localhost:5000/health 2>/dev/null; then
        echo -e "${GREEN}✓ OK (via curl)${NC}"
    else
        echo -e "${RED}✗ Both wget and curl failed${NC}"
        echo ""
        echo "Trying with node to check if server is listening:"
        docker exec hls-backend-prod node -e "const http = require('http'); http.get('http://localhost:5000/health', res => { console.log('Status:', res.statusCode); res.on('data', d => process.stdout.write(d)); }).on('error', e => console.error('Error:', e.message));"
    fi
fi

echo ""
echo -n "Testing /api/upload endpoint: "
HTTP_CODE=$(docker exec hls-backend-prod curl -s -o /dev/null -w "%{http_code}" http://localhost:5000/api/upload 2>/dev/null || echo "000")
echo "HTTP $HTTP_CODE"

if [ "$HTTP_CODE" = "000" ]; then
    echo -e "${RED}✗ Cannot connect to backend${NC}"
elif [ "$HTTP_CODE" = "404" ]; then
    echo -e "${YELLOW}⚠ Endpoint not found - checking available routes...${NC}"
elif [ "$HTTP_CODE" = "405" ] || [ "$HTTP_CODE" = "400" ]; then
    echo -e "${GREEN}✓ Backend is responding (needs POST request)${NC}"
fi

echo ""

# ================================================================
# 5. Check Docker Network
# ================================================================
echo -e "${YELLOW}5. Docker Network Configuration:${NC}"
echo ""

echo "Network for backend container:"
docker inspect hls-backend-prod --format='{{range $net,$v := .NetworkSettings.Networks}}{{$net}} {{end}}'

echo ""
echo "Network for nginx container:"
docker inspect hls-nginx-prod --format='{{range $net,$v := .NetworkSettings.Networks}}{{$net}} {{end}}'

echo ""
echo "Backend IP in docker network:"
docker inspect hls-backend-prod --format='{{range $net,$v := .NetworkSettings.Networks}}{{$net}}: {{$v.IPAddress}} {{end}}'

echo ""

# ================================================================
# 6. Test Connectivity from Nginx to Backend
# ================================================================
echo -e "${YELLOW}6. Testing Nginx → Backend Connectivity:${NC}"
echo ""

BACKEND_IP=$(docker inspect hls-backend-prod --format='{{range $net,$v := .NetworkSettings.Networks}}{{$v.IPAddress}}{{end}}' | head -1)

echo "Backend IP: $BACKEND_IP"
echo ""

echo -n "Ping backend from nginx: "
if docker exec hls-nginx-prod ping -c 1 backend >/dev/null 2>&1; then
    echo -e "${GREEN}✓ Can ping${NC}"
else
    echo -e "${RED}✗ Cannot ping${NC}"
fi

echo -n "Resolve 'backend' hostname: "
docker exec hls-nginx-prod nslookup backend 2>/dev/null || docker exec hls-nginx-prod getent hosts backend || echo -e "${RED}✗ Failed${NC}"

echo ""
echo -n "Connect to backend:5000 from nginx: "
if docker exec hls-nginx-prod wget -qO- http://backend:5000/health 2>/dev/null; then
    echo -e "${GREEN}✓ Connected${NC}"
else
    echo -e "${RED}✗ Cannot connect${NC}"

    echo ""
    echo "Trying with IP address instead of hostname:"
    if docker exec hls-nginx-prod wget -qO- http://$BACKEND_IP:5000/health 2>/dev/null; then
        echo -e "${YELLOW}⚠ Works with IP but not hostname - DNS issue${NC}"
    else
        echo -e "${RED}✗ Cannot connect even with IP - network issue${NC}"
    fi
fi

echo ""

# ================================================================
# 7. Check Backend App Source
# ================================================================
echo -e "${YELLOW}7. Backend Application Files:${NC}"
echo ""

echo "Main app file exists:"
docker exec hls-backend-prod ls -lh /app/src/app.js 2>/dev/null || \
docker exec hls-backend-prod ls -lh /app/app.js 2>/dev/null || \
docker exec hls-backend-prod ls -lh /app/server.js 2>/dev/null || \
echo -e "${RED}Cannot find main app file${NC}"

echo ""
echo "Package.json:"
docker exec hls-backend-prod cat /app/package.json 2>/dev/null | head -20

echo ""

# ================================================================
# 8. Recommendations
# ================================================================
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}RECOMMENDATIONS:${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Check if backend process is actually running
if docker exec hls-backend-prod ps aux 2>/dev/null | grep -q node; then
    echo -e "${GREEN}✓ Node process is running${NC}"
else
    echo -e "${RED}⚠ Node process might not be running!${NC}"
    echo "  Try restarting backend: docker-compose -f docker-compose.prod.yml restart backend"
fi

echo ""
echo "If backend is not responding:"
echo "  1. Check logs: docker logs hls-backend-prod -f"
echo "  2. Restart backend: docker-compose -f docker-compose.prod.yml restart backend"
echo "  3. Rebuild if needed: docker-compose -f docker-compose.prod.yml up -d --build backend"
echo ""

echo "If network connectivity fails:"
echo "  1. Recreate network: docker-compose -f docker-compose.prod.yml down && docker-compose -f docker-compose.prod.yml up -d"
echo "  2. Check firewall: iptables -L -n"
echo ""
