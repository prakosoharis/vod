# 🎬 HLS Video Transcoder Microservice

Production-ready HLS transcoding service simulating a hybrid cloud architecture with AWS S3 (MinIO), Wasabi (MinIO), and BunnyCDN (Nginx).

## 🏗️ Architecture

```
┌─────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Upload    │────▶│  temp-raw-aws    │────▶│    Backend      │
│   Video     │     │  (Transit S3)    │     │  + FFmpeg       │
└─────────────┘     └──────────────────┘     └────────┬────────┘
                                                       │
                                                       ▼
                    ┌──────────────────┐     ┌─────────────────┐
                    │perm-storage-wasabi│◀────│  HLS Transcode  │
                    │  (Permanent S3)  │     │  Multi-bitrate  │
                    └────────┬─────────┘     └─────────────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │  Nginx (CDN)     │
                    │  Reverse Proxy   │
                    └────────┬─────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │   HLS Player     │
                    │   (Frontend)     │
                    └──────────────────┘
```

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose installed
- At least 4GB RAM available
- 10GB free disk space

### 1. Clone & Setup
```bash
cd services/hls-transcoder
cp .env.example .env
```

### 2. Start Services
```bash
docker-compose up -d
```

### 3. Wait for Services to be Ready
```bash
# Check logs
docker-compose logs -f

# Wait until you see:
# ✅ "HLS Transcoder Service Started"
# ✅ MinIO buckets created
```

### 4. Access Applications
- **Frontend Upload UI**: http://localhost:8080
- **Backend API**: http://localhost:5000
- **MinIO Console**: http://localhost:9001 (admin/password123)

## 📁 Project Structure

```
services/hls-transcoder/
├── docker-compose.yml         # Docker orchestration
├── .env.example              # Environment variables template
├── README.md                 # This file
├── backend/
│   ├── Dockerfile            # Node.js + FFmpeg image
│   ├── package.json          # Dependencies
│   ├── server.js             # Main application logic
│   └── uploads/              # Temporary upload folder (auto-created)
├── nginx/
│   └── nginx.conf            # Reverse proxy configuration
└── frontend-test/
    └── index.html            # Upload & player UI
```

## 🎯 Workflow Logic

### Step-by-Step Process:

1. **Upload**: User uploads video via frontend
2. **Transit Storage**: Raw file saved to `temp-raw-aws` (MinIO)
3. **Download**: Backend downloads from transit to local temp
4. **Transcode**: FFmpeg converts to HLS with multi-bitrate:
   - 1080p @ 5000kbps
   - 720p @ 2800kbps
   - 480p @ 1400kbps
   - 360p @ 800kbps
5. **Permanent Storage**: HLS files uploaded to `perm-storage-wasabi`
6. **Cleanup**: Raw file deleted from transit & local (cost optimization)
7. **Streaming**: Nginx proxies HLS requests to permanent storage

## 🔧 API Endpoints

### Upload Video
```bash
POST /api/upload
Content-Type: multipart/form-data

# Example using curl:
curl -X POST http://localhost:5000/api/upload \
  -F "video=@/path/to/video.mp4"

# Response:
{
  "success": true,
  "message": "Video transcoded and uploaded successfully",
  "data": {
    "videoId": "550e8400-e29b-41d4-a716-446655440000",
    "hlsUrl": "http://localhost:8080/videos/550e8400-e29b-41d4-a716-446655440000/playlist.m3u8",
    "originalFilename": "video.mp4",
    "permanentStorage": "perm-storage-wasabi",
    "cdnUrl": "http://localhost:8080/videos/550e8400-e29b-41d4-a716-446655440000/"
  }
}
```

### Get Video Info
```bash
GET /api/video/:videoId

# Example:
curl http://localhost:5000/api/video/550e8400-e29b-41d4-a716-446655440000
```

### Health Check
```bash
GET /health

# Example:
curl http://localhost:5000/health
```

## 🎥 Supported Video Formats

- **MP4** (H.264/H.265)
- **MOV** (QuickTime)
- **AVI**
- **MKV** (Matroska)
- **WebM**
- **FLV** (Flash Video)
- **WMV** (Windows Media)
- **MPEG**

## 🧪 Testing

### Using Frontend
1. Open http://localhost:8080
2. Drag & drop a video file
3. Click "Start Upload & Transcode"
4. Wait for processing (progress bar shows status)
5. Video will auto-play when ready

### Using curl
```bash
# Upload a video
curl -X POST http://localhost:5000/api/upload \
  -F "video=@test-video.mp4" \
  -o response.json

# Extract HLS URL from response
VIDEO_ID=$(cat response.json | jq -r '.data.videoId')
HLS_URL="http://localhost:8080/videos/$VIDEO_ID/playlist.m3u8"

# Test playback with VLC or ffplay
ffplay "$HLS_URL"
```

## 📊 MinIO Storage Structure

### Transit Bucket (`temp-raw-aws`)
```
temp-raw-aws/
└── {videoId}/
    └── original-filename.mp4  ← DELETED after transcode
```

### Permanent Bucket (`perm-storage-wasabi`)
```
perm-storage-wasabi/
└── {videoId}/
    ├── playlist.m3u8          ← Master playlist
    ├── segment_000.ts
    ├── segment_001.ts
    ├── segment_002.ts
    └── ...
```

## 🛠️ Development

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f nginx
docker-compose logs -f minio
```

### Restart Service
```bash
docker-compose restart backend
```

### Rebuild After Code Changes
```bash
docker-compose up -d --build
```

### Stop Services
```bash
docker-compose down
```

### Stop & Remove Volumes (Reset Everything)
```bash
docker-compose down -v
```

## 🔍 Troubleshooting

### Issue: "Bucket not found"
**Solution**: Wait 30 seconds after startup for buckets to be created automatically.

### Issue: FFmpeg fails
**Solution**: Check video format is supported. View logs: `docker-compose logs backend`

### Issue: CORS error on player
**Solution**: Ensure Nginx is running: `docker-compose ps nginx`

### Issue: Out of disk space
**Solution**: Clean up old videos from MinIO console or increase Docker disk limit.

### Issue: Slow transcoding
**Solution**: Increase Docker resources (CPU/RAM) in Docker Desktop settings.

## 📈 Performance

- **Transcoding Speed**: ~1-2x realtime (depends on CPU)
- **Upload Limit**: 5GB per file
- **Concurrent Jobs**: Recommended 1-2 (limited by FFmpeg CPU usage)
- **HLS Segment Size**: 6 seconds
- **Bitrate Adaptation**: Automatic client-side selection

## 🔐 Security Notes

### For Production:
1. Change MinIO credentials in `.env`
2. Use HTTPS with SSL certificates
3. Add authentication to upload endpoint
4. Implement rate limiting
5. Enable MinIO bucket policies
6. Use secrets management (Docker secrets, Vault)

## 🚀 Integration with Existing VOD App

### Option 1: API Integration
```javascript
// From your existing backend (Node.js)
const axios = require('axios');

async function uploadToTranscoder(videoFile) {
  const formData = new FormData();
  formData.append('video', videoFile);

  const response = await axios.post(
    'http://localhost:5000/api/upload',
    formData
  );

  return response.data.data.hlsUrl;
}
```

### Option 2: Database Integration
Store the returned `videoId` and `hlsUrl` in your database:

```sql
CREATE TABLE videos (
  id UUID PRIMARY KEY,
  title VARCHAR(255),
  hls_url TEXT,
  video_id UUID,
  created_at TIMESTAMP
);

INSERT INTO videos (id, title, hls_url, video_id)
VALUES (uuid_generate_v4(), 'My Video', 'http://...', '550e8400-...');
```

### Option 3: Frontend Integration
Update your video player to use HLS URLs:

```javascript
// React/Next.js example
import Hls from 'hls.js';

function VideoPlayer({ hlsUrl }) {
  useEffect(() => {
    const video = videoRef.current;
    if (Hls.isSupported()) {
      const hls = new Hls();
      hls.loadSource(hlsUrl);
      hls.attachMedia(video);
    }
  }, [hlsUrl]);

  return <video ref={videoRef} controls />;
}
```

## 📚 Tech Stack

- **Backend**: Node.js 18 (Express)
- **Transcoder**: FFmpeg 6.x
- **Storage**: MinIO (S3-compatible)
- **CDN**: Nginx (Alpine)
- **Frontend**: Vanilla JS + HLS.js
- **Container**: Docker Compose

## 📝 License

MIT License - Free to use in your VOD platform

## 👨‍💻 Support

For issues or questions:
1. Check logs: `docker-compose logs -f`
2. Verify all services running: `docker-compose ps`
3. Test health endpoint: `curl http://localhost:5000/health`

---

**Built with ❤️ for your VOD Platform**
