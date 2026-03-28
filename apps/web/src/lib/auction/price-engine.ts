/**
 * PriceEngine — Kernlogik der Reverse Auction (BUTB)
 *
 * Verantwortlichkeiten:
 *   1. Gebot validieren (Phase, Preis, Verkäufer-Registrierung)
 *   2. Lot.currentBest atomar aktualisieren (SELECT ... FOR UPDATE)
 *   3. Phase-Übergänge triggern (PROPOSAL → REDUCTION nach erstem Gebot)
 *   4. CONCLUSION einleiten wenn auctionEnd überschritten
 *
 * Race Condition Protection:
 *   Alle Schreibzugriffe auf Lot laufen innerhalb einer Transaktion mit
 *   Row-Level-Lock ($queryRaw SELECT ... FOR UPDATE). So kann kein zweiter
 *   Request gleichzeitig ein höheres Gebot als currentBest einbuchen.
 */

import { db } from "@/lib/db/client";
import type { AuctionPhase } from "@prisma/client";
import Decimal from "decimal.js";

export type BidResult =
  | { ok: true;  bidId: string; newBest: string }
  | { ok: false; error: string; code: number };

export async function placeBid(
  lotId: string,
  sellerId: string,
  priceRaw: string | number
): Promise<BidResult> {
  const price = new Decimal(priceRaw);

  if (price.lte(0)) {
    return { ok: false, error: "Preis muss größer 0 sein", code: 422 };
  }

  // Alles in einer Transaktion — Row-Lock schützt currentBest
  return db.$transaction(async (tx) => {
    // ── 1. Lot mit Row-Level-Lock laden ───────────────────────────────
    const lots = await tx.$queryRaw<
      Array<{
        id: string;
        phase: AuctionPhase;
        current_best: string | null;
        start_price: string | null;
        auction_end: Date | null;
        winner_id: string | null;
        locked_at: Date | null;
      }>
    >`
      SELECT id, phase, current_best, start_price, auction_end, winner_id, locked_at
      FROM lots
      WHERE id = ${lotId}
      FOR UPDATE
    `;

    if (lots.length === 0) {
      return { ok: false, error: "Lot nicht gefunden", code: 404 };
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const lot = lots[0]!;

    // ── 2. Phase-Check ────────────────────────────────────────────────
    if (lot.phase === "COLLECTION") {
      return { ok: false, error: "Auktion noch nicht geöffnet", code: 409 };
    }
    if (lot.phase === "CONCLUSION") {
      return { ok: false, error: "Auktion bereits geschlossen", code: 409 };
    }

    // ── 3. Zeit-Check: auctionEnd überschritten? ──────────────────────
    const now = new Date();
    if (lot.auction_end && now >= lot.auction_end) {
      // Phase automatisch schließen (Concurrently safe, da wir den Lock haben)
      await _concludeLot(tx, lotId);
      return { ok: false, error: "Auktionsfenster ist abgelaufen", code: 409 };
    }

    // ── 4. Verkäufer-Registrierung prüfen ─────────────────────────────
    const reg = await tx.lotRegistration.findUnique({
      where: { lotId_sellerId: { lotId, sellerId } },
      select: { id: true },
    });
    if (!reg) {
      return { ok: false, error: "Nicht für diese Auktion registriert", code: 403 };
    }

    // ── 5. Preis-Validierung ──────────────────────────────────────────
    // In PROPOSAL: Gebot muss <= startPrice sein (falls gesetzt)
    // In REDUCTION: Gebot muss strikt < currentBest sein
    const currentBest = lot.current_best ? new Decimal(lot.current_best) : null;
    const startPrice  = lot.start_price  ? new Decimal(lot.start_price)  : null;

    if (lot.phase === "PROPOSAL") {
      if (startPrice && price.gt(startPrice)) {
        return {
          ok: false,
          error: `Gebot (${price.toFixed(2)}) überschreitet Käufer-Maximalpreis (${startPrice.toFixed(2)})`,
          code: 422,
        };
      }
    } else {
      // REDUCTION: strikt unter currentBest
      if (!currentBest) {
        return { ok: false, error: "Kein aktuelles Bestgebot vorhanden", code: 409 };
      }
      if (price.gte(currentBest)) {
        return {
          ok: false,
          error: `Gebot (${price.toFixed(2)}) muss unter aktuellem Bestgebot (${currentBest.toFixed(2)}) liegen`,
          code: 422,
        };
      }
    }

    // ── 6. Gebot speichern ────────────────────────────────────────────
    const bid = await tx.bid.create({
      data: { lotId, sellerId, price: price.toFixed(2) },
    });

    // ── 7. Lot aktualisieren ──────────────────────────────────────────
    const newBest = currentBest === null || price.lt(currentBest)
      ? price.toFixed(2)
      : currentBest.toFixed(2);

    const updateData: Record<string, unknown> = { currentBest: newBest };

    // Erster Preis in PROPOSAL → Phase wechselt zu REDUCTION
    if (lot.phase === "PROPOSAL") {
      updateData.phase = "REDUCTION";
    }

    await tx.$executeRaw`
      UPDATE lots
      SET current_best = ${newBest},
          phase = ${updateData.phase ?? lot.phase}::\"AuctionPhase\",
          updated_at = NOW()
      WHERE id = ${lotId}
    `;

    return { ok: true, bidId: bid.id, newBest };
  });
}

// ─── Lot schließen (CONCLUSION) ───────────────────────────────────────────────
// Niedrigstes Gebot gewinnt. Bei Gleichstand: früheres Gebot (FIFO).
// Wird aufgerufen: a) vom AuctionTimer (Cron), b) on-demand bei abgelaufenem Lot.
export async function concludeLot(lotId: string): Promise<{ ok: boolean; winnerId?: string }> {
  return db.$transaction(async (tx) => {
    const lots = await tx.$queryRaw<Array<{ phase: AuctionPhase; locked_at: Date | null }>>`
      SELECT phase, locked_at FROM lots WHERE id = ${lotId} FOR UPDATE
    `;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    if (lots.length === 0 || lots[0]!.locked_at) {
      return { ok: false };
    }
    return _concludeLot(tx, lotId);
  });
}

// Interne Version — muss bereits innerhalb einer Transaktion laufen
async function _concludeLot(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  tx: any,
  lotId: string
): Promise<{ ok: boolean; winnerId?: string }> {
  // Bestes Gebot (niedrigster Preis, bei Gleichstand ältestes)
  const winningBid = await tx.bid.findFirst({
    where:   { lotId },
    orderBy: [{ price: "asc" }, { createdAt: "asc" }],
    select:  { id: true, sellerId: true },
  });

  const winnerId = winningBid?.sellerId ?? null;

  await tx.$executeRaw`
    UPDATE lots
    SET phase      = 'CONCLUSION'::"AuctionPhase",
        winner_id  = ${winnerId},
        locked_at  = NOW(),
        updated_at = NOW()
    WHERE id = ${lotId}
  `;

  if (winningBid) {
    await tx.bid.update({
      where: { id: winningBid.id },
      data:  { isWinner: true },
    });
  }

  return { ok: true, winnerId: winnerId ?? undefined };
}
