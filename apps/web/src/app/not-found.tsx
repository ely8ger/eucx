import type { Metadata } from "next";
import Link              from "next/link";

const SANS = "'IBM Plex Sans', Arial, sans-serif";

export const metadata: Metadata = {
  title:  "Seite nicht gefunden | EUCX",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <div style={{
      minHeight: "100vh",
      background: "#f5f7fb",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "0 24px",
      fontFamily: SANS,
      fontWeight: 300,
    }}>
      <div style={{ textAlign: "center", maxWidth: 420 }}>
        {/* Logo */}
        <div style={{ marginBottom: 32 }}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 36" width="40" height="40" style={{ display: "inline-block" }}>
            <rect width="36" height="36" fill="#154194"/>
            <rect x="7" y="10"   width="15" height="2.5" fill="white" opacity="0.9"/>
            <rect x="7" y="16.75" width="22" height="2.5" fill="white" opacity="0.55"/>
            <rect x="7" y="23.5" width="10" height="2.5" fill="white" opacity="0.9"/>
            <rect x="27" y="8"   width="2"  height="20"  fill="white" opacity="0.25"/>
          </svg>
        </div>

        {/* 404 */}
        <div style={{
          fontSize: 72,
          fontWeight: 700,
          color: "#154194",
          opacity: 0.08,
          lineHeight: 1,
          marginBottom: 16,
          letterSpacing: "-0.04em",
          userSelect: "none",
        }}>
          404
        </div>

        <h1 style={{ fontSize: 22, fontWeight: 700, color: "#0b1e36", margin: "0 0 10px" }}>
          Seite nicht gefunden
        </h1>
        <p style={{ fontSize: 14, color: "#6b7280", margin: "0 0 32px", lineHeight: 1.6 }}>
          Die angeforderte Seite existiert nicht oder wurde verschoben.
        </p>

        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <Link
            href="/"
            style={{
              padding: "10px 22px",
              background: "#154194",
              color: "#fff",
              textDecoration: "none",
              fontSize: 13,
              fontWeight: 700,
              fontFamily: SANS,
              letterSpacing: "0.04em",
              display: "inline-block",
            }}
            onMouseEnter={e => (e.currentTarget.style.background = "#1a52c2")}
            onMouseLeave={e => (e.currentTarget.style.background = "#154194")}
          >
            Zur Startseite
          </Link>
          <Link
            href="/katalog"
            style={{
              padding: "10px 22px",
              border: "1px solid #c9d8f0",
              color: "#0b1e36",
              textDecoration: "none",
              fontSize: 13,
              fontWeight: 400,
              fontFamily: SANS,
              display: "inline-block",
            }}
            onMouseEnter={e => (e.currentTarget.style.background = "#f0f4fa")}
            onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
          >
            Zum Katalog
          </Link>
        </div>

        <p style={{ fontSize: 11, color: "#9ca3af", marginTop: 40, letterSpacing: "0.04em" }}>
          EUCX — European Union Commodity Exchange
        </p>
      </div>
    </div>
  );
}
