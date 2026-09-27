/**
 * EUCX Strukturierter Logger
 *
 * Gibt JSON-Logs aus, die von Vercel Log Drains / Axiom / Datadog / Logtail
 * direkt verarbeitet werden können.
 *
 * Jeder Log-Eintrag enthält:
 *   level, service, ts, correlationId (wenn gesetzt), + beliebige Felder
 *
 * Verwendung:
 *   import { logger } from "@/lib/logger";
 *   logger.info("order.placed", { orderId, userId });
 *   logger.error("clearing.failed", err, { dealId });
 */

// ─── Typen ────────────────────────────────────────────────────────────────────

type LogLevel = "DEBUG" | "INFO" | "WARN" | "ERROR";

interface LogEntry {
  level:           LogLevel;
  service:         string;
  event:           string;
  ts:              string;
  correlationId?:  string;
  [key: string]:   unknown;
}

// ─── Formatierung ─────────────────────────────────────────────────────────────

function write(level: LogLevel, event: string, fields: Record<string, unknown> = {}) {
  const entry: LogEntry = {
    level,
    service: "eucx-web",
    event,
    ts:      new Date().toISOString(),
    ...fields,
  };

  const line = JSON.stringify(entry);

  switch (level) {
    case "ERROR":
      console.error(line);
      break;
    case "WARN":
      console.warn(line);
      break;
    default:
      console.log(line);
  }
}

// ─── Fehler-Serialisierung ────────────────────────────────────────────────────

function serializeError(err: unknown): Record<string, unknown> {
  if (err instanceof Error) {
    return {
      error:   err.message,
      stack:   process.env.NODE_ENV !== "production" ? err.stack : undefined,
      errName: err.name,
    };
  }
  return { error: String(err) };
}

// ─── Öffentliche API ──────────────────────────────────────────────────────────

export const logger = {
  debug(event: string, fields?: Record<string, unknown>) {
    if (process.env.NODE_ENV === "production") return; // Debug nur in Dev
    write("DEBUG", event, fields);
  },

  info(event: string, fields?: Record<string, unknown>) {
    write("INFO", event, fields);
  },

  warn(event: string, fields?: Record<string, unknown>) {
    write("WARN", event, fields);
  },

  error(event: string, err?: unknown, fields?: Record<string, unknown>) {
    write("ERROR", event, {
      ...(err !== undefined ? serializeError(err) : {}),
      ...fields,
    });
  },
};

// ─── Safe API-Error-Response (kein Stack Trace in Production) ─────────────────

export interface ApiErrorResponse {
  code:     string;
  message:  string;
  details?: unknown; // nur in Entwicklung
}

/**
 * Baut eine sichere Fehlerantwort für den Client.
 * Stack Traces und interne Meldungen werden in Production nie zurückgegeben.
 */
export function safeErrorResponse(
  err:     unknown,
  code:    string,
  message: string,
): ApiErrorResponse {
  if (process.env.NODE_ENV !== "production" && err instanceof Error) {
    return { code, message, details: err.message };
  }
  return { code, message };
}
