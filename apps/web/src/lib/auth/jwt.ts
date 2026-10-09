import { SignJWT, jwtVerify, type JWTPayload } from "jose";
import type { NextRequest } from "next/server";
import { COOKIE_ACCESS_TOKEN } from "@/lib/auth/cookie-names";

// ─── ApiError ─────────────────────────────────────────────────────────────────
// Wirft-Fehler für Route-Handler. apiRoute()-Wrapper fängt ihn und gibt
// { error } mit korrektem HTTP-Status zurück.

export class ApiError extends Error {
  constructor(public readonly status: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

// ─── requireAuth ──────────────────────────────────────────────────────────────
// Extrahiert und verifiziert den Access Token.
// Liest Cookie "access_token" zuerst (Cookie-Only), dann Authorization-Header
// als Fallback für backward-compat.
// Wirft ApiError(401) bei fehlendem oder ungültigem Token.

export async function requireAuth(req: NextRequest): Promise<TokenPayload> {
  const cookieToken = req.cookies.get(COOKIE_ACCESS_TOKEN)?.value;
  const authHeader  = req.headers.get("authorization");
  const bearerToken = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
  const raw = cookieToken ?? bearerToken;

  if (!raw) throw new ApiError(401, "Nicht autorisiert");

  try {
    return await verifyAccessToken(raw);
  } catch {
    throw new ApiError(401, "Token ungültig");
  }
}

// Produktions-Guard: in NODE_ENV=production müssen beide Secrets explizit gesetzt sein.
if (process.env.NODE_ENV === "production") {
  if (!process.env.JWT_SECRET) {
    throw new Error(
      "[FATAL] JWT_SECRET ist nicht gesetzt. Deployment in Produktion ohne explizites Secret ist nicht erlaubt."
    );
  }
  if (!process.env.REFRESH_JWT_SECRET) {
    throw new Error(
      "[FATAL] REFRESH_JWT_SECRET ist nicht gesetzt. Ohne getrenntes Refresh-Secret können Access-Tokens als Refresh-Tokens missbraucht werden."
    );
  }
}

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ?? "dev-secret-CHANGE-IN-PRODUCTION-min-32-chars"
);

// Separates Secret für Refresh-Tokens — verhindert, dass ein kompromittierter
// Access-Token als Refresh-Token akzeptiert wird (Key-Separation).
const REFRESH_JWT_SECRET = new TextEncoder().encode(
  process.env.REFRESH_JWT_SECRET ?? "dev-refresh-secret-CHANGE-IN-PRODUCTION-min-32-chars"
);

export interface TokenPayload extends JWTPayload {
  userId:  string;
  orgId:   string;
  role:    string;
  email:   string;
}

// Access Token: 15 Minuten (mit JTI für Revokation)
export async function signAccessToken(payload: Omit<TokenPayload, keyof JWTPayload>): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("15m")
    .setIssuer("eucx.eu")
    .setAudience("eucx-api")
    .setJti(globalThis.crypto.randomUUID())
    .sign(JWT_SECRET);
}

// Refresh Token: 30 Tage — signiert mit separatem REFRESH_JWT_SECRET
// sessionStart (ms) wird beim ersten Login gesetzt und bei Token-Rotation weitervererbt,
// um eine harte Obergrenze von 90 Tagen pro Sitzung durchzusetzen.
export async function signRefreshToken(userId: string, sessionStart?: number): Promise<string> {
  return new SignJWT({ userId, type: "refresh", sessionStart: sessionStart ?? Date.now() })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .setIssuer("eucx.eu")
    .sign(REFRESH_JWT_SECRET);
}

export async function verifyAccessToken(token: string): Promise<TokenPayload> {
  const { payload } = await jwtVerify(token, JWT_SECRET, {
    issuer:   "eucx.eu",
    audience: "eucx-api",
  });
  return payload as TokenPayload;
}

export async function verifyRefreshToken(token: string): Promise<{ userId: string; sessionStart: number }> {
  const { payload } = await jwtVerify(token, REFRESH_JWT_SECRET, {
    issuer: "eucx.eu",
  });
  return {
    userId:       payload["userId"] as string,
    sessionStart: (payload["sessionStart"] as number) ?? Date.now(),
  };
}

// ─── pending_2fa Token ────────────────────────────────────────────────────────
// Kurzlebiges Cookie-Token das den 2-Schritt-Login bindet:
// Schritt 1 (Passwort OK) → pending_2fa Cookie mit userId
// Schritt 2 (TOTP OK)     → pending_2fa Cookie löschen + vollständige Session ausstellen
// Ohne dieses Token könnte Schritt 2 mit beliebiger userId aufgerufen werden (IDOR).

export async function signPending2faToken(userId: string): Promise<string> {
  return new SignJWT({ userId, type: "pending_2fa" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("5m")
    .setIssuer("eucx.eu")
    .sign(JWT_SECRET);
}

export async function verifyPending2faToken(token: string): Promise<{ userId: string }> {
  const { payload } = await jwtVerify(token, JWT_SECRET, {
    issuer: "eucx.eu",
  });
  if (payload["type"] !== "pending_2fa") throw new Error("Falscher Token-Typ");
  return { userId: payload["userId"] as string };
}
