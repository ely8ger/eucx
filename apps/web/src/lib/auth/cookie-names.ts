/**
 * Cookie-Namen-Utility
 *
 * __Host- Prefix in Production: Browser erzwingt secure=true, path="/", kein domain=-Attribut.
 * Das schließt eine Klasse von Cookie-Hijacking-Angriffen auf Browser-Ebene.
 *
 * In Development (HTTP localhost) verwerfen Browser __Host- Cookies stillschweigend,
 * daher bedingter Name.
 *
 * refresh_token bleibt ohne __Host- weil __Host- immer path="/" erzwingt,
 * was den scope-limitierten path="/api/auth/refresh" aufheben würde.
 * Scope-Limitierung > __Host- Prefix für Refresh-Token.
 */

const isProd = process.env.NODE_ENV === "production";

export const COOKIE_ACCESS_TOKEN  = isProd ? "__Host-access_token"  : "access_token";
export const COOKIE_REFRESH_TOKEN = "refresh_token";           // scope-limitiert, kein __Host- möglich
export const COOKIE_PENDING_2FA   = isProd ? "__Host-pending_2fa"   : "pending_2fa";
