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
└── docker-compose.yml   # PostgreSQL + PostGIS & Redis container setup
```

---

## 🚀 Quick Start

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Configure Environment

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

### 3. Run Infrastructure (Docker)

```bash
docker-compose up -d
```

### 4. Development Servers

Start all workspace services in parallel:

```bash
pnpm dev
```

Or run services individually:

```bash
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
- [ ] **Phase 2 — Auth, Tenancy & Geospatial Core**
- [ ] **Phase 3 — Core Dispatch Board & Job State Machine**
- [ ] **Phase 4 — Real-time Events & Live Map**
- [ ] **Phase 5 — Customer Live Tracking Page & Public Access**
- [ ] **Phase 6 — Technician Mobile View & Location Pings**
- [ ] **Phase 7 — Background Jobs & Automated Notifications**
- [ ] **Phase 8 — Production Hardening & Portfolio Polish**
