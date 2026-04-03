"use client";

/**
 * /dashboard/buyer — Käufer-Hub
 *
 * Ausschreibung erstellen, eigene Lots verwalten, Auktion starten.
 */

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { EucxHeader } from "@/components/layout/EucxHeader";
import { toast } from "sonner";

// ── Types ──────────────────────────────────────────────────────────────────────

type Phase = "COLLECTION" | "PROPOSAL" | "REDUCTION" | "CONCLUSION";

interface LotRow {
  id:          string;
  commodity:   string;
  quantity:    string;
  unit:        string;
  phase:       Phase;
  startPrice:  string | null;
  currentBest: string | null;
  auctionEnd:  string | null;
  createdAt:   string;
  winnerId:    string | null;
  _count:      { bids: number; registrations: number };
}

interface KycInfo {
  verificationStatus: "GUEST" | "PENDING_VERIFICATION" | "VERIFIED" | "REJECTED" | "SUSPENDED";
  role:               string;
  totpEnabled:        boolean;
  phoneVerified:      boolean;
}

const UNITS = ["TON", "KG", "CBM", "LITER", "PIECE", "SQM", "MWH"] as const;

const PHASE_LABEL: Record<Phase, string> = {
  COLLECTION: "Registrierung",
  PROPOSAL:   "Erstgebote",
  REDUCTION:  "Auktion läuft",
  CONCLUSION: "Abgeschlossen",
};

const PHASE_COLOR: Record<Phase, string> = {
  COLLECTION: "#6b7280",
  PROPOSAL:   "#2563eb",
  REDUCTION:  "#16a34a",
  CONCLUSION: "#9ca3af",
};

// ── Helpers ────────────────────────────────────────────────────────────────────

const fmtEur = (v: string | null) =>
  v == null ? "—"
  : new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR", minimumFractionDigits: 2 }).format(Number(v));

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleString("de-DE", { day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit" });

// ── Component ──────────────────────────────────────────────────────────────────

export function BuyerLotsClient() {
  const router = useRouter();
  const [token,        setToken]        = useState("");
  const [kyc,          setKyc]          = useState<KycInfo | null>(null);
  const [lots,         setLots]         = useState<LotRow[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [showForm,      setShowForm]      = useState(false);
  const [showPreflight, setShowPreflight] = useState(false);
  const [opening,       setOpening]       = useState<string | null>(null);
  const [submitting,    setSubmitting]    = useState(false);
  // Zeitwähler-State: welches Lot wird geöffnet + ausgewählter Endzeitpunkt
  const [openingLotId,  setOpeningLotId]  = useState<string | null>(null);
  const [pickedEnd,     setPickedEnd]     = useState("");

  // Form state
  const [commodity,   setCommodity]   = useState("");
  const [quantity,    setQuantity]    = useState("");
  const [unit,        setUnit]        = useState<typeof UNITS[number]>("TON");
  const [startPrice,  setStartPrice]  = useState("");
  const [description, setDescription] = useState("");
  const [formError,   setFormError]   = useState<string | null>(null);

  // ── Token + Auth-Redirect ──────────────────────────────────────────
  useEffect(() => {
    const tkn = localStorage.getItem("accessToken") ?? "";
    setToken(tkn);
    if (!tkn) router.replace("/login");
  }, [router]);

  // ── KYC ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!token) return;
    fetch("/api/auth/me", { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.ok ? r.json() : null)
      .then((d) => { if (d) setKyc({ verificationStatus: d.verificationStatus ?? "GUEST", role: d.role ?? "", totpEnabled: d.totpEnabled ?? false, phoneVerified: d.phoneVerified ?? false }); })
      .catch(() => {});
  }, [token]);

  // ── Lots laden ────────────────────────────────────────────────────
  const loadLots = useCallback(async () => {
    if (!token) { setLoading(false); return; }
    setLoading(true);
    try {
      const r = await fetch("/api/auction/lots?mine=true", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!r.ok) return;
      const d = await r.json();
      setLots(d.lots ?? []);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, [token]);

  useEffect(() => { loadLots(); }, [loadLots]);

  // ── Ausschreibung erstellen ───────────────────────────────────────
  async function createLot(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    if (!commodity.trim()) { setFormError("Ware ist erforderlich."); return; }
    const qty = parseFloat(quantity);
    if (!qty || qty <= 0)  { setFormError("Menge muss größer als 0 sein."); return; }

    setSubmitting(true);
    try {
      const body: Record<string, unknown> = { commodity: commodity.trim(), quantity: qty, unit };
      if (startPrice) body.startPrice = parseFloat(startPrice);
      if (description.trim()) body.description = description.trim();

      const r = await fetch("/api/auction/lots", {
        method:  "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body:    JSON.stringify(body),
      });
      const d = await r.json();
      if (!r.ok) {
        setFormError(d.error ?? "Fehler beim Erstellen.");
      } else {
        toast.success("Ausschreibung erstellt", {
          description: "Jetzt Verkäufer einladen und Auktion starten.",
          style: { background: "#f0fdf4", border: "1px solid #16a34a", color: "#14532d" },
        });
        setCommodity(""); setQuantity(""); setUnit("TON"); setStartPrice(""); setDescription("");
        setShowForm(false);
        await loadLots();
      }
    } catch {
      setFormError("Netzwerkfehler.");
    } finally {
      setSubmitting(false);
    }
  }

  // ── Auktion starten (COLLECTION → PROPOSAL) ───────────────────────
  // Schritt 1: Zeitwähler anzeigen
  function requestOpenLot(lotId: string) {
    // Default: heute um 15:00 (oder in 2h, je nachdem was später ist)
    const now    = new Date();
    const at15   = new Date(now);
    at15.setHours(15, 0, 0, 0);
    const at2h   = new Date(now.getTime() + 2 * 60 * 60 * 1000);
    const def    = at15 > now ? at15 : at2h;
    // Format für datetime-local input: "YYYY-MM-DDTHH:MM"
    const pad    = (n: number) => String(n).padStart(2, "0");
    const local  = `${def.getFullYear()}-${pad(def.getMonth()+1)}-${pad(def.getDate())}T${pad(def.getHours())}:${pad(def.getMinutes())}`;
    setPickedEnd(local);
    setOpeningLotId(lotId);
  }

  // Schritt 2: Bestätigung → API-Call
  async function confirmOpenLot() {
    if (!token || !openingLotId || opening) return;
    setOpening(openingLotId);
    try {
      const body: Record<string, string> = {};
      if (pickedEnd) body.auctionEnd = new Date(pickedEnd).toISOString();

      const r = await fetch(`/api/auction/lots/${openingLotId}/open`, {
        method:  "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body:    JSON.stringify(body),
      });
      const d = await r.json();
      if (r.ok) {
        toast.success("Auktion gestartet", {
          description: `Angebotsphase läuft bis ${fmtDate(d.auctionEnd)}.`,
          style: { background: "#f0fdf4", border: "1px solid #16a34a", color: "#14532d" },
        });
        setOpeningLotId(null);
        await loadLots();
      } else {
        toast.error(d.error ?? "Fehler beim Starten", {
          style: { background: "#fef2f2", border: "1px solid #fecaca", color: "#991b1b" },
        });
      }
    } catch {
      toast.error("Netzwerkfehler");
    } finally {
      setOpening(null);
    }
  }

  const isVerified    = kyc?.verificationStatus === "VERIFIED";
  const isTotpEnabled = kyc?.totpEnabled  ?? false;
  const isPhoneVerif  = kyc?.phoneVerified ?? false;
  const preflightOk   = isVerified && isTotpEnabled && isPhoneVerif;

  // Lot-Statistiken
  const stats = {
    total:      lots.length,
    active:     lots.filter((l) => l.phase === "PROPOSAL" || l.phase === "REDUCTION").length,
    collection: lots.filter((l) => l.phase === "COLLECTION").length,
    concluded:  lots.filter((l) => l.phase === "CONCLUSION").length,
  };

  return (
    <>
      <style>{`
        .bl-root { font-family:"IBM Plex Sans",Helvetica Neue,Arial,sans-serif; min-height:100vh; background:#f9fafb; color:#1a1a1a; }

        /* Header */
        .bl-hdr { display:none; }
        .bl-logo { font-size:15px; font-weight:700; color:#fff; letter-spacing:.06em; }
        .bl-logo-sub { font-size:11px; font-weight:300; color:rgba(255,255,255,.6); margin-left:8px; }
        .bl-hdr-right { display:flex; align-items:center; gap:10px; }
        .bl-hdr-link { font-size:12px; color:rgba(255,255,255,.8); text-decoration:none; padding:5px 10px; border:1px solid rgba(255,255,255,.3); transition:background .15s; }
        .bl-hdr-link:hover { background:rgba(255,255,255,.15); }

        /* Page */
        .bl-page { max-width:1100px; margin:0 auto; padding:32px 24px 80px; }

        /* KYC Banner */
        .bl-kyc-warn { background:#fffbeb; border:1px solid #fcd34d; padding:14px 20px; margin-bottom:24px; display:flex; align-items:center; gap:16px; flex-wrap:wrap; }
        .bl-kyc-warn-text { font-size:13px; color:#92400e; flex:1; }
        .bl-kyc-link { padding:8px 16px; background:#154194; color:#fff; font-size:12px; font-weight:700; text-decoration:none; white-space:nowrap; }
        .bl-kyc-link:hover { background:#1a52c2; }

        /* Stats row */
        .bl-stats { display:grid; grid-template-columns:repeat(4,1fr); gap:12px; margin-bottom:28px; }
        @media (max-width:640px) { .bl-stats { grid-template-columns:repeat(2,1fr); } }
        .bl-stat { background:#fff; border:1px solid #e5e7eb; padding:16px 18px; }
        .bl-stat-num { font-family:"IBM Plex Mono",monospace; font-size:28px; font-weight:600; line-height:1; }
        .bl-stat-label { font-size:11px; font-weight:700; letter-spacing:.06em; color:#9ca3af; text-transform:uppercase; margin-top:5px; }

        /* Heading row */
        .bl-heading-row { display:flex; align-items:center; justify-content:space-between; gap:12px; margin-bottom:20px; flex-wrap:wrap; }
        .bl-heading { font-size:20px; font-weight:700; color:#111827; }
        .bl-btn-new { padding:10px 20px; background:#154194; color:#fff; font-size:13px; font-weight:700; border:none; cursor:pointer; transition:background .15s; white-space:nowrap; }
        .bl-btn-new:hover { background:#1a52c2; }
        .bl-btn-new:disabled { opacity:.5; cursor:not-allowed; }

        /* Create form */
        .bl-form-wrap { background:#fff; border:1px solid #e5e7eb; border-top:3px solid #154194; padding:28px; margin-bottom:24px; }
        .bl-form-title { font-size:15px; font-weight:700; margin-bottom:20px; color:#111827; }
        .bl-form-grid { display:grid; grid-template-columns:1fr 1fr; gap:16px; }
        @media (max-width:640px) { .bl-form-grid { grid-template-columns:1fr; } }
        .bl-form-group { display:flex; flex-direction:column; gap:6px; }
        .bl-form-group.full { grid-column:1/-1; }
        .bl-label { font-size:12.5px; font-weight:600; color:#374151; }
        .bl-label span { color:#9ca3af; font-weight:400; margin-left:4px; }
        .bl-input { height:40px; border:1px solid #d1d5db; padding:0 12px; font-size:14px; outline:none; font-family:inherit; transition:border-color .15s; }
        .bl-input:focus { border-color:#154194; }
        .bl-select { height:40px; border:1px solid #d1d5db; padding:0 12px; font-size:14px; outline:none; font-family:inherit; background:#fff; appearance:none; cursor:pointer; }
        .bl-select:focus { border-color:#154194; }
        .bl-textarea { border:1px solid #d1d5db; padding:10px 12px; font-size:13px; outline:none; font-family:inherit; resize:vertical; min-height:72px; transition:border-color .15s; }
        .bl-textarea:focus { border-color:#154194; }
        .bl-form-error { font-size:12.5px; color:#dc2626; padding:10px 14px; background:#fef2f2; border:1px solid #fecaca; }
        .bl-form-actions { display:flex; gap:10px; margin-top:20px; }
        .bl-btn-submit { padding:10px 24px; background:#154194; color:#fff; font-size:13px; font-weight:700; border:none; cursor:pointer; transition:background .15s; }
        .bl-btn-submit:hover:not(:disabled) { background:#1a52c2; }
        .bl-btn-submit:disabled { opacity:.5; cursor:not-allowed; }
        .bl-btn-cancel { padding:10px 20px; background:#fff; color:#374151; font-size:13px; font-weight:600; border:1px solid #d1d5db; cursor:pointer; transition:background .15s; }
        .bl-btn-cancel:hover { background:#f9fafb; }

        /* Table */
        .bl-table-wrap { overflow-x:auto; }
        .bl-table { width:100%; border-collapse:collapse; background:#fff; border:1px solid #e5e7eb; font-size:13px; }
        .bl-table th { padding:10px 14px; text-align:left; font-size:11px; font-weight:700; letter-spacing:.06em; text-transform:uppercase; color:#9ca3af; border-bottom:2px solid #154194; background:#fff; white-space:nowrap; }
        .bl-table td { padding:14px; border-bottom:1px solid #f3f4f6; vertical-align:middle; }
        .bl-table tr:last-child td { border-bottom:none; }
        .bl-table tr:hover td { background:#fafafa; }

        /* Phase badge */
        .bl-phase { display:inline-block; padding:3px 9px; font-size:10.5px; font-weight:700; letter-spacing:.05em; text-transform:uppercase; color:#fff; }

        /* Action buttons */
        .bl-btn-open { padding:7px 14px; background:#154194; color:#fff; font-size:12px; font-weight:700; border:none; cursor:pointer; transition:background .15s; white-space:nowrap; }
        .bl-btn-open:hover:not(:disabled) { background:#1a52c2; }
        .bl-btn-open:disabled { opacity:.4; cursor:not-allowed; }

        /* Zeitwähler-Popover */
        .bl-timepick { background:#fff; border:1px solid #e5e7eb; border-top:3px solid #154194; padding:14px 16px; margin-top:8px; min-width:260px; box-shadow:0 4px 16px rgba(0,0,0,.1); }
        .bl-timepick-label { font-size:11.5px; font-weight:700; color:#374151; margin-bottom:8px; }
        .bl-timepick-hint { font-size:11px; color:#9ca3af; margin-bottom:10px; line-height:1.5; }
        .bl-timepick-input { width:100%; height:36px; border:1px solid #d1d5db; padding:0 10px; font-size:13px; font-family:inherit; outline:none; }
        .bl-timepick-input:focus { border-color:#154194; }
        .bl-timepick-actions { display:flex; gap:8px; margin-top:10px; }
        .bl-timepick-confirm { flex:1; height:34px; background:#154194; color:#fff; font-size:12px; font-weight:700; border:none; cursor:pointer; transition:background .15s; }
        .bl-timepick-confirm:hover:not(:disabled) { background:#1a52c2; }
        .bl-timepick-confirm:disabled { opacity:.4; cursor:not-allowed; }
        .bl-timepick-cancel { height:34px; padding:0 12px; background:#fff; color:#6b7280; font-size:12px; font-weight:600; border:1px solid #d1d5db; cursor:pointer; }
        .bl-timepick-cancel:hover { background:#f9fafb; }
        .bl-btn-watch { padding:7px 14px; background:#fff; color:#154194; font-size:12px; font-weight:700; border:1.5px solid #154194; text-decoration:none; display:inline-block; transition:all .15s; white-space:nowrap; }
        .bl-btn-watch:hover { background:#154194; color:#fff; }
        .bl-btn-contract { padding:7px 14px; background:#fff; color:#6b7280; font-size:12px; font-weight:700; border:1.5px solid #d1d5db; text-decoration:none; display:inline-block; transition:all .15s; white-space:nowrap; }
        .bl-btn-contract:hover { background:#f9fafb; }

        /* Empty */
        .bl-empty { padding:60px 24px; text-align:center; color:#9ca3af; font-size:13px; background:#fff; border:1px solid #e5e7eb; }
        .bl-empty-hint { margin-top:12px; font-size:12px; color:#d1d5db; }

        /* Pre-Flight-Check */
        .bl-pf { background:#fff; border:1px solid #e5e7eb; border-top:3px solid #154194; padding:24px 28px; margin-bottom:24px; }
        .bl-pf-title { font-size:14px; font-weight:700; color:#111827; margin-bottom:4px; }
        .bl-pf-sub { font-size:12px; color:#6b7280; margin-bottom:20px; }
        .bl-pf-checks { display:flex; flex-direction:column; gap:12px; margin-bottom:24px; }
        .bl-pf-row { display:flex; align-items:center; gap:14px; padding:12px 16px; border:1px solid #e5e7eb; }
        .bl-pf-row.ok  { border-color:#bbf7d0; background:#f0fdf4; }
        .bl-pf-row.nok { border-color:#fecaca; background:#fef2f2; }
        .bl-pf-icon { width:28px; height:28px; border-radius:50%; display:flex; align-items:center; justify-content:center; flex-shrink:0; font-size:13px; }
        .bl-pf-icon.ok  { background:#16a34a; color:#fff; }
        .bl-pf-icon.nok { background:#dc2626; color:#fff; }
        .bl-pf-label { font-size:13px; font-weight:600; color:#111827; }
        .bl-pf-desc  { font-size:11.5px; color:#6b7280; margin-top:1px; }
        .bl-pf-link  { margin-left:auto; font-size:11.5px; font-weight:700; color:#154194; text-decoration:none; white-space:nowrap; padding:5px 10px; border:1px solid #154194; }
        .bl-pf-link:hover { background:#154194; color:#fff; }
        .bl-pf-actions { display:flex; gap:10px; }
        .bl-btn-publish { padding:11px 24px; background:#154194; color:#fff; font-size:13px; font-weight:700; border:none; cursor:pointer; transition:background .15s; }
        .bl-btn-publish:hover:not(:disabled) { background:#0f3070; }
        .bl-btn-publish:disabled { background:#93a3be; cursor:not-allowed; }

        /* Loading */
        .bl-loading { color:#9ca3af; font-size:13px; padding:40px 24px; text-align:center; }
      `}</style>

      <div className="bl-root">
        <EucxHeader />
        {/* ── Seiteninhalt ── */}

        <div className="bl-page">

          {/* KYC-Warnung */}
          {kyc && !isVerified && (
            <div className="bl-kyc-warn">
              <div className="bl-kyc-warn-text">
                {kyc.verificationStatus === "GUEST"                && "Identitätsprüfung nicht abgeschlossen — Ausschreibungen sind erst nach KYC-Verifizierung möglich."}
                {kyc.verificationStatus === "PENDING_VERIFICATION" && "KYC-Dokumente eingereicht — Prüfung läuft (in der Regel unter 24h)."}
                {kyc.verificationStatus === "REJECTED"             && "KYC abgelehnt — bitte neue Dokumente einreichen oder Support kontaktieren."}
                {kyc.verificationStatus === "SUSPENDED"            && "Konto gesperrt — bitte Support kontaktieren."}
              </div>
              {(kyc.verificationStatus === "GUEST" || kyc.verificationStatus === "REJECTED") && (
                <a href="/dashboard/settings/verification" className="bl-kyc-link">Jetzt verifizieren →</a>
              )}
            </div>
          )}

          {/* Stats */}
          <div className="bl-stats">
            {[
              { num: stats.total,      label: "Ausschreibungen gesamt", color: "#0d1b2a" },
              { num: stats.collection, label: "In Vorbereitung",        color: "#6b7280" },
              { num: stats.active,     label: "Auktionen aktiv",        color: "#16a34a" },
              { num: stats.concluded,  label: "Abgeschlossen",          color: "#154194" },
            ].map((s) => (
              <div className="bl-stat" key={s.label}>
                <div className="bl-stat-num" style={{ color: s.color }}>{s.num}</div>
                <div className="bl-stat-label">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Heading + New Button */}
          <div className="bl-heading-row">
            <span className="bl-heading">Meine Ausschreibungen</span>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                className="bl-btn-new"
                onClick={loadLots}
                style={{ background: "#fff", color: "#154194", border: "1.5px solid #154194" }}
              >
                ↻ Aktualisieren
              </button>
              <button
                className="bl-btn-new"
                onClick={() => {
                  if (showForm) { setShowForm(false); setShowPreflight(false); }
                  else setShowPreflight((v) => !v);
                }}
              >
                {(showForm || showPreflight) ? "✕ Abbrechen" : "+ Neue Ausschreibung"}
              </button>
            </div>
          </div>

          {/* Pre-Flight-Check */}
          {showPreflight && !showForm && (
            <div className="bl-pf">
              <div className="bl-pf-title">Vor der Ausschreibung — Pflichtprüfung</div>
              <div className="bl-pf-sub">Alle drei Punkte müssen erfüllt sein, bevor Sie eine Ausschreibung veröffentlichen können.</div>
              <div className="bl-pf-checks">
                {/* KYC */}
                <div className={`bl-pf-row ${isVerified ? "ok" : "nok"}`}>
                  <div className={`bl-pf-icon ${isVerified ? "ok" : "nok"}`}>
                    {isVerified ? "✓" : "✕"}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div className="bl-pf-label">Identitätsprüfung (KYC)</div>
                    <div className="bl-pf-desc">
                      {isVerified ? "Identität bestätigt — vollständig handelsberechtigt." : "KYC noch nicht abgeschlossen. Unterlagen einreichen."}
                    </div>
                  </div>
                  {!isVerified && (
                    <a href="/dashboard/settings/verification" className="bl-pf-link">Jetzt prüfen →</a>
                  )}
                </div>
                {/* 2FA */}
                <div className={`bl-pf-row ${isTotpEnabled ? "ok" : "nok"}`}>
                  <div className={`bl-pf-icon ${isTotpEnabled ? "ok" : "nok"}`}>
                    {isTotpEnabled ? "✓" : "✕"}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div className="bl-pf-label">Zwei-Faktor-Authentifizierung</div>
                    <div className="bl-pf-desc">
                      {isTotpEnabled ? "2FA aktiv — Konto zusätzlich gesichert." : "2FA noch nicht eingerichtet. In den Sicherheitseinstellungen aktivieren."}
                    </div>
                  </div>
                  {!isTotpEnabled && (
                    <a href="/dashboard/settings/security" className="bl-pf-link">Einrichten →</a>
                  )}
                </div>
                {/* Telefon */}
                <div className={`bl-pf-row ${isPhoneVerif ? "ok" : "nok"}`}>
                  <div className={`bl-pf-icon ${isPhoneVerif ? "ok" : "nok"}`}>
                    {isPhoneVerif ? "✓" : "✕"}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div className="bl-pf-label">Firmen-Telefonnummer</div>
                    <div className="bl-pf-desc">
                      {isPhoneVerif ? "Telefonnummer verifiziert." : "Telefonnummer noch nicht bestätigt. Im Profil verifizieren."}
                    </div>
                  </div>
                  {!isPhoneVerif && (
                    <a href="/dashboard/settings/profile" className="bl-pf-link">Verifizieren →</a>
                  )}
                </div>
              </div>
              <div className="bl-pf-actions">
                <button
                  className="bl-btn-publish"
                  disabled={!preflightOk}
                  onClick={() => { setShowPreflight(false); setShowForm(true); }}
                  title={!preflightOk ? "Alle drei Punkte müssen grün sein" : undefined}
                >
                  {preflightOk ? "Weiter zur Ausschreibung →" : "Punkte ausstehend"}
                </button>
                <button
                  className="bl-btn-cancel"
                  onClick={() => setShowPreflight(false)}
                >
                  Abbrechen
                </button>
              </div>
            </div>
          )}

          {/* Create Form */}
          {showForm && (
            <div className="bl-form-wrap">
              <div className="bl-form-title">Neue Ausschreibung erstellen</div>
              <form onSubmit={(e) => { void createLot(e); }}>
                <div className="bl-form-grid">
                  <div className="bl-form-group">
                    <label className="bl-label">Ware / Commodity *</label>
                    <input
                      className="bl-input"
                      type="text"
                      placeholder="z.B. Stahl-Rebar BST 500, 16mm"
                      value={commodity}
                      onChange={(e) => setCommodity(e.target.value)}
                      required
                    />
                  </div>

                  <div className="bl-form-group">
                    <label className="bl-label">Menge *</label>
                    <input
                      className="bl-input"
                      type="number"
                      step="0.01"
                      min="0.01"
                      placeholder="500"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      required
                    />
                  </div>

                  <div className="bl-form-group">
                    <label className="bl-label">Einheit *</label>
                    <select className="bl-select" value={unit} onChange={(e) => setUnit(e.target.value as typeof UNITS[number])}>
                      {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
                    </select>
                  </div>

                  <div className="bl-form-group">
                    <label className="bl-label">Maximaler Preis <span>(optional, €/Einheit)</span></label>
                    <input
                      className="bl-input"
                      type="number"
                      step="0.01"
                      min="0.01"
                      placeholder="850.00"
                      value={startPrice}
                      onChange={(e) => setStartPrice(e.target.value)}
                    />
                  </div>

                  <div className="bl-form-group full">
                    <label className="bl-label">Beschreibung <span>(optional)</span></label>
                    <textarea
                      className="bl-textarea"
                      placeholder="Technische Spezifikationen, Lieferbedingungen, Normen…"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      maxLength={2000}
                    />
                  </div>
                </div>

                {formError && <div className="bl-form-error" style={{ marginTop: 16 }}>{formError}</div>}

                <div className="bl-form-actions">
                  <button className="bl-btn-submit" type="submit" disabled={submitting}>
                    {submitting ? "Wird erstellt…" : "Ausschreibung erstellen"}
                  </button>
                  <button
                    className="bl-btn-cancel"
                    type="button"
                    onClick={() => { setShowForm(false); setFormError(null); }}
                  >
                    Abbrechen
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Lots Table */}
          {loading ? (
            <div className="bl-loading">Wird geladen…</div>
          ) : lots.length === 0 ? (
            <div className="bl-empty">
              Noch keine Ausschreibungen.
              <div className="bl-empty-hint">Klicken Sie auf „+ Neue Ausschreibung" um Ihre erste Auktion zu starten.</div>
            </div>
          ) : (
            <div className="bl-table-wrap">
              <table className="bl-table">
                <thead>
                  <tr>
                    <th>Ware</th>
                    <th>Menge</th>
                    <th>Phase</th>
                    <th>Max-Preis</th>
                    <th>Bestes Gebot</th>
                    <th>Auktionsende</th>
                    <th>Bieter</th>
                    <th>Aktion</th>
                  </tr>
                </thead>
                <tbody>
                  {lots.map((lot) => {
                    const savings = lot.startPrice && lot.currentBest
                      ? Number(lot.startPrice) - Number(lot.currentBest)
                      : null;

                    return (
                      <tr key={lot.id}>
                        <td style={{ fontWeight: 600, color: "#111827", maxWidth: 220 }}>
                          <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {lot.commodity}
                          </div>
                        </td>
                        <td style={{ color: "#374151", whiteSpace: "nowrap" }}>
                          {Number(lot.quantity).toLocaleString("de-DE")} {lot.unit}
                        </td>
                        <td>
                          <span className="bl-phase" style={{ background: PHASE_COLOR[lot.phase] }}>
                            {PHASE_LABEL[lot.phase]}
                          </span>
                        </td>
                        <td style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12.5, color: "#6b7280" }}>
                          {fmtEur(lot.startPrice)}
                        </td>
                        <td style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12.5 }}>
                          {lot.currentBest ? (
                            <div>
                              <strong style={{ color: "#16a34a" }}>{fmtEur(lot.currentBest)}</strong>
                              {savings !== null && savings > 0 && (
                                <div style={{ fontSize: 11, color: "#16a34a" }}>
                                  −{fmtEur(String(savings))} Ersparnis
                                </div>
                              )}
                            </div>
                          ) : (
                            <span style={{ color: "#9ca3af" }}>—</span>
                          )}
                        </td>
                        <td style={{ fontSize: 12, color: "#6b7280", whiteSpace: "nowrap" }}>
                          {lot.auctionEnd ? fmtDate(lot.auctionEnd) : "—"}
                        </td>
                        <td style={{ fontSize: 12, textAlign: "center" }}>
                          <div>{lot._count.registrations} angemeldet</div>
                          <div style={{ color: "#9ca3af" }}>{lot._count.bids} Gebote</div>
                        </td>
                        <td style={{ whiteSpace: "nowrap" }}>
                          {lot.phase === "COLLECTION" && (
                            <div>
                              <button
                                className="bl-btn-open"
                                disabled={opening === lot.id || lot._count.registrations === 0}
                                onClick={() => openingLotId === lot.id ? setOpeningLotId(null) : requestOpenLot(lot.id)}
                                title={lot._count.registrations === 0 ? "Warten auf Verkäufer-Registrierungen" : "Auktionsende wählen"}
                              >
                                {opening === lot.id ? "…" : openingLotId === lot.id ? "Abbrechen" : "Auktion starten"}
                              </button>

                              {openingLotId === lot.id && (
                                <div className="bl-timepick">
                                  <div className="bl-timepick-label">Auktionsende festlegen</div>
                                  <div className="bl-timepick-hint">
                                    Gebote werden bis zu diesem Zeitpunkt angenommen.<br />
                                    Mindestens 15 Min. · Höchstens 14 Tage.
                                  </div>
                                  <input
                                    className="bl-timepick-input"
                                    type="datetime-local"
                                    value={pickedEnd}
                                    onChange={(e) => setPickedEnd(e.target.value)}
                                    min={(() => {
                                      const m = new Date(Date.now() + 15 * 60 * 1000);
                                      const p = (n: number) => String(n).padStart(2, "0");
                                      return `${m.getFullYear()}-${p(m.getMonth()+1)}-${p(m.getDate())}T${p(m.getHours())}:${p(m.getMinutes())}`;
                                    })()}
                                  />
                                  <div className="bl-timepick-actions">
                                    <button
                                      className="bl-timepick-confirm"
                                      disabled={!pickedEnd || opening === lot.id}
                                      onClick={() => { void confirmOpenLot(); }}
                                    >
                                      Jetzt starten →
                                    </button>
                                    <button className="bl-timepick-cancel" onClick={() => setOpeningLotId(null)}>
                                      ✕
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                          {(lot.phase === "PROPOSAL" || lot.phase === "REDUCTION") && (
                            <a href={`/dashboard/buyer/auction/${lot.id}`} className="bl-btn-watch">
                              Live beobachten →
                            </a>
                          )}
                          {lot.phase === "CONCLUSION" && (
                            <a href="/dashboard/contracts" className="bl-btn-contract">
                              Vertrag →
                            </a>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
