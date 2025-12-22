# 🚀 Quick Start Guide - 3 Minutes to Running

## ⚡ Option 1: Automated Start (Recommended)

### Windows:
```bash
cd services/hls-transcoder
start.bat
```

### Linux/Mac:
```bash
cd services/hls-transcoder
chmod +x start.sh
./start.sh
```

## ⚡ Option 2: Manual Start

```bash
cd services/hls-transcoder

# Copy environment file
cp .env.example .env

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f
```

## ✅ Verify Setup (30 seconds)

### 1. Check Services are Running:
```bash
docker-compose ps
```

**Expected output:**
```
NAME            STATUS    PORTS
hls-backend     Up        0.0.0.0:5000->5000/tcp
hls-minio       Up        0.0.0.0:9000-9001->9000-9001/tcp
hls-nginx       Up        0.0.0.0:8080->80/tcp
```

### 2. Test Health Endpoints:
```bash
# Backend health
curl http://localhost:5000/health

# Nginx health
curl http://localhost:8080/health
```

### 3. Open Frontend:
Open browser: **http://localhost:8080**

You should see the upload page! 🎉

## 🎬 First Upload Test

### Method 1: Using Frontend (Easiest)
1. Open http://localhost:8080
2. Drag & drop any video file (MP4, MOV, etc.)
3. Click "Start Upload & Transcode"
4. Wait for processing (~1-2 minutes for a 100MB file)
5. Video will auto-play when ready!

### Method 2: Using curl
```bash
# Upload a test video
curl -X POST http://localhost:5000/api/upload \
  -F "video=@/path/to/your/video.mp4" \
  | jq

# You'll get a response like:
{
  "success": true,
  "data": {
    "videoId": "abc-123-def",
    "hlsUrl": "http://localhost:8080/videos/abc-123-def/playlist.m3u8"
  }
}
```

### Method 3: Test with Sample Video
```bash
# Download a sample video (Big Buck Bunny - 60MB)
curl -o sample.mp4 http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4

# Upload it
curl -X POST http://localhost:5000/api/upload \
  -F "video=@sample.mp4" \
  -o response.json

# Play with VLC or ffplay
VIDEO_ID=$(cat response.json | jq -r '.data.videoId')
ffplay "http://localhost:8080/videos/$VIDEO_ID/playlist.m3u8"
```

## 📊 Access MinIO Storage (Optional)

1. Open **http://localhost:9001**
2. Login:
   - Username: `admin`
   - Password: `password123`
3. Browse buckets:
   - `temp-raw-aws` (should be empty - raw files auto-deleted)
   - `perm-storage-wasabi` (contains your HLS videos)

## 🛑 Stop Services

```bash
# Stop but keep data
docker-compose down

# Stop and delete all data (reset)
docker-compose down -v
```

## 🔧 Troubleshooting

### "Port already in use"
```bash
# Check what's using the port
netstat -ano | findstr :8080  # Windows
lsof -i :8080                 # Linux/Mac

# Change port in docker-compose.yml if needed
```

### "FFmpeg failed"
- Check video format is supported
- View logs: `docker-compose logs backend`
- Ensure enough disk space (10GB+)

### "Cannot connect to Docker daemon"
- Start Docker Desktop
- Wait until Docker icon shows "Running"
- Try again

## 📈 Expected Processing Times

| Video Size | Duration | Transcode Time | Output Size |
|-----------|----------|----------------|-------------|
| 100 MB    | 5 min    | ~3-5 min       | ~120 MB     |
| 500 MB    | 30 min   | ~15-20 min     | ~600 MB     |
| 1 GB      | 60 min   | ~30-40 min     | ~1.2 GB     |

*Times vary based on CPU performance*

## 🎯 What Happens During Upload?

1. **Upload** (10%) - File sent to backend
2. **Transit** (20%) - Saved to temp-raw-aws bucket
3. **Download** (30%) - Retrieved to local temp
4. **Transcode** (50-80%) - FFmpeg creates HLS variants:
   - 1080p, 720p, 480p, 360p
5. **Upload HLS** (90%) - Files to perm-storage-wasabi
6. **Cleanup** (95%) - Delete temp files
7. **Done** (100%) - Ready to stream!

## ✨ Next Steps

### Integrate with Your VOD App:
1. Read `README.md` for integration examples
2. Use API endpoint: `POST http://localhost:5000/api/upload`
3. Store returned `videoId` and `hlsUrl` in your database
4. Update your video player to use HLS URLs

### Production Deployment:
1. Change MinIO credentials in `.env`
2. Set up HTTPS with SSL certificates
3. Add authentication to upload endpoint
4. Configure rate limiting
5. Deploy to cloud (AWS, GCP, Azure)

---

**🎉 Congratulations! Your HLS Transcoder is Ready!**

Need help? Check `README.md` for full documentation.
