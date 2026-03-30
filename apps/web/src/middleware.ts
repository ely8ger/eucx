import { NextRequest, NextResponse } from "next/server";
import { verifyAccessToken } from "@/lib/auth/jwt";

const PUBLIC_PATHS = [
  "/",
  "/login",
  "/register",
  "/api/auth/login",
  "/api/auth/register",
  "/api/validate-vat",
  "/api/validate-lei",
  "/api/lookup-hrb",
];

const ADMIN_ROLES = ["ADMIN", "COMPLIANCE", "SUPER_ADMIN"] as const;

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/api/")) {
    const auth = req.headers.get("authorization");
    if (!auth?.startsWith("Bearer ")) {
      return NextResponse.json({ code: "UNAUTHORIZED", message: "Token fehlt" }, { status: 401 });
    }
    try {
      const payload = await verifyAccessToken(auth.slice(7));

      // /api/admin/** - RBAC: nur ADMIN/COMPLIANCE/SUPER_ADMIN
      if (pathname.startsWith("/api/admin/")) {
        if (!ADMIN_ROLES.includes(payload.role as (typeof ADMIN_ROLES)[number])) {
          return NextResponse.json(
            { code: "FORBIDDEN", message: "Keine Administrationsberechtigung" },
            { status: 403 },
          );
        }
      }

      return NextResponse.next();
    } catch {
      return NextResponse.json({ code: "INVALID_TOKEN", message: "Ungültiger Token" }, { status: 401 });
    }
  }

  const token = req.cookies.get("access_token")?.value;
  if (!token) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }
  try {
    const payload = await verifyAccessToken(token);

    // /admin/** - RBAC: nur ADMIN/COMPLIANCE/SUPER_ADMIN
    if (pathname.startsWith("/admin")) {
      if (!ADMIN_ROLES.includes(payload.role as (typeof ADMIN_ROLES)[number])) {
        return NextResponse.redirect(new URL("/dashboard?error=forbidden", req.url));
      }
    }

    return NextResponse.next();
  } catch {
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
