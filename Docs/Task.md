# HelpRoster --- Development Task Plan

> **Project:** HelpRoster --- Volunteer Opportunity Platform\
> **Document:** `Task.md`\
> **Version:** 1.0\
> **Status:** Initial implementation backlog\
> **Stack:** React + JavaScript, Node.js + Express.js, MySQL

------------------------------------------------------------------------

## 1. 🎯 Purpose

This document converts the HelpRoster PRD, architecture, and design
specification into an actionable development backlog. Tasks are grouped
by phase and include priorities, dependencies, and acceptance criteria.

Use this file to track progress during implementation. A task is
complete only when its acceptance criteria pass and the changes are
documented.

### Priority levels

-   **P0 --- Critical:** Required for a functional initial release.
-   **P1 --- High:** Important for a complete and reliable first
    release.
-   **P2 --- Later:** Enhancement that can follow the initial release.

### Status convention

Use `[ ]` for not started, `[~]` for in progress, and `[x]` for
completed.

## 2. 🧱 Phase 0 --- Project Planning and Setup

### TASK-001: Confirm product decisions `[P0]`

-   [x] Confirm volunteer, organization, and administrator permissions.
-   [x] Confirm application status transitions.
-   [x] Confirm opportunity publication, closing, and deadline rules.
-   [x] Decide whether organization verification is required before
    publishing.
-   [x] Decide whether email notifications are included in the first
    release.
-   [x] Confirm first-release scope and deployment target.

**Acceptance criteria** - Open decisions are documented. - Scope is
agreed before dependent features are implemented.

### TASK-002: Initialize repository `[P0]`

-   [x] Create the `HelpRoster/` repository.
-   [x] Add `client/`, `server/`, `database/`, and `docs/`.
-   [x] Add a root README with project purpose and setup overview.
-   [x] Add `.gitignore` for dependencies, build outputs, logs, and
    environment files.
-   [x] Add `PRD.md`, `Architecture.md`, `Design.md`, and `Task.md` to
    `docs/`.

**Acceptance criteria** - Repository structure is committed. - No
secrets or local database files are tracked.

### TASK-003: Initialize React frontend `[P0]`

-   [x] Create a React + JavaScript application using Vite in `client/`.
-   [x] Install and configure React Router.
-   [x] Choose and configure Tailwind CSS or the agreed styling
    approach.
-   [x] Add a base layout and global design tokens.
-   [x] Add `.env.example` for non-secret frontend configuration.

**Acceptance criteria** - The frontend starts locally and displays a
working placeholder page. - Shared styles and route configuration are in
place.

### TASK-004: Initialize Express backend `[P0]`

-   [x] Initialize Node.js and Express in `server/`.
-   [x] Add a health endpoint such as `GET /api/v1/health`.
-   [x] Add environment configuration and startup validation.
-   [x] Add centralized error-handling middleware.
-   [x] Add request validation, security headers, and basic
    rate-limiting dependencies.
-   [x] Add a safe `.env.example`.

**Acceptance criteria** - The API starts locally. - Health endpoint
returns a successful JSON response. - Unexpected errors do not expose
stack traces to clients.

### TASK-005: Configure MySQL `[P0]`

-   [x] Create a local development database.
-   [x] Configure the MySQL connection using environment variables.
-   [x] Use a connection pool and parameterized queries or a reviewed
    ORM.
-   [x] Add a migration strategy.
-   [x] Add a database connectivity check for development and deployment
    health checks.

**Acceptance criteria** - The backend connects to MySQL without
hard-coded credentials. - Connection failures are handled safely and
logged appropriately.

## 3. 🗃️ Phase 1 --- Database Design and Foundation

### TASK-006: Design schema and relationships `[P0]`

-   [x] Define `users`.
-   [x] Define `volunteer_profiles`.
-   [x] Define `organizations`.
-   [x] Define `categories`.
-   [x] Define `opportunities`.
-   [x] Define `opportunity_skills` or an equivalent skills structure.
-   [x] Define `applications`.
-   [x] Define `volunteer_hours`.
-   [x] Define `achievements` and `user_achievements`.
-   [x] Define `contact_submissions`.
-   [x] Define `audit_logs` for privileged actions.

**Acceptance criteria** - `database/schema.sql` or migrations define
primary keys, foreign keys, indexes, and constraints. - Entity
relationships match the approved architecture. - Duplicate active
applications are prevented safely.

### TASK-007: Add migrations and seed data `[P0]`

-   [x] Create versioned schema migrations.
-   [x] Add development-only seed data for categories and sample
    opportunities.
-   [x] Ensure seed scripts are repeatable or safely resettable in
    development.
-   [x] Document database setup and reset instructions.

**Acceptance criteria** - A clean development database can be created
from documented steps. - Sample data is clearly identified as
non-production data.

### TASK-008: Define API conventions `[P0]`

-   [x] Use `/api/v1` as the API prefix.
-   [x] Define standard JSON response and error shapes.
-   [x] Define pagination and filtering conventions.
-   [x] Define validation behavior and HTTP status codes.
-   [x] Document endpoint permissions.

**Acceptance criteria** - API conventions are documented and applied
consistently to initial endpoints.

## 4. 🔐 Phase 2 --- Authentication and Profiles

### TASK-009: Implement registration `[P0]`

-   [x] Build registration UI for volunteers and organization
    representatives.
-   [x] Validate required fields on the frontend and backend.
-   [x] Normalize email addresses and enforce uniqueness.
-   [x] Hash passwords with Argon2id or bcrypt.
-   [x] Create the account and appropriate profile records safely.
-   [x] Show success and validation feedback.

**Acceptance criteria** - Valid registrations persist to MySQL. -
Invalid input is rejected. - Plain-text passwords are never stored.

### TASK-010: Implement login and logout `[P0]`

-   [x] Build login and logout UI.
-   [x] Verify credentials securely.
-   [x] Implement the selected session or token strategy.
-   [x] Configure secure cookies and CSRF protections where applicable.
-   [x] Add session expiry and logout behavior.
-   [x] Return safe authentication errors.

**Acceptance criteria** - Valid users can sign in and sign out. -
Invalid credentials do not reveal sensitive account details. - Session
behavior follows the documented authentication decision.

### TASK-011: Implement authorization middleware `[P0]`

-   [x] Add authentication middleware.
-   [x] Add role checks for volunteer, organization, and admin
    endpoints.
-   [x] Add resource ownership checks for organization resources.
-   [x] Add tests for cross-user and cross-organization access attempts.

**Acceptance criteria** - Protected endpoints deny unauthenticated
users. - Users cannot access records they do not own or have permission
to manage.

### TASK-012: Build profile management `[P1]`

-   [x] Build volunteer profile view and edit forms.
-   [x] Build organization profile view and edit forms.
-   [x] Define public and private profile fields.
-   [x] Validate and persist profile changes.
-   [x] Display clear save and error feedback.

**Acceptance criteria** - Users can update only their permitted profile
fields. - Public profile APIs exclude private account information.

## 5. 🧭 Phase 3 --- Public Pages and Shared UI

### TASK-013: Build shared design system `[P0]`

-   [ ] Implement color, typography, spacing, and radius tokens from
    `Design.md`.
-   [ ] Build shared Button, TextField, TextArea, SelectField,
    StatusBadge, Alert, and EmptyState components.
-   [ ] Build loading skeletons and error states.
-   [ ] Implement keyboard focus and disabled states.

**Acceptance criteria** - Shared components are reused across primary
pages. - Components support accessible labels and visible focus.

### TASK-014: Build global layout `[P0]`

-   [ ] Implement SiteHeader and SiteFooter.
-   [ ] Add responsive desktop and mobile navigation.
-   [ ] Add page container and heading components.
-   [ ] Add role-aware navigation for authenticated users.

**Acceptance criteria** - Public pages share consistent layout. -
Navigation is keyboard accessible and responsive.

### TASK-015: Build Home page `[P1]`

-   [ ] Create hero section and primary calls to action.
-   [ ] Add featured opportunities.
-   [ ] Add How It Works sections for volunteers and organizations.
-   [ ] Add impact metrics only when backed by reliable data.
-   [ ] Add responsive layout and empty/loading states.

**Acceptance criteria** - Visitors can navigate from Home to
opportunities and registration. - No fabricated impact metrics are
presented as real data.

### TASK-016: Build About and Contact pages `[P1]`

-   [ ] Implement About and How It Works content.
-   [ ] Implement Contact form UI.
-   [ ] Implement FAQ section.
-   [ ] Add form validation and submission feedback.

**Acceptance criteria** - Public information pages are responsive and
accessible. - Contact submission is connected to a functioning backend
flow before release.

## 6. 🔎 Phase 4 --- Opportunity Discovery and Management

### TASK-017: Build opportunity list and detail pages `[P0]`

-   [ ] Implement opportunity list page.
-   [ ] Implement opportunity detail page.
-   [ ] Display organization, category, location, dates, commitment,
    eligibility, and deadline.
-   [ ] Add loading, empty, not-found, and error states.
-   [ ] Ensure only published opportunities are publicly visible.

**Acceptance criteria** - Public visitors can browse published
opportunities and view their details. - Draft and archived opportunities
are not exposed publicly.

### TASK-018: Implement search and filters `[P1]`

-   [ ] Add keyword search.
-   [ ] Add category filter.
-   [ ] Add location filter.
-   [ ] Add date and skills filters where supported by the data model.
-   [ ] Add pagination and clear-filter behavior.

**Acceptance criteria** - Filters are validated by the API and return
matching results. - Pagination works without duplicate or missing
records under normal use.

### TASK-019: Implement organization opportunity CRUD `[P0]`

-   [ ] Build My Opportunities workspace.
-   [ ] Build create/edit opportunity form.
-   [ ] Support draft, publish, close, and archive actions.
-   [ ] Validate dates, deadlines, capacity, and required fields.
-   [ ] Enforce ownership and allowed status transitions in the backend.
-   [ ] Add preview and confirmation for consequential actions.

**Acceptance criteria** - Authorized organization representatives can
manage only their own opportunities. - Closed or expired opportunities
reject new applications at the API layer.

### TASK-020: Build organization directory and profiles `[P1]`

-   [ ] Build organization listing page.
-   [ ] Build public organization profile page.
-   [ ] Show published opportunities for each organization.
-   [ ] Add search/filter support if included in the release.

**Acceptance criteria** - Public pages show only approved public
fields. - Private organization account data is not exposed.

## 7. 📝 Phase 5 --- Applications Workflow

### TASK-021: Implement application submission `[P0]`

-   [ ] Add Apply action for eligible signed-in volunteers.
-   [ ] Redirect visitors to login/registration before applying.
-   [ ] Implement application creation endpoint.
-   [ ] Check opportunity status and deadline on the server.
-   [ ] Prevent duplicate active applications using transaction-safe
    logic and database constraints where appropriate.
-   [ ] Store initial status as `pending`.

**Acceptance criteria** - A volunteer can apply to an open
opportunity. - Duplicate, unauthorized, closed, and expired applications
are rejected safely.

### TASK-022: Build My Applications page `[P0]`

-   [ ] List the current volunteer's applications.
-   [ ] Display opportunity, organization, submission date, and status.
-   [ ] Add status filters.
-   [ ] Display useful empty and error states.
-   [ ] Add application detail/history view if included.

**Acceptance criteria** - A volunteer can see only their own
applications. - Status values and timestamps reflect persisted server
data.

### TASK-023: Implement organization application review `[P0]`

-   [ ] Build applicant list for each organization-owned opportunity.
-   [ ] Add accept and reject actions.
-   [ ] Validate permitted status transitions.
-   [ ] Record decision timestamps and reviewer identity where required.
-   [ ] Add confirmation and feedback states.
-   [ ] Add notification integration if enabled.

**Acceptance criteria** - Organizations can review applications only for
opportunities they manage. - Decision changes appear in the volunteer's
application view.

## 8. 📊 Phase 6 --- Dashboards, Volunteer Hours, and Achievements

### TASK-024: Build volunteer dashboard `[P1]`

-   [ ] Add application summary cards.
-   [ ] Add recent application activity.
-   [ ] Add approved volunteer-hours summary.
-   [ ] Add achievements section.
-   [ ] Add links to common volunteer actions.

**Acceptance criteria** - Dashboard metrics are calculated from
persisted records. - Pending hours are distinguished from approved
hours.

### TASK-025: Build organization dashboard `[P1]`

-   [ ] Add active opportunity and application metrics.
-   [ ] Add recent applications.
-   [ ] Add quick links to opportunity management.
-   [ ] Add pending volunteer-hour reviews if supported.

**Acceptance criteria** - Dashboard displays only data belonging to the
authorized organization.

### TASK-026: Implement volunteer-hour submission and review `[P1]`

-   [ ] Build volunteer-hour submission form.
-   [ ] Validate activity date, duration, volunteer, and opportunity.
-   [ ] Store submissions as pending review.
-   [ ] Build organization review queue.
-   [ ] Implement approve/reject endpoints with authorization.
-   [ ] Track reviewer and review timestamp.

**Acceptance criteria** - Volunteers can submit their own hours. -
Authorized organization representatives can review only relevant
submissions. - Only approved hours count toward official impact metrics.

### TASK-027: Implement achievements `[P1]`

-   [ ] Define initial badge criteria.
-   [ ] Implement achievement eligibility logic.
-   [ ] Store earned achievements without duplicate awards.
-   [ ] Display earned badges on the volunteer dashboard.

**Acceptance criteria** - Badges are awarded only when criteria are
met. - Repeated processing does not create duplicate awards.

### TASK-028: Implement platform impact summaries `[P1]`

-   [ ] Define impact metric calculations.
-   [ ] Use published opportunities and verified participation records
    appropriately.
-   [ ] Build public impact section only if data is available.
-   [ ] Exclude private user information from public aggregates.

**Acceptance criteria** - Metrics are reproducible and documented. -
Pending or unverified hours are not represented as approved
contributions.

## 9. 🛡️ Phase 7 --- Administration, Support, and Notifications

### TASK-029: Build admin workspace `[P1]`

-   [ ] Build user list and account-status controls.
-   [ ] Build organization review tools.
-   [ ] Build opportunity moderation tools.
-   [ ] Add confirmation and reason fields for moderation actions.
-   [ ] Record privileged actions in audit logs.

**Acceptance criteria** - Only administrators can use admin endpoints. -
Important administrative actions are auditable.

### TASK-030: Complete contact and support workflow `[P1]`

-   [ ] Implement backend contact endpoint.
-   [ ] Validate and sanitize form fields.
-   [ ] Store submissions or deliver them to a configured support
    destination.
-   [ ] Add rate limiting and spam controls.
-   [ ] Add success and failure feedback.

**Acceptance criteria** - Valid requests are persisted or delivered
through the documented mechanism. - Public submissions cannot overload
the endpoint easily.

### TASK-031: Add email notifications `[P1, optional for first release]`

-   [ ] Select and configure an email provider.
-   [ ] Create templates for password reset and application decisions.
-   [ ] Send notifications without blocking critical request handling
    where practical.
-   [ ] Add safe retry and failure logging.
-   [ ] Keep provider credentials in secrets/configuration.

**Acceptance criteria** - Notifications are sent only for defined
events. - Delivery failures are logged safely and do not corrupt
application state.

## 10. 🧪 Phase 8 --- Testing and Quality

### TASK-032: Unit and integration tests `[P0]`

-   [ ] Test input validators and service rules.
-   [ ] Test authentication and authorization middleware.
-   [ ] Test opportunity CRUD and status transitions.
-   [ ] Test application submission and duplicate prevention.
-   [ ] Test volunteer-hour approval rules.
-   [ ] Test database constraints and transactions.

**Acceptance criteria** - Critical business rules have automated
tests. - Tests use an isolated test configuration and do not modify
production data.

### TASK-033: End-to-end tests `[P1]`

-   [ ] Test volunteer registration and login.
-   [ ] Test opportunity discovery and application submission.
-   [ ] Test organization publication and application review.
-   [ ] Test volunteer dashboard and application status updates.
-   [ ] Test unauthorized access attempts.

**Acceptance criteria** - Critical user journeys pass in a repeatable
test environment.

### TASK-034: Accessibility and responsive QA `[P0]`

-   [ ] Test mobile, tablet, and desktop layouts.
-   [ ] Test keyboard navigation and visible focus.
-   [ ] Test form labels and error associations.
-   [ ] Check color contrast and status communication.
-   [ ] Check image alternative text and dialog focus behavior.

**Acceptance criteria** - No known release-blocking accessibility or
responsive defects remain.

### TASK-035: Security hardening `[P0]`

-   [ ] Review SQL injection protection.
-   [ ] Verify all protected endpoints enforce authorization.
-   [ ] Configure CORS and secure headers.
-   [ ] Add rate limiting to sensitive endpoints.
-   [ ] Check secrets and sensitive data are excluded from logs and
    source control.
-   [ ] Review dependency vulnerabilities.
-   [ ] Verify safe error responses.

**Acceptance criteria** - Critical security scenarios pass the agreed
test checklist.

## 11. 🚀 Phase 9 --- Deployment and Documentation

### TASK-036: Prepare deployment configuration `[P1]`

-   [ ] Choose frontend, API, and MySQL hosting.
-   [ ] Configure environment variables and secrets.
-   [ ] Configure HTTPS and allowed frontend origins.
-   [ ] Add production database migrations.
-   [ ] Configure health checks and logs.
-   [ ] Add backups and document restore procedure.

**Acceptance criteria** - Staging deployment works with production-like
configuration. - No development credentials or sample data are deployed
unintentionally.

### TASK-037: Complete project documentation `[P1]`

-   [ ] Update root README with setup instructions.
-   [ ] Document environment variables.
-   [ ] Document database creation and migrations.
-   [ ] Document API endpoints and permissions.
-   [ ] Document testing and build commands.
-   [ ] Link `PRD.md`, `Architecture.md`, `Design.md`, and `Task.md`.

**Acceptance criteria** - A new developer can run the project by
following the documentation.

### TASK-038: Release readiness review `[P0]`

-   [ ] Confirm all P0 tasks are complete.
-   [ ] Confirm release-critical acceptance tests pass.
-   [ ] Review open security and privacy issues.
-   [ ] Verify database backup and recovery process.
-   [ ] Verify error monitoring and operational contacts.
-   [ ] Record known limitations and deferred P1/P2 work.

**Acceptance criteria** - Release owner approves the release checklist
and known risks.

## 12. 🔗 Dependency Overview

``` mermaid
flowchart TD
    A[Project Setup] --> B[Database Schema]
    A --> C[Shared UI and Layout]
    B --> D[Authentication and Authorization]
    C --> E[Public Pages]
    D --> F[Profiles and Role Workspaces]
    B --> G[Opportunity API]
    D --> G
    E --> H[Opportunity Discovery UI]
    G --> H
    G --> I[Application Workflow]
    D --> I
    I --> J[Dashboards]
    B --> K[Volunteer Hours]
    D --> K
    K --> J
    J --> L[Testing and Hardening]
    I --> L
    F --> L
    L --> M[Deployment and Release]
```

## 13. 📋 Release Milestones

  -----------------------------------------------------------------------
  Milestone               Included work           Exit condition
  ----------------------- ----------------------- -----------------------
  M1 --- Foundation       Tasks 001--008          Repository, API, and
                                                  database foundation
                                                  work

  M2 --- Accounts         Tasks 009--012          Secure authentication
                                                  and permissions pass
                                                  tests

  M3 --- Public           Tasks 013--018, 020     Public pages and
  experience                                      opportunity discovery
                                                  work

  M4 --- Core workflow    Tasks 019, 021--023     Organizations publish
                                                  opportunities and
                                                  manage applications

  M5 --- Participation    Tasks 024--028          Dashboards and
                                                  hours/achievements work
                                                  if included in scope

  M6 --- Operational      Tasks 029--038          Testing, security,
  readiness                                       documentation, and
                                                  deployment checks pass
  -----------------------------------------------------------------------

Milestones are logical groupings, not calendar estimates. Schedule dates
should be assigned after team capacity and scope are confirmed.

## 14. 🚫 Global Definition of Done

A task is complete only when:

-   [ ] Its acceptance criteria pass.
-   [ ] Input validation is implemented on the server where applicable.
-   [ ] Authorization is enforced server-side for protected operations.
-   [ ] Loading, empty, success, and error states are handled where
    relevant.
-   [ ] Tests cover critical behavior.
-   [ ] UI changes are responsive and keyboard accessible.
-   [ ] No secrets or unnecessary personal data are exposed.
-   [ ] Documentation and configuration examples are updated.
-   [ ] Changes are reviewed and committed.

## 15. 📌 Notes for Developers

-   Keep business rules in backend services, not only in React
    components.
-   Do not trust client-provided roles, ownership IDs, status values, or
    impact totals without server-side verification.
-   Use prepared SQL statements or safe ORM operations.
-   Prevent duplicate applications and achievement awards at the service
    and database levels where practical.
-   Use transactions for operations that update multiple related
    records.
-   Keep `.env` files out of Git and provide `.env.example`
    placeholders.
-   Use development-only sample data and never present invented impact
    figures as real.
-   Update this task file when scope changes; do not silently remove
    acceptance criteria.

------------------------------------------------------------------------

## 16. 📝 Document Status

This backlog is the initial implementation plan for **HelpRoster ---
Volunteer Opportunity Platform**, aligned with `PRD.md`,
`Architecture.md`, and `Design.md`.

Track task completion with the checkboxes above. Reprioritize only after
documenting the impact on release scope, dependencies, security, and
acceptance criteria.
