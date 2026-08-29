import { Client } from "@upstash/qstash";

let _client: Client | null = null;

function getQStash(): Client | null {
  if (!process.env.QSTASH_TOKEN) return null;
  if (!_client) _client = new Client({ token: process.env.QSTASH_TOKEN });
  return _client;
}

/**
 * Publiziert einen AUCTION_CLOSED-Event in die QStash-Queue.
 *
 * Der Worker /api/workers/lot-conclusion verarbeitet ihn asynchron:
 * PDF generieren, LotContract schreiben, Escrow sperren, E-Mails versenden.
 * QStash wiederholt den Aufruf automatisch bis zu 5× bei Fehler.
 *
 * Gibt true zurück wenn das Event erfolgreich eingestellt wurde,
 * false wenn QStash nicht konfiguriert ist (Dev-Fallback erwartet).
 */
export async function publishLotConclusion(lotId: string): Promise<boolean> {
  const client = getQStash();
  if (!client) return false;

  const base = process.env.NEXTAUTH_URL ?? process.env.NEXT_PUBLIC_URL ?? "http://localhost:3000";
  const url  = `${base}/api/workers/lot-conclusion`;

  await client.publishJSON({
    url,
    body:    { lotId },
    retries: 5,
    delay:   5, // 5 Sekunden — concludeLot-Transaktion sicher abgeschlossen
  });

  return true;
}
