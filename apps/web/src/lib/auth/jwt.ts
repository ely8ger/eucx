import { SignJWT, jwtVerify, type JWTPayload } from "jose";
import type { NextRequest } from "next/server";

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
  const cookieToken = req.cookies.get("access_token")?.value;
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

// Produktions-Guard: in NODE_ENV=production muss JWT_SECRET explizit gesetzt sein.
if (process.env.NODE_ENV === "production" && !process.env.JWT_SECRET) {
  throw new Error(
    "[FATAL] JWT_SECRET ist nicht gesetzt. Deployment in Produktion ohne explizites Secret ist nicht erlaubt."
  );
}

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ?? "dev-secret-CHANGE-IN-PRODUCTION-min-32-chars"
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

// Refresh Token: 30 Tage
export async function signRefreshToken(userId: string): Promise<string> {
  return new SignJWT({ userId, type: "refresh" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .setIssuer("eucx.eu")
    .sign(JWT_SECRET);
}

export async function verifyAccessToken(token: string): Promise<TokenPayload> {
  const { payload } = await jwtVerify(token, JWT_SECRET, {
    issuer:   "eucx.eu",
    audience: "eucx-api",
  });
  return payload as TokenPayload;
}

export async function verifyRefreshToken(token: string): Promise<{ userId: string }> {
  const { payload } = await jwtVerify(token, JWT_SECRET, {
    issuer: "eucx.eu",
  });
  return { userId: payload["userId"] as string };
}
