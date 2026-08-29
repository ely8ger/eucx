/**
 * getClientIp — vertrauenswürdige Client-IP-Extraktion
 *
 * Priorität (absteigend vertrauenswürdig):
 *   1. x-vercel-forwarded-for   — von Vercel Edge gesetzt, nicht vom Client fälschbar
 *   2. cf-connecting-ip         — von Cloudflare gesetzt, nicht fälschbar
 *   3. x-real-ip                — von nginx/haproxy gesetzt
 *   4. Letzter Wert in X-Forwarded-For — unser Edge-Proxy hat ihn zuletzt angehängt;
 *      der erste Wert ist CLIENT-KONTROLLIERT und darf NICHT verwendet werden.
 *
 * FALSCH (aktuell verbreiteter Fehler): x-forwarded-for.split(",")[0]
 * → Client sendet: X-Forwarded-For: 1.2.3.4, reale IP
 * → Server sieht 1.2.3.4 als Client-IP → Rate-Limiter ausgehebelt
 */
export function getClientIp(req: Pick<Request, "headers">): string {
  // 1. Vercel
  const vercel = req.headers.get("x-vercel-forwarded-for");
  if (vercel) return (vercel.split(",")[0] ?? "unknown").trim();

  // 2. Cloudflare
  const cf = req.headers.get("cf-connecting-ip");
  if (cf) return cf.trim();

  // 3. nginx / haproxy
  const realIp = req.headers.get("x-real-ip");
  if (realIp) return realIp.trim();

  // 4. Letzter Wert in X-Forwarded-For (vom letzten Proxy gesetzt, nicht vom Client)
  const xff = req.headers.get("x-forwarded-for");
  if (xff) {
    const parts = xff.split(",");
    return (parts[parts.length - 1] ?? "unknown").trim();
  }

  return "unknown";
}
