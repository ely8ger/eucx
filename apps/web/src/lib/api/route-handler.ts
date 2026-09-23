/**
 * apiRoute() - Globaler Fehler-Fallback für alle Next.js Route-Handler.
 *
 * Fängt jede ungefangene Exception auf und gibt { error: string } als JSON zurück.
 * Verhindert, dass Next.js eine 500 text/html-Seite zurückgibt, die kein Client
 * als JSON parsen kann.
 *
 * Verwendung:
 *   export const GET  = apiRoute(async (req) => { ... });
 *   export const POST = apiRoute(async (req, { params }) => { ... });
 */
import { NextRequest, NextResponse } from "next/server";

type RouteContext<P = Record<string, string>> = {
  params: Promise<P>;
};

type Handler<P = Record<string, string>> = (
  req: NextRequest,
  ctx: RouteContext<P>,
) => Promise<NextResponse> | NextResponse;

export function apiRoute<P = Record<string, string>>(handler: Handler<P>): Handler<P> {
  return async (req: NextRequest, ctx: RouteContext<P>): Promise<NextResponse> => {
    try {
      return await handler(req, ctx);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Interner Serverfehler";
      console.error("[API]", req.method, req.nextUrl.pathname, err);
      return NextResponse.json({ error: msg }, { status: 500 });
    }
  };
}
