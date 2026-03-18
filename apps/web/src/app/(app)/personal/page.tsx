"use client";

const CONTRACT_MONITOR = [
  { id: "D-2026-0089", date: "17.03.2026", commodity: "Träger HEA 200",  qty: "60 t",  total: "45.600 EUR", role: "Käufer",    payStatus: "AUSSTEHEND"  as const, delivStatus: "AUSSTEHEND" as const, deadline: "27.03.2026" },
  { id: "D-2026-0085", date: "15.03.2026", commodity: "Nahtlosrohr Ø76", qty: "28 t",  total: "34.720 EUR", role: "Verkäufer", payStatus: "BEZAHLT"     as const, delivStatus: "GELIEFERT"  as const, deadline: "25.03.2026" },
  { id: "D-2026-0074", date: "12.03.2026", commodity: "Cu-Kathoden",     qty: "10 t",  total: "84.100 EUR", role: "Käufer",    payStatus: "TEILZAHLUNG" as const, delivStatus: "IN_TRANSIT" as const, deadline: "22.03.2026" },
  { id: "D-2026-0070", date: "10.03.2026", commodity: "Al-Walzbarren",   qty: "40 t",  total: "88.400 EUR", role: "Käufer",    payStatus: "BEZAHLT"     as const, delivStatus: "GELIEFERT"  as const, deadline: "20.03.2026" },
];

const PAY_MAP = {
  AUSSTEHEND:  { label: "Ausstehend",  color: "#991b1b", bg: "#fff1f1" },
  TEILZAHLUNG: { label: "Teilzahlung", color: "#92400e", bg: "#fffbeb" },
  BEZAHLT:     { label: "Bezahlt",     color: "#166534", bg: "#f0fdf4" },
};
const DELIV_MAP = {
  AUSSTEHEND:  { label: "Ausstehend",  color: "#991b1b", bg: "#fff1f1" },
  IN_TRANSIT:  { label: "Unterwegs",   color: "#92400e", bg: "#fffbeb" },
  GELIEFERT:   { label: "Geliefert",   color: "#166534", bg: "#f0fdf4" },
};

const ACCREDITATIONS = [
  { section: "Metalle",            status: "AKTIV"     as const, validUntil: "31.12.2026", broker: "EUCX Intern"       },
  { section: "Schrott & Sekundär", status: "AKTIV"     as const, validUntil: "31.12.2026", broker: "EUCX Intern"       },
  { section: "Holz & Forst",       status: "BEANTRAGT" as const, validUntil: "-",          broker: "-"                 },
  { section: "Agrar",              status: "INAKTIV"   as const, validUntil: "31.03.2026", broker: "Broker Meyer GmbH" },
];

const ACCR_MAP = {
  AKTIV:     { label: "Aktiv",     color: "#166534", bg: "#f0fdf4" },
  BEANTRAGT: { label: "Beantragt", color: "#92400e", bg: "#fffbeb" },
  INAKTIV:   { label: "Inaktiv",   color: "#991b1b", bg: "#fff1f1" },
};

const F = "'IBM Plex Sans', Arial, sans-serif";

const TH = ({ children, right }: { children: React.ReactNode; right?: boolean }) => (
  <th style={{ padding: "10px 16px", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "#888", textAlign: right ? "right" : "left", whiteSpace: "nowrap" }}>
    {children}
  </th>
);

const StatusBadge = ({ label, color, bg }: { label: string; color: string; bg: string }) => (
  <span style={{ display: "inline-block", fontSize: 11, fontWeight: 600, color, backgroundColor: bg, padding: "2px 8px", whiteSpace: "nowrap" }}>
    {label}
  </span>
);

export default function PersonalPage() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28, fontFamily: F }}>

      {/* ── Seitenkopf ──────────────────────────────────────────────────────── */}
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 300, color: "#0d1b2a", margin: 0 }}>Mein Bereich</h1>
        <p style={{ fontSize: 13, color: "#888", marginTop: 4 }}>Vertragserfüllung, Akkreditierungen und Kontoübersicht</p>
      </div>

      {/* ── Profil-Karte ────────────────────────────────────────────────────── */}
      <div style={{ backgroundColor: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,.08)", padding: "20px 24px", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 24, flexWrap: "wrap" }}>
        <div>
          <p style={{ fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: "#888", margin: 0, fontWeight: 500 }}>Teilnehmer</p>
          <p style={{ fontSize: 18, fontWeight: 600, color: "#0d1b2a", marginTop: 6 }}>Metallcenter Nord GmbH</p>
          <p style={{ fontSize: 13, color: "#888", marginTop: 2 }}>Bieter-Nr. TN-2024-00841 · Registriert 12.02.2024</p>
          <div style={{ display: "flex", gap: 6, marginTop: 10, flexWrap: "wrap" }}>
            {[
              { label: "Akkreditiert", color: "#166534", bg: "#f0fdf4" },
              { label: "KYC verifiziert", color: "#154194", bg: "#eef2fb" },
              { label: "2FA aktiv", color: "#154194", bg: "#eef2fb" },
            ].map(b => (
              <span key={b.label} style={{ display: "inline-block", fontSize: 11, fontWeight: 600, color: b.color, backgroundColor: b.bg, padding: "3px 10px" }}>{b.label}</span>
            ))}
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 2, backgroundColor: "#e0e0e0" }}>
          {[
            { label: "Kaution gesamt", value: "50.000 EUR", color: "#0d1b2a" },
            { label: "Gesperrt",       value: "14.200 EUR", color: "#991b1b" },
            { label: "Frei",           value: "35.800 EUR", color: "#166534" },
          ].map(k => (
            <div key={k.label} style={{ backgroundColor: "#fff", padding: "14px 20px" }}>
              <p style={{ fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: "#888", margin: 0, fontWeight: 500 }}>{k.label}</p>
              <p style={{ fontSize: 20, fontWeight: 300, color: k.color, marginTop: 6, lineHeight: 1 }}>{k.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Vertragserfüllung ───────────────────────────────────────────────── */}
      <section>
        <h2 style={{ fontSize: 15, fontWeight: 600, color: "#0d1b2a", margin: "0 0 12px" }}>Vertragserfüllung - Laufende Abschlüsse</h2>
        <div style={{ backgroundColor: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,.08)" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ backgroundColor: "#fafafa", borderBottom: "1px solid #f0f0f0" }}>
                  <TH>Abschluss-Nr.</TH>
                  <TH>Datum</TH>
                  <TH>Ware</TH>
                  <TH right>Menge</TH>
                  <TH right>Gesamtwert</TH>
                  <TH>Meine Rolle</TH>
                  <TH>Zahlung</TH>
                  <TH>Lieferung</TH>
                  <TH>Frist</TH>
                </tr>
              </thead>
              <tbody>
                {CONTRACT_MONITOR.map((c) => (
                  <tr key={c.id} style={{ borderBottom: "1px solid #f7f7f7" }}
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#fafafa")}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}>
                    <td style={{ padding: "12px 16px", fontFamily: "monospace", fontSize: 12, fontWeight: 600, color: "#154194", whiteSpace: "nowrap" }}>{c.id}</td>
                    <td style={{ padding: "12px 16px", fontSize: 12, color: "#505050", whiteSpace: "nowrap" }}>{c.date}</td>
                    <td style={{ padding: "12px 16px", fontSize: 13, fontWeight: 500, color: "#0d1b2a" }}>{c.commodity}</td>
                    <td style={{ padding: "12px 16px", textAlign: "right", fontFamily: "monospace", fontSize: 13, color: "#505050" }}>{c.qty}</td>
                    <td style={{ padding: "12px 16px", textAlign: "right", fontFamily: "monospace", fontSize: 13, fontWeight: 600, color: "#0d1b2a", whiteSpace: "nowrap" }}>{c.total}</td>
                    <td style={{ padding: "12px 16px" }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: c.role === "Käufer" ? "#166534" : "#dc2626" }}>{c.role}</span>
                    </td>
                    <td style={{ padding: "12px 16px" }}><StatusBadge {...PAY_MAP[c.payStatus]} /></td>
                    <td style={{ padding: "12px 16px" }}><StatusBadge {...DELIV_MAP[c.delivStatus]} /></td>
                    <td style={{ padding: "12px 16px", fontSize: 12, color: "#888", whiteSpace: "nowrap" }}>{c.deadline}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── Akkreditierungen ────────────────────────────────────────────────── */}
      <section>
        <h2 style={{ fontSize: 15, fontWeight: 600, color: "#0d1b2a", margin: "0 0 12px" }}>Akkreditierungen je Warengruppe</h2>
        <div style={{ backgroundColor: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,.08)" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ backgroundColor: "#fafafa", borderBottom: "1px solid #f0f0f0" }}>
                  <TH>Warengruppe</TH>
                  <TH>Status</TH>
                  <TH>Gültig bis</TH>
                  <TH>Broker / Verwalter</TH>
                  <TH>{""}</TH>
                </tr>
              </thead>
              <tbody>
                {ACCREDITATIONS.map((a) => (
                  <tr key={a.section} style={{ borderBottom: "1px solid #f7f7f7" }}
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#fafafa")}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}>
                    <td style={{ padding: "12px 16px", fontSize: 13, fontWeight: 500, color: "#0d1b2a" }}>{a.section}</td>
                    <td style={{ padding: "12px 16px" }}><StatusBadge {...ACCR_MAP[a.status]} /></td>
                    <td style={{ padding: "12px 16px", fontSize: 12, color: "#505050" }}>{a.validUntil}</td>
                    <td style={{ padding: "12px 16px", fontSize: 12, color: "#888" }}>{a.broker}</td>
                    <td style={{ padding: "12px 16px" }}>
                      {a.status === "INAKTIV" && (
                        <button style={{ fontSize: 12, fontWeight: 600, color: "#154194", background: "none", border: "none", cursor: "pointer" }}
                          onMouseEnter={e => (e.currentTarget.style.color = "#0f3070")}
                          onMouseLeave={e => (e.currentTarget.style.color = "#154194")}>Erneuern</button>
                      )}
                      {a.status === "BEANTRAGT" && (
                        <span style={{ fontSize: 12, color: "#aaa" }}>In Prüfung</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

    </div>
  );
}
