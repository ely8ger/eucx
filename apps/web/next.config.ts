import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs/config";

const nextConfig: NextConfig = {
  eslint: { ignoreDuringBuilds: true },
  // output: "standalone" — nur für Docker; Vercel braucht das nicht

  // Bild-Optimierung
  images: {
    formats:         ["image/avif", "image/webp"],
    minimumCacheTTL: 3600,
    deviceSizes:     [640, 750, 828, 1080, 1200, 1920],
  },

  // Tree-Shaking für große Pakete
  experimental: {
    optimizePackageImports: [
      "recharts",
      "framer-motion",
      "@tanstack/react-query",
      "zustand",
    ],
  },

  async headers() {
    return [
      // ── Security & Hardening für alle Routen ──────────────────────────────
      // CSP wird per Request in middleware.ts mit Nonce gesetzt (kein 'unsafe-eval',
      // kein 'unsafe-inline' in script-src). Nur statische Security-Header hier.
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options",       value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy",        value: "strict-origin-when-cross-origin" },
          { key: "X-DNS-Prefetch-Control", value: "on" },
          { key: "Permissions-Policy",     value: "camera=(), microphone=(), geolocation=(), payment=()" },
          {
            key:   "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",  // 2 Jahre HSTS
          },
        ],
      },

      // ── Statische Assets: 1 Jahr immutable Cache ────────────────────────
      {
        source: "/(_next/static|_next/image|favicon.ico|icon-192.png|icon-512.png)(.*)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },

      // ── OG-Images: 15min Cache + Stale-While-Revalidate ─────────────────
      {
        source: "/api/og(.*)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=900, stale-while-revalidate=3600" },
        ],
      },

      // ── API-Routes: kein Cache + CORS-Whitelist ──────────────────────────
      // Access-Control-Allow-Origin schränkt Cross-Origin-Zugriff auf eucx.eu ein.
      // Öffentliche Endpunkte (/api/public/*) erlauben zusätzlich Partnerzugriff
      // über expliziten EUCX-API-Key (in den jeweiligen Routen gehandhabt).
      {
        source: "/api/((?!og).*)",
        headers: [
          { key: "Cache-Control",                value: "no-store, no-cache, must-revalidate" },
          { key: "Pragma",                       value: "no-cache" },
          { key: "Access-Control-Allow-Origin",  value: "https://eucx.eu" },
          { key: "Access-Control-Allow-Methods", value: "GET, POST, PATCH, DELETE, OPTIONS" },
          { key: "Access-Control-Allow-Headers", value: "Authorization, Content-Type, X-Requested-With" },
          { key: "Access-Control-Max-Age",       value: "86400" },
        ],
      },
    ];
  },

};

export default withSentryConfig(nextConfig, {
  // Source Maps werden hochgeladen — SENTRY_AUTH_TOKEN muss in Vercel hinterlegt sein
  org:     process.env.SENTRY_ORG     ?? "eucx",
  project: process.env.SENTRY_PROJECT ?? "eucx-web",
  // Sentry-CLI-Telemetrie deaktivieren
  telemetry: false,
});
