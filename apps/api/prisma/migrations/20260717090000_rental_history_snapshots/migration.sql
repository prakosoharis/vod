ALTER TABLE "user_rentals"
ADD COLUMN "price_paid" DECIMAL(10,2),
ADD COLUMN "duration_hours" INTEGER;

UPDATE "user_rentals" ur
SET
  "price_paid" = COALESCE(
    (SELECT t."amount" FROM "transactions" t WHERE t."id" = ur."transaction_id"),
    (SELECT rp."price" FROM "rental_prices" rp WHERE rp."id" = ur."rental_price_id")
  ),
  "duration_hours" = GREATEST(
    1,
    CEIL(EXTRACT(EPOCH FROM (ur."expired_at" - ur."rented_at")) / 3600.0)::INTEGER
  );

ALTER TABLE "user_rentals"
ALTER COLUMN "price_paid" SET NOT NULL,
ALTER COLUMN "duration_hours" SET NOT NULL;

CREATE INDEX "user_rentals_content_id_rented_at_idx"
ON "user_rentals"("content_id", "rented_at");
