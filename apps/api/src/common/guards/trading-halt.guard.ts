/**
 * TradingHaltGuard — Global Kill Switch
 *
 * Prüft vor jedem Order-/Matching-Aufruf zwei Redis-Flags:
 *
 *   trading_halt:all          → globaler Halt: alle Produkte eingefroren
 *   trading_halt:{productId}  → produktspezifischer Halt (Circuit Breaker)
 *
 * Bei aktivem Halt: HTTP 503 + AuditLog-Eintrag.
 * Admin-Routen und GET-Anfragen sind ausgenommen.
 *
 * Aktivierung:
 *   redis.set("trading_halt:all", "1", "EX", 3600)          // 1h Halt
 *   redis.set("trading_halt:copper-grade-a", "1", "EX", 900) // 15min Produkt-Halt
 *
 * Deaktivierung:
 *   redis.del("trading_halt:all")
 *   redis.del("trading_halt:copper-grade-a")
 */

import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ServiceUnavailableException,
  Optional,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { InjectRepository } from "@nestjs/typeorm";
import { PrismaService } from "../../prisma/prisma.service";
import { InjectRedis } from "@nestjs-modules/ioredis";
import Redis from "ioredis";

/** Decorator: markiert Endpunkte, die vom Halt ausgenommen sind (z.B. Admin, Health) */
export const SKIP_TRADING_HALT_KEY = "skip_trading_halt";
export const SkipTradingHalt = () =>
  Reflect.metadata(SKIP_TRADING_HALT_KEY, true);

@Injectable()
export class TradingHaltGuard implements CanActivate {
  private static readonly HALT_ALL_KEY = "trading_halt:all";
  private static readonly HALT_PREFIX   = "trading_halt:";

  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
    @Optional() @InjectRedis() private readonly redis: Redis | null,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Admin-Routen und explizit markierte Handler überspringen
    const skip = this.reflector.getAllAndOverride<boolean>(SKIP_TRADING_HALT_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (skip) return true;

    const request = context.switchToHttp().getRequest();

    // GET-Anfragen lesen nur Daten — kein Halt nötig
    if (request.method === "GET") return true;

    // Admin-Pfade dürfen immer schreiben (um den Halt aufzuheben)
    if (request.url?.includes("/admin/")) return true;

    // Redis nicht verfügbar → fail-open (kein Halt, aber warnen)
    if (!this.redis) {
      console.warn("[TradingHaltGuard] Redis unavailable — halt check skipped");
      return true;
    }

    // 1. Globaler Halt
    const globalHalt = await this.redis.get(TradingHaltGuard.HALT_ALL_KEY);
    if (globalHalt) {
      await this.logHaltAttempt(request, "GLOBAL_HALT", "all");
      throw new ServiceUnavailableException({
        error:   "TRADING_HALTED",
        message: "Der Handel ist derzeit eingefroren. Bitte versuchen Sie es später erneut.",
        code:    503,
      });
    }

    // 2. Produktspezifischer Halt (aus Body oder Query-Param)
    const productId = request.body?.productId ?? request.query?.productId;
    if (productId) {
      const productHalt = await this.redis.get(
        `${TradingHaltGuard.HALT_PREFIX}${productId}`,
      );
      if (productHalt) {
        await this.logHaltAttempt(request, "PRODUCT_HALT", productId);
        throw new ServiceUnavailableException({
          error:   "TRADING_HALTED",
          message: `Der Handel für Produkt ${productId} ist derzeit eingefroren.`,
          productId,
          code:    503,
        });
      }
    }

    return true;
  }

  /** Fire-and-forget — blockiert den Request nicht */
  private logHaltAttempt(
    request: any,
    reason: string,
    scope: string,
  ): Promise<void> {
    return this.prisma.auditLog
      .create({
        data: {
          action:     "TRADING_HALT_BLOCKED",
          entityType: "TradingHalt",
          entityId:   scope,
          actorId:    request.user?.id ?? "anonymous",
          before:     {},
          after:      { reason, scope, url: request.url, method: request.method },
          ip:         request.ip ?? "unknown",
        },
      })
      .then(() => undefined)
      .catch((err) =>
        console.error("[TradingHaltGuard] AuditLog write failed:", err),
      );
  }
}
