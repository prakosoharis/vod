ALTER TABLE "contents"
ADD COLUMN "show_in_latest" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "show_in_movie_picks" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "show_in_popular_series" BOOLEAN NOT NULL DEFAULT false;

-- Sensible initial homepage content; admins can change every selection later.
UPDATE "contents"
SET "show_in_latest" = true
WHERE "id" IN (
  SELECT "id" FROM "contents"
  WHERE "type" = 'MOVIE'
  ORDER BY "created_at" DESC
  LIMIT 10
);

UPDATE "contents"
SET "show_in_movie_picks" = true
WHERE "type" = 'MOVIE' AND "featured" = true;

UPDATE "contents"
SET "show_in_popular_series" = true
WHERE "type" = 'SERIES' AND "featured" = true;

CREATE INDEX "contents_show_in_latest_idx" ON "contents"("show_in_latest");
CREATE INDEX "contents_show_in_movie_picks_idx" ON "contents"("show_in_movie_picks");
CREATE INDEX "contents_show_in_popular_series_idx" ON "contents"("show_in_popular_series");
