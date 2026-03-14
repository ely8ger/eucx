import { NextRequest, NextResponse } from "next/server";
import { verifyAccessToken } from "@/lib/auth/jwt";

const PUBLIC_PATHS = ["/login", "/register", "/api/auth/login", "/api/auth/register"];

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
      await verifyAccessToken(auth.slice(7));
      return NextResponse.next();
    } catch {
      return NextResponse.json({ code: "INVALID_TOKEN", message: "Ungültiger Token" }, { status: 401 });
    }
  }

  const token = req.cookies.get("access_token")?.value;
  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }
  try {
    await verifyAccessToken(token);
    return NextResponse.next();
  } catch {
    const res = NextResponse.redirect(new URL("/login", req.url));
    res.cookies.delete("access_token");
    return res;
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
