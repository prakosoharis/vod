ALTER TABLE "users"
  ADD COLUMN "verification_blocked_until" TIMESTAMP(3);

ALTER TABLE "otp_challenges"
  ADD COLUMN "is_resend" BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX "otp_challenges_user_id_purpose_is_resend_created_at_idx"
  ON "otp_challenges"("user_id", "purpose", "is_resend", "created_at");
