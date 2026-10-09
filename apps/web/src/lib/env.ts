/**
 * Env-Validierung - Zod-Schema für alle kritischen Server-Variablen.
 *
 * Importiert in src/instrumentation.ts → wird beim Server-Start einmalig ausgeführt.
 * Fehlende Pflicht-Variablen werfen sofort einen FATAL-Fehler, nicht erst beim
 * ersten Request.
 *
 * Verwendung:
 *   import { env } from "@/lib/env";
 *   const secret = env.JWT_SECRET;
 */

import { z } from "zod";

// ─── Schema ───────────────────────────────────────────────────────────────────

const serverEnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),

  // ── Datenbank ────────────────────────────────────────────────────
  // Pflicht: ohne DB läuft nichts
  DATABASE_URL:  z.string().min(1, "DATABASE_URL fehlt"),
  DIRECT_URL:    z.string().min(1, "DIRECT_URL fehlt"),

  // ── Auth ──────────────────────────────────────────────────────────
  // JWT_SECRET bereits in jwt.ts geprüft; hier nochmal für frühzeitigen Boot-Fehler
  JWT_SECRET: z.string().min(32, "JWT_SECRET zu kurz (min. 32 Zeichen)"),

  // ── Redis / Upstash ───────────────────────────────────────────────
  // Optional: fehlen → Rate Limiting + Realtime im Fallback-Modus
  UPSTASH_REDIS_REST_URL:   z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),

  // ── E-Mail (Resend) ───────────────────────────────────────────────
  RESEND_API_KEY: z.string().optional(),

  // ── Cron-Sicherheit ───────────────────────────────────────────────
  CRON_SECRET: z.string().optional(),

  // ── Vercel Blob ──────────────────────────────────────────────────
  // put() wirft ohne Token - Pflicht in Production
  BLOB_READ_WRITE_TOKEN: z.string().optional(),

  // ── QStash ────────────────────────────────────────────────────────
  QSTASH_TOKEN:                 z.string().optional(),
  QSTASH_CURRENT_SIGNING_KEY:   z.string().optional(),

  // ── Interne Service-URLs ──────────────────────────────────────────
  NESTJS_INTERNAL_URL: z.string().url().optional(),

  // ── Öffentliche URLs ──────────────────────────────────────────────
  NEXT_PUBLIC_BASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_API_URL:  z.string().url().optional(),
  NEXT_PUBLIC_WS_URL:   z.string().optional(),

  // ── Steuernummer ─────────────────────────────────────────────────
  EUCX_VAT_ID: z.string().optional(),
});

// ─── Production-only: Pflicht-Checks ─────────────────────────────────────────

const productionOnlyChecks = (env: z.infer<typeof serverEnvSchema>) => {
  if (env.NODE_ENV !== "production") return;

  const required: (keyof typeof env)[] = [
    "RESEND_API_KEY",           // mailer.ts wirft ohne Key
    "CRON_SECRET",              // cron-handler prüft Signatur, kein Fallback
    "BLOB_READ_WRITE_TOKEN",    // put() in upload/route.ts wirft ohne Token
    "UPSTASH_REDIS_REST_URL",   // Rate Limiting + JTI-Blacklist instanzübergreifend
    "UPSTASH_REDIS_REST_TOKEN", // ohne Redis: Auth-Brute-Force + Session-Revokation defekt
  ];

  const missing = required.filter((k) => !env[k]);
  if (missing.length > 0) {
    throw new Error(
      `[FATAL] Fehlende Env-Variablen in Production: ${missing.join(", ")}`
    );
  }
};

// ─── Laden & Validieren ───────────────────────────────────────────────────────

function loadEnv(): z.infer<typeof serverEnvSchema> {
  const result = serverEnvSchema.safeParse(process.env);

  if (!result.success) {
    const formatted = result.error.issues
      .map((i) => `  • ${i.path.join(".")}: ${i.message}`)
      .join("\n");
    throw new Error(`[FATAL] Env-Validierung fehlgeschlagen:\n${formatted}`);
  }

  productionOnlyChecks(result.data);
  return result.data;
}

// Singleton - lädt einmalig beim ersten Import
let _env: z.infer<typeof serverEnvSchema> | null = null;

export function getEnv(): z.infer<typeof serverEnvSchema> {
  if (!_env) _env = loadEnv();
  return _env;
}

export const env = new Proxy({} as z.infer<typeof serverEnvSchema>, {
  get(_, key: string) {
    return getEnv()[key as keyof z.infer<typeof serverEnvSchema>];
  },
});
