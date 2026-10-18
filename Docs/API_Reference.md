# HelpRoster — REST API Reference Manual

> **API Version:** `v1`  
> **Base URL:** `/api/v1`  
> **Protocol:** HTTPS (HTTP for local development)  
> **Authentication:** `httpOnly` JWT Cookie (`token`) or `Authorization: Bearer <token>`  
> **Content-Type:** `application/json`

---

## 1. 📐 Standard API Conventions

### Success Envelope
All successful requests return HTTP 200 or 201 with the following JSON structure:

```json
{
  "status": "success",
  "data": { ... }
}
```

### Paginated Success Envelope
Endpoints returning collections support pagination query parameters (`page`, `limit`):

```json
{
  "status": "success",
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 45,
    "totalPages": 5
  }
}
```

### Error Envelope
All error responses adhere to standard HTTP status codes and provide a consistent JSON payload:

```json
{
  "status": "error",
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input parameters",
    "details": [
      {
        "field": "email",
        "message": "Invalid email address format"
      }
    ]
  }
}
```

### Standard Error Codes
| HTTP Status | Error Code | Description |
|---|---|---|
| `400` | `BAD_REQUEST` / `VALIDATION_ERROR` | Malformed JSON or input validation failure |
| `401` | `UNAUTHORIZED` | Missing, expired, or invalid authentication token |
| `403` | `FORBIDDEN` / `ORG_NOT_VERIFIED` | Insufficient role permissions or unverified org gate |
| `404` | `NOT_FOUND` | Requested entity does not exist |
| `409` | `CONFLICT` / `DUPLICATE_APPLICATION` | Entity already exists or duplicate active submission |
| `429` | `TOO_MANY_REQUESTS` | Rate limit threshold exceeded |
| `500` | `INTERNAL_SERVER_ERROR` | Unexpected server-side failure (details suppressed in prod) |

---

## 2. 🚦 System & Health Endpoints

### `GET /api/v1/health`
Health check probe for load balancers and container orchestrators.
- **Access:** Public
- **Response (200):**
  ```json
  {
    "status": "success",
    "data": {
      "status": "healthy",
      "timestamp": "2026-10-18T12:00:00.000Z",
      "uptime": 1245.8,
      "environment": "production",
      "database": {
        "connected": true,
        "message": "MySQL connection successful"
      }
    }
  }
  ```

### `GET /api/v1/public/stats`
Returns live platform impact figures calculated strictly from verified database records.
- **Access:** Public
- **Response (200):**
  ```json
  {
    "status": "success",
    "data": {
      "activeVolunteers": 128,
      "verifiedOrganizations": 14,
      "publishedOpportunities": 32,
      "totalVerifiedHours": 584.5
    }
  }
  ```

---

## 3. 🔐 Authentication Endpoints

### `POST /api/v1/auth/register`
Register a new volunteer or organization user account in an ACID transaction.
- **Access:** Public (Rate limited)
- **Request Body (Volunteer):**
  ```json
  {
    "email": "jane@example.com",
    "password": "Password123!",
    "role": "volunteer",
    "firstName": "Jane",
    "lastName": "Doe"
  }
  ```
- **Request Body (Organization):**
  ```json
  {
    "email": "contact@greenearth.org",
    "password": "Password123!",
    "role": "organization",
    "name": "Green Earth Initiative",
    "mission": "Promoting sustainable reforestation.",
    "website": "https://greenearth.org",
    "contactPhone": "+1-555-0199"
  }
  ```
- **Response (201):** User object + sets `httpOnly` cookie.

### `POST /api/v1/auth/login`
Authenticate existing credentials and issue session JWT cookie.
- **Access:** Public (Rate limited: 15 req/15min)
- **Request Body:**
  ```json
  {
    "email": "volunteer@helproster.org",
    "password": "Password123!"
  }
  ```
- **Response (200):** Authenticated user profile and role.

### `POST /api/v1/auth/logout`
Terminates the session and clears authentication cookies.
- **Access:** Public / Authenticated
- **Response (200):** `{"status": "success", "message": "Logged out successfully"}`

### `GET /api/v1/auth/me`
Retrieves currently authenticated session user profile and permissions.
- **Access:** Authenticated (`volunteer`, `organization`, `admin`)
- **Response (200):** User details, role, and profile snapshot.

### `POST /api/v1/auth/forgot-password`
Generates a time-limited password reset token sent via transactional email.
- **Access:** Public (Rate limited: 5 req/15min)
- **Request Body:** `{"email": "user@example.com"}`
- **Response (200):** Always returns generic success to prevent email enumeration.

### `POST /api/v1/auth/reset-password`
Validates reset token and sets new hashed password.
- **Access:** Public (Rate limited)
- **Request Body:** `{"token": "reset_token_string", "newPassword": "NewStrongPassword123!"}`
- **Response (200):** Password updated confirmation.

---

## 4. 🔎 Opportunities Endpoints

### `GET /api/v1/opportunities`
Search and filter published volunteer opportunities.
- **Access:** Public
- **Query Parameters:**
  - `search` (string): Keyword search in title and description
  - `category` (string): Category ID or slug filter
  - `locationType` (enum: `remote`, `on-site`, `hybrid`)
  - `sort` (enum: `newest`, `deadline`, `popular`)
  - `page` (number, default: 1)
  - `limit` (number, default: 12)
- **Response (200):** Paginated array of published opportunities.

### `GET /api/v1/opportunities/:id`
Fetch complete logistics and details for a specific opportunity.
- **Access:** Public (Drafts/Archived accessible only to owning org or admin)
- **Response (200):** Opportunity object with organization details, categories, and skills.

### `POST /api/v1/opportunities`
Create a new opportunity listing.
- **Access:** Authenticated `organization` (Must be verified to set `published` status)
- **Request Body:**
  ```json
  {
    "title": "Community Park Cleanup",
    "description": "Join our weekend cleanup initiative at Central Park.",
    "categoryId": 2,
    "locationType": "on-site",
    "address": "Central Park Entrance, NYC",
    "startDate": "2026-11-01T09:00:00Z",
    "endDate": "2026-11-01T14:00:00Z",
    "applicationDeadline": "2026-10-28T23:59:59Z",
    "capacity": 25,
    "status": "draft"
  }
  ```
- **Response (201):** Created opportunity object.

### `PUT /api/v1/opportunities/:id`
Update an existing opportunity owned by the organization.
- **Access:** Authenticated `organization` (Resource ownership enforced)
- **Response (200):** Updated opportunity object.

### `PATCH /api/v1/opportunities/:id/status`
Transition opportunity status (`draft` -> `published` -> `closed` -> `archived`).
- **Access:** Authenticated `organization` or `admin`
- **Request Body:** `{"status": "published"}`
- **Response (200):** Status transition result.

---

## 5. 📝 Applications Endpoints

### `POST /api/v1/applications`
Submit a volunteer application to an open opportunity.
- **Access:** Authenticated `volunteer`
- **Request Body:**
  ```json
  {
    "opportunityId": 5,
    "statement": "I have previous experience in trail maintenance and would love to help."
  }
  ```
- **Response (201):** Application created with status `pending`.
- **Errors:**
  - `400 DEADLINE_PASSED` if application deadline has elapsed.
  - `409 DUPLICATE_APPLICATION` if active application already exists.

### `GET /api/v1/applications/my`
Retrieve current volunteer's submitted applications.
- **Access:** Authenticated `volunteer`
- **Query Parameters:** `status` (`pending`, `accepted`, `rejected`, `withdrawn`)
- **Response (200):** Array of applications with opportunity details.

### `PATCH /api/v1/applications/:id/withdraw`
Volunteer withdraws a pending application before coordinator decision.
- **Access:** Authenticated `volunteer` (Ownership enforced)
- **Response (200):** Updated application with status `withdrawn`.

### `GET /api/v1/applications/organization/queue`
Review incoming volunteer applications for organization's listings.
- **Access:** Authenticated `organization` (Scoper to org's opportunities)
- **Query Parameters:** `opportunityId`, `status`, `page`, `limit`
- **Response (200):** Paginated applicant queue with volunteer profiles.

### `PATCH /api/v1/applications/:id/review`
Accept or reject an applicant with custom feedback notes.
- **Access:** Authenticated `organization` (Ownership enforced)
- **Request Body:**
  ```json
  {
    "status": "accepted",
    "notes": "Welcome aboard! Please arrive 15 minutes early."
  }
  ```
- **Response (200):** Updated application record + automated email dispatch.

---

## 6. ⏱️ Volunteer Hours Endpoints

### `POST /api/v1/hours`
Submit volunteer service hours for organization review.
- **Access:** Authenticated `volunteer`
- **Request Body:**
  ```json
  {
    "opportunityId": 5,
    "hours": 4.5,
    "activityDate": "2026-10-15",
    "description": "Assisted with sorting donations and logistics."
  }
  ```
- **Response (201):** Hours record stored with status `pending`.

### `GET /api/v1/hours/my`
List volunteer's submitted hours and verified totals.
- **Access:** Authenticated `volunteer`
- **Response (200):** Array of hour submissions + aggregate totals.

### `GET /api/v1/hours/organization`
Organization review queue for submitted volunteer hours.
- **Access:** Authenticated `organization`
- **Response (200):** Submissions awaiting approval for org's opportunities.

### `PATCH /api/v1/hours/:id/review`
Approve or reject logged volunteer hours.
- **Access:** Authenticated `organization`
- **Request Body:**
  ```json
  {
    "status": "approved",
    "notes": "Verified by session coordinator."
  }
  ```
- **Response (200):** Hours record updated. Idempotently evaluates milestone achievements.

---

## 7. 🏆 Achievements Endpoints

### `GET /api/v1/achievements`
List platform achievement badge catalog and criteria.
- **Access:** Public
- **Response (200):** All available badge definitions.

### `GET /api/v1/achievements/my`
Retrieve badges earned by the authenticated volunteer with unlock timestamps.
- **Access:** Authenticated `volunteer`
- **Response (200):** List of unlocked achievement badges.

---

## 8. 🛡️ Administrator Workspace Endpoints

All endpoints in this section require `role: "admin"`.

### `GET /api/v1/admin/stats`
Platform oversight overview metrics (total users, organizations, opportunities, applications, hours).
- **Access:** Admin only
- **Response (200):** System summary metrics.

### `GET /api/v1/admin/users`
Paginated user directory with role and status filtering.
- **Access:** Admin only
- **Query Parameters:** `role`, `status`, `search`, `page`, `limit`
- **Response (200):** Paginated users.

### `PATCH /api/v1/admin/users/:id/status`
Suspend or reactivate a user account.
- **Access:** Admin only (Cannot suspend self)
- **Request Body:** `{"status": "suspended", "reason": "Terms of service violation"}`
- **Response (200):** Updated user + recorded in `audit_logs`.

### `GET /api/v1/admin/organizations`
Directory of all organizations with verification statuses.
- **Access:** Admin only
- **Response (200):** Organizations list.

### `PATCH /api/v1/admin/organizations/:id/verify`
Administrative verification decision for an organization.
- **Access:** Admin only
- **Request Body:**
  ```json
  {
    "status": "verified",
    "notes": "Verified 501(c)(3) documentation and active state registration."
  }
  ```
- **Response (200):** Updated organization + transactional email dispatch + audit log.

### `GET /api/v1/admin/audit-logs`
Immutable administrative audit log history.
- **Access:** Admin only
- **Query Parameters:** `actorId`, `action`, `limit`, `page`
- **Response (200):** Structured audit events with client IP and timestamps.

### `GET /api/v1/admin/contact-submissions`
Support queue for public contact form inquiries.
- **Access:** Admin only
- **Query Parameters:** `status` (`new`, `in_progress`, `resolved`)
- **Response (200):** Contact submissions.

### `PATCH /api/v1/admin/contact-submissions/:id`
Resolve or update status of a contact inquiry.
- **Access:** Admin only
- **Request Body:** `{"status": "resolved", "notes": "Responded via email on 2026-10-18."}`
- **Response (200):** Updated contact submission record.

---

## 9. 📬 Contact Form Endpoint

### `POST /api/v1/contact`
Public contact form submission.
- **Access:** Public (Rate limited: 5 req/15min)
- **Request Body:**
  ```json
  {
    "name": "Sarah Connor",
    "email": "sarah@example.com",
    "subject": "Question regarding corporate volunteer partnerships",
    "message": "We would like to coordinate a volunteer day for 50 employees."
  }
  ```
- **Response (201):** `{"status": "success", "message": "Inquiry submitted successfully."}`
