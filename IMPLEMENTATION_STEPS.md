# 🚀 STEP-BY-STEP IMPLEMENTATION GUIDE
## Integrate HLS Transcoder ke VOD App - Local Environment

**Total Time:** ~30 minutes
**Difficulty:** Beginner-friendly

---

## ✅ PHASE 1: START HLS TRANSCODER SERVICE (5 menit)

### Step 1.1: Start Docker Services

```bash
# Navigate to transcoder directory
cd services/hls-transcoder

# Start all services
docker-compose up -d

# Expected output:
# ✓ Container hls-minio    Started
# ✓ Container hls-backend  Started
# ✓ Container hls-nginx    Started
```

**Wait 30 seconds** for services to initialize.

### Step 1.2: Verify Services Running

```bash
# Check all containers are UP
docker-compose ps

# Expected: All should show "Up" status
# NAME            STATUS
# hls-backend     Up
# hls-minio       Up
# hls-nginx       Up
```

### Step 1.3: Test Health Endpoints

```bash
# Test backend health
curl http://localhost:5000/health

# Expected: {"status":"healthy","service":"HLS Transcoder",...}

# Test nginx
curl http://localhost:8080/health

# Expected: OK

# Test MinIO (optional)
curl http://localhost:9000/minio/health/live

# Expected: (empty response with 200 status)
```

### Step 1.4: Verify Frontend UI

Open browser: **http://localhost:8080**

You should see the upload page with purple gradient! ✅

---

## ✅ PHASE 2: BACKEND INTEGRATION (10 menit)

### Step 2.1: Create Services Directory

```bash
# From project root
cd apps/backend

# Create services directory if not exists
mkdir -p src/services
```

### Step 2.2: Copy Transcoder Service

```bash
# Copy from integration examples
cp ../../services/hls-transcoder/integration-examples/transcoder.service.ts \
   src/services/transcoder.service.ts

# Verify file exists
ls -la src/services/transcoder.service.ts
```

### Step 2.3: Install Required Dependencies

```bash
# Still in apps/backend
npm install axios form-data fs-extra

# Install dev dependencies
npm install --save-dev @types/form-data

# Expected output: ✓ packages installed
```

### Step 2.4: Add Environment Variables

```bash
# Add to .env file (or create if not exists)
echo "" >> .env
echo "# HLS Transcoder Configuration" >> .env
echo "TRANSCODER_URL=http://localhost:5000" >> .env
echo "APP_URL=http://localhost:3000" >> .env
echo "HLS_CDN_URL=http://localhost:8080" >> .env

# Verify
cat .env | grep TRANSCODER
```

### Step 2.5: Create/Update Content Upload Route

**Option A: Create New Route File (Recommended)**

```bash
# Create routes directory if needed
mkdir -p src/routes

# Copy example route
cp ../../services/hls-transcoder/integration-examples/content.route.ts \
   src/routes/content.route.ts

# Verify
ls -la src/routes/content.route.ts
```

**Option B: I'll show you how to update existing route later**

---

## ✅ PHASE 3: DATABASE MIGRATION (5 menit)

### Step 3.1: Check Prisma Schema Location

```bash
# Still in apps/backend
ls prisma/schema.prisma

# If exists, proceed. If not, check your database setup.
```

### Step 3.2: Update Prisma Schema

**Open:** `apps/backend/prisma/schema.prisma`

**Add these fields to your `Content` model:**

```prisma
model Content {
  id                  Int       @id @default(autoincrement())
  title               String
  description         String?
  thumbnail_url       String?
  video_url           String?   @map("video_url")

  // ... existing fields ...

  // ========== HLS FIELDS (NEW) ==========
  hls_video_id        String?   @map("hls_video_id") @db.Uuid
  hls_url             String?   @map("hls_url")
  hls_cdn_url         String?   @map("hls_cdn_url")
  transcoding_status  String?   @default("pending") @map("transcoding_status")
  transcoded_at       DateTime? @map("transcoded_at")
  // =====================================

  created_at          DateTime  @default(now()) @map("created_at")
  updated_at          DateTime  @updatedAt @map("updated_at")

  @@index([hls_video_id])
  @@index([transcoding_status])
  @@map("content")
}
```

### Step 3.3: Create Migration

```bash
# Generate migration
npx prisma migrate dev --name add_hls_transcoding_fields

# Expected output:
# ✓ Migration created
# ✓ Database updated
# ✓ Prisma Client generated
```

### Step 3.4: Verify Migration

```bash
# Check migration was created
ls prisma/migrations/

# You should see a new folder like: 20251219XXXXXX_add_hls_transcoding_fields/
```

---

## ✅ PHASE 4: FRONTEND INTEGRATION (7 menit)

### Step 4.1: Install HLS.js

```bash
cd ../web  # or cd ../../apps/web

# Install HLS.js
npm install hls.js

# Install types
npm install --save-dev @types/hls.js

# Expected: ✓ packages installed
```

### Step 4.2: Create Video Components Directory

```bash
# Create directory if not exists
mkdir -p src/components/video
```

### Step 4.3: Copy HLS Player Component

```bash
# From apps/web
cp ../../services/hls-transcoder/integration-examples/VideoPlayer.tsx \
   src/components/video/HLSPlayer.tsx

# Verify
ls -la src/components/video/HLSPlayer.tsx
```

### Step 4.4: Update Existing Video Player Page

**I'll help you update this in the next step based on your current implementation.**

For now, here's the basic pattern:

**Open:** `apps/web/src/pages/VideoPlayerPage.tsx`

**Replace video element with:**

```tsx
import HLSPlayer from '@/components/video/HLSPlayer';

// Inside your component:
{content.hls_url ? (
  <HLSPlayer
    hlsUrl={content.hls_url}
    poster={content.thumbnail_url || content.backdrop_url}
    autoPlay={false}
    controls={true}
  />
) : content.video_url ? (
  // Fallback to original video
  <video src={content.video_url} controls />
) : (
  <p>Video not available</p>
)}
```

---

## ✅ PHASE 5: REGISTER ROUTES (3 menit)

### Step 5.1: Update Main App/Server File

**Find your main Express app file** (usually `src/app.ts` or `src/server.ts`)

**Add this import:**

```typescript
import contentRoutes from './routes/content.route';
```

**Add this route:**

```typescript
app.use('/api/content', contentRoutes);
```

**Example full context:**

```typescript
import express from 'express';
import contentRoutes from './routes/content.route';

const app = express();

// ... other middleware ...

// Routes
app.use('/api/content', contentRoutes);  // ← ADD THIS

// ... other routes ...

export default app;
```

---

## ✅ PHASE 6: TEST INTEGRATION (5 menit)

### Step 6.1: Start Your Backend

```bash
cd apps/backend

# Start backend (adjust command if different)
npm run dev

# Expected: Server running on port 3000 (or your port)
```

### Step 6.2: Start Your Frontend

```bash
# In new terminal
cd apps/web

npm run dev

# Expected: Frontend running on port 3000 or 5173
```

### Step 6.3: Quick API Test

```bash
# Test transcoder health
curl http://localhost:5000/health

# Test your backend can reach transcoder
curl http://localhost:3000/api/content/health
# (You may need to add a health endpoint, or skip this)
```

### Step 6.4: Upload Test Video

**Option A: Using Transcoder Frontend**

1. Open http://localhost:8080
2. Drag & drop a small video file (< 100MB recommended)
3. Click "Start Upload & Transcode"
4. Wait 2-3 minutes
5. Video should auto-play when done! ✅

**Option B: Using curl**

```bash
# Download sample video
curl -o test-video.mp4 \
  http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4

# Upload to transcoder
curl -X POST http://localhost:5000/api/upload \
  -F "video=@test-video.mp4" \
  -o response.json

# Check response
cat response.json | jq

# Extract HLS URL
cat response.json | jq -r '.data.hlsUrl'
```

### Step 6.5: Verify in MinIO

1. Open http://localhost:9001
2. Login: `admin` / `password123`
3. Click "Buckets"
4. Click `perm-storage-wasabi`
5. You should see a folder with video ID
6. Inside: `playlist.m3u8` and `segment_*.ts` files ✅

### Step 6.6: Test Playback

**Option A: VLC Player**
```bash
# Get HLS URL from response.json
HLS_URL=$(cat response.json | jq -r '.data.hlsUrl')

# Play with VLC
vlc "$HLS_URL"
```

**Option B: Browser**
Open the HLS URL in Safari (has native HLS support)

**Option C: Your Frontend**
Navigate to video detail page and it should use HLSPlayer component

---

## ✅ PHASE 7: INTEGRATION WITH YOUR UPLOAD FLOW

### Step 7.1: Update Your Upload Handler

**Find your current upload route** (e.g., `src/routes/upload.route.ts`)

**Add transcoder integration:**

```typescript
import { transcoderService } from '../services/transcoder.service';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

router.post('/upload', upload.single('video'), async (req, res) => {
  try {
    const { title, description } = req.body;

    // Create content record
    const content = await prisma.content.create({
      data: {
        title,
        description,
        transcoding_status: 'processing'
      }
    });

    // Send immediate response
    res.status(202).json({
      success: true,
      message: 'Upload received, transcoding in progress',
      contentId: content.id
    });

    // Transcode asynchronously (don't await)
    transcodeAsync(content.id, req.file.path, req.file.originalname)
      .catch(err => console.error('Transcode error:', err));

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

async function transcodeAsync(contentId: number, filePath: string, filename: string) {
  try {
    // Call transcoder
    const result = await transcoderService.transcodeVideo(filePath, filename);

    // Update database
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

    console.log(`✅ Content ${contentId} transcoded successfully`);
  } catch (error) {
    await prisma.content.update({
      where: { id: contentId },
      data: { transcoding_status: 'failed' }
    });
    console.error(`❌ Content ${contentId} transcode failed:`, error);
  }
}
```

---

## 🎉 DONE! Verification Checklist

Run through this checklist:

- [ ] Docker services running: `docker-compose ps`
- [ ] Backend can import transcoder service: check for errors
- [ ] Database migrated: HLS fields exist in Content table
- [ ] Frontend has HLSPlayer component
- [ ] Test upload works via http://localhost:8080
- [ ] Video plays with adaptive quality
- [ ] MinIO shows HLS files in `perm-storage-wasabi`
- [ ] Your app can upload and transcode
- [ ] Your app can playback HLS videos

---

## 🐛 Troubleshooting

### Issue: "Cannot find module 'axios'"
```bash
cd apps/backend
npm install axios form-data fs-extra
```

### Issue: "Prisma migration failed"
```bash
# Check database connection
npx prisma db pull

# Try migration again
npx prisma migrate dev
```

### Issue: "HLS player not loading"
```bash
# Check HLS.js installed
cd apps/web
npm list hls.js

# Reinstall if needed
npm install hls.js
```

### Issue: "Docker services not starting"
```bash
# Check Docker is running
docker info

# View logs
cd services/hls-transcoder
docker-compose logs -f
```

### Issue: "Video transcoding failed"
```bash
# Check backend logs
docker-compose -f services/hls-transcoder/docker-compose.yml logs backend

# Check disk space
docker system df
```

---

## 📞 Next Steps

After successful integration:

1. **Test with various video formats** (MP4, MOV, AVI)
2. **Add status polling** on frontend for transcoding progress
3. **Add error handling UI** for failed transcodings
4. **Implement retry mechanism** for failed uploads
5. **Add admin dashboard** to monitor transcoding queue

---

## 🎯 Quick Commands Reference

```bash
# Start transcoder
cd services/hls-transcoder && docker-compose up -d

# Stop transcoder
docker-compose down

# View logs
docker-compose logs -f backend

# Restart services
docker-compose restart

# Test upload
curl -X POST http://localhost:5000/api/upload -F "video=@test.mp4"

# Check MinIO
open http://localhost:9001

# Clean up everything
docker-compose down -v
```

---

**Ready to implement? Let's go! 🚀**

Need help with a specific step? Just let me know which phase you're on!
