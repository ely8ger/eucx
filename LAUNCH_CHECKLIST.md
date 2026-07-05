# EUCX Launch Checklist — Tag 1

Auszuführen vor und nach dem ersten Production-Deploy.
Jede Position ist eigenständig prüfbar und hat einen konkreten Befehl.

---

## Vor dem Deploy

### 1. Secrets vollständig gesetzt
Alle Variablen aus `.env.production.example` müssen auf dem Server vorhanden sein.
```bash
# Prüfen: keine CHANGE_ME-Werte mehr vorhanden
grep "CHANGE_ME" /opt/eucx/.env.production && echo "FEHLER: Secrets nicht ersetzt!" || echo "OK"
```

### 2. SSL-Zertifikat installiert
```bash
# Certbot-Zertifikat für alle Domains
certbot certificates 2>/dev/null | grep -E "eucx\.(exchange|eu)"
# Verbleibende Tage prüfen:
echo | openssl s_client -servername eucx.exchange -connect eucx.exchange:443 2>/dev/null \
  | openssl x509 -noout -enddate
```

### 3. Datenbank-Migration ausgeführt
```bash
cd /opt/eucx
docker compose -f docker-compose.prod.yml exec api npx prisma migrate deploy
# Erwartete Ausgabe: "All migrations have been applied."
```

### 4. Production Seed ausgeführt (einmalig)
```bash
docker compose -f docker-compose.prod.yml exec web \
  npx tsx prisma/seed.production.ts
# Prüfen: CU-LME-A, AL-LME-P1020, ZN-LME-SHG, NI-LME-FP vorhanden
```

### 5. Admin-Passwort geändert
```bash
# Nach Seed: Standard-Admin-Passwort sofort ändern
docker compose -f docker-compose.prod.yml exec web \
  npx tsx -e "
    const { PrismaClient } = require('@prisma/client');
    const bcrypt = require('bcryptjs');
    const db = new PrismaClient();
    bcrypt.hash(process.env.NEW_ADMIN_PASSWORD, 12)
      .then(h => db.user.update({ where: { email: process.env.SEED_ADMIN_EMAIL }, data: { passwordHash: h } }))
      .then(() => { console.log('OK'); db.\$disconnect(); });
  "
```

---

## Nach dem Deploy

### 6. Smoke-Tests bestanden
```bash
# GitHub Actions Smoke-Test manuell auslösen:
gh workflow run smoke-test.yml --ref main
# Oder lokal prüfen:
curl -sf https://eucx.exchange/login > /dev/null && echo "Frontend OK" || echo "FEHLER"
curl -sf https://api.eucx.exchange/health | jq .status
```

### 7. Erster Backup-Lauf erfolgreich
```bash
BACKUP_S3_BUCKET=eucx-backups-prod \
DATABASE_URL="..." \
  /opt/eucx/scripts/backup.sh daily
# Prüfen:
aws s3 ls s3://eucx-backups-prod/eucx/backups/daily/ | tail -3
```

### 8. Cron-Jobs registriert
```bash
crontab -l | grep backup
# Erwartet: 3 Einträge (hourly, daily, weekly)
# Falls nicht vorhanden:
echo "5 * * * * /opt/eucx/scripts/backup.sh hourly" | crontab -
echo "5 0 * * * /opt/eucx/scripts/backup.sh daily"  | crontab -
echo "0 1 * * 0 /opt/eucx/scripts/backup.sh weekly" | crontab -
```

### 9. Monitoring aktiv
```bash
# Grafana erreichbar:
curl -sf https://grafana.eucx.exchange/api/health | jq .database
# Redis läuft:
docker compose -f docker-compose.prod.yml exec redis redis-cli -a "$REDIS_PASSWORD" PING
# Alle Container laufen:
docker compose -f docker-compose.prod.yml ps --format "table {{.Name}}\t{{.Status}}"
```

### 10. Erster Login als Admin verifiziert
```bash
# Manuell im Browser:
# 1. https://eucx.exchange/login → Admin-Zugangsdaten eingeben
# 2. /admin/kyc → KYC-Queue sichtbar (leer = OK)
# 3. /admin/markets → CU, AL, ZN, NI mit Kursdaten sichtbar
# 4. /admin/emergency → Kill-Switch Panel erreichbar (NICHT betätigen)
# 5. /settings/api → API-Key erstellen und testen:
curl -H "Authorization: ApiKey eucx_live_..." https://eucx.exchange/api/market/CU-LME-A/candles
```

---

## Notfall-Wiederherstellung

```bash
# Neuesten Snapshot einspielen:
DATABASE_URL="..." \
BACKUP_S3_BUCKET=eucx-backups-prod \
  /opt/eucx/scripts/backup.sh restore latest

# Danach: alle Container neu starten
docker compose -f docker-compose.prod.yml restart api web

# Health-Check:
curl -sf https://api.eucx.exchange/health | jq .
```

---

---

## Deployment-Architektur (Hybrid)

```
eucx.eu          → Vercel (Next.js Frontend + API Routes)
api.eucx.eu      → Docker/SSH (NestJS Matching Engine + WebSocket)
db               → Neon PostgreSQL (managed, EU-Central)
cache            → Redis (Docker, selber Server wie NestJS)
monitoring       → Grafana + Prometheus (Docker)
```

### Vercel-Deploy (Frontend)

```bash
# Einmaliges Setup:
vercel link --project eucx-web
vercel env pull apps/web/.env.local   # lokale Kopie ziehen

# Deploy auf Production:
vercel --prod --cwd apps/web

# Erforderliche Vercel Environment Variables (im Dashboard setzen):
# DATABASE_URL, DIRECT_URL       → Neon Connection String
# JWT_SECRET                      → min. 32 Zeichen
# NEXT_PUBLIC_API_URL             → https://api.eucx.eu
# NEXT_PUBLIC_WS_URL              → wss://api.eucx.eu
# SMTP_HOST / SMTP_USER / SMTP_PASS
# WEBHOOK_SECRET, INTERNAL_API_KEY
```

### Docker/SSH-Deploy (Backend API)

```bash
# Auf dem Server (SSH):
cd /opt/eucx
git pull origin main
docker compose -f docker-compose.prod.yml build api
docker compose -f docker-compose.prod.yml up -d api redis
docker compose -f docker-compose.prod.yml exec api npx prisma migrate deploy

# GitHub Actions CI/CD: .github/workflows/deploy.yml
# → baut api-Image, pusht zu GHCR, SSH-Deploy via appleboy/ssh-action
```

---

## API-Sicherheit (RBAC — Stand 2026-07)

Alle geschützten Endpunkte erfordern Bearer JWT. Die Rolle ist im Token codiert.

| Endpunkt | Erlaubte Rollen | Prüfmethode |
|---|---|---|
| `POST /api/auction/lots` | BUYER, BROKER, ADMIN | DB-Check (user.role) |
| `POST /api/auction/lots/[id]/register` | SELLER, BROKER, ADMIN | DB-Check (user.role) |
| `POST /api/auction/lots/[id]/open` | Nur Lot-Besitzer (BUYER) | `lot.buyerId === userId` |
| `POST /api/auction/lots/[id]/bids` | SELLER, BROKER, ADMIN | **JWT-Check (token.role)** — kein DB-Call |
| `POST /api/orders` | BUYER→BUY, SELLER→SELL | DB-Check + Direction-Guard |
| `GET /api/auction/lots/[id]/contract` | Vertragsparteien, Admin | `buyerId/sellerId === userId` |
| `PATCH /api/orders/[id]` | Nur Order-Eigentümer | `order.userId === userId` |
| `GET /api/admin/**` | ADMIN, COMPLIANCE, SUPER_ADMIN | Next.js Middleware (JWT) |
| `POST /api/admin/**` | ADMIN, COMPLIANCE, SUPER_ADMIN | Next.js Middleware (JWT) |

**Drei Sicherheitsschichten:**
1. **Datenbank** — `UserRole` enum, in JWT-Payload codiert bei Login
2. **Next.js Middleware** (`middleware.ts`) — prüft Rolle vor jedem Request, Redirect bei Verstoß
3. **Route Handler** — explizite Rolle-/Ownership-Prüfung in jedem `/api/`-Endpunkt

**Rollentrennung Frontend:**
- URL-Guard: `/dashboard/buyer/**` → nur BUYER; `/dashboard/seller/**` → nur SELLER
- Navigation: `EucxHeader` zeigt rollenspezifische Menüs (NAV["buyer"] vs. NAV["seller"])
- Badge: Käufer (blau `#154194`) / Verkäufer (gelb `#92400e`)

---

---

## Regulatory Compliance — CBAM 2026

> EU-Verordnung 2023/956 + Durchführungsverordnung (EU) 2023/1773  
> **Pflicht ab 2026** für alle in die EU eingeführten CBAM-Waren: Stahl, Aluminium, Zement, Düngemittel, Strom, Wasserstoff.

### Pflichtprüfung vor Production-Launch

- [ ] CBAM-Pflichtfelder in Lot-Erstellungsformular sichtbar und validiert
- [ ] `countryOfOrigin` + `co2PerTonne` + `productionSiteId` + `incoterms` in Datenbank gespeichert
- [ ] PDF-Kaufvertrag enthält §5 CBAM-Deklarationssektion
- [ ] `GET /api/auction/lots/[lotId]/cbam-export` liefert valides XML gemäß DVO 2023/1773
- [ ] Käufer-Dashboard zeigt CO₂-Fußabdruck-Widget
- [ ] Verkäufer-Tabelle zeigt CBAM-Informationsspalte

### CBAM-Felder im Prisma-Schema (Lot-Modell)

```prisma
co2PerTonne      Decimal? @db.Decimal(10, 4)  // kg CO₂-Äq./Einheit
countryOfOrigin  String?                       // ISO 3166-1 alpha-2 (z.B. "TR", "CN")
productionSiteId String?                       // EU-CBAM-Registry-ID der Produktionsstätte
incoterms        String?  @default("DAP")      // INCOTERMS® 2020
```

### CBAM-XML-Export

```
GET /api/auction/lots/[lotId]/cbam-export
Authorization: Bearer <JWT>
Response: application/xml — EUCX-CBAM-<LOTID>.xml
```

### Empfohlene nächste Schritte (Post-Launch)

1. **Pflichtvalidierung**: `countryOfOrigin` + `co2PerTonne` als Pflichtfelder sobald regulatorisch erzwungen
2. **Standardwert-Datenbank**: Bei fehlenden CO₂-Angaben → EU-Transitwerte aus CBAM-Datenbank (TAXUD)
3. **CBAM-Registry-API**: Direkt-Abfrage der EU-CBAM-Registry zur Prüfung von `productionSiteId`
4. **Quarterly Reporting**: Automatische CBAM-Quartalsmeldung per Bulk-XML-Export
5. **Zertifikats-Hinterlegung**: Produktionsstätten-Zertifikate als Dokument anhängen

### Wichtige Rechtsquellen

| Dokument | Fundstelle |
|----------|-----------|
| CBAM-Verordnung | EUR-Lex: 32023R0956 |
| Durchführungsverordnung | EUR-Lex: 32023R1773 |
| CBAM-Transitwerte (Stahl) | Europäische Kommission, TAXUD |
| CBAM-Registry | cbam.ec.europa.eu |

---

*Zuletzt aktualisiert: 2026-07-05 · EUCX Release v1.2 — CBAM-Integration vollständig*
