import { NextRequest, NextResponse }                         from "next/server";
import { verifyAccessToken }                                from "@/lib/auth/jwt";
import { checkRateLimit, rateLimitHeaders, type LimitBucket } from "@/lib/rate-limit";
import { getClientIp }                                      from "@/lib/net/get-client-ip";
import { isJtiBlacklistedEdge }                             from "@/lib/auth/token-blacklist";
import { logSecurityEvent }                                 from "@/lib/audit/log-event";
import { COOKIE_ACCESS_TOKEN, COOKIE_REFRESH_TOKEN }        from "@/lib/auth/cookie-names";

const PUBLIC_EXACT = new Set(["/", "/login", "/register", "/forgot-password", "/reset-password"]);

const PUBLIC_PREFIXES = [
  // Auth-Endpunkte
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/logout",    // Logout muss auch mit abgelaufenem Access-Token erreichbar sein
  "/api/auth/refresh",
  "/api/auth/forgot-password",
  "/api/auth/reset-password",
  "/api/auth/verify-email",
  "/api/auth/2fa",
  // Validierungs-APIs (ohne Login nutzbar)
  "/api/validate-vat",
  "/api/validate-lei",
  "/api/lookup-hrb",
  "/api/enrich-company",
  "/api/og",
  // Interne Server-zu-Server-Endpunkte - haben eigene Auth (CRON_SECRET / QStash-Signatur)
  "/api/auction/cron",
  "/api/workers/",
  // Test-Utilities - nur in Dev, Route selbst prüft NODE_ENV
  ...(process.env.NODE_ENV !== "production" ? ["/api/test/"] : []),
  // Server-Gesundheitscheck - kein sensitiver Inhalt, für Smoke-Tests
  "/api/health",
  // Produktkatalog - öffentliche Referenzdaten, kein sensitiver Inhalt
  "/api/catalog",
  // Öffentliche Inhaltsseiten
  "/agb",
  "/datenschutz",
  "/impressum",
  "/faq",
  "/wissen",
  "/insights",
  "/marktpreise",
  "/metalle",
  "/duenger",
  "/katalog",
  "/trading",
  "/api/market",
  // Öffentliches Regelwerk
  "/regelwerk",
  // Cookie-Richtlinie
  "/cookie-richtlinie",
];

const ADMIN_ROLES = ["ADMIN", "COMPLIANCE", "SUPER_ADMIN"] as const;

// ─── Rate-Limit-Bucket pro Pfad ───────────────────────────────────────────────

function getBucket(pathname: string): LimitBucket {
  if (pathname === "/api/auth/login" || pathname === "/api/auth/register") return "auth";
  if (pathname.includes("/bids"))                                           return "bid";
  return "api";
}

// ─── CSP mit Nonce ────────────────────────────────────────────────────────────
// Nonce: einmaliger Base64-Wert pro Request.
// script-src ohne 'unsafe-inline' und ohne 'unsafe-eval' —
// Next.js hängt den Nonce automatisch an seine eigenen <script>-Tags,
// wenn <html nonce={nonce}> im Root-Layout gesetzt ist.

function buildCsp(nonce: string): string {
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}'`,
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "img-src 'self' data: blob: https:",
    "connect-src 'self' wss://eucx.eu",
    "font-src 'self' data: https://fonts.gstatic.com",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'",
    "worker-src 'none'",
    "upgrade-insecure-requests",
  ].join("; ");
}

// Nonce als Request-Header weitergeben (Server Components lesen ihn via headers())
function nextWithNonce(req: NextRequest, nonce: string): NextResponse {
  const reqHeaders = new Headers(req.headers);
  reqHeaders.set("x-nonce", nonce);
  return NextResponse.next({ request: { headers: reqHeaders } });
}

// ─── Middleware ───────────────────────────────────────────────────────────────
// Äußere Funktion: generiert Nonce, delegiert an _route(), hängt CSP an jede Response.

export async function middleware(req: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const res   = await _route(req, nonce);
  res.headers.set("Content-Security-Policy", buildCsp(nonce));
  return res;
}

async function _route(req: NextRequest, nonce: string): Promise<NextResponse> {
  const { pathname } = req.nextUrl;
  const ip           = getClientIp(req);

  // ── Rate Limiting (vor allem anderen) ────────────────────────────────────
  // Gilt für Auth-Endpunkte und Bids auch wenn sie PUBLIC_PREFIXES sind.
  const isRateLimited =
    pathname === "/api/auth/login"           ||
    pathname === "/api/auth/register"        ||
    pathname === "/api/auth/forgot-password" ||
    pathname === "/api/auth/reset-password"  ||
    pathname.includes("/bids");

  if (isRateLimited) {
    const bucket = getBucket(pathname);
    const rl     = await checkRateLimit(ip, bucket);
    if (!rl.allowed) {
      logSecurityEvent({ event: "RATE_LIMITED", ip, path: pathname, bucket });
      return NextResponse.json(
        { code: "RATE_LIMITED", message: "Zu viele Anfragen. Bitte warten Sie kurz." },
        { status: 429, headers: rateLimitHeaders(rl) },
      );
    }
  }

  // ── Öffentliche Routen durchlassen ────────────────────────────────────────
  if (PUBLIC_EXACT.has(pathname) || PUBLIC_PREFIXES.some((p) => pathname.startsWith(p))) {
    return nextWithNonce(req, nonce);
  }

  // ── API: JWT-Verifikation ─────────────────────────────────────────────────
  if (pathname.startsWith("/api/")) {
    // Cookie-Only Architecture: Cookie first, Bearer-Header als Fallback (für E2E-Tests)
    // Kein ?token= Query-Parameter — Tokens in URLs landen in Server-Logs
    const cookieToken = req.cookies.get(COOKIE_ACCESS_TOKEN)?.value;
    const authHeader  = req.headers.get("authorization");
    const rawToken    = cookieToken ?? (authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null);
    if (!rawToken) {
      logSecurityEvent({ event: "AUTH_INVALID_TOKEN", ip, path: pathname, detail: "Kein Token" });
      return NextResponse.json({ code: "UNAUTHORIZED", message: "Token fehlt" }, { status: 401 });
    }
    try {
      const payload = await verifyAccessToken(rawToken);

      // JTI-Blacklist prüfen (Token nach Logout gesperrt)
      if (payload.jti) {
        const revoked = await isJtiBlacklistedEdge(payload.jti, req.nextUrl.origin);
        if (revoked) {
          logSecurityEvent({
            event:  "AUTH_TOKEN_REVOKED",
            ip,
            userId: payload.userId,
            path:   pathname,
            detail: `JTI ${payload.jti}` });
          return NextResponse.json(
            { code: "TOKEN_REVOKED", message: "Sitzung wurde beendet. Bitte erneut anmelden." },
            { status: 401 },
          );
        }
      }

      // Allgemeines API-Rate-Limit (authentifiziert - großzügiger)
      const apiRl = await checkRateLimit(`user:${payload.userId}`, "api");
      if (!apiRl.allowed) {
        logSecurityEvent({
          event:  "RATE_LIMITED",
          ip,
          userId: payload.userId,
          path:   pathname,
          bucket: "api" });
        return NextResponse.json(
          { code: "RATE_LIMITED", message: "Zu viele Anfragen. Bitte warten Sie kurz." },
          { status: 429, headers: rateLimitHeaders(apiRl) },
        );
      }

      return nextWithNonce(req, nonce);
    } catch {
      logSecurityEvent({ event: "AUTH_INVALID_TOKEN", ip, path: pathname, detail: "JWT-Verifikation fehlgeschlagen" });
      return NextResponse.json({ code: "INVALID_TOKEN", message: "Ungültiger Token" }, { status: 401 });
    }
  }

  // ── Seiten: Cookie-basierte Auth ──────────────────────────────────────────
  const token        = req.cookies.get(COOKIE_ACCESS_TOKEN)?.value;
  const refreshToken = req.cookies.get(COOKIE_REFRESH_TOKEN)?.value;

  if (!token) {
    if (refreshToken) return nextWithNonce(req, nonce);
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  try {
    const payload = await verifyAccessToken(token);

    // JTI-Blacklist für Cookie-basierte Sitzungen
    if (payload.jti) {
      const revoked = await isJtiBlacklistedEdge(payload.jti, req.nextUrl.origin);
      if (revoked) {
        const loginUrl = new URL("/login", req.url);
        loginUrl.searchParams.set("next", pathname);
        const res = NextResponse.redirect(loginUrl);
        res.cookies.delete(COOKIE_ACCESS_TOKEN);
        return res;
      }
    }

    if (pathname.startsWith("/dashboard/buyer")) {
      if (payload.role !== "BUYER" && !ADMIN_ROLES.includes(payload.role as (typeof ADMIN_ROLES)[number])) {
        return NextResponse.redirect(new URL("/dashboard/seller", req.url));
      }
    }

    if (pathname.startsWith("/dashboard/seller")) {
      if (payload.role !== "SELLER" && !ADMIN_ROLES.includes(payload.role as (typeof ADMIN_ROLES)[number])) {
        return NextResponse.redirect(new URL("/dashboard/buyer", req.url));
      }
    }

    const OLD_ROUTES = ["/orders", "/trading", "/portfolio", "/deals", "/reports", "/products", "/personal", "/kyc"];
    const isOldDashboard = pathname === "/dashboard";
    const isOldRoute     = OLD_ROUTES.some((p) => pathname === p || pathname.startsWith(p + "/"));

    if (isOldDashboard || isOldRoute) {
      if (payload.role === "SELLER") {
        return NextResponse.redirect(new URL("/dashboard/seller", req.url));
      }
      return NextResponse.redirect(new URL("/dashboard/buyer", req.url));
    }

    return nextWithNonce(req, nonce);
  } catch {
    if (refreshToken) return nextWithNonce(req, nonce);
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("next", pathname);
    const res = NextResponse.redirect(loginUrl);
    res.cookies.delete(COOKIE_ACCESS_TOKEN);
    return res;
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"] };
