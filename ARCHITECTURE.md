# EUCX — Architecture Deep Dive

**Audience:** Senior engineers, system architects, on-call engineers.
**Scope:** Matching engine, settlement/ledger, security, infrastructure, roadmap.

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [Monorepo Structure (Turborepo)](#2-monorepo-structure-turborepo)
3. [Database Schema](#3-database-schema)
4. [The Matching Engine](#4-the-matching-engine)
5. [Settlement & Ledger System](#5-settlement--ledger-system)
6. [Real-Time Layer (Socket.IO)](#6-real-time-layer-socketio)
7. [Market Analytics (OHLC)](#7-market-analytics-ohlc)
8. [Security Architecture](#8-security-architecture)
9. [API Economy & Webhooks](#9-api-economy--webhooks)
10. [KYC & Compliance Backoffice](#10-kyc--compliance-backoffice)
11. [Infrastructure & Deployment](#11-infrastructure--deployment)
12. [Observability](#12-observability)
13. [Known Trade-offs & Tech Debt](#13-known-trade-offs--tech-debt)
14. [Roadmap 2027](#14-roadmap-2027)
15. [Emergency Circuit Breaker & Kill Switch](#15-emergency-circuit-breaker--kill-switch)
16. [Market Maker Policy & Liquidity Management](#16-market-maker-policy--liquidity-management)
17. [Disaster Recovery & Data Integrity](#17-disaster-recovery--data-integrity)
18. [Access Control & Infrastructure Hardening](#18-access-control--infrastructure-hardening)

---

## 1. System Overview

EUCX is a **double-auction commodity exchange** with price-time priority (FIFO) matching. It processes structured trading sessions with defined phases (PRE_TRADING → TRADING_1 → CORRECTION → TRADING_2 → FINAL → CLOSED).

### Architecture Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Monorepo | Turborepo | Shared types, atomic deploys, parallel CI |
| ORM | Prisma 5.22 | Type-safety, migration management, Neon support |
| Queue | BullMQ (Redis) | Persistent jobs, retry logic, separate worker processes |
| Financial math | Decimal.js | No IEEE 754 rounding errors on monetary values |
| Real-time | Socket.IO | Reliable fallback transport, room-based broadcasting |
| Auth | JWT (users) + bcrypt API keys (bots) | Stateless JWTs for web sessions, long-lived keys for integrations |
| OHLC | PostgreSQL window functions | Avoid separate time-series DB; ROW_NUMBER() for OPEN/CLOSE is efficient |

### Deployment Topology (Production)

```
Internet
    │
    ▼
┌───────────────────────────────┐
│  Nginx 1.27                   │
│  eucx.exchange         :443   │  SSL termination (Let's Encrypt)
│  api.eucx.exchange     :443   │  Rate limiting zones
│  grafana.eucx.exchange :443   │  WebSocket upgrade
└──────┬────────────┬───────────┘
       │            │
       ▼            ▼
   ┌────────┐  ┌──────────────────┐
   │ Web    │  │ API (×2 replicas)│
   │ :3000  │  │ :3001            │
   │Next.js │  │ NestJS           │
   └────────┘  └────────┬─────────┘
                        │
              ┌─────────┴─────────┐
              │                   │
         ┌────▼────┐         ┌────▼────┐
         │Postgres │         │  Redis  │
         │  :5432  │         │  :6379  │
         └─────────┘         └─────────┘
```

---

## 2. Monorepo Structure (Turborepo)

```
turbo.json pipeline:
  build  → dependsOn: [^build]   (bottom-up: packages → api → web)
  test   → dependsOn: [^build]   (tests run after build)
  lint   → dependsOn: [^lint]    (parallel lint)
  dev    → cache: false          (persistent watch mode)
```

**Key Turborepo benefits for EUCX:**
- `npm run test` runs `jest` in both `apps/api` and `apps/web` concurrently
- `npm run build` caches Next.js + NestJS builds; only rebuilds changed packages
- Remote cache can be added via `TURBO_TOKEN` for CI speedup

---

## 3. Database Schema

Single PostgreSQL database, managed via Prisma migrations. All monetary fields are `Decimal(18,8)` (18 digits total, 8 decimal places). The `Decimal` type maps to Prisma's `Decimal` scalar which uses `Decimal.js` in the client.

### Entity Relationship Overview

```
Organization ──┬─── User ──────────── Order ────── Deal
               │         └─────────── ApiKey         │
               │                                      │
               ├─── WebhookEndpoint ─── WebhookDelivery
               │
               └─── (via User) ─── AdminNote
                                   TradeDispute ─── Deal

Deal ────────── Settlement
     │                └── Invoice
     └────────── LedgerEntry (n)
     └────────── TradeDispute (0..1)

Product ──────── Order
         └────── MarketCandle (OHLC cache)
         └────── TradingSession ─── Order
```

### Critical Schema Constraints

```sql
-- Idempotency: prevents double-spend at DB level
@@unique([dealId, accountId, entryType])  -- on LedgerEntry (via idempotencyKey)

-- OHLC cache: one candle per product/interval/period
@@unique([productId, interval, periodStart])  -- on MarketCandle

-- API key prefix lookup
@@unique([prefix])  -- on ApiKey

-- Advisory lock (application-level, not schema)
-- pg_advisory_xact_lock(hashtext(sessionId))
-- Ensures only one matching run per session at a time
```

### Enum State Machines

**Order lifecycle:**
```
ACTIVE → PARTIALLY_FILLED → FILLED
       ↘ CANCELLED
       ↘ EXPIRED
```

**Deal lifecycle:**
```
MATCHED → CONFIRMED → CONTRACT_SIGNED → SETTLEMENT_COMPLETE
        ↘ CANCELLED
        ↘ DISPUTED → (RESOLVED | CANCELLED)
```

**KYC lifecycle:**
```
GUEST → PENDING_VERIFICATION → VERIFIED
                             ↘ REJECTED → PENDING_VERIFICATION (re-submit)
        VERIFIED → SUSPENDED
```

---

## 4. The Matching Engine

### Algorithm: Price-Time Priority (FIFO)

The matching engine implements a **continuous double auction** with strict price-time priority:

1. **Price priority:** Best price wins (lowest ASK, highest BID)
2. **Time priority:** For equal prices, earlier submission wins

```typescript
// Sort asks: price ASC, then createdAt ASC (oldest first)
function sortAsks(asks: Order[]): Order[] {
  return [...asks].sort((a, b) => {
    const priceDiff = new Decimal(a.pricePerUnit).minus(b.pricePerUnit).toNumber();
    if (priceDiff !== 0) return priceDiff;           // cheaper first
    return a.createdAt.getTime() - b.createdAt.getTime(); // older first
  });
}

// Sort bids: price DESC, then createdAt ASC
function sortBids(bids: Order[]): Order[] {
  return [...bids].sort((a, b) => {
    const priceDiff = new Decimal(b.pricePerUnit).minus(a.pricePerUnit).toNumber();
    if (priceDiff !== 0) return priceDiff;           // more expensive first
    return a.createdAt.getTime() - b.createdAt.getTime();
  });
}
```

### Match Computation

```typescript
function computeMatch(bid: Order, ask: Order): MatchResult | null {
  if (new Decimal(bid.pricePerUnit).lt(ask.pricePerUnit)) return null; // no match

  const bidRemaining = new Decimal(bid.quantity).minus(bid.filledQty);
  const askRemaining = new Decimal(ask.quantity).minus(ask.filledQty);

  // Price-time: whichever order arrived first sets the execution price
  const matchPrice = bid.createdAt < ask.createdAt
    ? new Decimal(bid.pricePerUnit)  // bid was first
    : new Decimal(ask.pricePerUnit); // ask was first

  const matchQty  = Decimal.min(bidRemaining, askRemaining);
  const dealValue = matchPrice.times(matchQty);

  return {
    matchPrice:   matchPrice.toString(),
    matchQty:     matchQty.toString(),
    dealValue:    dealValue.toString(),
    bidRemaining: bidRemaining.minus(matchQty).toString(),
    askRemaining: askRemaining.minus(matchQty).toString(),
  };
}
```

### Race Condition Prevention: PostgreSQL Advisory Locks

The matching engine runs as a BullMQ processor. Multiple worker processes could theoretically process the same session concurrently, causing double-matches.

**Solution:** PostgreSQL advisory transaction locks, acquired before matching begins and auto-released when the transaction commits.

```typescript
// MatchingProcessor — simplified
async processSession(sessionId: string): Promise<void> {
  await this.prisma.$transaction(async (tx) => {
    // Acquire exclusive lock for this session
    // hashtext() converts string to int4 for pg_advisory_xact_lock
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${sessionId}))`;

    // --- only one process can be here at a time for sessionId ---

    const bids = await tx.order.findMany({
      where: { sessionId, direction: "BUY",  status: { in: ["ACTIVE", "PARTIALLY_FILLED"] } },
      orderBy: [{ pricePerUnit: "desc" }, { createdAt: "asc" }],
    });
    const asks = await tx.order.findMany({
      where: { sessionId, direction: "SELL", status: { in: ["ACTIVE", "PARTIALLY_FILLED"] } },
      orderBy: [{ pricePerUnit: "asc"  }, { createdAt: "asc" }],
    });

    for (const bid of bids) {
      for (const ask of asks) {
        const result = computeMatch(bid, ask);
        if (!result) continue;

        await tx.deal.create({ data: { ... } });
        await tx.order.update({ where: { id: bid.id }, data: { filledQty: ..., status: ... } });
        await tx.order.update({ where: { id: ask.id }, data: { filledQty: ..., status: ... } });

        // Update local state to avoid re-matching
        bid.filledQty = new Decimal(bid.filledQty).plus(result.matchQty).toString();
        ask.filledQty = new Decimal(ask.filledQty).plus(result.matchQty).toString();
      }
    }
    // Transaction commits → advisory lock auto-released
  });
}
```

**Invariant:** `SUM(matchQty for all deals on order) ≤ order.quantity` — enforced by the engine's `bidRemaining`/`askRemaining` tracking and tested in `double-spend.spec.ts`.

### BullMQ Queue: MATCHING

```typescript
// Queue configuration
const matchingQueue = new Queue("MATCHING", {
  connection: redis,
  defaultJobOptions: {
    attempts:    3,
    backoff:     { type: "exponential", delay: 2000 },
    removeOnComplete: 100,
    removeOnFail:     500,
  },
});

// Job enqueued when:
// 1. Session transitions to TRADING_1 or TRADING_2
// 2. New order submitted during active session
// 3. Session manual trigger by admin
```

---

## 5. Settlement & Ledger System

### Double-Entry Bookkeeping

Every financial movement creates two opposing ledger entries that must balance exactly. This is enforced by `validateLedgerBalance()`:

```typescript
// For a deal: 850,000 EUR gross, 30 BPS fee
const entries: LedgerEntry[] = [
  { entryType: "DEBIT",  amount: "850000.00000000", accountId: buyer.walletId },  // buyer pays
  { entryType: "CREDIT", amount: "847450.00000000", accountId: seller.walletId }, // seller receives
  { entryType: "CREDIT", amount: "2550.00000000",   accountId: platform.feeId },  // EUCX fee
];
// SUM(DEBIT) === SUM(CREDIT) === 850,000 → balanced ✓
```

### Fee Tiers

| Gross Volume | Rate | BPS |
|-------------|------|-----|
| < 100,000 EUR | 0.50% | 50 |
| ≥ 100,000 EUR | 0.40% | 40 |
| ≥ 500,000 EUR | 0.30% | 30 |
| ≥ 1,000,000 EUR | 0.20% | 20 |

### EU VAT / Reverse Charge

```
Reverse Charge applies when ALL of:
  1. Buyer and seller are in different EU member states
  2. Buyer has a valid EU VAT ID (buyerTaxId provided)

Result:
  isReverseCharge = true → vatRate = 0.00% → taxNote = "Steuerschuldnerschaft..."
  isReverseCharge = false → vatRate = 19.00% (domestic DE rate)

Non-EU countries (CH, US, etc.): Reverse Charge never applies.
```

### Storno (Trade Reversal)

When a dispute is resolved as `TRADE_REVERSED`:

```typescript
// adminService.cancelTrade(dealId)
const originals = await prisma.ledgerEntry.findMany({ where: { dealId } });

const stornoEntries = originals.map(entry => ({
  entryType:     entry.entryType === "DEBIT" ? "CREDIT" : "DEBIT",  // flip
  amount:        entry.amount,
  currency:      entry.currency,
  correlationId: `STORNO-${entry.correlationId}`,  // traceable
  dealId,
  accountId:     entry.accountId,
}));

await prisma.ledgerEntry.createMany({ data: stornoEntries });
await prisma.settlement.update({ where: { dealId }, data: { status: "REVERSED" } });
```

**Invariant after storno:** `SUM(all entries for deal) = 0` — proven in `double-spend.spec.ts`.

### Partial Refund

```typescript
// adminService.applyPartialRefund(dealId, amount, currency)
await prisma.ledgerEntry.createMany({
  data: [
    { entryType: "CREDIT", amount, currency, correlationId: `PARTIAL-REFUND-${dealId}-${ts}` },
    { entryType: "DEBIT",  amount, currency, correlationId: `PARTIAL-REFUND-${dealId}-${ts}` },
  ],
});
```

---

## 6. Real-Time Layer (Socket.IO)

### WebSocket Architecture

```
Client (browser)
  │  socket.io-client
  │  useTrading() hook → Zustand store → React UI
  │
  ▼
NestJS WebSocket Gateway
  │  @WebSocketGateway({ cors: true, namespace: "/" })
  │  @nestjs/platform-socket.io
  │
  ├── Room: session:{sessionId}     → orderbook updates
  ├── Room: user:{userId}           → personal fill notifications
  └── Room: public                  → ticker updates

Scaling: @socket.io/redis-adapter
  → All NestJS replicas share rooms via Redis pub/sub
  → Horizontal scaling without sticky sessions
```

### Events

| Event | Direction | Payload | Room |
|-------|-----------|---------|------|
| `orderbook:update` | Server→Client | `{ bids[], asks[], sessionId }` | `session:{id}` |
| `deal:matched` | Server→Client | `{ dealId, price, qty, ts }` | `session:{id}` |
| `order:filled` | Server→Client | `{ orderId, filledQty, status }` | `user:{id}` |
| `order:submitted` | Client→Server | `{ sessionId, direction, price, qty }` | — |
| `session:status` | Server→Client | `{ status, nextPhase }` | `session:{id}` |
| `ticker:update` | Server→Client | `{ productId, last, vol24h }` | `public` |

### `useTrading()` Hook (Frontend)

```typescript
// Simplified: apps/web/src/hooks/useTrading.ts
export function useTrading(sessionId: string) {
  const { setOrderbook, addDeal } = useTradingStore();

  useEffect(() => {
    const socket = io(process.env.NEXT_PUBLIC_WS_URL!, {
      auth: { token: getJwt() },
      transports: ["websocket"],
    });

    socket.emit("join:session", { sessionId });
    socket.on("orderbook:update", (data) => setOrderbook(data));
    socket.on("deal:matched",     (data) => addDeal(data));

    return () => socket.disconnect();
  }, [sessionId]);
}
```

---

## 7. Market Analytics (OHLC)

### OHLC Computation: PostgreSQL Window Functions

PostgreSQL has no native `FIRST`/`LAST` aggregate. The OHLC engine uses `ROW_NUMBER()` window functions:

```sql
WITH ordered AS (
  SELECT
    d.price_per_unit,
    d.quantity,
    date_trunc('hour', d.created_at) AS period_start,
    ROW_NUMBER() OVER (
      PARTITION BY p.id, date_trunc('hour', d.created_at)
      ORDER BY d.created_at ASC
    ) AS rn_asc,
    ROW_NUMBER() OVER (
      PARTITION BY p.id, date_trunc('hour', d.created_at)
      ORDER BY d.created_at DESC
    ) AS rn_desc
  FROM deals d
  JOIN trading_sessions ts ON d.session_id = ts.id
  JOIN products p ON ts.product_id = p.id
  WHERE p.id = $productId
    AND d.created_at >= NOW() - INTERVAL '30 days'
    AND d.status != 'CANCELLED'
)
SELECT
  period_start,
  MAX(CASE WHEN rn_asc  = 1 THEN price_per_unit END) AS open,
  MAX(price_per_unit)                                  AS high,
  MIN(price_per_unit)                                  AS low,
  MAX(CASE WHEN rn_desc = 1 THEN price_per_unit END) AS close,
  SUM(quantity)                                        AS volume,
  COUNT(*)                                             AS trade_count
FROM ordered
GROUP BY period_start
ORDER BY period_start;
```

### Candle Cache Strategy

```
@Cron("*/1 * * * *")  → 1-MINUTE candles  (last 24h)
@Cron("*/5 * * * *")  → 15-MINUTE candles (last 7d)
@Cron(EVERY_HOUR)     → 1-HOUR candles    (last 30d)
@Cron("5 0 * * *")    → 1-DAY candles     (last 365d)

Storage: MarketCandle table
  @@unique([productId, interval, periodStart])
  Upsert strategy: update (high/low/close/volume) if period is current
                   insert if new period starts

API response:
  GET /api/v1/market/:id/candles?interval=ONE_HOUR&limit=500
  → Cache-Control: public, s-maxage=30
  → Lightweight Charts format: { time: unix_s, open, high, low, close, value, color }
```

### 15-Minute Boundary Truncation

Standard `date_trunc('minute', ts)` does not round to 15-minute buckets. Solution:

```sql
date_trunc('hour', created_at)
  + INTERVAL '1 minute'
    * FLOOR(EXTRACT(MINUTE FROM created_at) / 15) * 15
-- Result: 10:07 → 10:00, 10:17 → 10:15, 10:32 → 10:30
```

---

## 8. Security Architecture

### Authentication Layers

```
Request
  │
  ├─ JwtAuthGuard          → validates Bearer token, sets req.user
  │   └─ JwtStrategy       → verifies signature with JWT_SECRET
  │
  ├─ RolesGuard            → checks req.user.role against @Roles() metadata
  │   └─ SUPER_ADMIN       → bypasses all role checks
  │
  ├─ KycVerifiedGuard      → blocks trading if verificationStatus ≠ VERIFIED
  │   └─ Admin roles       → exempt from KYC check
  │   └─ On block          → fire-and-forget AuditLog(KYC_BYPASS_ATTEMPT)
  │
  └─ ApiKeyGuard           → reads X-EUCX-API-KEY, validates prefix+bcrypt
      └─ RequireApiScope() → checks scopes array for required permission
```

### Race Condition Prevention (Double-Spend)

Three independent mechanisms:

1. **PostgreSQL Advisory Lock** — `pg_advisory_xact_lock(hashtext(sessionId))` — prevents concurrent matching runs for the same session
2. **Idempotency Keys** — `@@unique([dealId, accountId, entryType])` on `LedgerEntry` — DB rejects duplicate ledger entries at constraint level
3. **Atomic filledQty updates** — matching engine tracks remaining quantities in-memory within the locked transaction; can never overfill

### HMAC Webhook Signatures

```
Signing:
  payload_json = JSON.stringify(webhookPayload)
  signature    = "sha256=" + HMAC-SHA256(payload_json, WEBHOOK_SECRET)

Headers sent:
  X-EUCX-Signature:  sha256=abc123...
  X-EUCX-Event:      TRADE_MATCHED
  X-EUCX-Delivery:   delivery-uuid
  X-EUCX-Timestamp:  unix_milliseconds

Retry schedule (BullMQ):
  Attempt 1: immediate
  Attempt 2: +5 minutes
  Attempt 3: +15 minutes
  Attempt 4: +60 minutes
  After 4 failures: delivery.status = FAILED (manual investigation required)

Timeout: 10 seconds per delivery attempt (AbortController)
```

### HTTP Security Headers (Nginx + Helmet)

```
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
Content-Security-Policy:   default-src 'self'; connect-src 'self' wss://api.eucx.exchange
X-Frame-Options:           SAMEORIGIN (web) / DENY (api)
X-Content-Type-Options:    nosniff
Referrer-Policy:           strict-origin-when-cross-origin
Permissions-Policy:        camera=(), microphone=(), geolocation=()
```

### Rate Limiting

| Zone | Limit | Applied to |
|------|-------|-----------|
| `api_auth` | 10 req/min | `/api/v1/auth/login`, `/register`, `/refresh` |
| `api_orders` | 30 req/min | `/api/v1/orders` |
| `api_general` | 100 req/min | All other API routes |
| `@nestjs/throttler` | 100 req/15min | NestJS global guard (second layer) |

---

## 9. API Economy & Webhooks

### API Key Lifecycle

```
1. User calls POST /api/v1/api-keys (JWT authenticated)
2. System generates:
   prefix (8 hex chars)  = crypto.randomBytes(4).toString("hex")
   secret (32 bytes)     = crypto.randomBytes(32).toString("base64url")
   fullKey               = `eucx_live_${prefix}_${secret}`
3. DB stores:
   prefix      (cleartext, for lookup)
   secretHash  (bcrypt(secret, rounds=12))
   scopes      (["READ_MARKET", "PLACE_ORDERS", ...])
   ipWhitelist (optional)
4. Full key shown ONCE to user — never stored or retrievable

Validation (ApiKeyGuard):
   Extract prefix from header → findUnique({ prefix }) → bcrypt.compare(secret, hash)
   → scope check → fire-and-forget: update lastUsedAt
```

### Available API Scopes

| Scope | Allows |
|-------|--------|
| `READ_MARKET` | Public ticker, candles, product catalog |
| `PLACE_ORDERS` | Submit and cancel orders |
| `READ_ORDERS` | List own orders and deals |
| `MANAGE_WEBHOOKS` | Register/delete webhook endpoints |
| `READ_REPORTS` | Finance reports (own org only) |

### Webhook Event Catalog

| Event | Trigger |
|-------|---------|
| `TRADE_MATCHED` | Deal created after matching |
| `ORDER_FILLED` | Order.status → FILLED |
| `ORDER_PARTIALLY_FILLED` | Order.filledQty updated |
| `ORDER_CANCELLED` | Order cancelled by user or session close |
| `SESSION_OPENED` | TradingSession status → TRADING_1 |
| `SESSION_CLOSED` | TradingSession status → CLOSED |
| `KYC_STATUS_CHANGED` | User verificationStatus updated |
| `SETTLEMENT_COMPLETE` | Settlement.status → SETTLEMENT_COMPLETE |
| `DISPUTE_OPENED` | TradeDispute created |
| `DISPUTE_RESOLVED` | TradeDispute resolved |

---

## 10. KYC & Compliance Backoffice

### KYC Workflow

```
User registers (GUEST)
    │
    ▼ submits documents
PENDING_VERIFICATION
    │
    ├── Compliance Officer reviews in /admin/kyc
    │
    ├── APPROVE → VERIFIED (can trade)
    │
    └── REJECT  → REJECTED (user can re-submit → PENDING_VERIFICATION)

VERIFIED → SUSPENDED (admin freezes account)
```

### Audit Log

Every state-changing admin action writes an immutable `AuditLog` entry:

```typescript
type AuditLog = {
  action:     AuditAction;   // e.g. KYC_STATUS_CHANGED, TRADE_CANCELLED, DISPUTE_RESOLVED
  entityType: string;        // "User", "Deal", "TradeDispute"
  entityId:   string;
  actorId:    string;        // Admin user who performed the action
  before:     Json;          // Previous state snapshot
  after:      Json;          // New state snapshot
  ip:         string;
  createdAt:  DateTime;
};
```

Critical events (surfaced via `GET /admin/audit/critical`): `ACCOUNT_SUSPENDED`, `TRADE_CANCELLED`, `DISPUTE_RESOLVED`, `KYC_BYPASS_ATTEMPT`, `SUPER_ADMIN_ACTION`, `MASS_CANCELLATION`.

---

## 11. Infrastructure & Deployment

### CI/CD Pipeline

```
PR opened
    └── ci.yml
          ├── ESLint + TypeScript type-check
          ├── Jest (apps/web — 63 tests)
          └── Jest (apps/api)

Push to main
    └── deploy.yml
          ├── [test gate: ci.yml must pass]
          ├── [parallel] Build API Docker image → GHCR
          ├── [parallel] Build Web Docker image → GHCR
          └── SSH deploy
                ├── git pull
                ├── docker compose pull
                ├── rolling restart (start-first, 1 at a time)
                └── prisma migrate deploy
```

### Docker Multi-Stage Builds

**API image layers:**
1. `deps` — `npm ci` only (cached layer, rarely changes)
2. `builder` — `prisma generate` + `nest build`
3. `runner` — distroless-like Alpine, non-root `nestjs:1001`, only `dist/` + `node_modules` + `prisma/`

**Web image layers:**
1. `deps` — `npm ci`
2. `builder` — `prisma generate` + `next build` (standalone output)
3. `runner` — only `.next/standalone`, `.next/static`, `public/` → minimal image

### PostgreSQL Production Tuning

```
shared_buffers        = 512MB      # 25% of 2GB RAM
effective_cache_size  = 1536MB     # 75% of 2GB RAM
maintenance_work_mem  = 128MB      # for VACUUM, CREATE INDEX
work_mem              = 4MB        # per sort/hash operation
max_connections       = 200        # Prisma pool: connection_limit=20 per instance
wal_buffers           = 16MB
checkpoint_completion_target = 0.9
random_page_cost      = 1.1        # SSD storage assumed
effective_io_concurrency = 200
log_min_duration_statement = 500   # log slow queries > 500ms
```

---

## 12. Observability

### Metrics (Prometheus)

Key metrics exposed at `GET /api/v1/metrics` (prom-client):

| Metric | Type | Description |
|--------|------|-------------|
| `http_request_duration_seconds` | Histogram | API latency by route |
| `http_requests_total` | Counter | Requests by status code |
| `eucx_orders_total` | Counter | Orders submitted |
| `eucx_deals_total` | Counter | Deals matched |
| `eucx_tvl_eur` | Gauge | Total Value Locked |
| `eucx_bullmq_queue_size` | Gauge | Queue depth by queue name |

### Dashboards (Grafana)

Pre-provisioned dashboard `eucx-overview-v1` ([monitoring/grafana/dashboards/eucx-overview.json](monitoring/grafana/dashboards/eucx-overview.json)):

- **API Performance:** p95/p99 latency, request rate by HTTP status
- **Trading Engine:** Order & deal throughput (per minute), TVL gauge, BullMQ queue depth
- **Infrastructure:** PostgreSQL connections (active vs max), Redis memory usage, host CPU

### Structured Logging (nestjs-pino)

All NestJS logs are JSON via pino. Each request log includes:
```json
{
  "level": "info",
  "time": 1234567890,
  "req": { "method": "POST", "url": "/api/v1/orders", "id": "uuid" },
  "res": { "statusCode": 201 },
  "responseTime": 23,
  "userId": "user-uuid",
  "orgId": "org-uuid"
}
```

---

## 13. Known Trade-offs & Tech Debt

| Item | Decision Made | Future Improvement |
|------|--------------|-------------------|
| **Single DB** | PostgreSQL for all (operational + analytics) | Separate read replica for OHLC queries |
| **Matching in BullMQ** | Simpler than in-memory order book | Migrate to Go-based matching engine (see `apps/api-go-backup/`) for HFT performance |
| **Advisory locks** | Per-session lock at PostgreSQL level | Redis-based distributed lock for multi-DB setup |
| **OHLC via cron** | Cron refresh every 1–60 min | Streaming OHLC via materialized views + NOTIFY |
| **Next.js + NestJS** | Two separate apps in monorepo | Next.js API routes as BFF could replace some NestJS endpoints |
| **No message broker** | BullMQ for all async work | Kafka/NATS for event sourcing at scale |
| **bcrypt cost 12** | Strong default | Consider Argon2id for new API key hashes |
| **15-minute SQL** | Manual FLOOR(EXTRACT/15) | `time_bucket` with TimescaleDB extension |

---

## 14. Roadmap 2027

### Phase 1 — Scale (Q3 2026)

**Kubernetes Migration**
- Helm chart for EUCX services (api, web, worker)
- HorizontalPodAutoscaler: scale API on CPU > 70% (target: 2–20 replicas)
- PostgreSQL: migrate to managed PgBouncer + connection pooling per pod
- Redis: Redis Cluster (3 primary + 3 replica) for BullMQ resilience
- ArgoCD for GitOps continuous deployment

**Multi-Region Database Sharding**
- Active-active read replicas in EU-WEST-1 (Frankfurt) and EU-CENTRAL-2 (Zurich)
- Products sharded by `productId % N` — each shard handles one commodity market
- Cross-shard deals (future: cross-commodity arbitrage) via 2-phase commit or saga pattern
- Neon branching for zero-downtime migrations

**Performance Targets after Phase 1:**
- Order submission p95 < 50ms
- Matching run for 10,000 orders < 200ms
- WebSocket fanout to 10,000 clients < 100ms

### Phase 2 — Mobile (Q4 2026)

**React Native (Expo) Apps — iOS & Android**
- Shared business logic via `packages/eucx-core` (Zod schemas, fee calculator, formatters)
- Real-time trading via `socket.io-client` — same WebSocket API as web
- Native push notifications: `TRADE_MATCHED` → iOS/APNs + Android/FCM via webhook → push gateway
- Biometric authentication (FaceID/TouchID) for order signing
- Offline order book: SQLite snapshot, sync on reconnect

**Existing API compatibility:** Mobile uses identical REST + WebSocket API. No API versioning change needed. Additional endpoint: `GET /api/v1/mobile/config` for feature flags, min-version enforcement.

### Phase 3 — ESG Expansion (Q2 2027)

**CO2 Certificate Integration for Metals**

New `CarbonCertificate` model linked to each `Product`:
```typescript
CarbonCertificate {
  id:               String
  productId:        String          // which commodity lot
  issuer:           String          // e.g. "Bureau Veritas"
  certificateNumber String          // @unique
  co2EquivalentKg:  Decimal(18,8)   // kg CO2e per ton of commodity
  vintageYear:      Int             // year of carbon data
  scope:            CarbonScope     // SCOPE_1 | SCOPE_2 | SCOPE_3
  verificationUrl:  String          // external registry link
  attachedAt:       DateTime
}
```

**ESG Score on Deals:**
- `Deal.esgScore` — computed from supplier CO2e + transport distance + certification status
- Buyers can filter order book by `maxCo2ePerTon`
- ESG reports via `/api/v1/admin/finance/esg` — monthly CO2e traded

**Regulatory Alignment:**
- EU Carbon Border Adjustment Mechanism (CBAM) reporting
- Export API for third-party ESG data platforms (Ecovadis, CDP)
- `WebhookEvent.CARBON_CERTIFICATE_ATTACHED` for ESG-focused integrations

---

---

## 15. Emergency Circuit Breaker & Kill Switch

### Konzept und Regulatorischer Hintergrund

Professionelle Börsen wie NYSE und CME betreiben mehrstufige Circuit Breaker als Pflicht-Mechanismus. Die CFTC-Empfehlungen ("Best Practices for Exchange Volatility Control Mechanisms", Sept. 2023) definieren:

- **Market-Wide Circuit Breaker (MWCB):** NYSE Level 1 (7%), Level 2 (13%), Level 3 (20%) — Preis-Trigger lösen Handelspausen aus
- **Price Limit Bands (CME):** Produkt-spezifische obere/untere Preisschranken; Orders außerhalb werden abgelehnt
- **Global Kill Switch:** Vollständiger Handelsstopp — aktiviert bei Systemanomalien, Cyberangriffen, oder regulatorischen Anordnungen

EUCX implementiert alle drei Ebenen über einen einheitlichen Redis-basierten Mechanismus.

### Drei-Stufen-Architektur

```
Ebene 1 — Global Halt (Kill Switch)
  Redis-Key: trading_halt:all
  Wirkung:   Alle POST/PATCH-Orders abgelehnt (HTTP 503)
             Alle aktiven TradingSessions → status=FINAL (eingefroren)
             BullMQ MATCHING-Jobs pausiert
  Aktivierung: Admin-API oder direkter Redis-Befehl (Break-Glass)
  TTL:         Standard 3600s (1h), konfigurierbar, 0 = unbegrenzt

Ebene 2 — Produkt-Halt (Circuit Breaker)
  Redis-Key: trading_halt:{productId}
  Wirkung:   Orders für dieses Produkt abgelehnt
             Andere Produkte unberührt
  TTL:       Standard 900s (15min), konfigurierbar

Ebene 3 — Preis-Band-Verletzung (Price Limit)
  Logik:     Matching Engine prüft |matchPrice - referencePrice| / referencePrice
  Trigger:   Überschreitung der Schranke → Order abgelehnt, Produkt-Halt ausgelöst
  Schranken: ±5% (Standard), ±10% (Volatile Session), konfigurierbar
```

### Kill Switch Guard — Implementierung

```typescript
// apps/api/src/common/guards/trading-halt.guard.ts
// → Vollständiger Code: apps/api/src/common/guards/trading-halt.guard.ts

@Injectable()
export class TradingHaltGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Admin-Routen + GET immer zulassen
    if (request.method === "GET")        return true;
    if (request.url?.includes("/admin/")) return true;

    // Globaler Halt
    const globalHalt = await this.redis.get("trading_halt:all");
    if (globalHalt) {
      await this.logHaltAttempt(request, "GLOBAL_HALT", "all");
      throw new ServiceUnavailableException({
        error: "TRADING_HALTED",
        message: "Der Handel ist derzeit eingefroren.",
        code: 503,
      });
    }

    // Produktspezifischer Halt
    const productId = request.body?.productId;
    if (productId) {
      const productHalt = await this.redis.get(`trading_halt:${productId}`);
      if (productHalt) throw new ServiceUnavailableException(...);
    }

    return true;
  }
}
```

### Anwendung des Guards

```typescript
// Global in main.ts oder AppModule registrieren:
app.useGlobalGuards(new TradingHaltGuard(reflector, prisma, redis));

// Oder per Controller (nach JwtAuthGuard):
@UseGuards(JwtAuthGuard, KycVerifiedGuard, TradingHaltGuard)
@Controller("api/v1/orders")
export class OrdersController { ... }

// Admin-Endpunkte überspringen den Halt:
@SkipTradingHalt()
@Controller("api/v1/admin")
export class AdminController { ... }
```

### Kill Switch Aktivierung (Befehlskette)

```bash
# ── Option A: Admin-API (bevorzugt — erzeugt AuditLog) ────────────────────────
curl -X POST https://api.eucx.exchange/api/v1/admin/trading-halt/global \
  -H "Authorization: Bearer $SUPER_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"reason": "Systemanomalie: Preisspike >20% in 60s", "durationSeconds": 3600}'

# Produkt-spezifischer Halt (15 Minuten):
curl -X POST https://api.eucx.exchange/api/v1/admin/trading-halt/copper-grade-a \
  -H "Authorization: Bearer $SUPER_ADMIN_TOKEN" \
  -d '{"reason": "Circuit Breaker ausgelöst: ±5% Band überschritten", "durationSeconds": 900}'

# Halt aufheben:
curl -X DELETE https://api.eucx.exchange/api/v1/admin/trading-halt/global \
  -H "Authorization: Bearer $SUPER_ADMIN_TOKEN"

# ── Option B: Break-Glass (direkt Redis — kein Token nötig) ───────────────────
docker compose -f docker-compose.prod.yml exec redis \
  redis-cli -a "$REDIS_PASSWORD" SET trading_halt:all "emergency" EX 3600

# Sofort aufheben:
docker compose -f docker-compose.prod.yml exec redis \
  redis-cli -a "$REDIS_PASSWORD" DEL trading_halt:all
```

### BullMQ Matching-Engine Integration

```typescript
// MatchingProcessor prüft Halt vor der Advisory-Lock-Transaktion:
async processSession(sessionId: string): Promise<void> {
  const halt = await this.redis.get("trading_halt:all");
  if (halt) {
    this.logger.warn(`[MatchingEngine] Global halt aktiv — Session ${sessionId} pausiert`);
    return; // Job wird als "completed" markiert, nicht failed → kein Retry-Storm
  }
  // ... normale Matching-Logik
}
```

### Socket.IO Broadcast bei Halt

```typescript
// Alle verbundenen Clients werden sofort informiert:
this.server.to("public").emit("trading:halt", {
  type:      halted ? "HALTED" : "RESUMED",
  scope:     "global" | productId,
  reason:    dto.reason,
  timestamp: Date.now(),
  resumeAt:  ttl > 0 ? Date.now() + ttl * 1000 : null,
});
```

### Preis-Band Circuit Breaker (Level 3)

```typescript
// In computeMatch() — wird vor dem Deal-Create aufgerufen:
function checkPriceBand(
  matchPrice: Decimal,
  referencePrice: Decimal,
  bandPct: number = 5,
): "OK" | "CIRCUIT_BREAKER" {
  const deviation = matchPrice.minus(referencePrice).abs()
    .div(referencePrice).times(100);
  return deviation.gt(bandPct) ? "CIRCUIT_BREAKER" : "OK";
}

// Bei Auslösung:
// 1. Deal wird NICHT erstellt
// 2. Redis: SET trading_halt:{productId} "price_band_breach" EX 900
// 3. AuditLog: CIRCUIT_BREAKER_TRIGGERED
// 4. Socket.IO broadcast
// 5. Admin-Alert (Email/Grafana)
```

---

## 16. Market Maker Policy & Liquidity Management

### Market Maker Konzept

Market Maker (Liquiditätsgeber) stellen kontinuierlich Bid/Ask-Orders, um Liquidität sicherzustellen. Sie unterliegen besonderen Regeln und müssen in der Datenbank identifizierbar sein.

### Datenbankmodell: `isMarketMaker`-Flag

```prisma
// Ergänzung zu apps/web/prisma/schema.prisma — User-Modell:
model User {
  // ... bestehende Felder ...
  isMarketMaker     Boolean   @default(false)
  marketMakerSince  DateTime?
  marketMakerNotes  String?   // interne Notizen (nicht öffentlich)
}
```

```sql
-- Migration: Market Maker Flag setzen
UPDATE users SET is_market_maker = true,
  market_maker_since = NOW(),
  market_maker_notes = 'Approved by compliance 2026-03-16 — spread ≤1%, vol ≥500t/day'
WHERE id = 'user-uuid';
```

### Market Maker Obligations (Vertragliche Pflichten)

| Pflicht | Standard | Konsequenz bei Verstoß |
|---------|---------|----------------------|
| Maximaler Spread | ≤ 1.0% | Warnung → Suspendierung MM-Status |
| Mindest-Volumen | ≥ 500 t/Tag | Entzug MM-Konditionen |
| Mindest-Uptime | ≥ 80% der Trading-Zeit | Warnung nach 3 Tagen |
| Max. Stornoquote | ≤ 30% der platzierten Orders | Compliance-Review |

### Public Disclosure Policy (Transparenz-Compliance)

**Regulatorische Grundlage:** MiFID II Art. 17 + 48, EMIR, MAR (Market Abuse Regulation) erfordern Transparenz über algorithmischen Handel und Market-Making-Aktivitäten.

#### Was muss offengelegt werden?

```
MUSS offengelegt werden (Pflicht):
  - Dass Market-Maker-Orders existieren (Systeminfo im API, nicht per Order)
  - Market-Making-Vereinbarung mit der Börse (auf Anfrage, regulatorisch)
  - Volumen-Statistiken pro Produktkategorie (aggregiert, kein Trader-ID)

DARF NICHT offengelegt werden (Schutz):
  - Welche spezifische Order von einem Market Maker stammt
  - Identität des Market Makers (für andere Trader)
  - Interne Strategie / Algorithmus-Parameter

EMPFOHLEN (Best Practice):
  - Allgemeiner Hinweis in der Marktinfrastruktur-Dokumentation:
    "EUCX kooperiert mit zugelassenen Market Makern zur Liquiditätssicherung."
  - Aggregierter Anteil von MM-Volumen am Gesamtvolumen (anonym, monatlich)
```

#### API-Darstellung von Market-Maker-Orders

```typescript
// OrderBook-Response: isMarketMaker wird NICHT exponiert
// Trader sehen alle Orders identisch — kein isBot-Flag in der API
interface OrderBookEntry {
  price:    string;   // sichtbar
  quantity: string;   // sichtbar
  count:    number;   // Anzahl Orders auf diesem Preisniveau (aggregiert)
  // isMarketMaker: NEVER expose — violates MAR Article 12
}

// Intern im Admin-Backoffice (COMPLIANCE_OFFICER+):
interface AdminOrderBookEntry extends OrderBookEntry {
  isMarketMaker: boolean;   // nur für Compliance-Zwecke
  userId:        string;
}
```

### Market Maker Monitoring (Grafana)

Zusätzliche Prometheus-Metriken:

| Metric | Type | Beschreibung |
|--------|------|-------------|
| `eucx_mm_spread_pct{productId}` | Gauge | Aktueller MM-Spread in % |
| `eucx_mm_volume_daily{userId}` | Counter | Tages-Volumen des MMs |
| `eucx_mm_order_cancel_rate` | Gauge | Stornoquote (letzte 24h) |
| `eucx_mm_uptime_pct` | Gauge | Uptime-Prozentsatz |

---

## 17. Disaster Recovery & Data Integrity

### Backup-Strategie (3-2-1-Regel)

```
3 Kopien der Daten:
  1. Primäre PostgreSQL-Datenbank (live)
  2. WAL-Archiv auf S3 (kontinuierlich)
  3. Weekly Full Backup auf separatem Cloud-Provider

2 unterschiedliche Medien:
  - NVMe SSD (primary)
  - Object Storage S3 (archive)

1 Offsite-Kopie:
  - S3-Bucket in anderer AWS-Region (EU-WEST-1 ↔ EU-CENTRAL-1)
```

### PostgreSQL WAL-Archivierung (PITR-Konfiguration)

PostgreSQL Point-in-Time Recovery (PITR) ermöglicht die Wiederherstellung auf jeden Zeitpunkt seit dem letzten Base-Backup. Grundlage: [PostgreSQL Docs — Continuous Archiving](https://www.postgresql.org/docs/current/continuous-archiving.html)

```ini
# /etc/postgresql/postgresql.conf (Ergänzungen für PITR)
wal_level             = replica      # WAL enthält alle Änderungen
archive_mode          = on           # WAL-Archivierung aktivieren

# KRITISCH: archive_command darf NICHT überschreiben (Datenverlust-Schutz)
# Exit code 0 = Erfolg (PostgreSQL löscht Segment), Non-zero = Retry
archive_command       = 'test ! -f /backup/wal/%f && aws s3 cp %p s3://eucx-wal-archive/wal/%f'
archive_timeout       = 300          # Spätestens alle 5min archivieren (max. 5min Datenverlust)
max_wal_size          = 1GB          # Verhindert wal/ Überlauf
min_wal_size          = 80MB

restore_command       = 'aws s3 cp s3://eucx-wal-archive/wal/%f %p'
recovery_target_time  = ''           # Wird beim Restore gesetzt
recovery_target_timeline = 'latest'  # Folgt dem letzten Timeline nach mehreren Restores
recovery_target_action   = 'promote' # Nach Erreichen des Targets: in Normal-Betrieb wechseln
```

```bash
# Base Backup täglich (cron job auf DB-Server):
# 02:00 Uhr täglich
pg_basebackup \
  --host=localhost \
  --username=eucx \
  --pgdata=/backup/base/$(date +%Y%m%d) \
  --wal-method=stream \
  --checkpoint=fast \
  --manifest-checksums=sha256 \
  --progress \
  --verbose

# Backup nach S3 hochladen:
aws s3 sync /backup/base/$(date +%Y%m%d) \
  s3://eucx-backups/base/$(date +%Y%m%d)/ \
  --storage-class STANDARD_IA

# Backup-Integrität prüfen (pg_verifybackup):
pg_verifybackup /backup/base/$(date +%Y%m%d)
# Prüft: Manifest, Dateichecksums (SHA-256), WAL-Vollständigkeit
```

### Backup-Verifikation vor dem Start (pg_verifybackup)

```bash
# pg_verifybackup prüft 4 Stufen (PostgreSQL 16 Docs):
# 1. Manifest lesen (Integrität der backup_manifest-Datei)
# 2. Dateichecksums (SHA-256 aller Datenbankdateien)
# 3. WAL-Vollständigkeit (alle WAL-Segmente für Recovery vorhanden)
# 4. Manifest-Signatur (falls signiert)
pg_verifybackup /restore/base/
# EXPECTED: "backup successfully verified"
# Wichtig: muss VOR dem ersten Start ausgeführt werden

# Nach dem Restore: pg_controldata prüfen ob WAL-Replay erfolgreich:
pg_controldata /restore/base/ | grep -E "state|checkpoint|WAL"
# EXPECTED: "Database cluster state: in production" (nach promote)
```

### Ledger-Integritätsprüfung nach Restore

```sql
-- 1. Double-Entry-Invariante: MUSS 0.00000000 ergeben
SELECT
  ABS(
    COALESCE(SUM(CASE WHEN entry_type = 'DEBIT'  THEN amount END), 0) -
    COALESCE(SUM(CASE WHEN entry_type = 'CREDIT' THEN amount END), 0)
  ) AS ledger_delta
FROM ledger_entries
WHERE deal_id IS NOT NULL;
-- EXPECTED: 0.00000000 (Toleranz: < 0.00000001)

-- 2. Jeder Deal muss ausgeglichene Einträge haben
SELECT
  deal_id,
  SUM(CASE WHEN entry_type = 'DEBIT'  THEN amount ELSE 0 END) AS total_debit,
  SUM(CASE WHEN entry_type = 'CREDIT' THEN amount ELSE 0 END) AS total_credit,
  ABS(
    SUM(CASE WHEN entry_type = 'DEBIT'  THEN amount ELSE 0 END) -
    SUM(CASE WHEN entry_type = 'CREDIT' THEN amount ELSE 0 END)
  ) AS delta
FROM ledger_entries
GROUP BY deal_id
HAVING ABS(
  SUM(CASE WHEN entry_type = 'DEBIT'  THEN amount ELSE 0 END) -
  SUM(CASE WHEN entry_type = 'CREDIT' THEN amount ELSE 0 END)
) > 0.00000001
ORDER BY delta DESC;
-- EXPECTED: 0 Zeilen (keine unausgeglichenen Deals)

-- 3. Storno-Vollständigkeit: Jedes STORNO muss ein Original haben
SELECT storno.correlation_id, storno.amount
FROM ledger_entries storno
WHERE storno.correlation_id LIKE 'STORNO-%'
  AND NOT EXISTS (
    SELECT 1 FROM ledger_entries orig
    WHERE orig.correlation_id =
      REPLACE(storno.correlation_id, 'STORNO-', '')
  );
-- EXPECTED: 0 Zeilen (verwaiste Stornos weisen auf Restore-Fehler hin)

-- 4. Prüfsumme des gesamten Ledgers (für Vergleich vor/nach Restore)
SELECT MD5(STRING_AGG(
  deal_id || entry_type || amount::TEXT,
  '|' ORDER BY id
)) AS ledger_checksum
FROM ledger_entries
WHERE created_at < '2026-03-16 00:00:00';  -- Restore-Zeitpunkt
```

---

## 18. Access Control & Infrastructure Hardening

### Admin-API IP-Whitelisting (Nginx)

```nginx
# nginx/eucx.conf — Admin-Endpunkte absichern
location ~ ^/api/v1/admin {
    # Nur Operations-Team und VPN-Range
    allow 10.0.0.0/8;        # VPN-Netz
    allow 203.0.113.0/24;    # Office-IP-Range (ERSETZEN)
    deny  all;               # Alles andere geblockt → 403

    proxy_pass         http://eucx_api;
    proxy_http_version 1.1;
    proxy_set_header   Host $host;
    proxy_set_header   X-Real-IP $remote_addr;
    proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header   X-Forwarded-Proto $scheme;
}
```

### VPN-Pflicht für sensitive Systeme

```
Systeme mit VPN-Zwang (WireGuard / OpenVPN):
  ├── Grafana (grafana.eucx.exchange) — Monitoring-Daten
  ├── PostgreSQL direkt (:5432) — niemals public exponieren
  ├── Redis direkt (:6379) — niemals public exponieren
  └── Admin-API (/api/v1/admin) — via Nginx IP-Whitelist

WireGuard-Server auf dem Production-Host:
  # /etc/wireguard/wg0.conf
  [Interface]
  Address    = 10.100.0.1/24
  ListenPort = 51820
  PrivateKey = <server-private-key>

  # Jedes Team-Mitglied bekommt einen dedizierten Peer:
  [Peer]
  PublicKey  = <engineer-public-key>
  AllowedIPs = 10.100.0.2/32
```

### Datenbank-GUI Absicherung (pgAdmin / DBeaver)

```bash
# Option A: SSH-Tunnel (empfohlen — kein offener Port)
ssh -L 5433:localhost:5432 deploy@eucx.server.ip
# Dann: psql -h localhost -p 5433 -U eucx

# Option B: pgAdmin im Docker, nur auf VPN-Interface binden
docker run -d \
  --name pgadmin \
  --network eucx_internal \
  -e PGADMIN_DEFAULT_EMAIL=admin@eucx.exchange \
  -e PGADMIN_DEFAULT_PASSWORD="$PGADMIN_PASSWORD" \
  -p 10.100.0.1:5050:80 \  # Nur auf WireGuard-Interface
  dpage/pgadmin4
```

### Secrets Management (Production Hardening)

```
Empfohlene Secrets-Hierarchie:

Stufe 1 — NIEMALS in Git:
  .env.production, private keys, DB-Passwörter

Stufe 2 — GitHub Actions Secrets:
  DEPLOY_SSH_KEY, DEPLOY_HOST, NEXTAUTH_URL

Stufe 3 — HashiCorp Vault (Phase 1 Ziel):
  JWT_SECRET, WEBHOOK_SECRET rotierbar ohne Downtime
  Dynamic DB credentials (Vault PostgreSQL plugin)
  Automatic secret rotation alle 30 Tage

Aktueller Stand:
  .env.production auf Server (600 permissions, nur deploy-user lesbar)
  Rotation: manuell, dokumentiert in HANDOFF-CHECKLIST.md
```

### Security Monitoring (Grafana Alerts)

| Alert | Schwellwert | Reaktion |
|-------|------------|---------|
| Admin-Login außerhalb VPN | Jede Anfrage ohne VPN-IP | Sofort: Sicherheits-Email |
| Fehlgeschlagene Logins | > 5 in 1 Minute / IP | IP automatisch sperren (fail2ban) |
| KYC_BYPASS_ATTEMPT | Jeder einzelne | Compliance-Email |
| Trading Halt aktiviert | Jede Aktivierung | PagerDuty/On-Call |
| Ledger-Delta ≠ 0 | Delta > 0.00000001 | KRITISCH: Trading sofort stoppen |

```bash
# fail2ban für NestJS Auth-Endpunkte (aus Nginx access.log):
# /etc/fail2ban/jail.d/eucx-auth.conf
[eucx-auth]
enabled  = true
port     = http,https
filter   = eucx-auth
logpath  = /var/log/nginx/access.log
maxretry = 5
findtime = 60
bantime  = 1800  # 30 Minuten Sperre
```

---

*Architecture document version 1.1 — EUCX CTO Office, March 2026.*
*Ergänzungen: Kill Switch (§15), Market Maker Policy (§16), Disaster Recovery (§17), Hardening (§18).*
*Next review: Phase 1 launch (Q3 2026).*
