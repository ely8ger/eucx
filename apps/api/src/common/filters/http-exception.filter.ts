/**
 * Global HTTP ExceptionFilter — Fehler-Maskierung & strukturiertes Logging
 *
 * Sicherheitsprinzip:
 *   CLIENT sieht: { error: "...", code: "...", requestId: "..." }
 *   SERVER loggt: vollständiger Stack-Trace, DB-Fehlermeldung, Klasse
 *
 * Warum wichtig?
 *   Ein roher Prisma-Fehler könnte Tabellennamen, Constraint-Namen oder
 *   sogar Query-Parameter leaken → Information Disclosure (OWASP A05).
 *
 * Error-Mapping:
 *   HttpException         → Status + Message aus Exception (by design)
 *   Prisma P2002          → 409 "Bereits vorhanden" (unique constraint)
 *   Prisma P2025          → 404 "Nicht gefunden"
 *   ValidationError       → 422 "Validierungsfehler"
 *   Alles andere          → 500 "Interner Fehler" (kein Detail nach außen)
 */

import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from "@nestjs/common";
import { Request, Response } from "express";
import { randomUUID } from "crypto";

// Prisma-Fehlercodes die wir gezielt behandeln
const PRISMA_CODES: Record<string, { status: number; message: string }> = {
  P2002: { status: 409, message: "Ein Datensatz mit diesen Daten existiert bereits" },
  P2003: { status: 409, message: "Abhängiger Datensatz fehlt (FK-Verletzung)" },
  P2025: { status: 404, message: "Datensatz nicht gefunden" },
  P2034: { status: 503, message: "Transaktion fehlgeschlagen — bitte erneut versuchen" },
  P1001: { status: 503, message: "Datenbankverbindung fehlgeschlagen" },
};

@Catch()
export class GlobalHttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger("ExceptionFilter");

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx  = host.switchToHttp();
    const req  = ctx.getRequest<Request>();
    const res  = ctx.getResponse<Response>();

    // Eindeutige Request-ID für Log-Correlation
    const requestId = (req.headers["x-request-id"] as string) ?? randomUUID();

    let status  = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = "Interner Serverfehler";
    let code    = "INTERNAL_ERROR";

    // ── HttpException (NestJS/bewusst geworfen) ───────────────────────────────
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const body = exception.getResponse();

      if (typeof body === "string") {
        message = body;
      } else if (typeof body === "object" && body !== null) {
        const b = body as Record<string, unknown>;
        message = (b["message"] as string) ?? exception.message;
        // Validation-Fehler von class-validator (Array)
        if (Array.isArray(b["message"])) {
          message = (b["message"] as string[]).join("; ");
        }
      }

      code = exception.name.replace("Exception", "").toUpperCase();

      // HttpExceptions: nur auf Warn-Ebene loggen (4xx sind normal)
      if (status < 500) {
        this.logger.warn(
          `[${requestId}] ${req.method} ${req.url} → ${status}: ${message}`
        );
      } else {
        this.logger.error(
          `[${requestId}] ${req.method} ${req.url} → ${status}: ${message}`,
          exception instanceof Error ? exception.stack : ""
        );
      }
    }

    // ── Prisma-Fehler (DB-Fehler niemals roh an Client) ───────────────────────
    else if (isPrismaError(exception)) {
      const prismaCode = (exception as { code: string }).code;
      const mapped     = PRISMA_CODES[prismaCode];

      status  = mapped?.status  ?? 500;
      message = mapped?.message ?? "Datenbankfehler";
      code    = `DB_${prismaCode}`;

      // Intern detailliert loggen (inkl. Tabelle/Constraint — nur für Entwickler)
      this.logger.error(
        `[${requestId}] Prisma ${prismaCode} | ${req.method} ${req.url}`,
        JSON.stringify({
          code:    prismaCode,
          meta:    (exception as { meta?: unknown }).meta,
          message: (exception as Error).message,
        })
      );
    }

    // ── Unbekannte Fehler (crash, null-deref, etc.) ───────────────────────────
    else {
      this.logger.error(
        `[${requestId}] Unhandled ${req.method} ${req.url}`,
        exception instanceof Error
          ? exception.stack
          : JSON.stringify(exception)
      );
      // Status/Message bleibt 500 / "Interner Serverfehler" — kein Leak
    }

    // ── Response an Client ────────────────────────────────────────────────────
    res.status(status).json({
      error:     message,
      code,
      requestId,                        // für Support-Anfragen
      timestamp: new Date().toISOString(),
      path:      req.url,
    });
  }
}

/** Erkennt Prisma ClientKnownRequestError anhand der Struktur */
function isPrismaError(err: unknown): boolean {
  return (
    err !== null &&
    typeof err === "object" &&
    "code" in (err as object) &&
    "clientVersion" in (err as object) &&
    typeof (err as { code: unknown }).code === "string" &&
    (err as { code: string }).code.startsWith("P")
  );
}
