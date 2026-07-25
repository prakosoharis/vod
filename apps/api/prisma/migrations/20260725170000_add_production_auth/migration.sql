CREATE TYPE "AuthAccountStatus" AS ENUM (
  'PENDING_VERIFICATION', 'ACTIVE', 'SUSPENDED', 'DELETION_PENDING', 'DELETED'
);
CREATE TYPE "OtpPurpose" AS ENUM ('REGISTRATION', 'PASSWORD_RESET');
CREATE TYPE "OtpChannel" AS ENUM ('EMAIL', 'WHATSAPP');
CREATE TYPE "SocialProvider" AS ENUM ('GOOGLE', 'FACEBOOK');

ALTER TABLE "users"
  ALTER COLUMN "email" DROP NOT NULL,
  ALTER COLUMN "password_hash" DROP NOT NULL,
  ADD COLUMN "email_normalized" TEXT,
  ADD COLUMN "email_verified_at" TIMESTAMP(3),
  ADD COLUMN "username" TEXT,
  ADD COLUMN "username_normalized" TEXT,
  ADD COLUMN "phone_e164" TEXT,
  ADD COLUMN "phone_verified_at" TIMESTAMP(3),
  ADD COLUMN "account_status" "AuthAccountStatus" NOT NULL DEFAULT 'PENDING_VERIFICATION';

UPDATE "users"
SET "email_normalized" = lower(trim("email")),
    "email_verified_at" = COALESCE("email_verified_at", NOW()),
    "account_status" = CASE
      WHEN "deleted_at" IS NOT NULL THEN 'DELETED'::"AuthAccountStatus"
      ELSE 'ACTIVE'::"AuthAccountStatus"
    END;

CREATE UNIQUE INDEX "users_email_normalized_key" ON "users"("email_normalized");
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");
CREATE UNIQUE INDEX "users_username_normalized_key" ON "users"("username_normalized");
CREATE UNIQUE INDEX "users_phone_e164_key" ON "users"("phone_e164");

CREATE TABLE "otp_challenges" (
  "id" TEXT NOT NULL,
  "user_id" TEXT NOT NULL,
  "purpose" "OtpPurpose" NOT NULL,
  "channel" "OtpChannel" NOT NULL,
  "destination" TEXT NOT NULL,
  "destination_hash" TEXT NOT NULL,
  "otp_hash" TEXT NOT NULL,
  "expires_at" TIMESTAMP(3) NOT NULL,
  "resend_after" TIMESTAMP(3) NOT NULL,
  "attempts" INTEGER NOT NULL DEFAULT 0,
  "max_attempts" INTEGER NOT NULL,
  "consumed_at" TIMESTAMP(3),
  "provider_message_id" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "otp_challenges_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "otp_challenges_user_id_fkey" FOREIGN KEY ("user_id")
    REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "otp_challenges_user_id_purpose_consumed_at_idx"
  ON "otp_challenges"("user_id", "purpose", "consumed_at");
CREATE INDEX "otp_challenges_destination_hash_purpose_created_at_idx"
  ON "otp_challenges"("destination_hash", "purpose", "created_at");
CREATE INDEX "otp_challenges_expires_at_idx" ON "otp_challenges"("expires_at");

CREATE TABLE "auth_sessions" (
  "id" TEXT NOT NULL,
  "user_id" TEXT NOT NULL,
  "refresh_token_hash" TEXT NOT NULL,
  "device_name" TEXT,
  "platform" TEXT NOT NULL,
  "ip_hash" TEXT,
  "user_agent" TEXT,
  "expires_at" TIMESTAMP(3) NOT NULL,
  "revoked_at" TIMESTAMP(3),
  "replaced_by_id" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "last_used_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "auth_sessions_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "auth_sessions_user_id_fkey" FOREIGN KEY ("user_id")
    REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "auth_sessions_refresh_token_hash_key"
  ON "auth_sessions"("refresh_token_hash");
CREATE INDEX "auth_sessions_user_id_revoked_at_idx"
  ON "auth_sessions"("user_id", "revoked_at");
CREATE INDEX "auth_sessions_expires_at_idx" ON "auth_sessions"("expires_at");

CREATE TABLE "social_identities" (
  "id" TEXT NOT NULL,
  "user_id" TEXT NOT NULL,
  "provider" "SocialProvider" NOT NULL,
  "provider_user_id" TEXT NOT NULL,
  "provider_email" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "social_identities_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "social_identities_user_id_fkey" FOREIGN KEY ("user_id")
    REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "social_identities_provider_provider_user_id_key"
  ON "social_identities"("provider", "provider_user_id");
CREATE UNIQUE INDEX "social_identities_user_id_provider_key"
  ON "social_identities"("user_id", "provider");

CREATE TABLE "login_attempts" (
  "id" TEXT NOT NULL,
  "user_id" TEXT,
  "identifier_hash" TEXT NOT NULL,
  "ip_hash" TEXT,
  "platform" TEXT NOT NULL,
  "succeeded" BOOLEAN NOT NULL,
  "reason" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "login_attempts_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "login_attempts_user_id_fkey" FOREIGN KEY ("user_id")
    REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE
);
CREATE INDEX "login_attempts_identifier_hash_created_at_idx"
  ON "login_attempts"("identifier_hash", "created_at");
CREATE INDEX "login_attempts_ip_hash_created_at_idx"
  ON "login_attempts"("ip_hash", "created_at");
CREATE INDEX "login_attempts_user_id_created_at_idx"
  ON "login_attempts"("user_id", "created_at");
