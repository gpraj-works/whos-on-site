# WhosOnSite

> **Field-service dispatch & real-time job tracking platform**
>
> A live, permissioned dispatch board that replaces phone-call coordination with real-time job status, technician location, and a timestamped audit trail.

---

## 🛠 Tech Stack

- **Monorepo**: `pnpm` workspaces, `TypeScript`
- **Frontend (`apps/web`)**: React 19, Mantine UI v7, React Query, i18next (English & Tamil), Lucide Icons, Vite
- **Backend (`apps/api`)**: Node.js, Express, Drizzle ORM, PostgreSQL + PostGIS, Redis, Pino Logger
- **Infrastructure**: Docker Compose (PostGIS 16 + Redis 7)

---

## 📁 Repository Structure

```text
whosonsite/
├── apps/
│   ├── api/             # Express API server with Drizzle ORM & Pino logger
│   └── web/             # React 19 + Mantine UI frontend SPA
├── packages/
│   └── shared/          # Shared DTOs, Zod schemas, & domain enums
├── docs/
│   ├── adr/             # Architecture Decision Records
│   └── api-reference.md # API Reference Documentation
└── docker-compose.yml   # Full stack: PostGIS, Redis, API, worker & web (Nginx)
```

---

## 🚀 Quick Start

### Option A — Full Stack via Docker (recommended)

Runs PostgreSQL/PostGIS, Redis, the API, the background worker, and the web
frontend (via Nginx) entirely in Docker. No local Node toolchain required.

```bash
# 1. Configure environment (optional — safe defaults are built-in)
cp .env.example .env

# 2. Build and start everything
docker compose up -d --build

# 3. Open the app
#    Web:   http://localhost:3000
#    API:   http://localhost:4000  (health: /health, ready: /ready)
```

Migrations and the demo dataset are applied automatically on first start
(set `SEED_DATABASE=false` in `.env` to skip the seed). Demo users:

| Role       | Email                     | Password      |
| ---------- | ------------------------- | ------------- |
| Owner      | `owner@acmehvac.com`      | `password123` |
| Admin      | `admin@acmehvac.com`      | `password123` |
| Dispatcher | `dispatcher@acmehvac.com` | `password123` |
| Agent      | `tech1@acmehvac.com`      | `password123` |

Stop all containers:

```bash
docker compose down
```

To reseed from scratch (drops app tables first):

```bash
docker compose exec api sh -c "node apps/api/dist/infrastructure/database/seed/run.js"
```

### Option B — Local Development Servers (Docker only for Postgres + Redis)

```bash
# 1. Install dependencies
pnpm install

# 2. Configure environment
cp .env.example .env

# 3. Run Postgres + Redis only
docker compose up -d postgres redis

# 4. Apply migrations and seed once
pnpm db:migrate
pnpm db:seed

# 5. Start all workspace services in parallel
pnpm dev

# Or run services individually
pnpm dev:api   # Starts API server on http://localhost:4000
pnpm dev:web   # Starts Web server on http://localhost:3000
```

---

## 🩺 System Endpoints

- **Liveness Check**: `http://localhost:4000/health`
- **Readiness Check**: `http://localhost:4000/ready`

---

## 📋 Implementation Progress

- [x] **Phase 1 — Foundations & Data Layer**
- [x] **Phase 2 — Auth, Tenancy & Geospatial Core**
- [x] **Phase 3 — Core Dispatch Board & Job State Machine**
- [x] **Phase 4 — Real-time Socket.io Events & Leaflet Dispatch Map**
- [x] **Phase 5 — Technician Mobile View & Live GPS Location Pings**
- [x] **Phase 6 — Operations Analytics & Summary Aggregations**
- [x] **Phase 7 — Testing**
