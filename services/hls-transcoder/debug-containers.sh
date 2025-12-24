#!/bin/bash

# ================================================================
# Debug Container Issues - Run this to diagnose problems
# ================================================================

echo "=========================================="
echo "HLS Transcoder - Container Debug"
echo "=========================================="
echo ""

# Check all containers (including stopped)
echo "All containers (including stopped):"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
docker-compose -f docker-compose.prod.yml --env-file .env.production ps -a

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "MinIO Logs:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
docker-compose -f docker-compose.prod.yml --env-file .env.production logs --tail=20 minio

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Backend Logs:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
docker-compose -f docker-compose.prod.yml --env-file .env.production logs --tail=20 backend

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Nginx Logs:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
docker-compose -f docker-compose.prod.yml --env-file .env.production logs --tail=50 nginx

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Testing Connectivity:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Test backend health from nginx container perspective
echo "Testing backend health from host:"
curl -s http://127.0.0.1:5000/health 2>/dev/null && echo " ✓" || echo " ✗ Failed"

echo ""
echo "Testing MinIO health from host:"
curl -s http://127.0.0.1:9000/minio/health/live 2>/dev/null && echo " ✓" || echo " ✗ Failed"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Inspect Nginx Container (if exists):"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if docker ps -a | grep -q hls-nginx-prod; then
    echo "Container exists. Checking details..."
    docker inspect hls-nginx-prod | grep -A5 "Health"
    echo ""
    echo "Container State:"
    docker inspect hls-nginx-prod | grep -A10 "State"
else
    echo "Nginx container does not exist"
fi

echo ""
echo "=========================================="
echo "Debug Info Collection Complete"
echo "=========================================="
echo ""
