-- Migration: 0001_refresh_tokens.sql
-- Create refresh_tokens table
CREATE TABLE IF NOT EXISTS "refresh_tokens" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "company_id" uuid NOT NULL REFERENCES "companies"("id") ON DELETE CASCADE,
  "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "token_hash" text NOT NULL,
  "expires_at" timestamptz NOT NULL,
  "revoked_at" timestamptz,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "created_by" uuid REFERENCES "users"("id") ON DELETE SET NULL
);

-- Indexes for fast token verification and revocation lookup
CREATE INDEX IF NOT EXISTS "refresh_tokens_token_hash_idx" ON "refresh_tokens" ("token_hash");
CREATE INDEX IF NOT EXISTS "refresh_tokens_company_user_idx" ON "refresh_tokens" ("company_id", "user_id");
CREATE INDEX IF NOT EXISTS "refresh_tokens_user_revoked_idx" ON "refresh_tokens" ("user_id", "revoked_at", "expires_at");
