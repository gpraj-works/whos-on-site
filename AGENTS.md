# WhosOnSite — Workspace Agent Instructions & Coding Standards

Welcome to WhosOnSite! This document defines the MANDATORY architectural principles, coding standards, and security guidelines for any agent working on this codebase.

---

## 1. Monorepo Architecture

WhosOnSite is a `pnpm` monorepo organized into three primary packages:

- **`apps/api`**: Express.js + TypeScript backend with Drizzle ORM over PostgreSQL/PostGIS, Redis, BullMQ, and Socket.io.
- **`apps/web`**: React + TypeScript frontend built with Vite, Mantine UI, TanStack Query, Leaflet maps, and Socket.io client.
- **`packages/shared`**: Shared DTO types, Zod schemas, HTTP status codes, and enums shared between frontend and backend.

---

## 2. Core Coding Guidelines

- **Function-Based Pattern**: Keep backend architecture strictly function-based (`route → controller function → service function → repository function`). Avoid introducing classes unless specifically requested.
- **TypeScript Imports**: Use extensionless relative imports (or `.ts`) across all TypeScript files. Never use `.js` extensions in imports.
- **Type Safety & Shared Schemas**:
  - Define API request/response validation schemas in `@whosonsite/shared`.
  - Validate all request payloads in controller layer using shared Zod schemas.
- **Form Validation — Zod Only**:
  - NEVER use HTML5 validation attributes (`required`, `pattern`, `min`, `max`, `type="email"`, etc.) on form inputs.
  - ALL form validation MUST be handled via shared Zod schemas in `@whosonsite/shared`, validated with `schema.safeParse()` on submit.
  - Form fields should use controlled state (`value` + `onChange`) with Zod error messages displayed via component state.
- **Comment Formatting**:
  - NEVER use numbered step mark comments (e.g., `// 1.`, `// 2.`, `// Step 1:`, `// Step 2:`).
  - Always write clean, descriptive code comments without numeric step prefixes.

---

## 3. Database & Multi-Company Security

- **Multi-Company Data Isolation**:
  - Every tenant table (`users`, `technicians`, `jobs`, `refresh_tokens`, `notifications`, `job_assignments`, `job_status_history`) has a `company_id` column.
  - Every database repository query MUST include `companyId` in its `WHERE` clause.
  - `companyId` must be extracted centrally from the authenticated JWT token (`req.auth.companyId`).
- **Database Client & Transactions**:
  - All repository functions must accept an optional `client: DatabaseClient = db` parameter.
  - Use `withTransaction(async (tx) => { ... })` for any operation modifying multiple tables atomically (e.g., registration, job status updates with audit logging).
- **Native SQL Queries**:
  - Use `executeRaw(...)` with Drizzle's parameter-safe `sql` builder for complex spatial or multi-join native queries.

---

## 4. Auth & Security Architecture

- **Authentication**: Argon2 password hashing, 15-minute JWT access tokens, and 7-day opaque refresh tokens hashed in `refresh_tokens` table.
- **Token Rotation**: Single-use refresh token rotation with immediate reuse detection and chain revocation.
- **Middleware**:
  - `authenticate`: Validates JWT and attaches `req.auth`.
  - `authorize`: Enforces Role-Based Access Control (`owner`, `admin`, `dispatcher`, `technician`).
  - `companyContext`: Enforces active company scope.
  - `authLimiter`: Protects `/api/auth/*` endpoints against rate limit abuse.

---

## 5. API Response & Error Handling

- **Standard JSON Response Envelope**:
  - Success: `{ success: true, data: T, meta?: object }` via `sendSuccess`.
  - Error: `{ success: false, error: { message: string, code?: string, details?: any } }` via `sendError`.
- **Error Classes & Middleware**:
  - Throw derived `AppError` exceptions (`BadRequestError`, `UnauthorizedError`, `ForbiddenError`, `NotFoundError`, `ConflictError`).
  - Wrap all async controller functions in `asyncHandler(...)` with explicit `: RequestHandler` return type annotation.
  - Global Express error middleware `errorHandler` formats all unhandled errors into `ApiResponse`.

---

## 6. Verification Checklist

Before completing any task, execute:

1. `pnpm typecheck` — Must pass with 0 errors across all 3 workspace packages (`shared`, `api`, `web`).
2. `pnpm --filter @whosonsite/api test:phase2` — Verify security & spatial integration tests.
