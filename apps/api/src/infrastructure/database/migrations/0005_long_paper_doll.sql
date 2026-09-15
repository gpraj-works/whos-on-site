ALTER TYPE "team_member_status" RENAME TO "agent_status";
ALTER TABLE "team_members" RENAME TO "agents";

ALTER INDEX "technicians_company_id_idx" RENAME TO "agents_company_id_idx";
ALTER INDEX "technicians_status_idx" RENAME TO "agents_status_idx";
ALTER INDEX "technicians_company_status_idx" RENAME TO "agents_company_status_idx";

ALTER TABLE "job_assignments" RENAME COLUMN "team_member_id" TO "agent_id";

ALTER TABLE "jobs" RENAME COLUMN "assigned_team_member_id" TO "assigned_agent_id";
ALTER INDEX "jobs_assigned_technician_id_idx" RENAME TO "jobs_assigned_agent_id_idx";

ALTER TABLE "jobs" RENAME CONSTRAINT "jobs_assigned_technician_id_technicians_id_fk" TO "jobs_assigned_agent_id_agents_id_fk";
ALTER TABLE "job_assignments" RENAME CONSTRAINT "job_assignments_technician_id_technicians_id_fk" TO "job_assignments_agent_id_agents_id_fk";
ALTER TABLE "agents" RENAME CONSTRAINT "technicians_user_id_users_id_fk" TO "agents_user_id_users_id_fk";