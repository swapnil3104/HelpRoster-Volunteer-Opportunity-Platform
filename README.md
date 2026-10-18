# HelpRoster — Volunteer Opportunity Platform

A modern, web-based platform connecting volunteers with NGOs and community organizations. Organizations publish opportunities, manage applications, and verify volunteer hours. Volunteers discover opportunities, track application statuses, log verified service hours, and earn achievement badges.

---

## 🏗️ Architecture & Technology Stack

- **Frontend:** React 18 (JavaScript), Vite, React Router v6, Tailwind CSS, Axios, Lucide Icons.
- **Backend:** Node.js, Express.js (`/api/v1` REST API structure), Zod validation, Helmet, CORS, Cookie-Parser, Morgan.
- **Database:** MySQL (InnoDB engine, relational foreign keys, transactions, connection pool via `mysql2`).
- **Authentication:** JWT in secure `httpOnly` cookies with CSRF defense.
- **Notifications:** Transactional email integration (Nodemailer / SMTP).

---

## 📁 Repository Structure

```text
HelpRoster/
├── client/                 # React + Vite frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── layouts/        # Layout wrappers (Header, Footer)
│   │   ├── pages/          # Route page views
│   │   ├── routes/         # Router configuration
│   │   ├── context/        # React context providers
│   │   ├── hooks/          # Custom React hooks
│   │   ├── services/       # Centralized API service modules
│   │   └── utils/          # Helpers and formatters
├── server/                 # Express backend REST API
│   ├── src/
│   │   ├── config/         # Environment & database configuration
│   │   ├── controllers/    # Route controllers
│   │   ├── middleware/     # Auth, error, and validation middleware
│   │   ├── routes/         # API route definitions (/api/v1)
│   │   ├── services/       # Business logic layer
│   │   ├── repositories/   # Data-access / SQL operations
│   │   ├── validators/     # Request schema validators
│   │   └── utils/          # Utility functions
├── database/               # Database schemas, migrations, and seed scripts
├── Docs/                   # System specifications and documentation
│   ├── HelpRoster_PRD.md   # Product Requirements Document
│   ├── Architecture .md    # System Architecture Document
│   ├── Design .md          # UI/UX Specification & Design Tokens
│   ├── RULES.md            # Coding standards and development rules
│   └── Task.md             # Development task backlog
└── .planning/              # GSD project context, requirements & roadmap
```

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js:** v18.0.0 or higher
- **npm:** v9.0.0 or higher
- **MySQL:** v8.0 or higher

### 2. Backend Setup
```bash
cd server
npm install
cp .env.example .env
# Edit .env with your MySQL credentials and JWT secrets
npm run dev
```

### 3. Frontend Setup
```bash
cd client
npm install
cp .env.example .env
npm run dev
```

---

## 📖 Documentation
Detailed specifications and guidelines are located in the [`Docs/`](file:///e:/HelpRoster-Volunteer-Opportunity-Platform/Docs) directory:
- [Product Requirements (PRD)](Docs/HelpRoster_PRD.md)
- [System Architecture](Docs/Architecture%20.md)
- [UI/UX Design Specification](Docs/Design%20.md)
- [Engineering Rules & Guidelines](Docs/RULES.md)
- [Development Task Backlog](Docs/Task.md)
