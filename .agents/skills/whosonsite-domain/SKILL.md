---
name: whosonsite-domain
description: >-
  Field-service dispatch and real-time job tracking domain runbook for WhosOnSite.
  Use when implementing or modifying Jobs, Technicians, Status State Machine, PostGIS Spatial queries, or Socket.io events.
---

# WhosOnSite Domain & Workflow Runbook

This skill provides domain context and workflow rules for WhosOnSite's field dispatch operations.

---

## 1. Job Lifecycle & Status State Machine

The Job domain strictly enforces the following status transitions:

```text
  UNASSIGNED ────────┐
      │              │
      ▼              │
   ASSIGNED ─────────┼───► CANCELLED
      │              │
      ▼              │
   EN_ROUTE ─────────┘
      │
      ▼
   ON_SITE
      │
      ▼
   COMPLETE
```

### Transition Rules:

- `UNASSIGNED` → `ASSIGNED`, `CANCELLED`
- `ASSIGNED` → `EN_ROUTE`, `UNASSIGNED`, `CANCELLED`
- `EN_ROUTE` → `ON_SITE`, `CANCELLED`
- `ON_SITE` → `COMPLETE`
- `COMPLETE` → Terminal state (no further transitions allowed)
- `CANCELLED` → Terminal state (no further transitions allowed)

### Mandatory Audit Logging:

Every job status transition MUST record an audit log in `job_status_history` (`job_id`, `company_id`, `from_status`, `to_status`, `changed_by`, `changed_at`, `note`) wrapped in an atomic `withTransaction`.

---

## 2. PostGIS Spatial Queries & Agent Proximity

- **Agent Location**: Stored as `geography(Point, 4326)` in `agents.current_location`.
- **Job Location**: Stored as `geography(Point, 4326)` in `jobs.location`.
- **Proximity Query (`/api/agents/nearby`)**:
  - Uses `ST_DWithin` for spatial radius filtering (e.g. within 10,000 meters).
  - Uses `ST_Distance` to order agents by proximity.
  - MUST enforce `company_id = req.auth.companyId` in the exact same spatial SQL query so competitor agents are NEVER returned.

---

## 3. Real-Time Socket.io Events

- Socket rooms are strictly scoped per company: `company:${companyId}`.
- Core events:
  - `job:created` — Broadcast when a manager creates a new job.
  - `job:assigned` — Emitted to assigned agent device & management board.
  - `job:statusChanged` — Emitted simultaneously to management board & public customer status view.
  - `location:ping` — Agent live location broadcast while `en_route` or `on_site`.

---

## 4. Theme & Brand System (Logo & Dynamic Favicon)

- **Primary Brand Logo**: `apps/web/src/components/common/Logo.tsx` renders the SVG vector path from `apps/web/src/images/logo.svg`.
  - Supports `size` and `color` props, defaulting to `currentColor` for native theme integration.
- **Dynamic Theme Favicon**: `apps/web/src/app/theme/useFavicon.ts`
  - Integrated into `ThemeProvider` (`ThemeContext.tsx`).
  - Dynamically updates `<link id="dynamic-favicon">` SVG data URI when `colorScheme` (light/dark) or tenant `primaryColor` (teal, indigo, blue, violet, orange, green) changes.
