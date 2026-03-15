/**
 * EUCX Differenzierter Rate Limiter
 *
 * Regel:
 *   Anonyme IPs      → max 100 Anfragen / 60 Sekunden
 *   Authentifizierte → max 1000 Anfragen / 60 Sekunden (10x mehr)
 *
 * Implementierung:
 *   Überschreibt ThrottlerGuard.getTracker() — statt IP verwenden
 *   wir "userId:..." als Tracker-Key für authentifizierte User.
 */

import { Injectable, ExecutionContext } from "@nestjs/common";
import { ThrottlerGuard } from "@nestjs/throttler";
import { Request } from "express";

@Injectable()
export class EucxThrottlerGuard extends ThrottlerGuard {
  /**
   * Tracker-Key: User-ID für authentifizierte, IP für anonyme Anfragen.
   */
  protected async getTracker(req: Record<string, unknown>): Promise<string> {
    const r    = req as unknown as Request;
    const user = r.user as { id?: string; sub?: string } | undefined;
    const userId = user?.id ?? user?.sub;

    if (userId) return `user:${userId}`;

    const ip =
      (r.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ??
      r.socket?.remoteAddress ??
      "unknown";

    return `ip:${ip}`;
  }

  /**
   * Limit dynamisch: authenticated users erhalten 10x mehr Kapazität.
   */
  protected async getLimit(
    context: ExecutionContext,
    throttler: { limit: number; ttl: number; name?: string },
  ): Promise<number> {
    const req  = context.switchToHttp().getRequest<Request>();
    const user = req.user as { id?: string } | undefined;

    if (user?.id) return throttler.limit * 10;
    return throttler.limit;
  }
}
