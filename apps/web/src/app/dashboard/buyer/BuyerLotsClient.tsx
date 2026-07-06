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
  id:               string;
  commodity:        string;
  quantity:         string;
  unit:             string;
  phase:            Phase;
  startPrice:       string | null;
  currentBest:      string | null;
  auctionEnd:       string | null;
  createdAt:        string;
  winnerId:         string | null;
  _count:           { bids: number; registrations: number };
  co2PerTonne?:     string | null;
  countryOfOrigin?: string | null;
  incoterms?:       string | null;
  hsCode?:          string | null;
  qualityGrade?:    string | null;
  deliveryPeriod?:  string | null;
  paymentTerms?:    string | null;
  vatTreatment?:    string | null;
}

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

const INCOTERMS_LIST = ["EXW", "FCA", "FAS", "FOB", "CFR", "CIF", "CPT", "CIP", "DAP", "DPU", "DDP"] as const;

// ── Warenkatalog — EUCX-Produktpalette ────────────────────────────────────────
// Jede Vorlage befüllt Pflichtfelder vor; Käufer passt Menge, Preis, Lieferzeitraum an.
const COMMODITY_CATALOG = [
  // Stahl — Langprodukte
  { id: "rebar-bst500",   cat: "Stahl — Langprodukte",     name: "Betonstahl BST 500 (Rebar)",                hsCode: "7214 20 00", qualityGrade: "B500B · EN 10080",             co2: "1850.0000", inco: "DAP", vat: "Steuerschuldumkehr §13b UStG (Reverse Charge)",    desc: "Gerippter Betonstahl BST 500, Ø 8–40 mm. Normen: EN 10080, DIN 488. Lieferung in Stäben 6 m / 12 m oder Ring. 3.1-Werkzeugnis nach EN 10204 beizufügen. Anwendung: Stahlbetonkonstruktionen." },
  { id: "rebar-bst500s",  cat: "Stahl — Langprodukte",     name: "Betonstahl BST 500S (seismisch)",            hsCode: "7214 20 00", qualityGrade: "B500S · EN 10080",             co2: "1890.0000", inco: "DAP", vat: "Steuerschuldumkehr §13b UStG (Reverse Charge)",    desc: "Gerippter Betonstahl BST 500S, erhöhte Duktilität Klasse S für Erdbebengebiete. Ø 8–32 mm. Normen: EN 10080, DIN 488-2, EC 8. 3.1-Werkzeugnis nach EN 10204 erforderlich." },
  { id: "wire-rod",       cat: "Stahl — Langprodukte",     name: "Walzdraht (Wire Rod) SAE 1008",              hsCode: "7213 91 10", qualityGrade: "SAE 1008 · EN 10016-2",        co2: "1650.0000", inco: "EXW", vat: "Steuerschuldumkehr §13b UStG (Reverse Charge)",    desc: "Walzdraht unlegiert, niedriggekohlter Stahl SAE 1008 / DD11. Coil, Ø 5,5–16 mm. Normen: EN 10016-2. Schmelznachweis 3.1 nach EN 10204 erforderlich. Anwendung: Zieherei, Betonstahlproduktion." },
  // Stahl — Flachprodukte
  { id: "flat-s235",      cat: "Stahl — Flachprodukte",    name: "Warmgewalzter Stahl S235JR (Blech / Coil)", hsCode: "7208 51 20", qualityGrade: "S235JR · EN 10025-2",          co2: "1780.0000", inco: "DAP", vat: "Steuerschuldumkehr §13b UStG (Reverse Charge)",    desc: "Warmgewalzte Bleche / Coils, S235JR. Breite 600–2000 mm, Dicke 2–25 mm. Normen: EN 10025-2, EN 10051. Anwendung: Konstruktionsstahl, Maschinenbau. 3.1-Zeugnis nach EN 10204 beizufügen." },
  { id: "flat-s355",      cat: "Stahl — Flachprodukte",    name: "Feinkornbaustahl S355JR (Blech)",            hsCode: "7208 51 91", qualityGrade: "S355JR · EN 10025-2",          co2: "1820.0000", inco: "DAP", vat: "Steuerschuldumkehr §13b UStG (Reverse Charge)",    desc: "Warmgewalzte Feinkornbaustahl-Bleche S355JR. Dicke 3–80 mm, Breite bis 3000 mm. Normen: EN 10025-2. Anwendung: Brückenbau, Schweißkonstruktionen. 3.1-Werkzeugnis nach EN 10204." },
  // Stahl — Träger / Profile
  { id: "beams-hea-heb",  cat: "Stahl — Träger / Profile", name: "HEA / HEB Stahlträger S235 / S355",         hsCode: "7216 33 10", qualityGrade: "S235JR / S355JR · EN 10025-2", co2: "1950.0000", inco: "DAP", vat: "Steuerschuldumkehr §13b UStG (Reverse Charge)",    desc: "Breitflanschträger HEA/HEB nach EN 10365, S235JR oder S355JR. Größen HEA 100–900, HEB 100–1000. Anwendung: Stahlbau, Hallenkonstruktionen. 3.1-Werkzeugnis nach EN 10204." },
  // Stahl — Rohre
  { id: "pipes-welded",   cat: "Stahl — Rohre",            name: "Nahtgeschweißte Hohlprofile S235JRH",       hsCode: "7306 30 51", qualityGrade: "S235JRH · EN 10210-1",         co2: "2050.0000", inco: "EXW", vat: "Steuerschuldumkehr §13b UStG (Reverse Charge)",    desc: "Nahtgeschweißte Hohlprofile (quadratisch, rechteckig, rund), S235JRH. Wandstärke 2–16 mm. Normen: EN 10210-1, EN 10219. Anwendung: Stahlbau, Konstruktionsprofile. 3.1-Zeugnis EN 10204." },
  // NE-Metalle
  { id: "copper-cathodes", cat: "NE-Metalle",              name: "Kupferkathoden Grade A",                    hsCode: "7403 11 00", qualityGrade: "Cu-CATH-1 · EN 1978 Grade A",  co2: "2800.0000", inco: "CIF", vat: "Umsatzsteuer 19 % (Regelbesteuerung)",             desc: "Elektrolyt-Kupferkathoden EN 1978 Grade A, Reinheit min. 99,99 % Cu. Standardkathode ca. 110–130 kg/Stück. LME-konforme Qualität, palettiert. Analysezertifikat erforderlich." },
  { id: "aluminium-1050",  cat: "NE-Metalle",              name: "Aluminiumbarren (Primär) EN AW-1050A",      hsCode: "7601 10 00", qualityGrade: "EN AW-1050A · EN 573-3",       co2: "6700.0000", inco: "CIF", vat: "Umsatzsteuer 19 % (Regelbesteuerung)",             desc: "Primär-Aluminiumbarren EN AW-1050A (Al 99,5 %), T-Barren oder Masseln. LME-Spezifikation P1020. Analysezertifikat und Ursprungsnachweis erforderlich. CBAM-pflichtig ab 2026." },
  // Schrott
  { id: "scrap-hms",       cat: "Stahl — Schrott",         name: "Stahlschrott HMS 1/2 (Heavy Melting Scrap)", hsCode: "7204 10 00", qualityGrade: "HMS 1/2 · ISRI 200–212",      co2: "",          inco: "FOB", vat: "Steuerschuldumkehr §13b UStG (Reverse Charge)",    desc: "Schwerer Stahlschrott HMS 1/2, ISRI-Spezifikation 200 (HMS1) / 210 (HMS2). Feuchtigkeitsgehalt max. 1 %. Analyse: C ≤ 0,4 %, S ≤ 0,05 %. Sichtkontrolle bei Übernahme." },
] as const;

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
  const [openingLotId,  setOpeningLotId]  = useState<string | null>(null);
  const [activeTab,     setActiveTab]     = useState<"all" | "collection" | "active" | "conclusion">("all");

  // Form state
  const [commodity,        setCommodity]        = useState("");
  const [quantity,         setQuantity]         = useState("");
  const [unit,             setUnit]             = useState<typeof UNITS[number]>("TON");
  const [startPrice,       setStartPrice]       = useState("");
  const [description,      setDescription]      = useState("");
  const [formError,        setFormError]        = useState<string | null>(null);
  // CBAM form state
  const [co2PerTonne,      setCo2PerTonne]      = useState("");
  const [countryOfOrigin,  setCountryOfOrigin]  = useState("");
  const [productionSiteId, setProductionSiteId] = useState("");
  const [incoterms,        setIncoterms]        = useState("DAP");
  // Handels- und Vertragsangaben
  const [hsCode,           setHsCode]           = useState("");
  const [qualityGrade,     setQualityGrade]     = useState("");
  const [deliveryPeriod,   setDeliveryPeriod]   = useState("");
  const [paymentTerms,     setPaymentTerms]     = useState("");
  const [vatTreatment,     setVatTreatment]     = useState("");
  const [selectedPreset,   setSelectedPreset]   = useState("");

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

  // ── Warenvorlage anwenden ──────────────────────────────────────────
  function applyPreset(presetId: string) {
    const p = COMMODITY_CATALOG.find((c) => c.id === presetId);
    if (!p) return;
    setCommodity(p.name);
    setHsCode(p.hsCode);
    setQualityGrade(p.qualityGrade);
    setDescription(p.desc);
    if (p.co2) setCo2PerTonne(p.co2);
    setIncoterms(p.inco);
    setVatTreatment(p.vat);
  }

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
      // CBAM-Felder (optional)
      if (co2PerTonne)      body.co2PerTonne      = parseFloat(co2PerTonne);
      if (countryOfOrigin)  body.countryOfOrigin  = countryOfOrigin;
      if (productionSiteId) body.productionSiteId = productionSiteId.trim();
      if (incoterms)        body.incoterms        = incoterms;
      // Pflichtfelder — vertragswesentlich
      if (!hsCode.trim())         { setFormError("Zolltarifnummer (HS-Code) ist erforderlich.");     setSubmitting(false); return; }
      if (!qualityGrade.trim())   { setFormError("Güte / Qualitätsnorm ist erforderlich.");          setSubmitting(false); return; }
      if (!deliveryPeriod.trim()) { setFormError("Lieferzeitraum ist erforderlich.");                setSubmitting(false); return; }
      if (!paymentTerms.trim())   { setFormError("Zahlungsbedingungen sind erforderlich.");          setSubmitting(false); return; }
      if (!vatTreatment)          { setFormError("USt.-Behandlung muss ausgewählt werden.");         setSubmitting(false); return; }
      body.hsCode         = hsCode.trim();
      body.qualityGrade   = qualityGrade.trim();
      body.deliveryPeriod = deliveryPeriod.trim();
      body.paymentTerms   = paymentTerms.trim();
      body.vatTreatment   = vatTreatment;

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
        setCo2PerTonne(""); setCountryOfOrigin(""); setProductionSiteId(""); setIncoterms("DAP");
        setHsCode(""); setQualityGrade(""); setDeliveryPeriod(""); setPaymentTerms(""); setVatTreatment("");
        setSelectedPreset("");
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
  // Schritt 1: Bestätigungs-Modal zeigen
  function requestOpenLot(lotId: string) {
    setOpeningLotId(lotId);
  }

  // Schritt 2: API-Call — Server berechnet Slot-Ende
  async function confirmOpenLot() {
    if (!token || !openingLotId || opening) return;
    setOpening(openingLotId);
    try {
      const r = await fetch(`/api/auction/lots/${openingLotId}/open`, {
        method:  "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body:    "{}",
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

  /** Nächste Handelssitzung als lesbarer String */
  function nextSlotLabel(): string {
    const now = new Date();
    const fmt = (d: Date) => d.toLocaleDateString("de-DE", {
      weekday: "short", day: "2-digit", month: "2-digit",
      timeZone: "Europe/Berlin",
    });
    const berlinHour = parseInt(new Intl.DateTimeFormat("de-DE", {
      timeZone: "Europe/Berlin", hour: "2-digit", hour12: false,
    }).format(now), 10);
    const day = now.getDay();
    const isWeekday = day >= 1 && day <= 5;
    // [TESTMODE-03] Slot 19:00–22:00 Berlin
    const inSlot = isWeekday && berlinHour >= 19 && berlinHour < 22;
    if (inSlot) return `heute bis 22:00 MEZ`;
    for (let i = 1; i <= 7; i++) {
      const d = new Date(now.getTime() + i * 24 * 60 * 60 * 1000);
      const wd = d.getDay();
      if (wd >= 1 && wd <= 5) return `${fmt(d)} · 19:00–22:00 MEZ`;
    }
    return "nächste Handelssitzung";
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

  // CO₂-Fußabdruck aus abgeschlossenen Lots (nur wenn co2PerTonne vorhanden)
  const co2Lots = lots.filter((l) => l.co2PerTonne && l.phase === "CONCLUSION");
  const totalCo2Tonnes = co2Lots.reduce((sum, l) => {
    const qty  = parseFloat(l.quantity);
    const co2  = parseFloat(l.co2PerTonne!);
    // co2PerTonne ist kg/t → ×qty ergibt kg → /1000 ergibt Tonnen CO₂
    return sum + (qty * co2) / 1000;
  }, 0);
  const lotsWithCbam = lots.filter((l) => l.co2PerTonne).length;

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
        .bl-phase { display:inline-block; padding:3px 9px; font-size:10.5px; font-weight:700; letter-spacing:.05em; text-transform:uppercase; color:#fff; white-space:nowrap; }

        /* Action buttons */
        .bl-btn-open { padding:7px 14px; background:#154194; color:#fff; font-size:12px; font-weight:700; border:none; cursor:pointer; transition:background .15s; white-space:nowrap; }
        .bl-btn-open:hover:not(:disabled) { background:#1a52c2; }
        .bl-btn-open:disabled { opacity:.4; cursor:not-allowed; }

        /* Zeitwähler-Popover */
        .bl-timepick-overlay { position:fixed; inset:0; background:rgba(0,0,0,.45); z-index:300; display:flex; align-items:center; justify-content:center; }
        .bl-timepick { background:#fff; border-top:3px solid #154194; padding:28px 28px 24px; width:380px; box-shadow:0 12px 40px rgba(0,0,0,.18); }
        .bl-timepick-label { font-size:16px; font-weight:700; color:#0d1b2a; margin-bottom:6px; }
        .bl-timepick-hint { font-size:12px; color:#6b7280; margin-bottom:18px; line-height:1.6; }
        .bl-timepick-slot { background:#f0f4ff; border:1px solid #c7d7fc; padding:12px 16px; margin-bottom:18px; font-size:13px; font-weight:600; color:#1e3a8a; }
        .bl-timepick-slot span { display:block; font-size:11px; font-weight:400; color:#6b7280; margin-top:2px; }
        .bl-timepick-actions { display:flex; gap:10px; }
        .bl-timepick-confirm { flex:1; height:44px; background:#154194; color:#fff; font-size:13px; font-weight:700; border:none; cursor:pointer; letter-spacing:.04em; transition:background .15s; }
        .bl-timepick-confirm:hover:not(:disabled) { background:#1a52c2; }
        .bl-timepick-confirm:disabled { opacity:.4; cursor:not-allowed; }
        .bl-timepick-cancel { height:44px; padding:0 16px; background:#fff; color:#6b7280; font-size:13px; font-weight:600; border:1px solid #d1d5db; cursor:pointer; transition:background .15s; }
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

        /* CBAM section */
        .bl-cbam-header { display:flex; align-items:center; gap:10px; margin-top:24px; margin-bottom:12px; padding-bottom:8px; border-bottom:1px solid #e5e7eb; }
        .bl-cbam-title { font-size:12.5px; font-weight:700; color:#154194; letter-spacing:.04em; text-transform:uppercase; }
        .bl-cbam-badge { font-size:10px; font-weight:700; padding:2px 8px; background:#dbeafe; color:#1d4ed8; letter-spacing:.05em; }
        .bl-cbam-hint { font-size:11.5px; color:#6b7280; margin-bottom:16px; }

        /* CO₂-Widget */
        .bl-co2-widget { background:#fff; border:1px solid #e5e7eb; border-top:3px solid #16a34a; padding:16px 20px; margin-bottom:20px; display:flex; align-items:center; gap:20px; flex-wrap:wrap; }
        .bl-co2-main { flex:1; min-width:160px; }
        .bl-co2-num  { font-size:28px; font-weight:700; font-family:"IBM Plex Mono",monospace; color:#16a34a; line-height:1; }
        .bl-co2-unit { font-size:11px; color:#6b7280; font-weight:600; letter-spacing:.04em; margin-top:3px; }
        .bl-co2-label { font-size:11px; color:#9ca3af; font-weight:700; text-transform:uppercase; letter-spacing:.06em; }
        .bl-co2-breakdown { display:flex; gap:16px; flex-wrap:wrap; }
        .bl-co2-item { text-align:center; padding:8px 14px; border:1px solid #f3f4f6; }
        .bl-co2-item-num { font-size:15px; font-weight:700; font-family:"IBM Plex Mono",monospace; color:#374151; }
        .bl-co2-item-label { font-size:10px; color:#9ca3af; font-weight:600; text-transform:uppercase; margin-top:2px; }
        .bl-co2-export { padding:8px 16px; background:#16a34a; color:#fff; font-size:11.5px; font-weight:700; border:none; cursor:pointer; white-space:nowrap; transition:background .15s; align-self:flex-start; }
        .bl-co2-export:hover { background:#15803d; }

        /* Status-Tabs */
        .bl-tabs { display:flex; gap:0; border-bottom:2px solid #e5e7eb; margin-bottom:20px; overflow-x:auto; scrollbar-width:none; }
        .bl-tabs::-webkit-scrollbar { display:none; }
        .bl-tab { padding:9px 18px; font-size:12.5px; font-weight:600; color:#6b7280; background:none; border:none; cursor:pointer; border-bottom:2px solid transparent; margin-bottom:-2px; white-space:nowrap; transition:color .15s, border-color .15s; font-family:inherit; }
        .bl-tab:hover { color:#154194; }
        .bl-tab.active { color:#154194; border-bottom-color:#154194; }
        .bl-tab-count { display:inline-block; margin-left:6px; padding:1px 6px; font-size:10px; font-weight:700; background:#f3f4f6; color:#6b7280; border-radius:10px; }
        .bl-tab.active .bl-tab-count { background:#e8edf8; color:#154194; }

        /* Gewinner-Zeile */
        .bl-winner { display:inline-flex; align-items:center; gap:5px; padding:3px 9px; background:#f0fdf4; border:1px solid #bbf7d0; font-size:11px; font-weight:700; color:#14532d; }
        .bl-no-winner { display:inline-flex; align-items:center; gap:5px; padding:3px 9px; background:#f9fafb; border:1px solid #e5e7eb; font-size:11px; color:#6b7280; }
      `}</style>

      <div className="bl-root">
        <EucxHeader />

        {/* Käufer-Identitätsstreifen */}
        <div style={{
          background: "linear-gradient(90deg, #0f2d6e 0%, #154194 100%)",
          borderBottom: "1px solid #1a52c2",
          padding: "0 28px", height: 36,
          display: "flex", alignItems: "center",
          fontFamily: "'IBM Plex Sans', Arial, sans-serif",
        }}>
          <div style={{ maxWidth: 1100, margin: "0 auto", width: "100%", display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{
              fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase",
              color: "#bfdbfe", background: "rgba(255,255,255,.12)",
              padding: "3px 10px",
            }}>
              KÄUFER-PORTAL
            </span>
            <span style={{ fontSize: 11, color: "rgba(191,219,254,.7)", letterSpacing: "0.02em" }}>
              Ausschreibungen erstellen · Angebote vergleichen · Einkauf abschließen
            </span>
          </div>
        </div>

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

          {/* CO₂-Widget */}
          {lotsWithCbam > 0 && (
            <div className="bl-co2-widget">
              <div className="bl-co2-main">
                <div className="bl-co2-label">CBAM — CO₂-Fußabdruck</div>
                <div className="bl-co2-num">
                  {totalCo2Tonnes.toLocaleString("de-DE", { maximumFractionDigits: 2 })}
                </div>
                <div className="bl-co2-unit">Tonnen CO₂-Äq. (abgeschlossene Lots)</div>
              </div>
              <div className="bl-co2-breakdown">
                <div className="bl-co2-item">
                  <div className="bl-co2-item-num">{lotsWithCbam}</div>
                  <div className="bl-co2-item-label">Lots mit CBAM-Daten</div>
                </div>
                <div className="bl-co2-item">
                  <div className="bl-co2-item-num">
                    {co2Lots.length > 0
                      ? (totalCo2Tonnes / co2Lots.length).toLocaleString("de-DE", { maximumFractionDigits: 1 })
                      : "—"}
                  </div>
                  <div className="bl-co2-item-label">Ø t CO₂ / Lot</div>
                </div>
              </div>
              <button
                className="bl-co2-export"
                onClick={() => {
                  const lotsWithCo2 = lots.filter((l) => l.co2PerTonne);
                  if (lotsWithCo2.length === 0) return;
                  // CBAM-Export für erstes Lot mit CBAM-Daten (Demo-Aufruf)
                  const token = localStorage.getItem("accessToken") ?? "";
                  window.open(`/api/auction/lots/${lotsWithCo2[0]!.id}/cbam-export?token=${encodeURIComponent(token)}`);
                }}
              >
                CBAM-Zollbericht exportieren →
              </button>
            </div>
          )}

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

          {/* Status-Tabs */}
          {!showForm && !showPreflight && (
            <div className="bl-tabs">
              {([
                { key: "all",        label: "Alle",            count: stats.total      },
                { key: "active",     label: "Auktionen aktiv", count: stats.active     },
                { key: "collection", label: "In Vorbereitung", count: stats.collection },
                { key: "conclusion", label: "Abgeschlossen",   count: stats.concluded  },
              ] as const).map((t) => (
                <button
                  key={t.key}
                  className={`bl-tab${activeTab === t.key ? " active" : ""}`}
                  onClick={() => setActiveTab(t.key)}
                >
                  {t.label}
                  <span className="bl-tab-count">{t.count}</span>
                </button>
              ))}
            </div>
          )}

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
                    <a href="/dashboard/settings/phone" className="bl-pf-link">Verifizieren →</a>
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

                {/* ── Warenvorlage ── */}
                <div style={{ background: "#f0f4ff", border: "1px solid #c7d7fc", padding: "14px 16px", marginBottom: 20 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".06em", color: "#1e3a8a", textTransform: "uppercase", marginBottom: 8 }}>
                    Warenvorlage <span style={{ fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>— wählen Sie ein Produkt, alle Felder werden vorbefüllt</span>
                  </div>
                  <select
                    className="bl-select"
                    style={{ width: "100%", border: "1px solid #93c5fd", background: "#fff" }}
                    value={selectedPreset}
                    onChange={(e) => {
                      setSelectedPreset(e.target.value);
                      if (e.target.value) applyPreset(e.target.value);
                    }}
                  >
                    <option value="">— Vorlage wählen (empfohlen) —</option>
                    <optgroup label="Stahl — Langprodukte">
                      <option value="rebar-bst500">Betonstahl BST 500 (Rebar) · HS 7214 20 00</option>
                      <option value="rebar-bst500s">Betonstahl BST 500S (seismisch) · HS 7214 20 00</option>
                      <option value="wire-rod">Walzdraht (Wire Rod) SAE 1008 · HS 7213 91 10</option>
                    </optgroup>
                    <optgroup label="Stahl — Flachprodukte">
                      <option value="flat-s235">Warmgewalzter Stahl S235JR (Blech / Coil) · HS 7208 51 20</option>
                      <option value="flat-s355">Feinkornbaustahl S355JR (Blech) · HS 7208 51 91</option>
                    </optgroup>
                    <optgroup label="Stahl — Träger / Profile">
                      <option value="beams-hea-heb">HEA / HEB Stahlträger S235 / S355 · HS 7216 33 10</option>
                    </optgroup>
                    <optgroup label="Stahl — Rohre">
                      <option value="pipes-welded">Nahtgeschweißte Hohlprofile S235JRH · HS 7306 30 51</option>
                    </optgroup>
                    <optgroup label="NE-Metalle">
                      <option value="copper-cathodes">Kupferkathoden Grade A · HS 7403 11 00</option>
                      <option value="aluminium-1050">Aluminiumbarren (Primär) EN AW-1050A · HS 7601 10 00</option>
                    </optgroup>
                    <optgroup label="Schrott / Recycling">
                      <option value="scrap-hms">Stahlschrott HMS 1/2 · HS 7204 10 00</option>
                    </optgroup>
                  </select>
                  {selectedPreset && (
                    <div style={{ fontSize: 11, color: "#6b7280", marginTop: 6 }}>
                      Vorlage angewendet — alle Felder sind anpassbar.
                    </div>
                  )}
                </div>

                <div className="bl-form-grid">
                  <div className="bl-form-group">
                    <label className="bl-label">Ware / Commodity *</label>
                    <input
                      className="bl-input"
                      type="text"
                      placeholder="z.B. Betonstahl BST 500, Ø 16 mm, 12 m Stäbe"
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
                    <label className="bl-label">Maximaler Preis <span>(optional, EUR €/Einheit)</span></label>
                    <div style={{ position: "relative" }}>
                      <input
                        className="bl-input"
                        type="number"
                        step="0.01"
                        min="0.01"
                        placeholder="850.00"
                        value={startPrice}
                        onChange={(e) => setStartPrice(e.target.value)}
                        style={{ paddingRight: 50, width: "100%" }}
                      />
                      <span style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", fontSize: 12, fontWeight: 700, color: "#154194", pointerEvents: "none" }}>EUR</span>
                    </div>
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

                {/* CBAM-Sektion */}
                <div className="bl-cbam-header">
                  <span className="bl-cbam-title">CBAM — Carbon Border Adjustment Mechanism</span>
                  <span className="bl-cbam-badge">EU-Verordnung 2023/956</span>
                </div>
                <div className="bl-cbam-hint">
                  Angaben für grenzüberschreitenden Handel — Pflicht ab 2026. Bei inländischer Ware empfohlen.
                </div>
                <div className="bl-form-grid">
                  <div className="bl-form-group">
                    <label className="bl-label">CO₂-Emissionen <span>(optional, kg CO₂-Äq./t)</span></label>
                    <input
                      className="bl-input"
                      type="number"
                      step="0.0001"
                      min="0"
                      placeholder="1850.0000"
                      value={co2PerTonne}
                      onChange={(e) => setCo2PerTonne(e.target.value)}
                    />
                  </div>

                  <div className="bl-form-group">
                    <label className="bl-label">Herkunftsland <span>(optional)</span></label>
                    <input
                      className="bl-input"
                      list="buyer-country-list"
                      placeholder="z.B. DE - Deutschland"
                      value={countryOfOrigin}
                      onChange={(e) => setCountryOfOrigin(e.target.value)}
                    />
                    <datalist id="buyer-country-list">
                      {COUNTRIES.map((c) => <option key={c} value={c} />)}
                    </datalist>
                  </div>

                  <div className="bl-form-group">
                    <label className="bl-label">CBAM-Registry-ID (Produktionsstätte) <span>(optional)</span></label>
                    <input
                      className="bl-input"
                      type="text"
                      placeholder="CBAM-DE-12345678"
                      value={productionSiteId}
                      onChange={(e) => setProductionSiteId(e.target.value)}
                    />
                  </div>

                  <div className="bl-form-group">
                    <label className="bl-label">Lieferbedingung <span>(INCOTERMS® 2020)</span></label>
                    <select
                      className="bl-select"
                      value={incoterms}
                      onChange={(e) => setIncoterms(e.target.value)}
                    >
                      {INCOTERMS_LIST.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Handels- und Vertragsangaben */}
                <div className="bl-cbam-header" style={{ marginTop: 24 }}>
                  <span className="bl-cbam-title">Handels- und Vertragsangaben</span>
                  <span className="bl-cbam-badge" style={{ background: "#154194" }}>Rechtlich relevant</span>
                </div>
                <div className="bl-cbam-hint">
                  Pflichtangaben — Bestandteil des Kaufvertrags (§§ 433, 434 BGB). Werden Bietern vor Gebotsabgabe vollständig angezeigt.
                </div>
                <div className="bl-form-grid">
                  <div className="bl-form-group">
                    <label className="bl-label">Zolltarifnummer (HS-Code) *</label>
                    <input
                      className="bl-input"
                      type="text"
                      placeholder="z.B. 7214 20 00"
                      value={hsCode}
                      onChange={(e) => setHsCode(e.target.value)}
                      required
                    />
                  </div>

                  <div className="bl-form-group">
                    <label className="bl-label">Güte / Qualitätsnorm *</label>
                    <input
                      className="bl-input"
                      type="text"
                      placeholder="z.B. B500B · EN 10080"
                      value={qualityGrade}
                      onChange={(e) => setQualityGrade(e.target.value)}
                      required
                    />
                  </div>

                  <div className="bl-form-group">
                    <label className="bl-label">Lieferzeitraum *</label>
                    <input
                      className="bl-input"
                      type="text"
                      placeholder="z.B. 4–6 Wochen ab Zuschlag"
                      value={deliveryPeriod}
                      onChange={(e) => setDeliveryPeriod(e.target.value)}
                      required
                    />
                  </div>

                  <div className="bl-form-group">
                    <label className="bl-label">Zahlungsbedingungen *</label>
                    <input
                      className="bl-input"
                      type="text"
                      placeholder="z.B. 30 Tage netto nach Lieferung"
                      value={paymentTerms}
                      onChange={(e) => setPaymentTerms(e.target.value)}
                      required
                    />
                  </div>

                  <div className="bl-form-group full">
                    <label className="bl-label">USt.-Behandlung *</label>
                    <select
                      className="bl-select"
                      value={vatTreatment}
                      onChange={(e) => setVatTreatment(e.target.value)}
                    >
                      <option value="">— Bitte wählen —</option>
                      <option value="Umsatzsteuer 19 % (Regelbesteuerung)">Umsatzsteuer 19 % (Regelbesteuerung)</option>
                      <option value="Steuerschuldumkehr §13b UStG (Reverse Charge)">Steuerschuldumkehr §13b UStG (Reverse Charge)</option>
                      <option value="Innergemeinschaftliche Lieferung §4 Nr. 1b UStG (0 %)">Innergemeinschaftliche Lieferung §4 Nr. 1b UStG (0 %)</option>
                      <option value="Ausfuhrlieferung steuerfrei §4 Nr. 1a UStG">Ausfuhrlieferung steuerfrei §4 Nr. 1a UStG</option>
                      <option value="Differenzbesteuerung §25a UStG">Differenzbesteuerung §25a UStG</option>
                    </select>
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
          ) : (() => {
            const filtered = lots.filter((l) => {
              if (activeTab === "all")        return true;
              if (activeTab === "active")     return l.phase === "PROPOSAL" || l.phase === "REDUCTION";
              if (activeTab === "collection") return l.phase === "COLLECTION";
              if (activeTab === "conclusion") return l.phase === "CONCLUSION";
              return true;
            });
            if (filtered.length === 0) return (
              <div className="bl-empty">
                {lots.length === 0
                  ? "Noch keine Ausschreibungen."
                  : "Keine Ausschreibungen in dieser Kategorie."}
                {lots.length === 0 && (
                  <div className="bl-empty-hint">Klicken Sie auf „+ Neue Ausschreibung" um Ihre erste Auktion zu starten.</div>
                )}
              </div>
            );
            return (
            <div className="bl-table-wrap">
              <table className="bl-table">
                <thead>
                  <tr>
                    <th>Ware</th>
                    <th>Menge</th>
                    <th>Status</th>
                    <th>Max-Preis</th>
                    <th>Bestes Gebot / Ergebnis</th>
                    <th>Auktionsende</th>
                    <th>Bieter</th>
                    <th>Aktion</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((lot) => {
                    const savings = lot.startPrice && lot.currentBest
                      ? Number(lot.startPrice) - Number(lot.currentBest)
                      : null;

                    return (
                      <tr key={lot.id}>
                        <td style={{ maxWidth: 240 }}>
                          <div style={{ fontWeight: 600, color: "#111827", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {lot.commodity}
                          </div>
                          {lot.qualityGrade && (
                            <div style={{ fontSize: 10.5, color: "#6b7280", marginTop: 2, fontWeight: 500 }}>
                              {lot.qualityGrade}
                            </div>
                          )}
                          {lot.hsCode && (
                            <div style={{ fontSize: 10, color: "#9ca3af", fontFamily: "'IBM Plex Mono',monospace" }}>
                              HS {lot.hsCode}
                            </div>
                          )}
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
                          {lot.phase === "CONCLUSION" ? (
                            lot.winnerId ? (
                              <div>
                                <span className="bl-winner">✓ Zuschlag erteilt</span>
                                {lot.currentBest && (
                                  <div style={{ marginTop: 4, color: "#14532d", fontWeight: 700 }}>
                                    {fmtEur(lot.currentBest)}
                                    {savings !== null && savings > 0 && (
                                      <span style={{ fontSize: 10, color: "#16a34a", marginLeft: 6 }}>
                                        −{fmtEur(String(savings))}
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span className="bl-no-winner">Kein Gewinner</span>
                            )
                          ) : lot.currentBest ? (
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
                            <button
                              className="bl-btn-open"
                              disabled={opening === lot.id || lot._count.registrations === 0}
                              onClick={() => openingLotId === lot.id ? setOpeningLotId(null) : requestOpenLot(lot.id)}
                              title={lot._count.registrations === 0 ? "Warten auf Verkäufer-Registrierungen" : "Auktion starten"}
                            >
                              {opening === lot.id ? "…" : "Auktion starten"}
                            </button>
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
            );
          })()}
        </div>
      </div>

      {/* Auktionsstart-Bestätigung */}
      {openingLotId && (
        <div className="bl-timepick-overlay" onClick={() => setOpeningLotId(null)}>
          <div className="bl-timepick" onClick={(e) => e.stopPropagation()}>
            <div className="bl-timepick-label">Auktion starten</div>
            <div className="bl-timepick-hint">
              Die Auktion läuft in der nächsten Handelssitzung. Alle registrierten Verkäufer können ab sofort Gebote abgeben.
            </div>
            <div className="bl-timepick-slot">
              Gebote werden angenommen bis:
              <span>{nextSlotLabel()}</span>
            </div>
            <div className="bl-timepick-actions">
              <button
                className="bl-timepick-confirm"
                disabled={!!opening}
                onClick={() => { void confirmOpenLot(); }}
              >
                {opening ? "…" : "Jetzt starten →"}
              </button>
              <button className="bl-timepick-cancel" onClick={() => setOpeningLotId(null)}>
                Abbrechen
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
