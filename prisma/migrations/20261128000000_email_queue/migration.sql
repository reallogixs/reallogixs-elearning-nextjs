-- Bulk emails (e.g. a class's certificates) wait here and go out in small batches with retries.
ALTER TABLE "email_messages"
  ADD COLUMN "next_attempt_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  ADD COLUMN "locked_until" TIMESTAMPTZ;

CREATE INDEX "email_messages_status_next_attempt_at_idx" ON "email_messages" ("status", "next_attempt_at");

-- An email is queued once: completing a class twice can't send a certificate twice.
CREATE UNIQUE INDEX "email_messages_one_queued" ON "email_messages" ("template", "entity_id")
  WHERE status = 'queued';
