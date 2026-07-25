ALTER TYPE "DeletionRequestStatus" ADD VALUE IF NOT EXISTS 'PROCESSING';
ALTER TYPE "DeletionRequestStatus" ADD VALUE IF NOT EXISTS 'FAILED';

ALTER TABLE "users"
  ADD COLUMN "deleted_at" TIMESTAMP(3);

ALTER TABLE "account_deletion_requests"
  ADD COLUMN "processing_started_at" TIMESTAMP(3),
  ADD COLUMN "failure_reason" TEXT;

CREATE INDEX "users_deleted_at_idx" ON "users"("deleted_at");
