-- Manual Migration: Add HLS Transcoding Fields to Content Table
-- Run this SQL when database is available

-- Add HLS columns to contents table
ALTER TABLE contents
ADD COLUMN hls_video_id UUID,
ADD COLUMN hls_url TEXT,
ADD COLUMN hls_cdn_url TEXT,
ADD COLUMN transcoding_status VARCHAR(50) DEFAULT 'pending',
ADD COLUMN transcoded_at TIMESTAMP;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_contents_hls_video_id ON contents(hls_video_id);
CREATE INDEX IF NOT EXISTS idx_contents_transcoding_status ON contents(transcoding_status);

-- Add comments
COMMENT ON COLUMN contents.hls_video_id IS 'UUID from HLS transcoder microservice';
COMMENT ON COLUMN contents.hls_url IS 'Full HLS playlist URL';
COMMENT ON COLUMN contents.hls_cdn_url IS 'Base CDN URL for HLS segments';
COMMENT ON COLUMN contents.transcoding_status IS 'Status: pending, processing, completed, failed';
COMMENT ON COLUMN contents.transcoded_at IS 'Timestamp when transcoding completed';
