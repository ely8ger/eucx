import { NextRequest, NextResponse }                         from "next/server";
import { verifyAccessToken }                                from "@/lib/auth/jwt";
import { checkRateLimit, rateLimitHeaders, type LimitBucket } from "@/lib/rate-limit";
import { getClientIp }                                      from "@/lib/net/get-client-ip";
import { isJtiBlacklistedEdge }                             from "@/lib/auth/token-blacklist";
import { logSecurityEvent }                                 from "@/lib/audit/log-event";

const PUBLIC_EXACT = new Set(["/", "/login", "/register"]);

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
  // Interne Server-zu-Server-Endpunkte — haben eigene Auth (CRON_SECRET / QStash-Signatur)
  "/api/auction/cron",
  "/api/workers/",
  // Test-Utilities — nur in Dev, Route selbst prüft NODE_ENV
  ...(process.env.NODE_ENV !== "production" ? ["/api/test/"] : []),
  // Produktkatalog — öffentliche Referenzdaten, kein sensitiver Inhalt
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
];

const ADMIN_ROLES = ["ADMIN", "COMPLIANCE", "SUPER_ADMIN"] as const;

// ─── Rate-Limit-Bucket pro Pfad ───────────────────────────────────────────────

function getBucket(pathname: string): LimitBucket {
  if (pathname === "/api/auth/login" || pathname === "/api/auth/register") return "auth";
  if (pathname.includes("/bids"))                                           return "bid";
  return "api";
}

// ─── Middleware ───────────────────────────────────────────────────────────────

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const ip           = getClientIp(req);

  // ── Rate Limiting (vor allem anderen) ────────────────────────────────────
  // Gilt für Auth-Endpunkte und Bids auch wenn sie PUBLIC_PREFIXES sind.
  const isRateLimited =
    pathname === "/api/auth/login"    ||
    pathname === "/api/auth/register" ||
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
    return NextResponse.next();
  }

  // ── API: JWT-Verifikation ─────────────────────────────────────────────────
  if (pathname.startsWith("/api/")) {
    // SSE-Endpoints senden Token als Query-Parameter (EventSource unterstützt keine Header)
    const queryToken = req.nextUrl.searchParams.get("token");
    const authHeader = req.headers.get("authorization");
    const auth = authHeader ?? (queryToken ? `Bearer ${queryToken}` : null);
    if (!auth?.startsWith("Bearer ")) {
      logSecurityEvent({ event: "AUTH_INVALID_TOKEN", ip, path: pathname, detail: "Kein Bearer-Token" });
      return NextResponse.json({ code: "UNAUTHORIZED", message: "Token fehlt" }, { status: 401 });
    }
    try {
      const payload = await verifyAccessToken(auth.slice(7));

      // JTI-Blacklist prüfen (Token nach Logout gesperrt)
      if (payload.jti) {
        const revoked = await isJtiBlacklistedEdge(payload.jti, req.nextUrl.origin);
        if (revoked) {
          logSecurityEvent({
            event:  "AUTH_TOKEN_REVOKED",
            ip,
            userId: payload.userId,
            path:   pathname,
            detail: `JTI ${payload.jti}`,
          });
          return NextResponse.json(
            { code: "TOKEN_REVOKED", message: "Sitzung wurde beendet. Bitte erneut anmelden." },
            { status: 401 },
          );
        }
      }

      // Allgemeines API-Rate-Limit (authentifiziert — großzügiger)
      const apiRl = await checkRateLimit(`user:${payload.userId}`, "api");
      if (!apiRl.allowed) {
        logSecurityEvent({
          event:  "RATE_LIMITED",
          ip,
          userId: payload.userId,
          path:   pathname,
          bucket: "api",
        });
        return NextResponse.json(
          { code: "RATE_LIMITED", message: "Zu viele Anfragen. Bitte warten Sie kurz." },
          { status: 429, headers: rateLimitHeaders(apiRl) },
        );
      }

      return NextResponse.next();
    } catch {
      logSecurityEvent({ event: "AUTH_INVALID_TOKEN", ip, path: pathname, detail: "JWT-Verifikation fehlgeschlagen" });
      return NextResponse.json({ code: "INVALID_TOKEN", message: "Ungültiger Token" }, { status: 401 });
    }
  }

  // ── Seiten: Cookie-basierte Auth ──────────────────────────────────────────
  const token        = req.cookies.get("access_token")?.value;
  const refreshToken = req.cookies.get("refresh_token")?.value;

  if (!token) {
    if (refreshToken) return NextResponse.next();
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
        res.cookies.delete("access_token");
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

    return NextResponse.next();
  } catch {
    if (refreshToken) return NextResponse.next();
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("next", pathname);
    const res = NextResponse.redirect(loginUrl);
    res.cookies.delete("access_token");
    return res;
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
