#!/bin/bash

# ================================================================
# Test Upload Endpoint with Proper POST Request
# ================================================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}==========================================${NC}"
echo "Testing Upload Endpoint"
echo -e "${BLUE}==========================================${NC}"
echo ""

# ================================================================
# 1. Create Test Video File (small dummy file)
# ================================================================
echo -e "${YELLOW}1. Creating test video file...${NC}"

TEST_FILE="/tmp/test-upload-$(date +%s).mp4"

# Create a tiny test MP4 file (black screen 1 second)
docker exec hls-backend-prod ffmpeg -f lavfi -i color=black:s=320x240:d=1 -f mp4 -y /tmp/test.mp4 2>&1 | grep -E "(Duration|Output|error)" || true

# Copy from container to host
docker cp hls-backend-prod:/tmp/test.mp4 $TEST_FILE 2>/dev/null || {
    # If ffmpeg fails, create a simple file
    echo "Creating dummy file instead..."
    dd if=/dev/zero of=$TEST_FILE bs=1024 count=1 2>/dev/null
}

if [ -f "$TEST_FILE" ]; then
    echo -e "${GREEN}✓ Test file created: $TEST_FILE ($(du -h $TEST_FILE | cut -f1))${NC}"
else
    echo -e "${RED}✗ Failed to create test file${NC}"
    exit 1
fi

echo ""

# ================================================================
# 2. Test Backend Direct
# ================================================================
echo -e "${YELLOW}2. Testing Backend Directly (inside container)...${NC}"

# Copy test file into backend container
docker cp $TEST_FILE hls-backend-prod:/tmp/test-video.mp4

echo -n "POST to backend:5000/api/upload: "
RESPONSE=$(docker exec hls-backend-prod curl -s -X POST \
    -F "video=@/tmp/test-video.mp4" \
    -w "\nHTTP_CODE:%{http_code}" \
    http://localhost:5000/api/upload 2>/dev/null)

HTTP_CODE=$(echo "$RESPONSE" | grep "HTTP_CODE" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | grep -v "HTTP_CODE")

if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "201" ]; then
    echo -e "${GREEN}✓ HTTP $HTTP_CODE${NC}"
    echo "Response: $BODY" | head -3
elif [ "$HTTP_CODE" = "400" ] || [ "$HTTP_CODE" = "413" ] || [ "$HTTP_CODE" = "500" ]; then
    echo -e "${YELLOW}⚠ HTTP $HTTP_CODE (request reached backend)${NC}"
    echo "Response: $BODY" | head -5
else
    echo -e "${RED}✗ HTTP $HTTP_CODE${NC}"
    echo "Response: $BODY" | head -5
fi

echo ""

# ================================================================
# 3. Test via Nginx Container
# ================================================================
echo -e "${YELLOW}3. Testing via Nginx Container (127.0.0.1:8089)...${NC}"

echo -n "POST to nginx:8089/api/upload: "
RESPONSE=$(curl -s -X POST \
    -F "video=@$TEST_FILE" \
    -w "\nHTTP_CODE:%{http_code}" \
    http://127.0.0.1:8089/api/upload 2>/dev/null)

HTTP_CODE=$(echo "$RESPONSE" | grep "HTTP_CODE" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | grep -v "HTTP_CODE")

if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "201" ]; then
    echo -e "${GREEN}✓ HTTP $HTTP_CODE - Upload working!${NC}"
    echo "Response preview:"
    echo "$BODY" | head -10
elif [ "$HTTP_CODE" = "400" ] || [ "$HTTP_CODE" = "413" ] || [ "$HTTP_CODE" = "500" ]; then
    echo -e "${YELLOW}⚠ HTTP $HTTP_CODE (request reached backend but failed)${NC}"
    echo "Response: $BODY" | head -5
elif [ "$HTTP_CODE" = "502" ] || [ "$HTTP_CODE" = "503" ] || [ "$HTTP_CODE" = "504" ]; then
    echo -e "${RED}✗ HTTP $HTTP_CODE - Gateway error (nginx cannot reach backend)${NC}"
    echo "Response: $BODY"
else
    echo -e "${RED}✗ HTTP $HTTP_CODE${NC}"
    echo "Response: $BODY" | head -5
fi

echo ""

# ================================================================
# 4. Test via Nginx Host (with domain header)
# ================================================================
echo -e "${YELLOW}4. Testing via Nginx Host (with domain header)...${NC}"

echo -n "POST to transcode.mostara.id/api/upload: "
RESPONSE=$(curl -s -X POST \
    -H "Host: transcode.mostara.id" \
    -F "video=@$TEST_FILE" \
    -w "\nHTTP_CODE:%{http_code}" \
    http://127.0.0.1/api/upload 2>/dev/null)

HTTP_CODE=$(echo "$RESPONSE" | grep "HTTP_CODE" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | grep -v "HTTP_CODE")

if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "201" ]; then
    echo -e "${GREEN}✓ HTTP $HTTP_CODE - Full path working!${NC}"
    echo "Response preview:"
    echo "$BODY" | head -10
elif [ "$HTTP_CODE" = "400" ] || [ "$HTTP_CODE" = "413" ] || [ "$HTTP_CODE" = "500" ]; then
    echo -e "${YELLOW}⚠ HTTP $HTTP_CODE${NC}"
    echo "Response: $BODY" | head -5
elif [ "$HTTP_CODE" = "000" ]; then
    echo -e "${RED}✗ Connection failed - Nginx host not configured?${NC}"
else
    echo -e "${RED}✗ HTTP $HTTP_CODE${NC}"
    echo "Response: $BODY" | head -5
fi

echo ""

# ================================================================
# 5. Cleanup
# ================================================================
echo -e "${YELLOW}Cleaning up...${NC}"
rm -f $TEST_FILE
docker exec hls-backend-prod rm -f /tmp/test-video.mp4 /tmp/test.mp4 2>/dev/null || true

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}Test complete!${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

echo "Next steps:"
echo "  • If backend direct test works but nginx fails → Check nginx health status"
echo "  • If nginx container test works but host fails → Check nginx host config"
echo "  • If all tests pass → Upload should work from browser"
echo ""
