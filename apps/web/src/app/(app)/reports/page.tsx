import type { Metadata } from "next";

export const metadata: Metadata = { title: "Berichte - EUCX" };
export const dynamic = "force-dynamic";

const F = "'IBM Plex Sans', Arial, sans-serif";

export default function ReportsPage() {
  return (
    <div style={{ fontFamily: F, display: "flex", flexDirection: "column", gap: 24 }}>
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 300, color: "#0d1b2a", margin: 0 }}>Handelsberichte</h1>
        <p style={{ fontSize: 13, color: "#888", marginTop: 4 }}>Auswertungen, Abrechnungen und Exportfunktionen</p>
      </div>
      <div style={{ backgroundColor: "#fff", padding: "32px 24px", boxShadow: "0 1px 3px rgba(0,0,0,.08)", textAlign: "center" }}>
        <div style={{ width: 48, height: 48, backgroundColor: "#f0f4fb", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#154194" strokeWidth="1.5" strokeLinecap="round">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/>
            <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
          </svg>
        </div>
        <p style={{ fontSize: 14, fontWeight: 600, color: "#0d1b2a", margin: "0 0 6px" }}>Wird entwickelt</p>
        <p style={{ fontSize: 13, color: "#888", margin: 0 }}>Diese Seite ist in Bearbeitung.</p>
      </div>
    </div>
  );
}
