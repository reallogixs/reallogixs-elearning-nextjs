-- Links that move an account to a new email remember which one.
ALTER TABLE "auth_tokens" ADD COLUMN "new_email" TEXT;
