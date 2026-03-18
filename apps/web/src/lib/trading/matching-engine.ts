/**
 * EUCX Matching Engine - Next.js API Layer
 *
 * Läuft direkt in den Next.js API Routes (Vercel-kompatibel).
 * Identische Logik wie der NestJS MatchingService.
 *
 * ─── Algorithmus: Price-Time Priority (FIFO) ────────────────────────────────
 *
 * Sortierung:
 *   ASKs (Verkauf): Preis ASC  → Zeit ASC   (billigster zuerst, dann ältester)
 *   BIDs (Kauf):    Preis DESC → Zeit ASC   (teuerster zuerst, dann ältester)
 *
 * Match-Bedingung:
 *   bestBid.price >= bestAsk.price
 *
 * Match-Preis (Price-Time Priority):
 *   Der Preis der Order die ZUERST im Buch war gewinnt.
 *   Beispiel: ASK 540€ um 10:00, BID 545€ um 10:01 → Match zu 540€
 *
 * ─── Partial Fills ───────────────────────────────────────────────────────────
 *
 * Beispiel: Käufer sucht 100t, Verkäufer bietet 60t
 *
 *   BID:  qty=100t, filled=0t   → nach Match: filled=60t, status=PARTIALLY_FILLED
 *   ASK:  qty=60t,  filled=0t   → nach Match: filled=60t, status=FILLED
 *   Deal: qty=60t @ matchPrice
 *
 *   Die BID bleibt AKTIV mit 40t Restmenge.
 *   Nächste Matching-Runde: prüft wieder ob neues ASK die 40t abdeckt.
 *
 * ─── Race Conditions: Pessimistic Locking ────────────────────────────────────
 *
 * Wir nutzen PESSIMISTISCHES Locking (SELECT FOR UPDATE) - nicht optimistisches.
 * Grund: Bei Warenbörsen darf es KEINE "retry on conflict" geben - ein Deal
 * muss entweder 100% sicher abgeschlossen werden oder gar nicht.
 *
 * Schicht 1: pg_advisory_xact_lock(sessionId) - nur 1 Matching-Run pro Session
 * Schicht 2: SELECT FOR UPDATE auf Order-Zeilen - Row-Level Lock
 * Schicht 3: SERIALIZABLE Isolation - verhindert Phantom Reads
 *
 * Ergebnis: Zwei gleichzeitige Käufer für die letzten 50t Kupfer →
 *   Transaktion A gewinnt den Lock → schließt Deal ab
 *   Transaktion B sieht status=FILLED → kein Match mehr möglich
 */

import { db } from "@/lib/db/client";
import Decimal from "decimal.js";

export interface MatchResult {
  deals: DealResult[];
  totalMatchedQty: string;
}

export interface DealResult {
  dealId:          string;
  pricePerUnit:    string;   // Decimal-String
  quantity:        string;   // Decimal-String
  totalValue:      string;   // Decimal-String
  currency:        string;
  buyerUserId:     string;
  sellerUserId:    string;
  buyerOrgId:      string;
  sellerOrgId:     string;
  buyOrderStatus:  string;
  sellOrderStatus: string;
}

/**
 * Führt vollständige Matching-Runde für eine Session durch.
 * Wird nach jeder neuen Order aufgerufen.
 *
 * @returns Alle Deals die in dieser Runde abgeschlossen wurden
 */
export async function runMatchingCycle(sessionId: string): Promise<MatchResult> {
  const deals: DealResult[] = [];

  await db.$transaction(
    async (tx) => {
      // ── Pessimistisches Locking: Advisory Lock auf Session ──────────────
      // Verhindert parallele Matching-Runs für dieselbe Session.
      // Zwei simultane HTTP-Requests: der Zweite wartet bis der Erste fertig ist.
      const lockKey = hashSessionId(sessionId);
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(${lockKey})`;

      // ── Matching-Schleife: läuft bis kein Match mehr möglich ────────────
      for (;;) {
        // Bestes Verkaufsangebot: niedrigster Preis, bei Gleichstand ältestes
        const bestAsk = await tx.order.findFirst({
          where: {
            sessionId,
            direction: "SELL",
            status:    { in: ["ACTIVE", "PARTIALLY_FILLED"] },
          },
          orderBy: [{ pricePerUnit: "asc" }, { createdAt: "asc" }],
        });

        // Bestes Kaufgebot: höchster Preis, bei Gleichstand ältestes
        const bestBid = await tx.order.findFirst({
          where: {
            sessionId,
            direction: "BUY",
            status:    { in: ["ACTIVE", "PARTIALLY_FILLED"] },
          },
          orderBy: [{ pricePerUnit: "desc" }, { createdAt: "asc" }],
        });

        // Kein Gegenangebot vorhanden
        if (!bestAsk || !bestBid) break;

        const askPrice = new Decimal(bestAsk.pricePerUnit.toString());
        const bidPrice = new Decimal(bestBid.pricePerUnit.toString());

        // Kein Preis-Match: höchstes Gebot < niedrigstes Angebot → Spread
        if (bidPrice.lt(askPrice)) break;

        // ── Match-Preis: wer war zuerst im Buch? (Price-Time Priority) ──
        const matchPrice = bestAsk.createdAt <= bestBid.createdAt ? askPrice : bidPrice;

        // ── Match-Menge: kleinere der beiden Restmengen ──────────────────
        const askFilled    = new Decimal(bestAsk.filledQuantity.toString());
        const bidFilled    = new Decimal(bestBid.filledQuantity.toString());
        const askRemaining = new Decimal(bestAsk.quantity.toString()).minus(askFilled);
        const bidRemaining = new Decimal(bestBid.quantity.toString()).minus(bidFilled);
        const matchQty     = Decimal.min(askRemaining, bidRemaining);

        if (matchQty.lte(0)) break;

        // ── SELECT FOR UPDATE: Row-Level Lock auf beide Orders ───────────
        // Verhindert dass zwei Transaktionen dieselbe Order gleichzeitig füllen.
        await tx.$executeRaw`
          SELECT id FROM orders
          WHERE id IN (${bestAsk.id}::uuid, ${bestBid.id}::uuid)
          FOR UPDATE
        `;

        // ── Order-Status aktualisieren ───────────────────────────────────
        const newAskFilled = askFilled.plus(matchQty);
        const newBidFilled = bidFilled.plus(matchQty);

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

        // ── Deal erstellen (atomarer Abschluss) ──────────────────────────
        const totalValue = matchPrice.times(matchQty).toFixed(8);

        const deal = await tx.deal.create({
          data: {
            sessionId,
            sellOrderId:  bestAsk.id,
            buyOrderId:   bestBid.id,
            sellerOrgId:  bestAsk.organizationId,
            buyerOrgId:   bestBid.organizationId,
            productId:    bestAsk.productId,
            quantity:     matchQty.toFixed(8),
            pricePerUnit: matchPrice.toFixed(8),
            totalValue,
            currency:     bestAsk.currency,
          },
        });

        // ── Audit Log ────────────────────────────────────────────────────
        await tx.auditLog.create({
          data: {
            userId:     bestBid.userId,
            action:     "DEAL_MATCHED",
            entityType: "Deal",
            entityId:   deal.id,
            meta: {
              dealId:           deal.id,
              matchPrice:       matchPrice.toString(),
              matchQty:         matchQty.toString(),
              totalValue,
              askOrderId:       bestAsk.id,
              bidOrderId:       bestBid.id,
              askPartial:       askStatus === "PARTIALLY_FILLED",
              bidPartial:       bidStatus === "PARTIALLY_FILLED",
              askRemainingQty:  new Decimal(bestAsk.quantity.toString()).minus(newAskFilled).toFixed(8),
              bidRemainingQty:  new Decimal(bestBid.quantity.toString()).minus(newBidFilled).toFixed(8),
            },
          },
        });

        deals.push({
          dealId:          deal.id,
          pricePerUnit:    matchPrice.toFixed(2),
          quantity:        matchQty.toFixed(3),
          totalValue:      new Decimal(totalValue).toFixed(2),
          currency:        deal.currency,
          buyerUserId:     bestBid.userId,
          sellerUserId:    bestAsk.userId,
          buyerOrgId:      bestBid.organizationId,
          sellerOrgId:     bestAsk.organizationId,
          buyOrderStatus:  bidStatus,
          sellOrderStatus: askStatus,
        });
      }
    },
    {
      isolationLevel: "Serializable",
      timeout:        15_000,
    }
  );

  const totalMatchedQty = deals
    .reduce((sum, d) => sum.plus(d.quantity), new Decimal(0))
    .toFixed(3);

  return { deals, totalMatchedQty };
}

/** Deterministischer 32-bit Integer-Hash aus UUID für pg_advisory_xact_lock */
function hashSessionId(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) {
    h = (Math.imul(31, h) + id.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}
