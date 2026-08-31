# RouteBoard — Implementation Document

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
10. [8-week implementation roadmap](#10-8-week-implementation-roadmap)
11. [Testing strategy](#11-testing-strategy)
12. [DevOps & deployment](#12-devops--deployment)
13. [Security checklist](#13-security-checklist)
14. [Environment variables](#14-environment-variables)
15. [Stretch goals](#15-stretch-goals)

---

## 1. Project overview

| | |
|---|---|
| **Name** | RouteBoard |
| **Type** | Multi-tenant B2B SaaS — dispatch & field-tracking |
| **Primary vertical (demo framing)** | Home services (HVAC / plumbing / electrical repair) |
| **Also fits** | Courier/delivery, cleaning crews, roadside assistance, security patrol, inspections |
| **Core differentiator** | PostGIS-backed real-time proximity dispatch |
| **Timeline** | 8 weeks · 3 hrs/day · ~180 hours total |
| **Goal** | Portfolio-grade, production-quality project for job applications |

**One-line pitch:** *A live, permissioned dispatch board that replaces phone-call coordination with real-time job status, technician location, and a timestamped audit trail.*

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

| Problem | RouteBoard resolution |
|---|---|
| No visibility into technician availability | Live dispatch board showing every job + every technician's current status |
| Manual status check-ins | One-tap status updates from the technician's phone (assigned → en route → on site → complete) |
| Customer "where are they" calls | Live status page for the customer, no phone call needed |
| No dispute record | Immutable timestamped history on every job |
| Slow reassignment | PostGIS-powered "who's free and nearest" query, reassign in two clicks |

---

## 3. Tech stack

### Frontend

| Concern | Package | Notes |
|---|---|---|
| Framework | `react`, `typescript`, `vite` | Fast dev loop, strong typing |
| UI components | `@mantine/core`, `@mantine/hooks`, `@mantine/notifications` | Full component library, dark mode, form handling |
| Server state | `@tanstack/react-query` | Caching, refetch, optimistic updates |
| Real-time client | `socket.io-client` | Live job/status updates |
| Maps | `leaflet`, `react-leaflet` | Free, no API key required |
| Forms/validation | `@mantine/form`, `zod` | Shared schemas with backend |
| Routing | `react-router-dom` | Standard SPA routing |

### Backend

| Concern | Package | Notes |
|---|---|---|
| API framework | `express`, `typescript` | Familiar, mature ecosystem |
| ORM | `drizzle-orm`, `drizzle-kit` | Thin SQL layer, natural fit for raw PostGIS queries |
| Database | `postgresql` (+ `postgis` extension) | Relational integrity + geospatial queries |
| Real-time server | `socket.io` | Rooms scoped per company (tenant isolation) |
| Validation | `zod` | Runtime-safe, shared with frontend |
| Auth | `jsonwebtoken`, `argon2` | Hand-rolled JWT access/refresh — interview-defensible, no black box |
| Background jobs | `bullmq`, `ioredis` | Scheduled reminders, notification fan-out |
| Rate limiting | `express-rate-limit` | Protects auth + public endpoints |
| Geo utilities | `@turf/turf` | Distance/proximity helper functions in app layer |
| Logging | `pino`, `pino-http` | Structured JSON logs |
| API docs | `swagger-jsdoc`, `swagger-ui-express` | Auto-generated OpenAPI docs |
| Error tracking | `@sentry/node` | Production error visibility |

### Testing

| Concern | Package |
|---|---|
| Unit/integration | `vitest` |
| API integration | `supertest` |
| E2E | `@playwright/test` |

### DevOps

| Concern | Tool |
|---|---|
| Containerization | Docker, docker-compose |
| CI/CD | GitHub Actions |
| Deployment | Railway or Fly.io |
| Monorepo tooling | pnpm workspaces |
| Linting/formatting | ESLint, Prettier |

---

## 4. System architecture

```
┌─────────────────────────┐         ┌──────────────────────────────┐
│   React Frontend (Vite)  │  REST   │      Express API Server      │
│  Dispatcher board (web)  │ ◄─────► │  Auth · RBAC · Job lifecycle │
│  Field-worker view (web) │  WS     │  Socket.io server (rooms)    │
└─────────────────────────┘ ◄─────► └──────────────┬───────────────┘
                                                     │
                          ┌──────────────────────────┼──────────────────────────┐
                          ▼                          ▼                          ▼
                ┌──────────────────┐      ┌──────────────────┐      ┌──────────────────┐
                │   PostgreSQL     │      │   Redis + BullMQ  │      │   Observability   │
                │   + PostGIS      │      │   Job queue       │      │  Pino logs        │
                │  (jobs, users,   │      │  (reminders,      │      │  Sentry errors    │
                │  locations,      │      │   notifications)  │      │  Health checks    │
                │  status history) │      └──────────────────┘      └──────────────────┘
                └──────────────────┘
                          │
                          ▼
                ┌──────────────────┐
                │  Worker process   │
                │  Processes queued │
                │  jobs, sends      │
                │  notifications    │
                └──────────────────┘
```

**Tenant isolation model:** every row in `jobs`, `technicians`, and related tables carries a `company_id`. All queries are scoped by `company_id` via a middleware layer — no query is ever written without it. Socket.io rooms are namespaced per company (`company:<id>`) so real-time events never leak across tenants.

---

## 5. Database schema

### Entity relationship overview

```
companies ──< users ──< technicians
    │                        │
    │                        │ (current location)
    ▼                        ▼
  jobs ──< job_status_history
    │
    ├──< job_assignments (links job ↔ technician, supports reassignment history)
    └──< notifications
```

### Core tables

**companies**
| Column | Type | Notes |
|---|---|---|
| id | uuid, PK | |
| name | text | |
| created_at | timestamptz | |

**users** (dispatchers, admins, owners)
| Column | Type | Notes |
|---|---|---|
| id | uuid, PK | |
| company_id | uuid, FK → companies | tenant scope |
| email | text, unique | |
| password_hash | text | argon2 |
| role | enum(owner, admin, dispatcher) | RBAC |
| created_at | timestamptz | |

**technicians** (field workers — may or may not have login accounts)
| Column | Type | Notes |
|---|---|---|
| id | uuid, PK | |
| company_id | uuid, FK | |
| user_id | uuid, FK → users, nullable | if they log in |
| name | text | |
| phone | text | |
| current_location | geography(Point, 4326) | PostGIS column, updated via location ping |
| status | enum(available, busy, offline) | derived/updated in real time |
| last_location_at | timestamptz | staleness check |

**jobs**
| Column | Type | Notes |
|---|---|---|
| id | uuid, PK | |
| company_id | uuid, FK | |
| customer_name | text | |
| customer_phone | text | |
| address | text | |
| location | geography(Point, 4326) | job site coordinates |
| status | enum(unassigned, assigned, en_route, on_site, complete, cancelled) | |
| scheduled_at | timestamptz | |
| assigned_technician_id | uuid, FK → technicians, nullable | |
| notes | text, nullable | |
| created_at | timestamptz | |
| updated_at | timestamptz | |

**job_status_history** (the audit trail)
| Column | Type | Notes |
|---|---|---|
| id | uuid, PK | |
| job_id | uuid, FK → jobs | |
| from_status | enum, nullable | |
| to_status | enum | |
| changed_by | uuid, FK → users, nullable | |
| changed_at | timestamptz | |
| note | text, nullable | |

**notifications**
| Column | Type | Notes |
|---|---|---|
| id | uuid, PK | |
| company_id | uuid, FK | |
| job_id | uuid, FK, nullable | |
| type | enum(job_delayed, tech_assigned, daily_summary, ...) | |
| payload | jsonb | |
| sent_at | timestamptz, nullable | null = pending |

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

---

## 6. API design

### Auth
| Method | Route | Description |
|---|---|---|
| POST | `/api/auth/register` | Create company + owner account |
| POST | `/api/auth/login` | Returns access + refresh token |
| POST | `/api/auth/refresh` | Rotate access token |
| POST | `/api/auth/logout` | Invalidate refresh token |

### Jobs
| Method | Route | Description |
|---|---|---|
| GET | `/api/jobs` | List jobs (filterable by status, date, technician) |
| POST | `/api/jobs` | Create a job |
| GET | `/api/jobs/:id` | Job detail incl. status history |
| PATCH | `/api/jobs/:id` | Update job (address, schedule, notes) |
| POST | `/api/jobs/:id/assign` | Assign/reassign to a technician |
| POST | `/api/jobs/:id/status` | Update job status (drives history log + socket event) |
| GET | `/api/jobs/:id/history` | Full timestamped audit trail |

### Technicians
| Method | Route | Description |
|---|---|---|
| GET | `/api/technicians` | List with current status/location |
| GET | `/api/technicians/nearby` | PostGIS proximity query for a given job location |
| POST | `/api/technicians` | Add a technician |
| PATCH | `/api/technicians/:id/location` | Location ping from field-worker device |

### Public (customer-facing, no auth)
| Method | Route | Description |
|---|---|---|
| GET | `/api/public/jobs/:token` | Read-only live status for a customer via share link |

All authenticated routes pass through: JWT verification → tenant-scoping middleware (injects `company_id` filter) → RBAC check → rate limiter (auth routes only).

---

## 7. Real-time events (Socket.io)

Rooms are namespaced per company: clients join `company:<company_id>` on connect, scoped by their JWT.

| Event | Direction | Payload | Purpose |
|---|---|---|---|
| `job:statusChanged` | server → client | `{ jobId, status, changedAt }` | Live board update |
| `job:assigned` | server → client | `{ jobId, technicianId }` | Reflect reassignment instantly |
| `technician:locationUpdated` | server → client | `{ technicianId, lat, lng }` | Move the pin on the map |
| `technician:statusChanged` | server → client | `{ technicianId, status }` | Available/busy/offline updates |
| `location:ping` | client → server | `{ lat, lng }` | Field worker's device sends periodic location |

---

## 8. Monorepo folder structure

```
routeboard/
├── apps/
│   ├── web/                    # React frontend
│   │   ├── src/
│   │   │   ├── features/       # jobs, technicians, auth (feature-sliced)
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   ├── lib/            # api client, socket client
│   │   │   └── pages/
│   │   └── vite.config.ts
│   └── api/                    # Express backend
│       ├── src/
│       │   ├── routes/
│       │   ├── controllers/
│       │   ├── services/       # business logic, PostGIS queries live here
│       │   ├── middleware/     # auth, tenant-scoping, rate-limit
│       │   ├── sockets/
│       │   ├── jobs/           # BullMQ workers
│       │   └── db/
│       │       ├── schema.ts   # Drizzle schema
│       │       └── migrations/
│       └── src/worker.ts       # separate process entrypoint
├── packages/
│   └── shared/                 # Zod schemas + types shared frontend/backend
├── docker-compose.yml
├── .github/workflows/ci.yml
└── pnpm-workspace.yaml
```

---

## 9. Core user flows

### Flow A — Dispatcher assigns a job
1. Dispatcher creates a job with address (geocoded to lat/lng on save).
2. Dispatcher clicks "Find nearby technicians" → calls `/api/technicians/nearby` (PostGIS query).
3. Assigns a technician → `job:assigned` socket event fires → technician's device updates instantly.

### Flow B — Technician works a job
1. Technician's phone shows their queue for the day.
2. Taps "En route" → `POST /api/jobs/:id/status` → history logged, dispatcher board updates live.
3. Device periodically sends `location:ping` while status is `en_route`/`on_site`.
4. Taps "Complete" with optional note → job closed, history finalized.

### Flow C — Customer checks status
1. Customer receives a share link (`/api/public/jobs/:token`) via SMS/email at booking.
2. Opens link → sees live status without calling in.

### Flow D — Mid-day reassignment
1. Technician marked "offline" (sick call).
2. Dispatcher opens their assigned jobs, clicks "Reassign."
3. PostGIS proximity query surfaces available technicians near each job.
4. Reassign → history logged with `changed_by`, both parties notified via socket + push notification job.

---

## 10. 8-week implementation roadmap

| Week | Focus | Key deliverables |
|---|---|---|
| **1** | Foundations + Postgres/PostGIS basics | Monorepo setup, Docker Postgres w/ PostGIS enabled, Drizzle schema v1, ERD finalized, ADR written |
| **2** | Auth, tenancy, PostGIS queries | JWT auth + RBAC, tenant-scoping middleware, nearby-technician query working end-to-end |
| **3** | Core job lifecycle | Job CRUD, status transitions, job_status_history logging, validation layer |
| **4** | Real-time layer | Socket.io rooms per company, live status broadcast, location ping handling |
| **5** | Frontend — dispatcher board | Mantine UI, live job list, map view (Leaflet), assign/reassign flow |
| **6** | Frontend — technician view + customer view | Mobile-web status flow, public read-only status page, BullMQ reminder jobs |
| **7** | Testing | Vitest unit tests, Supertest integration tests, Playwright e2e (assign → status change → live update) |
| **8** | Production hardening | Docker, CI/CD, Sentry, Pino logging, Swagger docs, deploy, README + case study write-up |

---

## 11. Testing strategy

| Layer | Tool | What to cover |
|---|---|---|
| Unit | Vitest | Status transition rules, tenant-scoping logic, PostGIS query builders |
| Integration | Supertest | Auth flow, job CRUD with RBAC enforcement, nearby-technician endpoint |
| E2E | Playwright | Full flow: dispatcher assigns → technician updates status → dispatcher board reflects it live |

**Priority order if time runs short:** tenant-isolation tests > auth tests > status-transition tests > e2e happy path. Isolation bugs (tenant A seeing tenant B's data) are the single worst thing a reviewer could find — test that first.

---

## 12. DevOps & deployment

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
DATABASE_URL=postgresql://user:pass@localhost:5432/routeboard
REDIS_URL=redis://localhost:6379
JWT_ACCESS_SECRET=
JWT_REFRESH_SECRET=
SENTRY_DSN=
PORT=4000
CORS_ORIGIN=http://localhost:5173

# Web
VITE_API_URL=http://localhost:4000
VITE_SOCKET_URL=http://localhost:4000
```

---

## 15. Stretch goals

*Only pursue these after weeks 1–8 are solid and deployed.*

1. **Route optimization** — order a technician's multiple stops for the day using a basic TSP heuristic.
2. **SMS notifications** — Twilio integration for customer status updates instead of just a link.
3. **Analytics dashboard** — job duration vs. quoted time, technician utilization over time.
4. **Offline support** — service worker so the technician's status updates queue when signal drops.
5. **Multi-language support** for the customer-facing status page.

---

*Document version 1.0 — last updated to reflect: Express, Drizzle ORM, PostgreSQL + PostGIS, Mantine UI, express-rate-limit.*
