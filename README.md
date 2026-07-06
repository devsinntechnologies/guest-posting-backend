# Devsinn Insights Backend

Production-grade REST API for **Devsinn Insights** — a guest posting and SEO content publishing platform.

## Tech Stack

- **NestJS** (TypeScript)
- **PostgreSQL** + **Prisma ORM**
- **JWT** auth (access + refresh tokens)
- **BullMQ** + Redis (email queue)
- **Stripe** payments
- **Swagger/OpenAPI** at `/api/docs`

## Quick Start

### Prerequisites

- Node.js 20+
- Docker & Docker Compose (recommended)
- PostgreSQL 16 and Redis 7 (if not using Docker)

### 1. Clone and install

```bash
cd devsinn-insights
npm install
cp .env.example .env
```

### 2. Start infrastructure

```bash
docker compose up -d postgres redis
```

### 3. Database setup

```bash
npx prisma migrate dev --name init
npx prisma db seed
```

### 4. Run the app

```bash
npm run start:dev
```

- API: `http://localhost:3000/api/v1`
- Swagger: `http://localhost:3000/api/docs`

### Full Docker stack (nginx as API server)

**Requires Docker only** — nginx listens on all interfaces (`0.0.0.0`) so other machines on your network can reach the API.

```bash
cd guest-posting-backend
npm run serve
```

This builds the app, runs postgres + redis, and starts **nginx on port 80** as the public entry point.

| Endpoint | URL (this machine) |
|----------|-------------------|
| Swagger | http://localhost/api/docs |
| API | http://localhost/api/v1 |
| Uploads | http://localhost/uploads/ |

**From another machine on the same Wi-Fi/LAN**, use the host's IP (printed by `npm run serve`):

| Endpoint | URL (other machine) |
|----------|---------------------|
| Swagger | http://YOUR_LAN_IP/api/docs |
| API | http://YOUR_LAN_IP/api/v1 |

Set the frontend on that machine:

```bash
# devsinn-insight/.env.local
NEXT_PUBLIC_API_BASE_URL=http://YOUR_LAN_IP/api/v1
```

Find your LAN IP: `ipconfig getifaddr en0` (Mac) or `hostname -I` (Linux).

If port 80 is in use:

```bash
NGINX_PORT=8080 npm run serve
# API: http://YOUR_LAN_IP:8080/api/v1
```

### Access from the public internet (any location)

```bash
npm run serve:remote
```

Creates a free Cloudflare tunnel URL (e.g. `https://xxxx.trycloudflare.com`).

### Do NOT mix modes

| Command | What it does |
|---------|--------------|
| `npm run serve` | Docker + nginx on port 80 — **use this as the server** |
| `npm run start:dev` | NestJS only on port 3000 — local dev without nginx |

## Seed Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@devsinn.com | Admin123! |
| Contributor | contributor@devsinn.com | Contributor123! |
| User | user@devsinn.com | User123! |

## Key API Endpoints

| Module | Endpoints |
|--------|-----------|
| Auth | `POST /auth/register`, `/login`, `/refresh`, `/logout`, `/forgot-password`, `/reset-password` |
| Articles | `GET /articles`, `GET /articles/:slug`, `POST /articles`, `PATCH /articles/:id/status` |
| Categories | `GET /categories`, `GET /categories/:slug/articles` |
| Comments | `POST /articles/:id/comments`, `PATCH /comments/:id/moderate` |
| Payments | `POST /orders/checkout`, `POST /payments/webhook`, `GET /orders/my-orders` |
| SEO | `GET /seo/sitemap-data`, `POST /seo/pages/bulk-generate` |
| Dashboard | `GET /dashboard/stats` |

## Project Structure

```
src/
├── auth/           # JWT authentication
├── users/          # Profile & admin user management
├── articles/       # CRUD, submission, status
├── categories/     # Nested categories
├── tags/           # Tag management
├── comments/       # Guest & authenticated comments
├── workflow/       # State machine + audit log
├── packages/       # Pricing packages
├── payments/       # Stripe checkout & webhooks
├── sponsored-posts/
├── link-insertions/
├── notifications/  # In-app notifications
├── email/          # BullMQ email queue
├── seo/            # Programmatic SEO pages
├── dashboard/      # Role-aware analytics
└── common/         # Guards, filters, interceptors, utils
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run start:dev` | Development with hot reload |
| `npm run build` | Production build |
| `npm run test` | Unit tests |
| `npm run test:e2e` | E2E tests |
| `npm run lint` | ESLint |
| `npx prisma migrate dev` | Create/apply migrations |
| `npx prisma db seed` | Seed sample data |
| `npx prisma studio` | Database GUI |

## Documentation

- [ERD Diagram](docs/ERD.md)
- [Workflow State Machine](WORKFLOW.md)
- [RBAC Permissions](RBAC.md)
- [Postman Collection](postman/Devsinn-Insights.postman_collection.json)

## Environment Variables

See [`.env.example`](.env.example) for all required variables.

## Testing

```bash
npm run test
npm run test:e2e
```

Unit tests cover: auth service, workflow state machine, RBAC guard, payment webhook idempotency.

## License

UNLICENSED — private project.
