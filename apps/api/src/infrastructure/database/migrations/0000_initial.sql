-- Migration: 0000_initial.sql
-- Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;

-- Enums
CREATE TYPE "user_role" AS ENUM ('owner', 'admin', 'dispatcher', 'technician');
CREATE TYPE "technician_status" AS ENUM ('available', 'busy', 'offline');
CREATE TYPE "job_status" AS ENUM ('unassigned', 'assigned', 'en_route', 'on_site', 'complete', 'cancelled');
CREATE TYPE "notification_type" AS ENUM ('job_delayed', 'tech_assigned', 'daily_summary');

-- Companies
CREATE TABLE IF NOT EXISTS "companies" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" text NOT NULL,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now()
);

-- Users
CREATE TABLE IF NOT EXISTS "users" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "company_id" uuid NOT NULL REFERENCES "companies"("id") ON DELETE CASCADE,
  "email" text NOT NULL UNIQUE,
  "password_hash" text NOT NULL,
  "role" "user_role" NOT NULL DEFAULT 'dispatcher',
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now(),
  "created_by" uuid REFERENCES "users"("id") ON DELETE SET NULL,
  "updated_by" uuid REFERENCES "users"("id") ON DELETE SET NULL
);

-- Technicians
CREATE TABLE IF NOT EXISTS "technicians" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "company_id" uuid NOT NULL REFERENCES "companies"("id") ON DELETE CASCADE,
  "user_id" uuid REFERENCES "users"("id") ON DELETE SET NULL,
  "name" text NOT NULL,
  "phone" text NOT NULL,
  "current_location" geography(Point, 4326),
  "status" "technician_status" NOT NULL DEFAULT 'offline',
  "last_location_at" timestamptz,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now(),
  "created_by" uuid REFERENCES "users"("id") ON DELETE SET NULL,
  "updated_by" uuid REFERENCES "users"("id") ON DELETE SET NULL
);

-- Jobs
CREATE TABLE IF NOT EXISTS "jobs" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "company_id" uuid NOT NULL REFERENCES "companies"("id") ON DELETE CASCADE,
  "customer_name" text NOT NULL,
  "customer_phone" text NOT NULL,
  "address" text NOT NULL,
  "location" geography(Point, 4326),
  "status" "job_status" NOT NULL DEFAULT 'unassigned',
  "scheduled_at" timestamptz,
  "assigned_technician_id" uuid REFERENCES "technicians"("id") ON DELETE SET NULL,
  "notes" text,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now(),
  "created_by" uuid REFERENCES "users"("id") ON DELETE SET NULL,
  "updated_by" uuid REFERENCES "users"("id") ON DELETE SET NULL
);

-- Job Status History
CREATE TABLE IF NOT EXISTS "job_status_history" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "company_id" uuid NOT NULL REFERENCES "companies"("id") ON DELETE CASCADE,
  "job_id" uuid NOT NULL REFERENCES "jobs"("id") ON DELETE CASCADE,
  "from_status" "job_status",
  "to_status" "job_status" NOT NULL,
  "changed_by" uuid REFERENCES "users"("id") ON DELETE SET NULL,
  "changed_at" timestamptz NOT NULL DEFAULT now(),
  "note" text
);

-- Job Assignments
CREATE TABLE IF NOT EXISTS "job_assignments" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "company_id" uuid NOT NULL REFERENCES "companies"("id") ON DELETE CASCADE,
  "job_id" uuid NOT NULL REFERENCES "jobs"("id") ON DELETE CASCADE,
  "technician_id" uuid NOT NULL REFERENCES "technicians"("id") ON DELETE CASCADE,
  "assigned_at" timestamptz NOT NULL DEFAULT now(),
  "assigned_by" uuid REFERENCES "users"("id") ON DELETE SET NULL
);

-- Notifications
CREATE TABLE IF NOT EXISTS "notifications" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "company_id" uuid NOT NULL REFERENCES "companies"("id") ON DELETE CASCADE,
  "job_id" uuid REFERENCES "jobs"("id") ON DELETE SET NULL,
  "type" "notification_type" NOT NULL,
  "payload" jsonb DEFAULT '{}'::jsonb,
  "sent_at" timestamptz,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "created_by" uuid REFERENCES "users"("id") ON DELETE SET NULL
);

-- Spatial GiST Indexes for PostGIS queries
CREATE INDEX IF NOT EXISTS "technicians_location_idx" ON "technicians" USING GIST ("current_location");
CREATE INDEX IF NOT EXISTS "jobs_location_idx" ON "jobs" USING GIST ("location");

-- Multi-Tenant Composite Indexes
CREATE INDEX IF NOT EXISTS "users_company_id_idx" ON "users" ("company_id");
CREATE INDEX IF NOT EXISTS "technicians_company_id_idx" ON "technicians" ("company_id");
CREATE INDEX IF NOT EXISTS "technicians_company_status_idx" ON "technicians" ("company_id", "status");
CREATE INDEX IF NOT EXISTS "jobs_company_status_idx" ON "jobs" ("company_id", "status");
CREATE INDEX IF NOT EXISTS "job_status_history_job_changed_idx" ON "job_status_history" ("job_id", "changed_at");
CREATE INDEX IF NOT EXISTS "job_status_history_company_idx" ON "job_status_history" ("company_id");
CREATE INDEX IF NOT EXISTS "job_assignments_company_idx" ON "job_assignments" ("company_id");
CREATE INDEX IF NOT EXISTS "job_assignments_job_idx" ON "job_assignments" ("job_id");
CREATE INDEX IF NOT EXISTS "notifications_company_idx" ON "notifications" ("company_id");
