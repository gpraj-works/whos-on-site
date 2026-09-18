# Plan — Roles, RBAC, Role-Based Pages, Dashboards & Analytics Widgets

- Status: Proposed (awaiting confirmation of flagged defaults in §3)
- Goal: Introduce a **4-role access model** (`owner`, `admin`, `staff`, `agent`) implemented end-to-end via a typed permission system, and restructure the Dashboard + Analytics into **role-based widget registries**.
- References: `PLAN.md` §10 (road map), `docs/tmp-billing.md` (parked billing effort), `.agents/skills/whosonsite-db/SKILL.md` + `whosonsite-domain/SKILL.md` (runbook rules that must stay in sync).

---

## 1. Scope

| In scope                                                                                                                | Out of scope                                       |
| ----------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------- |
| `staff` role added to schema, seed, middleware, guards, sidebar, i18n                                                   | Drag-and-drop / persisted dashboard layout         |
| Typed `Permission` + `ROLE_PERMISSIONS` map in `@whosonsite/shared`                                                     | DB-backed `role_permissions` tables                 |
| `requirePermission` API middleware replacing role whitelists                                                            | Custom per-user permission overrides                |
| People management module (list users, create, change role, activate/deactivate)                                         | Invitation emails / password-reset emails           |
| Role-based Dashboard + Analytics via typed widget registries                                                            | Real routing-optimization engine for Route Plans    |
| Agent **Route Plans** page (day-route of own jobs: map + ordered list)                                                  | Offline route editing / persisted route tables (v2) |
| Owner **Subscription/Billing** placeholder page (real billing stays `docs/tmp-billing.md`)                              | Stripe integration                                 |
| Staff-focused Dashboard + Job/Customer/Analytics affordances                                                            | Customer portal                                     |

---

## 2. Pre-existing gaps — pages & features not yet implemented

> These are called out **before** the role-based implementation below because the role model references them. They are separate work items and are NOT delivered by this plan's RBAC refactor alone.

| Gap | Where it should live | Status today | Needed for |
| --- | -------------------- | ------------ | ---------- |
| **Staff role & Staff pages** | `staff` role, Staff Dashboard, staff Job list (read-only), staff Customer page | **Not implemented.** Role does not exist; only `owner/admin/agent` exist. No staff-specific page or dashboard component. | STAFF tier |
| **Route Plans page** | `/route-plans` (agent), derived day-route of own jobs | **Not implemented.** No route concept, page, or endpoint exists. Derived from jobs (`assignedAgentId` + `date`) — no new table in v1. | AGENT page |
| **People / Team management** | `/people` page + `users` API module | **Not implemented.** `users` table exists (email, password, role) but has no management UI/API, no `name`, no `status`. | OWNER/ADMIN pages |
| **Subscription / Billing page** | `/subscription` (owner) | **Not implemented** (parked in `docs/tmp-billing.md`, "Phase 11"). This plan ships a placeholder card only. | OWNER page |
| **Company settings** | `/settings` → Company section (owner) | **Not implemented.** `/settings` only has Theme. No company edit (name/contact) API. | OWNER page |
| **Personal analytics** | `GET /api/analytics/me` + "My Performance" agent widget | **Not implemented.** Analytics only has company-wide `/summary` (owner/admin). | AGENT widget |
| **Top-agents metric** | `topAgents[]` in analytics summary; Analytics table widget | **Not implemented.** Needed for a role-differentiating Analytics widget. | OWNER/ADMIN widget |

`staff` in particular: **the Staff Dashboard, Staff nav, and Staff-specific pages must be built** (this plan defines their widget set and permission map, but the pages themselves are new work to schedule).

---

## 3. Role model & recorded decisions

### 3.1 Roles (industry-aligned — matches Jobber/Housecall/Inspect Point tiering)

| Role  | Count            | Purpose                                                        | Blocked from                                                      |
| ----- | ---------------- | -------------------------------------------------------------- | ----------------------------------------------------------------- |
| OWNER | **exactly 1/company** | Full access; subscription/billing; company settings; transfers ownership | (nothing)                                                   |
| ADMIN | many             | Full operational access; manages admins, staff, agents         | Subscription, billing, company settings, owner management         |
| STAFF | many             | Office/CSR — full customers, read-only jobs, view agents status | Dispatch, assignment, analytics, people management                |
| AGENT | many             | Field — own dashboard, my jobs, route plans, status updates    | All company-wide data                                             |

### 3.2 Decisions (defaults flagged — confirm or override)

| # | Decision | Default | Rationale |
| - | -------- | ------- | --------- |
| D1 | Staff jobs access | **Read-only** (view all company jobs, no CRUD/assign) | Staff answer customer calls; need to look up job status. CSR "book jobs" role can be added later. |
| D2 | Single owner | **Hard guarantee.** Exactly one OWNER via partial unique index `(company_id, role) WHERE role = 'owner'` + service rule. Transfer ownership = owner sets another member to OWNER → requester auto-demoted to ADMIN. | Prevents an unowned or double-owned company. |
| D3 | Admin managing admins | Admin may create/demote/deactivate ADMINS and manage STAFF/AGENT. Admin can **never** touch the OWNER. | Stated by product owner; retained. |
| D4 | Route Plans v1 | Today's assigned jobs sorted by `scheduled_at`, shown as map + ordered list. Manual reordering & persistence deferred to v2 (`route_plans` table). | Zero new schema; reuses jobs data + filters. |
| D5 | People page shape | Single `/people` page with role-filter tabs (All / Admins / Staff / Agents) rather than 4 separate routes. | Avoids three near-identical admin pages. |

---

## 4. Permission system (`@whosonsite/shared`)

### 4.1 Permission constants

New file `packages/shared/src/permissions.ts` (exported from index). Values are kebab-case strings; keys are `SCREAMING_SNAKE_CASE` (matches existing enum conventions).

| Group    | Permission keys |
| -------- | --------------- |
| Jobs     | `JOBS_VIEW_ALL`, `JOBS_VIEW_OWN`, `JOBS_CREATE`, `JOBS_UPDATE`, `JOBS_DELETE`, `JOBS_ASSIGN`, `JOBS_STATUS_UPDATE`, `JOBS_HISTORY_VIEW` |
| Agents   | `AGENTS_VIEW`, `AGENTS_CREATE`, `AGENTS_UPDATE`, `AGENTS_DELETE` |
| Customers| `CUSTOMERS_VIEW`, `CUSTOMERS_CREATE`, `CUSTOMERS_UPDATE`, `CUSTOMERS_DELETE` |
| Analytics| `ANALYTICS_VIEW`, `ANALYTICS_VIEW_PERSONAL` |
| Route    | `ROUTE_PLANS_VIEW_OWN` |
| People   | `USERS_VIEW`, `USERS_CREATE`, `USERS_UPDATE`, `USERS_DEACTIVATE` |
| Company  | `COMPANY_VIEW`, `COMPANY_UPDATE` |
| Billing  | `BILLING_VIEW`, `BILLING_MANAGE` |

Helpers: `roleHasPermission(role, perm)` and `roleHasAnyPermission(role, perms[])`.

### 4.2 `ROLE_PERMISSIONS` matrix

| Permission              | OWNER | ADMIN | STAFF | AGENT |
| ----------------------- | :---: | :---: | :---: | :---: |
| `JOBS_VIEW_ALL`         | ✓ | ✓ | ✓ | — |
| `JOBS_VIEW_OWN`         | — | — | — | ✓ |
| `JOBS_CREATE`           | ✓ | ✓ | — | — |
| `JOBS_UPDATE`           | ✓ | ✓ | — | — |
| `JOBS_DELETE` / cancel  | ✓ | ✓ | — | — |
| `JOBS_ASSIGN`           | ✓ | ✓ | — | — |
| `JOBS_STATUS_UPDATE`    | ✓ | ✓ | — | ✓ |
| `JOBS_HISTORY_VIEW`     | ✓ | ✓ | — | ✓ |
| `AGENTS_VIEW`           | ✓ | ✓ | ✓ | — |
| `AGENTS_CREATE/UPDATE/DELETE` | ✓ | ✓ | — | — |
| `CUSTOMERS_VIEW`        | ✓ | ✓ | ✓ | — |
| `CUSTOMERS_CREATE/UPDATE/DELETE` | ✓ | ✓ | ✓ | — |
| `ANALYTICS_VIEW`        | ✓ | ✓ | — | — |
| `ANALYTICS_VIEW_PERSONAL` | — | — | — | ✓ |
| `ROUTE_PLANS_VIEW_OWN`  | — | — | — | ✓ |
| `USERS_VIEW`            | ✓ | ✓ | — | — |
| `USERS_CREATE`          | ✓ | ✓ | — | — |
| `USERS_UPDATE`          | ✓ | ✓ | — | — |
| `USERS_DEACTIVATE`      | ✓ | ✓ | — | — |
| `COMPANY_VIEW`          | ✓ | — | — | — |
| `COMPANY_UPDATE`        | ✓ | — | — | — |
| `BILLING_VIEW` / `BILLING_MANAGE` | ✓ | — | — | — |

> Row-scoping stays in the service layer, not the matrix: AGENT gets `JOBS_VIEW_OWN` / `JOBS_STATUS_UPDATE` and the repository already restricts to the caller's own jobs (via `agents.user_id`). `USERS_*` carry an extra target-role rule (§6.4): ADMIN may only manage STAFF/AGENT/ADMIN rows, never OWNER.

---

## 5. Navigation & page gating per role

| Page | Route | OWNER | ADMIN | STAFF | AGENT |
| ---- | ----- | :---: | :---: | :---: | :---: |
| Dashboard | `/dashboard` | Global | Global | **Staff view** | Personal |
| My Jobs | `/my-jobs` | — | — | — | ✓ |
| Route Plans | `/route-plans` | — | — | — | ✓ (new) |
| Jobs | `/jobs` | ✓ | ✓ | read-only | — |
| Agents | `/agents` | ✓ | ✓ | view-only | — |
| Customers | `/customers` | ✓ | ✓ | ✓ | — |
| Analytics | `/analytics` | ✓ | ✓ | — | — |
| People | `/people` | ✓ | ✓ | — | — (new) |
| Settings | `/settings` | ✓ | ✓ | ✓ | ✓ (theme only) |
| Subscription | `/subscription` | ✓ | — | — | — (placeholder) |

Sidebar nav items switch from hard-coded `roles[]` to `useCan(permission)`:

```ts
dashboard  🡒 all roles
jobs       🡒 JOBS_VIEW_ALL
my-jobs    🡒 JOBS_VIEW_OWN
route-plans🡒 ROUTE_PLANS_VIEW_OWN
agents     🡒 AGENTS_VIEW
customers  🡒 CUSTOMERS_VIEW
analytics  🡒 ANALYTICS_VIEW
people     🡒 USERS_VIEW
settings   🡒 (all authenticated, via header menu)
subscription 🡒 BILLING_VIEW
```

---

## 6. API — new & changed modules

### 6.1 Middleware

- Add `requirePermission(...perms)` (any-of) to `apps/api/src/middleware/authorize.ts`, backed by `roleHasAnyPermission` + `ROLE_PERMISSIONS`.
- Replace the `authorize(role...)` whitelists with permission checks in `job.routes.ts`, `agent.routes.ts`, `customer.routes.ts`, `analytics.routes.ts`.

### 6.2 Jobs routes mapping

| Route | Today (roles) | New (permission) |
| ----- | ------------- | ---------------- |
| `GET /` + `GET /:id` | OWNER/ADMIN/AGENT | `JOBS_VIEW_ALL, JOBS_VIEW_OWN` |
| `POST /` | OWNER/ADMIN | `JOBS_CREATE` |
| `PATCH /:id` | OWNER/ADMIN | `JOBS_UPDATE` |
| `DELETE /:id` | OWNER/ADMIN | `JOBS_DELETE` |
| `POST /:id/assign`, `/unassign` | OWNER/ADMIN | `JOBS_ASSIGN` |
| `POST /:id/status` | all | `JOBS_STATUS_UPDATE` |
| `GET /:id/status-history` | all | `JOBS_HISTORY_VIEW` |

### 6.3 Other module mapping

| Module | Routes | New permission |
| ------ | ------ | -------------- |
| agents | GET | `AGENTS_VIEW` |
| agents | POST / PATCH / DELETE | `AGENTS_CREATE` / `AGENTS_UPDATE` / `AGENTS_DELETE` |
| customers | GET | `CUSTOMERS_VIEW` |
| customers | POST / PATCH / DELETE | `CUSTOMERS_CREATE` / `CUSTOMERS_UPDATE` / `CUSTOMERS_DELETE` |
| analytics | GET `/summary` | `ANALYTICS_VIEW` |
| analytics | GET `/me` (new) | `ANALYTICS_VIEW_PERSONAL` |

### 6.4 People (users) module — new

Mirror existing module layout: `apps/api/src/modules/users/{users.routes,users.controller,users.service,users.repository,users.schema}.ts`. Mount `apiRouter.use('/users', usersRouter)` in `routes/index.ts`.

| Endpoint | Permission | Behavior |
| -------- | ---------- | -------- |
| `GET /users` | `USERS_VIEW` | Company members: `{id, email, name?, role, status, agentLinked, agentId?, createdAt}` (JOIN `agents.user_id`). |
| `POST /users` | `USERS_CREATE` | Body `{email, name?, password, role}`. Unique email per company. Role rules per D3: ADMIN may create only STAFF/AGENT (+ADMIN per D3); OWNER may create any except a second OWNER (D2). |
| `PATCH /users/:id` | `USERS_UPDATE` | Change `name` / `role` / `status`. Guards: no self-deactivate; ADMIN never edits OWNER; ADMIN manages only STAFF/AGENT/ADMIN; only OWNER promotes to OWNER (auto-demote self per D2). |
| No `DELETE` in v1 | — | Deactivation instead (FK-safe). |

### 6.5 Analytics extension

- `AnalyticsSummaryDto` += `totalUsersCount: number`, `topAgents: TopAgentMetric[]` where `TopAgentMetric = { agentId, name, completedJobs, totalJobs, completionPct }`.
- New `GET /api/analytics/me` → `PersonalAnalyticsDto`: own `jobsByStatus`, completion rate, avg completion minutes.
- Web `useSocketEvents`: invalidate `['analytics']` keys on job events (today only jobs/agents keys are refreshed).

---

## 7. Dashboard — widget registry

New file `apps/web/src/components/dashboard/registry.ts`:

```ts
type DashboardWidgetId =
  | 'myJobsToday' | 'nextAppointment' | 'completionRate' | 'todaySchedule' | 'myPerformance'
  | 'activeJobs' | 'agentsOnline' | 'completedToday' | 'unassignedJobs'
  | 'enRoute' | 'onSite' | 'assigned' | 'totalJobs'
  | 'recentJobsTable' | 'dispatchCompletion' | 'fieldAgents'
  | 'customersSnapshot' | 'teamSnapshot' | 'billingOverview'
```

Registry map: `{ id → { component, span } }` (each widget self-contained with its own hooks). `DASHBOARD_WIDGETS_BY_ROLE: Record<UserRole, DashboardWidgetId[]>` rendered by a generic `RoleDashboard` in a single `Grid gutter="sm"` (Mantine wraps by span).

| Widget | OWNER | ADMIN | STAFF | AGENT |
| ------ | :---: | :---: | :---: | :---: |
| activeJobs / enRoute / onSite / assigned / totalJobs | ✓ | ✓ | — | — |
| unassignedJobs | ✓ | ✓ | — | — |
| completedToday / dispatchCompletion | ✓ | ✓ | — | — |
| agentsOnline / fieldAgents | ✓ | ✓ | ✓ (status only) | — |
| recentJobsTable | ✓ | ✓ | ✓ (read-only) | — |
| customersSnapshot (new) | ✓ | ✓ | ✓ | — |
| myJobsToday / nextAppointment / completionRate / todaySchedule | — | — | — | ✓ |
| myPerformance (new; from `/analytics/me`) | — | — | — | ✓ |
| teamSnapshot (new) | ✓ | ✓ | — | — |
| billingOverview (placeholder) | ✓ | — | — | — |

Refactor: split `ManagementDashboard.tsx` (8 StatCards + 3 cards) and `AgentDashboard.tsx` into discrete widget files under `apps/web/src/components/dashboard/widgets/`. `pages/Dashboard.tsx` becomes registry-driven. **STAFF needs a new StaffDashboard widget set** (a "still to be implemented" page per §2) — customer-focused snapshot + read-only recent jobs + field-agent status.

---

## 8. Analytics page — widget registry

Refactor `pages/Analytics.tsx` into `components/analytics/{registry,widgets}.ts`. Move hard-coded English tile titles into `analytics.*` i18n keys.

| Widget | OWNER | ADMIN | STAFF | AGENT |
| ------ | :---: | :---: | :---: | :---: |
| Stat tiles (total / active / completed / avg duration / field techs) | ✓ | ✓ | — | — |
| jobsByStatusDonut | ✓ | ✓ | — | — |
| agentAvailability | ✓ | ✓ | — | — |
| jobsTrendBar (14-day) | ✓ | ✓ | — | — |
| topAgentsTable (new) | ✓ | ✓ | — | — |
| teamSnapshot (new) | ✓ | ✓ | — | — |
| billingOverview placeholder | ✓ | — | — | — |

---

## 9. Route Plans page (agent) — new page

- Route: `/route-plans`, guarded `ROUTE_PLANS_VIEW_OWN`. Sidebar entry for AGENT only.
- Data: `useJobs({ date: today, limit: 100 })` (server-scoped to caller) — no new endpoint.
- UI: `Stack gap="xs"` → PageHeader (`routePlans.*` i18n) → `<JobMap>` of today's stops + ordered `DashboardTable`/"stops" list sorted by `scheduled_at` (each with en-route/on-site/complete controls reusing `useUpdateJobStatus`).
- v2 (deferred): persisted `route_plans` table + manual re-ordering + optimization.

---

## 10. Settings split & Subscription placeholder

- `/settings` = tabbed: **Theme** (all roles), **Company** (owner, `COMPANY_UPDATE`; name/contact read + minimal edit), **Billing** (owner placeholder).
- `/subscription` (owner, `BILLING_VIEW`): status card + "manage" placeholder linking to `docs/tmp-billing.md` scope.

---

## 11. Database migration `0003`

- `user_role` enum += `'staff'`.
- `users` += nullable `name text`, `status` via new `user_status` enum (`active`/`deactivated`, default `active`).
- Backfill: existing rows → `status = 'active'`; name from linked `agents.name` where present.
- Single-owner constraint: partial unique index on `(company_id)` `WHERE role = 'owner'`.
- Apply with `pnpm db:generate` + hand-review + `pnpm db:migrate`. Update `db:seed` (add a `staff` account per company; keep one owner).

---

## 12. i18n keys to add (`en.ts` + `ta.ts`)

`nav.routePlans`, `nav.people`, `nav.subscription`, `analytics.title|subtitle` + all widget titles, `staff.*`, `routePlans.*`, `people.*` (`users.*`), `billing.*`, `company.*`, `dashboard.customersSnapshot`, `dashboard.teamSnapshot`, `dashboard.billingOverview`, `personal.*`.

---

## 13. Web permission wiring

- New `apps/web/src/components/auth/RequirePermission.tsx` + `useCan(perm)` hook + `Can` gate.
- Replace `AgentOnly`/`ManagementOnly` usage with permission guards:
  `/my-jobs`→`JOBS_VIEW_OWN` · `/route-plans`→`ROUTE_PLANS_VIEW_OWN` · `/jobs`→`JOBS_VIEW_ALL` · `/analytics`→`ANALYTICS_VIEW` · `/agents`→`AGENTS_VIEW` · `/customers`→`CUSTOMERS_VIEW` · `/people`→`USERS_VIEW`.
- Action-level gating with `useCan`: Jobs "New"/assign/cancel buttons; Customers & Agents edit/delete; Settings tabs; People page actions.
- Agent hitting `/agents`/`/jobs`/`/analytics` → redirect `/dashboard`.

---

## 14. Tests & verification

- **API**: `requirePermission` matrix unit test; users module (owner/admin creation rules, self-deactivate block, admin-can't-touch-owner, tenant isolation, single-owner); analytics `/me` + expanded `/summary`; update existing RBAC tests for `requiredPermissions` error payload.
- **Web**: `useCan`/`RequirePermission`; sidebar filtering per role; `RoleDashboard` widget sets per role; People page flows; Settings tab visibility; Route Plans page.
- Verify: `pnpm typecheck` (0 errors, 3 packages), `pnpm test` (api + web), eslint/prettier on changed files, `pnpm db:migrate`, `pnpm db:seed`.

---

## 15. Docs to update

`AGENTS.md` (RBAC section, roles table, users module), `PLAN.md` §5/§6/§10 rows, both `.agents/skills/*/SKILL.md` runbooks, `README.md` demo-login table (add staff login).

---

## 16. Build order

1. Shared `Permission` + `ROLE_PERMISSIONS` + rebuild `@whosonsite/shared`.
2. API middleware + route rewiring + RBAC test updates.
3. Migration `0003` (+ seed staff, single-owner data check) + users/people module + tests.
4. Analytics extension (`/me`, `topAgents`, `totalUsersCount`) + tests.
5. Web permissions (useCan, RequirePermission, guards, sidebar, action gating) + tests.
6. Dashboard widget registry refactor + new widgets (owner/admin/agent) + tests.
7. Analytics widget registry + i18n + topAgents table.
8. **New pages (pre-existing gaps from §2)**: Staff dashboard + staff customer/jobs affordances, Route Plans page, People page, Settings Company tab + Subscription placeholder.
9. i18n en/ta, docs, full verification.

---

## 17. Files touched (primary)

| Action | File |
| ------ | ---- |
| Add | `packages/shared/src/permissions.ts` (+ export from `index.ts`) |
| Edit | `packages/shared/src/types/index.ts` (`AnalyticsSummaryDto` + `TopAgentMetric` + `PersonalAnalyticsDto`) |
| Edit | `apps/api/src/middleware/authorize.ts` (add `requirePermission`) |
| Edit | `apps/api/src/modules/{jobs,agents,customers,analytics}/*.routes.ts` |
| Add | `apps/api/src/modules/users/*` (5 files) |
| Add | `apps/api/src/infrastructure/database/migrations/0003_*.sql` |
| Edit | `apps/api/src/infrastructure/database/schema/users.ts` (`name`, `status`, partial unique idx; `staff` enum) |
| Edit | `apps/api/src/infrastructure/database/seed/index.ts` |
| Add | `apps/web/src/components/dashboard/registry.ts` + `widgets/*` |
| Edit | `apps/web/src/pages/Dashboard.tsx`, `pages/Analytics.tsx`, `pages/AgentJobs.tsx` |
| Add | `apps/web/src/pages/RoutePlans.tsx`, `app/route/AppRoutes.tsx` (route), `pages/People.tsx`, `pages/StaffDashboard.tsx`, `pages/Subscription.tsx` |
| Edit | `apps/web/src/components/auth/{RequirePermission,AgentOnly,ManagementOnly,ProtectedRoute}.tsx`, `layout/AppSidebar.tsx`, `app/app.tsx` |
| Add/Edit | `apps/web/src/components/analytics/{registry,widgets}.ts` |
| Edit | `apps/web/src/components/users/*` (People UI), `components/customers/Form.tsx`, `components/agents/Form.tsx` (Can-gating) |
| Edit | `apps/web/src/app/i18n/resources/{en,ta}.ts` |
| Edit | `docs/{AGENTS.md,README.md}`, `PLAN.md`, `.agents/skills/whosonsite-db/SKILL.md`, `.agents/skills/whosonsite-domain/SKILL.md` |

---

## 18. Recorded decisions to confirm before build

| ID | Decision | Default |
| -- | -------- | ------- |
| D1 | Staff jobs access | Read-only |
| D2 | Single owner enforcement | Hard + transfer-ownership demote self |
| D3 | Admin managing admins | Allowed (owner untouchable by admin) |
| D4 | Route Plans v1 | Sorted day-route, no optimization |
| D5 | People page shape | One page, role-filter tabs |