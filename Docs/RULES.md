# HelpRoster --- Antigravity IDE Rules

> **File:** `RULES.md` (or the project rules file supported by your
> Antigravity setup)\
> **Project:** HelpRoster --- Volunteer Opportunity Platform\
> **Stack:** React + JavaScript, Node.js + Express.js, MySQL\
> **Purpose:** Define consistent coding, security, architecture, UI,
> testing, and workflow rules for AI-assisted development.

------------------------------------------------------------------------

## 1. 🎯 Core Instructions

1.  Read `docs/PRD.md`, `docs/Architecture.md`, `docs/Design.md`, and
    `docs/Task.md` before implementing a feature, when these files are
    available.
2.  Treat those documents as the product baseline. If implementation
    conflicts with them, explain the conflict and propose an update
    rather than silently changing requirements.
3.  Use the required stack: **React + JavaScript + Node.js +
    Express.js + MySQL**. Do not introduce another frontend framework,
    backend framework, or database without explicit approval.
4.  Work in small, reviewable increments. Complete the requested task
    and verify it before moving to unrelated work.
5.  Do not claim that code was run, tests passed, a database was
    updated, or a feature works unless the relevant action was actually
    performed and verified.
6.  If a requirement is ambiguous and the choice could affect security,
    data integrity, architecture, or major UX behavior, ask a concise
    question or document the assumption before proceeding.
7.  Do not overwrite existing user work or remove functioning features
    without a clear reason and approval when the change is destructive.

## 2. 🧱 Technology Rules

### Frontend

-   Use React with JavaScript and Vite.
-   Use React Router for client-side routing.
-   Use the styling system already established in the repository. If
    none exists, use Tailwind CSS only if approved or specified in the
    project documentation.
-   Keep API calls in centralized service modules.
-   Use reusable components for common UI patterns.
-   Do not add TypeScript unless explicitly requested.
-   Do not add a state-management library for simple state that React
    hooks or Context can handle.

### Backend

-   Use Node.js and Express.js.
-   Expose REST endpoints under `/api/v1`.
-   Keep route handlers thin; put business logic in service modules.
-   Use a data-access/repository layer when it improves clarity and
    testability.
-   Validate request body, route parameters, and query parameters on the
    server.
-   Use centralized error-handling middleware.
-   Keep configuration environment-based.

### Database

-   Use MySQL with InnoDB tables and relational constraints.
-   Use `mysql2` with prepared statements or an explicitly approved,
    safe ORM.
-   Use migrations or version-controlled SQL scripts for schema changes.
-   Never construct SQL by concatenating untrusted input.
-   Use foreign keys, unique constraints, and indexes where appropriate.
-   Use transactions for multi-step operations that must succeed or fail
    together.

## 3. 🗂️ Project Structure

Follow the existing structure. If the repository is new, use this as the
default:

``` text
HelpRoster/
├── client/
│   └── src/
│       ├── components/
│       ├── layouts/
│       ├── pages/
│       ├── routes/
│       ├── context/
│       ├── hooks/
│       ├── services/
│       └── utils/
├── server/
│   └── src/
│       ├── config/
│       ├── controllers/
│       ├── middleware/
│       ├── routes/
│       ├── services/
│       ├── repositories/
│       ├── validators/
│       └── utils/
├── database/
│   ├── schema.sql
│   └── seeds.sql
└── docs/
    ├── PRD.md
    ├── Architecture.md
    ├── Design.md
    ├── Task.md
    └── RULES.md
```

Do not move or rename existing files just to match this structure.
Follow the actual repository if it already has an established layout.

## 4. 🔐 Security Rules --- Mandatory

-   Enforce authentication and authorization on the backend. A hidden
    button or React route guard is not authorization.
-   Check both role and resource ownership for organization-specific
    actions.
-   Never trust user IDs, role names, organization IDs, status values,
    or impact totals supplied by the client without server-side
    verification.
-   Hash passwords with Argon2id or bcrypt. Never store plaintext
    passwords.
-   Keep secrets in environment variables or an approved secret manager.
    Never commit real `.env` files or credentials.
-   Provide `.env.example` with placeholder values only.
-   Never expose database credentials, session secrets, access tokens,
    password hashes, stack traces, or internal server details in client
    responses.
-   Use prepared SQL statements or safe ORM operations.
-   Validate and normalize all untrusted input on the server.
-   Apply rate limiting to login, registration, password-reset,
    application-submission, and contact endpoints as appropriate.
-   Configure CORS to allow only approved origins in deployed
    environments.
-   Use HTTPS in production.
-   If using cookies for authentication, configure `HttpOnly`, `Secure`,
    and an appropriate `SameSite` policy; add CSRF protection where
    applicable.
-   If using JWTs, define expiration, refresh, revocation, and storage
    rules before implementation. Never place long-lived secrets in
    browser local storage.
-   Avoid logging passwords, tokens, session cookies, or unnecessary
    personal information.
-   Use least-privilege database accounts.
-   Do not add file uploads without validating file type, size, storage
    path, and access permissions.
-   Do not disable security controls merely to make a test pass.

## 5. 👤 Roles and Authorization

HelpRoster has these roles:

-   `volunteer`
-   `organization`
-   `admin`

Public visitors are unauthenticated.

Required authorization rules: - Volunteers can view and manage only
their own private profile, applications, and hour submissions. -
Organization representatives can manage only organizations and
opportunities they are authorized to manage. - Organizations can review
applications only for their own opportunities. - Organizations can
review volunteer hours only for relevant opportunities and only when
authorized. - Administrators can perform privileged moderation tasks
only through explicitly protected endpoints. - Public endpoints return
only information intended for public display.

Implement these checks in backend middleware and/or service logic, not
only in the frontend.

## 6. 🎨 UI and UX Rules

-   Follow `docs/Design.md` for colors, typography, spacing, components,
    and page behavior.
-   Keep the interface clean, consistent, responsive, and accessible.
-   Use shared components instead of duplicating common patterns.
-   Every data-driven page should handle loading, empty, error, and
    success states where applicable.
-   Forms must have visible labels, clear required-field indicators,
    inline validation, and understandable error messages.
-   Disable repeated submission while an important request is in
    progress.
-   Provide visible keyboard focus and meaningful accessible names.
-   Do not rely on color alone to communicate status.
-   Use semantic HTML and meaningful alternative text for informative
    images.
-   Avoid unnecessary animations and respect reduced-motion preferences.
-   Design mobile, tablet, and desktop layouts; do not assume a fixed
    9:16 live website viewport.
-   Never fabricate testimonials, organization verification, user
    counts, volunteer hours, or impact statistics. Use clearly labeled
    demo data only in development.

## 7. 🧠 Application Business Rules

Implement these rules in backend services and enforce them consistently:

1.  Only published opportunities intended for public display appear in
    public listings.
2.  Only eligible, authenticated volunteers may apply.
3.  Closed, archived, or expired opportunities must reject new
    applications.
4.  Duplicate active applications to the same opportunity must be
    prevented.
5.  Organizations may change application status only for opportunities
    they control.
6.  Define and validate allowed application status transitions.
7.  Volunteer-hour submissions remain pending until reviewed if hour
    approval is enabled.
8.  Only approved hours count toward official impact totals.
9.  Achievement badges must be based on documented criteria and must not
    be awarded twice accidentally.
10. Public dashboard metrics must not expose private user information.
11. Important administrative and review actions should be auditable.
12. If a business rule is not defined in `PRD.md`, do not invent a major
    rule silently; document the assumption or ask for clarification.

Suggested application statuses are `pending`, `accepted`, `rejected`,
and `withdrawn`. Suggested opportunity statuses are `draft`,
`published`, `closed`, and `archived`. Confirm the approved transitions
before implementing status-changing operations.

## 8. 🧩 Code Quality Rules

-   Use clear, descriptive names for variables, functions, components,
    and files.
-   Prefer small, single-purpose functions and components.
-   Keep business logic out of React presentation components.
-   Avoid duplicated logic; extract shared logic when it improves
    maintainability.
-   Avoid unnecessary abstractions, dependencies, and premature
    optimization.
-   Handle asynchronous operations and failures explicitly.
-   Do not swallow errors silently.
-   Remove unused imports and dead code introduced by the change.
-   Keep comments focused on intent, constraints, and non-obvious
    decisions.
-   Do not add mock implementations to production paths unless
    explicitly requested.
-   Use consistent formatting and linting already configured in the
    repository.
-   Do not reformat unrelated files as part of a small feature.
-   Do not change package versions unnecessarily.

## 9. 🌐 API Rules

-   Use `/api/v1` for REST endpoints.
-   Use HTTP methods and status codes consistently.
-   Validate path, query, and body data.
-   Use pagination for potentially large lists.
-   Return only fields the current user is allowed to see.
-   Use a consistent JSON response/error format.
-   Return user-safe messages and keep internal diagnostics in server
    logs.
-   Ensure database failures do not produce partially updated workflows.
-   Avoid leaking whether an account exists in sensitive authentication
    flows.
-   Document new endpoints and permissions in the relevant project
    documentation.
-   Avoid duplicate side effects on retries; use transaction-safe
    constraints or idempotency where needed.

## 10. 🗄️ Database Rules

-   Make schema changes through migrations or documented SQL scripts.
-   Never modify production data or run destructive migrations without
    explicit approval.
-   Do not drop tables, remove columns, truncate data, or reset
    databases unless specifically authorized.
-   Use foreign keys and appropriate `ON DELETE` behavior.
-   Add indexes based on query patterns and relationship columns.
-   Use transactions for multi-record workflows.
-   Store timestamps consistently and document the time-zone policy.
-   Keep development seed data separate from production data.
-   Do not use real personal data as seed data.
-   Ensure seed scripts are clearly identified and safe for the intended
    environment.

## 11. 🧪 Testing and Verification

Before marking a task complete:

1.  Review the changed code for correctness and security.
2.  Run the relevant tests when available.
3.  Run linting and build checks when configured and practical.
4.  Test the key success path and important failure/authorization paths.
5.  Verify that no unrelated files or functionality were changed.
6.  Report any checks that could not be run and why.

Priority tests for HelpRoster: - Volunteers cannot access another
volunteer's applications. - Organizations cannot edit another
organization's opportunities. - Unauthenticated users cannot submit
applications. - Duplicate applications are rejected. - Closed or expired
opportunities reject applications. - Only authorized organizations can
accept/reject their applicants. - Only authorized reviewers can approve
relevant volunteer hours. - Public APIs do not expose private
information. - Invalid input is rejected on the server. - Database
errors do not expose secrets or stack traces.

Never claim a test passed unless it was actually executed and its result
was checked.

## 12. 🛠️ Antigravity Agent Workflow

For every requested feature or bug fix:

1.  **Inspect:** Read relevant docs and inspect existing files before
    changing code.
2.  **Plan:** Identify the files, API endpoints, schema changes, and
    tests likely needed.
3.  **Check dependencies:** Reuse installed packages and existing
    patterns when suitable.
4.  **Implement:** Make the smallest complete change that satisfies the
    request.
5.  **Protect:** Apply server-side validation, authorization, and
    data-integrity rules.
6.  **Verify:** Run relevant tests, lint, and build commands available
    in the repository.
7.  **Review:** Inspect the diff for accidental changes, secrets,
    duplicated logic, and regressions.
8.  **Document:** Update relevant docs, API notes, migrations, and task
    checkboxes.
9.  **Summarize:** State what changed, files affected, checks performed,
    and any remaining issues.

Do not begin broad rewrites when a targeted change is sufficient. If a
task requires an irreversible action, destructive migration, deployment,
or external side effect, ask for explicit approval first.

## 13. 📦 Dependency and Tool Rules

-   Prefer existing dependencies where practical.
-   Before adding a dependency, explain why it is needed if the choice
    materially affects security, bundle size, or architecture.
-   Use maintained, compatible package versions.
-   Do not invent commands; inspect `package.json` scripts and
    repository documentation.
-   Do not install global tools or modify system configuration without
    authorization.
-   Never upload source code, credentials, or user data to an external
    service unless the user explicitly authorizes it.

## 14. 📝 Documentation Rules

Keep documentation synchronized with implementation: - `PRD.md` ---
product requirements and acceptance criteria. - `Architecture.md` ---
system components, data flows, API and deployment architecture. -
`Design.md` --- visual rules, page layouts, components, and interaction
states. - `Task.md` --- implementation backlog and progress. -
`database/schema.sql` or migrations --- actual database schema
history. - `README.md` --- setup, environment configuration,
development, testing, and deployment instructions.

When requirements or architecture change, update the appropriate
document rather than leaving conflicting instructions.

## 15. 🚫 Do Not

-   Do not switch away from React, JavaScript, Node.js, Express.js, or
    MySQL without approval.
-   Do not introduce TypeScript without approval.
-   Do not hard-code credentials, secrets, or environment-specific URLs.
-   Do not rely on frontend-only authorization.
-   Do not trust client-supplied ownership or role values.
-   Do not fabricate production data, metrics, or test results.
-   Do not silently remove features or overwrite user work.
-   Do not make destructive database changes without explicit approval.
-   Do not claim that a feature is complete when required tests or
    acceptance criteria remain unmet.
-   Do not expand scope beyond the requested task without explaining
    why.

## 16. ✅ Completion Report Format

After completing a task, provide a concise report:

``` text
Implemented:
- Brief list of changes

Files changed:
- Paths of relevant files

Verification:
- Tests/build/lint commands run and actual results
- Checks not run, with reasons

Outstanding:
- Known limitations, assumptions, or follow-up tasks
```

------------------------------------------------------------------------

## 17. 📌 Rule File Placement

Use the rule-file name and location supported by the installed
Antigravity version or workspace configuration. If the project uses a
different established convention, preserve it and place these rules in
the correct supported location. This document can be stored at
`docs/RULES.md` as the source of project guidance.

## 18. 📝 Document Status

These rules establish the baseline for AI-assisted development of
**HelpRoster --- Volunteer Opportunity Platform**. They should be
reviewed whenever the product requirements, stack, or security model
changes.
