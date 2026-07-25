CREATE TABLE "support_rate_limit_attempts" (
  "id" TEXT NOT NULL,
  "key_hash" TEXT NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "support_rate_limit_attempts_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "support_rate_limit_attempts_key_hash_created_at_idx"
  ON "support_rate_limit_attempts"("key_hash", "created_at");
CREATE INDEX "support_rate_limit_attempts_created_at_idx"
  ON "support_rate_limit_attempts"("created_at");
