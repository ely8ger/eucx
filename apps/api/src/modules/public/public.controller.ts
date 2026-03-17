/**
 * PublicController — /api/v1/public/*
 *
 * Öffentliche Endpunkte: KEIN Auth erforderlich.
 * Stark gecacht: Redis (30s TTL) + CDN-Header (Cache-Control: public, s-maxage=30)
 *
 * ─── Endpunkte ────────────────────────────────────────────────────────────────
 *
 *   GET /public/ticker              — Alle Produkte: letzter Preis + 24h-Change
 *   GET /public/ticker/:productId   — Einzelner Ticker
 *   GET /public/products            — Produktkatalog (name, category, unit)
 *   GET /public/health              — Statusseite für externe Monitoring-Systeme
 *
 * ─── Rate Limiting ────────────────────────────────────────────────────────────
 *
 *   Öffentliche Endpunkte sind besonders anfällig für Scraping.
 *   EucxThrottlerGuard greift: 100 req/min pro IP.
 *   Cache reduziert DB-Last: bei 1000 reqs/min → nur 1 DB-Query/30s pro Produkt.
 *
 * ─── Caching-Strategie ────────────────────────────────────────────────────────
 *
 *   1. Redis-Check: Liegt gecachter Wert vor? → sofort antworten (< 1ms)
 *   2. Cache miss: DB-Query (market_candles, last candle) → Redis setzen (30s TTL)
 *   3. HTTP-Header: Cache-Control: public, s-maxage=30, stale-while-revalidate=60
 *      → CDN (Cloudflare etc.) cached ebenfalls 30s
 *
 *   Effektiv: Bei 10.000 reqs/min landet max 1 req/30s auf der DB.
 */

import {
  Controller,
  Get,
  Param,
  Inject,
  Optional,
  HttpCode,
  HttpStatus,
  Res,
} from "@nestjs/common";
import { PrismaService } from "../../config/prisma.service";
import type { Response } from "express";
import type { Redis }    from "ioredis";

const CACHE_TTL_SEC = 30;
const TICKER_CACHE_PREFIX = "eucx:public:ticker:";
const PRODUCTS_CACHE_KEY  = "eucx:public:products";

@Controller("public")
export class PublicController {
  constructor(
    private readonly prisma: PrismaService,
    @Optional() @Inject("REDIS_CLIENT") private readonly redis?: Redis,
  ) {}

  // ─── Alle Ticker ────────────────────────────────────────────────────────────

  @Get("ticker")
  async getAllTickers(@Res() res: Response) {
    const cacheKey = `${TICKER_CACHE_PREFIX}all`;

    // Redis-Cache prüfen
    const cached = await this.tryCache(cacheKey);
    if (cached) {
      return res
        .set(this.cacheHeaders())
        .json(JSON.parse(cached));
    }

    // Neueste Tageskerze pro Produkt + 24h-Change
    const candles = await this.prisma.marketCandle.findMany({
      where: {
        interval:    "ONE_DAY",
        periodStart: { gte: new Date(Date.now() - 2 * 86_400_000) },
      },
      orderBy: { periodStart: "desc" },
      include: {
        product: {
          select: { id: true, name: true, unit: true,
            category: { select: { slug: true, label: true } } },
        },
      },
    });

    // Neueste Kerze pro Produkt + Vortags-Open für Change-Berechnung
    const latestMap  = new Map<string, typeof candles[0]>();
    const prevMap    = new Map<string, typeof candles[0]>();
    for (const c of candles) {
      if (!latestMap.has(c.productId)) latestMap.set(c.productId, c);
      else if (!prevMap.has(c.productId)) prevMap.set(c.productId, c);
    }

    const tickers = Array.from(latestMap.entries()).map(([pid, latest]) => {
      const prev     = prevMap.get(pid);
      const last     = parseFloat(latest.close.toString());
      const open24h  = prev ? parseFloat(prev.open.toString()) : parseFloat(latest.open.toString());
      const change   = last - open24h;
      const changePct = open24h > 0 ? ((change / open24h) * 100) : 0;

      return {
        productId:    pid,
        name:         latest.product.name,
        category:     latest.product.category.slug,
        categoryLabel: latest.product.category.label,
        unit:         latest.product.unit,
        last:         last.toFixed(2),
        open:         parseFloat(latest.open.toString()).toFixed(2),
        high:         parseFloat(latest.high.toString()).toFixed(2),
        low:          parseFloat(latest.low.toString()).toFixed(2),
        change:       `${change >= 0 ? "+" : ""}${change.toFixed(2)}`,
        changePct:    `${changePct >= 0 ? "+" : ""}${changePct.toFixed(2)}%`,
        isUp:         change >= 0,
        volume:       parseFloat(latest.volume.toString()).toFixed(3),
        turnover:     parseFloat(latest.turnover.toString()).toFixed(2),
        tradeCount:   latest.tradeCount,
        updatedAt:    latest.updatedAt.toISOString(),
      };
    });

    const response = {
      tickers,
      count:         tickers.length,
      generatedAt:   new Date().toISOString(),
      cacheExpiresIn: CACHE_TTL_SEC,
    };

    await this.setCache(cacheKey, JSON.stringify(response));

    return res
      .set(this.cacheHeaders())
      .json(response);
  }

  // ─── Einzelner Ticker ───────────────────────────────────────────────────────

  @Get("ticker/:productId")
  async getTicker(@Param("productId") productId: string, @Res() res: Response) {
    const cacheKey = `${TICKER_CACHE_PREFIX}${productId}`;

    const cached = await this.tryCache(cacheKey);
    if (cached) {
      return res.set(this.cacheHeaders()).json(JSON.parse(cached));
    }

    const [latest, prev] = await Promise.all([
      this.prisma.marketCandle.findFirst({
        where:   { productId, interval: "ONE_HOUR" },
        orderBy: { periodStart: "desc" },
        include: { product: { include: { category: true } } },
      }),
      this.prisma.marketCandle.findFirst({
        where:   { productId, interval: "ONE_DAY" },
        orderBy: { periodStart: "desc" },
        include: { product: true },
      }),
    ]);

    if (!latest) {
      return res.status(HttpStatus.NOT_FOUND).json({ error: "Produkt nicht gefunden oder keine Handelsdaten" });
    }

    const last     = parseFloat(latest.close.toString());
    const open24h  = prev ? parseFloat(prev.open.toString()) : parseFloat(latest.open.toString());
    const change   = last - open24h;
    const changePct = open24h > 0 ? (change / open24h) * 100 : 0;

    const ticker = {
      productId,
      name:          latest.product.name,
      category:      latest.product.category.slug,
      categoryLabel: latest.product.category.label,
      unit:          latest.product.unit,
      last:          last.toFixed(2),
      open:          parseFloat(latest.open.toString()).toFixed(2),
      high:          parseFloat(latest.high.toString()).toFixed(2),
      low:           parseFloat(latest.low.toString()).toFixed(2),
      close:         parseFloat(latest.close.toString()).toFixed(2),
      change:        `${change >= 0 ? "+" : ""}${change.toFixed(2)}`,
      changePct:     `${changePct >= 0 ? "+" : ""}${changePct.toFixed(2)}%`,
      isUp:          change >= 0,
      volume1h:      parseFloat(latest.volume.toString()).toFixed(3),
      volume24h:     prev ? parseFloat(prev.volume.toString()).toFixed(3) : null,
      turnover24h:   prev ? parseFloat(prev.turnover.toString()).toFixed(2) : null,
      updatedAt:     latest.updatedAt.toISOString(),
    };

    const response = { ticker, generatedAt: new Date().toISOString() };
    await this.setCache(cacheKey, JSON.stringify(response));

    return res.set(this.cacheHeaders()).json(response);
  }

  // ─── Produktkatalog ─────────────────────────────────────────────────────────

  @Get("products")
  async getProducts(@Res() res: Response) {
    const cached = await this.tryCache(PRODUCTS_CACHE_KEY);
    if (cached) {
      return res.set({ ...this.cacheHeaders(), "Cache-Control": "public, s-maxage=300" }).json(JSON.parse(cached));
    }

    const products = await this.prisma.product.findMany({
      select: {
        id:   true,
        sku:  true,
        name: true,
        unit: true,
        category: { select: { slug: true, label: true } },
      },
      orderBy: { name: "asc" },
    });

    const response = { products, count: products.length, generatedAt: new Date().toISOString() };
    await this.setCache(PRODUCTS_CACHE_KEY, JSON.stringify(response), 300);  // 5min TTL

    return res
      .set({ ...this.cacheHeaders(), "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" })
      .json(response);
  }

  // ─── Status-Endpoint ────────────────────────────────────────────────────────

  @Get("health")
  @HttpCode(HttpStatus.OK)
  getHealth() {
    return {
      status:    "operational",
      name:      "EUCX — European Union Commodity Exchange",
      timestamp: new Date().toISOString(),
      version:   "1.0",
    };
  }

  // ─── Cache-Hilfsmethoden ────────────────────────────────────────────────────

  private async tryCache(key: string): Promise<string | null> {
    if (!this.redis) return null;
    try {
      return await this.redis.get(key);
    } catch {
      return null;   // Redis-Fehler → Cache-Miss, DB-Query fortfahren
    }
  }

  private async setCache(key: string, value: string, ttl = CACHE_TTL_SEC): Promise<void> {
    if (!this.redis) return;
    try {
      await this.redis.setex(key, ttl, value);
    } catch {
      // Redis-Fehler → ignorieren, DB-Antwort trotzdem gesendet
    }
  }

  private cacheHeaders() {
    return {
      "Cache-Control": `public, s-maxage=${CACHE_TTL_SEC}, stale-while-revalidate=${CACHE_TTL_SEC * 2}`,
      "X-Cache":       "MISS",
    };
  }
}
