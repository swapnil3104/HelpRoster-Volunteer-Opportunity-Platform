---
phase: "01"
name: "database-schema-relational-foundations"
created: 2026-10-18
---

# Phase 1: Database Schema & Relational Foundations — Context

## 1. Locked Decisions

- **Database Engine & Storage**: MySQL 8.0+ with InnoDB storage engine, `utf8mb4` character set, and `utf8mb4_unicode_ci` collation.
- **Connection & Security**: Connection pool managed by `mysql2/promise` using environment variables; 100% parameterized queries with prepared statements (zero string concatenation for values).
- **Core Tables Scoped for v1.0**:
  1. `users` — Primary identity, email (unique, lowercase), hashed password, role (`volunteer`, `organization`, `admin`), active status, timestamps.
  2. `volunteer_profiles` — Profile details for volunteers (1:1 with `users`), first/last name, phone, bio, location, skills.
  3. `organizations` — Profile for organization entities (1:1 owner user for v1), name, mission, description, website, contact email, phone, location, `verification_status` (`pending`, `verified`, `rejected`).
  4. `categories` — Classification for opportunities (name, slug, description, icon).
  5. `opportunities` — Opportunity listings linked to `organizations` and `categories`. Title, description, `location_type` (`on-site`, `remote`, `hybrid`), address, skills, start/end dates, application deadline, volunteer capacity, `status` (`draft`, `published`, `closed`, `archived`).
  6. `applications` — Applications submitted by volunteers to opportunities. `status` (`pending`, `accepted`, `rejected`, `withdrawn`), statement of interest, availability notes. Enforce `UNIQUE KEY uq_opp_volunteer (opportunity_id, volunteer_id)` to prevent duplicate applications.
  7. `volunteer_hours` — Logged service hours (`pending`, `approved`, `rejected`), activity date, hours logged, review notes, reviewed_by FK.
  8. `achievements` & `user_achievements` — Badge definitions and earned achievements junction with `UNIQUE KEY uq_user_achievement (user_id, achievement_id)`.
  9. `contact_submissions` — Platform inquiry/support form submissions.
  10. `audit_logs` — Security and moderation audit trails for privileged actions (approvals, suspensions, deletions).
- **Migration & Tooling**:
  - `database/schema.sql` providing clean fresh DDL.
  - Numbered migration files under `database/migrations/` (e.g. `001_initial_schema.sql`).
  - Seed SQL files under `database/seeds/` with realistic sample data (default categories, sample opportunities, mock users/organizations) flagged clearly for development.
  - Node CLI scripts in `server/` (e.g., `npm run db:migrate`, `npm run db:seed`, `npm run db:reset`) executing through `mysql2` pool to allow cross-platform setup on Windows/Linux/macOS without requiring a raw MySQL shell client installed on PATH.
- **API Conventions**:
  - Centralized `/api/v1` routing structure.
  - Standardized JSON enveloper:
    - Success: `{ success: true, message: string, data: any, pagination?: { page, limit, total, totalPages } }`
    - Error: `{ success: false, error: { code: string, message: string, details?: any } }`
  - Standard HTTP status code mappings (200 OK, 201 Created, 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, 409 Conflict, 422 Unprocessable Entity, 500 Internal Error).

## 2. Discretion Areas

- Implementation of migration runner: Lightweight native Node script in `server/src/db/migrate.js` that tracks executed migrations in a `schema_migrations` table, keeping dependencies minimal.
- Implementation of seed runner: Script in `server/src/db/seed.js` supporting `--reset` to truncate/repopulate development data safely.
- Seed data depth: Include diverse categories (Environmental, Education, Healthcare, Animal Welfare, Community, Arts & Culture, Crisis Relief, Technology) and realistic opportunities across remote, hybrid, and on-site modalities.

## 3. Deferred Ideas (Out of Scope for Phase 1)

- Complex waitlist queuing logic (deferred to Phase 5).
- Recurring schedule rule parser (simple start/end dates and commitment strings suffice for v1).
- In-memory caching layers (Redis) — MySQL with proper indexes is sufficient for initial launch.
