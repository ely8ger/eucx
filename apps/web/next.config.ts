import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ESLint während Build überspringen (läuft separat in CI)
  eslint: { ignoreDuringBuilds: true },

  // Vercel Deployment-Optimierungen
  output: "standalone",

  // Security Headers
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline'",   // Next.js benötigt unsafe-inline
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob:",
              `connect-src 'self' ${process.env.NEXT_PUBLIC_API_URL ?? ""} ${process.env.NEXT_PUBLIC_WS_URL ?? ""}`,
              "font-src 'self'",
              "frame-ancestors 'none'",
            ].join("; "),
          },
        ],
      },
    ];
  },

  // Weiterleitungen
  async redirects() {
    return [
      {
        source: "/",
        destination: "/trading",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
