# HelpRoster — Production Deployment & Operations Guide

> **Project:** HelpRoster — Volunteer Opportunity Platform  
> **Document:** `Docs/DEPLOYMENT.md`  
> **Version:** 1.0  
> **Status:** Production Release  
> **Target Audience:** DevOps Engineers, System Administrators, Full-Stack Developers  

---

## 1. 🏗️ Architecture Overview

The HelpRoster production topology consists of three decoupled layers:

1. **Client Tier (Frontend):** React 18 single-page application built with Vite, compiled into static HTML/CSS/JavaScript bundles, and served via an optimized Nginx web server with gzip compression and cache-control headers.
2. **API Tier (Backend):** Node.js Express REST API running on port 5000, managed via Docker or PM2, handling authentication, business logic, validation, audit logging, and transactional emails.
3. **Data Tier (Storage):** MySQL 8.0 with InnoDB engine, enforcing relational constraints, composite unique indexes, transactional integrity, and automated backups.

```
                              [ HTTPS Internet Traffic ]
                                          │
                                          ▼
                               ┌─────────────────────┐
                               │  Nginx Web Server   │ :80 / :443 (SSL/TLS)
                               │  Reverse Proxy      │
                               └──────────┬──────────┘
                                          │
                   ┌──────────────────────┴──────────────────────┐
                   │                                             │
                   ▼ (Static Assets)                             ▼ (/api/v1/*)
        ┌──────────────────────┐                     ┌──────────────────────┐
        │  Static Client App   │                     │  Express API Server  │
        │  /usr/share/nginx/...│                     │  Node.js (Port 5000) │
        └──────────────────────┘                     └──────────┬───────────┘
                                                                │
                                                     ┌──────────┴───────────┐
                                                     ▼                      ▼
                                            ┌──────────────────┐   ┌──────────────────┐
                                            │    MySQL 8.0     │   │   SMTP Server    │
                                            │ Database Engine  │   │ (SES/SendGrid)   │
                                            └──────────────────┘   └──────────────────┘
```

---

## 2. 🚀 Deployment Option A: Docker Compose (Recommended)

Docker Compose provides the fastest, most consistent production deployment across cloud providers.

### 2.1 Prerequisites
- Docker Engine v24.0 or higher
- Docker Compose v2.20 or higher
- Git

### 2.2 Quick Deployment Steps

1. **Clone the repository to your server:**
   ```bash
   git clone https://github.com/your-org/HelpRoster.git /opt/helproster
   cd /opt/helproster
   ```

2. **Configure production environment files:**
   ```bash
   # Copy environment templates
   cp server/.env.production.example server/.env.production
   cp client/.env.production.example client/.env.production
   ```

3. **Populate production secrets in `server/.env.production`:**
   ```ini
   NODE_ENV=production
   PORT=5000
   CLIENT_URL=https://helproster.org
   DB_HOST=mysql
   DB_PORT=3306
   DB_USER=helproster_user
   DB_PASSWORD=GENERATE_STRONG_PASSWORD_HERE
   DB_NAME=helproster_db
   DB_CONNECTION_LIMIT=25
   JWT_SECRET=GENERATE_MIN_64_CHAR_SECRET_KEY_HERE
   JWT_EXPIRES_IN=7d
   COOKIE_SECRET=GENERATE_MIN_64_CHAR_COOKIE_KEY_HERE
   SMTP_HOST=smtp.sendgrid.net
   SMTP_PORT=587
   SMTP_USER=apikey
   SMTP_PASS=YOUR_SENDGRID_API_KEY
   SMTP_FROM="HelpRoster Support <notifications@helproster.org>"
   ```

4. **Launch the container stack in detached mode:**
   ```bash
   docker compose up -d --build
   ```

5. **Verify service health:**
   ```bash
   docker compose ps
   docker compose logs -f server
   ```

6. **Test the health check endpoint:**
   ```bash
   curl -i http://localhost/api/v1/health
   # Returns: HTTP/1.1 200 OK {"status":"success","data":{"status":"healthy","database":{"connected":true}}}
   ```

---

## 3. 🖥️ Deployment Option B: Ubuntu 22.04 LTS (Bare Metal / VPS)

For traditional VPS environments (DigitalOcean Droplet, AWS EC2, Linode, Hetzner).

### 3.1 Initial Server Hardening & Packages
```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install Node.js 20 LTS, Nginx, MySQL, and UFW firewall
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs nginx mysql-server ufw certbot python3-certbot-nginx

# Install PM2 globally
sudo npm install -g pm2
```

### 3.2 Configure MySQL Database
```bash
# Secure MySQL installation
sudo mysql_secure_installation

# Log into MySQL root shell
sudo mysql -u root -p
```

Inside MySQL shell:
```sql
CREATE DATABASE helproster_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'helproster_prod'@'localhost' IDENTIFIED BY 'STRONG_RANDOM_PASSWORD_HERE';
GRANT ALL PRIVILEGES ON helproster_db.* TO 'helproster_prod'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 3.3 Deploy Backend API
```bash
# Create application directory
sudo mkdir -p /var/www/helproster
sudo chown -R $USER:$USER /var/www/helproster
git clone https://github.com/your-org/HelpRoster.git /var/www/helproster
cd /var/www/helproster/server

# Install production dependencies
npm ci --omit=dev

# Configure production .env
cp .env.example .env
nano .env

# Run database migrations
npm run db:migrate

# Start backend with PM2
pm2 start src/server.js --name "helproster-api" --instances 2 --max-memory-restart 500M
pm2 save
pm2 startup
```

### 3.4 Build and Deploy Frontend
```bash
cd /var/www/helproster/client

# Install dependencies and build static assets
npm ci
npm run build

# Output bundle is located at /var/www/helproster/client/dist
```

### 3.5 Configure Nginx
Create `/etc/nginx/sites-available/helproster`:
```nginx
server {
    listen 80;
    server_name helproster.org www.helproster.org;

    root /var/www/helproster/client/dist;
    index index.html;

    # Gzip Compression
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml image/svg+xml;

    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Static assets caching
    location ~* \.(?:ico|css|js|gif|jpe?g|png|woff2?|svg|webp)$ {
        expires 6M;
        access_log off;
        add_header Cache-Control "public, max-age=15552000, immutable";
    }

    # API Reverse Proxy
    location /api/ {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 90s;
    }

    # SPA Client Route Fallback
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

Enable site and reload Nginx:
```bash
sudo ln -s /etc/nginx/sites-available/helproster /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx
```

### 3.6 Enable Free SSL/TLS via Let's Encrypt
```bash
sudo certbot --nginx -d helproster.org -d www.helproster.org
```

Certbot automatically provisions the certificates and updates your Nginx configuration to force HTTPS redirection.

---

## 4. 💾 Database Maintenance & Disaster Recovery

### 4.1 Running Migrations
Whenever updating to a new version of HelpRoster, run:
```bash
cd /var/www/helproster/server
npm run db:migrate
```
The migration runner checks the `schema_migrations` table and applies only newly added `.sql` scripts.

### 4.2 Automated Database Backups
HelpRoster includes an automated SQL backup utility (`database/backup.js`).

**Configure automated daily backup cron job:**
```bash
sudo crontab -e
```
Add the following line to run backups daily at 2:00 AM:
```bash
0 2 * * * cd /var/www/helproster/server && npm run db:backup >> /var/log/helproster_backup.log 2>&1
```

### 4.3 Database Restoration Procedure
In the event of hardware failure, data corruption, or migration rollbacks:

1. **Locate the latest backup SQL file** in `/var/www/helproster/database/backups/`.
2. **Execute the automated restore script:**
   ```bash
   cd /var/www/helproster/server
   npm run db:restore
   ```
   Or restore a specific snapshot:
   ```bash
   node src/database/restore.js ../database/backups/helproster_backup_2026-10-18T12-00-00.sql
   ```
3. **Verify data integrity and restart backend:**
   ```bash
   pm2 restart helproster-api
   ```

---

## 5. 🛡️ Security & Hardening Checklist

| Security Control | Implementation | Verification Command |
|---|---|---|
| **SQL Injection Defense** | Parameterized queries via `mysql2` | `node server/tests/runner.js` |
| **HTTP Security Headers** | Helmet (`X-Frame-Options`, `nosniff`, `HSTS`) | `curl -I https://helproster.org` |
| **Cookie Security** | `httpOnly: true`, `SameSite: Lax`, `secure: true` | Inspected in browser devtools |
| **Rate Limiting** | Auth routes: 15 req/15min, Contact: 5 req/15min | Verified via `security.test.js` |
| **Password Hashing** | Bcrypt (10 salt rounds) | DB audit: zero plaintext passwords |
| **Firewall** | UFW blocking all ports except 22, 80, 443 | `sudo ufw status verbose` |
| **Secrets Protection** | `.env` files in `.gitignore`, non-root execution | Checked via `git status` |

---

## 6. 📊 Monitoring & Operational Runbook

### Health Check Endpoint
- **URL:** `GET /api/v1/health`
- **Expected Status Code:** `200 OK`
- **Response Format:**
  ```json
  {
    "status": "success",
    "data": {
      "status": "healthy",
      "timestamp": "2026-10-18T12:00:00.000Z",
      "uptime": 3600.24,
      "environment": "production",
      "database": {
        "connected": true,
        "message": "MySQL connection successful"
      }
    }
  }
  ```

### Log Locations
- **Nginx Access Logs:** `/var/log/nginx/access.log`
- **Nginx Error Logs:** `/var/log/nginx/error.log`
- **PM2 Application Logs:** `pm2 logs helproster-api`
- **Database Backup Logs:** `/var/log/helproster_backup.log`
