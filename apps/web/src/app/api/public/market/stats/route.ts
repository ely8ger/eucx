/**
 * GET /api/public/market/stats
 *
 * Öffentlicher Public-API-Namespace für Marktstatistiken.
 * Identisch mit /api/market/stats — dieser Pfad ist für externe
 * API-Key-Nutzer (Scope: market:read) und öffentliche Dashboards.
 *
 * Auth: keine (öffentlich) oder optional API-Key (Scope: market:read)
 */
export { GET } from "@/app/api/market/stats/route";
