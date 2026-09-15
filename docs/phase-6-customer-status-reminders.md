# Phase 6 — Customer Status Page & Reminder Notifications (Completion Plan)

> Scope: the remaining Phase 6 work items from `PLAN.md` §10 — the public customer status page and scheduled reminder notifications. The technician mobile-web view is already complete.

---

## 1. Current State vs. Missing Work

| Area | Status |
| ---- | ------ |
| Technician mobile view (`/my-jobs`) | Complete — one-tap status flow, GPS tracking, backoff retry |
| Notification queue + worker | Exists — writes rows to `notifications` with `sentAt: now` |
| **Customer status page** | **Missing entirely** — no `share_token`, no `/public` routes, no frontend page |
| **Scheduled/reminder notifications** | **Missing** — only reactive jobs, no BullMQ `delayed` / `repeatable` jobs |
| Public job detail (unauthenticated) | Missing |

---

## 2. Design Decision: Share-Link Token

Per `PLAN.md` §9 Flow C: the token must be *unguessable* (UUID or signed) and expire *48 hours after the job reaches a terminal status* (complete/cancelled), returning `404` after expiry.

**Recommended approach: add a `share_token uuid NOT NULL DEFAULT gen_random_uuid()` column to `jobs` with a unique index.**

Rationale:
- UUIDv4 satisfies the "unguessable share-link tokens" security checklist item.
- Expiry is state-dependent (48h after `updated_at` when terminal), not fixed at creation — a signed token would still require a DB lookup to determine job state, so signing adds no value.
- No extra table; the token is generated automatically at job creation with no crypto wiring.

**Rejected alternative:** signed JWT embedding `{jobId, companyId}` — still requires a DB lookup for state/expiry and adds signing complexity for zero benefit.

---

## 3. Task Breakdown

### 3.1 Database — Share Token (Drizzle migration)

- Add `share_token uuid NOT NULL DEFAULT gen_random_uuid()` to `apps/api/src/infrastructure/database/schema/jobs.ts`, plus a unique index.
- Generate the migration via drizzle-kit and apply it.
- Do **not** expose the token in the internal `JobDto` query paths beyond what the frontend needs to render the share-link button (see §3.3).

### 3.2 Backend — Public Customer Status Module

Create `apps/api/src/modules/public-status/` (unauthenticated, following the existing module pattern):

- **`public-status.routes.ts`** — `GET /jobs/:token`, no `authenticate` middleware.
- **`public-status.controller.ts`** — parse `:token`, call service, `sendSuccess`.
- **`public-status.service.ts`** — look up job by token; if status is `complete|cancelled` and `updated_at + 48h < now()` → `NotFoundError`. Return job ID, status, customer name, technician name, scheduled/updated timestamps, and the trimmed status history.
- **`public-status.repository.ts`** — `findJobByShareToken(token)`. The `company_id` scope is derived from the matched **job row** itself, never from client input.
- **Mount** in `routes/index.ts` as `apiRouter.use('/public', publicStatusRouter)`.

### 3.3 Backend — Share-Link Exposure in Job Detail

- Add `shareToken` to the shared `JobDto` type so the dispatcher UI can build the share URL and expose it in the job detail drawer.

### 3.4 Frontend — Customer Status Page

Create `apps/web/src/modules/customer/` (mobile-first, minimal chrome, distinct from the dense dispatch board):

- **`CustomerStatusPage.tsx`** — fetches `GET /api/public/jobs/:token`, reads `:token` from route params.
- **Status stepper/timeline** — `UNASSIGNED → ASSIGNED → EN_ROUTE → ON_SITE → COMPLETE`, with the `CANCELLED` state rendered distinctly.
- Displays customer name, technician name, current status badge, and per-step timestamps from history.
- **Auto-poll** every ~30s while the page is open (a public page has no authenticated socket).
- **`CustomerStatusLayout`** — minimal standalone frame (logo + status), usable at mobile widths.
- **Route** in `apps/web/src/app/app.tsx`: `<Route path="/status/:token" element={<CustomerStatusPage />} />`, outside `ProtectedRoute`.
- **i18n**: add a `customerStatus`-scoped resource to `en` and `ta`.
- **Share-link UI**: add a "Copy Share Link" button to `DetailDrawer.tsx` that copies the `/status/:token` URL.

### 3.5 Backend — Scheduled & Reminder Notifications

Extend the existing notification pipeline in `apps/api/src/jobs/`:

- **`job_delayed` reminder** — a delayed BullMQ job (e.g. `delay: 15min`) scheduled at job creation/assignment. The worker re-checks the job; if it is still in `unassigned`/`assigned` and not started, write a `job_delayed` notification row.
- **`daily_summary` repeatable job** — BullMQ `repeat: { cron }` (e.g. daily 08:00) that counts jobs created/completed per company and writes one `notifications` row per active company.
- Register both with the existing notification worker (`jobs/workers/notification.worker.ts`) and add repeatable-job registration in `worker.ts`.

### 3.6 Shared Package Additions (`packages/shared`)

- **`CustomerStatusDto`** type — `{ jobId, status, customerName, technicianName, scheduledAt, updatedAt, lastNote, history: JobStatusHistoryDto[] }`.
- Extend `JobDto` with `shareToken: string`.
- Zod schema for the public-status response, if controller-side validation is desired.

---

## 4. Verification

Per `AGENTS.md` verification checklist:

1. `pnpm typecheck` — 0 errors across `shared`, `api`, `web`.
2. `pnpm --filter @whosonsite/api test:phase2` — security & spatial integration tests pass.

Manual checks:

- Create a job → copy the share link → open it unauthenticated → confirm status renders.
- Complete the job → confirm the link still renders.
- Simulate 48h-after-terminal → confirm the link returns `404`.

---

## 5. Open Questions

1. **Share-link UX**: minimal "copy link" button in the job detail drawer (recommended) vs. a full share-via-SMS/email flow.
2. **`daily_summary` cron**: include now (recommended, it is explicitly Phase 6 scope) or defer scheduled jobs and ship only the delayed `job_delayed` reminder.
3. **Route naming**: confirm `GET /api/public/jobs/:token` exactly as specified in `PLAN.md`.