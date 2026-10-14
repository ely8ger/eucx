/**
 * validateApiKey — API-Key-Authentifizierung für programmatischen Zugang
 *
 * Liest den X-API-Key Header, sucht nach dem Präfix in der DB,
 * verifiziert den bcrypt-Hash und prüft Aktivität, Ablaufdatum und IP-Whitelist.
 * Aktualisiert lastUsedAt bei Erfolg.
 *
 * Format: eucx_live_{prefix6}_{random32}
 */
import bcrypt                from "bcryptjs";
import { NextRequest }       from "next/server";
import { db }                from "@/lib/db/client";
import { getClientIp }       from "@/lib/net/get-client-ip";

export type ApiKeyPayload = {
  keyId:          string;
  organizationId: string;
  scopes:         string[];
};

export class ApiKeyError extends Error {
  constructor(
    public readonly code: "MISSING" | "INVALID" | "INACTIVE" | "EXPIRED" | "IP_BLOCKED",
    message: string,
  ) {
    super(message);
  }
}

export async function validateApiKey(req: NextRequest): Promise<ApiKeyPayload> {
  const header = req.headers.get("x-api-key");
  if (!header) throw new ApiKeyError("MISSING", "X-API-Key Header fehlt");

  // Format: eucx_live_{prefix6}_{rest}
  const parts = header.split("_");
  if (parts.length < 4 || parts[0] !== "eucx" || parts[1] !== "live") {
    throw new ApiKeyError("INVALID", "Ungültiges API-Key-Format");
  }
  const prefix = parts[2]!;

  const key = await db.apiKey.findUnique({
    where: { prefix },
  });

  if (!key) throw new ApiKeyError("INVALID", "Ungültiger API-Key");

  const valid = await bcrypt.compare(header, key.secretHash);
  if (!valid) throw new ApiKeyError("INVALID", "Ungültiger API-Key");

  if (!key.isActive) throw new ApiKeyError("INACTIVE", "API-Key ist deaktiviert");

  if (key.expiresAt && key.expiresAt < new Date()) {
    throw new ApiKeyError("EXPIRED", "API-Key ist abgelaufen");
  }

  // IP-Whitelist prüfen (leeres Array = alle IPs erlaubt)
  if (key.ipWhitelist && Array.isArray(key.ipWhitelist) && key.ipWhitelist.length > 0) {
    const clientIp = getClientIp(req);
    if (!key.ipWhitelist.includes(clientIp)) {
      throw new ApiKeyError("IP_BLOCKED", "Diese IP-Adresse ist nicht zugelassen");
    }
  }

  // lastUsedAt asynchron aktualisieren — kein await, blockiert nicht den Request
  db.apiKey.update({
    where: { id: key.id },
    data:  { lastUsedAt: new Date() },
  }).catch((err: unknown) => console.error("[validate-api-key] lastUsedAt Update:", err));

  return {
    keyId:          key.id,
    organizationId: key.organizationId,
    scopes:         key.scopes as string[],
  };
}
