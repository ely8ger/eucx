# EUCX — Changelog

Alle nennenswerten Änderungen an der Plattform. Format: [Keep a Changelog](https://keepachangelog.com/de/1.0.0/).

---

## [Unreleased] — 2026-07-05

### Hinzugefügt
- **CBAM-Integration** (EU-Verordnung 2023/956): Vollständige Carbon Border Adjustment Mechanism Unterstützung
  - Prisma-Schema: Felder `co2PerTonne`, `countryOfOrigin`, `productionSiteId`, `incoterms` im Lot-Modell
  - Datenbank-Migration auf Neon PostgreSQL angewendet
  - API `POST /api/auction/lots`: CBAM-Felder validiert und gespeichert (alle optional, empfohlen ab 2026)
  - PDF-Kaufvertrag: §5 CBAM-Deklarationssektion (Herkunftsland, CO₂, Registry-ID, Incoterms)
  - Post-Trade Engine: CBAM-Felder aus Lot in PDF-Generator übergeben
  - API `GET /api/auction/lots/[lotId]/cbam-export`: XML-Deklarationsbericht gemäß DVO (EU) 2023/1773
  - BuyerLotsClient: CBAM-Formularfelder (CO₂, Herkunftsland, Registry-ID, Incoterms) im Lot-Erstellungsformular
  - BuyerLotsClient: CO₂-Fußabdruck-Widget — zeigt kumulierte Emissionen + Exportbutton
  - SellerLotsClient: CBAM-Informationsspalte in der Lots-Tabelle (CO₂/t, Land, Incoterms)
- **Dokumentation**
  - `API_REFERENCE.md`: Vollständige Dokumentation aller 54+ Next.js API-Routen mit Beschreibungen, Rollen, Request/Response-Format
  - `CHANGELOG.md`: Diese Datei — Versionshistorie ab heute

---

## [1.1.0] — 2026-06-30

### Hinzugefügt
- **Visuell klare Käufer/Verkäufer-Trennung**
  - Käufer-Portal: Gov-Blue (`#154194`) durchgehend
  - Verkäufer-Portal: Amber/Orange (`#d97706`) durchgehend
  - Identitätsstreifen nach dem Header (KÄUFER-PORTAL / VERKÄUFER-PORTAL Beschriftung)
  - `EucxHeader.tsx`: `resolveContext()` — Akzentfarbe wechselt je nach URL-Kontext
  - NavLink erhält `accentColor`-Prop für aktive Indicator und Hover-Effekte
- **API Role Guards** (vollständige Backend-Absicherung)
  - `POST /api/auction/lots/[lotId]/bids`: Nur SELLER/BROKER/ADMIN können Gebote abgeben (JWT-Rollencheck ohne DB-Call)
  - `POST /api/orders`: Richtungs-Rollenregel — BUYER nur BUY, SELLER nur SELL
  - Middleware `/apps/web/src/middleware.ts`: URL-Guard — `/dashboard/buyer/**` → BUYER only, `/dashboard/seller/**` → SELLER only
- **Dokumentation**
  - `LAUNCH_CHECKLIST.md`: Hybrid-Deployment-Sektion (Vercel + Docker/SSH), RBAC-Tabelle mit 9 Endpunkten
  - `.env.example`: Vollständig neu geschrieben mit Sektionen (DB, JWT, URLs, SMTP, Webhooks, Monitoring, Seed)
  - `PROJEKTSTAND.md`: Investorengerechte Projektdokumentation
- **Komponenten**
  - `apps/web/src/components/buyer/` — Buyer-spezifische Komponenten-Ordner angelegt
  - `apps/web/src/components/seller/` — Seller-spezifische Komponenten-Ordner angelegt

### Geändert
- `SellerLotsClient.tsx`: Alle blauen Akzentfarben durch Orange/Amber ersetzt; Row-Hover `#fffbf5`

---

## [1.0.0] — 2026-06-15

### Hinzugefügt
- **Kern-Auktionssystem**
  - Lot-Phasen: COLLECTION → PROPOSAL → REDUCTION → CONCLUSION
  - Gebotsabgabe mit Real-Time-Updates (SSE-Stream)
  - Post-Trade Engine: Automatische Vertragsgenerierung nach CONCLUSION
  - PDF-Kaufvertrag mit SHA-256 Integritäts-Fingerprint (`pdf-lib`)
  - Plattformgebühren-Berechnung (FeeEngine, Käufer + Verkäufer)
  - LotContract-DB-Modell mit Base64-PDF, Hash, Größe, Vertragsnummer
- **Authentifizierung & Sicherheit**
  - JWT Access/Refresh-Token mit Rotation
  - TOTP 2FA (Authenticator App)
  - Backup-Codes (10 einmalig nutzbare Codes)
  - Session Management (mehrere Geräte, einzeln abmeldbar)
  - Sicherheits-Aktivitätsprotokoll
  - API-Key-Verwaltung (bis zu 10 Keys pro Organisation)
- **KYC & Compliance**
  - KYC-Workflow: GUEST → PENDING_VERIFICATION → VERIFIED
  - USt-IdNr.-Validierung (EU BZSt eVatR)
  - LEI-Kennung-Prüfung
  - HRB-Handelsregisternummer-Lookup
  - Unternehmens-Datenanreicherung
- **Orderbuch**
  - Matching Engine (Red-Black BST + FIFO PriceLevel)
  - OHLCV-Candles für Marktdaten
  - Portfolio/Wallet-Verwaltung
- **Rollensystem**
  - Rollen: BUYER, SELLER, BROKER, ADMIN, COMPLIANCE, SUPER_ADMIN
  - Rollenbasierte URL-Guards (Next.js Middleware)
  - Buyer-Dashboard (`/dashboard/buyer`)
  - Seller-Dashboard (`/dashboard/seller`)
  - Admin-Dashboard (`/dashboard/admin`)
- **SEO & Frontend**
  - Vollständige Sitemap (115 URLs)
  - Canonical-Tags, Meta-Descriptions
  - EucxHeader mit kontextabhängiger Navigation
  - Pre-Flight-Check vor erster Ausschreibung (KYC + 2FA + Telefon)
  - Benachrichtigungssystem mit Präferenzen
- **Infrastruktur**
  - Turborepo Monorepo: `apps/web` (Next.js 15) + `apps/api` (NestJS 10)
  - Neon PostgreSQL (Serverless)
  - Prisma ORM mit vollständigem Schema
  - Hybrid-Deployment: Vercel (Frontend) + Docker/SSH (Backend)

---

## Legende

- `Hinzugefügt` — Neue Funktionen
- `Geändert` — Änderungen an bestehenden Funktionen
- `Veraltet` — Bald zu entfernende Funktionen
- `Entfernt` — Entfernte Funktionen
- `Behoben` — Bug-Fixes
- `Sicherheit` — Sicherheits-relevante Änderungen
