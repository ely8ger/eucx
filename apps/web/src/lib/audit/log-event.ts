/**
 * Strukturiertes Security-Audit-Logging
 *
 * Sicherheitsereignisse werden auf zwei Wegen protokolliert:
 *   1. console.error / console.warn mit Präfix [SECURITY] — erscheint in Vercel-Logs
 *      und kann an jeden SIEM (Datadog, Logtail, Axiom) weitergeleitet werden.
 *   2. db.auditLog.create — persistente DB-Aufzeichnung für Forensik (nur in
 *      API-Routes, nicht in Middleware/Edge Runtime).
 *
 * Alle Aufrufe sind fire-and-forget (kein await nötig) — blockieren nie die Response.
 */

export type SecurityEvent =
  | "RATE_LIMITED"
  | "AUTH_INVALID_TOKEN"
  | "AUTH_TOKEN_REVOKED"
  | "AUTH_FORBIDDEN"
  | "AUTH_LOGIN_FAILED"
  | "AUTH_LOGIN_SUCCESS"
  | "AUTH_LOGOUT"
  | "AUTH_ACCOUNT_LOCKED";

interface SecurityLogPayload {
  event:    SecurityEvent;
  ip?:      string;
  userId?:  string;
  path?:    string;
  bucket?:  string;
  detail?:  string;
}

/**
 * Schreibt ein Sicherheitsereignis in die Console (Edge + Node.js kompatibel).
 * Vercel leitet alle Console-Ausgaben in den Log-Drain weiter.
 */
export function logSecurityEvent(payload: SecurityLogPayload): void {
  const entry = {
    ...payload,
    timestamp: new Date().toISOString(),
    env:       process.env.NODE_ENV,
  };

  const isCritical =
    payload.event === "AUTH_TOKEN_REVOKED" ||
    payload.event === "AUTH_ACCOUNT_LOCKED" ||
    payload.event === "AUTH_FORBIDDEN";

  if (isCritical) {
    console.error("[SECURITY]", JSON.stringify(entry));
  } else {
    console.warn("[SECURITY]", JSON.stringify(entry));
  }
}

/**
 * Persistiert ein Sicherheitsereignis in der Datenbank.
 * NUR in Node.js API-Routes verwenden (nicht in Middleware/Edge Runtime).
 * Fire-and-forget — nie awaiten wenn nicht nötig.
 */
export async function persistAuditLog(params: {
  action:     SecurityEvent;
  userId?:    string;
  entityType: string;
  entityId?:  string;
  ipAddress?: string;
  userAgent?: string;
  meta?:      Record<string, unknown>;
}): Promise<void> {
  try {
    const { db } = await import("@/lib/db/client");
    await db.auditLog.create({
      data: {
        userId:     params.userId ?? null,
        action:     params.action,
        entityType: params.entityType,
        entityId:   params.entityId ?? null,
        ipAddress:  params.ipAddress ?? null,
        userAgent:  params.userAgent ?? null,
        meta:       params.meta ? (params.meta as Parameters<typeof db.auditLog.create>[0]["data"]["meta"]) : undefined,
      },
    });
  } catch {
    // Logging darf nie die Business-Logik unterbrechen
    console.error("[SECURITY] AuditLog-Persist fehlgeschlagen", params.action);
  }
}
