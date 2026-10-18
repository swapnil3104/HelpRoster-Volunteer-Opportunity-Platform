# HelpRoster --- System Architecture

> **Project:** HelpRoster --- Volunteer Opportunity Platform\
> **Document:** Architecture.md\
> **Version:** 1.0\
> **Status:** Initial Architecture Draft\
> **Frontend:** React + JavaScript\
> **Backend:** Node.js + Express.js\
> **Database:** MySQL

------------------------------------------------------------------------

## 1. 🧭 Purpose

This document describes the proposed technical architecture for
HelpRoster. It defines the major system components, their
responsibilities, the way data moves through the application, the
logical database structure, API conventions, security boundaries, and
deployment considerations.

The architecture is based on the HelpRoster product requirements:
volunteers discover opportunities and apply; organizations publish
opportunities and manage applications; administrators manage accounts
and moderate content.

This is a logical reference architecture. Hosting provider,
authentication strategy, ORM/query layer, email provider, and production
capacity targets must be confirmed before implementation.

## 2. 🎯 Architecture Goals

-   Separate presentation, business logic, and persistence.
-   Use JavaScript across frontend and backend to simplify development.
-   Provide secure, role-aware access to volunteer and organization
    features.
-   Keep opportunity and application workflows consistent.
-   Maintain relational integrity using MySQL.
-   Support responsive user interfaces and predictable API behavior.
-   Make the system testable, maintainable, and deployable in stages.
-   Avoid unnecessary infrastructure complexity in the initial release.

## 3. 🧱 High-Level Architecture

``` mermaid
flowchart TD
    U[Public Visitor / Volunteer / Organization / Admin]
    UI[React + JavaScript Frontend]
    API[Node.js + Express REST API]
    AUTH[Authentication and Authorization Middleware]
    SVC[Application Services and Business Rules]
    DB[(MySQL Database)]
    EMAIL[Optional Email Provider]
    LOG[Application Logs and Monitoring]

    U --> UI
    UI <-->|HTTPS JSON requests| API
    API --> AUTH
    AUTH --> SVC
    SVC <-->|Parameterized SQL / query layer| DB
    SVC -. Optional notifications .-> EMAIL
    API --> LOG
    SVC --> LOG
```

### 3.1 Component Summary

  -----------------------------------------------------------------------
  Component                           Responsibility
  ----------------------------------- -----------------------------------
  React frontend                      Renders pages, forms, dashboards,
                                      navigation, and feedback states

  API client                          Sends HTTP requests, handles
                                      responses, and centralizes error
                                      behavior

  Express API                         Exposes REST endpoints and
                                      coordinates request processing

  Authentication middleware           Identifies the user from a valid
                                      session or token

  Authorization middleware            Enforces roles, resource ownership,
                                      and permissions

  Controllers                         Parse requests, call services, and
                                      shape HTTP responses

  Services                            Implement business rules and
                                      coordinate transactions

  Data access layer                   Runs parameterized SQL or ORM
                                      operations

  MySQL                               Stores persistent relational
                                      application data

  Email provider (optional)           Sends password-reset and
                                      application-status notifications

  Logging and monitoring              Records operational errors and
                                      important events without secrets
  -----------------------------------------------------------------------

## 4. 🧩 Technology Stack

### 4.1 Frontend

-   **React** with JavaScript.
-   **Vite** for development server and production bundling.
-   **React Router** for client-side routes.
-   **Axios** or Fetch for API communication.
-   **Tailwind CSS** or another agreed styling system.
-   React Context or a small state library for shared authentication/UI
    state when needed.

### 4.2 Backend

-   **Node.js** runtime.
-   **Express.js** for REST API routing and middleware.
-   **mysql2** with prepared statements, or a reviewed ORM/query layer.
-   **Zod**, **Joi**, or equivalent for request validation.
-   **bcrypt** or **Argon2id** for password hashing.
-   A maintained session or JWT library according to the selected
    authentication strategy.
-   Centralized error handling and structured logging.
-   A migration tool or version-controlled SQL migrations.

### 4.3 Database

-   **MySQL** with InnoDB tables, foreign keys, indexes, and
    transactions.
-   Separate databases or isolated configurations for development,
    testing, and production.
-   Version-controlled schema migrations and seed data for development.

### 4.4 External Services (Optional)

-   Email provider for password reset and application notifications.
-   Object storage or an image-hosting service if organization logos or
    opportunity images are uploaded.
-   Error monitoring and uptime monitoring for deployed environments.

External services should be introduced only when the corresponding
feature requires them.

## 5. 🗂️ Logical Application Layers

### 5.1 Presentation Layer

Responsibilities: - Display public pages and role-specific workspaces. -
Collect user input and provide client-side validation. - Show loading,
empty, success, and error states. - Protect the user experience through
route guards while relying on the backend for actual security. - Avoid
embedding business rules that must be trusted for authorization or data
integrity.

Suggested folders: - `components/` - `layouts/` - `pages/` - `routes/` -
`context/` - `services/`

### 5.2 API Layer

Responsibilities: - Register endpoints under `/api/v1`. - Apply request
parsing, validation, authentication, and authorization middleware. -
Call the appropriate service. - Return consistent JSON responses and
HTTP status codes. - Avoid putting complex business rules directly
inside route handlers.

### 5.3 Business Logic Layer

Responsibilities: - Enforce opportunity publication and closure rules. -
Prevent duplicate active applications. - Enforce application status
transitions. - Ensure an organization can manage only its own
opportunities and applicants. - Validate volunteer-hour submission and
review. - Calculate dashboard summaries and achievement eligibility. -
Coordinate database transactions where several records must change
together.

### 5.4 Data Access Layer

Responsibilities: - Encapsulate SQL and database operations. - Use
prepared statements or safe ORM operations. - Avoid concatenating
untrusted input into SQL. - Handle transactions and expected database
errors. - Keep database-specific logic out of React components.

### 5.5 Infrastructure Layer

Responsibilities: - Store environment-specific configuration and
secrets. - Provide deployment, database backups, logging, and
monitoring. - Manage external integrations. - Keep development and
production settings separate.

## 6. 📁 Recommended Repository Structure

``` text
HelpRoster/
├── client/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── common/
│   │   │   ├── opportunities/
│   │   │   └── applications/
│   │   ├── layouts/
│   │   ├── pages/
│   │   │   ├── public/
│   │   │   ├── auth/
│   │   │   ├── volunteer/
│   │   │   ├── organization/
│   │   │   └── admin/
│   │   ├── routes/
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── .env.example
│   └── package.json
│
├── server/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── repositories/
│   │   ├── validators/
│   │   ├── utils/
│   │   ├── app.js
│   │   └── server.js
│   ├── migrations/
│   ├── seeds/
│   ├── tests/
│   ├── .env.example
│   └── package.json
│
├── database/
│   ├── schema.sql
│   └── seeds.sql
├── docs/
│   ├── PRD.md
│   └── Architecture.md
├── .gitignore
└── README.md
```

The repository may start simpler and grow into this structure as the
number of features increases. Avoid maintaining duplicate schema
definitions: use migrations as the authoritative change history.

## 7. 🔐 Authentication and Authorization

### 7.1 Roles

-   `volunteer`
-   `organization`
-   `admin`

A public visitor is unauthenticated and does not need a stored role.

### 7.2 Authentication Flow

1.  The user submits credentials through the React login form.
2.  The frontend sends the request over HTTPS to the authentication
    endpoint.
3.  The backend validates the request and verifies the password hash.
4.  The backend creates a session or issues credentials according to the
    chosen strategy.
5.  The frontend obtains the authenticated user's permitted profile
    information.
6.  Protected API requests include the session cookie or appropriate
    authorization credential.
7.  The backend validates identity and permissions on every protected
    request.

### 7.3 Session Strategy Decision

For a same-site web application, secure, `HttpOnly`, `Secure`,
appropriately `SameSite` cookies with server-managed sessions are a
strong default. If JWTs are selected, define expiration, refresh,
revocation, key rotation, and storage rules before implementation. Do
not treat a React route guard as a security boundary.

For cookie-based authentication, use CSRF protection where applicable.
Configure CORS narrowly for approved frontend origins.

### 7.4 Authorization Rules

  ----------------------------------------------------------------------------------
  Action                  Public      Volunteer   Organization                 Admin
  --------------- -------------- -------------- -------------- ---------------------
  Browse                     Yes            Yes            Yes                   Yes
  published                                                    
  opportunities                                                

  Apply to an                 No            Yes     No, unless             By policy
  opportunity                                       separately 
                                                       allowed 

  View own                    No            Yes             No             By policy
  applications                                                 

  Create/manage               No             No            Yes   Moderation/override
  owned                                                                    by policy
  opportunities                                                

  Review                      No             No            Yes             By policy
  applications                                                 
  for owned                                                    
  opportunities                                                

  Submit own                  No            Yes             No             By policy
  volunteer hours                                              

  Review hours                No             No            Yes             By policy
  for owned                                                    
  opportunities                                                

  Moderate users              No             No             No                   Yes
  and content                                                  
  ----------------------------------------------------------------------------------

Every sensitive operation must verify both the role and resource
ownership on the server.

## 8. 🔄 Core Request and Data Flows

### 8.1 Browse Opportunities

1.  React requests `GET /api/v1/opportunities` with search, filter,
    sort, and pagination parameters.
2.  Express validates query parameters.
3.  The service builds a safe query using parameterized values.
4.  MySQL returns published opportunities matching the criteria.
5.  The API returns a paginated JSON response.
6.  React renders cards or a list and handles empty/error states.

### 8.2 Submit an Application

1.  The volunteer signs in and opens an available opportunity.
2.  React submits `POST /api/v1/opportunities/:id/applications`.
3.  Authentication middleware identifies the volunteer.
4.  Validation and business logic check that the opportunity is
    published, open, and within its deadline.
5.  The backend checks for a duplicate active application.
6.  A database constraint or transaction-safe mechanism prevents
    duplicate records under concurrent requests.
7.  MySQL stores the application with `pending` status.
8.  The API returns confirmation; an optional notification job informs
    the organization.

### 8.3 Review an Application

1.  An organization representative opens its applicant list.
2.  The backend verifies ownership of the opportunity.
3.  The representative accepts or rejects the application.
4.  The service validates the allowed status transition and saves the
    decision.
5.  The volunteer's application page shows the updated status.
6.  An optional notification is queued or sent.

### 8.4 Record Volunteer Hours

1.  A volunteer submits the opportunity, activity date, and duration.
2.  The backend validates the submission and relationship to the
    volunteer.
3.  The record is stored with a pending-review status.
4.  An authorized organization representative reviews the record.
5.  Approved hours are included in approved totals and applicable
    achievement calculations.
6.  Review actions are recorded for accountability.

## 9. 🗄️ Database Architecture

### 9.1 Main Entities

  -----------------------------------------------------------------------
  Table                   Purpose                 Important relationships
  ----------------------- ----------------------- -----------------------
  `users`                 Identity, login, role,  Parent of user-specific
                          account status          records

  `volunteer_profiles`    Volunteer profile       One-to-one with a
                          details and skills      volunteer user

  `organizations`         Organization profile    Owned by an authorized
                          and review status       user/account

  `categories`            Opportunity categories  One-to-many with
                                                  opportunities

  `opportunities`         Published or draft      Belongs to an
                          volunteer opportunities organization and
                                                  category

  `opportunity_skills`    Skills required for     Join table for
                          opportunities           opportunity skill
                                                  requirements

  `applications`          Volunteer application   Links users and
                          and decision status     opportunities

  `volunteer_hours`       Submitted and reviewed  Links volunteer,
                          participation hours     opportunity, and
                                                  reviewer

  `achievements`          Badge definitions and   Parent of earned badge
                          criteria                records

  `user_achievements`     Achievements earned by  Join table linking
                          volunteers              users and achievements

  `contact_submissions`   Support requests        Independent support
                                                  records

  `audit_logs`            Important               May reference an actor
                          administrative actions  and target
  -----------------------------------------------------------------------

### 9.2 Relationship Overview

``` mermaid
erDiagram
    USERS ||--o| VOLUNTEER_PROFILES : has
    USERS ||--o{ ORGANIZATIONS : manages
    ORGANIZATIONS ||--o{ OPPORTUNITIES : publishes
    CATEGORIES ||--o{ OPPORTUNITIES : classifies
    OPPORTUNITIES ||--o{ APPLICATIONS : receives
    USERS ||--o{ APPLICATIONS : submits
    USERS ||--o{ VOLUNTEER_HOURS : records
    OPPORTUNITIES ||--o{ VOLUNTEER_HOURS : relates_to
    USERS ||--o{ USER_ACHIEVEMENTS : earns
    ACHIEVEMENTS ||--o{ USER_ACHIEVEMENTS : defines
```

This is a logical relationship diagram. Final cardinalities and
ownership rules must match the chosen account model and SQL schema.

### 9.3 Database Rules

-   Use InnoDB and foreign keys for relational integrity.
-   Use unique constraints for normalized email addresses and relevant
    duplicate-prevention rules.
-   Index foreign keys and common search/filter fields.
-   Use transactions for multi-step operations.
-   Store dates and timestamps consistently; document the time-zone
    policy.
-   Store password hashes, never plaintext passwords.
-   Use soft deletion or archival for records that need to remain in
    audit history.
-   Keep production credentials out of source control.
-   Apply migrations through a repeatable, version-controlled process.

## 10. 🌐 API Architecture

### 10.1 API Conventions

-   Base path: `/api/v1`.
-   JSON request and response bodies.
-   Standard HTTP methods and status codes.
-   Validate body, path, and query parameters.
-   Use pagination for list endpoints.
-   Use consistent error responses without stack traces or secrets.
-   Enforce authorization before returning private data.
-   Use idempotency or safe retry behavior where duplicate submissions
    are a risk.

### 10.2 Example Endpoint Groups

  -----------------------------------------------------------------------------------------
  Group                   Example endpoints                         Purpose
  ----------------------- ----------------------------------------- -----------------------
  Authentication          `POST /auth/register`,                    Account and session
                          `POST /auth/login`, `POST /auth/logout`   operations

  Opportunities           `GET /opportunities`,                     Browse and inspect
                          `GET /opportunities/:id`                  opportunities

  Organization            `POST /opportunities`,                    Create and update owned
  opportunities           `PATCH /opportunities/:id`                listings

  Applications            `POST /opportunities/:id/applications`,   Apply and track
                          `GET /me/applications`                    

  Organization review     `GET /organization/applications`,         Review applicants
                          `PATCH /applications/:id/status`          

  Organizations           `GET /organizations`,                     Public profiles
                          `GET /organizations/:id`                  

  Dashboard               `GET /me/dashboard`                       Current user's summary

  Volunteer hours         `POST /volunteer-hours`,                  Submit and review hours
                          `PATCH /volunteer-hours/:id/review`       

  Support                 `POST /contact`                           Submit a support
                                                                    request

  Administration          `/admin/users`, `/admin/opportunities`    Restricted moderation
                                                                    endpoints
  -----------------------------------------------------------------------------------------

These are proposed conventions. Confirm exact payloads, status codes,
pagination formats, and endpoint names in the API specification before
implementation.

## 11. 🛡️ Security Architecture

### 11.1 Required Controls

-   HTTPS for deployed environments.
-   Password hashing with Argon2id or bcrypt.
-   Parameterized SQL or safe ORM usage.
-   Server-side input validation and output encoding appropriate to the
    context.
-   Authentication and resource-level authorization middleware.
-   Narrowly configured CORS.
-   CSRF protection when cookie-based authentication requires it.
-   Rate limiting and abuse prevention for sensitive public endpoints.
-   Secure headers, such as those provided by Helmet for Express.
-   Environment-based secret management.
-   Safe logging that excludes passwords, tokens, and unnecessary
    personal data.
-   Regular dependency updates and vulnerability checks.
-   Database backups and restricted database access.
-   Audit logging for privileged actions and important decisions.

### 11.2 Error Handling

-   Return appropriate status codes, such as `400`, `401`, `403`, `404`,
    `409`, `422`, and `500`, according to the API contract.
-   Do not reveal whether sensitive credentials or accounts exist when
    that would create an enumeration risk.
-   Log internal diagnostic details securely.
-   Return user-friendly messages and a request/correlation ID where
    practical.
-   Roll back database transactions after failed multi-step operations.

## 12. 📈 Performance and Scalability

For the initial release, use a modular monolith: one React application,
one Express API, and one MySQL database. Microservices are not necessary
unless future scale or organizational constraints justify them.

Initial practices: - Paginate opportunity, organization, and application
lists. - Add indexes based on actual query patterns. - Avoid N+1 query
patterns in dashboard and listing endpoints. - Select only the columns
required by each response. - Use connection pooling with sensible
limits. - Cache only where there is a clear freshness and invalidation
strategy. - Monitor slow queries and API latency. - Store uploaded files
in dedicated object storage rather than as large database blobs, if
uploads are introduced. - Move slow email or notification work to a
queue if traffic or reliability requirements justify it.

Performance targets and expected traffic should be agreed before
production launch and verified with load tests.

## 13. 🧪 Testing Architecture

  -----------------------------------------------------------------------
  Test level              What to test            Example tools
  ----------------------- ----------------------- -----------------------
  Frontend unit/component Forms, UI states,       Vitest, React Testing
                          validation display,     Library
                          components              

  Backend unit            Service rules and       Node test runner or
                          status transitions      Jest/Vitest

  API integration         Routes, authorization,  Supertest with a test
                          database operations     database

  End-to-end              Volunteer and           Playwright or Cypress
                          organization workflows  

  Security                Access control,         Automated checks and
                          injection risks, abuse  focused manual tests
                          controls                

  Database                Migrations,             MySQL test instance
                          constraints,            
                          transactions, seed      
                          scripts                 

  Accessibility           Keyboard flow, labels,  Automated accessibility
                          contrast, focus         checks plus manual
                                                  review
  -----------------------------------------------------------------------

Critical scenarios include cross-user data access denial, organization
ownership enforcement, duplicate application prevention,
closed-opportunity rejection, and approval of volunteer hours by
authorized reviewers only.

## 14. 🚀 Deployment Architecture

A simple production deployment may use:

-   Static hosting/CDN for the built React frontend.
-   A managed Node.js service or container for the Express API.
-   A managed MySQL instance with private network access where
    available.
-   An email provider if notifications are enabled.
-   Centralized logs, health checks, monitoring, and automated backups.

``` mermaid
flowchart LR
    B[Browser]
    CDN[Static Frontend Hosting / CDN]
    API[Node.js + Express Service]
    DB[(Managed MySQL)]
    MAIL[Optional Email Provider]
    MON[Logs and Monitoring]

    B --> CDN
    B -->|HTTPS API requests| API
    API --> DB
    API -. Notifications .-> MAIL
    API --> MON
```

### 14.1 Environments

-   **Development:** Local React, Express, and MySQL setup with test
    data.
-   **Testing/Staging:** Isolated configuration and non-production data
    for validation.
-   **Production:** Restricted secrets, HTTPS, backups, monitoring, and
    controlled migrations.

### 14.2 Configuration

Provide `.env.example` files containing variable names and safe
placeholders only. Do not commit real secrets.

Example backend configuration keys:

``` dotenv
NODE_ENV=development
PORT=5000
CLIENT_ORIGIN=http://localhost:5173
DB_HOST=localhost
DB_PORT=3306
DB_NAME=helproster
DB_USER=your_local_user
DB_PASSWORD=replace_with_local_secret
SESSION_SECRET=replace_with_a_long_random_secret
```

The actual authentication implementation may use different keys
depending on the selected session or token strategy. Validate required
configuration at application startup.

### 14.3 Operational Requirements

-   Health-check endpoint for service status.
-   Automated backups and periodic restore testing.
-   Controlled schema migrations.
-   Dependency and security updates.
-   Error and availability monitoring.
-   A documented rollback and incident-response procedure appropriate to
    the deployment.

## 15. 🧰 Development and Implementation Sequence

1.  Confirm requirements, user roles, and open product decisions.
2.  Create the repository and frontend/backend project setup.
3.  Establish the MySQL schema and migration process.
4.  Implement authentication and authorization.
5.  Implement organization profiles and opportunity management.
6.  Implement opportunity browsing and applications.
7.  Implement application review and status history.
8.  Implement dashboards, volunteer hours, and achievements.
9.  Implement contact support and administration.
10. Add tests, accessibility checks, security hardening, and deployment
    automation.

Each stage should be merged only after its acceptance criteria and
critical tests pass.

## 16. ⚠️ Architecture Decisions to Confirm

  -----------------------------------------------------------------------
  Decision                Proposed default        Reason
  ----------------------- ----------------------- -----------------------
  Application             Modular monolith        Easier to build and
  architecture                                    operate for the first
                                                  release

  Frontend build          Vite + React            Simple development and
                                                  production build
                                                  workflow

  API style               REST with `/api/v1`     Clear resource-based
                          prefix                  contract

  Database access         `mysql2` with prepared  Secure, maintainable
                          statements or a         SQL access
                          reviewed ORM            

  Authentication          Secure cookie-based     Supports server-managed
                          session for a same-site sessions and reduces
                          deployment              token exposure in
                                                  JavaScript

  Styling                 Tailwind CSS            Consistent and
                                                  responsive UI
                                                  development

  Validation              Shared documented       Consistent input
                          schemas where           contracts
                          practical, with         
                          server-side validation  
                          authoritative           

  Notifications           Email integration added External service
                          when provider is        configuration is
                          selected                required

  File uploads            Object storage if       Keeps large binary
                          required                files out of relational
                                                  tables

  Admin role              Included with           Supports moderation and
                          restricted permissions  operational control
  -----------------------------------------------------------------------

## 17. ✅ Architecture Acceptance Checklist

-   [ ] Frontend, backend, and database responsibilities are separated.
-   [ ] All protected API routes enforce authentication and
    authorization.
-   [ ] Organization ownership is checked on every organization-specific
    operation.
-   [ ] Database relationships, constraints, and indexes are documented.
-   [ ] Critical workflows use transactions or concurrency-safe
    constraints where needed.
-   [ ] API response and error conventions are documented.
-   [ ] Secrets are externalized and excluded from version control.
-   [ ] Logging avoids credentials and unnecessary personal data.
-   [ ] Development, testing, and production environments are separated.
-   [ ] Migrations, backups, and recovery procedures are documented.
-   [ ] Critical authorization and application workflow tests pass.
-   [ ] The architecture decisions that affect implementation have been
    confirmed.

------------------------------------------------------------------------

## 18. 📝 Document Status

This is the initial architecture for **HelpRoster --- Volunteer
Opportunity Platform**, using **React + JavaScript + Node.js +
Express.js + MySQL**.

Treat it as the shared technical baseline for implementation. Update
this document when authentication, hosting, database access, external
integrations, or product scope decisions are finalized.
