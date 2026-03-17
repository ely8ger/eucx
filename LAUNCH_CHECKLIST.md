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

*Zuletzt aktualisiert: 2026-03-17 · EUCX Release v1.0*
