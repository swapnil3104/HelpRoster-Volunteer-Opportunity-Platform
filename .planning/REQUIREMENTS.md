# HelpRoster — Project Requirements

This document captures the functional and non-functional requirements for HelpRoster v1.0, scoped directly from [`Docs/HelpRoster_PRD.md`](file:///e:/HelpRoster-Volunteer-Opportunity-Platform/Docs/HelpRoster_PRD.md) and [`Docs/Task.md`](file:///e:/HelpRoster-Volunteer-Opportunity-Platform/Docs/Task.md).

---

## 1. 🧱 System Setup & Infrastructure Requirements

- **REQ-SYS-01 [P0]:** Monorepo structure with `client/` (React + Vite + Tailwind CSS), `server/` (Node.js + Express), and `database/` (SQL schema and migrations).
- **REQ-SYS-02 [P0]:** Environment-based configuration with `.env.example` templates for both client and server; no secrets committed to version control.
- **REQ-SYS-03 [P0]:** Health check endpoint `GET /api/v1/health` providing service status and MySQL connection verification.
- **REQ-SYS-04 [P0]:** Centralized error handling and standardized JSON API response format across all endpoints.

---

## 2. 🔐 Authentication & Authorization Requirements

- **REQ-AUTH-01 [P0]:** User registration for Volunteers and Organization Representatives with field validation, email normalization, and password hashing (bcrypt / argon2id).
- **REQ-AUTH-02 [P0]:** Secure sign-in issuing JWTs stored in `httpOnly`, `SameSite=Lax`, `Secure` cookies with clean logout clearing cookies.
- **REQ-AUTH-03 [P0]:** Role-based authorization middleware enforcing access controls for `volunteer`, `organization`, and `admin` roles.
- **REQ-AUTH-04 [P0]:** Resource ownership verification preventing organizations from inspecting or altering resources belonging to other organizations.
- **REQ-AUTH-05 [P1]:** Password reset flow via secure, single-use, time-limited reset tokens sent via transactional email.
- **REQ-AUTH-06 [P1]:** Volunteer and Organization profile management with private vs public field segregation.

---

## 3. 🏢 Organization Management & Verification Gate

- **REQ-ORG-01 [P0]:** Organization profile creation during signup capturing name, mission, contact info, and website.
- **REQ-ORG-02 [P0]:** Administrative Verification Gate: Organizations default to `pending` verification status. Unverified organizations CANNOT publish opportunities or review public applications until verified by an Administrator.
- **REQ-ORG-03 [P1]:** Organization public directory and profile pages displaying approved public information and published opportunities.

---

## 4. 🔎 Opportunity Discovery & Management

- **REQ-OPP-01 [P0]:** Organization opportunity CRUD allowing verified organizations to create, edit, save draft, publish, close, and archive opportunities.
- **REQ-OPP-02 [P0]:** Opportunity fields: Title, description, category, required skills, location (on-site address / remote / hybrid), dates, application deadline, volunteer capacity.
- **REQ-OPP-03 [P0]:** Public opportunity list and detail views displaying only active, `published` opportunities with expired/closed/draft items excluded.
- **REQ-OPP-04 [P1]:** Search and multi-criteria filtering by keyword, category, location, date range, and skills.
- **REQ-OPP-05 [P0]:** Automatic or server-enforced deadline checks preventing applications to closed or expired opportunities.

---

## 5. 📝 Volunteer Applications Workflow

- **REQ-APP-01 [P0]:** Application submission by authenticated volunteers to open opportunities, with optional statement of interest/availability.
- **REQ-APP-02 [P0]:** Transaction-safe duplicate prevention ensuring a volunteer cannot submit multiple active applications to the same opportunity.
- **REQ-APP-03 [P0]:** Volunteer "My Applications" view tracking real-time status (`pending`, `accepted`, `rejected`, `withdrawn`).
- **REQ-APP-04 [P0]:** Organization applicant review queue allowing organization representatives to view applicants, download/inspect qualifications, and accept or reject applications.
- **REQ-APP-05 [P1]:** Volunteer ability to withdraw a pending application prior to decision.

---

## 6. ⏱️ Volunteer Hours & Achievements

- **REQ-HRS-01 [P1]:** Volunteer service hours submission interface specifying date, hours volunteered, opportunity, and activity notes.
- **REQ-HRS-02 [P1]:** Organization hours review workflow allowing organizations to verify, approve, or reject logged volunteer hours.
- **REQ-HRS-03 [P1]:** Automated achievement / badge evaluation logic awarding milestone badges (e.g., First Step, Community Hero, 50 Hours Club) idempotently.
- **REQ-HRS-04 [P1]:** Volunteer achievements showcase displaying earned badges and verified hours on the volunteer dashboard.

---

## 7. 📊 Dashboards & Analytics

- **REQ-DSH-01 [P1]:** Volunteer Dashboard showing applied opportunities, status distribution, approved hours total, and upcoming commitments.
- **REQ-DSH-02 [P1]:** Organization Dashboard showing active listings, pending applicant counts, verified hours awaiting review, and quick actions.
- **REQ-DSH-03 [P1]:** Admin Dashboard showing platform totals (users, organizations, listings, applications), pending organization verification requests, and moderation actions.
- **REQ-DSH-04 [P1]:** Public Impact Metrics on landing page showing verified volunteer hours and active opportunities, populated strictly from real database records.

---

## 8. 🎨 UI/UX & Design System

- **REQ-UI-01 [P0]:** Complete responsive design system implemented with Tailwind CSS matching design tokens in `Docs/Design .md` (Inter typography, primary blue `#2563EB`, accent `#14B8A6`, crisp borders, shadows).
- **REQ-UI-02 [P0]:** Global accessible navigation header and footer with role-aware actions and mobile navigation drawer.
- **REQ-UI-03 [P0]:** Accessible UI components (Button, Input, Select, Badge, Card, Modal, EmptyState, Skeleton loaders) supporting keyboard focus and ARIA labels.
- **REQ-UI-04 [P1]:** Polished public pages: Home (hero, featured opportunities, how it works), About, FAQ, and Contact.

---

## 9. 🛡️ Security, Privacy & Reliability

- **REQ-SEC-01 [P0]:** SQL injection prevention using exclusively parameterized queries (`mysql2` prepared statements).
- **REQ-SEC-02 [P0]:** XSS and HTTP hardening using Helmet, sanitized user input, and secure cookies.
- **REQ-SEC-03 [P0]:** Rate limiting on authentication routes and contact form submissions.
- **REQ-SEC-04 [P0]:** Audit logging for administrative actions (approving organizations, suspending accounts, moderating listings).
- **REQ-SEC-05 [P1]:** Centralized contact form endpoint with anti-spam / rate-limiting protection.
- **REQ-SEC-06 [P1]:** Transactional email integration for account verification, password resets, and critical application status changes.
