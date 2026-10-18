# HelpRoster --- API Conventions & Standards

> **Project:** HelpRoster --- Volunteer Opportunity Platform\
> **Document:** `Docs/API_Conventions.md`\
> **Version:** 1.0\
> **Status:** Approved Baseline (Phase 1)

---

## 1. 🌐 Base URL & Versioning

All API endpoints are strictly versioned under the prefix:
```
/api/v1
```

All requests containing a payload must provide:
```http
Content-Type: application/json
```
Responses are returned with `Content-Type: application/json; charset=utf-8`.

---

## 2. 📦 Standard Response Envelope Shapes

### 2.1 Standard Success Response

All non-paginated successful requests (HTTP 200, 201) return data wrapped in the standard `success` envelope:

```json
{
  "success": true,
  "message": "Opportunity created successfully",
  "data": {
    "id": 1,
    "title": "Urban Reforestation & Native Tree Planting",
    "status": "published",
    "created_at": "2026-10-18T14:00:00.000Z"
  }
}
```

### 2.2 Paginated Success Response

All list endpoints (`GET /api/v1/opportunities`, `GET /api/v1/me/applications`, etc.) return items wrapped in `data` alongside a `meta.pagination` object:

```json
{
  "success": true,
  "message": "Opportunities retrieved successfully",
  "data": [
    {
      "id": 1,
      "title": "Urban Reforestation",
      "category": "Environmental Conservation"
    }
  ],
  "meta": {
    "pagination": {
      "page": 1,
      "limit": 10,
      "totalItems": 45,
      "totalPages": 5,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```

### 2.3 Standard Error Response

Errors (client errors 4xx and server errors 5xx) follow a uniform structure. Stack traces and raw SQL queries are **never** exposed to clients in production:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed for provided request data.",
    "details": [
      {
        "field": "application_deadline",
        "message": "Application deadline must be a future date",
        "location": "body"
      }
    ]
  }
}
```

---

## 3. 🚦 HTTP Status Codes & Error Codes

| Status Code | Meaning | Standard Error Code | When Used |
|---|---|---|---|
| **200 OK** | Success | N/A | Successful GET, PATCH, PUT, or DELETE |
| **201 Created** | Created | N/A | Successful POST creating a new resource |
| **400 Bad Request** | Bad Request | `BAD_REQUEST`, `VALIDATION_ERROR` | Malformed JSON, schema validation failure |
| **401 Unauthorized** | Unauthorized | `UNAUTHORIZED`, `TOKEN_EXPIRED` | Missing or invalid authentication token/session |
| **403 Forbidden** | Forbidden | `FORBIDDEN` | Authenticated user lacks permission or does not own the resource |
| **404 Not Found** | Not Found | `NOT_FOUND` | Target resource does not exist |
| **409 Conflict** | Conflict | `CONFLICT`, `DUPLICATE_RESOURCE` | Resource already exists (e.g. duplicate email, duplicate active application) |
| **422 Unprocessable** | Semantic Error | `BUSINESS_RULE_VIOLATION` | Opportunity deadline passed, capacity reached |
| **429 Too Many Requests**| Rate Limited | `TOO_MANY_REQUESTS` | Exceeded rate limit for endpoint |
| **500 Server Error** | Internal Error | `INTERNAL_SERVER_ERROR` | Unexpected unhandled server exception |

---

## 4. 📄 Pagination, Sorting, and Filtering Conventions

List endpoints accept standard query parameters:

### 4.1 Pagination Parameters
- `page`: 1-based page index (Default: `1`).
- `limit`: Number of items per page (Default: `10`, Max: `100`).
- `offset`: Calculated automatically as `(page - 1) * limit`.

### 4.2 Sorting Parameters
- `sort`: Field to order results by (e.g., `created_at`, `start_date`, `title`). Only whitelisted fields are allowed per endpoint.
- `order`: `ASC` or `DESC` (Default: `DESC`, case-insensitive).

### 4.3 Filtering Conventions
- **Exact match:** `?category=environmental-conservation&status=published`
- **Search terms:** `?search=planting` (searches across title and description)
- **Date ranges:** `?startDate=2026-11-01&endDate=2026-12-31`
- **Array filters:** `?skills=Gardening,Teamwork`

---

## 5. 🛡️ Endpoint Permissions & Access Control Matrix

| Endpoint Group | Method | Path | Allowed Roles | Description |
|---|---|---|---|---|
| **Health** | `GET` | `/health` | Public | System and database health status |
| **Auth** | `POST` | `/auth/register` | Public | Register volunteer or organization account |
| **Auth** | `POST` | `/auth/login` | Public | Authenticate user & issue session/token |
| **Auth** | `POST` | `/auth/logout` | Authenticated | Revoke session / clear auth cookie |
| **Auth** | `GET` | `/auth/me` | Authenticated | Retrieve current user profile & role |
| **Opportunities** | `GET` | `/opportunities` | Public | List published opportunities (with search & filters) |
| **Opportunities** | `GET` | `/opportunities/:id` | Public | View public opportunity detail |
| **Opportunities** | `POST` | `/opportunities` | Organization | Create a new opportunity listing |
| **Opportunities** | `PATCH` | `/opportunities/:id` | Organization (Owner) | Update an owned opportunity |
| **Opportunities** | `DELETE`| `/opportunities/:id` | Organization (Owner) | Archive/close an owned opportunity |
| **Applications** | `POST` | `/opportunities/:id/applications`| Volunteer | Apply for an opportunity |
| **Applications** | `GET` | `/me/applications` | Volunteer | List current volunteer's applications |
| **Applications** | `GET` | `/organization/applications` | Organization | List applications for owned opportunities |
| **Applications** | `PATCH`| `/applications/:id/status` | Organization (Owner) | Accept or reject an application |
| **Volunteer Hours** | `POST`| `/volunteer-hours` | Volunteer | Submit participation hours for review |
| **Volunteer Hours** | `GET` | `/me/volunteer-hours` | Volunteer | List logged hours for current volunteer |
| **Volunteer Hours** | `PATCH`| `/volunteer-hours/:id/review` | Organization (Owner) | Approve or reject submitted hours |
| **Organizations** | `GET` | `/organizations` | Public | List verified organizations |
| **Organizations** | `GET` | `/organizations/:id` | Public | View public organization profile |
| **Organizations** | `PATCH`| `/organizations/:id` | Organization (Owner) | Update organization profile |
| **Categories** | `GET` | `/categories` | Public | List active opportunity categories |
| **Achievements** | `GET` | `/achievements` | Public | List available badge milestones |
| **Dashboard** | `GET` | `/me/dashboard` | Authenticated | Get role-tailored dashboard metrics |
| **Support** | `POST` | `/contact` | Public (Rate-limited) | Submit contact inquiry |
| **Admin** | `*` | `/admin/*` | Admin | Privileged user, org, and moderation tools |
