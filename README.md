# EUCX — European Union Commodity Exchange

**Professional B2B digital exchange platform for steel, rebar, and industrial commodities.**

> Powered by Next.js 15 · NestJS 10 · PostgreSQL 16 · Redis 7 · Socket.IO

---

## Table of Contents

- [The Big Picture](#the-big-picture)
- [5-Minute Quickstart](#5-minute-quickstart)
- [Repository Layout](#repository-layout)
- [Tech Stack](#tech-stack)
- [API Guide](#api-guide)
- [Authentication](#authentication)
- [Test Suite](#test-suite)
- [Deployment](#deployment)
- [Environment Variables](#environment-variables)
- [Roadmap 2027](#roadmap-2027)

---

## The Big Picture

EUCX is a **price-time priority order matching exchange** built as a production-grade monorepo. It handles:

- Double-auction order matching with advisory-lock race condition prevention
- Double-entry bookkeeping ledger with storno (reversal) support
- KYC-gated trading with compliance backoffice
- HMAC-signed webhooks for partner integrations
- Real-time market data via Socket.IO + TradingView charts

```
┌─────────────────────────────────────────────────────────────────────┐
│                        EUCX Platform                                │
│                                                                     │
│  Browser (Next.js 15)          NestJS API (port 3001)               │
│  ┌───────────────────┐         ┌──────────────────────────────────┐ │
│  │ useTrading()      │◄──WS────│ Gateway (Socket.IO)              │ │
│  │ Zustand store     │         │   orderbook:update               │ │
│  │ OrderBook.tsx     │         │   deal:matched                   │ │
│  │ MarketChart.tsx   │──REST──►│ REST Controllers                 │ │
│  │ (Lightweight v5)  │         │   OrdersController               │ │
│  └───────────────────┘         │   SessionsController             │ │
│                                │   AdminController                │ │
│                                └──────────┬───────────────────────┘ │
│                                           │                         │
│                                    ┌──────▼──────┐                  │
│                                    │  BullMQ     │                  │
│                                    │  Queues:    │                  │
│                                    │  MATCHING   │                  │
│                                    │  CLEARING   │                  │
│                                    │  WEBHOOKS   │                  │
│                                    └──────┬──────┘                  │
│                                           │                         │
│                   ┌───────────────────────▼───────────────────────┐ │
│                   │           PostgreSQL (Neon / Docker)           │ │
│                   │  Orders · Deals · LedgerEntries · Invoices     │ │
│                   │  Users · Organizations · KYC · ApiKeys         │ │
│                   │  MarketCandles · AuditLogs · Webhooks          │ │
│                   └───────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
```

### Data Flow: Order Submission → Settlement

```
1. Trader submits order via POST /api/v1/orders
2. JwtAuthGuard + KycVerifiedGuard validate request
3. Order written to DB (status: ACTIVE)
4. MATCHING BullMQ job enqueued for the trading session
5. MatchingProcessor acquires pg_advisory_lock(sessionId)
6. Engine loops: sortAsks() [price ASC, time ASC] × sortBids() [price DESC, time ASC]
7. computeMatch(bid, ask) → min(bidRemaining, askRemaining) @ price-time priority
8. Deal created, Orders updated (filledQty, status PARTIALLY_FILLED / FILLED)
9. Advisory lock released
10. CLEARING job: calculateFees() → double-entry LedgerEntries
11. Invoice generated (PDF-lib), Settlement.status = SETTLEMENT_COMPLETE
12. Socket.IO broadcasts: deal:matched, orderbook:update
13. WebhookService dispatches TRADE_MATCHED to subscribed endpoints
14. MarketCandle cache refreshed by @Cron() job
```

---

## 5-Minute Quickstart

### Prerequisites

| Tool | Version |
|------|---------|
| Node.js | ≥ 20.0 |
| npm | ≥ 10.0 |
| Docker + Compose | ≥ 24 |
| Git | any |

### Step-by-step

```bash
# 1. Clone
git clone https://github.com/your-org/eucx.git
cd eucx

# 2. Install all workspaces (Turborepo)
npm install

# 3. Environment setup
cp .env.production.example apps/web/.env.local
cp .env.production.example apps/api/.env
# Edit both files: set DATABASE_URL, JWT_SECRET, NEXTAUTH_SECRET

# 4. Start infrastructure (PostgreSQL + Redis)
docker compose up -d postgres redis

# 5. Database: run migrations + generate Prisma client
cd apps/web
npx prisma migrate dev --name init
npx prisma generate
cd ../..

# 6. Seed development data (products, test users, sample orders)
cd apps/web
npx prisma db seed
cd ../..

# 7. Start everything in development mode
npm run dev
# Next.js → http://localhost:3000
# NestJS  → http://localhost:3001
# Swagger → http://localhost:3001/api/docs
```

### Development Credentials (seeded)

| Role | Email | Password |
|------|-------|----------|
| Super Admin | admin@eucx.test | `Admin123!` |
| Verified Buyer | buyer@eucx.test | `Buyer123!` |
| Verified Seller | seller@eucx.test | `Seller123!` |
| Compliance Officer | compliance@eucx.test | `Comply123!` |

---

## Repository Layout

```
eucx/
├── apps/
│   ├── api/                    NestJS 10 backend
│   │   ├── src/
│   │   │   ├── modules/
│   │   │   │   ├── auth/       JWT auth, Passport strategies
│   │   │   │   ├── orders/     Order CRUD + submission
│   │   │   │   ├── sessions/   Trading session lifecycle
│   │   │   │   ├── matching/   Matching engine processor (BullMQ)
│   │   │   │   ├── clearing/   Settlement + Ledger
│   │   │   │   ├── admin/      Backoffice: KYC, disputes, reports
│   │   │   │   ├── api-keys/   API key management
│   │   │   │   ├── webhooks/   HMAC webhook delivery
│   │   │   │   ├── market/     OHLC cron cache refresh
│   │   │   │   └── public/     Public ticker API (unauthenticated)
│   │   │   ├── common/
│   │   │   │   ├── guards/     JwtAuth, Roles, KycVerified, ApiKey
│   │   │   │   ├── decorators/ @Roles(), @RequireApiScope(), @CurrentUser()
│   │   │   │   └── pipes/      ZodValidation, ParseDecimal
│   │   │   └── main.ts
│   │   ├── test/               Integration tests (Supertest + Jest)
│   │   └── jest.config.js
│   │
│   └── web/                    Next.js 15 App Router frontend
│       ├── src/
│       │   ├── app/            File-based routing (App Router)
│       │   │   ├── api/        Route Handlers (BFF layer)
│       │   │   ├── (auth)/     Login / Register pages
│       │   │   ├── dashboard/  Main trading dashboard
│       │   │   ├── admin/      Backoffice UI
│       │   │   └── market/     Market data views
│       │   ├── components/
│       │   │   ├── trading/    OrderBook, OrderForm, MarketChart, DealFeed
│       │   │   └── ui/         Shared design system components
│       │   ├── hooks/          useTrading(), useWebSocket(), useSession()
│       │   ├── lib/
│       │   │   ├── clearing/   fee-calculator.ts, validateLedgerBalance()
│       │   │   └── market/     ohlc-queries.ts (OHLC aggregation engine)
│       │   └── __tests__/
│       │       ├── unit/       fee-calculator.spec.ts, matching-engine.spec.ts
│       │       └── integration/ double-spend.spec.ts
│       ├── prisma/
│       │   └── schema.prisma   Single source of truth for all models
│       └── jest.config.js
│
├── packages/                   Shared packages (types, utils)
├── k6/                         Load tests (1000 VUs order_storm)
├── nginx/                      Nginx reverse proxy + SSL config
├── monitoring/                 Prometheus + Grafana dashboards
├── infra/                      Docker infra configs
├── .github/workflows/          CI (ci.yml) + Deploy (deploy.yml)
├── docker-compose.yml          Development stack
├── docker-compose.prod.yml     Production stack (tuned)
├── Dockerfile.api              Multi-stage NestJS build
├── Dockerfile.web              Multi-stage Next.js standalone build
├── turbo.json                  Turborepo pipeline config
└── .env.production.example     All required secrets documented
```

---

## Tech Stack

### Frontend — `apps/web`

| Library | Version | Purpose |
|---------|---------|---------|
| Next.js | 15.3 | App Router, RSC, Route Handlers |
| React | 19.2 | UI framework |
| Tailwind CSS | 4.0 | Utility-first styling |
| Zustand | 5.0 | Client state (orderbook, positions) |
| Socket.IO Client | 4.8 | Real-time WebSocket connection |
| Lightweight Charts | 5.1 | TradingView OHLC candlestick charts |
| Decimal.js | 10.6 | Financial arithmetic (no IEEE 754 errors) |
| Zod | 4.3 | Schema validation |
| pdf-lib | 1.17 | Invoice PDF generation (client-side) |
| xlsx | 0.18 | Trade export to Excel |

### Backend — `apps/api`

| Library | Version | Purpose |
|---------|---------|---------|
| NestJS | 10.3 | Modular backend framework |
| Prisma | 5.22 | Type-safe ORM |
| BullMQ | 5.71 | Redis-backed job queues (matching, clearing, webhooks) |
| Socket.IO | 4.7 | WebSocket gateway |
| `@nestjs/schedule` | 6.1 | Cron jobs (OHLC cache refresh) |
| `@nestjs/swagger` | 7.3 | Auto-generated OpenAPI docs |
| `@nestjs/terminus` | 11.1 | Health checks (`/api/v1/health`) |
| `@nestjs/throttler` | 5.1 | Global rate limiting |
| bcrypt | 6.0 | API key secret hashing |
| nestjs-pino | 4.6 | Structured JSON logging |
| helmet | 7.1 | HTTP security headers |

### Infrastructure

| Component | Technology |
|-----------|-----------|
| Database | PostgreSQL 16 (Neon serverless or Docker) |
| Cache / Queues | Redis 7 |
| Monorepo | Turborepo 2.3 |
| Containerization | Docker + Docker Compose |
| Reverse Proxy | Nginx 1.27 (SSL termination, rate limiting) |
| SSL | Let's Encrypt (Certbot webroot) |
| Monitoring | Prometheus + Grafana |
| CI/CD | GitHub Actions → GHCR → SSH deploy |

---

## API Guide

**Base URL (production):** `https://api.eucx.exchange`
**Swagger UI:** `http://localhost:3001/api/docs` (development)

### Core Trading Endpoints

```
POST   /api/v1/orders                Create new order (BUY/SELL)
GET    /api/v1/orders                List own orders (paginated)
DELETE /api/v1/orders/:id            Cancel active order

GET    /api/v1/sessions              List trading sessions
GET    /api/v1/sessions/:id          Session detail + live orderbook
```

### Market Data

```
GET    /api/v1/market/:productId/candles   OHLC candles (?interval=ONE_HOUR&limit=500)
GET    /api/v1/market/export               Trade export (?format=csv|xlsx&from=&to=)
GET    /api/v1/public/ticker               All tickers (Redis 30s cache, public)
GET    /api/v1/public/ticker/:id           Single ticker
GET    /api/v1/public/products             Product catalog (5min cache)
GET    /api/v1/public/health               Health status (no auth)
```

### Admin / Backoffice

```
GET    /api/v1/admin/kyc                    KYC queue (COMPLIANCE_OFFICER+)
PATCH  /api/v1/admin/kyc/:id               Set verification status
POST   /api/v1/admin/kyc/:id/note          Add admin note
POST   /api/v1/admin/kyc/:id/freeze        Freeze account
GET    /api/v1/admin/disputes              Open disputes
POST   /api/v1/admin/trades/:id/dispute    Open dispute on deal
PATCH  /api/v1/admin/disputes/:id/status   Update dispute status
POST   /api/v1/admin/disputes/:id/resolve  Resolve (UPHELD/REVERSED/PARTIAL)
DELETE /api/v1/admin/trades/:id            Hard cancel (SUPER_ADMIN only)
GET    /api/v1/admin/finance/fees          Fee report (GROUP BY month/currency)
GET    /api/v1/admin/finance/daily         Daily trading summary
GET    /api/v1/admin/audit                 Audit log explorer
GET    /api/v1/admin/audit/critical        Critical events only
```

### API Economy

```
GET    /api/v1/api-keys                    List own API keys
POST   /api/v1/api-keys                    Generate new key
DELETE /api/v1/api-keys/:id               Revoke key

GET    /api/v1/webhooks                    List webhook endpoints
POST   /api/v1/webhooks                    Register endpoint
DELETE /api/v1/webhooks/:id               Remove endpoint
```

---

## Authentication

### JWT (User / Browser)

All protected routes require `Authorization: Bearer <token>`.

```bash
# Login
POST /api/v1/auth/login
{ "email": "buyer@eucx.test", "password": "Buyer123!" }
→ { "access_token": "eyJ...", "expires_in": 604800 }

# Use token
curl -H "Authorization: Bearer eyJ..." https://api.eucx.exchange/api/v1/orders
```

**Role hierarchy:** `SUPER_ADMIN` > `COMPLIANCE_OFFICER` > `ADMIN` > `WAREHOUSE_INSPECTOR` > `BUYER`/`SELLER`/`BROKER`

**KYC gate:** Orders and clearing routes additionally require `verificationStatus === VERIFIED`. Guests receive `403 Forbidden` with `KYC_BYPASS_ATTEMPT` logged to audit trail.

### API Keys (Bot / Integration)

```bash
# Create API key (authenticated as org user)
POST /api/v1/api-keys
{ "name": "My Bot", "scopes": ["READ_MARKET", "PLACE_ORDERS"], "ipWhitelist": ["1.2.3.4"] }
→ { "key": "eucx_live_a1b2c3d4_BASE64SECRET...", "prefix": "a1b2c3d4" }
# IMPORTANT: The full key is shown ONCE. Store it securely.

# Use API key
curl -H "X-EUCX-API-KEY: eucx_live_a1b2c3d4_..." https://api.eucx.exchange/api/v1/orders
```

Key format: `eucx_live_{8hex_prefix}_{32byte_base64url_secret}`
Storage: Only the prefix (cleartext) and `bcrypt(secret, rounds=12)` are stored. The full key is irretrievable after creation.

### Webhook HMAC Verification

```typescript
// Verify incoming webhook in your endpoint:
import { createHmac } from "crypto";

function verify(body: string, signature: string, secret: string): boolean {
  const expected = `sha256=${createHmac("sha256", secret).update(body).digest("hex")}`;
  return signature === expected;
}

// Headers sent with every delivery:
// X-EUCX-Signature:  sha256=abc123...
// X-EUCX-Event:      TRADE_MATCHED
// X-EUCX-Delivery:   uuid-delivery-id
// X-EUCX-Timestamp:  unix_ms
```

---

## Test Suite

```bash
# Run all tests across the monorepo
npm test

# Web unit tests only (fee-calculator + matching-engine + double-spend)
cd apps/web && npx jest

# With coverage report
cd apps/web && npx jest --coverage

# API tests
cd apps/api && npx jest

# Watch mode during development
cd apps/web && npx jest --watch
```

### Coverage Summary (as of Step 12)

| File | Statements | Functions | Lines | Branches |
|------|-----------|-----------|-------|----------|
| `fee-calculator.ts` | **97.14%** | **100%** | **100%** | 80% |
| Total test count | **63 / 63** passing | | 0.465s | |

### Test Architecture

```
apps/web/src/__tests__/
├── unit/
│   ├── fee-calculator.spec.ts      30 tests — fee tiers, MwSt/Reverse Charge, Decimal precision
│   └── matching-engine.spec.ts     18 tests — price-time priority, partial fills, FIFO sort
└── integration/
    └── double-spend.spec.ts        15 tests — idempotency keys, advisory lock simulation,
                                               negative quantity invariant, storno invariants

apps/api/test/
└── orders-api.spec.ts              Integration tests — RolesGuard, ApiKeyService, Supertest
```

**Philosophy:** Unit tests target pure algebraic logic (no Prisma, no network). Integration tests verify behavioral invariants. No mocking of the `fee-calculator` — it's the financial source of truth.

---

## Deployment

### Production Deploy (automated via GitHub Actions)

Push to `main` → tests run → Docker images built & pushed to GHCR → SSH deploy to server.

See [.github/workflows/deploy.yml](.github/workflows/deploy.yml) for the full pipeline.

### Manual Deploy

```bash
# On the production server
cd /opt/eucx
git pull origin main

# Copy and fill secrets
cp .env.production.example .env.production
nano .env.production   # set all CHANGE_ME values

# First-time SSL certificate
docker compose -f docker-compose.prod.yml up certbot
# Then: docker compose run --rm certbot certonly --webroot -w /var/www/certbot \
#   -d eucx.exchange -d api.eucx.exchange -d grafana.eucx.exchange

# Start full production stack
docker compose -f docker-compose.prod.yml up -d

# Run database migrations
docker compose -f docker-compose.prod.yml exec api npx prisma migrate deploy
```

---

## Environment Variables

All required secrets are documented in [.env.production.example](.env.production.example).

Critical secrets that must be rotated and stored in a secrets manager:

| Variable | Used by | Notes |
|----------|---------|-------|
| `DATABASE_URL` | API + Web | Neon or Docker PostgreSQL |
| `JWT_SECRET` | API | Min. 32 chars, cryptographically random |
| `NEXTAUTH_SECRET` | Web | Min. 32 chars |
| `REDIS_PASSWORD` | API | BullMQ + cache |
| `WEBHOOK_SECRET` | API | HMAC signing key, 64+ chars |
| `POSTGRES_PASSWORD` | Docker | Only for self-hosted |

**Never commit `.env.production` to Git.** GitHub Actions secrets store deployment credentials (`DEPLOY_SSH_KEY`, `DEPLOY_HOST`, etc.).

---

## Roadmap 2027

See [ARCHITECTURE.md](ARCHITECTURE.md#roadmap-2027) for full technical detail.

| Phase | Timeline | Focus |
|-------|----------|-------|
| **Phase 1 — Scale** | Q3 2026 | Kubernetes, multi-region DB sharding |
| **Phase 2 — Mobile** | Q4 2026 | iOS + Android (React Native / Expo) |
| **Phase 3 — ESG** | Q2 2027 | CO2 certificates, ESG tracking for metals |

---

## Contributing

1. Branch from `develop` — never from `main`
2. PR must pass all 63 tests (CI gate enforced)
3. Financial logic changes require test coverage ≥ 95%
4. All monetary values use `Decimal.js` — never native JavaScript floats
5. Every admin action must produce an `AuditLog` entry
6. Secrets go in `.env.*` files — never hardcoded

---

*EUCX — Built for institutional-grade commodity trading.*
