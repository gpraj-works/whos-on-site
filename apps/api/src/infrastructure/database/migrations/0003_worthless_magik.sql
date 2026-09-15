ALTER TYPE "public"."notification_type" ADD VALUE 'job_created' BEFORE 'job_delayed';--> statement-breakpoint
ALTER TYPE "public"."notification_type" ADD VALUE 'job_status_changed' BEFORE 'daily_summary';--> statement-breakpoint
ALTER TABLE "jobs" ADD COLUMN "share_token" uuid DEFAULT gen_random_uuid() NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "jobs_share_token_idx" ON "jobs" USING btree ("share_token");