# ADR 0001: Phase 1 Architectural Foundations

## Status

**Accepted**

## Context & Problem Statement

RouteBoard is a multi-tenant B2B field-service dispatch & real-time job tracking platform. To establish a robust, maintainable foundation, we need to decide on our monorepo architecture, database & ORM layer, authentication design, geocoding approach, and multi-tenant isolation model.

## Decision Drivers

- **Developer ergonomics & fast feedback loops**: Fast build times, clean typing across full stack.
- **Geospatial & proximity capabilities**: High performance spatial queries (find nearby available technicians).
- **Interview defensibility & transparency**: High clarity in technical design decisions without black-box abstractions.
- **Tenant isolation**: Zero leakage of data between company accounts.

## Decisions

### 1. Drizzle ORM over Prisma / TypeORM

- **Decision**: We select **Drizzle ORM** with the `postgres` driver.
- **Rationale**: Prisma abstracts SQL completely and introduces overhead for raw PostGIS spatial queries like `ST_DWithin` and `ST_Distance`. Drizzle acts as a thin SQL wrapper with TypeScript type safety, allowing raw SQL expressions (`sql` templates) for PostGIS spatial operations while preserving strong schema typing.

### 2. Hand-Rolled JWT Auth Architecture (Access + Refresh Rotation)

- **Decision**: We implement hand-rolled JWT authentication (argon2 for hashing, 15-minute JWT access tokens, opaque refresh tokens stored and rotated in DB).
- **Rationale**: Auth-as-a-service providers (Supabase, Auth0) introduce external network boundaries and black-box runtime behavior. Hand-rolling JWT access/refresh rotation demonstrates deep security understanding for technical interviews and allows full control over multi-tenant token payloads (`company_id`, `role`).

### 3. Nominatim / OpenStreetMap Geocoding

- **Decision**: We select **Nominatim** via OpenStreetMap for address geocoding.
- **Rationale**: Avoids commercial API key dependencies (Google Maps Platform, Mapbox) for local development and portfolio deployment, while offering high accuracy for address-to-coordinate transformation.

### 4. Centralized Multi-Tenant Isolation Model

- **Decision**: Multi-tenant data isolation is enforced at the database level via a mandatory `company_id` column on all tenant-owned tables (`users`, `technicians`, `jobs`, `notifications`).
- **Rationale**: Access control middleware extracts `company_id` directly from verified JWT payloads and injects `WHERE company_id = :company_id` filters on all query operations, preventing cross-tenant data leaks.

## Consequences

- **Positive**: High query performance, native spatial capability, zero external auth service cost, deterministic tenant isolation.
- **Negative**: Spatial queries require explicit GiST index definition in migrations (`CREATE INDEX ... USING GIST`).
