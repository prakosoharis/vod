-- ============================================================================
-- HLS Transcoder Integration - Database Migration
-- ============================================================================
-- Add this migration to your existing Prisma schema or run as SQL

-- For Prisma: Add to apps/backend/prisma/schema.prisma
-- Then run: npx prisma migrate dev --name add_hls_fields

-- ============================================================================
-- Option 1: Add columns to existing 'content' table
-- ============================================================================

ALTER TABLE content
ADD COLUMN hls_video_id UUID,
ADD COLUMN hls_url TEXT,
ADD COLUMN hls_cdn_url TEXT,
ADD COLUMN transcoding_status VARCHAR(50) DEFAULT 'pending',
ADD COLUMN transcoded_at TIMESTAMP;

-- Create index for faster lookups
CREATE INDEX idx_content_hls_video_id ON content(hls_video_id);
CREATE INDEX idx_content_transcoding_status ON content(transcoding_status);

-- Add comment
COMMENT ON COLUMN content.hls_video_id IS 'UUID from HLS transcoder service';
COMMENT ON COLUMN content.hls_url IS 'Full HLS playlist URL (http://cdn.../playlist.m3u8)';
COMMENT ON COLUMN content.hls_cdn_url IS 'Base CDN URL for HLS segments';
COMMENT ON COLUMN content.transcoding_status IS 'Status: pending, processing, completed, failed';
COMMENT ON COLUMN content.transcoded_at IS 'Timestamp when transcoding completed';

-- ============================================================================
-- Option 2: Create separate 'transcoded_videos' table (Recommended for large scale)
-- ============================================================================

CREATE TABLE transcoded_videos (
  id SERIAL PRIMARY KEY,
  content_id INTEGER NOT NULL REFERENCES content(id) ON DELETE CASCADE,
  hls_video_id UUID NOT NULL UNIQUE,
  hls_url TEXT NOT NULL,
  hls_cdn_url TEXT NOT NULL,
  original_filename VARCHAR(255),
  transcoding_status VARCHAR(50) DEFAULT 'pending',
  transcoding_started_at TIMESTAMP,
  transcoding_completed_at TIMESTAMP,
  transcoding_error TEXT,
  file_size_bytes BIGINT,
  duration_seconds INTEGER,
  bitrates_available JSONB, -- Store available quality variants
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_transcoded_videos_content_id ON transcoded_videos(content_id);
CREATE INDEX idx_transcoded_videos_hls_video_id ON transcoded_videos(hls_video_id);
CREATE INDEX idx_transcoded_videos_status ON transcoded_videos(transcoding_status);

-- Comments
COMMENT ON TABLE transcoded_videos IS 'HLS transcoded video metadata from transcoder service';
COMMENT ON COLUMN transcoded_videos.bitrates_available IS 'JSON array of available bitrates: ["1080p", "720p", "480p", "360p"]';

-- ============================================================================
-- Prisma Schema Example (add to schema.prisma)
-- ============================================================================

-- model Content {
--   id                  Int       @id @default(autoincrement())
--   title               String
--   description         String?
--   thumbnail_url       String?
--   video_url           String?   @map("video_url") // Old direct video URL
--   hls_video_id        String?   @map("hls_video_id") @db.Uuid
--   hls_url             String?   @map("hls_url")
--   hls_cdn_url         String?   @map("hls_cdn_url")
--   transcoding_status  String?   @default("pending") @map("transcoding_status")
--   transcoded_at       DateTime? @map("transcoded_at")
--   created_at          DateTime  @default(now()) @map("created_at")
--   updated_at          DateTime  @updatedAt @map("updated_at")
--
--   @@index([hls_video_id])
--   @@index([transcoding_status])
--   @@map("content")
-- }

-- OR separate table:

-- model TranscodedVideo {
--   id                      Int       @id @default(autoincrement())
--   content_id              Int       @map("content_id")
--   hls_video_id            String    @unique @map("hls_video_id") @db.Uuid
--   hls_url                 String    @map("hls_url")
--   hls_cdn_url             String    @map("hls_cdn_url")
--   original_filename       String?   @map("original_filename")
--   transcoding_status      String    @default("pending") @map("transcoding_status")
--   transcoding_started_at  DateTime? @map("transcoding_started_at")
--   transcoding_completed_at DateTime? @map("transcoding_completed_at")
--   transcoding_error       String?   @map("transcoding_error")
--   file_size_bytes         BigInt?   @map("file_size_bytes")
--   duration_seconds        Int?      @map("duration_seconds")
--   bitrates_available      Json?     @map("bitrates_available")
--   created_at              DateTime  @default(now()) @map("created_at")
--   updated_at              DateTime  @updatedAt @map("updated_at")
--
--   content                 Content   @relation(fields: [content_id], references: [id], onDelete: Cascade)
--
--   @@index([content_id])
--   @@index([hls_video_id])
--   @@index([transcoding_status])
--   @@map("transcoded_videos")
-- }
