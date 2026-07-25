CREATE TYPE "LegalDocumentType" AS ENUM ('TERMS', 'PRIVACY');
CREATE TYPE "SupportTicketStatus" AS ENUM ('OPEN', 'IN_REVIEW', 'RESOLVED', 'CLOSED');
CREATE TYPE "DeletionRequestStatus" AS ENUM ('PENDING', 'CANCELLED', 'COMPLETED');

CREATE TABLE "legal_consents" (
  "id" TEXT NOT NULL,
  "user_id" TEXT NOT NULL,
  "document_type" "LegalDocumentType" NOT NULL,
  "document_version" TEXT NOT NULL,
  "source_platform" TEXT NOT NULL,
  "accepted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "user_agent" TEXT,
  CONSTRAINT "legal_consents_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "support_tickets" (
  "id" TEXT NOT NULL,
  "ticket_number" TEXT NOT NULL,
  "user_id" TEXT,
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "phone" TEXT,
  "category" TEXT NOT NULL,
  "transaction_number" TEXT,
  "subject" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "attachment_url" TEXT,
  "status" "SupportTicketStatus" NOT NULL DEFAULT 'OPEN',
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "support_tickets_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "account_deletion_requests" (
  "id" TEXT NOT NULL,
  "user_id" TEXT NOT NULL,
  "status" "DeletionRequestStatus" NOT NULL DEFAULT 'PENDING',
  "requested_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "scheduled_for" TIMESTAMP(3) NOT NULL,
  "cancelled_at" TIMESTAMP(3),
  "completed_at" TIMESTAMP(3),
  "source_platform" TEXT NOT NULL,
  CONSTRAINT "account_deletion_requests_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "compliance_audit_logs" (
  "id" TEXT NOT NULL,
  "user_id" TEXT,
  "event_type" TEXT NOT NULL,
  "subject_type" TEXT NOT NULL,
  "subject_id" TEXT,
  "source_platform" TEXT,
  "metadata" JSONB,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "compliance_audit_logs_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "legal_consents_user_id_document_type_document_version_key"
  ON "legal_consents"("user_id", "document_type", "document_version");
CREATE INDEX "legal_consents_user_id_accepted_at_idx" ON "legal_consents"("user_id", "accepted_at");
CREATE UNIQUE INDEX "support_tickets_ticket_number_key" ON "support_tickets"("ticket_number");
CREATE INDEX "support_tickets_email_created_at_idx" ON "support_tickets"("email", "created_at");
CREATE INDEX "support_tickets_status_created_at_idx" ON "support_tickets"("status", "created_at");
CREATE INDEX "account_deletion_requests_user_id_status_idx" ON "account_deletion_requests"("user_id", "status");
CREATE INDEX "account_deletion_requests_status_scheduled_for_idx" ON "account_deletion_requests"("status", "scheduled_for");
CREATE INDEX "compliance_audit_logs_event_type_created_at_idx" ON "compliance_audit_logs"("event_type", "created_at");
CREATE INDEX "compliance_audit_logs_user_id_created_at_idx" ON "compliance_audit_logs"("user_id", "created_at");

ALTER TABLE "legal_consents" ADD CONSTRAINT "legal_consents_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "support_tickets" ADD CONSTRAINT "support_tickets_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "account_deletion_requests" ADD CONSTRAINT "account_deletion_requests_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "compliance_audit_logs" ADD CONSTRAINT "compliance_audit_logs_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
