#!/bin/bash

# ================================================================
# Domain Diagnostics Script
# ================================================================

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo "=========================================="
echo "Domain Diagnostics"
echo "=========================================="
echo ""

# Get server IP
SERVER_IP=$(curl -s ifconfig.me || curl -s icanhazip.com)
echo "Server IP: $SERVER_IP"
echo ""

# Test DNS resolution
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "DNS Resolution Test"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

for domain in transcode.mostara.id minio.mostara.id mostara.id; do
    echo -n "  $domain: "
    RESOLVED_IP=$(dig +short $domain @8.8.8.8 | tail -1)
    if [ -z "$RESOLVED_IP" ]; then
        echo -e "${RED}Not resolved${NC}"
    else
        echo -e "${GREEN}$RESOLVED_IP${NC}"
        if [ "$RESOLVED_IP" == "$SERVER_IP" ]; then
            echo "    ✓ Points to this server"
        else
            echo -e "    ${YELLOW}⚠ Does NOT point to this server (expected: $SERVER_IP)${NC}"
        fi
    fi
done

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Test Access via IP (bypassing DNS)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

echo -n "  http://$SERVER_IP (Host: transcode.mostara.id): "
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -H "Host: transcode.mostara.id" http://$SERVER_IP/health)
if [ "$HTTP_CODE" == "200" ]; then
    echo -e "${GREEN}$HTTP_CODE OK${NC}"
else
    echo -e "${RED}$HTTP_CODE Failed${NC}"
fi

echo -n "  http://$SERVER_IP (Host: minio.mostara.id): "
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -H "Host: minio.mostara.id" http://$SERVER_IP/)
if [ "$HTTP_CODE" == "200" ]; then
    echo -e "${GREEN}$HTTP_CODE OK${NC}"
else
    echo -e "${YELLOW}$HTTP_CODE (might need auth)${NC}"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Nginx Virtual Host Test"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

echo "Checking which domains Nginx is configured for:"
grep -h "server_name" /etc/nginx/sites-enabled/* 2>/dev/null | grep -v "#" | sort -u

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Firewall Status"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if command -v ufw &> /dev/null; then
    ufw status | grep -E "80|443"
else
    echo "UFW not installed, checking iptables..."
    iptables -L -n | grep -E ":80|:443" || echo "No firewall rules for port 80/443"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Listening Ports"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

netstat -tlnp | grep -E ":80 |:443 " || ss -tlnp | grep -E ":80 |:443 "

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Recent Nginx Access Logs"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

echo "Last 5 requests to transcode.mostara.id:"
tail -5 /var/log/nginx/transcode.mostara.id.access.log 2>/dev/null || echo "  (no logs yet)"

echo ""
echo "Last 5 requests to minio.mostara.id:"
tail -5 /var/log/nginx/minio.mostara.id.access.log 2>/dev/null || echo "  (no logs yet)"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Nginx Error Logs (last 10 lines)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

tail -10 /var/log/nginx/transcode.mostara.id.error.log 2>/dev/null || echo "  (no error logs)"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Test from External DNS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

echo "Testing transcode.mostara.id from external resolver:"
nslookup transcode.mostara.id 8.8.8.8 || dig transcode.mostara.id @8.8.8.8

echo ""
echo -e "${YELLOW}════════════════════════════════════════${NC}"
echo -e "${YELLOW}Recommendations:${NC}"
echo -e "${YELLOW}════════════════════════════════════════${NC}"
echo ""
echo "1. If DNS shows Cloudflare IPs:"
echo "   • Check Cloudflare SSL/TLS mode (should be 'Full' or 'Flexible')"
echo "   • Ensure proxy is enabled (orange cloud)"
echo "   • Wait for DNS propagation (can take 5-30 minutes)"
echo ""
echo "2. If DNS doesn't point to this server:"
echo "   • Update DNS A records in Cloudflare/DNS provider"
echo "   • Point transcode.mostara.id to $SERVER_IP"
echo "   • Point minio.mostara.id to $SERVER_IP"
echo ""
echo "3. If access via IP works but domain doesn't:"
echo "   • Issue is DNS/Cloudflare, not server configuration"
echo "   • Check Cloudflare dashboard for SSL errors"
echo ""
echo "4. Test from your local machine:"
echo "   curl -v http://transcode.mostara.id/health"
echo "   # Check if it connects to Cloudflare or times out"
echo ""
