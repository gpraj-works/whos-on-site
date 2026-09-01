# RouteBoard API Reference

Static, hand-maintained documentation for RouteBoard API endpoints.

## Base URL

`/api` (Production/Development)

---

## Standard Response Envelope

All API endpoints return JSON responses wrapped in a standard response envelope:

### Success Response Format (2xx)

```json
{
  "success": true,
  "message": "Operation completed successfully.",
  "data": {},
  "timestamp": "2026-09-01T09:00:00.000Z"
}
```

### Error Response Format (4xx / 5xx)

```json
{
  "success": false,
  "error": {
    "message": "Validation failed for the submitted data.",
    "code": "VALIDATION_ERROR",
    "details": [
      {
        "field": "email",
        "message": "Invalid email address"
      }
    ]
  },
  "timestamp": "2026-09-01T09:00:00.000Z"
}
```

---

## Health & System Endpoints

### Liveness Check

`GET /health`

**Response (200 OK):**

```json
{
  "status": "ok",
  "timestamp": "2026-09-01T07:30:00.000Z",
  "uptime": 124.5
}
```

### Readiness Check

`GET /ready`

**Response (200 OK):**

```json
{
  "status": "ready",
  "services": {
    "postgres": true,
    "redis": true
  },
  "timestamp": "2026-09-01T07:30:00.000Z"
}
```

**Response (503 Service Unavailable):**

```json
{
  "status": "not_ready",
  "services": {
    "postgres": false,
    "redis": true
  },
  "timestamp": "2026-09-01T07:30:00.000Z"
}
```

---

## Auth Endpoints (Phase 2)

- `POST /api/auth/register` — Create company + owner account
- `POST /api/auth/login` — Returns access + refresh token
- `POST /api/auth/refresh` — Rotate access token
- `POST /api/auth/logout` — Invalidate refresh token

## Jobs Endpoints (Phase 3)

- `GET /api/jobs` — List jobs (filterable by status, date, technician)
- `POST /api/jobs` — Create job
- `GET /api/jobs/:id` — Job detail incl. status history
- `PATCH /api/jobs/:id` — Update job details
- `POST /api/jobs/:id/assign` — Assign/reassign technician
- `POST /api/jobs/:id/status` — Update job status
- `GET /api/jobs/:id/history` — Full timestamped audit trail

## Technicians Endpoints (Phase 2)

- `GET /api/technicians` — List technicians
- `GET /api/technicians/nearby` — PostGIS proximity query for job site
- `POST /api/technicians` — Add technician
- `PATCH /api/technicians/:id/location` — Location ping update
