---
phase: "01"
name: "database-schema-relational-foundations"
created: 2026-10-18
---

# Phase 1: Database Schema & Relational Foundations — Research

## 1. Executive Summary

Phase 1 establishes the relational persistence layer, schema migrations, developmental seed fixtures, and standardized API conventions for the HelpRoster platform. In Phase 0, Express and the `mysql2/promise` connection pool were configured. Phase 1 translates the product specification into production-grade MySQL 8 DDL tables, indexes, and constraints, accompanied by developer-friendly migration and seeding CLI scripts, plus core API response and pagination helpers.

---

## 2. Relational Schema Architecture

### 2.1 Table Structure & Constraints

| Table | Primary Key | Foreign Keys | Key Constraints & Indexes |
|---|---|---|---|
| `users` | `id INT AUTO_INCREMENT` | None | `UNIQUE (email)`, `INDEX (role, is_active)` |
| `volunteer_profiles` | `id INT AUTO_INCREMENT` | `user_id -> users(id) ON DELETE CASCADE` | `UNIQUE (user_id)` |
| `organizations` | `id INT AUTO_INCREMENT` | `user_id -> users(id) ON DELETE RESTRICT` | `UNIQUE (user_id)`, `INDEX (verification_status)` |
| `categories` | `id INT AUTO_INCREMENT` | None | `UNIQUE (name)`, `UNIQUE (slug)`, `INDEX (is_active)` |
| `opportunities` | `id INT AUTO_INCREMENT` | `organization_id -> organizations(id) ON DELETE CASCADE`, `category_id -> categories(id) ON DELETE RESTRICT` | `INDEX (status, application_deadline)`, `INDEX (organization_id)`, `INDEX (category_id)` |
| `applications` | `id INT AUTO_INCREMENT` | `opportunity_id -> opportunities(id) ON DELETE CASCADE`, `volunteer_id -> users(id) ON DELETE CASCADE` | `UNIQUE KEY uq_opp_volunteer (opportunity_id, volunteer_id)`, `INDEX (status)` |
| `volunteer_hours` | `id INT AUTO_INCREMENT` | `volunteer_id -> users(id) ON DELETE CASCADE`, `opportunity_id -> opportunities(id) ON DELETE CASCADE`, `reviewed_by -> users(id) ON DELETE SET NULL` | `INDEX (status)`, `INDEX (volunteer_id)`, `INDEX (opportunity_id)` |
| `achievements` | `id INT AUTO_INCREMENT` | None | `UNIQUE (slug)`, `UNIQUE (name)` |
| `user_achievements` | `id INT AUTO_INCREMENT` | `user_id -> users(id) ON DELETE CASCADE`, `achievement_id -> achievements(id) ON DELETE CASCADE` | `UNIQUE KEY uq_user_achievement (user_id, achievement_id)` |
| `contact_submissions` | `id INT AUTO_INCREMENT` | None | `INDEX (status, created_at)` |
| `audit_logs` | `id INT AUTO_INCREMENT` | `actor_id -> users(id) ON DELETE SET NULL` | `INDEX (action)`, `INDEX (target_type, target_id)`, `INDEX (created_at)` |

### 2.2 Critical Domain Integrity Invariants

1. **Duplicate Application Prevention**:
   The unique index `UNIQUE KEY uq_opp_volunteer (opportunity_id, volunteer_id)` enforces transactional safety at the MySQL database engine level, eliminating race conditions under concurrent submissions.
2. **Normalized Status Fields**:
   - `users.role`: `ENUM('volunteer', 'organization', 'admin')`
   - `organizations.verification_status`: `ENUM('pending', 'verified', 'rejected')` (default `'pending'`)
   - `opportunities.status`: `ENUM('draft', 'published', 'closed', 'archived')` (default `'draft'`)
   - `opportunities.location_type`: `ENUM('on-site', 'remote', 'hybrid')`
   - `applications.status`: `ENUM('pending', 'accepted', 'rejected', 'withdrawn')` (default `'pending'`)
   - `volunteer_hours.status`: `ENUM('pending', 'approved', 'rejected')` (default `'pending'`)
3. **Data Types & Timezone Handling**:
   - Store all timestamps with `DATETIME DEFAULT CURRENT_TIMESTAMP` and `ON UPDATE CURRENT_TIMESTAMP`.
   - Money/hours use `DECIMAL(5,2)` to prevent floating-point calculation inaccuracies.
   - Text fields with variable length use `VARCHAR(255)` with appropriate character limits or `TEXT` for detailed markdown descriptions.

---

## 3. Migration & Seeding Strategy

### 3.1 Custom Lightweight Migration Engine
Rather than introducing heavy ORM dependencies (like TypeORM, Prisma, or Sequelize) that complicate raw SQL tuning and add runtime overhead, we implement a lightweight, robust migration runner in `server/src/db/migrate.js`:
- Maintains a `schema_migrations` tracking table:
  ```sql
  CREATE TABLE IF NOT EXISTS schema_migrations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
  ```
- Reads SQL files sequentially from `database/migrations/` (e.g., `001_initial_schema.sql`).
- Executes each unapplied script using connection transaction statements, recording success.
- Exposes `npm run db:migrate` and `npm run db:status`.

### 3.2 Idempotent Development Seeding
Development environments require rich, believable fixtures to validate discovery, filtering, applications, and dashboards:
- Implemented in `server/src/db/seed.js` using prepared statements and transactions.
- Provides default categories:
  - Environmental Conservation (`environmental`)
  - Education & Mentoring (`education`)
  - Healthcare & Wellness (`healthcare`)
  - Animal Welfare (`animal-welfare`)
  - Community Support (`community`)
  - Arts & Culture (`arts-culture`)
  - Crisis & Disaster Relief (`crisis-relief`)
  - Technology & Non-Profit Support (`technology`)
- Provides demo users with known hashed passwords (e.g. `Password123!` hashed via `bcryptjs`):
  - 1 Administrator account (`admin@helproster.org`)
  - 2 Organization accounts (1 verified, 1 pending)
  - 3 Volunteer accounts
- Provides realistic opportunity listings covering `published`, `draft`, and `closed` states across remote and on-site modalities.
- Seed script supports `--reset` to clear and re-seed clean dev data cleanly.

---

## 4. Standard API Conventions & Response Helpers

### 4.1 Enveloping & Error Normalization
All API endpoints will standardize on uniform shapes:
- **Success Format**:
  ```json
  {
    "success": true,
    "message": "Resource fetched successfully",
    "data": { ... }
  }
  ```
- **Paginated Success Format**:
  ```json
  {
    "success": true,
    "message": "Opportunities retrieved",
    "data": [ ... ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "totalItems": 42,
      "totalPages": 5,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
  ```
- **Error Format**:
  ```json
  {
    "success": false,
    "error": {
      "code": "VALIDATION_ERROR",
      "message": "Invalid input provided",
      "details": [ ... ]
    }
  }
  ```

### 4.2 Utility Modules Scoped for Phase 1
- `server/src/utils/apiResponse.js`: Enhanced with `sendPaginated` alongside `sendSuccess` and `sendError`.
- `server/src/utils/pagination.js`: Query parser and metadata generator (`getPaginationParams`, `buildPaginationMeta`).
- `server/src/middleware/asyncHandler.js`: Higher-order function eliminating repeated try-catch boilerplate in route controllers.
- `server/src/middleware/errorHandler.js`: Refined centralized error catcher mapping validation errors (Zod, MySQL error codes like `ER_DUP_ENTRY`, `ER_NO_REFERENCED_ROW_2`) to clean HTTP responses.

---

## 5. Verification Plan

1. **Schema Integrity**:
   - Run migration script against target database and confirm all 11 tables create successfully.
   - Verify primary keys, foreign key constraints, default values, and indexes via `SHOW TABLES` and `SHOW CREATE TABLE`.
2. **Duplicate Prevention**:
   - Attempt inserting duplicate active application for same `(opportunity_id, volunteer_id)` and verify `ER_DUP_ENTRY` error is thrown by MySQL.
3. **Migration & Seed CLI Verification**:
   - Verify `npm run db:migrate` runs cleanly.
   - Verify `npm run db:seed` populates categories, demo organizations, demo volunteers, and opportunities.
   - Verify running `npm run db:migrate` a second time is a no-op (idempotent).
4. **API Helper Verification**:
   - Test `sendSuccess`, `sendPaginated`, and `sendError` in controller responses with automated or smoke test requests.
