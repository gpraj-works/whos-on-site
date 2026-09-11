---
name: whosonsite-db
description: >-
  Database management runbook for Drizzle ORM, PostGIS migrations, seed scripts, transactions, and raw native queries in WhosOnSite.
  Use when modifying database schemas, running migrations, writing transactions, or executing spatial queries.
---

# WhosOnSite Database Runbook

This skill provides step-by-step procedures for database schema changes, Drizzle ORM operations, transactions, and PostGIS spatial queries in WhosOnSite.

---

## 1. Drizzle Schema File Layout

Schema definitions are located in `apps/api/src/infrastructure/database/schema/`:
- `common.ts` — Pure timestamp helpers (`createdAt`, `updatedAt`, `timestamps`). Zero dependencies on schema tables to prevent circular imports.
- `company.ts` — `companyId` reference helper.
- `audit.ts` — `createdBy`, `updatedBy`, `auditUserFields` helpers.
- Domain tables: `companies.ts`, `users.ts`, `technicians.ts`, `jobs.ts`, `refresh-tokens.ts`, `notifications.ts`, `job-assignments.ts`, `job-status-history.ts`.
- `index.ts` — Exports all schema modules.

---

## 2. Schema Migration Workflow

When schema definitions are updated in `apps/api/src/infrastructure/database/schema/`:

1. Generate SQL migration:
   ```bash
   pnpm db:generate
   ```
2. Apply migration to local PostgreSQL database:
   ```bash
   pnpm db:migrate
   ```
3. Seed test multi-company data:
   ```bash
   pnpm db:seed
   ```

---

## 3. Database Transactions & Native SQL

### Transaction Helper:
Always wrap multi-table mutations in `withTransaction`:
```ts
import { withTransaction, DatabaseClient } from '../infrastructure/database/client'

export async function changeJobStatus(
  jobId: string,
  newStatus: JobStatus,
  userId: string,
  client: DatabaseClient = db
) {
  return withTransaction(async (tx) => {
    // 1. Update job status
    await jobRepo.updateJobStatus(jobId, newStatus, tx)
    // 2. Insert history record
    await jobRepo.createStatusHistory({ jobId, toStatus: newStatus, changedBy: userId }, tx)
  })
}
```

### Native SQL Queries:
Use `executeRaw` with `sql` template tags:
```ts
import { executeRaw } from '../infrastructure/database/client'
import { sql } from 'drizzle-orm'

const results = await executeRaw(sql`
  SELECT id, name, ST_Distance(current_location, ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography) AS distance
  FROM technicians
  WHERE company_id = ${companyId}
  ORDER BY distance ASC
`, client)
```
