ALTER TABLE "companies" ADD COLUMN IF NOT EXISTS "email" text;--> statement-breakpoint
ALTER TABLE "companies" ADD COLUMN IF NOT EXISTS "phone" text;--> statement-breakpoint
ALTER TABLE "companies" ADD COLUMN IF NOT EXISTS "address" text;--> statement-breakpoint
ALTER TABLE "companies" ADD COLUMN IF NOT EXISTS "latitude" double precision;--> statement-breakpoint
ALTER TABLE "companies" ADD COLUMN IF NOT EXISTS "longitude" double precision;
