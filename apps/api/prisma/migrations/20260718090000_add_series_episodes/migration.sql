CREATE TABLE "episodes" (
  "id" TEXT NOT NULL,
  "content_id" TEXT NOT NULL,
  "season_number" INTEGER NOT NULL DEFAULT 1,
  "episode_number" INTEGER NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "duration" TEXT NOT NULL,
  "thumbnail_url" TEXT,
  "video_url" TEXT,
  "hls_url" TEXT,
  "is_published" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "episodes_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "episodes_content_id_fkey" FOREIGN KEY ("content_id") REFERENCES "contents"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "episodes_content_id_season_number_episode_number_key"
ON "episodes"("content_id", "season_number", "episode_number");

CREATE INDEX "episodes_content_id_season_number_episode_number_idx"
ON "episodes"("content_id", "season_number", "episode_number");

-- Preserve existing series playback by converting its former single video
-- into season 1 episode 1.
INSERT INTO "episodes" (
  "id", "content_id", "season_number", "episode_number", "title",
  "description", "duration", "thumbnail_url", "video_url", "hls_url",
  "is_published", "created_at", "updated_at"
)
SELECT
  md5(random()::text || clock_timestamp()::text || c."id"),
  c."id", 1, 1, 'Episode 1', c."description", c."duration",
  c."thumbnail_url", c."video_url", c."hls_url", true,
  CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM "contents" c
WHERE c."type" = 'SERIES'
  AND (c."video_url" IS NOT NULL OR c."hls_url" IS NOT NULL);
