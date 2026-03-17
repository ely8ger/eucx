/**
 * ApiKeyService — Verwaltung von API-Keys für externe Partneranbindung
 *
 * ─── Sicherheitsmodell ───────────────────────────────────────────────────────
 *
 *   Key-Format:  "eucx_live_{prefix6}_{secret32}"
 *     prefix6:   6 zufällige Hex-Zeichen — öffentlich (für Logs, UI)
 *     secret32:  32 zufällige Bytes (Base62) — einmalig an User, dann gehasht
 *
 *   Speicherung:
 *     prefix     → api_keys.prefix (Klartext, unique index)
 *     secretHash → api_keys.secret_hash (bcrypt cost=12)
 *     full key   → wird NICHT gespeichert
 *
 *   Authentifizierung (ApiKeyGuard):
 *     1. X-EUCX-API-KEY Header lesen
 *     2. Format validieren: "eucx_live_{prefix}_{secret}"
 *     3. ApiKey per prefix suchen (Index-Scan)
 *     4. bcrypt.compare(header_value, secretHash) → Zeit-konstant
 *     5. Scope-Check: requestedScope ∈ key.scopes?
 *     6. lastUsedAt aktualisieren
 *
 * ─── Scopes ──────────────────────────────────────────────────────────────────
 *
 *   market:read    — Marktdaten, OHLC, Ticker
 *   trade:read     — eigene Orders und Deals lesen
 *   trade:write    — Orders platzieren
 *   wallet:read    — Wallet-Stand und Ledger-Einträge
 *   webhook:manage — Webhook-Endpunkte verwalten
 *   admin:read     — nur für SUPER_ADMIN-Keys (Backoffice-Daten)
 */

import {
  Injectable,
  ConflictException,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { PrismaService } from "../../config/prisma.service";
import { randomBytes }   from "crypto";
import * as bcrypt       from "bcrypt";

export const API_KEY_SCOPES = [
  "market:read",
  "trade:read",
  "trade:write",
  "wallet:read",
  "webhook:manage",
  "admin:read",
] as const;

export type ApiScope = typeof API_KEY_SCOPES[number];

export interface CreateApiKeyDto {
  name:         string;
  scopes:       ApiScope[];
  expiresAt?:   Date;
  ipWhitelist?: string[];
}

export interface ApiKeyCreated {
  id:        string;
  prefix:    string;
  fullKey:   string;   // NUR einmal zurückgegeben — danach nicht mehr abrufbar
  name:      string;
  scopes:    string[];
  expiresAt: Date | null;
}

@Injectable()
export class ApiKeyService {
  constructor(private readonly prisma: PrismaService) {}

  // ─── Key erstellen ────────────────────────────────────────────────────────

  async createKey(
    organizationId: string,
    userId:         string,
    dto:            CreateApiKeyDto,
  ): Promise<ApiKeyCreated> {
    // Ungültige Scopes ablehnen
    const invalid = dto.scopes.filter((s) => !API_KEY_SCOPES.includes(s as ApiScope));
    if (invalid.length > 0) {
      throw new ConflictException(`Unbekannte Scopes: ${invalid.join(", ")}`);
    }

    // Limit: max 10 aktive Keys pro Organisation
    const activeCount = await this.prisma.apiKey.count({
      where: { organizationId, isActive: true },
    });
    if (activeCount >= 10) {
      throw new ConflictException("Maximal 10 aktive API-Keys pro Organisation erlaubt");
    }

    // Key generieren
    const prefix    = `eucx_live_${randomBytes(4).toString("hex")}`;    // 8 Hex = 4 Bytes
    const secret    = randomBytes(24).toString("base64url");             // 24 Bytes → 32 Base64url
    const fullKey   = `${prefix}_${secret}`;
    const secretHash = await bcrypt.hash(fullKey, 12);

    const key = await this.prisma.apiKey.create({
      data: {
        organizationId,
        createdByUserId: userId,
        prefix,
        secretHash,
        name:        dto.name,
        scopes:      dto.scopes,
        expiresAt:   dto.expiresAt ?? null,
        ipWhitelist: dto.ipWhitelist ?? [],
      },
      select: { id: true, prefix: true, name: true, scopes: true, expiresAt: true },
    });

    return {
      ...key,
      fullKey,   // Einmalig — nach diesem Response nicht mehr verfügbar
    };
  }

  // ─── Keys einer Organisation listen ──────────────────────────────────────

  async listKeys(organizationId: string) {
    return this.prisma.apiKey.findMany({
      where: { organizationId },
      select: {
        id:          true,
        prefix:      true,
        name:        true,
        scopes:      true,
        isActive:    true,
        expiresAt:   true,
        lastUsedAt:  true,
        ipWhitelist: true,
        createdAt:   true,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  // ─── Key deaktivieren (Revoke) ───────────────────────────────────────────

  async revokeKey(keyId: string, organizationId: string): Promise<void> {
    const key = await this.prisma.apiKey.findFirst({
      where: { id: keyId, organizationId },
    });
    if (!key) throw new NotFoundException("API-Key nicht gefunden");

    await this.prisma.apiKey.update({
      where: { id: keyId },
      data:  { isActive: false },
    });
  }

  // ─── Authentifizierung — wird vom ApiKeyGuard aufgerufen ─────────────────

  /**
   * Validiert einen API-Key aus dem X-EUCX-API-KEY Header.
   *
   * Performance:
   *   - prefix extrahieren → Index-Scan (1 Row lookup)
   *   - bcrypt.compare → ~100ms (cost=12, timing-safe)
   *   - lastUsedAt Update → fire-and-forget
   *
   * Gibt das ApiKey-Objekt zurück, wenn valide. Wirft UnauthorizedException sonst.
   */
  async validateKey(rawKey: string, requiredScope?: ApiScope) {
    // Format: "eucx_live_{8hex}_{secret}"
    if (!rawKey.startsWith("eucx_live_")) {
      throw new UnauthorizedException("Ungültiges API-Key Format");
    }

    // Prefix = erste 2 Segmente ("eucx_live_abc12345")
    const parts  = rawKey.split("_");
    if (parts.length < 4) {
      throw new UnauthorizedException("Ungültiges API-Key Format");
    }
    const prefix = parts.slice(0, 3).join("_");  // "eucx_live_{8hex}"

    const keyRecord = await this.prisma.apiKey.findUnique({
      where: { prefix },
      include: { organization: { select: { id: true, name: true, isVerified: true } } },
    });

    if (!keyRecord || !keyRecord.isActive) {
      throw new UnauthorizedException("API-Key ungültig oder deaktiviert");
    }

    // Ablaufdatum prüfen
    if (keyRecord.expiresAt && keyRecord.expiresAt < new Date()) {
      throw new UnauthorizedException("API-Key abgelaufen");
    }

    // HMAC-artiger Timing-sicherer Vergleich via bcrypt
    const isValid = await bcrypt.compare(rawKey, keyRecord.secretHash);
    if (!isValid) {
      throw new UnauthorizedException("API-Key ungültig");
    }

    // Scope-Check
    if (requiredScope && !keyRecord.scopes.includes(requiredScope)) {
      throw new UnauthorizedException(
        `API-Key hat keinen Zugriff auf Scope '${requiredScope}'. Vorhandene Scopes: ${keyRecord.scopes.join(", ")}`
      );
    }

    // lastUsedAt — fire-and-forget (kein await, kein Blocking)
    this.prisma.apiKey.update({
      where: { id: keyRecord.id },
      data:  { lastUsedAt: new Date() },
    }).catch(() => {});

    return keyRecord;
  }
}
