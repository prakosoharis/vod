ALTER TABLE "broadcast_events" ADD COLUMN "ticket_price" DECIMAL(10,2) NOT NULL DEFAULT 0;

CREATE TABLE "broadcast_tickets" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "broadcast_id" TEXT NOT NULL,
    "purchased_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "transaction_id" TEXT NOT NULL,

    CONSTRAINT "broadcast_tickets_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "broadcast_tickets_transaction_id_key" ON "broadcast_tickets"("transaction_id");
CREATE UNIQUE INDEX "broadcast_tickets_user_id_broadcast_id_key" ON "broadcast_tickets"("user_id", "broadcast_id");
CREATE INDEX "broadcast_tickets_user_id_idx" ON "broadcast_tickets"("user_id");
CREATE INDEX "broadcast_tickets_broadcast_id_idx" ON "broadcast_tickets"("broadcast_id");

ALTER TABLE "broadcast_tickets" ADD CONSTRAINT "broadcast_tickets_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "broadcast_tickets" ADD CONSTRAINT "broadcast_tickets_broadcast_id_fkey" FOREIGN KEY ("broadcast_id") REFERENCES "broadcast_events"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "broadcast_tickets" ADD CONSTRAINT "broadcast_tickets_transaction_id_fkey" FOREIGN KEY ("transaction_id") REFERENCES "transactions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
