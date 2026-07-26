CREATE TYPE "BackofficeRole" AS ENUM ('SUPERUSER', 'ADMIN', 'PUBLISHER');

CREATE TABLE "publishers" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "address" TEXT NOT NULL,
  "pic_name" TEXT NOT NULL,
  "pic_phone" TEXT NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "publishers_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "backoffice_users" (
  "id" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "full_name" TEXT NOT NULL,
  "password_hash" TEXT NOT NULL,
  "role" "BackofficeRole" NOT NULL,
  "publisher_id" TEXT,
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "backoffice_users_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "contents" ADD COLUMN "publisher_id" TEXT;

CREATE UNIQUE INDEX "backoffice_users_email_key" ON "backoffice_users"("email");
CREATE INDEX "backoffice_users_role_idx" ON "backoffice_users"("role");
CREATE INDEX "backoffice_users_publisher_id_idx" ON "backoffice_users"("publisher_id");
CREATE INDEX "publishers_name_idx" ON "publishers"("name");
CREATE INDEX "contents_publisher_id_idx" ON "contents"("publisher_id");

ALTER TABLE "backoffice_users"
  ADD CONSTRAINT "backoffice_users_publisher_id_fkey"
  FOREIGN KEY ("publisher_id") REFERENCES "publishers"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "contents"
  ADD CONSTRAINT "contents_publisher_id_fkey"
  FOREIGN KEY ("publisher_id") REFERENCES "publishers"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
