import type { NextConfig } from "next";

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
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",  // Next.js + recharts
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob: https:",
              `connect-src 'self' ${process.env.NEXT_PUBLIC_API_URL ?? ""} ${process.env.NEXT_PUBLIC_WS_URL ?? ""} wss:`,
              "font-src 'self' data:",
              "frame-ancestors 'none'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join("; "),
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

      // ── API-Routes: kein Cache ───────────────────────────────────────────
      {
        source: "/api/((?!og).*)",
        headers: [
          { key: "Cache-Control", value: "no-store, no-cache, must-revalidate" },
          { key: "Pragma",        value: "no-cache" },
        ],
      },
    ];
  },

};

export default nextConfig;
