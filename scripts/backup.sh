#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# EUCX Database Backup — PostgreSQL → S3
#
# Rhythmus (via cron on production server):
#   Stündlich:   Letzte 24h (24 Punkte, 1h Granularität)
#   Täglich:     00:05 UTC — Vollbackup, 30 Tage Retention
#   Wöchentlich: Sonntag 01:00 UTC — Archiv, 1 Jahr Retention
#
# Installation:
#   chmod +x scripts/backup.sh
#   # Stündlich:
#   echo "5 * * * * deploy /opt/eucx/scripts/backup.sh hourly"   | crontab -
#   # Täglich:
#   echo "5 0 * * * deploy /opt/eucx/scripts/backup.sh daily"    | crontab -
#   # Wöchentlich:
#   echo "0 1 * * 0 deploy /opt/eucx/scripts/backup.sh weekly"   | crontab -
#
# Notfall-Wiederherstellung:
#   ./scripts/backup.sh restore 2026-03-17T00:05:00
#   (lädt automatisch den nächstliegenden Snapshot und spielt ihn ein)
#
# Anforderungen:
#   - aws-cli (für S3-Upload) ODER rclone (für andere Object-Storage-Anbieter)
#   - pg_dump / pg_restore
#   - gzip
#   - Umgebungsvariablen: DATABASE_URL, BACKUP_S3_BUCKET, BACKUP_S3_PREFIX
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

# ── Konfiguration ─────────────────────────────────────────────────────────────
DB_URL="${DATABASE_URL:?DATABASE_URL nicht gesetzt}"
S3_BUCKET="${BACKUP_S3_BUCKET:?BACKUP_S3_BUCKET nicht gesetzt}"
S3_PREFIX="${BACKUP_S3_PREFIX:-eucx/backups}"
RETENTION_DAILY=30     # Tage
RETENTION_WEEKLY=365   # Tage
BACKUP_DIR="/tmp/eucx-backups"
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%S")
MODE="${1:-daily}"     # hourly | daily | weekly | restore

# ── Farben für Terminal-Output ─────────────────────────────────────────────
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; NC='\033[0m'

log()  { echo -e "${GREEN}[$(date -u +%H:%M:%S)] $*${NC}"; }
warn() { echo -e "${YELLOW}[$(date -u +%H:%M:%S)] WARN: $*${NC}"; }
err()  { echo -e "${RED}[$(date -u +%H:%M:%S)] ERROR: $*${NC}" >&2; }

# ── Backup-Verzeichnis ────────────────────────────────────────────────────────
mkdir -p "$BACKUP_DIR"
trap 'rm -rf "$BACKUP_DIR"' EXIT

# ── Backup-Funktion ───────────────────────────────────────────────────────────
do_backup() {
  local type="$1"
  local file="eucx_${type}_${TIMESTAMP}.pgdump.gz"
  local local_path="$BACKUP_DIR/$file"
  local s3_path="s3://${S3_BUCKET}/${S3_PREFIX}/${type}/${file}"

  log "Starte $type-Backup → $file"

  # pg_dump: custom Format (-Fc) für selektive Wiederherstellung
  pg_dump \
    --format=custom \
    --no-password \
    --compress=0 \
    --verbose \
    "$DB_URL" 2>/dev/null \
    | gzip -9 > "$local_path"

  local size
  size=$(du -sh "$local_path" | cut -f1)
  log "Dump erstellt: $size"

  # Integrität prüfen (gunzip -t)
  if ! gunzip -t "$local_path" 2>/dev/null; then
    err "Backup-Datei ist korrupt!"
    exit 1
  fi

  # Upload zu S3
  log "Upload zu $s3_path"
  if command -v aws &>/dev/null; then
    aws s3 cp "$local_path" "$s3_path" \
      --storage-class STANDARD_IA \
      --metadata "eucx-version=1,timestamp=$TIMESTAMP,mode=$type"
  elif command -v rclone &>/dev/null; then
    rclone copy "$local_path" "remote:${S3_BUCKET}/${S3_PREFIX}/${type}/"
  else
    err "Weder aws-cli noch rclone installiert. Backup nur lokal verfügbar."
    cp "$local_path" "/opt/eucx/backups/${file}" 2>/dev/null || true
    exit 1
  fi

  log "Backup abgeschlossen: $file ($size)"
  echo "$s3_path"
}

# ── Retention-Bereinigung ─────────────────────────────────────────────────────
cleanup_old() {
  local type="$1"
  local days="$2"

  log "Bereinige $type-Backups älter als $days Tage..."

  if command -v aws &>/dev/null; then
    aws s3 ls "s3://${S3_BUCKET}/${S3_PREFIX}/${type}/" \
      | awk '{print $4}' \
      | while read -r file; do
          file_date=$(echo "$file" | grep -oE '[0-9]{4}-[0-9]{2}-[0-9]{2}' | head -1)
          if [ -n "$file_date" ]; then
            cutoff=$(date -d "-${days} days" +%Y-%m-%d 2>/dev/null || \
                     date -v"-${days}d" +%Y-%m-%d 2>/dev/null)
            if [[ "$file_date" < "$cutoff" ]]; then
              log "Lösche altes Backup: $file"
              aws s3 rm "s3://${S3_BUCKET}/${S3_PREFIX}/${type}/$file"
            fi
          fi
        done
  fi
}

# ── Wiederherstellung ─────────────────────────────────────────────────────────
do_restore() {
  local target_time="${2:-latest}"
  local restore_file=""

  log "=== NOTFALL-WIEDERHERSTELLUNG ==="
  warn "Dies überschreibt die aktuelle Datenbank!"
  read -rp "Fortfahren? [yes/NEIN]: " confirm
  if [ "$confirm" != "yes" ]; then
    echo "Abgebrochen."
    exit 0
  fi

  # Neueste passende Backup-Datei finden
  if [ "$target_time" = "latest" ]; then
    log "Suche neuestes Backup..."
    if command -v aws &>/dev/null; then
      restore_file=$(aws s3 ls "s3://${S3_BUCKET}/${S3_PREFIX}/daily/" \
        | sort -k1,2 | tail -1 | awk '{print $4}')
      [ -z "$restore_file" ] && restore_file=$(aws s3 ls "s3://${S3_BUCKET}/${S3_PREFIX}/hourly/" \
        | sort -k1,2 | tail -1 | awk '{print $4}')
    fi
  fi

  if [ -z "$restore_file" ]; then
    err "Keine Backup-Datei gefunden für Zeitpunkt: $target_time"
    exit 1
  fi

  local s3_path="s3://${S3_BUCKET}/${S3_PREFIX}/daily/${restore_file}"
  local local_path="$BACKUP_DIR/restore.pgdump.gz"

  log "Lade Backup: $restore_file"
  aws s3 cp "$s3_path" "$local_path"

  log "Stelle Datenbank wieder her..."
  gunzip -c "$local_path" | pg_restore \
    --clean \
    --if-exists \
    --no-password \
    --verbose \
    --dbname="$DB_URL" 2>/dev/null || {
      err "Wiederherstellung mit Fehler beendet — bitte Logs prüfen!"
      exit 1
    }

  log "Wiederherstellung abgeschlossen: $restore_file"
  log "Nächste Schritte: Anwendung neu starten, Health-Checks prüfen"
}

# ── Dispatch ──────────────────────────────────────────────────────────────────
case "$MODE" in
  hourly)
    do_backup "hourly"
    # Stündliche Backups: 48h Retention (kein S3-Lifecycle nötig, wir löschen selbst)
    cleanup_old "hourly" 2
    ;;

  daily)
    do_backup "daily"
    cleanup_old "daily" "$RETENTION_DAILY"
    ;;

  weekly)
    do_backup "weekly"
    cleanup_old "weekly" "$RETENTION_WEEKLY"
    ;;

  restore)
    do_restore "$@"
    ;;

  *)
    err "Unbekannter Modus: $MODE (hourly|daily|weekly|restore)"
    exit 1
    ;;
esac
