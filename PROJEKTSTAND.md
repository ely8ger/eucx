# EUCX — Vollständiger Projektstand
**Erstellt:** 2026-07-05  
**Status:** Aktiv in Entwicklung (214 Commits, letzter: 2026-04-10)

---

## 1. Was ist EUCX?

**EUCX — European Union Commodity Exchange**  
Eine institutionelle, doppelseitige Warenbörse (Double-Auction) für Rohstoffe im EU-Markt — Metalle, Stahl, Agrar. B2B-Plattform für verifizierte Händler, Käufer und Verkäufer.

**Ziel:** Digitale Handelsplattform mit Preisfindung via Auktion (FIFO, Price-Time Priority) und Reverse-Auction-System. Regulatorisch MiFID-II-orientiert.

**Design-Stil:** HSBC-inspiriert, institutionell, ruhig. Hauptfarbe `#154194`, IBM Plex Sans, font-weight 300, border-radius 0, keine bunten Elemente.

---

## 2. Projektstruktur (Monorepo — Turborepo)

```
eucx/
├── apps/
│   ├── web/           ← Next.js 15.3 Frontend (TypeScript, Tailwind v4)
│   └── api/           ← NestJS Backend (TypeScript, BullMQ, Socket.IO)
├── packages/
│   ├── types/         ← Shared TypeScript-Typen
│   ├── shared/        ← Validierungslogik
│   └── config/        ← TSConfig-Basis
├── infra/
│   └── postgres/      ← Schema.sql + Seed.sql
├── design-system/     ← MASTER.md, Seiten-Specs (Dashboard, Landing, Trading)
├── monitoring/        ← Prometheus + Grafana Dashboards
├── docker-compose.yml          ← Entwicklung
├── docker-compose.prod.yml     ← Produktion
├── ARCHITECTURE.md             ← Vollständige Architektur-Dokumentation
├── HANDOFF-CHECKLIST.md        ← Übergabedokumentation + offene Punkte
└── LAUNCH_CHECKLIST.md         ← Produktions-Deployment-Checkliste
```

---

## 3. Tech-Stack

| Schicht | Technologie |
|---------|------------|
| Frontend | Next.js 15.3, React 19, TypeScript, Tailwind v4, Radix UI |
| State / Data | TanStack Query v5, Zustand v5 |
| Backend | NestJS (TypeScript), Prisma 5.22 |
| Queue | BullMQ (Redis-backed) |
| Real-Time | Socket.IO v4 |
| Datenbank | PostgreSQL 16 + TimescaleDB |
| Cache | Redis 7 |
| Charts | Lightweight Charts v5 (TradingView), Recharts |
| Auth | JWT RS256 (jose), bcrypt, TOTP (otplib), 2FA |
| PDF | pdf-lib (Vertrags-PDFs) |
| Email | Resend |
| Finanzmathematik | Decimal.js (kein IEEE-754-Fehler) |
| Monitoring | Prometheus + Grafana |
| Infrastruktur | Docker Compose (dev + prod), Nginx, Let's Encrypt |
| CI/CD | GitHub Actions → GHCR → SSH Deploy |
| Hosting Web | Vercel (Project ID: `prj_9hBLmYLq2r3nphNwwnjlE7uLXzXn`) |
| Lokaler Pfad | `/Users/ki/.openclaw/workspace-anthropic/eucx/` |

---

## 4. Datenbank-Schema (8 Migrationen)

### Tabellen
| Tabelle | Beschreibung |
|---------|-------------|
| `organizations` | Firmen (verifiziert/unverified) |
| `users` | Benutzer mit Rolle + Status + 2FA |
| `steel_products` | Stahlprodukte (Form, Güte, Zertifikat, Lager) |
| `trading_sessions` | Handelssitzungen (7 Phasen) |
| `orders` | Kauf- und Verkaufsaufträge (FIFO, idempotency key) |
| `deals` | Abgeschlossene Geschäfte (Matching-Ergebnis) |
| `ledger_entries` | Double-Entry-Ledger für Clearing |
| `lots` | Reverse-Auction-Lose (Käufer schreibt aus) |
| `lot_registrations` | Anmeldungen von Verkäufern auf Lose |
| `bids` | Gebote auf Lose |
| `lot_contracts` | Verträge zu Lots |
| `notifications` | System-Benachrichtigungen |
| `audit_logs` | Unveränderliches Audit-Log |
| `kyc_documents` | KYC-Dokument-Uploads |

### Wichtige ENUMs
- `UserRole`: ADMIN, SELLER, BUYER, OBSERVER
- `SessionStatus`: SCHEDULED → PRE_TRADING → TRADING_1 → CORRECTION_1 → TRADING_2 → CORRECTION_2 → FINAL → CLOSED
- `OrderStatus`: ACTIVE, PARTIALLY_FILLED, FILLED, CANCELLED, EXPIRED
- `AuctionPhase`: COLLECTION → PROPOSAL → REDUCTION → CONCLUSION
- `DealStatus`: MATCHED, CONFIRMED, CANCELLED, DISPUTED

---

## 5. Frontend — Alle Seiten

### Öffentliche Seiten (ohne Login)
| URL | Seite |
|-----|-------|
| `/` | Landing Page (Hero, Trust-Badges, CTAs) |
| `/marktpreise` | Marktpreise-Tabelle |
| `/metalle` | Metallspezifikationen |
| `/metalle/[form]` | Detailseite je Metallform |
| `/katalog` | Produktkatalog |
| `/katalog/[kategorie]` | Kategorieseite |
| `/duenger` | Düngemittel-Sektion |
| `/duenger/[kategorie]/[produkt]` | Produktdetail |
| `/insights` | Insights-Hub (Live-Ticker, Stats-Bar) |
| `/insights/akademie` | Bildungsartikel |
| `/insights/akademie/[slug]` | Einzelner Artikel |
| `/insights/analysen` | Marktanalysen |
| `/insights/lexikon` | Börsenlexikon |
| `/insights/lexikon/[slug]` | Lexikon-Eintrag |
| `/insights/regulatorik` | Regulatorische Infos |
| `/wissen` | Wissensdatenbank |
| `/wissen/[slug]` | Wissensartikel |
| `/faq` | FAQ |
| `/agb` | AGB |
| `/impressum` | Impressum |
| `/datenschutz` | Datenschutz |
| `/login` | Login (mit 2FA-Flow) |
| `/register` | Registrierung |

### Geschützte Seiten (Rolle: BUYER)
| URL | Seite |
|-----|-------|
| `/dashboard/buyer` | Ausschreibungs-Übersicht (Lots) |
| `/dashboard/buyer/auction/[lotId]` | Auktions-Detailseite |
| `/dashboard/contracts` | Verträge |

### Geschützte Seiten (Rolle: SELLER)
| URL | Seite |
|-----|-------|
| `/dashboard/seller` | Eigene Lots verwalten |
| `/dashboard/seller/auction/[lotId]` | Gebotsseite |

### Geschützte Seiten (alle Rollen)
| URL | Seite |
|-----|-------|
| `/dashboard/settings/security` | 2FA, Backup-Codes, Sessions |
| `/dashboard/settings/verification` | KYC-Wizard |
| `/dashboard/settings/notifications` | Benachrichtigungs-Einstellungen |

### Admin-Seiten (nur ADMIN/COMPLIANCE/SUPER_ADMIN)
| URL | Seite |
|-----|-------|
| `/admin` | Admin-Dashboard (Analytics) |
| `/admin/kyc` | KYC-Freigabe-Center |
| `/admin/registrations` | Registrierungs-Verwaltung |
| `/admin/users` | Nutzerverwaltung |
| `/admin/markets` | Markt-Verwaltung |
| `/admin/emergency` | Kill-Switch Panel (3-Stufen Circuit Breaker) |
| `/admin/api-docs` | Swagger UI |

### Alte Routen (werden umgeleitet via Middleware)
`/orders`, `/trading`, `/portfolio`, `/deals`, `/reports`, `/products`, `/personal`, `/kyc` → rollenbasierter Redirect auf neue Struktur

---

## 6. Backend API — NestJS Module

| Modul | Funktion |
|-------|---------|
| `AuthModule` | Login, Register, JWT, 2FA, Refresh Token |
| `UsersModule` | Nutzerverwaltung |
| `ProductsModule` | Produkte CRUD |
| `OrdersModule` | Order-Platzierung, Stornierung |
| `TradingModule` | Matching Engine, WebSocket Gateway |
| `ClearingModule` | Post-Trade-Settlement, BullMQ Queue |
| `MarketModule` | OHLC-Daten, Candlestick-Cache |
| `AdminModule` | Admin-API, Trading-Halt-Controller |
| `AuditModule` | Audit-Log-Service |
| `ApiKeyModule` | API-Key-Verwaltung (bcrypt) |
| `WebhookModule` | HMAC-Webhook-Delivery, Retry-Queue |
| `PublicModule` | Öffentliche Marktdaten |
| `HealthModule` | `/health` Endpunkt |

### Sicherheits-Guards
- `JwtAuthGuard` — JWT-Validierung
- `RolesGuard` — RBAC
- `KycVerifiedGuard` — KYC-Status-Prüfung
- `ApiKeyGuard` — API-Key-Authentifizierung
- `TradingHaltGuard` — Emergency Kill Switch
- `EucxThrottlerGuard` — Rate Limiting (100/min anonym, 1000/min auth)

---

## 7. Frontend-Komponenten (wichtigste)

### Trading
- `TradingRoom.tsx` — Live-Handelssaal mit OrderBook
- `TradingTerminal.tsx` — Terminal-Ansicht
- `OrderBook.tsx` — Live Bid/Ask-Anzeige
- `MarketChart.tsx` — OHLC-Chart (Lightweight Charts)
- `ConfirmOrderModal.tsx` — Auftragsbestätigung
- `SignContractModal.tsx` — Vertragsunterzeichnung

### Portfolio
- `BalanceCard.tsx` — Kontostand
- `ActiveOrders.tsx` — Aktive Aufträge
- `DealHistory.tsx` — Abschlusshistorie
- `PortfolioAllocationChart.tsx` — Allocation-Diagramm

### Admin
- `KycApprovalCenter.tsx` — KYC-Workflow
- `RegistrationCenter.tsx` — Registrierungen
- `UserManagement.tsx` — Nutzerverwaltung
- `KillSwitch.tsx` — Emergency-Panel
- `AnalyticsCharts.tsx` — Plattform-Statistiken
- `GlobalOrdersTable.tsx` — Alle Aufträge

### Layout
- `EucxHeader.tsx` — Einheitlicher Header mit Breadcrumb + Context-Nav
- `Sidebar.tsx` — Navigation (rollenbasiert)
- `Navbar.tsx` — Nutzer-Rolle + Avatar-Button
- `SiteNav.tsx` — Öffentliche Navigation
- `EucxLogo.tsx` — SVG Logo (Orderbuch-Symbol + Wortmarke)

---

## 8. Kern-Algorithmen & Bibliotheken

### Matching Engine (`lib/trading/matching-engine.ts`)
- Price-Time Priority (FIFO)
- Verwendet PostgreSQL Advisory Locks (keine Race Conditions)
- Partial fills unterstützt
- Tests: `__tests__/unit/matching-engine.spec.ts`

### Fee Calculator (`lib/clearing/fee-calculator.ts`)
- 4 Gebührenstufen (volumenabhängig)
- EU Reverse Charge (VAT)
- 8 Dezimalstellen Präzision (Decimal.js)
- `validateLedgerBalance()` — Double-Entry-Invariante
- 30 Unit-Tests, 100% Function Coverage

### Auction Engine (`lib/auction/`)
- `price-engine.ts` — Preisbildung bei Geboten
- `fee-engine.ts` — Auktionsgebühren
- `auction-timer.ts` — Phasen-Zeitsteuerung
- `lot-contract-generator.ts` — PDF-Vertragsgenerator
- `post-trade.ts` — Post-Trade-Abwicklung
- `kyc-guard.ts` — KYC-Schutz für Auktionen

### OHLC Queries (`lib/market/ohlc-queries.ts`)
- TimescaleDB `time_bucket()` Abfragen
- Intervalle: 1min, 5min, 15min, 1h, 4h, 1d
- Cron-Cache-Refresh (NestJS Scheduler)

---

## 9. Fertig implementiert (aus HANDOFF-CHECKLIST.md)

| Feature | Status |
|---------|--------|
| Matching Engine (FIFO + Advisory Locks) | ✅ Vollständig |
| Double-Entry-Ledger + validateLedgerBalance | ✅ Vollständig |
| KYC & Compliance-Backoffice | ✅ Vollständig |
| Fee Calculator (4 Stufen + EU Reverse Charge) | ✅ Vollständig |
| API Economy (API Keys + HMAC Webhooks) | ✅ Vollständig |
| Market Analytics (OHLC + TradingView) | ✅ Vollständig |
| Test Suite | ✅ 63/63 Tests bestanden |
| CI/CD Pipeline (GitHub Actions → GHCR → SSH) | ✅ Vollständig |
| Docker Compose Produktion + Nginx + SSL | ✅ Vollständig |
| Emergency Kill Switch (3-Stufen Circuit Breaker) | ✅ Vollständig |
| Market Maker Policy (MiFID II) | ✅ Vollständig |
| Disaster Recovery Runbook (24h RTO) | ✅ Dokumentiert |
| Access Hardening (VPN, Nginx IP-Whitelist) | ✅ Dokumentiert |
| 2FA (TOTP + Backup-Codes) | ✅ Vollständig |
| Reverse Auction (Lots/Bids) | ✅ Vollständig |
| Rollenbasierte Dashboards (Käufer/Verkäufer) | ✅ Vollständig |
| i18n (DE/EN Übersetzungen) | ✅ Vollständig |
| Cookie Banner + Datenschutz | ✅ Vollständig |
| Notification System | ✅ Vollständig |

---

## 10. Offene Punkte / Baustellen

| # | Problem | Priorität |
|---|---------|-----------|
| 1 | Grafana IP-Restriction nicht aktiviert | **HOCH** — vor externem Zugriff aktivieren |
| 2 | WAL-Archivierung nicht konfiguriert | **HOCH** — PITR unmöglich ohne WAL |
| 3 | Kill Switch Guard nicht in AppModule registriert | Mittel |
| 4 | Price-Band Circuit Breaker (Level 3) nicht implementiert | Mittel |
| 5 | Keine Playwright E2E-Tests | Mittel |
| 6 | Kein Read Replica für Analytics | Mittel |
| 7 | `isMarketMaker` Prisma-Migration fehlt | Niedrig |
| 8 | OHLC via Cron (nicht real-time) | Niedrig |
| 9 | API-Key-Hashing: bcrypt (besser wäre Argon2id) | Niedrig |
| 10 | `apps/api-go-backup/` — unbenutzt | Info |

---

## 11. Vercel-Deployment

- **Projekt-ID:** `prj_9hBLmYLq2r3nphNwwnjlE7uLXzXn`
- **Org-ID:** `team_98yvEw0pyJpYe7tMMvNbwaqT`
- **Build-Befehl:** `prisma generate && next build`
- **Vercel-Konfig:** `vercel.json` im Root + `apps/web/.vercel/project.json`

---

## 12. Lokale Entwicklung starten

```bash
cd /Users/ki/.openclaw/workspace-anthropic/eucx

# Docker-Services starten (Postgres + Redis)
docker compose up -d postgres redis

# Web-Frontend
cd apps/web
cp .env.example .env.local   # DATABASE_URL, JWT_SECRET etc. eintragen
npx prisma migrate dev
npx prisma db seed
npm run dev   # http://localhost:3000

# API-Backend (separates Terminal)
cd apps/api
npm run start:dev   # http://localhost:3001
```

---

## 13. Git-Statistik

- **Gesamt-Commits:** 214
- **Erster Commit:** 2026-03-14 (Init)
- **Letzter Commit:** 2026-04-10 (Rollen-Badge aus TopBar entfernt)
- **Hauptentwicklungsphase:** März–April 2026

---

## 14. Design-System

Alle Design-Spezifikationen in `design-system/eucx/`:
- `MASTER.md` — Vollständiger Design-Guide
- `pages/dashboard.md` — Dashboard-Spezifikation
- `pages/landing.md` — Landing-Page-Spezifikation
- `pages/trading.md` — Trading-Seiten-Spezifikation
- `themes/hsbc-theme.md` — HSBC-Farbsystem

**Feste Design-Regeln:**
- Farbe: nur `#154194` (kein Farb-Mix)
- Font: IBM Plex Sans, weight 300
- Radius: 0px überall
- Layout: zentriert, breathing room (88–100px padding)
- Hover-Effekte: Pflicht auf allen interaktiven Elementen
- Hero: immer dunkles Hintergrund (`#0b1e36`)

---

*Dokument erstellt von Claude Code — 2026-07-05*
