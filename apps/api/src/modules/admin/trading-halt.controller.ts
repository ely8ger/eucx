/**
 * TradingHaltController — Kill Switch Management API
 *
 * Alle Endpunkte erfordern SUPER_ADMIN-Rolle.
 * Aktiviert/deaktiviert globale und produktspezifische Handelsstopps.
 *
 * POST /api/v1/admin/trading-halt/global          → globaler Halt
 * DELETE /api/v1/admin/trading-halt/global        → globalen Halt aufheben
 * POST /api/v1/admin/trading-halt/:productId      → Produkt-Halt
 * DELETE /api/v1/admin/trading-halt/:productId    → Produkt-Halt aufheben
 * GET /api/v1/admin/trading-halt                  → aktuelle Halt-Flags
 */

import {
  Controller,
  Post,
  Delete,
  Get,
  Param,
  Body,
  UseGuards,
  HttpCode,
  Optional,
} from "@nestjs/common";
import { ApiTags, ApiBearerAuth, ApiOperation } from "@nestjs/swagger";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { SkipTradingHalt } from "../../common/guards/trading-halt.guard";
import { PrismaService } from "../../prisma/prisma.service";
import { InjectRedis } from "@nestjs-modules/ioredis";
import Redis from "ioredis";

class ActivateHaltDto {
  /** Dauer des Halts in Sekunden (Standard: 3600 = 1 Stunde, 0 = unbegrenzt) */
  durationSeconds?: number;
  /** Begründung für den Halt (Pflichtfeld für Audit) */
  reason!: string;
}

@ApiTags("Admin — Trading Halt")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("SUPER_ADMIN")
@SkipTradingHalt()   // Admin darf immer — auch im Halt-Zustand
@Controller("api/v1/admin/trading-halt")
export class TradingHaltController {
  private static readonly HALT_ALL_KEY = "trading_halt:all";
  private static readonly HALT_PREFIX   = "trading_halt:";
  private static readonly DEFAULT_TTL   = 3600; // 1h

  constructor(
    private readonly prisma: PrismaService,
    @Optional() @InjectRedis() private readonly redis: Redis | null,
  ) {}

  // ── Status ────────────────────────────────────────────────────────────────
  @Get()
  @ApiOperation({ summary: "Alle aktiven Handelsstopps abfragen" })
  async getActiveHalts() {
    if (!this.redis) return { halts: [], redisAvailable: false };

    const keys = await this.redis.keys(`${TradingHaltController.HALT_PREFIX}*`);
    const halts = await Promise.all(
      keys.map(async (key) => {
        const ttl   = await this.redis!.ttl(key);
        const value = await this.redis!.get(key);
        return { key, scope: key.replace(TradingHaltController.HALT_PREFIX, ""), ttl, meta: value };
      }),
    );

    return { halts, redisAvailable: true };
  }

  // ── Globaler Halt ─────────────────────────────────────────────────────────
  @Post("global")
  @HttpCode(200)
  @ApiOperation({ summary: "Globalen Handelsstopp aktivieren (Kill Switch)" })
  async activateGlobalHalt(
    @Body() dto: ActivateHaltDto,
    @CurrentUser() actor: any,
  ) {
    const ttl = dto.durationSeconds ?? TradingHaltController.DEFAULT_TTL;
    const meta = JSON.stringify({ reason: dto.reason, activatedBy: actor.id, ts: Date.now() });

    if (this.redis) {
      if (ttl > 0) {
        await this.redis.set(TradingHaltController.HALT_ALL_KEY, meta, "EX", ttl);
      } else {
        await this.redis.set(TradingHaltController.HALT_ALL_KEY, meta);
      }
    }

    await this.audit(actor.id, "GLOBAL_HALT_ACTIVATED", "all", { reason: dto.reason, ttl });

    // Freeze all active trading sessions in DB
    await this.prisma.tradingSession.updateMany({
      where:  { status: { in: ["TRADING_1", "TRADING_2", "PRE_TRADING"] } },
      data:   { status: "FINAL" },
    });

    return {
      status:     "HALTED",
      scope:      "global",
      expiresIn:  ttl > 0 ? `${ttl}s` : "manual release required",
      activatedBy: actor.id,
    };
  }

  @Delete("global")
  @HttpCode(200)
  @ApiOperation({ summary: "Globalen Handelsstopp aufheben" })
  async deactivateGlobalHalt(@CurrentUser() actor: any) {
    if (this.redis) {
      await this.redis.del(TradingHaltController.HALT_ALL_KEY);
    }
    await this.audit(actor.id, "GLOBAL_HALT_LIFTED", "all", {});
    return { status: "TRADING_RESUMED", scope: "global" };
  }

  // ── Produkt-spezifischer Halt ─────────────────────────────────────────────
  @Post(":productId")
  @HttpCode(200)
  @ApiOperation({ summary: "Handelsstopp für ein Produkt aktivieren (Circuit Breaker)" })
  async activateProductHalt(
    @Param("productId") productId: string,
    @Body() dto: ActivateHaltDto,
    @CurrentUser() actor: any,
  ) {
    const key = `${TradingHaltController.HALT_PREFIX}${productId}`;
    const ttl = dto.durationSeconds ?? TradingHaltController.DEFAULT_TTL;
    const meta = JSON.stringify({ reason: dto.reason, activatedBy: actor.id, ts: Date.now() });

    if (this.redis) {
      if (ttl > 0) {
        await this.redis.set(key, meta, "EX", ttl);
      } else {
        await this.redis.set(key, meta);
      }
    }

    await this.audit(actor.id, "PRODUCT_HALT_ACTIVATED", productId, { reason: dto.reason, ttl });

    return {
      status:    "HALTED",
      scope:     "product",
      productId,
      expiresIn: ttl > 0 ? `${ttl}s` : "manual release required",
    };
  }

  @Delete(":productId")
  @HttpCode(200)
  @ApiOperation({ summary: "Produktspezifischen Halt aufheben" })
  async deactivateProductHalt(
    @Param("productId") productId: string,
    @CurrentUser() actor: any,
  ) {
    const key = `${TradingHaltController.HALT_PREFIX}${productId}`;
    if (this.redis) await this.redis.del(key);
    await this.audit(actor.id, "PRODUCT_HALT_LIFTED", productId, {});
    return { status: "TRADING_RESUMED", scope: "product", productId };
  }

  // ── Hilfsmethoden ─────────────────────────────────────────────────────────
  private audit(
    actorId: string,
    action: string,
    entityId: string,
    after: object,
  ) {
    return this.prisma.auditLog.create({
      data: {
        action,
        entityType: "TradingHalt",
        entityId,
        actorId,
        before: {},
        after,
        ip: "system",
      },
    });
  }
}
