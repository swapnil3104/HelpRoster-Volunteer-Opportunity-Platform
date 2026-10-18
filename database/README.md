# HelpRoster Database Foundation

This directory contains the database schema definitions, versioned migrations, and development seed data for the HelpRoster platform.

## 🗄️ Database Architecture Specifications

- **Database Engine:** MySQL 8.0+
- **Default Storage Engine:** InnoDB
- **Character Set:** `utf8mb4`
- **Collation:** `utf8mb4_unicode_ci`

---

## 📋 Schema Overview

The database schema is comprised of 12 core entity tables, plus a migration tracking table:

1. **`users`**: Platform identity, credentials (bcrypt hashes), role (`volunteer`, `organization`, `admin`), and status (`active`, `suspended`, `pending`).
2. **`volunteer_profiles`**: 1:1 volunteer profile containing contact info, skills, interests, bio, location, and privacy settings.
3. **`organizations`**: Organization profiles and verification status (`pending`, `verified`, `rejected`), owned by a user.
4. **`categories`**: Taxonomy classifying volunteer opportunities (e.g. Education, Environment, Healthcare).
5. **`opportunities`**: Listings published by organizations detailing dates, location, commitment, capacity, and status (`draft`, `published`, `closed`, `archived`).
6. **`opportunity_skills`**: Join table of skills associated with specific opportunities.
7. **`applications`**: Volunteer applications linking volunteers to opportunities with unique constraint `uk_opportunity_volunteer` to prevent duplicate active applications.
8. **`volunteer_hours`**: Submitted participation hours awaiting review or approved by organization representatives.
9. **`achievements`**: Gamification badges and milestone thresholds (e.g. First Step, 10h, 50h, 100h).
10. **`user_achievements`**: Badges earned by volunteers with a unique constraint preventing duplicate awards.
11. **`contact_submissions`**: Public contact form messages and inquiries with administrative tracking.
12. **`audit_logs`**: Privileged administrative actions, security events, and audit trail.
13. **`schema_migrations`**: Migration history tracking applied versioned SQL files.

---

## 🚀 Setup & Migration Instructions

### Option 1: Automated Node Scripts (Recommended)

From the `server/` directory:

1. Ensure your `.env` file contains your MySQL credentials:
   ```env
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=helproster_db
   ```

2. Run pending migrations:
   ```bash
   npm run db:migrate
   ```

3. Seed the development database:
   ```bash
   npm run db:seed
   ```

4. Reset development database (drops database, applies all migrations & seeds):
   ```bash
   npm run db:reset
   ```

### Option 2: MySQL CLI Direct Execution

1. Initialize database and schema:
   ```bash
   mysql -u root -p < database/schema.sql
   ```

2. Seed development data:
   ```bash
   mysql -u root -p helproster_db < database/seeds/001_categories_and_achievements.sql
   mysql -u root -p helproster_db < database/seeds/002_sample_data.sql
   ```

---

## 🧪 Development Sample Accounts

The development seeds populate the following test accounts (all passwords default to `Password123!`):

| Role | Email | Name | Context |
|---|---|---|---|
| **Admin** | `admin@helproster.org` | Platform Admin | Full administration and audit access |
| **Organization** | `contact@greenearth.org` | Elena Rostova | Green Earth Alliance |
| **Organization** | `director@hopereading.org` | Marcus Vance | Hope Literacy Project |
| **Volunteer** | `jane.doe@example.com` | Jane Doe | Seasoned volunteer with approved hours |
| **Volunteer** | `alex.smith@example.com` | Alex Smith | Student volunteer with pending application |
| **Volunteer** | `sarah.jenkins@example.com` | Sarah Jenkins | Nurse volunteer with healthcare skills |
