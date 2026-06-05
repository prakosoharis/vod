-- CreateEnum
CREATE TYPE "BroadcastStatus" AS ENUM ('SCHEDULED', 'LIVE', 'ENDED', 'CANCELLED');

-- CreateTable
CREATE TABLE "broadcast_events" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "scheduled_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "category" TEXT NOT NULL,
    "chat_enabled" BOOLEAN NOT NULL DEFAULT true,
    "status" "BroadcastStatus" NOT NULL DEFAULT 'SCHEDULED',
    "stream_key" TEXT NOT NULL,
    "rtmp_url" TEXT NOT NULL,
    "playback_url" TEXT NOT NULL,
    "viewer_count" INTEGER NOT NULL DEFAULT 0,
    "started_at" TIMESTAMP(3),
    "ended_at" TIMESTAMP(3),
    "created_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "broadcast_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chat_messages" (
    "id" TEXT NOT NULL,
    "broadcast_id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "is_host_message" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chat_messages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "broadcast_events_status_idx" ON "broadcast_events"("status");

-- CreateIndex
CREATE INDEX "broadcast_events_scheduled_time_idx" ON "broadcast_events"("scheduled_time");

-- CreateIndex
CREATE INDEX "broadcast_events_category_idx" ON "broadcast_events"("category");

-- CreateIndex
CREATE INDEX "chat_messages_broadcast_id_idx" ON "chat_messages"("broadcast_id");

-- CreateIndex
CREATE INDEX "chat_messages_created_at_idx" ON "chat_messages"("created_at");

-- AddForeignKey
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_broadcast_id_fkey" FOREIGN KEY ("broadcast_id") REFERENCES "broadcast_events"("id") ON DELETE CASCADE ON UPDATE CASCADE;
