# WhosOnSite — Implementation Document

**Field-service dispatch & real-time job tracking platform**

> Replace phone-and-text dispatch with a live, auditable system of record for field jobs.

---

## Table of contents

1. [Project overview](#1-project-overview)
2. [Industry problem & solution](#2-industry-problem--solution)
3. [Tech stack](#3-tech-stack)
4. [System architecture](#4-system-architecture)
5. [Database schema](#5-database-schema)
6. [API design](#6-api-design)
7. [Real-time events (Socket.io)](#7-real-time-events-socketio)
8. [Monorepo folder structure](#8-monorepo-folder-structure)
9. [Core user flows](#9-core-user-flows)
10. [Implementation roadmap — 9 phases](#10-implementation-roadmap--9-phases)
11. [Testing strategy](#11-testing-strategy)
12. [DevOps & deployment](#12-devops--deployment)
13. [Security checklist](#13-security-checklist)
14. [Environment variables](#14-environment-variables)
15. [Stretch goals](#15-stretch-goals)

---

## 1. Project overview

|                                     |                                                                                      |
| ----------------------------------- | ------------------------------------------------------------------------------------ |
| **Name**                            | WhosOnSite                                                                           |
| **Type**                            | Multi-tenant B2B SaaS — dispatch & field-tracking                                    |
| **Primary vertical (demo framing)** | Home services (HVAC / plumbing / electrical repair)                                  |
| **Also fits**                       | Courier/delivery, cleaning crews, roadside assistance, security patrol, inspections  |
| **Core differentiator**             | PostGIS-backed real-time proximity dispatch                                          |
| **Timeline**                        | 9 weeks · 3 hrs/day · ~200 hours total, organized into 9 phases (one phase per week) |
| **Goal**                            | Portfolio-grade, production-quality project for job applications                     |

**One-line pitch:** _A live, permissioned dispatch board that replaces phone-call coordination with real-time job status, technician location, and a timestamped audit trail._

---

## 2. Industry problem & solution

### The problem

Small field-service businesses (10–50 field workers) coordinate their entire day through phone calls and group texts:

- Dispatchers assign jobs from memory, with no visibility into who's free or nearby.
- Job status is invisible until someone calls to ask.
- Customers generate constant "where are they" support calls.
- No audit trail exists when a job runs late or a dispute happens.
- Reassigning a job mid-day (sick call, overrun) is a manual scramble.

### The solution

| Problem                                    | WhosOnSite resolution                                                                         |
| ------------------------------------------ | --------------------------------------------------------------------------------------------- |
| No visibility into technician availability | Live dispatch board showing every job + every technician's current status                     |
| Manual status check-ins                    | One-tap status updates from the technician's phone (assigned → en route → on site → complete) |
| Customer "where are they" calls            | Live status page for the customer, no phone call needed                                       |
| No dispute record                          | Immutable timestamped history on every job                                                    |
| Slow reassignment                          | PostGIS-powered "who's free and nearest" query, reassign in two clicks                        |

---

## 3. Tech stack

### Frontend

| Concern              | Package                                                        | Notes                                                            |
| -------------------- | -------------------------------------------------------------- | ---------------------------------------------------------------- |
| Framework            | `react`, `typescript`, `vite`                                  | Fast dev loop, strong typing                                     |
| UI components        | `@mantine/core`, `@mantine/hooks`, `@mantine/notifications`    | Full component library, dark mode, form handling                 |
| Server state         | `@tanstack/react-query`                                        | Caching, refetch, optimistic updates                             |
| Real-time client     | `socket.io-client`                                             | Live job/status updates                                          |
| Maps                 | `leaflet`, `react-leaflet`                                     | Free, no API key required                                        |
| Forms/validation     | `@mantine/form`, `zod`                                         | Shared schemas with backend                                      |
| Routing              | `react-router-dom`                                             | Standard SPA routing                                             |
| Internationalization | `i18next`, `react-i18next`, `i18next-browser-languagedetector` | English + Tamil support, locale detection, and React integration |

### Backend

| Concern          | Package                              | Notes                                                                                                         |
| ---------------- | ------------------------------------ | ------------------------------------------------------------------------------------------------------------- |
| API framework    | `express`, `typescript`              | Familiar, mature ecosystem                                                                                    |
| ORM              | `drizzle-orm`, `drizzle-kit`         | Thin SQL layer, natural fit for raw PostGIS queries                                                           |
| Database         | `postgresql` (+ `postgis` extension) | Relational integrity + geospatial queries                                                                     |
| Real-time server | `socket.io`                          | Rooms scoped per company (tenant isolation)                                                                   |
| Validation       | `zod`                                | Runtime-safe, shared with frontend                                                                            |
| Auth             | `jsonwebtoken`, `argon2`             | Hand-rolled JWT access/refresh — interview-defensible, no black box. See [Auth details](#auth-details) below. |
| Background jobs  | `bullmq`, `ioredis`                  | Scheduled reminders, notification fan-out                                                                     |
| Rate limiting    | `express-rate-limit`                 | Protects auth + public endpoints                                                                              |
| Geo utilities    | `@turf/turf`                         | Distance/proximity helper functions in app layer                                                              |
| Logging          | `pino`, `pino-http`                  | Structured JSON logs                                                                                          |
| Error tracking   | `@sentry/node`                       | Production error visibility                                                                                   |

API reference for this project is maintained as a hand-written Markdown document (`docs/api-reference.md`) generated from the route table in [section 6](#6-api-design), rather than an auto-generated OpenAPI/Swagger UI — there's a single consumer (the project's own frontend), so a lightweight, version-controlled reference is enough and avoids an extra runtime dependency and attack surface on the API process.

#### Auth details

- **Access tokens**: JWT, 15-minute expiry, sent in the `Authorization` header. Never persisted server-side.
- **Refresh tokens**: opaque random strings (not JWTs), stored hashed in a `refresh_tokens` table (`user_id`, `token_hash`, `expires_at`, `revoked_at`). Sent to the client as an httpOnly, secure cookie — never exposed to JS. Revocation is a single `UPDATE ... SET revoked_at = now()` row, which is why they're stored in a table instead of being self-contained JWTs (a JWT refresh token can't be revoked without an extra denylist anyway, so a DB-backed opaque token is simpler for the same guarantee).
- **Rotation**: every refresh issues a new refresh token and revokes the old one (rotation-on-use), so a stolen, already-used refresh token is detected and the whole chain can be revoked.
- **Technician authentication**: technicians authenticate with the same JWT access/refresh flow as dispatchers, scoped by a `technician` role with a narrower permission set (can only read/update their own assigned jobs, cannot see other technicians' data or company-wide job lists). No separate auth system — one flow, enforced by RBAC, not by a different mechanism.

### Testing

| Concern          | Package            |
| ---------------- | ------------------ |
| Unit/integration | `vitest`           |
| API integration  | `supertest`        |
| E2E              | `@playwright/test` |

### DevOps

| Concern            | Tool                   |
| ------------------ | ---------------------- |
| Containerization   | Docker, docker-compose |
| CI/CD              | GitHub Actions         |
| Deployment         | Railway or Fly.io      |
| Monorepo tooling   | pnpm workspaces        |
| Linting/formatting | ESLint, Prettier       |

### External dependencies

| Dependency                    | Provider                                                                                | Notes                                                                                                                                                                                                                                                                                                                 |
| ----------------------------- | --------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Geocoding (address → lat/lng) | **Nominatim** (OpenStreetMap) via self-hosted rate limit or a free-tier hosted instance | Free, no API key, but rate-limited (~1 req/sec) and lower accuracy than commercial providers — acceptable for portfolio scale. If accuracy becomes a problem, swap to Mapbox Geocoding (free tier: 100k req/month) with no other code changes, since the geocoding call is isolated behind a single service function. |
| Geocoding failure handling    | —                                                                                       | Job creation does not hard-fail if geocoding fails — the job saves with `location = null` and a `geocoding_status: pending` flag, retried via a BullMQ job. A job with no location simply can't be included in "nearby technician" queries until it resolves.                                                         |

---

## 4. System architecture

![WhosOnSite system architecture diagram showing client layer, API layer, data layer, and observability layer](diagrams/01-system-architecture.png)

The client layer (React dispatcher board + technician mobile-web view) talks to the Express API over REST and WebSocket. The API layer writes to PostgreSQL+PostGIS and enqueues background work in Redis+BullMQ, which a separate worker process consumes to send notifications. Pino and Sentry sit alongside as the observability layer, watching both the API and the worker.

**Tenant isolation model:** every row in `jobs`, `technicians`, and related tables carries a `company_id`. All queries are scoped by `company_id` via a middleware layer — no query is ever written without it. Socket.io rooms are namespaced per company (`company:<id>`) so real-time events never leak across tenants.

![Multi-tenancy and data isolation diagram showing two companies sharing tables filtered by company_id, enforced by central tenant-scoping middleware](diagrams/06-multi-tenancy.png)

Every incoming request passes through the tenant-scoping middleware before it ever reaches a route handler: identify the tenant from the JWT, verify permissions, then inject the `company_id` filter. Both Company A and Company B's users, technicians, and jobs live in the same physical tables — isolation is enforced centrally in one place, not re-implemented per query. This is the single piece of the system worth testing most thoroughly (see [Testing strategy](#11-testing-strategy)).

---

## 5. Database schema

### Entity relationship overview

![Entity relationship diagram showing companies, users, technicians, jobs, job_status_history, job_assignments, and notifications tables with primary and foreign keys](diagrams/02-erd.png)

`companies` is the tenant root — `users` and `technicians` both hang off it, and `technicians` optionally link to a `users` row if that field worker has a login. `jobs` carries geography columns for pickup/dropoff and branches into `job_status_history` (the audit trail) and `job_assignments` (which technician is on which job, supporting reassignment). `notifications` references both the company and the user it's meant for.

<details>
<summary>Mermaid source (diffable, kept in sync with the diagram above)</summary>

```mermaid
erDiagram
    companies ||--o{ users : has
    companies ||--o{ technicians : has
    companies ||--o{ jobs : has
    users ||--o| technicians : "may log in as"
    jobs ||--o{ job_status_history : has
    jobs ||--o{ job_assignments : has
    technicians ||--o{ job_assignments : "assigned to"
    companies ||--o{ notifications : has

    companies {
        uuid id PK
        text name
    }
    users {
        uuid id PK
        uuid company_id FK
        text email
        text role
    }
    technicians {
        uuid id PK
        uuid company_id FK
        uuid user_id FK
        geography current_location
        text status
    }
    jobs {
        uuid id PK
        uuid company_id FK
        geography location
        text status
    }
    job_status_history {
        uuid id PK
        uuid job_id FK
        text to_status
        timestamptz changed_at
    }
    job_assignments {
        uuid id PK
        uuid job_id FK
        uuid technician_id FK
    }
    notifications {
        uuid id PK
        uuid company_id FK
        uuid job_id FK
    }
```

</details>

### Core tables

**companies**

| Column     | Type        | Notes |
| ---------- | ----------- | ----- |
| id         | uuid, PK    |       |
| name       | text        |       |
| created_at | timestamptz |       |

**users** (dispatchers, admins, owners)

| Column        | Type                                       | Notes                                                                 |
| ------------- | ------------------------------------------ | --------------------------------------------------------------------- |
| id            | uuid, PK                                   |                                                                       |
| company_id    | uuid, FK → companies                       | tenant scope                                                          |
| email         | text, unique                               |                                                                       |
| password_hash | text                                       | argon2                                                                |
| role          | enum(owner, admin, dispatcher, technician) | RBAC — see [Auth details](#auth-details) for how `technician` differs |
| created_at    | timestamptz                                |                                                                       |

**technicians** (field workers — may or may not have login accounts)

| Column           | Type                           | Notes                                     |
| ---------------- | ------------------------------ | ----------------------------------------- |
| id               | uuid, PK                       |                                           |
| company_id       | uuid, FK                       |                                           |
| user_id          | uuid, FK → users, nullable     | if they log in                            |
| name             | text                           |                                           |
| phone            | text                           |                                           |
| current_location | geography(Point, 4326)         | PostGIS column, updated via location ping |
| status           | enum(available, busy, offline) | derived/updated in real time              |
| last_location_at | timestamptz                    | staleness check                           |

**jobs**

| Column                 | Type                                                               | Notes                |
| ---------------------- | ------------------------------------------------------------------ | -------------------- |
| id                     | uuid, PK                                                           |                      |
| company_id             | uuid, FK                                                           |                      |
| customer_name          | text                                                               |                      |
| customer_phone         | text                                                               |                      |
| address                | text                                                               |                      |
| location               | geography(Point, 4326)                                             | job site coordinates |
| status                 | enum(unassigned, assigned, en_route, on_site, complete, cancelled) |                      |
| scheduled_at           | timestamptz                                                        |                      |
| assigned_technician_id | uuid, FK → technicians, nullable                                   |                      |
| notes                  | text, nullable                                                     |                      |
| created_at             | timestamptz                                                        |                      |
| updated_at             | timestamptz                                                        |                      |

**job_status_history** (the audit trail)

| Column      | Type                       | Notes |
| ----------- | -------------------------- | ----- |
| id          | uuid, PK                   |       |
| job_id      | uuid, FK → jobs            |       |
| from_status | enum, nullable             |       |
| to_status   | enum                       |       |
| changed_by  | uuid, FK → users, nullable |       |
| changed_at  | timestamptz                |       |
| note        | text, nullable             |       |

**notifications**

| Column     | Type                                                 | Notes          |
| ---------- | ---------------------------------------------------- | -------------- |
| id         | uuid, PK                                             |                |
| company_id | uuid, FK                                             |                |
| job_id     | uuid, FK, nullable                                   |                |
| type       | enum(job_delayed, tech_assigned, daily_summary, ...) |                |
| payload    | jsonb                                                |                |
| sent_at    | timestamptz, nullable                                | null = pending |

### Job status state machine

![Job status state machine diagram showing transitions from unassigned to assigned, en_route, on_site, and complete, with a cancelled branch reachable from unassigned, assigned, or en_route](diagrams/03-job-status-state-machine.png)

A job moves strictly forward through `unassigned → assigned → en_route → on_site → complete`, with `cancelled` reachable as a side-exit from **unassigned, assigned, en_route, or on_site**. The one hard rule is terminal-state safety: a job can never be cancelled once it is `complete` (and a late mide-repair change that would strand a technician must be surfaced to the dispatcher instead). Every transition writes a row to `job_status_history`.

<details>
<summary>Mermaid source (diffable, kept in sync with the diagram above)</summary>

```mermaid
stateDiagram-v2
    [*] --> unassigned
    unassigned --> assigned: dispatcher assigns technician
    assigned --> en_route: technician taps en route
    en_route --> on_site: technician taps arrived on site
    on_site --> complete: technician taps complete
    unassigned --> cancelled: dispatcher cancels
    assigned --> cancelled: dispatcher cancels or tech declines
    en_route --> cancelled: dispatcher cancels mid-transit
```

</details>

### Key PostGIS queries you'll implement

```sql
-- Find available technicians within 10km of a job, nearest first
SELECT id, name,
  ST_Distance(current_location, :job_location) AS distance_m
FROM technicians
WHERE company_id = :company_id
  AND status = 'available'
  AND ST_DWithin(current_location, :job_location, 10000)
ORDER BY distance_m ASC;
```

```sql
-- Update a technician's live location (called on each GPS ping)
UPDATE technicians
SET current_location = ST_SetSRID(ST_MakePoint(:lng, :lat), 4326),
    last_location_at = now()
WHERE id = :technician_id;
```

With Drizzle, these are written using `sql\`...\`` template queries against typed columns — you get PostGIS power without losing type safety on the rest of the schema.

**Indexing:**

- `technicians.current_location` and `jobs.location` — GiST index (required for `ST_DWithin`/`ST_Distance` to be fast; without it, every proximity query does a full table scan).
- `jobs (company_id, status)` — composite B-tree index, since the dispatcher board's main query is always "this company's jobs, filtered by status."
- `job_status_history (job_id, changed_at)` — composite index for fast history lookups per job.

---

## 6. API design

### Auth

| Method | Route                | Description                    |
| ------ | -------------------- | ------------------------------ |
| POST   | `/api/auth/register` | Create company + owner account |
| POST   | `/api/auth/login`    | Returns access + refresh token |
| POST   | `/api/auth/refresh`  | Rotate access token            |
| POST   | `/api/auth/logout`   | Invalidate refresh token       |

### Jobs

| Method | Route                   | Description                                           |
| ------ | ----------------------- | ----------------------------------------------------- |
| GET    | `/api/jobs`             | List jobs (filterable by status, date, technician)    |
| POST   | `/api/jobs`             | Create a job                                          |
| GET    | `/api/jobs/:id`         | Job detail incl. status history                       |
| PATCH  | `/api/jobs/:id`         | Update job (address, schedule, notes)                 |
| POST   | `/api/jobs/:id/assign`  | Assign/reassign to a technician                       |
| POST   | `/api/jobs/:id/status`  | Update job status (drives history log + socket event) |
| GET    | `/api/jobs/:id/history` | Full timestamped audit trail                          |

### Technicians

| Method | Route                           | Description                                      |
| ------ | ------------------------------- | ------------------------------------------------ |
| GET    | `/api/technicians`              | List with current status/location                |
| GET    | `/api/technicians/nearby`       | PostGIS proximity query for a given job location |
| POST   | `/api/technicians`              | Add a technician                                 |
| PATCH  | `/api/technicians/:id/location` | Location ping from field-worker device           |

### Public (customer-facing, no auth)

| Method | Route                     | Description                                         |
| ------ | ------------------------- | --------------------------------------------------- |
| GET    | `/api/public/jobs/:token` | Read-only live status for a customer via share link |

All authenticated routes pass through: JWT verification → tenant-scoping middleware (injects `company_id` filter) → RBAC check → rate limiter (auth routes only).

**Versioning:** no `/v1/` prefix for this project — single consumer (own frontend), no external API contract to preserve yet. If WhosOnSite ever exposes a public API, routes move under `/api/v1/` at that point; deferring the prefix now is a deliberate scope decision, not an oversight.

**Documentation:** the table above is the source of truth and is mirrored into `docs/api-reference.md` (request/response shapes, status codes, and example payloads per route) as a static, hand-maintained Markdown file kept current alongside route changes — no generated OpenAPI spec or Swagger UI is served by the API.

---

## 7. Real-time events (Socket.io)

Rooms are namespaced per company: clients join `company:<company_id>` on connect, scoped by their JWT.

| Event                        | Direction       | Payload                        | Purpose                                       |
| ---------------------------- | --------------- | ------------------------------ | --------------------------------------------- |
| `job:statusChanged`          | server → client | `{ jobId, status, changedAt }` | Live board update                             |
| `job:assigned`               | server → client | `{ jobId, technicianId }`      | Reflect reassignment instantly                |
| `technician:locationUpdated` | server → client | `{ technicianId, lat, lng }`   | Move the pin on the map                       |
| `technician:statusChanged`   | server → client | `{ technicianId, status }`     | Available/busy/offline updates                |
| `location:ping`              | client → server | `{ lat, lng }`                 | Field worker's device sends periodic location |

**Scaling note:** at single-instance scale (this project's target), Socket.io needs no extra setup. If the API ever runs on more than one instance, events stop reaching clients connected to a different instance — the fix is the `@socket.io/redis-adapter`, which uses the existing Redis instance as a pub/sub backbone so all instances broadcast to all connected clients regardless of which one they're attached to. Documented here as the known scaling path, not implemented, since it's unneeded at this project's scale.

---

## 8. Monorepo folder structure

The project uses a **domain/feature-oriented monorepo structure**. Business logic is grouped by module instead of placing all routes, controllers, and services into global folders. This keeps each domain cohesive and makes the codebase easier to navigate and scale.

```
whosonsite/
├── apps/
│   ├── web/                              # React frontend
│   │   ├── src/
│   │   │   ├── app/                      # App bootstrap, providers, router
│   │   │   │   ├── providers/
│   │   │   │   ├── router/
│   │   │   │   ├── i18n/                 # Internationalization configuration
│   │   │   │   │   ├── config.ts
│   │   │   │   │   ├── locales.ts
│   │   │   │   │   └── resources/
│   │   │   │   │       ├── en/
│   │   │   │   │       │   ├── common.json
│   │   │   │   │       │   ├── auth.json
│   │   │   │   │       │   ├── jobs.json
│   │   │   │   │       │   ├── technicians.json
│   │   │   │   │       │   └── validation.json
│   │   │   │   │       └── ta/
│   │   │   │   │           ├── common.json
│   │   │   │   │           ├── auth.json
│   │   │   │   │           ├── jobs.json
│   │   │   │   │           ├── technicians.json
│   │   │   │   │           └── validation.json
│   │   │   │   └── app.tsx
│   │   │   ├── modules/                   # Business/domain features
│   │   │   │   ├── auth/
│   │   │   │   │   ├── api/
│   │   │   │   │   ├── components/
│   │   │   │   │   ├── hooks/
│   │   │   │   │   ├── pages/
│   │   │   │   │   ├── schemas/
│   │   │   │   │   └── types/
│   │   │   │   ├── jobs/
│   │   │   │   │   ├── api/
│   │   │   │   │   ├── components/
│   │   │   │   │   ├── hooks/
│   │   │   │   │   ├── pages/
│   │   │   │   │   └── types/
│   │   │   │   ├── technicians/
│   │   │   │   ├── dispatcher/
│   │   │   │   └── customer/
│   │   │   ├── components/                # Reusable UI components
│   │   │   │   ├── ui/
│   │   │   │   └── layout/
│   │   │   ├── hooks/                     # Generic application hooks
│   │   │   ├── lib/                      # API client, socket client, utilities
│   │   │   ├── styles/
│   │   │   └── main.tsx
│   │   └── vite.config.ts
│   │
│   └── api/                              # Express backend
│       ├── src/
│       │   ├── modules/                  # Business/domain modules
│       │   │   ├── auth/
│       │   │   │   ├── auth.routes.ts
│       │   │   │   ├── auth.controller.ts
│       │   │   │   ├── auth.service.ts
│       │   │   │   ├── auth.repository.ts
│       │   │   │   ├── auth.schema.ts
│       │   │   │   └── auth.types.ts
│       │   │   ├── companies/
│       │   │   ├── users/
│       │   │   ├── technicians/
│       │   │   │   ├── technician.routes.ts
│       │   │   │   ├── technician.controller.ts
│       │   │   │   ├── technician.service.ts
│       │   │   │   ├── technician.repository.ts
│       │   │   │   ├── technician.schema.ts
│       │   │   │   └── technician.types.ts
│       │   │   ├── jobs/
│       │   │   │   ├── job.routes.ts
│       │   │   │   ├── job.controller.ts
│       │   │   │   ├── job.service.ts
│       │   │   │   ├── job.repository.ts
│       │   │   │   ├── job.schema.ts
│       │   │   │   ├── job.types.ts
│       │   │   │   └── job.state-machine.ts
│       │   │   └── notifications/
│       │   │
│       │   ├── infrastructure/            # External/technical infrastructure
│       │   │   ├── database/
│       │   │   │   ├── schema/
│       │   │   │   │   ├── companies.ts
│       │   │   │   │   ├── users.ts
│       │   │   │   │   ├── technicians.ts
│       │   │   │   │   ├── jobs.ts
│       │   │   │   │   ├── job-status-history.ts
│       │   │   │   │   ├── job-assignments.ts
│       │   │   │   │   └── notifications.ts
│       │   │   │   ├── client.ts
│       │   │   │   └── migrations/
│       │   │   ├── redis/
│       │   │   ├── socket/
│       │   │   ├── geocoding/
│       │   │   └── logging/
│       │   │
│       │   ├── jobs/                      # Background job infrastructure
│       │   │   ├── queues/
│       │   │   └── workers/
│       │   │
│       │   ├── middleware/                # Auth, tenant, RBAC, rate limiting
│       │   ├── config/                    # Environment/configuration
│       │   ├── shared/                    # Backend-only shared helpers/types
│       │   ├── app.ts                     # Express app configuration
│       │   ├── server.ts                  # API process entrypoint
│       │   └── worker.ts                  # Worker process entrypoint
│       └── ...
│
├── packages/
│   └── shared/                            # Frontend/backend shared contracts
│       └── src/
│           ├── schemas/                   # Shared Zod schemas
│           ├── types/                     # Shared TypeScript types
│           ├── enums/
│           └── constants/
│
├── docs/
│   ├── api-reference.md                  # Hand-maintained API reference
│   ├── architecture/
│   ├── diagrams/
│   └── adr/                              # Architecture Decision Records
│
├── docker-compose.yml
├── package.json
├── pnpm-workspace.yaml
├── tsconfig.base.json
├── eslint.config.js
├── prettier.config.js
└── .github/
    └── workflows/
        └── ci.yml
```

### Folder ownership rules

- **`modules/`** contains business/domain logic. A module owns its routes, controllers, services, repositories, validation, and domain-specific types.
- **`infrastructure/`** contains technical implementations such as PostgreSQL/Drizzle, Redis, Socket.io, geocoding, and logging. Business rules should not live here.
- **`jobs/`** contains BullMQ queues and worker processors. Domain-specific behavior is delegated back to the appropriate module service.
- **`middleware/`** contains cross-cutting HTTP concerns such as authentication, tenant isolation, RBAC, and rate limiting.
- **`packages/shared/`** contains only contracts genuinely shared between frontend and backend. It should not contain backend services or frontend components.
- **`components/`, `hooks/`, and `lib/`** at the frontend root are for genuinely reusable application-wide code. Feature-specific code stays inside its module.

### Dependency direction

The preferred backend dependency direction is:

```
Route
  ↓
Controller
  ↓
Service
  ↓
Repository
  ↓
Infrastructure / Database
```

Routes should remain thin, controllers should translate HTTP input/output, and services should contain business rules. Repositories handle persistence concerns. Socket handlers and background workers should call the same service layer rather than duplicating business logic.

---

### Internationalization (i18n)

The frontend supports multiple languages using `i18next` with `react-i18next`. The initial supported locales are **English (`en`)** and **Tamil (`ta`)**. Translation resources are organized by domain/namespace rather than a single large translation file.

**Packages:**

- `i18next` — core internationalization engine.
- `react-i18next` — React integration and translation hooks.
- `i18next-browser-languagedetector` — browser/device language detection.

**Locale resolution order:**

1. User's saved locale preference, when available.
2. Browser/device locale.
3. Default locale: `en`.

**Conventions:**

- Store stable system values in the database (for example, `assigned`, `en_route`, `complete`), never translated display text.
- Translate labels, messages, validation text, status labels, and other user-facing content at the UI layer.
- Keep English and Tamil resource keys structurally identical.
- Supported locales are defined centrally in `apps/web/src/app/i18n/locales.ts`.
- User language preference is persisted with the user profile so it can be restored across sessions.

Example usage:

```tsx
const { t } = useTranslation('jobs')

return <h1>{t('title')}</h1>
```

---

## 9. Core user flows

### Flow A — Dispatcher assigns a job

![Sequence diagram of the job assignment flow between dispatcher, API server, PostGIS database, technician device, and Socket.io](diagrams/04-sequence-job-assignment.png)

1. Dispatcher creates a job with address (geocoded to lat/lng on save).
2. Dispatcher clicks "Find nearby technicians" → calls `/api/technicians/nearby` (PostGIS query).
3. Assigns a technician → `job:assigned` socket event fires → technician's device updates instantly.

### Flow B — Technician works a job

![Sequence diagram of the real-time status update flow between technician device, API server, database, Socket.io, dispatcher board, and customer status page](diagrams/05-sequence-status-update.png)

1. Technician's phone shows their queue for the day.
2. Taps "En route" → `POST /api/jobs/:id/status` → history logged, dispatcher board updates live.
3. Device periodically sends `location:ping` while status is `en_route`/`on_site`.
4. Taps "Complete" with optional note → job closed, history finalized.

**Known limitation (documented, not silently missed):** status updates and location pings assume network connectivity. If a request fails, the client retries with exponential backoff (3 attempts) and shows a "not synced" indicator on that job until it succeeds — it does not currently queue writes for later replay while fully offline. A true offline queue (service worker + background sync) is listed under [Stretch goals](#15-stretch-goals) rather than core scope, since field connectivity gaps are usually seconds-to-minutes, not full offline sessions, for the target verticals (HVAC/plumbing dispatch).

Note the fan-out in step 2: one status write triggers a single `job:statusChanged` event that Socket.io relays to both the dispatcher board and the customer status page simultaneously — neither client polls the other's view into consistency, they both react to the same event.

### Flow C — Customer checks status

1. Customer receives a share link (`/api/public/jobs/:token`) via SMS/email at booking.
2. Opens link → sees live status without calling in.
3. The token is a signed, single-purpose value (not a raw sequential ID) and expires automatically 48 hours after the job reaches `complete` or `cancelled` — after that, the link returns 404 instead of stale job data.

### Flow D — Mid-day reassignment

1. Technician marked "offline" (sick call).
2. Dispatcher opens their assigned jobs, clicks "Reassign."
3. PostGIS proximity query surfaces available technicians near each job.
4. Reassign → history logged with `changed_by`, both parties notified via socket + push notification job.

---

## 10. Implementation roadmap — 9 phases

The 9-week/~200-hour build is organized into 9 sequential phases, one per week (~3 hrs/day, ~22.5 hrs/phase). Each phase below defines its objective, the detailed task list, concrete deliverables, and the exit criteria that must be true before moving to the next phase. Phases are intentionally sequential — each one depends on the tables, middleware, or endpoints the previous phase produced.

### Phase 1 — Foundations & Data Layer

**Duration:** Week 1 (~22.5 hrs) · **Depends on:** nothing (starting point)

**Objective:** Stand up the monorepo, get Postgres+PostGIS running locally, and land a reviewable schema + architecture decision record before any feature code is written.

**Detailed tasks:**

- Initialize the pnpm workspace monorepo (`apps/web`, `apps/api`, `packages/shared`) per the [folder structure](#8-monorepo-folder-structure).
- Configure `docker-compose.yml` with a PostGIS-enabled Postgres image and a Redis service; verify both start cleanly with `docker-compose up`.
- Set up TypeScript configs (shared `tsconfig.base.json`), ESLint, and Prettier across all workspace packages.
- Write the Drizzle schema v1 for `companies`, `users`, `technicians`, `jobs`, `job_status_history`, `job_assignments`, and `notifications`, matching the [database schema](#5-database-schema).
- Enable the PostGIS extension in a migration and add the `geography(Point, 4326)` columns for `technicians.current_location` and `jobs.location`.
- Add the GiST and composite B-tree indexes called out in [Indexing](#5-database-schema) as part of the initial migration, not as an afterthought.
- Finalize and commit the ERD (Mermaid source + rendered diagram) matching the schema exactly.
- Write an Architecture Decision Record (ADR) covering: why Drizzle over a heavier ORM, why hand-rolled JWT auth, why Nominatim for geocoding, and the tenant-isolation model — this becomes interview material later.
- Wire up `pino` for structured logging in the API skeleton so every subsequent phase logs consistently from day one.

**Deliverables:**

- Working monorepo that boots via `docker-compose up` with zero manual steps.
- Drizzle schema v1 + generated migration, applied cleanly to a fresh database.
- Committed ERD diagram (image + Mermaid source) in sync with the schema.
- First ADR document in the repo.

**Exit criteria:**

- `docker-compose up` brings up Postgres (with PostGIS confirmed via `SELECT postgis_version();`), Redis, and an empty API skeleton with no errors.
- Migrations run idempotently against a clean database.
- Lint and typecheck pass with zero errors on an empty/skeleton codebase.

---

### Phase 2 — Auth, Tenancy & Geospatial Core

**Duration:** Week 2 (~22.5 hrs) · **Depends on:** Phase 1 schema and API skeleton

**Objective:** Land the security spine of the whole app — authentication, RBAC, and tenant isolation — plus prove out the PostGIS proximity query end-to-end, since both are foundational to every feature that follows.

**Detailed tasks:**

- Implement `/api/auth/register`, `/api/auth/login`, `/api/auth/refresh`, `/api/auth/logout` per [Auth details](#auth-details): argon2 password hashing, 15-minute JWT access tokens, opaque refresh tokens hashed in a `refresh_tokens` table.
- Implement refresh-token rotation-on-use and revocation (`revoked_at` column, single-row update).
- Build the tenant-scoping middleware that extracts `company_id` from the JWT and injects it into every downstream query — write this once, centrally, per the [architecture](#4-system-architecture) model.
- Implement RBAC for `owner`, `admin`, `dispatcher`, and `technician` roles, including the narrower technician permission set described in [Auth details](#auth-details).
- Add `express-rate-limit` to all `/api/auth/*` routes.
- Implement the `technicians/nearby` PostGIS query (`ST_DWithin` + `ST_Distance`, ordered by distance) end-to-end, from route → service → typed Drizzle `sql` query → response.
- Implement the technician location-ping endpoint (`PATCH /api/technicians/:id/location`) that updates `current_location` and `last_location_at`.
- Write a seed script that creates two companies with overlapping technician/job data, specifically to make tenant-isolation bugs visible during manual testing.

**Deliverables:**

- Full JWT access/refresh auth flow, working via Postman/Insomnia or curl scripts.
- Tenant-scoping middleware applied to every route module.
- Working `/api/technicians/nearby` endpoint returning correctly ordered, distance-annotated results.
- Seed script for two-tenant test data.

**Exit criteria:**

- A user from Company A can never retrieve, list, or mutate Company B's data, verified manually against the seeded two-tenant dataset.
- Refresh-token rotation is verified: reusing an already-rotated refresh token is rejected and revokes the chain.
- The nearby-technician query returns correct results against seeded geodata within a known radius.

---

### Phase 3 — Core Job Lifecycle

**Duration:** Week 3 (~22.5 hrs) · **Depends on:** Phase 2 auth/tenancy middleware

**Objective:** Implement full job CRUD and the status state machine that drives the rest of the product, including the immutable audit trail.

**Detailed tasks:**

- Implement `POST /api/jobs` (create, with geocoding on save via Nominatim, and the `geocoding_status: pending` fallback path if geocoding fails).
- Implement `GET /api/jobs` with filters for status, date, and assigned technician.
- Implement `GET /api/jobs/:id` including embedded status history.
- Implement `PATCH /api/jobs/:id` for address/schedule/notes updates, re-triggering geocoding when the address changes.
- Implement `POST /api/jobs/:id/assign` for initial assignment and reassignment, writing a `job_assignments` row.
- Implement the job status state machine (`unassigned → assigned → en_route → on_site → complete`, with `cancelled` reachable only from the first three states) as enforced transition logic, not just UI guardrails.
- Implement `POST /api/jobs/:id/status`, writing a `job_status_history` row (`from_status`, `to_status`, `changed_by`, `changed_at`) on every transition.
- Implement `GET /api/jobs/:id/history` returning the full timestamped trail.
- Add the BullMQ retry job for pending geocoding failures.
- Add Zod validation schemas (shared between frontend/backend via `packages/shared`) for every mutating job/technician endpoint.

**Deliverables:**

- Complete job CRUD + assignment + status-transition API surface.
- Enforced, tested state machine that rejects illegal transitions (e.g., `complete → cancelled`).
- Geocoding pipeline with automatic retry on failure.
- Shared Zod validation schemas in `packages/shared`.

**Exit criteria:**

- Every route in the [Jobs API table](#6-api-design) is implemented and passes manual/curl verification.
- Illegal status transitions are rejected at the service layer with a clear error, independent of any frontend check.
- A job created with a bad/ungeocodable address saves successfully with `location = null` and is retried automatically.

---

### Phase 4 — Real-Time Layer

**Duration:** Week 4 (~22.5 hrs) · **Depends on:** Phase 3 job lifecycle endpoints

**Objective:** Wire Socket.io into the existing REST flows so job and technician state changes propagate live, with tenant isolation preserved in the socket layer too.

**Detailed tasks:**

- Set up the Socket.io server alongside Express, with connection-time JWT verification.
- Implement per-company rooms (`company:<company_id>`) and confirm clients only ever join their own company's room.
- Emit `job:statusChanged` from the status-update service call (not from the route handler directly, to keep the emit tied to the actual state change).
- Emit `job:assigned` from the assign/reassign service call.
- Emit `technician:locationUpdated` and `technician:statusChanged` from the location-ping and technician-status update paths.
- Implement the `location:ping` client→server event and route it into the same service used by `PATCH /api/technicians/:id/location`, so REST and socket paths share one code path.
- Verify the fan-out behavior described in [Flow B](#9-core-user-flows): one status write reaches both the dispatcher board and the customer status page from a single event.
- Document (do not implement) the `@socket.io/redis-adapter` scaling path in the codebase README for future multi-instance deployment.

**Deliverables:**

- Working Socket.io server with company-scoped rooms.
- All five events from the [event table](#7-real-time-events-socketio) implemented and firing from the correct service-layer call sites.
- A minimal test client (script or Postman-equivalent) that demonstrates two tenants' sockets never cross-receive events.

**Exit criteria:**

- A status change made via REST is visible over the socket connection within roughly a second, to clients in the same company room only.
- A socket client connected as Company A never receives any event scoped to Company B, verified with the two-tenant seed data from Phase 2.

---

### Phase 5 — Frontend: Dispatcher Experience

**Duration:** Week 5 (~22.5 hrs) · **Depends on:** Phases 2–4 (auth, job APIs, sockets)

**Objective:** Build the primary dispatcher-facing UI: the live job board and map, backed by the real APIs and sockets from prior phases.

**Detailed tasks:**

- Scaffold the React + Vite app with Mantine, React Query, React Router, and the socket.io-client wired to the authenticated session.
- Build the login/register flow against `/api/auth/*`, including access-token refresh handling in the React Query client.
- Build the dispatcher job list/board view, driven by `GET /api/jobs`, with status and date filters.
- Build the Leaflet map view showing job locations and technician positions, updating live from `technician:locationUpdated` and `job:statusChanged` socket events.
- Build the "find nearby technicians" and assign/reassign flow against `/api/technicians/nearby` and `/api/jobs/:id/assign`.
- Build the job detail view showing the full status history from `GET /api/jobs/:id/history`.
- Wire React Query cache invalidation/updates to incoming socket events so the UI never needs manual refresh.
- Apply Mantine dark-mode support and basic responsive layout for the dispatcher board.
- Configure i18next/react-i18next with English (`en`) and Tamil (`ta`) resources, language detection, user locale preference, and a language switcher.

**Deliverables:**

- Functional dispatcher login → job board → map → assign/reassign flow, fully live-updating.
- Job detail view with a readable audit trail.

**Exit criteria:**

- A dispatcher can create a job, find and assign a nearby technician, and see status updates reflect live on the board without a manual page refresh, using only the UI.
- The map correctly reflects technician positions from seeded/test location pings.

---

### Phase 6 — Frontend: Technician & Customer Experience

**Duration:** Week 6 (~22.5 hrs) · **Depends on:** Phase 5 shared frontend scaffolding

**Objective:** Complete the two remaining user-facing surfaces — the technician's mobile-web flow and the public customer status page — plus the reminder notification pipeline.

**Detailed tasks:**

- Build the technician mobile-web view: today's assigned job queue, scoped by the `technician` RBAC role.
- Implement the one-tap status update flow (`assigned → en_route → on_site → complete`) with the retry-with-backoff and "not synced" indicator described in [Flow B](#9-core-user-flows).
- Implement periodic `location:ping` emission from the technician view while status is `en_route`/`on_site`.
- Build the public, unauthenticated customer status page consuming `GET /api/public/jobs/:token`, including the 48-hour post-completion token expiry behavior (confirm it 404s correctly after expiry).
- Implement BullMQ reminder jobs (e.g., scheduled reminder notifications) and the `notifications` table read/write path.
- Add mobile-friendly, minimal-chrome styling for both the technician and customer views, distinct from the denser dispatcher board.

**Deliverables:**

- Technician mobile-web status-update flow, working against real devices/browsers at mobile widths.
- Public customer status page with working share-link expiry.
- BullMQ-driven reminder notifications visibly landing in the `notifications` table.

**Exit criteria:**

- The full [Flow B](#9-core-user-flows) and [Flow C](#9-core-user-flows) sequences work end-to-end on a phone-width browser.
- An expired share-link token returns 404, not stale job data.

---

### Phase 7 — Testing

**Duration:** Week 7 (~22.5 hrs) · **Depends on:** Phases 1–6 (full feature surface must exist)

**Objective:** Build out the test suite in priority order, treating tenant isolation as the single most important thing to prove, per the [testing strategy](#11-testing-strategy).

**Detailed tasks:**

- Write Vitest unit tests for the job status transition rules (every legal and illegal transition).
- Write Vitest unit tests for the tenant-scoping middleware logic in isolation.
- Write Vitest unit tests for the PostGIS query builders (mocked/parameterized, not hitting a live DB).
- Write Supertest integration tests for the full auth flow, including refresh-token rotation and revocation.
- Write Supertest integration tests for job CRUD with RBAC enforcement (technician role restrictions specifically).
- Write Supertest integration tests for the nearby-technician endpoint against a seeded PostGIS dataset.
- Write Supertest **tenant-isolation tests** as the top priority: confirm Company A's authenticated requests can never read or mutate Company B's rows, across every resource type.
- Write the Playwright e2e happy path: dispatcher assigns a job → technician updates status → dispatcher board reflects it live.
- Set up test coverage reporting and fix any gaps the priority order above surfaces.

**Deliverables:**

- Full test suite matching the [priority order](#11-testing-strategy): tenant-isolation > auth > status-transition > e2e happy path.
- CI-runnable test commands (`pnpm test`, `pnpm test:e2e`) that pass locally.

**Exit criteria:**

- All tenant-isolation tests pass and specifically include at least one test that would fail if the `company_id` filter were accidentally omitted.
- The Playwright happy-path e2e test passes reliably (not flaky) on repeated runs.

---

### Phase 8 — Production Hardening & Deployment

**Duration:** Week 8 (~22.5 hrs) · **Depends on:** Phase 7 test suite (CI needs something to run)

**Objective:** Containerize, wire CI/CD, add observability, harden security, deploy, and write the final documentation and case-study material.

**Detailed tasks:**

- Write production Dockerfiles for the API and worker processes; confirm `docker-compose up` still works end-to-end locally.
- Set up the GitHub Actions pipeline: lint → typecheck → test → build on every PR, deploy on merge to `main`, per the [CI/CD pipeline](#12-devops--deployment).
- Wire `pino` structured logs to the deployment platform's log viewer (or a free-tier aggregator).
- Wire `@sentry/node` into both the API and worker processes and confirm a test error is captured.
- Implement `/health` (liveness) and `/ready` (DB + Redis connectivity) endpoints.
- Deploy the API and worker to Railway or Fly.io, and the frontend as static assets to a CDN, connected to managed PostgreSQL+PostGIS and Redis add-ons.
- Work through the full [security checklist](#13-security-checklist) item by item: argon2 hashing confirmed not logged, short-lived/rotatable JWTs, universal `company_id` scoping, auth rate limiting, Zod validation on every mutating route, unguessable share-link tokens, Helmet headers, CORS locked to the known frontend origin, and no secrets in source control.
- Write and commit `docs/api-reference.md`, the hand-maintained route reference described in [API design](#6-api-design), covering request/response shapes and example payloads for every route.
- Write the final project README and a short case-study write-up (problem, architecture decisions, trade-offs, what you'd do differently at scale) suitable for a portfolio or interview conversation.

**Deliverables:**

- Deployed, publicly reachable WhosOnSite instance (API + worker + frontend + managed Postgres/Redis).
- Green CI pipeline on the `main` branch.
- Sentry and structured logging visibly capturing real events in the deployed environment.
- Completed `docs/api-reference.md` and final case-study write-up.

**Exit criteria:**

- Every box in the [security checklist](#13-security-checklist) is checked and manually verified, not just assumed.
- A fresh visitor can register a company, create a job, assign a technician, and watch live status updates entirely against the deployed environment — no local setup required.
- `/health` and `/ready` both return healthy status against the live deployment.

---

## 11. Testing strategy

| Layer       | Tool       | What to cover                                                                                 |
| ----------- | ---------- | --------------------------------------------------------------------------------------------- |
| Unit        | Vitest     | Status transition rules, tenant-scoping logic, PostGIS query builders                         |
| Integration | Supertest  | Auth flow, job CRUD with RBAC enforcement, nearby-technician endpoint                         |
| E2E         | Playwright | Full flow: dispatcher assigns → technician updates status → dispatcher board reflects it live |

**Priority order if time runs short:** tenant-isolation tests > auth tests > status-transition tests > e2e happy path. Isolation bugs (tenant A seeing tenant B's data) are the single worst thing a reviewer could find — test that first.

---

## 12. DevOps & deployment

![CI/CD pipeline diagram showing GitHub Actions running lint, typecheck, test, and build, then deploying the API/worker to Railway or Fly.io and the static frontend to a CDN, with managed PostgreSQL+PostGIS and Redis+BullMQ add-ons](diagrams/07-cicd-pipeline.png)

A push to `main` triggers GitHub Actions: lint → typecheck → test → build. On success, the API and worker are containerized and deployed to Railway/Fly.io, while the frontend builds to static assets served separately. Both connect to the same managed PostgreSQL+PostGIS and Redis+BullMQ add-ons.

- **Local dev:** `docker-compose up` spins up Postgres (with PostGIS image), Redis, API, and worker.
- **CI (GitHub Actions):** on every PR — lint → typecheck → unit/integration tests → build. On merge to main — deploy.
- **Deployment target:** Railway or Fly.io — both offer managed Postgres with extensions enabled and simple Redis add-ons.
- **Health checks:** `/health` (liveness) and `/ready` (checks DB + Redis connectivity) for the platform's health monitoring.
- **Logging:** Pino structured JSON logs, shipped to the platform's log viewer (or a free-tier log aggregator).
- **Error tracking:** Sentry free tier wired into both API and worker processes.

---

## 13. Security checklist

- [ ] Passwords hashed with argon2, never logged
- [ ] JWT access tokens short-lived (15 min), refresh tokens rotated and revocable
- [ ] Every DB query scoped by `company_id` — no exceptions
- [ ] Rate limiting on `/api/auth/*` routes
- [ ] Input validation via Zod on every mutating endpoint
- [ ] Public share-link tokens are unguessable (UUID v4 or signed, not sequential IDs)
- [ ] Helmet middleware for standard HTTP security headers
- [ ] CORS locked to known frontend origin(s)
- [ ] No secrets in source control — `.env` + platform secrets manager

---

## 14. Environment variables

```
# API
NODE_ENV=development
DATABASE_URL=postgresql://user:pass@localhost:5432/whosonsite
REDIS_URL=redis://localhost:6379
JWT_ACCESS_SECRET=
JWT_REFRESH_SECRET=
SENTRY_DSN=
LOG_LEVEL=info
PORT=4000
CORS_ORIGIN=http://localhost:5173
GEOCODING_PROVIDER=nominatim
GEOCODING_API_KEY=

# Web
VITE_API_URL=http://localhost:4000
VITE_SOCKET_URL=http://localhost:4000
```

---

## 15. Stretch goals

_Only pursue these after all 9 phases are solid and deployed._

1. **Route optimization** — order a technician's multiple stops for the day using a basic TSP heuristic.
2. **SMS notifications** — Twilio integration for customer status updates instead of just a link.
3. **Analytics dashboard** — job duration vs. quoted time, technician utilization over time.
4. **Offline support** — service worker so the technician's status updates queue when signal drops.
5. **Multi-language support** for the customer-facing status page.

---

### Phase 9 — Company Registration with Trial Period & Subscription Management

**Duration:** Week 9 (~22.5 hrs) · **Depends on:** Phase 2 (auth/tenancy middleware)

**Objective:** Implement a complete registration flow where companies provide business details (name, phone, email, address), receive a 14-day trial, and must subscribe after trial expiration to continue using the platform.

---

#### 9.1 Database Schema Changes

**Extend `companies` Table:**

Add subscription tracking columns to `apps/api/src/infrastructure/database/schema/companies.ts`:

| Column | Type | Notes |
|---|---|---|
| `phone` | text, nullable | Company contact phone (nullable for existing companies) |
| `address` | text, nullable | Street address |
| `city` | text, nullable | City |
| `state` | text, nullable | State/Province |
| `zip_code` | text, nullable | Postal code |
| `country` | text, default 'US' | Country code |
| `trial_started_at` | timestamptz, nullable | When trial began |
| `trial_ends_at` | timestamptz, nullable | Trial expiration date |
| `subscription_status` | subscription_status enum | Current subscription status |

**Create Subscription Status Enum:**

```typescript
export const subscriptionStatusEnum = pgEnum('subscription_status', [
  'trial',      // Active 14-day trial
  'active',     // Paid and active subscription
  'past_due',   // Payment failed, grace period (future)
  'cancelled',  // Subscription cancelled (future)
  'expired'     // Trial or subscription expired
])
```

**Migration Strategy:**

- Make `phone` nullable in DB with `DEFAULT ''` to handle existing seed companies
- Zod schema enforces phone as required only on new registrations
- Existing companies get backdated trial dates from their `created_at` column
- Migration adds all new columns with sensible defaults

---

#### 9.2 Shared Package Updates

**Update Registration Schema (`packages/shared/src/schemas/index.ts`):**

```typescript
export const registerSchema = z.object({
  companyName: z.string().min(2, 'Company name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits')
    .regex(/^\+?[\d\s-()]+$/, 'Invalid phone format'),
  address: z.string().min(5, 'Address is required'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  zipCode: z.string().min(5, 'ZIP code is required'),
  country: z.string().default('US')
})
```

**Add Subscription Enums (`packages/shared/src/enums/index.ts`):**

```typescript
export enum SubscriptionStatus {
  TRIAL = 'trial',
  ACTIVE = 'active',
  PAST_DUE = 'past_due',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired'
}
```

**Update Company DTO (`packages/shared/src/types/index.ts`):**

```typescript
export interface CompanyDto {
  id: string
  name: string
  primaryColor: string
  phone: string
  address?: string
  city?: string
  state?: string
  zipCode?: string
  country: string
  subscriptionStatus: SubscriptionStatus
  trialStartedAt?: string
  trialEndsAt?: string
  createdAt: string
  updatedAt: string
}
```

**Add Subscription Response Types:**

```typescript
export interface SubscriptionInfo {
  status: SubscriptionStatus
  trialStartedAt?: string
  trialEndsAt?: string
  daysRemaining?: number
  isTrialExpired: boolean
  requiresCheckout: boolean
}
```

---

#### 9.3 Backend Implementation

**Update Auth Service Registration (`apps/api/src/modules/auth/auth.service.ts`):**

Modify `register()` function to:
1. Accept new fields (phone, address, city, state, zipCode, country)
2. Calculate trial period: `trialStartedAt = new Date()`, `trialEndsAt = dayjs().add(14, 'day').toDate()`
3. Set `subscriptionStatus = 'trial'`
4. Include all fields in company creation within the transaction

**Update Auth Repository (`apps/api/src/modules/auth/auth.repository.ts`):**

Update `createCompany()` to accept and persist all new fields.

**Create Subscription Module (`apps/api/src/modules/subscription/`):**

New module with:
- `subscription.routes.ts` - API routes
- `subscription.controller.ts` - Request handlers
- `subscription.service.ts` - Business logic
- `subscription.repository.ts` - Database queries
- `subscription.types.ts` - TypeScript interfaces

**Key Endpoints:**
- `GET /subscription/status` - Get current subscription status for authenticated company
- `POST /subscription/checkout` - Create checkout session (placeholder for future Stripe integration)
- `POST /subscription/webhook` - Handle payment webhooks (placeholder)
- `PUT /subscription/cancel` - Cancel subscription (placeholder)

**Subscription Service Logic (`subscription.service.ts`):**

```typescript
export async function getSubscriptionStatus(companyId: string): Promise<SubscriptionInfo> {
  const company = await subscriptionRepo.findCompanyById(companyId)
  
  const now = new Date()
  const isTrialExpired = company.trialEndsAt ? now > company.trialEndsAt : false
  const daysRemaining = company.trialEndsAt 
    ? Math.max(0, Math.ceil((company.trialEndsAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
    : 0
  
  let requiresCheckout = false
  if (isTrialExpired && company.subscriptionStatus === 'trial') {
    requiresCheckout = true
  }
  
  return {
    status: company.subscriptionStatus,
    trialStartedAt: company.trialStartedAt?.toISOString(),
    trialEndsAt: company.trialEndsAt?.toISOString(),
    daysRemaining,
    isTrialExpired,
    requiresCheckout
  }
}
```

**Update Login Response:**

Modify `auth.service.login()` to include subscription info in the response:

```typescript
export interface AuthResponse {
  accessToken: string
  refreshToken: string
  user: AuthUser
  company: CompanyDto
  subscription: SubscriptionInfo  // NEW: include subscription status
}
```

**Create Subscription Guard Middleware (`apps/api/src/middleware/subscription-guard.ts`):**

```typescript
export function requireActiveSubscription(req, res, next): void {
  const company = req.company
  
  if (!company) {
    sendError(res, 'Company context required', 401)
    return
  }
  
  // Allow trial users
  if (company.subscriptionStatus === 'trial') {
    const now = new Date()
    if (company.trialEndsAt && now > company.trialEndsAt) {
      sendError(res, 'Trial expired. Please subscribe to continue.', 403, { 
        code: 'TRIAL_EXPIRED',
        requiresCheckout: true 
      })
      return
    }
    return next()
  }
  
  // Allow active subscriptions
  if (company.subscriptionStatus === 'active') {
    return next()
  }
  
  // Block other statuses (past_due, cancelled, expired)
  sendError(res, 'Subscription required. Please update your billing.', 403, {
    code: 'SUBSCRIPTION_REQUIRED',
    requiresCheckout: true
  })
}
```

**Register Subscription Routes (`apps/api/src/routes/index.ts`):**

```typescript
import subscriptionRouter from '../modules/subscription/subscription.routes'

router.use('/subscription', subscriptionRouter)
```

---

#### 9.4 Frontend Implementation

**Create Registration Page (`apps/web/src/pages/Register.tsx`):**

Single-page registration form with:
- Company name
- Email
- Password
- Phone number
- Address fields (street, city, state, ZIP, country)
- Terms acceptance checkbox
- Submit button

**Create Registration Form Component (`apps/web/src/components/auth/RegisterForm.tsx`):**

Form with Zod validation matching shared schema, controlled state management.

**Update Auth API Client (`apps/web/src/components/auth/api.ts`):**

Update `registerApi()` to accept new fields and return subscription info.

**Create Trial Badge Component (`apps/web/src/components/common/TrialBadge.tsx`):**

```tsx
export const TrialBadge: React.FC<{ daysRemaining: number }> = ({ daysRemaining }) => {
  if (daysRemaining <= 0) return null
  
  return (
    <Badge color="yellow" variant="filled" size="lg">
      Trial: {daysRemaining} days remaining
    </Badge>
  )
}
```

**Placement:** AppLayout header/toolbar (visible on every page for trial users).

**Add Subscription Info to Auth Context (`apps/web/src/components/auth/AuthContext.tsx`):**

Extend context to include subscription info:
```typescript
interface AuthContextType {
  user: AuthUser | null
  company: CompanyDto | null
  subscription: SubscriptionInfo | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (data: LoginRequest) => Promise<void>
  register: (data: RegisterRequest) => Promise<void>
  logout: () => Promise<void>
}
```

**Create Checkout Page (`apps/web/src/pages/Checkout.tsx`):**

Redirect page after trial expiration with:
- Trial expired message
- Pricing plan display (placeholder for future)
- "Subscribe Now" button (placeholder for future Stripe integration)
- Success/cancel URL handling

**Update Routing (`apps/web/src/app/app.tsx`):**

Add new routes:
```tsx
<Route element={<PublicRoute />}>
  <Route path="/login" element={<Login />} />
  <Route path="/register" element={<Register />} />
  <Route path="/checkout" element={<Checkout />} />
  <Route path="/checkout/success" element={<CheckoutSuccess />} />
</Route>
```

**Create Subscription Guard Component (`apps/web/src/components/auth/SubscriptionGuard.tsx`):**

```tsx
export const SubscriptionGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { subscription, isLoading } = useAuth()
  
  if (isLoading) return <LoadingState />
  
  if (subscription?.requiresCheckout) {
    return <Navigate to="/checkout" replace />
  }
  
  return <>{children}</>
}
```

**Update Protected Route (`apps/web/src/components/auth/ProtectedRoute.tsx`):**

Add subscription check after authentication:
```typescript
// Check subscription status
if (subscription?.requiresCheckout) {
  return <Navigate to="/checkout" replace />
}
```

**Update Login Flow:**

1. User logs in → `POST /auth/login` succeeds
2. Frontend receives auth response with `subscription` field
3. If `subscription.requiresCheckout` → redirect to `/checkout` instead of `/dashboard`
4. Otherwise → redirect to original destination or `/dashboard`

---

#### 9.5 Design Decisions

**Performance:**
- Keep `companyContext` middleware lightweight (just validate `req.auth.companyId`)
- Subscription status fetched only when needed (login response, dedicated endpoint)
- Avoid DB query on every authenticated request

**Stripe Integration:**
- Defer full Stripe integration to Phase 10
- Create placeholder checkout page with "Coming Soon" messaging
- Reserve `stripeCustomerId` and `stripeSubscriptionId` columns for future use

**Migration:**
- Make `phone` nullable in DB with default empty string
- Existing seed companies get backdated trial dates from `created_at`
- Zod schema enforces phone as required only on new registrations

**Trial Badge:**
- Display in AppLayout header/toolbar
- Visible on every page for trial users
- Shows days remaining (e.g., "Trial: 12 days remaining")
- Disappears when trial expires or subscription becomes active

**Registration Form:**
- Single page with all fields (not multi-step wizard)
- Zod validation on submit (no HTML5 validation)
- Controlled state with error messages from Zod

**Email Verification:**
- Skip for now (can be added in future phase)
- Focus on registration flow and trial period

---

#### 9.6 Deliverables

- Extended `companies` table with subscription tracking columns
- Updated registration schema with company details
- Registration page with complete form
- Subscription status endpoint
- Trial badge component in AppLayout
- Checkout page (placeholder)
- Subscription guard middleware
- Protected route subscription gating
- Login flow with subscription redirect logic

---

#### 9.7 Exit Criteria

- New company registration captures all required fields (name, phone, email, address)
- Trial period starts on registration (14 days from signup)
- Trial badge displays days remaining on every page
- Trial expired users are redirected to checkout on login
- Checkout page displays (placeholder for future payment integration)
- Existing seed companies have backdated trial dates
- All validation uses Zod schemas (no HTML5 validation)
- `pnpm typecheck` passes with 0 errors
- `pnpm test` passes

---

#### 9.8 Future Enhancements (Phase 10+)

- Stripe integration for payment processing
- Plan-based module access (different features per plan)
- Billing portal for subscription management
- Invoice generation and email delivery
- Webhook handling for payment events
- Grace period logic for failed payments
- Plan upgrades/downgrades

---

_Document version 1.3 — added Phase 9: Company Registration with Trial Period & Subscription Management; restructured 8-week roadmap to include trial period feature with placeholder Stripe integration._
