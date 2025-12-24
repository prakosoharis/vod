# 🚀 HLS Transcoder - Production Deployment Guide

Quick guide for deploying HLS Transcoder to production server with **auto-fix** capabilities.

---

## ✨ What's New

`deploy-prod.sh` now includes **automatic configuration fixing**:
- ✅ Auto-detects invalid Docker build targets
- ✅ Creates backups before making changes
- ✅ Fixes common configuration issues automatically
- ✅ No manual intervention needed!

---

## 📋 Prerequisites

Before deployment, ensure you have:

```
☑️ Server with Docker & Docker Compose installed
☑️ Nginx installed on host server
☑️ DNS records configured (transcode.mostara.id, minio.mostara.id)
☑️ Cloudflare proxy enabled for SSL/DDoS protection
```

---

## 🎯 Deployment Steps (Opsi 1: Via Git - Recommended)

### Step 1: Update Code on Server

```bash
# SSH to your server
ssh root@YOUR_SERVER_IP

# Navigate to project directory
cd /var/www/vod/services/hls-transcoder

# Pull latest changes
git pull origin main

# Ensure scripts are executable
chmod +x deploy-prod.sh deploy-local.sh stop.sh
```

### Step 2: Create/Update Production Environment

```bash
# If .env.production doesn't exist, create it
cp .env.production.example .env.production

# Edit with your secure credentials
nano .env.production
```

**Required updates in `.env.production`:**
```bash
# CRITICAL: Use strong passwords (minimum 20 characters)
MINIO_ROOT_USER=admin_mostara_prod_2025
MINIO_ROOT_PASSWORD=YourSuperStrongP@ssw0rd!2025
MINIO_ACCESS_KEY=admin_mostara_prod_2025
MINIO_SECRET_KEY=YourSuperStrongP@ssw0rd!2025

# Update domain
CDN_BASE_URL=https://transcode.mostara.id
```

**Save:** Press `Ctrl+O`, `Enter`, then `Ctrl+X`

### Step 3: Configure Nginx on Host

```bash
# Copy nginx configs
sudo cp nginx-configs/transcode.mostara.id /etc/nginx/sites-available/
sudo cp nginx-configs/minio.mostara.id /etc/nginx/sites-available/

# Enable sites
sudo ln -s /etc/nginx/sites-available/transcode.mostara.id /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/minio.mostara.id /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

### Step 4: Deploy!

```bash
# Run deployment script (it will auto-fix any issues)
./deploy-prod.sh
```

The script will:
1. ✅ Check Docker installation
2. ✅ Auto-fix configuration issues (if any)
3. ✅ Validate `.env.production` credentials
4. ✅ Ask for confirmation
5. ✅ Pull images
6. ✅ Stop old containers
7. ✅ Build & start new containers
8. ✅ Run health checks
9. ✅ Show deployment status

### Step 5: Verify Deployment

```bash
# Check containers are running
docker-compose -f docker-compose.prod.yml --env-file .env.production ps

# Test public access
curl https://transcode.mostara.id/health
curl -I https://minio.mostara.id

# View logs
docker-compose -f docker-compose.prod.yml --env-file .env.production logs -f
```

---

## 🔧 What the Auto-Fix Does

When you run `./deploy-prod.sh`, it automatically:

1. **Checks for invalid build targets** in `docker-compose.prod.yml`
2. **Creates timestamped backup** (e.g., `docker-compose.prod.yml.backup.20251225_143022`)
3. **Removes problematic lines** (like `target: production` or `target: development`)
4. **Continues with deployment** seamlessly

Example output:
```bash
==========================================
HLS Transcoder - Production Deployment
==========================================

✓ Docker is running

Checking configuration...
⚠ Found invalid build target in docker-compose.prod.yml
Auto-fixing configuration issues...
  ✓ Backup created: docker-compose.prod.yml.backup.20251225_143022
  ✓ Removed invalid build target from docker-compose.prod.yml
✓ Configuration auto-fixed

Validating production credentials...
✓ Credentials validated
```

---

## 🛠️ Useful Commands

### View Logs
```bash
# All services
docker-compose -f docker-compose.prod.yml --env-file .env.production logs -f

# Specific service
docker-compose -f docker-compose.prod.yml --env-file .env.production logs -f backend
docker-compose -f docker-compose.prod.yml --env-file .env.production logs -f minio
```

### Restart Services
```bash
# All services
docker-compose -f docker-compose.prod.yml --env-file .env.production restart

# Specific service
docker-compose -f docker-compose.prod.yml --env-file .env.production restart backend
```

### Stop Services
```bash
docker-compose -f docker-compose.prod.yml --env-file .env.production down
```

### Check Status
```bash
docker-compose -f docker-compose.prod.yml --env-file .env.production ps
```

### Update Deployment
```bash
# Pull latest code
git pull

# Redeploy (script will auto-fix if needed)
./deploy-prod.sh
```

---

## 🔍 Troubleshooting

### Issue: Environment variables not loaded

**Solution:** The script now automatically uses `--env-file .env.production` for all commands.

### Issue: Build fails with "target stage could not be found"

**Solution:** The script auto-fixes this! It removes invalid `target:` lines from docker-compose.prod.yml.

### Issue: Can't access via domain

```bash
# Check Nginx on host
sudo systemctl status nginx
sudo nginx -t

# Check DNS
nslookup transcode.mostara.id

# Check containers are running
docker-compose -f docker-compose.prod.yml --env-file .env.production ps

# Test localhost access (should work)
curl http://127.0.0.1:8089/health
```

### Issue: 502 Bad Gateway

```bash
# Check container logs
docker-compose -f docker-compose.prod.yml --env-file .env.production logs nginx
docker-compose -f docker-compose.prod.yml --env-file .env.production logs backend

# Verify ports are listening
netstat -tlnp | grep -E '8089|9000|9001'

# Check Nginx host error logs
sudo tail -f /var/log/nginx/transcode.mostara.id.error.log
```

---

## 🔒 Security Checklist

After deployment, verify:

```
☑️ Changed default MinIO credentials in .env.production
☑️ .env.production is NOT committed to git
☑️ Ports 8089, 9000, 9001 only bind to 127.0.0.1 (localhost)
☑️ Firewall allows only 80/443 from internet
☑️ Cloudflare proxy is enabled (orange cloud in DNS)
☑️ Can access https://transcode.mostara.id (public)
☑️ Cannot access http://SERVER_IP:8089 (should fail - good!)
☑️ Nginx host reverse proxy is working
☑️ SSL certificate is valid (Cloudflare handles this)
```

---

## 📊 Architecture

```
Internet
  ↓
Cloudflare (SSL + DDoS + CDN)
  ↓
Your Server (161.97.65.21)
  ↓
Nginx Host (:80/:443)
  ├─ transcode.mostara.id → 127.0.0.1:8089
  └─ minio.mostara.id → 127.0.0.1:9001
       ↓
Docker Network (Internal)
  ├─ hls-nginx:80 (port 8089 on host)
  ├─ hls-backend:5000 (internal only)
  └─ hls-minio:9000/9001 (9001 on host)
```

---

## 📞 Need Help?

- Check logs: `docker-compose -f docker-compose.prod.yml --env-file .env.production logs -f`
- Verify Nginx: `sudo nginx -t && sudo systemctl status nginx`
- Check DNS: `nslookup transcode.mostara.id`
- Test localhost: `curl http://127.0.0.1:8089/health`

---

## ✅ Post-Deployment Checklist

```
☑️ Containers are running (docker-compose ps shows "Up")
☑️ Health checks passing (MinIO, Nginx, Backend)
☑️ Public access works: https://transcode.mostara.id/health returns 200
☑️ MinIO Console accessible: https://minio.mostara.id
☑️ Can upload test video
☑️ Video transcoding works
☑️ Streaming works: /videos/{id}/master.m3u8
☑️ Logs directory created and writable
☑️ Monitoring setup (optional but recommended)
☑️ Backup strategy configured
```

---

**Last Updated:** 2025-12-25
**Version:** 2.0.0 (with auto-fix)
**Status:** Production Ready ✅
