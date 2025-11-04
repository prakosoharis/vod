-- CreateEnum
CREATE TYPE "ContentType" AS ENUM ('MOVIE', 'SERIES');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "full_name" TEXT,
    "avatar_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contents" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "genre" TEXT[],
    "year" INTEGER,
    "rating" DECIMAL(3,2),
    "duration" TEXT NOT NULL,
    "thumbnail_url" TEXT NOT NULL,
    "backdrop_url" TEXT,
    "video_url" TEXT,
    "trailer_url" TEXT,
    "cast" JSONB NOT NULL,
    "type" "ContentType" NOT NULL,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "contents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "watchlists" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "content_id" TEXT NOT NULL,
    "added_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "watchlists_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "watch_progress" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "content_id" TEXT NOT NULL,
    "progress_seconds" INTEGER NOT NULL,
    "last_watched" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "watch_progress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "contents_featured_idx" ON "contents"("featured");

-- CreateIndex
CREATE INDEX "contents_type_idx" ON "contents"("type");

-- CreateIndex
CREATE INDEX "watchlists_user_id_content_id_idx" ON "watchlists"("user_id", "content_id");

-- CreateIndex
CREATE UNIQUE INDEX "watchlists_user_id_content_id_key" ON "watchlists"("user_id", "content_id");

-- CreateIndex
CREATE UNIQUE INDEX "watch_progress_user_id_content_id_key" ON "watch_progress"("user_id", "content_id");

-- AddForeignKey
ALTER TABLE "watchlists" ADD CONSTRAINT "watchlists_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "watchlists" ADD CONSTRAINT "watchlists_content_id_fkey" FOREIGN KEY ("content_id") REFERENCES "contents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "watch_progress" ADD CONSTRAINT "watch_progress_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "watch_progress" ADD CONSTRAINT "watch_progress_content_id_fkey" FOREIGN KEY ("content_id") REFERENCES "contents"("id") ON DELETE CASCADE ON UPDATE CASCADE;
