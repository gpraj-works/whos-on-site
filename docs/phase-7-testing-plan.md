# Phase 7 — Testing (Plan)

> Scope: carry the remaining Phase 6 leftovers into this phase, then build the full test suite in priority order, treating tenant isolation as the single most important thing to prove.

---

## 1. Phase 6 Leftovers Carried Into 7

| Item | Status | Evidence | Plan |
| ---- | ------ | -------- | ---- |
| `job_delayed` reminder wiring | **Inert** — infrastructure exists but never scheduled | `enqueueDelayedReminderJob()` defined in `apps/api/src/jobs/queues/notification.queue.ts:42` with zero call sites in `apps/api/src`; worker branch ready in `apps/api/src/jobs/workers/notification.worker.ts:15` | Call `enqueueDelayedReminderJob(companyId, jobId)` from `createNewJob` in `apps/api/src/modules/jobs/job.service.ts:31` on **job creation only**. The `reminder:${jobId}` dedupe jobId prevents double-scheduling; the worker re-checks state at fire time and writes only if the job is still `unassigned`/`assigned`. No schema change required. |
| Customer status page folder | **Accepted as intentional** | Page lives at `apps/web/src/pages/CustomerStatusPage.tsx` (same folder as `Dashboard`, `Dispatch`, `Login`); no `apps/web/src/modules/` directory exists | Leave in place. `PLAN.md` §8's `modules/customer/` layout is aspirational; the current `pages/` placement is functionally equivalent, covered by `apps/web/src/test/components/CustomerStatusPage` (renders timeline + status stepper), and the route (`/status/:token` in `apps/web/src/app/app.tsx:76`) is already wired. |

---

## 2. Phase 7 Objective

Build the test suite in the priority order from `PLAN.md` §11 — **tenant isolation > auth > status-transition > e2e happy path** — and stand up the test infrastructure so the verification commands referenced in `AGENTS.md`, `REVIEW.md`, and the code-review skill actually exist.

### Current deficit (why task 2.1 is the first task)

- Zero test files exist anywhere in the repo.
- No `vitest.config.*`, no `playwright.config.*`.
- No `test`, `test:phase2`, or `test:e2e` scripts in `apps/api/package.json`, `apps/web/package.json`, or the root `package.json`.
- `pnpm --filter @whosonsite/api test:phase2` (cited in `AGENTS.md:77` as the mandatory verification command) currently fails — the script does not exist. This phase must make it real.

---

## 3. Task Breakdown

### 3.1 Test Infrastructure (prerequisite)

- Install in `apps/api`: `vitest`, `supertest`, `@types/supertest`, `@vitest/coverage-v8`.
- Install in `apps/web`: `vitest`, `@testing-library/react`, `@testing-library/jest-dom` (component-level coverage; e2e stays in Playwright), `@vitest/coverage-v8`.
- Install in root: `@playwright/test`, `playwright`.
- Create `apps/api/vitest.config.ts` with the shared-package alias (`@whosonsite/shared`) and environment config.
- Create `apps/web/vitest.config.ts` similarly.
- Create `playwright.config.ts` at the root targeting the dev server + API.
- Add scripts:
  - `apps/api`: `test` (unit: `vitest run`), `test:phase2` (security & spatial integration: `vitest run --config vitest.integration.config.ts` or a tagged integration suite), `test:coverage`.
  - `apps/web`: `test`, `test:coverage`.
  - root: `test`, `test:phase2`, `test:e2e`, `test:coverage` forwarding to workspace filters.

### 3.2 Tenant-Isolation Integration Tests (P0 — top priority)

Prove Company A's authenticated requests can never read or mutate Company B's rows, across every resource type:

- Jobs: list, get-by-id, patch, status update, assign.
- Technicians: list, nearby.
- Notifications: list.
- At least one test that **fails if the `company_id` filter is accidentally omitted** (e.g., seed Company B rows, query as Company A, assert zero cross-tenant results).

### 3.3 Auth Integration Tests

- Full flow: register → login → access → refresh → logout.
- Refresh-token rotation-on-use and revocation (`revoked_at` single-row update).
- Reuse detection: replaying an already-rotated refresh token is rejected and revokes the chain.
- `authLimiter` rate limiting on `/api/auth/*`.

### 3.4 Status-Transition Unit Tests

Tests `job.state-machine.ts` in isolation:

- Every legal transition (`UNASSIGNED → ASSIGNED → EN_ROUTE → ON_SITE → COMPLETE`, plus `CANCELLED` from the first three states).
- Every illegal transition rejected with a clear error (`COMPLETE → *`, `ON_SITE → CANCELLED`, etc.).
- Terminal-state immutability.

### 3.5 PostGIS Query-Builder Unit Tests

Mocked/parameterized tests (no live DB):

- `findNearbyTechnicians` SQL: correct `company_id` scoping, `ST_DWithin` radius, `ST_Distance` ordering.
- Location-ping update writes `current_location` + `last_location_at`.
- Empty-result behavior.

### 3.6 Job CRUD + RBAC Integration Tests

- Full CRUD with authenticated requests.
- Technician role restrictions: can read/update only their own assigned jobs, cannot list company-wide jobs.
- Geocoding-fallback path: bad/non-geocodable address saves with `location = null` and `geocoding_status: pending`.

### 3.7 Playwright E2E Happy Path

- Dispatcher assigns a job → technician updates status → dispatcher board reflects it live.
- Must pass reliably (non-flaky) on repeated runs.

### 3.8 Coverage Reporting & Gap Closure

- Coverage report via `@vitest/coverage-v8` across `shared`, `api`, `web`.
- Fix any untested paths the priority order surfaces (isolation and auth first).

---

## 4. Verification

Per `AGENTS.md` verification checklist:

1. `pnpm typecheck` — 0 errors across all 3 workspace packages (`shared`, `api`, `web`).
2. `pnpm --filter @whosonsite/api test:phase2` — security & spatial integration tests pass (now a real, passing command).
3. `pnpm test` — full unit + integration suite green.
4. `pnpm test:e2e` — Playwright happy path passes reliably.

---

## 5. Phase 6 Exit Criteria Gaps Still Open

Before Phase 7 is considered done, confirm the Phase 6 exit criteria that could not be proven without tests:

- Expired share-link token returns `404`, not stale job data → covered by a `public-status` integration test.
- Reminder notifications visibly landing in the `notifications` table → covered by the `job_delayed` worker test after wiring (task 3.1 leftover fix).

---

## 6. Deliverables

- Full test suite matching the priority order: tenant-isolation > auth > status-transition > e2e happy path.
- Test infrastructure in place: vitest (+ supertest for the API), Playwright, coverage reporting.
- CI-runnable test commands (`pnpm test`, `pnpm test:e2e`) that pass locally.