# HelpRoster — Project Memory & State

## 1. 📍 Current Status
- **Milestone:** Milestone 1 — Core Foundation & Platform MVP
- **Current Phase:** Phase 2 — Authentication, Authorization & Profiles
- **Phase 0 Status:** `[x]` Completed & Verified
- **Phase 1 Status:** `[x]` Completed & Verified
- **Phase 2 Status:** `[x]` Completed & Verified (2 plans, 4 tasks across 2 waves)
- **Next Command:** `/gsd-plan-phase 3`

---

## 2. 📊 Progress Summary
- **Phase 0 (Project Planning and Setup):** 5/5 tasks complete (`100%`)
  - [x] TASK-001: Confirm product decisions
  - [x] TASK-002: Initialize repository structure (`client/`, `server/`, `database/`, `.gitignore`, `README.md`)
  - [x] TASK-003: Initialize React frontend (Vite, React Router, Tailwind CSS, Layout, Components, verified build)
  - [x] TASK-004: Initialize Express backend (`/api/v1/health`, helmet, cors, rate-limit, error middleware)
  - [x] TASK-005: Configure MySQL (`mysql2` pool with ping check & safe error handling)
- **Phase 1 (Database Schema & Relational Foundations):** 3/3 tasks complete (`100%`)
  - [x] TASK-006: Define schema (11 relational tables, strict foreign keys, composite deduplication)
  - [x] TASK-007: Version-controlled migrations and development seed scripts
  - [x] TASK-008: Standardized API conventions (JSON enveloper, error handler, pagination helpers)
- **Phase 2 (Authentication, Authorization & Profiles):** 4/4 tasks complete (`100%`)
  - [x] TASK-009: Registration UI & API (volunteers & organizations with atomic transaction and password hashing)
  - [x] TASK-010: Login & logout using `httpOnly` secure cookie JWTs with demo persona autofill
  - [x] TASK-011: Role-based authorization middleware (`volunteer`, `organization`, `admin`) and org ownership checks
  - [x] TASK-012: Profile viewing and editing with public vs private field segregation
- **Phase 3 (Shared UI System & Public Pages):** 0/4 tasks complete
- **Phase 4 (Opportunity Discovery & Management):** 0/4 tasks complete
- **Phase 5 (Applications Workflow):** 0/3 tasks complete
- **Phase 6 (Dashboards, Hours & Achievements):** 0/5 tasks complete
- **Phase 7 (Administration, Support & Email):** 0/3 tasks complete
- **Phase 8 (Testing & Hardening):** 0/4 tasks complete
- **Phase 9 (Deployment & Release):** 0/3 tasks complete

---

## 3. 📝 Decision Log
- **[DEC-001] Org Verification Gate:** Organizations require administrative verification before their opportunities can be published to the public directory.
- **[DEC-002] Authentication Method:** JWT stored in `httpOnly`, `SameSite=Lax`, `Secure` cookies with CSRF defense and Bearer header fallback.
- **[DEC-003] Frontend Styling:** Tailwind CSS customized with token palette from `Docs/Design .md` (`Inter` typography, `#2563EB` primary, `#14B8A6` accent).
- **[DEC-004] Email Notifications:** Full transactional email integration (Nodemailer / SMTP / Resend) included for account verification, password resets, and application status notifications.
- **[DEC-005] Relational Migration Strategy:** Pure Node.js migration & seed runner in `server/src/database/` tracking applied migrations in `schema_migrations`.
- **[DEC-006] Database-Level Duplicate Defense:** Unique composite key `uq_opp_volunteer (opportunity_id, volunteer_id)` enforces application deduplication directly inside MySQL.
- **[DEC-007] Atomic Account Registration:** User accounts and their corresponding profile records (`volunteer_profiles` or `organizations`) are created inside an ACID MySQL transaction.

---

## 4. 🧭 Next Steps
Proceed to Phase 3 (Shared UI System, Layout & Public Pages) using `/gsd-plan-phase 3`.
