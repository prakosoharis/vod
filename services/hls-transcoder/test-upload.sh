#!/bin/bash

echo "========================================"
echo "HLS Transcoder - Integration Test"
echo "========================================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if services are running
echo "[1/5] Checking if services are running..."
if ! docker-compose ps | grep -q "Up"; then
    echo -e "${RED}[ERROR] Services are not running!${NC}"
    echo "Please run: docker-compose up -d"
    exit 1
fi
echo -e "${GREEN}✓ Services are running${NC}"
echo ""

# Test backend health
echo "[2/5] Testing backend health..."
HEALTH=$(curl -s http://localhost:5000/health)
if echo "$HEALTH" | grep -q "healthy"; then
    echo -e "${GREEN}✓ Backend is healthy${NC}"
else
    echo -e "${RED}✗ Backend health check failed${NC}"
    exit 1
fi
echo ""

# Test nginx
echo "[3/5] Testing Nginx..."
NGINX_HEALTH=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/health)
if [ "$NGINX_HEALTH" = "200" ]; then
    echo -e "${GREEN}✓ Nginx is responding${NC}"
else
    echo -e "${RED}✗ Nginx health check failed${NC}"
    exit 1
fi
echo ""

# Download sample video if not exists
echo "[4/5] Preparing test video..."
if [ ! -f "test-video.mp4" ]; then
    echo "Downloading sample video (Big Buck Bunny - 60MB)..."
    curl -L -o test-video.mp4 \
        "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" \
        2>&1 | grep -o '[0-9]\+%' | tail -1
    echo -e "${GREEN}✓ Sample video downloaded${NC}"
else
    echo -e "${GREEN}✓ Test video already exists${NC}"
fi
echo ""

# Upload test
echo "[5/5] Uploading and transcoding video..."
echo -e "${YELLOW}This may take 3-5 minutes...${NC}"
echo ""

RESPONSE=$(curl -s -X POST http://localhost:5000/api/upload \
    -F "video=@test-video.mp4")

# Check if upload succeeded
if echo "$RESPONSE" | grep -q '"success":true'; then
    echo -e "${GREEN}✓ Upload successful!${NC}"
    echo ""

    # Extract video info
    VIDEO_ID=$(echo "$RESPONSE" | grep -o '"videoId":"[^"]*"' | cut -d'"' -f4)
    HLS_URL=$(echo "$RESPONSE" | grep -o '"hlsUrl":"[^"]*"' | cut -d'"' -f4)

    echo "========================================"
    echo "SUCCESS! Video processed successfully"
    echo "========================================"
    echo ""
    echo "Video ID: $VIDEO_ID"
    echo "HLS URL:  $HLS_URL"
    echo ""
    echo "You can now:"
    echo "  1. Open http://localhost:8080 and upload more videos"
    echo "  2. Play the video with: ffplay '$HLS_URL'"
    echo "  3. Check MinIO console: http://localhost:9001"
    echo ""
    echo "Full response saved to: test-response.json"
    echo "$RESPONSE" | jq '.' > test-response.json 2>/dev/null || echo "$RESPONSE" > test-response.json

else
    echo -e "${RED}✗ Upload failed${NC}"
    echo ""
    echo "Error response:"
    echo "$RESPONSE"
    exit 1
fi

echo "========================================"
echo -e "${GREEN}All tests passed! 🎉${NC}"
echo "========================================"
