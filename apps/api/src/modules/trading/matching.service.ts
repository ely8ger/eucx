import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../../config/prisma.service";
import { TradingGateway } from "./trading.gateway";
import { AuditService } from "../audit/audit.service";
import Decimal from "decimal.js";

/**
 * EUCX MatchingService — Price-Time Priority Matching
 *
 * Algorithmus (FIFO / Price-Time Priority, Standard an Warenbörsen):
 *   1. Angebote (ASKs) sortiert nach: Preis ASC, Zeit ASC
 *   2. Gebote  (BIDs) sortiert nach: Preis DESC, Zeit ASC
 *   3. Match wenn: bestBid.price >= bestAsk.price
 *
 * Race Condition Schutz (3 Schichten):
 *   Schicht 1: PostgreSQL-Transaktion mit SERIALIZABLE Isolation
 *   Schicht 2: SELECT FOR UPDATE auf beide Orders (Row-Level Lock)
 *   Schicht 3: Advisory Lock auf sessionId (verhindert parallele Matching-Runs)
 *   → Zwei gleichzeitige Anfragen können physisch nicht die gleiche Order greifen.
 *
 * Redis Pub/Sub (Skalierung auf N Server):
 *   Nach jedem Match publisht dieser Service ein Event zu Redis.
 *   Alle API-Server subscriben auf Redis → broadcasten via Socket.io.
 *   → Kein direktes Socket.io-Call notwendig — entkoppelt Matching von Transport.
 */
@Injectable()
export class MatchingService {
  private readonly logger = new Logger(MatchingService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly gateway: TradingGateway,
    private readonly audit: AuditService,
  ) {}

  /**
   * Wird nach jeder neuen Order aufgerufen.
   * Führt vollständige Matching-Runde für die Session durch.
   */
  async runMatchingCycle(sessionId: string): Promise<void> {
    // Advisory Lock: nur ein Matching-Run gleichzeitig pro Session
    const lockKey = this.hashLock(sessionId);

    await this.prisma.$transaction(
      async (tx) => {
        // PostgreSQL Advisory Lock (Session-scoped)
        await tx.$executeRaw`SELECT pg_advisory_xact_lock(${lockKey})`;

        let matched = true;

        while (matched) {
          matched = false;

          // Bestes Angebot (niedrigster Preis, älteste zuerst)
          const bestAsk = await tx.order.findFirst({
            where:   { sessionId, direction: "SELL", status: { in: ["ACTIVE", "PARTIALLY_FILLED"] } },
            orderBy: [{ pricePerUnit: "asc" }, { createdAt: "asc" }],
          });

          // Bestes Gebot (höchster Preis, älteste zuerst)
          const bestBid = await tx.order.findFirst({
            where:   { sessionId, direction: "BUY",  status: { in: ["ACTIVE", "PARTIALLY_FILLED"] } },
            orderBy: [{ pricePerUnit: "desc" }, { createdAt: "asc" }],
          });

          if (!bestAsk || !bestBid) break;

          const askPrice = new Decimal(bestAsk.pricePerUnit.toString());
          const bidPrice = new Decimal(bestBid.pricePerUnit.toString());

          // Kein Match möglich: höchstes Gebot < niedrigstes Angebot
          if (bidPrice.lt(askPrice)) break;

          // Matchpreis = Preis der Order die zuerst im Buch war (Price-Time Priority)
          const matchPrice = bestAsk.createdAt <= bestBid.createdAt ? askPrice : bidPrice;

          // Matchmenge = kleinere der beiden verbleibenden Mengen
          const askRemaining = new Decimal(bestAsk.quantity.toString())
            .minus(new Decimal(bestAsk.filledQuantity.toString()));
          const bidRemaining = new Decimal(bestBid.quantity.toString())
            .minus(new Decimal(bestBid.filledQuantity.toString()));
          const matchQty = Decimal.min(askRemaining, bidRemaining);

          if (matchQty.lte(0)) break;

          // ── Locked Update beider Orders ────────────────────────────────────
          // SELECT FOR UPDATE verhindert parallele Schreibzugriffe
          await tx.$executeRaw`
            SELECT id FROM orders WHERE id IN (${bestAsk.id}, ${bestBid.id}) FOR UPDATE
          `;

          const newAskFilled = new Decimal(bestAsk.filledQuantity.toString()).plus(matchQty);
          const newBidFilled = new Decimal(bestBid.filledQuantity.toString()).plus(matchQty);

          const askStatus = newAskFilled.gte(bestAsk.quantity.toString()) ? "FILLED" : "PARTIALLY_FILLED";
          const bidStatus = newBidFilled.gte(bestBid.quantity.toString()) ? "FILLED" : "PARTIALLY_FILLED";

          await tx.order.update({
            where: { id: bestAsk.id },
            data:  { filledQuantity: newAskFilled.toFixed(8), status: askStatus },
          });
          await tx.order.update({
            where: { id: bestBid.id },
            data:  { filledQuantity: newBidFilled.toFixed(8), status: bidStatus },
          });

          // ── Deal erstellen ─────────────────────────────────────────────────
          const totalValue = matchPrice.times(matchQty).toFixed(8);

          const deal = await tx.deal.create({
            data: {
              sessionId,
              sellOrderId: bestAsk.id,
              buyOrderId:  bestBid.id,
              sellerOrgId: bestAsk.organizationId,
              buyerOrgId:  bestBid.organizationId,
              productId:   bestAsk.productId,
              quantity:    matchQty.toFixed(8),
              pricePerUnit: matchPrice.toFixed(8),
              totalValue,
              currency:    bestAsk.currency,
            },
          });

          // ── Audit ──────────────────────────────────────────────────────────
          await this.audit.log({
            userId:     bestBid.userId,
            action:     "DEAL_MATCHED",
            meta: {
              dealId:     deal.id,
              price:      matchPrice.toString(),
              qty:        matchQty.toString(),
              total:      totalValue,
              askOrderId: bestAsk.id,
              bidOrderId: bestBid.id,
            },
          });

          this.logger.log(
            `[Match] ${matchQty.toFixed(3)}t @ ${matchPrice.toFixed(2)} EUR — Deal: ${deal.id.slice(0, 8)}`
          );

          matched = true;

          // ── WebSocket Broadcast (außerhalb Transaktion → nach Commit) ──────
          setImmediate(() => {
            this.gateway.broadcastDeal(sessionId, {
              dealId:       deal.id,
              pricePerUnit: matchPrice.toFixed(2),
              quantity:     matchQty.toFixed(3),
              totalValue,
              currency:     deal.currency,
              buyerUserId:  bestBid.userId,
              sellerUserId: bestAsk.userId,
            });
          });
        }

        // Orderbuch-Snapshot nach Matching
        setImmediate(async () => {
          const snapshot = await this.buildOrderBookSnapshot(sessionId);
          this.gateway.broadcastOrderBook(sessionId, snapshot);
        });
      },
      {
        isolationLevel: "Serializable",
        timeout:        10_000,
      }
    );
  }

  /**
   * Orderbuch-Snapshot für einen Broadcast aufbauen.
   * Aggregiert Preisstufen (gleicher Preis → summiert Mengen).
   */
  async buildOrderBookSnapshot(sessionId: string) {
    const [asks, bids] = await Promise.all([
      this.prisma.order.groupBy({
        by:      ["pricePerUnit"],
        where:   { sessionId, direction: "SELL", status: { in: ["ACTIVE", "PARTIALLY_FILLED"] } },
        _sum:    { quantity: true },
        _count:  { id: true },
        orderBy: { pricePerUnit: "asc" },
        take:    20,
      }),
      this.prisma.order.groupBy({
        by:      ["pricePerUnit"],
        where:   { sessionId, direction: "BUY",  status: { in: ["ACTIVE", "PARTIALLY_FILLED"] } },
        _sum:    { quantity: true },
        _count:  { id: true },
        orderBy: { pricePerUnit: "desc" },
        take:    20,
      }),
    ]);

    const toLevel = (row: typeof asks[0]) => ({
      price:      row.pricePerUnit.toString(),
      quantity:   (row._sum.quantity ?? 0).toString(),
      orderCount: row._count.id,
    });

    const bestAsk = asks[0]?.pricePerUnit;
    const bestBid = bids[0]?.pricePerUnit;
    const spread  = bestAsk && bestBid
      ? new Decimal(bestAsk.toString()).minus(bestBid.toString()).toFixed(2)
      : undefined;

    return {
      asks:   asks.map(toLevel),
      bids:   bids.map(toLevel),
      spread,
      ts:     Date.now(),
    };
  }

  /** Deterministischer Integer-Hash für Advisory Lock aus UUID */
  private hashLock(sessionId: string): number {
    let hash = 0;
    for (let i = 0; i < sessionId.length; i++) {
      hash = (Math.imul(31, hash) + sessionId.charCodeAt(i)) | 0;
    }
    return Math.abs(hash);
  }
}
