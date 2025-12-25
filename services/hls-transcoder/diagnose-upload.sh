#!/bin/bash

# ================================================================
# HLS Transcoder Upload Diagnostics
# ================================================================
# Comprehensive diagnostics for upload issues
# ================================================================

set +e  # Don't exit on error, we want to see all results

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${CYAN}=========================================="
echo "HLS Transcoder Upload Diagnostics"
echo -e "==========================================${NC}"
echo ""

# ================================================================
# 1. Container Status
# ================================================================
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "1. Container Status"
echo -e "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

docker ps --filter "name=hls-" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo ""

# ================================================================
# 2. Health Checks
# ================================================================
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "2. Container Health Checks"
echo -e "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

echo -n "Backend Health: "
if docker exec hls-backend-prod wget -qO- http://localhost:5000/health 2>/dev/null | grep -q "OK"; then
    echo -e "${GREEN}✓ OK${NC}"
else
    echo -e "${RED}✗ FAILED${NC}"
fi

echo -n "MinIO Health: "
if docker exec hls-minio-prod curl -sf http://localhost:9000/minio/health/live >/dev/null 2>&1; then
    echo -e "${GREEN}✓ OK${NC}"
else
    echo -e "${RED}✗ FAILED${NC}"
fi

echo -n "Nginx Container Root: "
if docker exec hls-nginx-prod wget -qO- http://localhost/ >/dev/null 2>&1; then
    echo -e "${GREEN}✓ OK${NC}"
else
    echo -e "${RED}✗ FAILED${NC}"
fi

echo -n "Nginx Container /health: "
if docker exec hls-nginx-prod wget -qO- http://localhost/health 2>/dev/null | grep -q "OK"; then
    echo -e "${GREEN}✓ OK${NC}"
else
    echo -e "${YELLOW}⚠ NOT FOUND (this causes unhealthy status)${NC}"
fi

echo ""

# ================================================================
# 3. Network Connectivity
# ================================================================
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "3. Network Connectivity (Internal)"
echo -e "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

echo -n "Nginx → Backend: "
if docker exec hls-nginx-prod wget -qO- http://backend:5000/health 2>/dev/null | grep -q "OK"; then
    echo -e "${GREEN}✓ Can connect${NC}"
else
    echo -e "${RED}✗ Cannot connect${NC}"
fi

echo -n "Nginx → MinIO: "
if docker exec hls-nginx-prod wget -qO- http://minio:9000/minio/health/live >/dev/null 2>&1; then
    echo -e "${GREEN}✓ Can connect${NC}"
else
    echo -e "${RED}✗ Cannot connect${NC}"
fi

echo ""

# ================================================================
# 4. Upload Path Testing
# ================================================================
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "4. Upload Path Testing"
echo -e "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

echo -n "Host → Nginx Container (127.0.0.1:8089): "
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:8089/health 2>/dev/null)
if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "404" ]; then
    echo -e "${GREEN}✓ Reachable (HTTP $HTTP_CODE)${NC}"
else
    echo -e "${RED}✗ Not reachable${NC}"
fi

echo -n "Host → Nginx Host → Nginx Container: "
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -H "Host: transcode.mostara.id" http://127.0.0.1/health 2>/dev/null)
if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "404" ]; then
    echo -e "${GREEN}✓ Reachable (HTTP $HTTP_CODE)${NC}"
else
    echo -e "${RED}✗ Not reachable${NC}"
fi

echo ""

# ================================================================
# 5. Nginx Configuration Check
# ================================================================
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "5. Nginx Configuration"
echo -e "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

echo "Nginx Container - Upload size limit:"
docker exec hls-nginx-prod grep -A2 "client_max_body_size" /etc/nginx/nginx.conf 2>/dev/null || echo "  Not found"

echo ""
echo "Nginx Container - API proxy config:"
docker exec hls-nginx-prod grep -A10 "location /api" /etc/nginx/nginx.conf 2>/dev/null || echo "  Not found"

echo ""
echo "Nginx Host - Upload size limit:"
if [ -f /etc/nginx/sites-available/transcode.mostara.id ]; then
    grep "client_max_body_size" /etc/nginx/sites-available/transcode.mostara.id || echo "  Not configured"
else
    echo -e "  ${RED}Config file not found!${NC}"
fi

echo ""

# ================================================================
# 6. API Endpoint Testing
# ================================================================
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "6. API Endpoint Accessibility"
echo -e "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

echo "Testing /api/upload endpoint:"

echo -n "  Direct to Backend: "
HTTP_CODE=$(docker exec hls-backend-prod curl -s -o /dev/null -w "%{http_code}" http://localhost:5000/api/upload 2>/dev/null)
echo "HTTP $HTTP_CODE"

echo -n "  Via Nginx Container: "
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:8089/api/upload 2>/dev/null)
echo "HTTP $HTTP_CODE"

echo -n "  Via Nginx Host (with domain header): "
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -H "Host: transcode.mostara.id" http://127.0.0.1/api/upload 2>/dev/null)
echo "HTTP $HTTP_CODE"

echo ""

# ================================================================
# 7. Logs Analysis
# ================================================================
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "7. Recent Logs (Last 10 lines)"
echo -e "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

echo "Backend Logs:"
docker logs hls-backend-prod --tail=10 2>&1 | sed 's/^/  /'

echo ""
echo "Nginx Container Logs:"
docker logs hls-nginx-prod --tail=10 2>&1 | sed 's/^/  /'

echo ""

# ================================================================
# 8. Frontend Files Check
# ================================================================
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "8. Frontend Files"
echo -e "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

echo "Files in frontend-test:"
docker exec hls-nginx-prod ls -la /usr/share/nginx/html/ 2>/dev/null | sed 's/^/  /' || echo "  Cannot access"

echo ""

# ================================================================
# 9. Summary & Recommendations
# ================================================================
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "SUMMARY & RECOMMENDATIONS"
echo -e "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Check if nginx is unhealthy
if docker ps | grep hls-nginx-prod | grep -q "unhealthy"; then
    echo -e "${RED}⚠ ISSUE: Nginx container is UNHEALTHY${NC}"
    echo "  Reason: Health check endpoint /health not found"
    echo "  Fix: Add /health file to frontend or change health check"
    echo ""
fi

# Check if /health exists
if ! docker exec hls-nginx-prod test -f /usr/share/nginx/html/health 2>/dev/null; then
    echo -e "${YELLOW}⚠ MISSING: /health endpoint in frontend${NC}"
    echo "  This causes nginx container to be unhealthy"
    echo "  Fix: Run: docker exec hls-nginx-prod sh -c 'echo OK > /usr/share/nginx/html/health'"
    echo ""
fi

# Check nginx host config
if [ ! -f /etc/nginx/sites-enabled/transcode.mostara.id ]; then
    echo -e "${RED}⚠ ISSUE: Nginx host config not enabled${NC}"
    echo "  Fix: Run setup-nginx-host.sh script"
    echo ""
fi

# Check if backend is accessible from nginx
if ! docker exec hls-nginx-prod wget -qO- http://backend:5000/health 2>/dev/null | grep -q "OK"; then
    echo -e "${RED}⚠ ISSUE: Backend not accessible from Nginx container${NC}"
    echo "  This will cause upload to fail"
    echo "  Fix: Check docker network connectivity"
    echo ""
fi

echo -e "${GREEN}Diagnostic complete!${NC}"
echo ""
echo "For detailed troubleshooting, review the output above."
echo ""
