ALTER TYPE "technician_status" RENAME TO "agent_status";
ALTER TABLE "team_members" RENAME TO "agents";

ALTER INDEX "team_members_company_id_idx" RENAME TO "agents_company_id_idx";
ALTER INDEX "team_members_status_idx" RENAME TO "agents_status_idx";
ALTER INDEX "team_members_company_status_idx" RENAME TO "agents_company_status_idx";

ALTER TABLE "job_assignments" RENAME COLUMN "team_member_id" TO "agent_id";
ALTER INDEX "job_assignments_team_member_idx" RENAME TO "job_assignments_agent_idx";

ALTER TABLE "jobs" RENAME COLUMN "assigned_team_member_id" TO "assigned_agent_id";
ALTER INDEX "jobs_assigned_team_member_id_idx" RENAME TO "jobs_assigned_agent_id_idx";

ALTER TABLE "jobs" RENAME CONSTRAINT "jobs_assigned_team_member_id_team_members_id_fk" TO "jobs_assigned_agent_id_agents_id_fk";
ALTER TABLE "job_assignments" RENAME CONSTRAINT "job_assignments_team_member_id_team_members_id_fk" TO "job_assignments_agent_id_agents_id_fk";
ALTER TABLE "agents" RENAME CONSTRAINT "team_members_user_id_users_id_fk" TO "agents_user_id_users_id_fk";