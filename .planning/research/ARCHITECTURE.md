# Architecture & Implementation Notes

## 1. Domain Entities & Database Schema
Based on [`Docs/Architecture .md`](file:///e:/HelpRoster-Volunteer-Opportunity-Platform/Docs/Architecture%20.md) and [`Docs/Task.md`](file:///e:/HelpRoster-Volunteer-Opportunity-Platform/Docs/Task.md):
- `users`: ID, email (unique), password_hash (bcrypt/argon2id), role ('volunteer', 'organization', 'admin'), status ('active', 'suspended', 'pending_verification'), created_at, updated_at
- `volunteer_profiles`: user_id (FK), first_name, last_name, phone, bio, location, skills (JSON/relation), avatar_url, created_at, updated_at
- `organizations`: id, user_id (FK), name, description, website, contact_email, phone, address, verification_status ('pending', 'verified', 'rejected'), verified_by (admin FK), verified_at, created_at, updated_at
- `categories`: id, name, slug (unique), description, icon
- `opportunities`: id, organization_id (FK), category_id (FK), title, description, requirements, location_type ('on_site', 'remote', 'hybrid'), address, start_date, end_date, application_deadline, capacity, status ('draft', 'published', 'closed', 'archived'), created_at, updated_at
- `opportunity_skills`: opportunity_id (FK), skill_name
- `applications`: id, opportunity_id (FK), volunteer_id (FK), status ('pending', 'accepted', 'rejected', 'withdrawn'), message, reviewed_by (FK), reviewed_at, created_at, updated_at
  - Unique constraint on (opportunity_id, volunteer_id) to prevent duplicate active applications.
- `volunteer_hours`: id, volunteer_id (FK), opportunity_id (FK), organization_id (FK), activity_date, hours, notes, status ('pending', 'approved', 'rejected'), reviewed_by (FK), reviewed_at, created_at, updated_at
- `achievements` & `user_achievements`: badge criteria, awarded achievements tracking
- `contact_submissions`: id, name, email, subject, message, status ('new', 'in_progress', 'resolved'), created_at
- `audit_logs`: id, user_id (FK), action, entity_type, entity_id, details (JSON), ip_address, created_at

## 2. API Design Conventions
- Base path: `/api/v1`
- Standard envelope: `{ success: true, data: ..., message: ... }` / `{ success: false, error: { code, message, details } }`
- HTTP status codes:
  - 200 OK, 201 Created, 204 No Content
  - 400 Bad Request (Validation failure)
  - 401 Unauthorized (Missing/invalid token)
  - 403 Forbidden (Insufficient permissions / unverified organization)
  - 404 Not Found
  - 409 Conflict (Duplicate application / email)
  - 429 Too Many Requests (Rate limit hit)
  - 500 Internal Server Error (Sanitized, no leaking of stack traces)

## 3. Security Hardening
- Authentication via `httpOnly`, `SameSite=Lax`, `Secure` (in prod) cookies containing JWT.
- Prepared SQL statements via `mysql2` to prevent SQL injection.
- Helmet middleware for HTTP security headers.
- Express-rate-limit on auth endpoints (`/auth/login`, `/auth/register`, `/auth/forgot-password`) and `/contact`.
- Authorization middleware checking user role AND organization resource ownership.
- Input validation with strict schemas (e.g. Zod).
