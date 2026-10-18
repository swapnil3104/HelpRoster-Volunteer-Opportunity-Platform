# HelpRoster — Project Context

## 1. 📌 Executive Summary
**HelpRoster** is a web-based volunteer opportunity platform that connects volunteers with NGOs and community organizations that need support. Organizations can register, undergo administrative verification, publish and manage opportunities, and review incoming volunteer applications. Volunteers can explore and filter opportunities, submit applications, track application decisions, log verified volunteer service hours, and earn milestone achievements. Platform administrators oversee organizations, moderate listings, manage users, and review audit history.

## 2. 🎯 Product Vision & Core Goals
- **Centralized Directory:** Provide an intuitive, searchable directory of volunteer opportunities by cause, location, skill set, and date.
- **Organization Workspaces:** Empower NGOs to manage opportunities, track applicants, and review logged service hours with minimal friction.
- **Volunteer Lifecycle:** Provide volunteers with a transparent view of their application states, service hours, and achievements.
- **Administrative Trust:** Ensure volunteer trust through an administrative verification gate for all organizations prior to opportunity publishing.
- **Measurable Social Impact:** Real-time metrics based exclusively on verified, persisted records (no fabricated metrics).

## 3. 👥 Target User Roles
1. **Public Visitor:** Discovers open opportunities, views organizations and platform info, registers as volunteer or organization.
2. **Volunteer:** Browses and filters opportunities, applies to open listings, monitors application status, logs volunteer hours, views badges.
3. **Organization Representative:** Manages organization profile, creates and manages opportunities (once verified by admin), reviews applications (accept/reject), verifies volunteer hours.
4. **Administrator:** Reviews and verifies organization registrations, moderates content and opportunities, manages user accounts, and monitors audit logs.

## 4. 🧱 Technology Stack & Architecture
- **Frontend:** React (JavaScript) + Vite + React Router (SPA) + Tailwind CSS (configured with design tokens from `Design.md`).
- **Backend:** Node.js + Express.js (`/api/v1` REST API structure, thin controllers, service layer, data-access layer).
- **Database:** MySQL (InnoDB engine, relational foreign keys, constraints, transactions for multi-step ops, parameterized queries via `mysql2`).
- **Authentication:** JWT stored in secure, `httpOnly`, `SameSite=Lax` cookies with CSRF mitigation.
- **Validation:** Request body and query validation using Zod / Joi on server; client-side form validation before submission.
- **Notifications:** Transactional email integration (Nodemailer / SMTP / Resend) for verification, application updates, and password reset.

## 5. 📋 Confirmed Key Decisions (TASK-001)
- **Organization Verification:** Mandatory administrative approval required before any organization can publish opportunities.
- **Auth Strategy:** Secure `httpOnly` cookie-based JWTs with role-based authorization middleware.
- **Styling Approach:** Tailwind CSS customized with color tokens, typography, and spacing defined in `Docs/Design .md`.
- **Email Notifications:** Full transactional email integration included in Phase 7 / release milestone.

## 6. 📚 Baseline Specification References
- **PRD:** [`Docs/HelpRoster_PRD.md`](file:///e:/HelpRoster-Volunteer-Opportunity-Platform/Docs/HelpRoster_PRD.md)
- **Architecture:** [`Docs/Architecture .md`](file:///e:/HelpRoster-Volunteer-Opportunity-Platform/Docs/Architecture%20.md)
- **UI/UX Design:** [`Docs/Design .md`](file:///e:/HelpRoster-Volunteer-Opportunity-Platform/Docs/Design%20.md)
- **Rules & Standards:** [`Docs/RULES.md`](file:///e:/HelpRoster-Volunteer-Opportunity-Platform/Docs/RULES.md)
- **Task Backlog:** [`Docs/Task.md`](file:///e:/HelpRoster-Volunteer-Opportunity-Platform/Docs/Task.md)
