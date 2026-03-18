"use client";
import { EucxLogo } from "@/components/logo/EucxLogo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#f0f4fb", fontFamily: "'IBM Plex Sans', Arial, sans-serif" }}>

      {/* ── Institutioneller Portal-Header ───────────────────────────────── */}
      <div style={{ backgroundColor: "#0b1e36", borderBottom: "3px solid #154194" }}>
        <div className="max-w-screen-xl mx-auto px-6 h-14 flex items-center justify-between">
          <EucxLogo variant="white" size="sm" />
          <div className="flex items-center gap-1.5">
            <svg width="12" height="14" viewBox="0 0 12 14" fill="none" aria-hidden="true">
              <rect x="1" y="6" width="10" height="7" rx="1" stroke="rgba(255,255,255,0.45)" strokeWidth="1.2"/>
              <path d="M4 6V4a2 2 0 014 0v2" stroke="rgba(255,255,255,0.45)" strokeWidth="1.2" strokeLinecap="round"/>
            </svg>
            <span style={{ fontSize: 11, color: "rgba(255,255,255,.45)", letterSpacing: "0.02em" }}>Gesicherter Bereich - TLS 1.3</span>
          </div>
        </div>
      </div>

      {/* ── Systemstatus-Bar ─────────────────────────────────────────────── */}
      <div style={{ backgroundColor: "#0d1a30", borderBottom: "1px solid rgba(255,255,255,.06)" }}>
        <div style={{ maxWidth: 1180, margin: "0 auto", padding: "0 24px", height: 30, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "rgba(255,255,255,.4)" }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: "#22c55e", display: "inline-block", boxShadow: "0 0 6px rgba(34,197,94,.6)" }} />
            Alle Systeme betriebsbereit
          </div>
          <span style={{ fontSize: 11, color: "rgba(255,255,255,.25)", letterSpacing: "0.02em" }}>Handelssitzungen Mo-Fr 09:00-17:30 MEZ · Sitzung: 15 Min.</span>
        </div>
      </div>

      {/* ── Zentrierter Inhalt mit Punktraster-Hintergrund ───────────────── */}
      <div
        className="flex-1 flex flex-col items-center justify-center px-4 py-12"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(21,65,148,0.11) 1.5px, transparent 1.5px)",
          backgroundSize: "24px 24px",
        }}
      >
        {children}
      </div>

      {/* ── Portal-Footer ─────────────────────────────────────────────────── */}
      <div style={{ backgroundColor: "#fff", borderTop: "1px solid #e4e8ef" }}>
        <div className="max-w-screen-xl mx-auto px-6 py-4 flex items-center justify-between">
          <p style={{ fontSize: 11, color: "#aaa", margin: 0 }}>© 2026 EUCX GmbH - Frankfurt am Main</p>
          <nav className="flex items-center gap-4">
            {[["Impressum", "/impressum"], ["Datenschutz", "/datenschutz"], ["Barrierefreiheit", "#"]].map(([label, href]) => (
              <a key={label} href={href} style={{ fontSize: 11, color: "#aaa", textDecoration: "none" }}
                onMouseEnter={e => (e.currentTarget.style.color = "#154194")}
                onMouseLeave={e => (e.currentTarget.style.color = "#aaa")}>
                {label}
              </a>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
}
