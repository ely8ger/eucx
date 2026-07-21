"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { EucxHeader } from "@/components/layout/EucxHeader";

const A  = "#d97706";
const A2 = "#b45309";

interface Charge {
  id:                string;
  schmelzNr:         string | null;
  material:          string;
  spec:              string | null;
  quantity:          string;
  unit:              string;
  warehouseLocation: string | null;
  co2PerTonne:       string | null;
  countryOfOrigin:   string | null;
  productionSiteId:  string | null;
  incoterms:         string | null;
  status:            "AVAILABLE" | "RESERVED" | "SOLD" | "CANCELLED";
  certificate31:     string | null;
  createdAt:         string;
  lot?:              { id: string; commodity: string; phase: string } | null;
}

const STATUS_COLOR: Record<string, string> = {
  AVAILABLE:  "#16a34a",
  RESERVED:   "#d97706",
  SOLD:       "#6b7280",
  CANCELLED:  "#dc2626",
};

const STATUS_LABEL: Record<string, string> = {
  AVAILABLE:  "Verfügbar",
  RESERVED:   "Reserviert",
  SOLD:       "Verkauft",
  CANCELLED:  "Storniert",
};

const COUNTRIES = [
  "DE - Deutschland", "AT - Österreich", "PL - Polen", "CZ - Tschechien",
  "SK - Slowakei", "HU - Ungarn", "RO - Rumänien", "HR - Kroatien",
  "IT - Italien", "FR - Frankreich", "ES - Spanien", "BE - Belgien",
  "NL - Niederlande", "LU - Luxemburg", "SE - Schweden", "FI - Finnland",
  "TR - Türkei", "UA - Ukraine", "BY - Weißrussland",
  "CN - China", "IN - Indien", "KR - Südkorea", "JP - Japan",
  "BR - Brasilien", "ZA - Südafrika", "EG - Ägypten", "DZ - Algerien",
  "KZ - Kasachstan", "AZ - Aserbaidschan", "GE - Georgien",
  "AM - Armenien", "TM - Turkmenistan", "RS - Serbien", "MK - Nordmazedonien",
  "BA - Bosnien-Herzegowina", "ME - Montenegro", "AL - Albanien",
];

const LAGER_ORTE = [
  "Hamburg", "Kiel", "Lübeck", "Rostock", "Bremerhaven", "Bremen",
  "Duisburg", "Dortmund", "Hannover", "Berlin", "Leipzig", "München",
  "Stuttgart", "Frankfurt am Main", "Köln", "Düsseldorf", "Essen",
  "Rotterdam", "Antwerpen", "Amsterdam", "Gent",
  "Glasgow", "Grangemouth", "Teesport", "Immingham",
  "Gdańsk", "Szczecin", "Warschau",
  "Riga", "Tallinn", "Klaipeda",
  "Istanbul", "Iskenderun", "Constanta", "Triest", "Genua",
  "Barcelona", "Le Havre", "Marseille",
];

interface UserStatus {
  totpEnabled:        boolean;
  verificationStatus: string;
  phoneVerified:      boolean;
}

export function SellerInventoryClient() {
  const router = useRouter();
  const [token,          setToken]          = useState("");
  const [userStatus,     setUserStatus]     = useState<UserStatus | null>(null);
  const [showPreflight,  setShowPreflight]  = useState(false);
  const [charges,        setCharges]        = useState<Charge[]>([]);
  const [loading,        setLoading]        = useState(true);
  const [saving,         setSaving]         = useState(false);
  const [error,          setError]          = useState("");
  const [showForm,       setShowForm]       = useState(false);

  const [fMaterial,   setFMaterial]   = useState("");
  const [fSpec,       setFSpec]       = useState("");
  const [fQty,        setFQty]        = useState("");
  const [fLager,      setFLager]      = useState("");
  const [fCo2,        setFCo2]        = useState("");
  const [fLand,       setFLand]       = useState("DE - Deutschland");
  const [fRegistryId, setFRegistryId] = useState("");
  const [fIncoterms,  setFIncoterms]  = useState("DAP");
  const [fSchmelzNr,  setFSchmelzNr]  = useState("");

  useEffect(() => {
    const tkn = localStorage.getItem("accessToken") ?? "";
    setToken(tkn);
    if (!tkn) { router.replace("/login"); return; }
    fetch("/api/auth/me", { headers: { Authorization: `Bearer ${tkn}` } })
      .then((r) => r.ok ? r.json() : null)
      .then((d) => {
        if (d) setUserStatus({ totpEnabled: d.totpEnabled ?? false, verificationStatus: d.verificationStatus ?? "GUEST", phoneVerified: d.phoneVerified ?? false });
      })
      .catch(() => null);
  }, [router]);

  const tryRefresh = useCallback(async (): Promise<string | null> => {
    try {
      const r = await fetch("/api/auth/refresh", { method: "POST", credentials: "include" });
      if (!r.ok) return null;
      const data = await r.json() as { accessToken: string };
      localStorage.setItem("accessToken", data.accessToken);
      setToken(data.accessToken);
      return data.accessToken;
    } catch {
      return null;
    }
  }, []);

  const load = useCallback(async (tkn?: string) => {
    const t = tkn ?? token;
    if (!t) return;
    setLoading(true);
    setError("");
    try {
      let r = await fetch("/api/seller/inventory", {
        headers: { Authorization: `Bearer ${t}` },
      });
      if (r.status === 401) {
        const fresh = await tryRefresh();
        if (!fresh) { setError("Sitzung abgelaufen — bitte neu anmelden."); router.replace("/login"); return; }
        r = await fetch("/api/seller/inventory", {
          headers: { Authorization: `Bearer ${fresh}` },
        });
      }
      if (r.ok) {
        const data = await r.json() as Charge[];
        setCharges(data);
      } else {
        let msg = `GET Fehler ${r.status}`;
        try { const d = await r.json() as { error?: string; details?: string }; msg = d.error ?? msg; if (d.details) msg += ": " + d.details; } catch { /* */ }
        setError(msg);
      }
    } catch (err) {
      setError(`Netzwerkfehler: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  }, [token, tryRefresh, router]);

  useEffect(() => { void load(); }, [load]);

  async function addCharge(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const body = {
        material:          fMaterial,
        spec:              fSpec || undefined,
        quantity:          parseFloat(fQty),
        unit:              "TON",
        schmelzNr:         fSchmelzNr || undefined,
        warehouseLocation: fLager || undefined,
        co2PerTonne:       fCo2 ? parseFloat(fCo2) : undefined,
        countryOfOrigin:   fLand || undefined,
        productionSiteId:  fRegistryId || undefined,
        incoterms:         fIncoterms,
      };
      let tkn = token;
      let r = await fetch("/api/seller/inventory", {
        method:  "POST",
        headers: { Authorization: `Bearer ${tkn}`, "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (r.status === 401) {
        const fresh = await tryRefresh();
        if (!fresh) { setError("Sitzung abgelaufen — bitte neu anmelden."); router.replace("/login"); return; }
        tkn = fresh;
        r = await fetch("/api/seller/inventory", {
          method:  "POST",
          headers: { Authorization: `Bearer ${tkn}`, "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
      }
      if (r.ok) {
        setShowForm(false);
        setFMaterial(""); setFSpec(""); setFQty(""); setFLager("");
        setFCo2(""); setFRegistryId(""); setFSchmelzNr("");
        setFLand("DE - Deutschland");
        await load(tkn);
      } else {
        let msg = `Serverfehler ${r.status}`;
        try {
          const d = await r.json() as { error?: string; details?: unknown };
          msg = d.error ?? msg;
          if (d.details) msg += ` — ${JSON.stringify(d.details)}`;
        } catch { /* non-JSON body */ }
        setError(msg);
      }
    } catch (err) {
      setError(`Netzwerkfehler: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setSaving(false);
    }
  }

  async function deleteCharge(id: string) {
    if (!confirm("Charge unwiderruflich löschen?")) return;
    const r = await fetch(`/api/seller/inventory/${id}`, {
      method:  "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (r.ok || r.status === 204) {
      setCharges((prev) => prev.filter((c) => c.id !== id));
    } else {
      const d = await r.json() as { error?: string };
      alert(d.error ?? "Löschen nicht möglich.");
    }
  }

  const available = charges.filter((c) => c.status === "AVAILABLE");
  const totalQty  = available.reduce((s, c) => s + parseFloat(c.quantity), 0);
  const co2Vals   = charges.filter((c) => c.co2PerTonne !== null).map((c) => parseFloat(c.co2PerTonne!));
  const avgCo2    = co2Vals.length > 0 ? co2Vals.reduce((s, v) => s + v, 0) / co2Vals.length : 0;
  const noCbam    = charges.filter((c) => !c.productionSiteId).length;

  return (
    <>
      <style>{`
        .inv { font-family:"IBM Plex Sans",sans-serif; min-height:100vh; background:#f8f9fa; color:#1a1a1a; }
        .inv-stripe { background:linear-gradient(90deg,#78350f,#92400e); border-bottom:1px solid #b45309; height:36px; padding:0 28px; display:flex; align-items:center; }
        .inv-stripe-inner { max-width:1100px; margin:0 auto; width:100%; display:flex; align-items:center; gap:12px; }
        .inv-badge { font-size:10px; font-weight:700; letter-spacing:.1em; text-transform:uppercase; color:#fde68a; background:rgba(255,255,255,.12); padding:3px 10px; }
        .inv-page { max-width:1100px; margin:0 auto; padding:28px 24px 80px; }
        .inv-hd { display:flex; align-items:center; justify-content:space-between; gap:12px; margin-bottom:24px; flex-wrap:wrap; }
        .inv-title { font-size:20px; font-weight:700; color:#111827; }
        .inv-sub { font-size:12.5px; color:#6b7280; margin-top:2px; }
        .inv-btn { padding:10px 20px; background:${A}; color:#fff; font-size:13px; font-weight:700; border:none; cursor:pointer; transition:background .15s; }
        .inv-btn:hover { background:${A2}; }
        .inv-btn:disabled { background:#d1d5db; cursor:not-allowed; }
        .inv-kpi { display:grid; grid-template-columns:repeat(3,1fr); gap:14px; margin-bottom:24px; }
        @media(max-width:640px){.inv-kpi{grid-template-columns:1fr;}}
        .inv-kpi-card { background:#fff; border:1px solid #e5e7eb; border-top:3px solid ${A}; padding:16px 18px; }
        .inv-kpi-num { font-family:"IBM Plex Mono",monospace; font-size:26px; font-weight:700; }
        .inv-kpi-label { font-size:10.5px; text-transform:uppercase; letter-spacing:.06em; color:#9ca3af; margin-top:4px; font-weight:700; }
        .inv-form { background:#fff; border:1px solid #e5e7eb; border-top:3px solid ${A}; padding:24px 28px; margin-bottom:24px; }
        .inv-form-title { font-size:14px; font-weight:700; margin-bottom:20px; }
        .inv-form-grid { display:grid; grid-template-columns:1fr 1fr; gap:14px; }
        @media(max-width:640px){.inv-form-grid{grid-template-columns:1fr;}}
        .inv-label { font-size:12px; font-weight:600; color:#374151; display:block; margin-bottom:5px; }
        .inv-input { width:100%; height:38px; border:1px solid #d1d5db; padding:0 10px; font-size:13.5px; outline:none; font-family:inherit; box-sizing:border-box; }
        .inv-input:focus { border-color:${A}; }
        .inv-select { width:100%; height:38px; border:1px solid #d1d5db; padding:0 10px; font-size:13.5px; outline:none; font-family:inherit; background:#fff; appearance:none; box-sizing:border-box; }
        .inv-select:focus { border-color:${A}; }
        .inv-form-actions { display:flex; gap:10px; margin-top:20px; }
        .inv-btn-cancel { padding:10px 18px; background:#fff; color:#374151; font-size:13px; border:1px solid #d1d5db; cursor:pointer; }
        .inv-cbam-hd { display:flex; align-items:center; gap:10px; margin:20px 0 12px; padding-bottom:8px; border-bottom:1px solid #e5e7eb; }
        .inv-cbam-badge { font-size:10px; font-weight:700; padding:2px 8px; background:#dbeafe; color:#1d4ed8; }
        .inv-table-wrap { overflow-x:auto; }
        .inv-table { width:100%; border-collapse:collapse; background:#fff; border:1px solid #e5e7eb; font-size:13px; }
        .inv-table th { padding:10px 14px; text-align:left; font-size:10.5px; font-weight:700; text-transform:uppercase; letter-spacing:.06em; color:#9ca3af; border-bottom:2px solid ${A}; white-space:nowrap; }
        .inv-table td { padding:13px 14px; border-bottom:1px solid #f3f4f6; vertical-align:middle; }
        .inv-table tr:last-child td { border-bottom:none; }
        .inv-table tr:hover td { background:#fffbf5; }
        .inv-status { display:inline-block; padding:3px 8px; font-size:10.5px; font-weight:700; color:#fff; white-space:nowrap; }
        .inv-co2-val { font-family:"IBM Plex Mono",monospace; color:#16a34a; font-weight:700; }
        .inv-warn { display:inline-flex; align-items:center; gap:4px; font-size:10.5px; color:#dc2626; font-weight:600; }
        .inv-action { font-size:12px; font-weight:700; color:${A}; text-decoration:none; cursor:pointer; background:none; border:none; padding:0; }
        .inv-action:hover { text-decoration:underline; }
        .inv-del { font-size:12px; font-weight:700; color:#dc2626; cursor:pointer; background:none; border:none; padding:0; margin-left:10px; }
        .inv-del:hover { text-decoration:underline; }
        .inv-err { background:#fef2f2; border:1px solid #fecaca; border-left:4px solid #dc2626; padding:12px 16px; margin-bottom:16px; font-size:13px; color:#dc2626; }
        .inv-empty { padding:40px; text-align:center; color:#9ca3af; font-size:13px; background:#fff; border:1px solid #e5e7eb; }
        .inv-loading { padding:40px; text-align:center; color:#9ca3af; font-size:13px; }
      `}</style>

      <datalist id="country-list">
        {COUNTRIES.map((c) => <option key={c} value={c} />)}
      </datalist>
      <datalist id="lager-orte">
        {LAGER_ORTE.map((p) => <option key={p} value={p} />)}
      </datalist>

      <div className="inv">
        <EucxHeader />
        <div className="inv-stripe">
          <div className="inv-stripe-inner">
            <span className="inv-badge">LAGERBESTAND</span>
            <span style={{ fontSize: 11, color: "rgba(253,230,138,.7)" }}>
              Chargen verwalten · CBAM-Tresor · Zertifikate hochladen
            </span>
          </div>
        </div>

        <div className="inv-page">
          <div className="inv-hd">
            <div>
              <div className="inv-title">Bestands- & Chargenverwaltung</div>
              <div className="inv-sub">Physische Ware, Schmelznummern und CBAM-Nachweise an einem Ort</div>
            </div>
            <button className="inv-btn" onClick={() => {
              if (showForm) { setShowForm(false); return; }
              const isTotp = userStatus?.totpEnabled ?? false;
              const isKyc  = userStatus?.verificationStatus === "VERIFIED";
              if (!isTotp || !isKyc) { setShowPreflight(true); }
              else { setShowForm(true); }
            }}>
              {showForm ? "✕ Abbrechen" : "+ Neue Charge melden"}
            </button>
          </div>

          {error && <div className="inv-err">{error}</div>}

          {/* Preflight-Check */}
          {showPreflight && (() => {
            const isTotp = userStatus?.totpEnabled ?? false;
            const isKyc  = userStatus?.verificationStatus === "VERIFIED";
            const ok     = isTotp && isKyc;
            return (
              <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderTop: `3px solid ${A}`, padding: "24px 28px", marginBottom: 24 }}>
                <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>Voraussetzungen für Lagerchargen</div>
                <div style={{ fontSize: 12.5, color: "#6b7280", marginBottom: 20 }}>Alle Punkte müssen erfüllt sein bevor Sie Ware ins System eintragen können.</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24 }}>
                  {[
                    { ok: isKyc,  label: "Identitätsprüfung (KYC)", desc: isKyc ? "Identität bestätigt — vollständig handelsberechtigt." : "KYC noch nicht abgeschlossen. Unterlagen einreichen.", href: "/dashboard/settings/verification" },
                    { ok: isTotp, label: "Zwei-Faktor-Authentifizierung", desc: isTotp ? "2FA aktiv — Konto zusätzlich gesichert." : "2FA noch nicht eingerichtet. Bitte jetzt aktivieren.", href: "/dashboard/settings/security" },
                  ].map((row) => (
                    <div key={row.label} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 16px", background: row.ok ? "#f0fdf4" : "#fef2f2", border: `1px solid ${row.ok ? "#bbf7d0" : "#fecaca"}` }}>
                      <div style={{ width: 28, height: 28, borderRadius: "50%", background: row.ok ? "#16a34a" : "#dc2626", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 14, flexShrink: 0 }}>
                        {row.ok ? "✓" : "✕"}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>{row.label}</div>
                        <div style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>{row.desc}</div>
                      </div>
                      {!row.ok && (
                        <a href={row.href} style={{ padding: "7px 14px", background: A, color: "#fff", fontSize: 12, fontWeight: 700, textDecoration: "none", whiteSpace: "nowrap" }}>
                          Einrichten →
                        </a>
                      )}
                    </div>
                  ))}
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  <button
                    className="inv-btn"
                    disabled={!ok}
                    onClick={() => { setShowPreflight(false); setShowForm(true); }}
                    title={!ok ? "Alle Punkte müssen grün sein" : undefined}
                  >
                    {ok ? "Weiter → Charge anlegen" : "Ausstehend"}
                  </button>
                  <button className="inv-btn-cancel" onClick={() => setShowPreflight(false)}>Abbrechen</button>
                </div>
              </div>
            );
          })()}

          <div className="inv-kpi">
            <div className="inv-kpi-card">
              <div className="inv-kpi-num">{totalQty.toLocaleString("de-DE", { maximumFractionDigits: 2 })}</div>
              <div className="inv-kpi-label">Tonnen verfügbar</div>
            </div>
            <div className="inv-kpi-card">
              <div className="inv-kpi-num" style={{ color: "#16a34a" }}>
                {avgCo2.toLocaleString("de-DE", { maximumFractionDigits: 2 })} t
              </div>
              <div className="inv-kpi-label">Ø CO₂-Fußabdruck / Tonne</div>
            </div>
            <div className="inv-kpi-card">
              <div className="inv-kpi-num" style={{ color: noCbam > 0 ? "#dc2626" : "#16a34a" }}>
                {charges.length - noCbam} / {charges.length}
              </div>
              <div className="inv-kpi-label">Chargen mit CBAM-Nachweis</div>
            </div>
          </div>

          {showForm && (
            <div className="inv-form">
              <div className="inv-form-title">Neue Charge erfassen</div>
              <form onSubmit={(e) => void addCharge(e)}>
                <div className="inv-form-grid">
                  <div>
                    <label className="inv-label">Material / Produkt *</label>
                    <input className="inv-input" placeholder="z.B. Betonstahl BST 500S" value={fMaterial} onChange={(e) => setFMaterial(e.target.value)} required />
                  </div>
                  <div>
                    <label className="inv-label">
                      Spezifikation
                      <span style={{ fontWeight: 400, color: "#9ca3af", marginLeft: 6 }}>Norm + Abmessung</span>
                    </label>
                    <input className="inv-input" placeholder="z.B. EN 10080 - Ø12mm BST 500S" value={fSpec} onChange={(e) => setFSpec(e.target.value)} />
                    <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 4 }}>
                      EN 10080 = EU-Norm für Betonstahl · DIN 488 = Deutsche Norm · EN 10025 = Baustahl
                    </div>
                  </div>
                  <div>
                    <label className="inv-label">Menge (Tonnen) *</label>
                    <input className="inv-input" type="number" min="0.1" step="0.1" placeholder="250" value={fQty} onChange={(e) => setFQty(e.target.value)} required />
                  </div>
                  <div>
                    <label className="inv-label">
                      Schmelznummer
                      <span style={{ fontWeight: 400, color: "#9ca3af", marginLeft: 6 }}>aus dem 3.1-Werkszeugnis</span>
                    </label>
                    <input
                      className="inv-input"
                      placeholder="z.B. SLZ-2026-04421 oder A 1234567"
                      value={fSchmelzNr}
                      onChange={(e) => setFSchmelzNr(e.target.value)}
                    />
                    <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 4 }}>
                      Aufbau:{" "}
                      <span style={{ fontFamily: "'IBM Plex Mono',monospace", color: "#374151", letterSpacing: ".02em" }}>
                        SLZ - 2026 - 04421
                      </span>
                      {" "}(Werk-Kürzel - Jahr - Laufnummer). Steht auf dem 3.1-Zeugnis (EN 10204).
                    </div>
                  </div>
                  <div>
                    <label className="inv-label">Lager / Standort</label>
                    <input
                      className="inv-input"
                      list="lager-orte"
                      placeholder="z.B. Hamburg, Kiel, Rotterdam..."
                      value={fLager}
                      onChange={(e) => setFLager(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="inv-label">Herkunftsland</label>
                    <input
                      className="inv-input"
                      list="country-list"
                      placeholder="z.B. DE - Deutschland oder Usbekistan"
                      value={fLand}
                      onChange={(e) => setFLand(e.target.value)}
                    />
                    <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 4 }}>
                      Aus Liste wählen oder frei eingeben, z.B. Usbekistan, Kasachstan, Georgien
                    </div>
                  </div>
                </div>

                <div className="inv-cbam-hd">
                  <span style={{ fontSize: 12.5, fontWeight: 700, color: "#154194" }}>CBAM-Tresor</span>
                  <span className="inv-cbam-badge">EU-Verordnung 2023/956</span>
                </div>
                <div className="inv-form-grid">
                  <div>
                    <label className="inv-label">CO₂-Emissionen (kg CO₂-Äq./t)</label>
                    <input className="inv-input" type="number" step="0.0001" placeholder="1850.0000" value={fCo2} onChange={(e) => setFCo2(e.target.value)} />
                  </div>
                  <div>
                    <label className="inv-label">CBAM-Registry-ID (Produktionsstätte)</label>
                    <input className="inv-input" placeholder="CBAM-DE-12345678" value={fRegistryId} onChange={(e) => setFRegistryId(e.target.value)} />
                  </div>
                  <div>
                    <label className="inv-label">Lieferbedingung (INCOTERMS® 2020)</label>
                    <select className="inv-select" value={fIncoterms} onChange={(e) => setFIncoterms(e.target.value)}>
                      {[
                        ["EXW", "Ex Works - Ab Werk"],
                        ["FCA", "Free Carrier - Frei Frachtführer"],
                        ["FAS", "Free Alongside Ship - Frei Längsseite Schiff"],
                        ["FOB", "Free On Board - Frei an Bord"],
                        ["CFR", "Cost and Freight - Kosten und Fracht"],
                        ["CIF", "Cost Insurance Freight - Kosten, Versicherung, Fracht"],
                        ["CPT", "Carriage Paid To - Frachtfrei"],
                        ["CIP", "Carriage Insurance Paid - Frachtfrei versichert"],
                        ["DAP", "Delivered At Place - Geliefert benannter Ort"],
                        ["DPU", "Delivered at Place Unloaded - Geliefert entladen"],
                        ["DDP", "Delivered Duty Paid - Geliefert verzollt"],
                      ].map(([code, label]) => (
                        <option key={code} value={code}>{code} - {label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="inv-form-actions">
                  <button className="inv-btn" type="submit" disabled={saving}>
                    {saving ? "Speichern..." : "Charge speichern"}
                  </button>
                  <button className="inv-btn-cancel" type="button" onClick={() => setShowForm(false)}>Abbrechen</button>
                </div>
              </form>
            </div>
          )}

          {loading ? (
            <div className="inv-loading">Chargen werden geladen…</div>
          ) : charges.length === 0 ? (
            <div className="inv-empty">
              Noch keine Chargen erfasst. Klicken Sie auf „+ Neue Charge melden" um Ihre erste Lagercharge anzulegen.
            </div>
          ) : (
            <div className="inv-table-wrap">
              <table className="inv-table">
                <thead>
                  <tr>
                    <th>Charge-ID</th>
                    <th>Material / Spezifikation</th>
                    <th>Menge</th>
                    <th>Lager</th>
                    <th>CBAM - CO₂/t</th>
                    <th>Herkunft</th>
                    <th>Incoterms</th>
                    <th>Status</th>
                    <th>Aktionen</th>
                  </tr>
                </thead>
                <tbody>
                  {charges.map((c) => (
                    <tr key={c.id}>
                      <td>
                        <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, color: "#374151" }}>
                          {c.id.slice(0, 14)}…
                        </div>
                        {c.schmelzNr && (
                          <div style={{ fontSize: 10.5, color: "#9ca3af" }}>{c.schmelzNr}</div>
                        )}
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, color: "#111827" }}>{c.material}</div>
                        {c.spec && <div style={{ fontSize: 11.5, color: "#6b7280" }}>{c.spec}</div>}
                      </td>
                      <td style={{ fontFamily: "'IBM Plex Mono',monospace" }}>
                        {parseFloat(c.quantity).toLocaleString("de-DE")} {c.unit}
                      </td>
                      <td style={{ fontSize: 12.5, color: "#374151" }}>{c.warehouseLocation || "-"}</td>
                      <td>
                        {c.co2PerTonne ? (
                          <div>
                            <span className="inv-co2-val">
                              {parseFloat(c.co2PerTonne).toLocaleString("de-DE", { maximumFractionDigits: 2 })}
                            </span>
                            <span style={{ fontSize: 10.5, color: "#6b7280" }}> kg/t</span>
                            {c.productionSiteId && (
                              <div style={{ fontSize: 10, color: "#9ca3af", fontFamily: "'IBM Plex Mono',monospace" }}>
                                {c.productionSiteId}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="inv-warn">⚠ Fehlt</span>
                        )}
                      </td>
                      <td style={{ fontSize: 12.5 }}>{c.countryOfOrigin || "-"}</td>
                      <td style={{ fontSize: 12, fontFamily: "'IBM Plex Mono',monospace" }}>{c.incoterms || "-"}</td>
                      <td>
                        <span className="inv-status eucx-badge" style={{ background: STATUS_COLOR[c.status] ?? "#6b7280" }}>
                          {STATUS_LABEL[c.status] ?? c.status}
                        </span>
                        {c.lot && (
                          <div style={{ fontSize: 10, color: "#9ca3af", marginTop: 3 }}>
                            {c.lot.commodity.slice(0, 20)}
                          </div>
                        )}
                      </td>
                      <td>
                        {c.certificate31 ? (
                          <button className="inv-action">3.1-Zeugnis</button>
                        ) : (
                          <button className="inv-action" style={{ color: "#9ca3af" }}>+ Hochladen</button>
                        )}
                        {c.status === "AVAILABLE" && (
                          <button className="inv-del" onClick={() => void deleteCharge(c.id)}>Löschen</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
