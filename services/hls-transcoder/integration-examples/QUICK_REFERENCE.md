# ⚡ Quick Reference - Copy & Paste Commands

## 🚀 First Time Setup

```bash
# 1. Start HLS Transcoder
cd services/hls-transcoder
cp .env.example .env
docker-compose up -d

# 2. Wait 30 seconds, then verify
docker-compose ps
curl http://localhost:5000/health

# 3. Install backend dependencies
cd ../../apps/backend
npm install axios form-data fs-extra

# 4. Copy integration files
cp ../../services/hls-transcoder/integration-examples/transcoder.service.ts src/services/
cp ../../services/hls-transcoder/integration-examples/content.route.ts src/routes/

# 5. Update database
npx prisma migrate dev --name add_hls_fields

# 6. Install frontend dependencies
cd ../web
npm install hls.js

# 7. Copy player component
cp ../../services/hls-transcoder/integration-examples/VideoPlayer.tsx src/components/video/HLSPlayer.tsx
```

---

## 📤 Upload Video (Backend)

```typescript
// In your upload handler
import { transcoderService } from '../services/transcoder.service';

const result = await transcoderService.transcodeVideo(
  req.file.path,
  req.file.originalname
);

// result = { videoId, hlsUrl, cdnUrl, ... }
```

---

## 🎥 Play Video (Frontend)

```tsx
import HLSPlayer from '@/components/video/HLSPlayer';

<HLSPlayer
  hlsUrl="http://localhost:8080/videos/abc-123/playlist.m3u8"
  poster="/poster.jpg"
  autoPlay={false}
  controls={true}
/>
```

---

## 🧪 Test Commands

```bash
# Upload test video
curl -X POST http://localhost:5000/api/upload \
  -F "video=@test.mp4" | jq

# Check transcoding status
curl http://localhost:3000/api/content/123/transcoding-status

# Play with VLC
vlc "http://localhost:8080/videos/abc-123/playlist.m3u8"
```

---

## 📊 Database Queries

```sql
-- Add HLS fields to existing table
ALTER TABLE content
ADD COLUMN hls_video_id UUID,
ADD COLUMN hls_url TEXT,
ADD COLUMN transcoding_status VARCHAR(50) DEFAULT 'pending';

-- Check status
SELECT id, title, transcoding_status FROM content;

-- Find completed transcodings
SELECT * FROM content WHERE transcoding_status = 'completed';
```

---

## 🐛 Troubleshooting

```bash
# View logs
docker-compose -f services/hls-transcoder/docker-compose.yml logs -f

# Restart service
docker-compose restart backend

# Check disk space
docker system df

# Clean up
docker system prune -a
```

---

## 🔧 Environment Variables

```bash
# Add to apps/backend/.env
TRANSCODER_URL=http://localhost:5000
HLS_CDN_URL=http://localhost:8080
```

---

## 📱 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/upload` | Upload & transcode video |
| GET | `/api/video/:id` | Get video info |
| GET | `/health` | Health check |
| GET | `/api/content/:id/transcoding-status` | Check status |
| POST | `/api/content/:id/retry-transcoding` | Retry failed |

---

## 🎯 Common Tasks

### Update existing content with HLS

```typescript
await prisma.content.update({
  where: { id: contentId },
  data: {
    hls_video_id: result.videoId,
    hls_url: result.hlsUrl,
    hls_cdn_url: result.cdnUrl,
    transcoding_status: 'completed',
    transcoded_at: new Date()
  }
});
```

### Handle transcoding errors

```typescript
try {
  const result = await transcoderService.transcodeVideo(filePath);
} catch (error) {
  await prisma.content.update({
    where: { id: contentId },
    data: { transcoding_status: 'failed' }
  });
}
```

### Poll transcoding status

```typescript
const pollStatus = async (contentId) => {
  const response = await fetch(`/api/content/${contentId}/transcoding-status`);
  const data = await response.json();

  if (data.data.transcoding_status === 'completed') {
    console.log('Done!', data.data.hls_url);
  } else {
    setTimeout(() => pollStatus(contentId), 5000);
  }
};
```

---

## 🚀 Production Checklist

- [ ] Change MinIO credentials
- [ ] Setup SSL/HTTPS
- [ ] Configure CDN (BunnyCDN/CloudFront)
- [ ] Add authentication to upload
- [ ] Enable rate limiting
- [ ] Setup monitoring (Sentry, DataDog)
- [ ] Configure backups
- [ ] Test failover scenarios

---

**Copy this file for quick access during development!**
