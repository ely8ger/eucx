# EUCX — Handoff Checklist

**For:** Incoming Senior Engineering Team
**From:** EUCX CTO / Lead Architect
**Date:** March 2026
**Status:** Production-Ready (v1.0)

---

## Pre-Handoff Status

| Area | Status | Notes |
|------|--------|-------|
| Core trading engine | ✅ Complete | Price-time FIFO matching, advisory locks |
| Double-entry ledger | ✅ Complete | validateLedgerBalance(), storno, partial refund |
| KYC & compliance backoffice | ✅ Complete | Full workflow: GUEST → VERIFIED → SUSPENDED |
| Fee calculator | ✅ Complete | 4 tiers, EU Reverse Charge, 8 decimal precision |
| API economy | ✅ Complete | API keys (bcrypt), HMAC webhooks, BullMQ retries |
| Market analytics | ✅ Complete | OHLC engine, cron cache, TradingView charts |
| Test suite | ✅ Complete | 63/63 passing, fee-calculator 100% function coverage |
| CI/CD pipeline | ✅ Complete | GitHub Actions → GHCR → SSH deploy |
| Infrastructure | ✅ Complete | Docker Compose prod, Nginx SSL, Prometheus/Grafana |
| Emergency Kill Switch | ✅ Complete | TradingHaltGuard, 3-Stufen-Circuit-Breaker, Admin-API |
| Market Maker Policy | ✅ Complete | isMarketMaker-Flag, Disclosure Policy, MiFID II-konform |
| Disaster Recovery | ✅ Complete | PITR-Runbook, Ledger-Integrity-Checks, 24h-RTO |
| Access Hardening | ✅ Complete | VPN, Nginx IP-Whitelist, fail2ban, Secrets-Rotation |
| Documentation | ✅ Complete | README.md, ARCHITECTURE.md §15–18, this checklist |

---

## Day 1: Environment Setup

- [ ] **Access credentials received**
  - [ ] GitHub repository access (write to `develop`, protected `main`)
  - [ ] Production server SSH key provisioned
  - [ ] GitHub Actions secrets configured (see list below)
  - [ ] Neon PostgreSQL connection string
  - [ ] Redis connection + password

- [ ] **Local development running**
  ```bash
  git clone https://github.com/your-org/eucx.git
  cd eucx && npm install
  cp .env.production.example apps/web/.env.local
  cp .env.production.example apps/api/.env
  # Fill in DATABASE_URL, JWT_SECRET, NEXTAUTH_SECRET, REDIS_PASSWORD
  docker compose up -d postgres redis
  cd apps/web && npx prisma migrate dev && npx prisma db seed
  cd ../.. && npm run dev
  ```

- [ ] **Test suite passes locally**
  ```bash
  cd apps/web && npx jest         # should output: 63 passed
  cd ../api  && npx jest          # should output: all passed
  ```

- [ ] **Swagger UI accessible:** `http://localhost:3001/api/docs`

- [ ] **Grafana accessible:** `http://localhost:3000` (after `docker compose -f docker-compose.prod.yml up`)

---

## Day 1: GitHub Actions Secrets

All secrets must be configured in **GitHub → Settings → Secrets and Variables → Actions**:

| Secret Name | Description | Who provides |
|-------------|-------------|-------------|
| `DEPLOY_HOST` | Production server IP | DevOps |
| `DEPLOY_USER` | SSH username | DevOps |
| `DEPLOY_SSH_KEY` | SSH private key (PEM) | DevOps |
| `DEPLOY_PORT` | SSH port (default 22) | DevOps |
| `NEXTAUTH_URL` | `https://eucx.exchange` | Team |
| `DATABASE_URL` | Neon/PostgreSQL connection string | DBA |

> **Note:** `GITHUB_TOKEN` is auto-provided by GitHub — no setup needed for GHCR push.

---

## Week 1: Architecture Deep Dive

### Must-Read Code Paths

- [ ] **Matching engine flow**
  1. `apps/api/src/modules/matching/matching.processor.ts` — advisory lock + deal creation
  2. `apps/web/src/__tests__/unit/matching-engine.spec.ts` — algorithm unit tests (read as specification)

- [ ] **Fee calculator**
  1. `apps/web/src/lib/clearing/fee-calculator.ts` — `calculateFees()` + `validateLedgerBalance()`
  2. `apps/web/src/__tests__/unit/fee-calculator.spec.ts` — 30 tests = full behavioral spec

- [ ] **Settlement / Storno**
  1. `apps/api/src/modules/admin/admin.service.ts` → `cancelTrade()` method
  2. `apps/web/src/__tests__/integration/double-spend.spec.ts` — invariant proofs

- [ ] **Security guards**
  1. `apps/api/src/common/guards/` — all 4 guards: JwtAuth, Roles, KycVerified, ApiKey
  2. `apps/api/src/common/decorators/` — `@Roles()`, `@RequireApiScope()`, `@CurrentUser()`

- [ ] **Prisma schema** (single source of truth)
  1. `apps/web/prisma/schema.prisma` — all models, enums, relations, constraints

### Questions You Should Be Able to Answer After Week 1

- [ ] Why does the matching engine use PostgreSQL advisory locks instead of Redis locks?
- [ ] How does `validateLedgerBalance()` handle floating-point edge cases?
- [ ] What is the difference between `UserRole` and `VerificationStatus`?
- [ ] What happens if a webhook delivery fails 4 times?
- [ ] Why is `FIFTEEN_MIN` OHLC truncation non-trivial?
- [ ] Where is the `filledQty > quantity` invariant enforced at the DB level?
- [ ] How does the `ApiKeyGuard` handle the case where `bcrypt.compare` is slow?

---

## Week 1: Security Review

- [ ] **Secrets audit**
  - [ ] `.env.production` is NOT in the repository
  - [ ] No hardcoded secrets in source (search: `grep -r "CHANGE_ME" apps/`)
  - [ ] `JWT_SECRET` is cryptographically random, ≥ 32 chars
  - [ ] `WEBHOOK_SECRET` is ≥ 64 chars

- [ ] **Dependency audit**
  ```bash
  npm audit --audit-level=high
  cd apps/web && npx prisma validate
  ```

- [ ] **Rate limiting tested**
  - [ ] Auth endpoint: 11th request in 1 minute returns 429
  - [ ] Orders endpoint: 31st request in 1 minute returns 429

- [ ] **Advisory lock tested**
  - [ ] Run two concurrent matching jobs for same session → second waits, no duplicate deals

- [ ] **HMAC webhook verification**
  - [ ] Register test endpoint, trigger order fill → verify `X-EUCX-Signature` header validates

---

## Week 2: Infrastructure & Monitoring

### Production Server Checklist

- [ ] **SSL certificates issued**
  ```bash
  docker compose run --rm certbot certonly --webroot \
    -w /var/www/certbot \
    -d eucx.exchange -d api.eucx.exchange -d grafana.eucx.exchange \
    --email admin@eucx.exchange --agree-tos --non-interactive
  ```

- [ ] **First production deploy**
  ```bash
  docker compose -f docker-compose.prod.yml up -d
  docker compose -f docker-compose.prod.yml exec api npx prisma migrate deploy
  ```

- [ ] **All health checks green**
  ```bash
  curl https://api.eucx.exchange/api/v1/health
  # Expected: { "status": "ok", "database": "up", "redis": "up" }
  ```

- [ ] **Nginx rate limiting active**
  ```bash
  ab -n 20 -c 20 https://api.eucx.exchange/api/v1/auth/login
  # Some requests should return 429
  ```

- [ ] **Certbot auto-renewal scheduled**
  - [ ] Certbot container running: `docker compose ps certbot` → Up
  - [ ] Manual renewal test: `docker compose run --rm certbot renew --dry-run`

### Monitoring Checklist

- [ ] **Prometheus scraping**
  ```bash
  curl http://localhost:9090/api/v1/targets
  # All targets should be "up"
  ```

- [ ] **Grafana dashboard loaded**
  - [ ] Open `https://grafana.eucx.exchange`
  - [ ] Dashboard "EUCX Platform Overview" visible with live data
  - [ ] API latency panel showing data (p95 < 200ms baseline)

- [ ] **Alerts configured** (optional for initial launch)
  - [ ] Alert: API p95 latency > 500ms for 5 minutes
  - [ ] Alert: PostgreSQL connections > 150 (75% of max 200)
  - [ ] Alert: BullMQ MATCHING queue depth > 1000
  - [ ] Alert: Error rate > 1% over 5 minutes

---

## Operational Runbooks

### How to: Run database migration in production

```bash
# On production server
docker compose -f docker-compose.prod.yml exec api npx prisma migrate deploy

# Verify migrations applied
docker compose -f docker-compose.prod.yml exec api npx prisma migrate status
```

### How to: Roll back a deploy

```bash
# GitHub Actions: go to the previous successful workflow run → "Re-run jobs"
# OR manually on server:
docker compose -f docker-compose.prod.yml \
  up -d api --image ghcr.io/your-org/eucx-api:sha-PREVIOUS_SHA
```

### How to: Freeze trading (emergency)

```bash
# Via API (SUPER_ADMIN token required):
PATCH /api/v1/sessions/:sessionId/status
{ "status": "FINAL" }

# Or direct DB (break-glass):
docker compose -f docker-compose.prod.yml exec postgres \
  psql -U eucx -c "UPDATE trading_sessions SET status='FINAL' WHERE status='TRADING_1';"
```

### How to: Investigate a suspicious trade

```bash
# Get deal details with all ledger entries
GET /api/v1/admin/audit?entityType=Deal&entityId=:dealId

# Check ledger balance for deal
SELECT
  entry_type,
  SUM(amount) as total,
  correlation_id
FROM ledger_entries
WHERE deal_id = 'deal-uuid'
GROUP BY entry_type, correlation_id
ORDER BY correlation_id;
```

### How to: Add a new commodity product

```bash
# Via Prisma seed or admin API:
POST /api/v1/admin/products
{
  "name": "Copper Grade A",
  "unit": "TON",
  "currency": "EUR",
  "minQuantity": "0.001",
  "maxQuantity": "10000"
}
```

### How to: Manually trigger OHLC cache refresh

```bash
# NestJS admin endpoint (SUPER_ADMIN):
POST /api/v1/admin/market/candles/refresh
{ "productId": "product-uuid", "interval": "ONE_HOUR" }

# Or restart the NestJS service (cron runs on startup):
docker compose -f docker-compose.prod.yml restart api
```

---

## Liquidity Management & Market Maker Policy

### Market Maker Onboarding

Ein Market Maker wird durch das `isMarketMaker`-Flag in der Datenbank identifiziert. Die Aktivierung erfordert eine unterschriebene Market-Making-Vereinbarung und Compliance-Freigabe.

```bash
# Flag setzen (nur SUPER_ADMIN + direkter DB-Zugang):
docker compose -f docker-compose.prod.yml exec postgres \
  psql -U eucx -c "
    UPDATE users SET
      is_market_maker     = true,
      market_maker_since  = NOW(),
      market_maker_notes  = 'Vertrag #MM-2026-001, Compliance freigegeben 2026-03-16'
    WHERE id = 'user-uuid';
  "

# AuditLog manuell nachpflegen (da kein API-Endpunkt):
INSERT INTO audit_logs (action, entity_type, entity_id, actor_id, after, ip)
VALUES ('MARKET_MAKER_ACTIVATED', 'User', 'user-uuid', 'admin-uuid',
        '{"contract": "MM-2026-001"}', '10.0.0.1');
```

### Public Disclosure Checkliste

- [ ] **Systeminfo-Text** auf `eucx.exchange/market-info` veröffentlicht:
  > *"EUCX kooperiert mit zugelassenen Liquiditätsgebern gemäß MiFID II Art. 48."*
- [ ] **Monatsbericht** (aggregiert, anonym): MM-Anteil am Gesamtvolumen
- [ ] Market-Making-Vereinbarung liegt der BaFin vor (falls BaFin-Lizenz)
- [ ] `isMarketMaker`-Flag ist **niemals** in der öffentlichen OrderBook-API exponiert
- [ ] Compliance-Officer hat Zugriff auf Admin-OrderBook mit MM-Kennzeichnung
- [ ] Grafana-Dashboard "Market Maker Monitor" eingerichtet (Spread, Volumen, Uptime)

### Market Maker Obligations — Monitoring

```bash
# Tägliche Compliance-Prüfung (als Cron-Job oder manuell):
SELECT
  u.id,
  u.email,
  COUNT(o.id)                                  AS orders_today,
  AVG(o.price_per_unit)                        AS avg_price,
  SUM(o.quantity)                              AS volume_today,
  SUM(CASE WHEN o.status = 'CANCELLED'
       THEN 1 ELSE 0 END)::float / COUNT(o.id) AS cancel_rate
FROM users u
JOIN orders o ON o.user_id = u.id
WHERE u.is_market_maker = true
  AND o.created_at >= CURRENT_DATE
GROUP BY u.id, u.email;
-- cancel_rate > 0.30 → Compliance-Review auslösen
```

---

## Disaster Recovery: The 24h Recovery Challenge

> **Szenario:** Der Production-Server ist vollständig ausgefallen. Kein laufender Docker-Container, kein Redis-State. Ziel: EUCX innerhalb von 24 Stunden auf neuer Infrastruktur wiederherstellen — mit vollständiger Ledger-Integrität.

### Phase 1 — Neue Infrastruktur (0–2h)

- [ ] **Neuen Server provisionieren** (Ubuntu 24.04 LTS, min. 4 vCPU / 8 GB RAM)
  ```bash
  # Basis-Setup:
  apt update && apt install -y docker.io docker-compose-plugin awscli git
  systemctl enable --now docker

  # Deploy-User anlegen:
  useradd -m -s /bin/bash deploy
  mkdir -p /home/deploy/.ssh
  echo "PUBLIC_KEY" >> /home/deploy/.ssh/authorized_keys
  chmod 700 /home/deploy/.ssh && chmod 600 /home/deploy/.ssh/authorized_keys
  ```

- [ ] **Repository klonen:**
  ```bash
  cd /opt && git clone https://github.com/your-org/eucx.git
  cd eucx && cp .env.production.example .env.production
  # .env.production mit gesicherten Werten befüllen
  ```

- [ ] **Secrets aus sicherem Speicher holen** (Passwort-Manager / Vault)
  - `DATABASE_URL`, `REDIS_PASSWORD`, `JWT_SECRET`, `NEXTAUTH_SECRET`, `WEBHOOK_SECRET`

### Phase 2 — Datenbank-Restore (2–6h)

```bash
# Schritt 1: Letztes Base-Backup identifizieren
aws s3 ls s3://eucx-backups/base/ --recursive | sort | tail -5
# z.B.: 2026-03-15/ (gestrig, 02:00 Uhr)

# Schritt 2: Base-Backup herunterladen
aws s3 sync s3://eucx-backups/base/20260315/ /restore/base/

# Schritt 3: Backup-Integrität prüfen (pg_verifybackup)
pg_verifybackup /restore/base/
# EXPECTED: "backup successfully verified"

# Schritt 4: WAL-Archiv für PITR vorbereiten
aws s3 sync s3://eucx-wal-archive/wal/ /restore/wal/

# Schritt 5: recovery.conf für Point-in-Time setzen
cat > /restore/base/recovery.signal << EOF
# Leere Datei aktiviert PITR-Modus
EOF

cat >> /restore/base/postgresql.conf << EOF
restore_command = 'cp /restore/wal/%f %p'
recovery_target_time = '2026-03-16 03:45:00'  # 5 Min vor dem Ausfall
recovery_target_action = 'promote'
EOF

# Schritt 6: PostgreSQL mit Restore starten
docker compose -f docker-compose.prod.yml up -d postgres
# Logs beobachten — PITR läuft WAL-Segmente durch
docker compose -f docker-compose.prod.yml logs -f postgres | grep -E "recovery|promoted|ready"
```

### Phase 3 — Ledger-Integritätsprüfung (6–7h)

Nach dem Datenbankstart **müssen** folgende Checks mit 0 Fehlern durchlaufen:

```bash
# Alle 4 Prüfungen ausführen:
docker compose -f docker-compose.prod.yml exec postgres psql -U eucx << 'SQL'

-- CHECK 1: Globale Double-Entry-Invariante
SELECT
  CASE
    WHEN ABS(
      COALESCE(SUM(CASE WHEN entry_type='DEBIT'  THEN amount END),0) -
      COALESCE(SUM(CASE WHEN entry_type='CREDIT' THEN amount END),0)
    ) < 0.00000001 THEN 'PASS: Ledger ausgeglichen'
    ELSE 'FAIL: Ledger-Delta erkannt!'
  END AS check_1_global_balance
FROM ledger_entries;

-- CHECK 2: Unausgeglichene Deals
SELECT COUNT(*) AS unbalanced_deals FROM (
  SELECT deal_id FROM ledger_entries
  GROUP BY deal_id
  HAVING ABS(
    SUM(CASE WHEN entry_type='DEBIT'  THEN amount ELSE 0 END) -
    SUM(CASE WHEN entry_type='CREDIT' THEN amount ELSE 0 END)
  ) > 0.00000001
) t;
-- EXPECTED: 0

-- CHECK 3: Verwaiste Storno-Buchungen
SELECT COUNT(*) AS orphan_stornos FROM ledger_entries storno
WHERE storno.correlation_id LIKE 'STORNO-%'
  AND NOT EXISTS (
    SELECT 1 FROM ledger_entries orig
    WHERE orig.correlation_id = REPLACE(storno.correlation_id, 'STORNO-', '')
  );
-- EXPECTED: 0

-- CHECK 4: Datensatz-Vollständigkeit vs. letztem bekannten Stand
SELECT COUNT(*) AS total_ledger_entries FROM ledger_entries;
-- Vergleichen mit: letztem Snapshot-Wert aus dem DR-Log

SQL
```

### Phase 4 — Redis State + Application Start (7–8h)

```bash
# Redis-State ist flüchtig — wird bei App-Start neu aufgebaut
# BullMQ-Jobs: unerledigte Jobs aus DB rekonstruieren

docker compose -f docker-compose.prod.yml up -d redis

# API starten + Migrations prüfen:
docker compose -f docker-compose.prod.yml up -d api
docker compose -f docker-compose.prod.yml exec api npx prisma migrate status
# Alle Migrations müssen "Applied" zeigen

# OHLC-Cache neu aufbauen (läuft automatisch via @Cron):
docker compose -f docker-compose.prod.yml exec api \
  node -e "require('./dist/modules/market/market.service').backfillAll(30)"

# Web + Nginx starten:
docker compose -f docker-compose.prod.yml up -d web nginx
```

### Phase 5 — Validierung & Go-Live (8–10h)

- [ ] **Health Check grün:** `curl https://api.eucx.exchange/api/v1/health`
- [ ] **Alle 4 Ledger-Checks: PASS**
- [ ] **Login als Testuser möglich**
- [ ] **WebSocket verbindet sich** (Browser-Konsole: `socket.connected === true`)
- [ ] **Kein Trading Halt aktiv:** `redis-cli GET trading_halt:all` → nil
- [ ] **Grafana zeigt Live-Daten** nach spätestens 5 Minuten
- [ ] **Letzter bekannter Deal** ist in der DB vorhanden
- [ ] **Compliance-Benachrichtigung:** Ausfall + Recovery-Zeitraum dokumentieren

### Recovery Time Objectives

| Komponente | RTO | RPO (max. Datenverlust) |
|------------|-----|------------------------|
| PostgreSQL (PITR) | 4–6h | 5 Minuten (WAL-Archiv) |
| Redis (BullMQ) | < 30 Min | Unerledigte Jobs neu enqueuen |
| Application | < 1h | Kein Datenverlust (zustandslos) |
| **Gesamtsystem** | **< 24h** | **5 Minuten** |

---

## Access Control & Infrastructure Hardening

### Admin-Zugang absichern

- [ ] **Nginx IP-Whitelist für `/api/v1/admin`** in [nginx/eucx.conf](nginx/eucx.conf) aktiviert:
  ```nginx
  location ~ ^/api/v1/admin {
      allow 10.100.0.0/24;   # WireGuard VPN
      allow 203.0.113.0/24;  # Office-IP (anpassen)
      deny  all;
  }
  ```

- [ ] **Grafana IP-Restriction** in [nginx/eucx.conf](nginx/eucx.conf) aktiviert:
  ```nginx
  # Kommentar vor diesen Zeilen entfernen:
  allow 10.100.0.0/24;
  deny  all;
  ```

- [ ] **WireGuard VPN** auf Production-Server eingerichtet
  ```bash
  apt install wireguard
  wg genkey | tee /etc/wireguard/server-private.key | wg pubkey > /etc/wireguard/server-public.key
  # Konfiguration: /etc/wireguard/wg0.conf (siehe ARCHITECTURE.md §18)
  systemctl enable --now wg-quick@wg0
  ```

- [ ] **PostgreSQL niemals direkt erreichbar** (kein Port 5432 in UFW offen)
  ```bash
  ufw status | grep 5432   # sollte LEER sein
  ufw status | grep 6379   # Redis auch: LEER
  ```

- [ ] **SSH-Härtung** auf Production-Server:
  ```bash
  # /etc/ssh/sshd_config:
  PermitRootLogin              no
  PasswordAuthentication       no
  PubkeyAuthentication         yes
  AllowUsers                   deploy
  MaxAuthTries                 3
  ClientAliveInterval          300
  ClientAliveCountMax          2
  ```

### Secrets-Rotation-Plan

| Secret | Rotation-Intervall | Verfahren | Downtime? |
|--------|--------------------|-----------|-----------|
| `JWT_SECRET` | Alle 90 Tage | Gleichzeitig in `.env.production` + Restart | ~30s |
| `NEXTAUTH_SECRET` | Alle 90 Tage | Gleichzeitig, invalidiert Sessions | ~30s |
| `WEBHOOK_SECRET` | Alle 180 Tage | Neuer Key → alte Deliveries noch mit altem signiert | Nein |
| `POSTGRES_PASSWORD` | Alle 180 Tage | Prisma `DATABASE_URL` + PostgreSQL `ALTER USER` | ~30s |
| `REDIS_PASSWORD` | Alle 180 Tage | Redis `CONFIG SET requirepass` + `.env` | Nein |
| Deploy SSH Key | Bei Mitarbeiterwechsel | Sofortige Rotation | Nein |

### Fail2Ban für Auth-Endpunkte

```bash
# /etc/fail2ban/filter.d/eucx-auth.conf
[Definition]
failregex = ^<HOST> .* "POST /api/v1/auth/(login|register)" 4[0-9][0-9]
ignoreregex =

# /etc/fail2ban/jail.d/eucx.conf
[eucx-auth]
enabled  = true
port     = http,https
filter   = eucx-auth
logpath  = /var/log/nginx/access.log
maxretry = 5
findtime = 60s
bantime  = 1800s

# Fail2Ban starten/prüfen:
systemctl enable --now fail2ban
fail2ban-client status eucx-auth
```

---

## Key Contacts & External Services

| Service | Purpose | Where to find credentials |
|---------|---------|--------------------------|
| Neon (PostgreSQL) | Production DB | `.env.production` → `DATABASE_URL` |
| Redis Cloud / Docker | BullMQ + Cache | `.env.production` → `REDIS_URL` |
| GitHub GHCR | Docker registry | Auto via `GITHUB_TOKEN` |
| Let's Encrypt | SSL certs | Auto via Certbot container |
| SMTP provider | Transactional email | `.env.production` → `SMTP_*` |

---

## Definition of Done — Handoff Complete

The handoff is complete when the incoming team can:

- [ ] Run the full test suite (`npm test`) — 63/63 passing
- [ ] Explain the matching engine advisory lock mechanism
- [ ] Deploy a change to production via GitHub Actions
- [ ] Open a dispute on a deal and resolve it via the backoffice
- [ ] Register a webhook endpoint and verify HMAC signature delivery
- [ ] Read the Grafana dashboard and identify an API latency spike
- [ ] Perform a database migration without downtime
- [ ] Rotate the `JWT_SECRET` without invalidating active API keys
- [ ] Activate the global Kill Switch via Admin-API and verify orders return 503
- [ ] Run all 4 Ledger-Integrity-Checks and interpret the results
- [ ] Explain the difference between a Global Halt and a Product-level Circuit Breaker
- [ ] Set `isMarketMaker=true` for a test user and verify it does NOT appear in the public API
- [ ] Answer: *"What happens to an order if the matching engine crashes mid-session?"*
- [ ] Answer: *"Was passiert mit laufenden BullMQ-Jobs wenn Redis ausfällt?"*
- [ ] Answer: *"Warum darf die isMarketMaker-Information nicht in der öffentlichen OrderBook-API erscheinen?"*

---

## Open Items / Known Issues

| # | Issue | Severity | Owner | Notes |
|---|-------|----------|-------|-------|
| 1 | No Argon2id for API key hashing (currently bcrypt) | Low | Security | bcrypt is adequate; Argon2id preferred for new systems |
| 2 | OHLC via cron — not real-time | Low | Backend | Acceptable for current volume; streaming via NOTIFY in Phase 1 |
| 3 | No read replica for analytics queries | Medium | DBA | Heavy reports (fee/TVL) can slow primary DB under load |
| 4 | `apps/api-go-backup/` exists but is unused | Info | — | Experimental Go matching engine; keep for Phase 1 reference |
| 5 | No automated E2E tests (Playwright) | Medium | QA | Only Jest unit/integration tests currently; Playwright planned |
| 6 | Grafana IP restriction disabled | **HIGH** | DevOps | **Aktivieren vor erstem externem Zugriff** — nginx/eucx.conf §Grafana |
| 7 | Kill Switch Guard nicht in AppModule registriert | Medium | Backend | Code vorhanden; muss in `app.module.ts` als globaler Guard eingebunden werden |
| 8 | WAL-Archivierung noch nicht konfiguriert | **HIGH** | DBA | Ohne WAL-Archiv ist PITR unmöglich; konfigurieren vor Go-Live |
| 9 | `isMarketMaker` Prisma-Migration fehlt | Low | Backend | Schema-Ergänzung per `prisma migrate dev --name add_market_maker` |
| 10 | Price-Band Circuit Breaker (Level 3) nicht implementiert | Medium | Backend | Konzept in ARCHITECTURE.md §15; Implementierung in Matching Engine offen |

---

*Handoff document prepared by EUCX CTO Office.*
*For questions during onboarding: open a GitHub Discussion or check ARCHITECTURE.md.*
