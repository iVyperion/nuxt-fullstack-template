# Nuxt Fullstack Template

A deployment-ready template for building full-stack Nuxt applications with Docker, CI/CD, and multi-environment setup (production & staging).

## Features

- ✅ **Nuxt 4** - Modern Vue 3 full-stack framework
- ✅ **Docker Compose** - App + PostgreSQL in one file
- ✅ **GitHub Actions** - Automated CI/CD pipeline
- ✅ **Multi-Environment** - Separate prod/staging with GitHub Environments
- ✅ **Tailscale VPN** - Secure deployment over VPN
- ✅ **SSH Deployment** - Automated deployment via SSH
- ✅ **PostgreSQL** - Database included in docker-compose

---

## Table of Contents

1. [Quick Start](#quick-start)
2. [Setup & Initialization](#setup--initialization)
3. [Local Development](#local-development)
4. [GitHub Deployment Setup](#github-deployment-setup)
5. [Deployment](#deployment)
6. [Docker Commands](#docker-commands)
7. [Optional: Database Admin with pgAdmin](#optional-database-admin-with-pgadmin)
8. [Troubleshooting](#troubleshooting)
9. [Security & Best Practices](#security--best-practices)

---

## Quick Start

### 1. Use This Template

Click **"Use this template"** on GitHub, or:

```bash
git clone https://github.com/ivyperion/nuxt-fullstack-template.git YOUR-PROJECT-NAME
cd YOUR-PROJECT-NAME
pnpm install
```

### 2. Initialize Nuxt

```bash
pnpm dlx nuxi@latest init
```

Select a template from [nuxt.com/templates](https://nuxt.com/templates):
- **Starter** - Basic template (recommended)
- **UI** - With Nuxt UI components
- **Content** - For blogs/documentation
- **Layer** - Minimal setup

### 3. Install Dependencies & Setup

```bash
pnpm install
cp .env.example .env.local

# Generate session password
openssl rand -base64 32  # Copy this to NUXT_SESSION_PASSWORD in .env.local
```

### 4. Start Development

```bash
pnpm dev
```

Visit [http://localhost:3000](http://localhost:3000)

---

## Setup & Initialization

### Step 1: Clone or Use Template

#### Option A: GitHub Template (Recommended)
1. Click **"Use this template"** on the GitHub repository
2. Choose repository name and owner
3. Click **"Create repository from template"**
4. Clone your new repository:
   ```bash
   git clone https://github.com/YOUR-USERNAME/YOUR-REPO-NAME.git
   cd YOUR-REPO-NAME
   ```

#### Option B: Clone Directly
```bash
git clone https://github.com/ivyperion/nuxt-fullstack-template.git
cd nuxt-fullstack-template
git remote set-url origin https://github.com/YOUR-USERNAME/YOUR-REPO-NAME.git
git branch -M main
git push -u origin main
```

### Step 2: Install Dependencies

```bash
pnpm install
```

### Step 3: Initialize Nuxt Template

Choose your template from [nuxt.com/templates](https://nuxt.com/templates):

```bash
pnpm dlx nuxi@latest init
```

When prompted, select a template. The command will merge it with your project.

### Step 4: Install New Dependencies

```bash
pnpm install
```

### Step 5: Setup Environment Variables

```bash
cp .env.example .env.local
```

Edit `.env.local`:
- Generate SESSION_PASSWORD: `openssl rand -base64 32`
- Add DATABASE_URL if using Prisma (optional)

### Step 6: Verify Setup

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Local Development

### Without Database

```bash
pnpm dev
```

### With PostgreSQL

Start PostgreSQL + your app in one command:

```bash
docker-compose up -d
pnpm dev
```

The database will be available at `postgresql://postgres:postgres@localhost:5432/app_dev`

### Useful Commands

```bash
# Development
pnpm dev              # Start dev server
pnpm build            # Build for production
pnpm preview          # Preview production build
pnpm typecheck        # Type checking
pnpm lint             # Linting

# Docker
pnpm docker:build     # Build Docker image
pnpm docker:run       # Run Docker image locally
```

### docker-compose.yml Structure

The included `docker-compose.yml` has:

```yaml
services:
  app:
    build: .
    ports: ["3000:3000"]
    environment: [SESSION_PASSWORD, DATABASE_URL]
    
  postgres:
    image: postgres:16-alpine
    ports: ["5432:5432"]
    environment: [POSTGRES_PASSWORD, POSTGRES_DB]
```

Both services are in **one file** for simplicity and easy local development.

---

## GitHub Deployment Setup

> **Note:**
> If you add a new environment variable or secret that your app needs at runtime (for example, a new API key or database URL), you must also update the CI/CD workflow file (in `.github/workflows/ci.yml`).
> Add the new secret to the workflow's environment section so it is available during deployment. Otherwise, your app will not receive the new variable on the server.

### 1. Create Repository Secrets

Go to **Settings → Secrets and variables → Actions** and add:

#### Application Secrets
| Secret | Value |
|--------|-------|
| `NUXT_SESSION_PASSWORD` | `openssl rand -base64 32` |
| `TAILSCALE_OAUTH_CLIENT_ID` | From [Tailscale Admin Console](https://login.tailscale.com/admin/settings/trust-credentials) |
| `TAILSCALE_OAUTH_CLIENT_SECRET` | From [Tailscale Admin Console](https://login.tailscale.com/admin/settings/trust-credentials) |
| `SSH_USER` | SSH username (e.g., `deploy`) |
| `SSH_KEY` | SSH private key (PEM format) |
| `SSH_PORT` | SSH port (default: `2222`) |

#### Setup via GitHub CLI

```bash
gh secret set NUXT_SESSION_PASSWORD --body "$(openssl rand -base64 32)"
gh secret set TAILSCALE_OAUTH_CLIENT_ID --body "tsclient_..."
gh secret set TAILSCALE_OAUTH_CLIENT_SECRET --body "tssecret_..."
gh secret set SSH_USER --body "deploy"
gh secret set SSH_KEY --body "$(cat ~/.ssh/id_rsa)"
gh secret set SSH_PORT --body "2222"
```

### 2. Create GitHub Environments

Go to **Settings → Environments** and create two environments:

#### Production (`prod`)

Add environment secrets:
- `PROD_HOST` - Production server hostname/IP
- `NUXT_DATABASE_URL` - Production database connection string

```bash
gh secret set PROD_HOST --body "prod.example.com" --env prod
gh secret set NUXT_DATABASE_URL --body "postgresql://user:pass@prod-db:5432/app_prod" --env prod
```

#### Staging (`staging`)

Add environment secrets:
- `STAGING_HOST` - Staging server hostname/IP
- `NUXT_DATABASE_URL` - Staging database connection string

```bash
gh secret set STAGING_HOST --body "staging.example.com" --env staging
gh secret set NUXT_DATABASE_URL --body "postgresql://user:pass@staging-db:5432/app_staging" --env staging
```

### 3. Verify Secrets

```bash
# List all repository secrets
gh secret list

# Check environment secrets
gh secret list --env prod
gh secret list --env staging
```

---

## Deployment

### Deployment Server Setup

#### Prerequisites

The deployment server must have:
- Docker and Docker Compose installed
- Tailscale installed and configured
- SSH access with the specified user
- Permissions to run Docker commands

#### 1. Install Docker

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install -y docker.io docker-compose
sudo usermod -aG docker $USER
newgrp docker
```

#### 2. Install Tailscale

```bash
curl -fsSL https://tailscale.com/install.sh | sh
sudo tailscale up
```

#### 3. Create Application Directory

```bash
sudo mkdir -p /srv/prod/app /srv/staging/app
sudo chown $USER:$USER /srv/prod/app /srv/staging/app
cd /srv/prod/app
```

#### 4. Create docker-compose.yml on Server

The CI/CD workflow automatically pulls the Docker image and runs containers. You need a simple `docker-compose.yml` on the server:

```yaml
version: '3.8'

services:
  app:
    image: ghcr.io/YOUR-USERNAME/YOUR-REPO:prod
    container_name: nuxt-app-prod
    ports:
      - "3000:3000"
    environment:
      NODE_ENV: production
      NUXT_SESSION_PASSWORD: ${NUXT_SESSION_PASSWORD}
      NUXT_DATABASE_URL: ${NUXT_DATABASE_URL}
    volumes:
      - ./public/uploads:/app/public/uploads
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost:3000/api/health"\]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 5s
```

#### 5. Create .env File on Server

```bash
cd /srv/prod/app
nano .env
```

Add:
```env
NUXT_SESSION_PASSWORD=your_32_character_secret
NUXT_DATABASE_URL=postgresql://user:password@db-host:5432/app_prod
```

#### 6. Optional: Setup Nginx for HTTPS

```bash
sudo apt install -y nginx certbot python3-certbot-nginx
```

Create `/etc/nginx/sites-available/app`:

```nginx
upstream nuxt_app {
    server localhost:3000;
}

server {
    server_name app.example.com;
    
    location / {
        proxy_pass http://nuxt_app\;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
    
    listen 443 ssl;
    ssl_certificate /etc/letsencrypt/live/app.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/app.example.com/privkey.pem;
}

server {
    listen 80;
    server_name app.example.com;
    return 301 https://$server_name$request_uri\;
}
```

Enable and start:
```bash
sudo ln -s /etc/nginx/sites-available/app /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### How Deployment Works

1. **Push to branch** - Push to `master` (prod) or `staging`
2. **Build image** - Docker image is built and pushed to GitHub Container Registry
3. **Connect via Tailscale** - GitHub Actions connects to deployment server via VPN
4. **Deploy** - SSH into server and pulls latest image, restarts containers

**Branch Mapping:**
- `master` → Production (`PROD_HOST`)
- `staging` → Staging (`STAGING_HOST`)

### First Deployment

1. Make initial commit:
   ```bash
   git add .
   git commit -m "Initial commit with deployment setup"
   git push origin master
   ```

2. Watch deployment:
   - Go to **Actions** tab on GitHub
   - Click the running workflow
   - View logs in real-time

3. Verify on server:
   ```bash
   ssh -p 2222 deploy@prod.example.com
   docker ps
   docker compose logs -f
   curl http://localhost:3000
   ```

### Deploying Updates

#### To Production
```bash
git commit -m "Production update"
git push origin master
```

#### To Staging
```bash
git commit -m "Staging test"
git push origin staging
```

---

## Docker Commands

### Building

```bash
# Build image locally
docker build -t nuxt-app .

# Build without cache
docker build -t nuxt-app --no-cache .
```

### Running with Compose

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f app
docker-compose logs -f postgres

# Stop services
docker-compose down

# Remove everything (careful!)
docker-compose down -v
```

### Running Containers

```bash
# Run image
docker run -p 3000:3000 nuxt-app

# Run with environment file
docker run -p 3000:3000 --env-file .env nuxt-app

# Run interactive
docker run -it -p 3000:3000 nuxt-app /bin/sh
```

### Container Management

```bash
# List running containers
docker ps

# List all containers
docker ps -a

# View container logs
docker logs -f CONTAINER_ID

# Execute command in container
docker exec -it CONTAINER_ID sh

# Remove container
docker rm CONTAINER_ID

# Stop container
docker stop CONTAINER_ID

# Start container
docker start CONTAINER_ID
```

### Image Management

```bash
# List images
docker images

# Remove image
docker rmi IMAGE_ID

# Push to registry
docker tag nuxt-app ghcr.io/user/repo:latest
docker push ghcr.io/user/repo:latest

# Login to GitHub Container Registry
docker login ghcr.io
```

### System Management

```bash
# View resource usage
docker stats

# Clean up everything
docker system prune -a

# Disk usage
docker system df
```

---

## Optional: Database Admin with pgAdmin

**pgAdmin** is a web-based PostgreSQL management tool. It's optional and runs separately to keep your production docker-compose clean.

### Quick Start

Use the separate `docker-compose.dev.yml` file:

```bash
# Start pgAdmin with your database
docker-compose -f docker-compose.dev.yml up -d

# View logs
docker-compose -f docker-compose.dev.yml logs -f pgadmin

# Stop
docker-compose -f docker-compose.dev.yml down
```

### Access pgAdmin

1. Open [http://localhost:5050](http://localhost:5050)
2. Login with:
   - **Email:** `admin@admin.com` (or `PGADMIN_EMAIL` in .env)
   - **Password:** `admin` (or `PGADMIN_PASSWORD` in .env)

### Connect to Database

1. Right-click **Servers** → **Register** → **Server**
2. **General** tab:
   - **Name:** `Local PostgreSQL`
3. **Connection** tab:
   - **Host name:** `postgres` (or `localhost`)
   - **Port:** `5432`
   - **Username:** `postgres`
   - **Password:** `postgres` (or `POSTGRES_PASSWORD` from docker-compose.yml)
4. Click **Save**

### Using pgAdmin

- **Databases** → View all databases
- **Tables** → Browse schema and data
- **Query Tool** → Run SQL queries
- **Backups** → Export database
- **Server** → View logs and stats

### Alternative: Command Line

If you prefer CLI over GUI:

```bash
# Connect with psql
docker-compose exec postgres psql -U postgres -d app_dev

# List databases
\l

# List tables
\dt

# Describe table
\d table_name

# Exit
\q
```

### Stop pgAdmin

```bash
# Stop only pgAdmin
docker-compose -f docker-compose.dev.yml down

# Keep database running
docker-compose down  # Only stops app service
```

---

## Troubleshooting

### Setup Issues

| Problem | Solution |
|---------|----------|
| `pnpm: command not found` | `npm install -g pnpm` |
| Nuxt init fails | `rm -rf node_modules .nuxt && pnpm install && pnpm dlx nuxi init` |
| Port 3000 in use | `lsof -ti:3000 \| xargs kill -9` |
| Docker not found | `docker --version` / install Docker |

### Deployment Issues

| Problem | Solution |
|---------|----------|
| SSH connection fails | Check SSH_KEY is PEM format, test with `ssh -v -p 2222 user@host` |
| Docker image won't pull | `docker login ghcr.io`, verify image exists |
| Container won't start | Check logs: `docker compose logs`, verify `.env` file |
| Database connection fails | Test: `psql $DATABASE_URL`, check credentials |
| Tailscale connection fails | `sudo tailscale status`, verify TAILSCALE_OAUTH_CLIENT_ID/TAILSCALE_OAUTH_CLIENT_SECRET |

### SSH Key Issues

```bash
# Check key format
file ~/.ssh/id_rsa

# Convert to PEM if needed
ssh-keygen -p -N "" -m pem -f ~/.ssh/id_rsa

# Generate new SSH key (PEM format)
ssh-keygen -t rsa -b 4096 -m pem -f ~/.ssh/id_rsa

# Test SSH connection
ssh -p 2222 -v deploy@prod.example.com
```

### Docker Issues

```bash
# Rebuild image
docker build -t nuxt-app --no-cache .

# Remove all images
docker image prune -a

# Check Dockerfile
docker build -t nuxt-app . --progress=plain

# Inspect image
docker inspect CONTAINER_ID
```

### Database Issues

```bash
# Test PostgreSQL connection
psql postgresql://postgres:postgres@localhost:5432/app_dev

# Check if PostgreSQL is running
docker ps | grep postgres

# View PostgreSQL logs
docker-compose logs postgres

# Access PostgreSQL container
docker-compose exec postgres psql -U postgres

# Backup database
pg_dump $DATABASE_URL > backup.sql

# Restore database
psql $DATABASE_URL < backup.sql
```

---

## Security & Best Practices

### Security Checklist

- ✅ Use PEM format for SSH keys (not OpenSSH)
- ✅ Rotate secrets regularly
- ✅ Use strong SESSION_PASSWORD (32+ characters)
- ✅ Keep SSH_KEY secure and backed up
- ✅ Use Tailscale VPN for all connections
- ✅ Use non-standard SSH port (not 22, use 2222+)
- ✅ Limit SSH user permissions (no sudo)
- ✅ Enable firewall on deployment server
- ✅ Use HTTPS with valid certificates
- ✅ Never commit `.env` files to Git
- ✅ Monitor container logs regularly
- ✅ Use Docker healthchecks
- ✅ Keep base images updated

### What NOT to Do

❌ Don't hardcode secrets in code
❌ Don't commit `.env` or `.env.local` to Git
❌ Don't use OpenSSH format for SSH keys
❌ Don't use port 22 for SSH
❌ Don't expose DATABASE_URL in client code
❌ Don't use weak SESSION_PASSWORD
❌ Don't skip Tailscale VPN
❌ Don't grant sudo to deployment user

### Environment Variables

#### Required
- `NUXT_SESSION_PASSWORD` - Must be 32+ characters (non-default in production)

#### Optional
- `NUXT_DATABASE_URL` - If using database
- Any other application-specific variables

---

## Project Structure

After initialization:

```
.
├── .github/
│   └── workflows/
│       └── ci.yml                  # CI/CD pipeline
├── app/                            # Nuxt app (added by template)
│   ├── app.vue
│   ├── pages/
│   ├── components/
│   ├── composables/
│   └── ...
├── server/                         # API routes (optional)
│   └── api/
├── public/
│   └── uploads/                    # User files
├── Dockerfile                      # Container image
├── docker-compose.yml              # App + PostgreSQL
├── .env.example                    # Environment template
├── .gitignore
├── .dockerignore
├── package.json
├── nuxt.config.ts
├── README.md                       # This file
└── ...
```

---

## Useful Links

- [Nuxt Documentation](https://nuxt.com/docs)
- [Nuxt Templates](https://nuxt.com/templates)
- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose](https://docs.docker.com/compose/)
- [Tailscale Documentation](https://tailscale.com/kb/)
- [GitHub Actions](https://docs.github.com/en/actions)
- [pnpm Documentation](https://pnpm.io/)

---

## Quick Reference Checklist

### Initialization
- [ ] Clone/use as template
- [ ] `pnpm install`
- [ ] `pnpm dlx nuxi init` (select template)
- [ ] `pnpm install` (new deps)
- [ ] `cp .env.example .env.local`
- [ ] Generate SESSION_PASSWORD: `openssl rand -base64 32`
- [ ] `pnpm dev` (test)
- [ ] Git commit & push

### GitHub Setup
- [ ] Set repository secrets (SESSION_PASSWORD, SSH_*, TAILSCALE_OAUTH_CLIENT_*)
- [ ] Create `prod` environment with PROD_HOST & DATABASE_URL
- [ ] Create `staging` environment with STAGING_HOST & DATABASE_URL
- [ ] Verify secrets: `gh secret list`

### Server Setup
- [ ] Install Docker & Docker Compose
- [ ] Install Tailscale
- [ ] Create `/srv/prod/app` directory
- [ ] Create `docker-compose.yml` on server
- [ ] Create `.env` file on server with secrets
- [ ] Test: `docker ps`, `docker compose logs`

### Deployment
- [ ] Push to `master` (production)
- [ ] Watch Actions tab
- [ ] Verify on server: `ssh ... && docker ps`
- [ ] Test: `curl http://localhost:3000`

---

## Questions or Issues?

1. Check the **Troubleshooting** section above
2. Review [Nuxt Docs](https://nuxt.com/docs)
3. Check [Docker Docs](https://docs.docker.com/)
4. Create an issue on GitHub
