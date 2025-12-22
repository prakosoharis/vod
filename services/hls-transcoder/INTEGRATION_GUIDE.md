# 🔗 Integration Guide - Connect HLS Transcoder to Your VOD App

This guide will walk you through integrating the HLS Transcoder microservice into your existing VOD application step-by-step.

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Backend Integration](#backend-integration)
3. [Database Setup](#database-setup)
4. [Frontend Integration](#frontend-integration)
5. [Testing Integration](#testing-integration)
6. [Production Deployment](#production-deployment)

---

## ✅ Prerequisites

Before starting, ensure:
- [x] HLS Transcoder service is running (`docker-compose up -d`)
- [x] Your VOD app backend is Node.js/TypeScript
- [x] You're using Prisma ORM (or PostgreSQL directly)
- [x] Frontend is React/Next.js

---

## 🔧 Backend Integration

### Step 1: Install Dependencies

```bash
cd apps/backend

# Install required packages
npm install axios form-data fs-extra
npm install --save-dev @types/form-data
```

### Step 2: Add Service File

Copy the transcoder service to your backend:

```bash
# From project root
cp services/hls-transcoder/integration-examples/transcoder.service.ts \
   apps/backend/src/services/transcoder.service.ts
```

### Step 3: Update Environment Variables

Add to `apps/backend/.env`:

```bash
# HLS Transcoder Service
TRANSCODER_URL=http://localhost:5000
APP_URL=http://localhost:3000
HLS_CDN_URL=http://localhost:8080
```

### Step 4: Create/Update Content Route

**Option A: New Route (Recommended)**

```bash
cp services/hls-transcoder/integration-examples/content.route.ts \
   apps/backend/src/routes/content.route.ts
```

Then register in `apps/backend/src/app.ts`:

```typescript
import contentRoutes from './routes/content.route';

app.use('/api/content', contentRoutes);
```

**Option B: Update Existing Upload Route**

Add to your existing upload handler:

```typescript
import { transcoderService } from '../services/transcoder.service';

// In your upload handler:
router.post('/upload', upload.single('video'), async (req, res) => {
  // ... your existing code ...

  // Add transcoding
  try {
    const result = await transcoderService.transcodeVideo(
      req.file.path,
      req.file.originalname
    );

    // Update content record
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

    res.json({ success: true, data: result });
  } catch (error) {
    // Handle error
  }
});
```

---

## 🗄️ Database Setup

### Step 1: Update Prisma Schema

Add to `apps/backend/prisma/schema.prisma`:

```prisma
model Content {
  id                  Int       @id @default(autoincrement())
  title               String
  description         String?
  thumbnail_url       String?
  video_url           String?   // Legacy direct video URL

  // HLS Fields (NEW)
  hls_video_id        String?   @db.Uuid
  hls_url             String?
  hls_cdn_url         String?
  transcoding_status  String?   @default("pending")
  transcoded_at       DateTime?

  created_at          DateTime  @default(now())
  updated_at          DateTime  @updatedAt

  @@index([hls_video_id])
  @@index([transcoding_status])
  @@map("content")
}
```

### Step 2: Create Migration

```bash
cd apps/backend

# Generate migration
npx prisma migrate dev --name add_hls_fields

# Apply migration
npx prisma migrate deploy

# Generate Prisma Client
npx prisma generate
```

### Alternative: Direct SQL (if not using Prisma)

```bash
# Run SQL migration
psql -U your_user -d your_database -f services/hls-transcoder/integration-examples/prisma-migration.sql
```

---

## 🎨 Frontend Integration

### Step 1: Install HLS.js

```bash
cd apps/web

npm install hls.js
npm install --save-dev @types/hls.js
```

### Step 2: Add HLS Player Component

```bash
cp services/hls-transcoder/integration-examples/VideoPlayer.tsx \
   apps/web/src/components/video/HLSPlayer.tsx
```

### Step 3: Update Video Player Page

Replace your existing player in `apps/web/src/pages/VideoPlayerPage.tsx`:

```typescript
import HLSPlayer from '@/components/video/HLSPlayer';

const VideoPlayerPage = () => {
  const { id } = useParams();
  const [content, setContent] = useState(null);

  useEffect(() => {
    // Fetch content
    fetch(`/api/content/${id}`)
      .then(res => res.json())
      .then(data => setContent(data));
  }, [id]);

  if (!content) return <LoadingSpinner />;

  return (
    <div className="video-player-page">
      <h1>{content.title}</h1>

      {/* Use HLS Player instead of regular video tag */}
      {content.hls_url ? (
        <HLSPlayer
          hlsUrl={content.hls_url}
          poster={content.thumbnail_url}
          autoPlay={false}
          controls={true}
        />
      ) : content.video_url ? (
        {/* Fallback to direct video URL */}
        <video src={content.video_url} controls />
      ) : (
        <p>Video not available</p>
      )}

      <p>{content.description}</p>
    </div>
  );
};
```

### Step 4: Update Upload Form (Optional)

If you have an admin upload form:

```typescript
const handleUpload = async (file: File) => {
  const formData = new FormData();
  formData.append('video', file);
  formData.append('title', title);
  formData.append('description', description);

  // Show uploading state
  setStatus('Uploading...');

  const response = await fetch('/api/content/upload-with-transcoding', {
    method: 'POST',
    body: formData
  });

  const result = await response.json();

  if (result.success) {
    setStatus('Transcoding in progress...');

    // Poll for status
    const contentId = result.data.contentId;
    const interval = setInterval(async () => {
      const statusRes = await fetch(`/api/content/${contentId}/transcoding-status`);
      const statusData = await statusRes.json();

      if (statusData.data.transcoding_status === 'completed') {
        setStatus('Transcoding completed!');
        clearInterval(interval);
      } else if (statusData.data.transcoding_status === 'failed') {
        setStatus('Transcoding failed!');
        clearInterval(interval);
      }
    }, 5000); // Poll every 5 seconds
  }
};
```

---

## 🧪 Testing Integration

### Test 1: Upload Video via API

```bash
# Upload a test video
curl -X POST http://localhost:3000/api/content/upload-with-transcoding \
  -F "video=@test-video.mp4" \
  -F "title=Test Movie" \
  -F "description=Testing HLS transcoding"

# Response:
{
  "success": true,
  "message": "Video upload received. Transcoding in progress...",
  "data": {
    "contentId": 123,
    "title": "Test Movie",
    "status": "processing"
  }
}
```

### Test 2: Check Transcoding Status

```bash
# Wait 2-3 minutes, then check status
curl http://localhost:3000/api/content/123/transcoding-status

# Response when completed:
{
  "success": true,
  "data": {
    "id": 123,
    "title": "Test Movie",
    "transcoding_status": "completed",
    "hls_url": "http://localhost:8080/videos/abc-123/playlist.m3u8",
    "transcoded_at": "2025-12-19T10:30:00Z"
  }
}
```

### Test 3: Play Video in Frontend

1. Navigate to: `http://localhost:3000/watch/123`
2. Video should load with adaptive quality
3. Check browser console for HLS logs
4. Try switching quality manually (if quality selector is visible)

### Test 4: Verify MinIO Storage

1. Open MinIO Console: http://localhost:9001
2. Login: admin / password123
3. Check buckets:
   - `temp-raw-aws` should be **empty** (raw files deleted)
   - `perm-storage-wasabi` should contain folder `abc-123/` with:
     - `playlist.m3u8`
     - `segment_000.ts`, `segment_001.ts`, etc.

---

## 🚀 Production Deployment

### Step 1: Update Environment Variables

**Backend (.env.production):**
```bash
TRANSCODER_URL=http://transcoder-service:5000  # Internal network
HLS_CDN_URL=https://cdn.yourdomain.com
APP_URL=https://app.yourdomain.com
```

**Frontend (.env.production):**
```bash
NEXT_PUBLIC_CDN_URL=https://cdn.yourdomain.com
```

### Step 2: Deploy Transcoder Service

**Option A: Docker Compose (Single Server)**

```bash
cd services/hls-transcoder

# Update MinIO credentials in .env
MINIO_ROOT_USER=your_secure_user
MINIO_ROOT_PASSWORD=your_secure_password_123

# Deploy
docker-compose -f docker-compose.yml up -d
```

**Option B: Kubernetes (Scalable)**

```bash
# Build images
docker build -t your-registry/hls-backend:latest ./backend
docker push your-registry/hls-backend:latest

# Deploy to K8s
kubectl apply -f k8s/transcoder-deployment.yaml
```

**Option C: Cloud Services**

- **MinIO** → AWS S3 or Wasabi (replace MinIO endpoints)
- **Backend** → AWS ECS, Google Cloud Run, or DigitalOcean
- **Nginx** → CloudFront, CloudFlare, or BunnyCDN

### Step 3: Setup CDN (Production)

**Using BunnyCDN (Recommended):**

1. Create BunnyCDN Pull Zone
2. Point to MinIO bucket: `http://minio:9000/perm-storage-wasabi`
3. Update `HLS_CDN_URL` to BunnyCDN URL
4. Enable CORS in BunnyCDN settings

**Using CloudFront:**

1. Create CloudFront distribution
2. Origin: MinIO S3-compatible endpoint
3. Enable CORS
4. Update `HLS_CDN_URL`

### Step 4: Secure MinIO

```bash
# Generate strong credentials
openssl rand -base64 32  # For access key
openssl rand -base64 32  # For secret key

# Update in .env
MINIO_ROOT_USER=generated_access_key
MINIO_ROOT_PASSWORD=generated_secret_key
```

### Step 5: Add Authentication to Upload Endpoint

In `content.route.ts`:

```typescript
import { authMiddleware } from '../middleware/auth';

router.post('/upload-with-transcoding',
  authMiddleware,        // Add auth
  upload.single('video'),
  async (req, res) => {
    // ... handler ...
  }
);
```

### Step 6: Setup SSL/HTTPS

Use Let's Encrypt for free SSL:

```bash
# Install certbot
sudo apt install certbot

# Generate certificate
sudo certbot --nginx -d cdn.yourdomain.com

# Auto-renew
sudo certbot renew --dry-run
```

---

## 📊 Monitoring & Logging

### Backend Logs

```bash
# View transcoding logs
docker-compose -f services/hls-transcoder/docker-compose.yml logs -f backend

# Check for errors
docker-compose logs backend | grep ERROR
```

### Database Queries

```sql
-- Check transcoding status distribution
SELECT transcoding_status, COUNT(*)
FROM content
WHERE hls_video_id IS NOT NULL
GROUP BY transcoding_status;

-- Find failed transcodings
SELECT id, title, transcoding_status, updated_at
FROM content
WHERE transcoding_status = 'failed'
ORDER BY updated_at DESC;

-- Get average transcoding time
SELECT AVG(EXTRACT(EPOCH FROM (transcoded_at - created_at))) / 60 AS avg_minutes
FROM content
WHERE transcoding_status = 'completed';
```

### Health Checks

```bash
# Backend health
curl http://localhost:3000/api/health

# Transcoder health
curl http://localhost:5000/health

# MinIO health
curl http://localhost:9000/minio/health/live
```

---

## 🐛 Troubleshooting

### Issue: "Transcoding failed" status

**Check logs:**
```bash
docker-compose -f services/hls-transcoder/docker-compose.yml logs backend
```

**Common causes:**
- Unsupported video format
- Corrupted video file
- Out of disk space
- FFmpeg error

**Solution:**
```bash
# Retry transcoding
curl -X POST http://localhost:3000/api/content/123/retry-transcoding
```

### Issue: "Video player not loading"

**Check:**
1. Browser console for CORS errors
2. HLS URL is accessible: `curl {hls_url}`
3. MinIO bucket permissions

**Fix CORS (Nginx):**
Already configured in `nginx/nginx.conf`

### Issue: "Slow transcoding"

**Optimize:**
1. Increase Docker CPU/RAM limits
2. Use hardware acceleration (if available)
3. Reduce output quality variants
4. Add more transcoder instances

---

## ✅ Integration Checklist

- [ ] Backend service file added (`transcoder.service.ts`)
- [ ] Environment variables configured
- [ ] Database migrated with HLS fields
- [ ] Content upload route updated
- [ ] HLS.js player component added
- [ ] Frontend video page updated
- [ ] Test upload completed successfully
- [ ] Test playback works in browser
- [ ] MinIO storage verified
- [ ] Production deployment planned
- [ ] SSL/HTTPS configured
- [ ] CDN setup (if using)
- [ ] Monitoring/logging enabled

---

## 🎉 Done!

Your VOD app is now integrated with HLS adaptive streaming!

**Next Steps:**
1. Test with various video formats
2. Monitor transcoding performance
3. Optimize for production load
4. Add analytics tracking
5. Implement retry mechanism for failed transcodings

**Need Help?**
- Check `README.md` for full transcoder documentation
- Review `QUICK_START.md` for service setup
- Inspect `integration-examples/` for code samples

---

**Made with ❤️ for your VOD Platform**
