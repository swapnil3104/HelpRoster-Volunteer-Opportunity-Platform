# Phase 2: Authentication, Authorization & Profiles — Context

## Goal
Implement a complete, secure user management, role-based access control (RBAC), and profile management system for HelpRoster.

## Requirements Addressed
- **REQ-SEC-01**: Secure password hashing with bcrypt, protection against SQLi and XSS.
- **REQ-SEC-02**: Stateless or secure cookie-based JWT authentication with `httpOnly`, `SameSite=Lax`, `Secure` flags.
- **REQ-AUTH-01**: Volunteer and organization user registration with email normalization and duplicate check.
- **REQ-AUTH-02**: Role-based access control with middleware for `volunteer`, `organization`, and `admin`.
- **REQ-AUTH-03**: Resource ownership verification preventing cross-user or cross-organization tampering.
- **REQ-PROF-01**: Volunteer and Organization profile view and edit with segregation of public and private attributes.

## Key Architecture & Design Decisions
1. **JWT in httpOnly Cookie**: Token named `helproster_token`, signed with `JWT_SECRET`, expires in 7 days. Also accepts `Authorization: Bearer <token>` in header for developer/API client convenience.
2. **Transaction-Safe Registration**: Creating an account atomically writes to both `users` and the corresponding profile table (`volunteer_profiles` or `organizations`). If either fails, the transaction rolls back cleanly.
3. **Password Security**: Bcrypt with 10 salt rounds. Plaintext passwords never logged or returned.
4. **Clean Profile Segregation**:
   - Private endpoints (`/api/v1/auth/me`, `/api/v1/users/profile`) return user email, phone, status, and role.
   - Public volunteer profile endpoint (`/api/v1/volunteers/:id`) only returns public fields if `is_public=true`.
   - Public organization endpoint (`/api/v1/organizations/:id`) returns public directory info.
5. **Frontend State & Experience**:
   - `AuthContext` provides application-wide reactive state.
   - Protected routes guard pages based on authentication state and user roles.
   - Fast demo logins allow one-click evaluation of Volunteer, Organization, and Admin personas.
