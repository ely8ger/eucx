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

interface CatalogResult {
  id: string; nr: number; slug: string;
  nameDe: string | null; nameEn: string; nameRu: string; norm: string | null;
  _count: { sizes: number };
}

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
  deliveryPeriod?:    string | null;
  deliveryLocation?:  string | null;
  paymentTerms?:      string | null;
  vatTreatment?:      string | null;
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

const INCOTERMS_LIST = [
  { code: "EXW", label: "EXW - Ex Works" },
  { code: "FCA", label: "FCA - Free Carrier" },
  { code: "FAS", label: "FAS - Free Alongside Ship" },
  { code: "FOB", label: "FOB - Free On Board" },
  { code: "CFR", label: "CFR - Cost and Freight" },
  { code: "CIF", label: "CIF - Cost, Insurance and Freight" },
  { code: "CPT", label: "CPT - Carriage Paid To" },
  { code: "CIP", label: "CIP - Carriage and Insurance Paid To" },
  { code: "DAP", label: "DAP - Delivered At Place" },
  { code: "DPU", label: "DPU - Delivered at Place Unloaded" },
  { code: "DDP", label: "DDP - Delivered Duty Paid" },
] as const;

// ── CBAM-Warengruppen nach Anhang I EU-VO 2023/956 ───────────────────────────
// factor: kg CO₂-Äq. pro Tonne (EU Global Default Value für die Übergangsphase)
// Quellen: Anhang VIII VO (EU) 2023/1773 + Delg. VO (EU) 2024/1316
const CBAM_GROUPS = [
  // Eisen & Stahl (Kapitel 72–73)
  { id: "STEEL_PRIMARY",       label: "Rohstahl / Eisenprimärprodukte",       kn: "KN 7206–7212", factor: 2030 },
  { id: "STEEL_PROCESSED",     label: "Weiterverarbeitete Stahlerzeugnisse",  kn: "KN 7213–7326", factor: 1930 },
  // Aluminium (Kapitel 76)
  { id: "ALUMINIUM_UNWROUGHT", label: "Roh-Aluminium, primär (Unwrought)",   kn: "KN 7601",      factor: 6720 },
  { id: "ALUMINIUM_PROCESSED", label: "Aluminium-Erzeugnisse (Wrought)",      kn: "KN 7603–7616", factor: 2860 },
  // Zement (Kapitel 25)
  { id: "CEMENT_CLINKER",      label: "Zementklinker",                        kn: "KN 2523 10",   factor: 874  },
  { id: "CEMENT_HYDRAULIC",    label: "Hydraulischer Zement",                 kn: "KN 2523 21–90",factor: 766  },
  // Düngemittel (Kapitel 28 & 31)
  { id: "FERTILIZER_AMMONIA",  label: "Ammoniak (NH₃)",                       kn: "KN 2814",      factor: 1694 },
  { id: "FERTILIZER_UREA",     label: "Harnstoff (Urea)",                     kn: "KN 3102 10",   factor: 2082 },
  { id: "FERTILIZER_AN",       label: "Ammoniumnitrat",                       kn: "KN 3102 30",   factor: 1571 },
  { id: "FERTILIZER_MIXED",    label: "Mischstickstoffdünger",                kn: "KN 3105",      factor: 1780 },
  // Wasserstoff (Kapitel 28)
  { id: "HYDROGEN",            label: "Wasserstoff (H₂)",                     kn: "KN 2804 10",   factor: 2350 },
] as const;
type CbamGroupId = typeof CBAM_GROUPS[number]["id"];

// ── Warenkatalog — EUCX-Produktpalette ────────────────────────────────────────
// Jede Vorlage befüllt Pflichtfelder vor; Käufer passt Menge, Preis, Lieferzeitraum an.
const COMMODITY_CATALOG = [
  // Stahl — Langprodukte
  { id: "rebar-bst500",   cat: "Stahl — Langprodukte",     cbam: "STEEL_PROCESSED" as CbamGroupId,    name: "Betonstahl BST 500 (Rebar)",                hsCode: "7214 20 00", qualityGrade: "B500B · EN 10080",             inco: "DAP", vat: "Steuerschuldumkehr §13b UStG (Reverse Charge)",    desc: "Gerippter Betonstahl BST 500, Ø 8–40 mm. Normen: EN 10080, DIN 488. Lieferung in Stäben 6 m / 12 m oder Ring. 3.1-Werkzeugnis nach EN 10204 beizufügen. Anwendung: Stahlbetonkonstruktionen." },
  { id: "rebar-bst500s",  cat: "Stahl — Langprodukte",     cbam: "STEEL_PROCESSED" as CbamGroupId,    name: "Betonstahl BST 500S (seismisch)",            hsCode: "7214 20 00", qualityGrade: "B500S · EN 10080",             inco: "DAP", vat: "Steuerschuldumkehr §13b UStG (Reverse Charge)",    desc: "Gerippter Betonstahl BST 500S, erhöhte Duktilität Klasse S für Erdbebengebiete. Ø 8–32 mm. Normen: EN 10080, DIN 488-2, EC 8. 3.1-Werkzeugnis nach EN 10204 erforderlich." },
  { id: "wire-rod",       cat: "Stahl — Langprodukte",     cbam: "STEEL_PROCESSED" as CbamGroupId,    name: "Walzdraht (Wire Rod) SAE 1008",              hsCode: "7213 91 10", qualityGrade: "SAE 1008 · EN 10016-2",        inco: "EXW", vat: "Steuerschuldumkehr §13b UStG (Reverse Charge)",    desc: "Walzdraht unlegiert, niedriggekohlter Stahl SAE 1008 / DD11. Coil, Ø 5,5–16 mm. Normen: EN 10016-2. Schmelznachweis 3.1 nach EN 10204 erforderlich. Anwendung: Zieherei, Betonstahlproduktion." },
  // Stahl — Flachprodukte
  { id: "flat-s235",      cat: "Stahl — Flachprodukte",    cbam: "STEEL_PRIMARY" as CbamGroupId,      name: "Warmgewalzter Stahl S235JR (Blech / Coil)", hsCode: "7208 51 20", qualityGrade: "S235JR · EN 10025-2",          inco: "DAP", vat: "Steuerschuldumkehr §13b UStG (Reverse Charge)",    desc: "Warmgewalzte Bleche / Coils, S235JR. Breite 600–2000 mm, Dicke 2–25 mm. Normen: EN 10025-2, EN 10051. Anwendung: Konstruktionsstahl, Maschinenbau. 3.1-Zeugnis nach EN 10204 beizufügen." },
  { id: "flat-s355",      cat: "Stahl — Flachprodukte",    cbam: "STEEL_PRIMARY" as CbamGroupId,      name: "Feinkornbaustahl S355JR (Blech)",            hsCode: "7208 51 91", qualityGrade: "S355JR · EN 10025-2",          inco: "DAP", vat: "Steuerschuldumkehr §13b UStG (Reverse Charge)",    desc: "Warmgewalzte Feinkornbaustahl-Bleche S355JR. Dicke 3–80 mm, Breite bis 3000 mm. Normen: EN 10025-2. Anwendung: Brückenbau, Schweißkonstruktionen. 3.1-Werkzeugnis nach EN 10204." },
  // Stahl — Träger / Profile
  { id: "beams-hea-heb",  cat: "Stahl — Träger / Profile", cbam: "STEEL_PROCESSED" as CbamGroupId,    name: "HEA / HEB Stahlträger S235 / S355",         hsCode: "7216 33 10", qualityGrade: "S235JR / S355JR · EN 10025-2", inco: "DAP", vat: "Steuerschuldumkehr §13b UStG (Reverse Charge)",    desc: "Breitflanschträger HEA/HEB nach EN 10365, S235JR oder S355JR. Größen HEA 100–900, HEB 100–1000. Anwendung: Stahlbau, Hallenkonstruktionen. 3.1-Werkzeugnis nach EN 10204." },
  // Stahl — Rohre
  { id: "pipes-welded",   cat: "Stahl — Rohre",            cbam: "STEEL_PROCESSED" as CbamGroupId,    name: "Nahtgeschweißte Hohlprofile S235JRH",       hsCode: "7306 30 51", qualityGrade: "S235JRH · EN 10210-1",         inco: "EXW", vat: "Steuerschuldumkehr §13b UStG (Reverse Charge)",    desc: "Nahtgeschweißte Hohlprofile (quadratisch, rechteckig, rund), S235JRH. Wandstärke 2–16 mm. Normen: EN 10210-1, EN 10219. Anwendung: Stahlbau, Konstruktionsprofile. 3.1-Zeugnis EN 10204." },
  // NE-Metalle
  { id: "copper-cathodes", cat: "NE-Metalle",              cbam: null,                                 name: "Kupferkathoden Grade A",                    hsCode: "7403 11 00", qualityGrade: "Cu-CATH-1 · EN 1978 Grade A",  inco: "CIF", vat: "Umsatzsteuer 19 % (Regelbesteuerung)",             desc: "Elektrolyt-Kupferkathoden EN 1978 Grade A, Reinheit min. 99,99 % Cu. Standardkathode ca. 110–130 kg/Stück. LME-konforme Qualität, palettiert. Analysezertifikat erforderlich." },
  { id: "aluminium-1050",  cat: "NE-Metalle",              cbam: "ALUMINIUM_UNWROUGHT" as CbamGroupId, name: "Aluminiumbarren (Primär) EN AW-1050A",      hsCode: "7601 10 00", qualityGrade: "EN AW-1050A · EN 573-3",       inco: "CIF", vat: "Umsatzsteuer 19 % (Regelbesteuerung)",             desc: "Primär-Aluminiumbarren EN AW-1050A (Al 99,5 %), T-Barren oder Masseln. LME-Spezifikation P1020. Analysezertifikat und Ursprungsnachweis erforderlich. CBAM-pflichtig ab 2026." },
  // Schrott
  { id: "scrap-hms",       cat: "Stahl — Schrott",         cbam: null,                                 name: "Stahlschrott HMS 1/2 (Heavy Melting Scrap)", hsCode: "7204 10 00", qualityGrade: "HMS 1/2 · ISRI 200–212",      inco: "FOB", vat: "Steuerschuldumkehr §13b UStG (Reverse Charge)",    desc: "Schwerer Stahlschrott HMS 1/2, ISRI-Spezifikation 200 (HMS1) / 210 (HMS2). Feuchtigkeitsgehalt max. 1 %. Analyse: C ≤ 0,4 %, S ≤ 0,05 %. Sichtkontrolle bei Übernahme." },
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
  const [cbamCategory,     setCbamCategory]     = useState<CbamGroupId | "">("");
  const [co2PerTonne,      setCo2PerTonne]      = useState("");   // kg CO₂-Äq./t (EU-Default oder Werkswert)
  const [countryOfOrigin,  setCountryOfOrigin]  = useState("");
  const [productionSiteId, setProductionSiteId] = useState("");
  const [incoterms,        setIncoterms]        = useState("DAP");
  // Handels- und Vertragsangaben
  const [hsCode,           setHsCode]           = useState("");
  const [qualityGrade,     setQualityGrade]     = useState("");
  const [deliveryPeriod,   setDeliveryPeriod]   = useState("");
  const [deliveryLocation, setDeliveryLocation] = useState("");
  const [paymentTerms,     setPaymentTerms]     = useState("");
  const [vatTreatment,     setVatTreatment]     = useState("");
  const [selectedPreset,   setSelectedPreset]   = useState("");

  // Katalog-Suche
  const [catalogExpanded,   setCatalogExpanded]   = useState(true);
  const [catalogQuery,      setCatalogQuery]      = useState("");
  const [catalogResults,    setCatalogResults]    = useState<CatalogResult[]>([]);
  const [catalogOpen,       setCatalogOpen]       = useState(false);
  const [catalogBrowseMode, setCatalogBrowseMode] = useState(false);
  const [catalogProduct,    setCatalogProduct]    = useState<{ slug: string; nameEn: string; norm: string | null } | null>(null);
  const [catalogSizes,      setCatalogSizes]      = useState<string[]>([]);
  const [selectedSize,      setSelectedSize]      = useState("");
  const [selectedPrimary,   setSelectedPrimary]   = useState("");
  const [sizeQuery,         setSizeQuery]         = useState("");

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

  // ── Katalog-Suche (debounced 300ms) ──────────────────────────────────
  useEffect(() => {
    if (catalogProduct) return; // Produkt bereits gewählt — keine Neu-Suche
    if (catalogQuery.length < 1) { setCatalogResults([]); setCatalogOpen(false); setCatalogBrowseMode(false); return; }
    setCatalogBrowseMode(false);
    const t = setTimeout(() => {
      fetch(`/api/catalog?q=${encodeURIComponent(catalogQuery)}`, { headers: { Authorization: `Bearer ${token}` } })
        .then((r) => r.json())
        .then((d) => { setCatalogResults(d.products ?? []); setCatalogOpen(true); })
        .catch(() => {});
    }, 300);
    return () => clearTimeout(t);
  }, [catalogQuery, token, catalogProduct]);

  // ── Größen für gewähltes Produkt laden ───────────────────────────────
  useEffect(() => {
    if (!catalogProduct) { setCatalogSizes([]); return; }
    fetch(`/api/catalog?slug=${catalogProduct.slug}`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((d) => setCatalogSizes(d.sizes?.map((s: { value: string }) => s.value) ?? []))
      .catch(() => {});
  }, [catalogProduct, token]);

  // ── CO₂-Faktor aus CBAM-Gruppe laden wenn Kategorie gewählt ─────────
  useEffect(() => {
    if (!cbamCategory) return;
    const grp = CBAM_GROUPS.find((g) => g.id === cbamCategory);
    if (grp) setCo2PerTonne(String(grp.factor));
  }, [cbamCategory]);

  // ── Warenvorlage anwenden ──────────────────────────────────────────
  function applyPreset(presetId: string) {
    const p = COMMODITY_CATALOG.find((c) => c.id === presetId);
    if (!p) return;
    setCommodity(p.name);
    setHsCode(p.hsCode);
    setQualityGrade(p.qualityGrade);
    setDescription(p.desc);
    if (p.cbam) setCbamCategory(p.cbam);  // CBAM-Gruppe aus Katalog vorbelegen
    setIncoterms(p.inco);
    setVatTreatment(p.vat);
  }

  // ── Ausschreibung erstellen ───────────────────────────────────────
  async function createLot(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    if (!commodity.trim())   { setFormError("Ware ist erforderlich."); return; }
    const qty = parseFloat(quantity);
    if (!qty || qty <= 0)    { setFormError("Menge muss größer als 0 sein."); return; }
    if (!description.trim()) { setFormError("Beschreibung ist erforderlich — bitte technische Details, Zeugnis, Lieferort und Verpackung angeben."); return; }

    setSubmitting(true);
    try {
      const body: Record<string, unknown> = { commodity: commodity.trim(), quantity: qty, unit };
      if (startPrice) body.startPrice = parseFloat(startPrice);
      if (description.trim()) body.description = description.trim();
      // CBAM-Felder (optional)
      if (cbamCategory)     body.cbamCategory     = cbamCategory;
      if (co2PerTonne)      body.co2PerTonne      = parseFloat(co2PerTonne);
      if (countryOfOrigin)  body.countryOfOrigin  = countryOfOrigin;
      if (productionSiteId) body.productionSiteId = productionSiteId.trim();
      if (incoterms)        body.incoterms        = incoterms;
      // Pflichtfelder — vertragswesentlich
      if (!hsCode.trim())         { setFormError("Zolltarifnummer (HS-Code) ist erforderlich.");     setSubmitting(false); return; }
      if (!qualityGrade.trim())   { setFormError("Güte / Qualitätsnorm ist erforderlich.");          setSubmitting(false); return; }
      if (!deliveryPeriod.trim())   { setFormError("Max. Lieferzeit ist erforderlich.");               setSubmitting(false); return; }
      if (!deliveryLocation.trim()) { setFormError("Lieferort ist erforderlich.");                     setSubmitting(false); return; }
      if (!paymentTerms.trim())     { setFormError("Zahlungsbedingungen sind erforderlich.");          setSubmitting(false); return; }
      if (!vatTreatment)          { setFormError("USt.-Behandlung muss ausgewählt werden.");         setSubmitting(false); return; }
      body.hsCode         = hsCode.trim();
      body.qualityGrade   = qualityGrade.trim();
      body.deliveryPeriod   = deliveryPeriod.trim();
      body.deliveryLocation = deliveryLocation.trim();
      body.paymentTerms     = paymentTerms.trim();
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
        setCbamCategory(""); setCo2PerTonne(""); setCountryOfOrigin(""); setProductionSiteId(""); setIncoterms("DAP");
        setHsCode(""); setQualityGrade(""); setDeliveryPeriod(""); setDeliveryLocation(""); setPaymentTerms(""); setVatTreatment("");
        setSelectedPreset("");
        setCatalogQuery(""); setCatalogResults([]); setCatalogOpen(false); setCatalogBrowseMode(false);
        setCatalogProduct(null); setCatalogSizes([]); setSelectedSize(""); setSelectedPrimary(""); setSizeQuery("");
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

  /** Nächste Handelssitzung als lesbarer String (für Bestätigungs-Modal) */
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
    const inSlot = isWeekday && berlinHour >= 13 && berlinHour < 15;
    if (inSlot) return `heute bis 15:00 MEZ`;
    for (let i = 1; i <= 7; i++) {
      const d = new Date(now.getTime() + i * 24 * 60 * 60 * 1000);
      const wd = d.getDay();
      if (wd >= 1 && wd <= 5) return `${fmt(d)} · 13:00–15:00 MEZ`;
    }
    return "nächste Handelssitzung";
  }

  /** Auktion-Start-Zeitpunkt für Button-Text */
  function nextSlotStartLabel(): string {
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
    const inSlot = isWeekday && berlinHour >= 13 && berlinHour < 15;
    if (inSlot) return `Auktion läuft · endet 15:00 MEZ`;
    for (let i = 1; i <= 7; i++) {
      const d = new Date(now.getTime() + i * 24 * 60 * 60 * 1000);
      const wd = d.getDay();
      if (wd >= 1 && wd <= 5) {
        const label = i === 1 ? "morgen" : fmt(d);
        return `Startet ${label} · 13:00 MEZ`;
      }
    }
    return "Auktion starten";
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
        .bl-input { width:100%; box-sizing:border-box; height:40px; border:1px solid #d1d5db; padding:0 12px; font-size:14px; outline:none; font-family:inherit; transition:border-color .15s; }
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

                {/* ── Produktkatalog-Suche ── */}
                <div style={{ marginBottom: 20, position: "relative" }}>
                  <div
                    onClick={() => setCatalogExpanded((v) => !v)}
                    style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: catalogExpanded ? 8 : 0, paddingLeft: 12, borderLeft: "3px solid #154194", cursor: "pointer", userSelect: "none" as const }}
                  >
                    <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".08em", color: "#154194", textTransform: "uppercase" as const }}>Produktkatalog</span>
                    <span style={{ fontSize: 11, color: "#9ca3af" }}>184 Produkte · 24.438 Abmessungen</span>
                    {catalogProduct && (
                      <span style={{ fontSize: 11, color: "#154194", fontWeight: 600, marginLeft: 4 }}>· {catalogProduct.nameEn}</span>
                    )}
                    <span style={{ marginLeft: "auto", fontSize: 10, color: "#154194", fontWeight: 700 }}>
                      {catalogExpanded ? "▲" : "▼"}
                    </span>
                  </div>
                  {catalogExpanded && (
                  <div style={{ position: "relative" }}>
                    <input
                      className="bl-input"
                      style={{ paddingRight: 42 }}
                      placeholder='Produkt suchen oder ▼ klicken — "Beton", "pipe", "angle", "B240A" …'
                      value={catalogQuery}
                      autoComplete="off"
                      onChange={(e) => {
                        setCatalogQuery(e.target.value);
                        if (!e.target.value) { setCatalogProduct(null); setSelectedSize(""); setSelectedPrimary(""); }
                      }}
                      onFocus={() => { if (catalogResults.length > 0) setCatalogOpen(true); }}
                      onBlur={() => setTimeout(() => setCatalogOpen(false), 200)}
                    />
                    {/* Dropdown-Pfeil */}
                    <button
                      type="button"
                      aria-label="Alle Produkte anzeigen"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        if (catalogOpen) {
                          setCatalogOpen(false);
                        } else {
                          fetch(`/api/catalog?browse=1`, { headers: { Authorization: `Bearer ${token}` } })
                            .then((r) => r.json())
                            .then((d) => { setCatalogResults(d.products ?? []); setCatalogBrowseMode(true); setCatalogOpen(true); })
                            .catch(() => {});
                        }
                      }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#e8edf8"; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "#f0f5ff"; }}
                      style={{
                        position: "absolute", right: 0, top: 0, height: "100%", width: 40,
                        background: "#f0f5ff", border: "none", borderLeft: "1px solid #c7d7fc",
                        cursor: "pointer", color: "#154194", fontSize: 10, fontWeight: 700,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        transition: "background .12s", letterSpacing: ".02em",
                      }}
                    >
                      {catalogOpen ? "▲" : "▼"}
                    </button>

                  {/* Ergebnis-Dropdown */}
                  {catalogOpen && catalogResults.length > 0 && (
                    <div style={{ position: "absolute", left: 0, right: 0, top: "calc(100% + 2px)", background: "#fff", border: "1px solid #d1d5db", borderTop: "2px solid #154194", zIndex: 200, maxHeight: 360, overflowY: "auto", boxShadow: "0 8px 24px rgba(0,0,0,.12)" }}>
                      {/* Kopfzeile */}
                      <div style={{ display: "grid", gridTemplateColumns: "36px 1fr 140px 52px", gap: "0 12px", padding: "6px 14px", background: "#f0f5ff", borderBottom: "1px solid #c7d7fc", fontSize: 10, fontWeight: 700, letterSpacing: ".08em", color: "#154194", textTransform: "uppercase" as const }}>
                        <div>Nr</div>
                        <div>{catalogBrowseMode ? `Alle Produkte (${catalogResults.length}+)` : "Produkt"}</div>
                        <div>Norm</div>
                        <div style={{ textAlign: "right" }}>Abm.</div>
                      </div>
                      {catalogResults.map((r) => (
                        <div
                          key={r.id}
                          onMouseDown={(e) => {
                            e.preventDefault();
                            setCatalogProduct({ slug: r.slug, nameEn: r.nameDe ?? r.nameEn, norm: r.norm });
                            setCatalogQuery(r.nameDe ?? r.nameEn);
                            setCatalogOpen(false);
                            setSelectedSize(""); setSelectedPrimary(""); setSizeQuery("");
                            setCommodity(r.nameDe ?? r.nameEn);
                            if (r.norm) setQualityGrade(r.norm);
                          }}
                          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#f0f5ff"; }}
                          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = ""; }}
                          style={{ display: "grid", gridTemplateColumns: "36px 1fr 140px 52px", gap: "0 12px", padding: "9px 14px", cursor: "pointer", borderBottom: "1px solid #f3f4f6", alignItems: "center" }}
                        >
                          {/* Nr */}
                          <div style={{ fontSize: 11, color: "#c4c9d4", fontVariantNumeric: "tabular-nums", lineHeight: 1 }}>
                            {r.nr}
                          </div>
                          {/* Produkt-Name */}
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontSize: 13, fontWeight: 600, color: "#111827", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {r.nameDe ?? r.nameEn}
                            </div>
                            <div style={{ fontSize: 11, color: "#6b7280", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {r.nameEn}
                            </div>
                          </div>
                          {/* Norm */}
                          <div style={{ fontSize: 11, color: "#6b7280", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {r.norm ?? <span style={{ color: "#d1d5db" }}>—</span>}
                          </div>
                          {/* Abmessungen */}
                          <div style={{ fontSize: 11, color: "#9ca3af", textAlign: "right", fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>
                            {r._count.sizes > 0 ? r._count.sizes : <span style={{ color: "#d1d5db" }}>—</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {catalogQuery.length >= 1 && catalogResults.length === 0 && !catalogOpen && !catalogProduct && (
                    <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 5, paddingLeft: 2 }}>Kein Treffer — Produktnamen im Feld „Ware / Commodity" frei eingeben.</div>
                  )}

                  {/* Ausgewählt-Zeile */}
                  {catalogProduct && (
                    <div style={{ marginTop: 6, padding: "8px 14px", background: "#f0f5ff", borderLeft: "3px solid #154194", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: "#154194", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {catalogProduct.nameEn}
                          {catalogProduct.norm && <span style={{ fontWeight: 400, color: "#6b7280", marginLeft: 8 }}>{catalogProduct.norm}</span>}
                        </div>
                        {selectedSize && (
                          <div style={{ fontSize: 11, color: "#374151", marginTop: 2, fontWeight: 600 }}>
                            Abmessung: {selectedSize}
                          </div>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => { setCatalogProduct(null); setCatalogQuery(""); setSelectedSize(""); setSelectedPrimary(""); setSizeQuery(""); }}
                        style={{ flexShrink: 0, background: "none", border: "none", cursor: "pointer", color: "#9ca3af", fontSize: 18, lineHeight: 1, padding: "2px 4px" }}
                        title="Auswahl zurücksetzen"
                      >×</button>
                    </div>
                  )}
                  </div>
                  )}
                </div>

                {/* ── Abmessungs-Picker ── */}
                {catalogExpanded && catalogProduct && catalogSizes.length > 0 && (() => {
                  const SEP = "х";
                  const hasMultiPart = catalogSizes.some((s) => s.includes(SEP));

                  if (!hasMultiPart) {
                    // Einfache Maße (z.B. Betonstahl: 10 mm, 12 mm oder Draht: 0.2 mm)
                    const filtered = sizeQuery
                      ? catalogSizes.filter((s) => s.includes(sizeQuery))
                      : catalogSizes;
                    const allMm = catalogSizes.length > 0 && catalogSizes.every((s) => /^\d+(\.\d+)?\s*mm$/.test(s));
                    const dimLabel = allMm ? "Ø Nenndurchmesser" : "Abmessung";
                    return (
                      <div style={{ marginBottom: 20, border: "1px solid #e5e7eb" }}>
                        <div style={{ padding: "8px 14px", borderBottom: "1px solid #e5e7eb", background: "#f9fafb", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <div>
                            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".06em", color: "#374151", textTransform: "uppercase" as const }}>{dimLabel}</span>
                            <span style={{ fontSize: 11, color: "#9ca3af", marginLeft: 6 }}>· {catalogSizes.length} Größen</span>
                          </div>
                          <input
                            className="bl-input"
                            style={{ width: 140, padding: "3px 8px", fontSize: 12 }}
                            placeholder="Filtern …"
                            value={sizeQuery}
                            onChange={(e) => setSizeQuery(e.target.value)}
                          />
                        </div>
                        <div style={{ padding: "12px 14px", display: "flex", flexWrap: "wrap", gap: 6, maxHeight: 200, overflowY: "auto" }}>
                          {filtered.map((s) => (
                            <button
                              key={s}
                              type="button"
                              onClick={() => { setSelectedSize(s); setCommodity(`${catalogProduct.nameEn}, ${s}`); }}
                              style={{
                                padding: "6px 14px", fontSize: 13, cursor: "pointer",
                                fontFamily: "'IBM Plex Mono', monospace", fontWeight: 500,
                                border: selectedSize === s ? "1.5px solid #154194" : "1px solid #d1d5db",
                                background: selectedSize === s ? "#154194" : "#fff",
                                color: selectedSize === s ? "#fff" : "#374151",
                                transition: "all .1s",
                                minWidth: 72, textAlign: "center" as const,
                              }}
                            >{s}</button>
                          ))}
                        </div>
                        {selectedSize && (
                          <div style={{ padding: "6px 14px", borderTop: "1px solid #e5e7eb", background: "#f8faff", fontSize: 12, color: "#154194", fontWeight: 600 }}>
                            Gewählt: <span style={{ fontFamily: "'IBM Plex Mono', monospace" }}>{selectedSize}</span>
                            {allMm && <span style={{ color: "#9ca3af", fontWeight: 400 }}> (Ø {selectedSize})</span>}
                          </div>
                        )}
                      </div>
                    );
                  }

                  // Zwei-Stufen-Picker: Primärmaß (links) × Wandstärke/Dicke (rechts)
                  const grouped = new Map<string, string[]>();
                  for (const s of catalogSizes) {
                    const lastIdx = s.lastIndexOf(SEP);
                    const primary = lastIdx > 0 ? s.slice(0, lastIdx) : s;
                    if (!grouped.has(primary)) grouped.set(primary, []);
                    grouped.get(primary)!.push(s);
                  }
                  const primaries = [...grouped.keys()];
                  const filteredPrimaries = sizeQuery ? primaries.filter((p) => p.toLowerCase().includes(sizeQuery.toLowerCase())) : primaries;
                  const secondaries = selectedPrimary ? (grouped.get(selectedPrimary) ?? []) : [];

                  return (
                    <div style={{ marginBottom: 20, border: "1px solid #e5e7eb" }}>
                      {/* Header mit Filter */}
                      <div style={{ padding: "8px 14px", borderBottom: "1px solid #e5e7eb", background: "#f9fafb", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: 11, letterSpacing: ".06em", color: "#6b7280", textTransform: "uppercase" }}>
                          Abmessung <span style={{ color: "#9ca3af" }}>· {catalogSizes.length} Größen · {primaries.length} Profile</span>
                        </span>
                        <input
                          className="bl-input"
                          style={{ width: 160, padding: "3px 8px", fontSize: 12 }}
                          placeholder="Profil filtern …"
                          value={sizeQuery}
                          onChange={(e) => { setSizeQuery(e.target.value); setSelectedPrimary(""); }}
                        />
                      </div>

                      {/* Zwei-Spalten-Grid */}
                      <div style={{ display: "grid", gridTemplateColumns: "200px 1fr" }}>
                        {/* Links: Primärmaß-Liste */}
                        <div style={{ borderRight: "1px solid #e5e7eb", maxHeight: 240, overflowY: "auto" }}>
                          {filteredPrimaries.map((p) => (
                            <div
                              key={p}
                              onClick={() => { setSelectedPrimary(p); setSelectedSize(""); }}
                              style={{
                                padding: "7px 14px", cursor: "pointer", fontSize: 12, fontFamily: "monospace",
                                background: selectedPrimary === p ? "#154194" : "transparent",
                                color: selectedPrimary === p ? "#fff" : "#374151",
                                borderBottom: "1px solid #f3f4f6",
                                display: "flex", justifyContent: "space-between",
                              }}
                            >
                              <span>{p}</span>
                              <span style={{ fontSize: 10, opacity: 0.6 }}>{grouped.get(p)!.length}</span>
                            </div>
                          ))}
                        </div>

                        {/* Rechts: Wandstärke / Dicke */}
                        <div>
                          <div style={{ padding: "8px 12px", fontSize: 11, color: "#9ca3af", borderBottom: "1px solid #f3f4f6" }}>
                            {selectedPrimary
                              ? `Wandstärke / Dicke für ${selectedPrimary} (${secondaries.length})`
                              : "← Profil auswählen"}
                          </div>
                          <div style={{ padding: 10, display: "flex", flexWrap: "wrap", gap: 4, maxHeight: 210, overflowY: "auto" }}>
                            {secondaries.map((s) => {
                              const lastIdx = s.lastIndexOf(SEP);
                              const label = lastIdx > 0 ? s.slice(lastIdx + 1) : s;
                              return (
                                <button
                                  key={s}
                                  type="button"
                                  onClick={() => { setSelectedSize(s); setCommodity(`${catalogProduct.nameEn}, ${s}`); }}
                                  style={{ padding: "5px 12px", fontSize: 12, cursor: "pointer", fontFamily: "monospace", border: selectedSize === s ? "1.5px solid #154194" : "1px solid #d1d5db", background: selectedSize === s ? "#154194" : "#fff", color: selectedSize === s ? "#fff" : "#374151" }}
                                >{label}</button>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      {/* Gewählte Abmessung */}
                      {selectedSize && (
                        <div style={{ padding: "6px 14px", borderTop: "1px solid #e5e7eb", background: "#f8faff", fontSize: 12, color: "#154194" }}>
                          Gewählt: <strong style={{ fontFamily: "monospace" }}>{selectedSize}</strong>
                        </div>
                      )}
                    </div>
                  );
                })()}

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
                    <label className="bl-label">Beschreibung *</label>
                    <textarea
                      className="bl-textarea"
                      placeholder="Technische Anforderungen: Oberfläche, Toleranzen, Lieferform (Stab/Ring/Bund/Coil), Stabläge. – Zeugnis: EN 10204 3.1 oder 3.2? – Lieferort: vollständige Adresse. – Verpackung & Kennzeichnung. – Sonstige Bedingungen (Split-Lieferung, Inspektion)."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      maxLength={2000}
                      required
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
                  <div className="bl-form-group full">
                    <label className="bl-label">CBAM-Warengruppe <span>(EU-Verordnung 2023/956, Anhang I)</span></label>
                    <select
                      className="bl-select"
                      value={cbamCategory}
                      onChange={(e) => setCbamCategory(e.target.value as CbamGroupId | "")}
                    >
                      <option value="">— Keine / Nicht CBAM-pflichtig —</option>
                      <optgroup label="Eisen &amp; Stahl">
                        {CBAM_GROUPS.filter(g => g.id.startsWith("STEEL")).map(g => (
                          <option key={g.id} value={g.id}>{g.label} ({g.kn})</option>
                        ))}
                      </optgroup>
                      <optgroup label="Aluminium">
                        {CBAM_GROUPS.filter(g => g.id.startsWith("ALUMINIUM")).map(g => (
                          <option key={g.id} value={g.id}>{g.label} ({g.kn})</option>
                        ))}
                      </optgroup>
                      <optgroup label="Zement">
                        {CBAM_GROUPS.filter(g => g.id.startsWith("CEMENT")).map(g => (
                          <option key={g.id} value={g.id}>{g.label} ({g.kn})</option>
                        ))}
                      </optgroup>
                      <optgroup label="Düngemittel">
                        {CBAM_GROUPS.filter(g => g.id.startsWith("FERTILIZER")).map(g => (
                          <option key={g.id} value={g.id}>{g.label} ({g.kn})</option>
                        ))}
                      </optgroup>
                      <optgroup label="Wasserstoff">
                        {CBAM_GROUPS.filter(g => g.id === "HYDROGEN").map(g => (
                          <option key={g.id} value={g.id}>{g.label} ({g.kn})</option>
                        ))}
                      </optgroup>
                    </select>
                    {cbamCategory && (() => {
                      const grp = CBAM_GROUPS.find(g => g.id === cbamCategory);
                      return grp ? (
                        <span style={{ fontSize: 11, color: "#6b7280", marginTop: 3, display: "block" }}>
                          EU-Standardfaktor: {(grp.factor / 1000).toFixed(3)} t CO₂-Äq./t · Quelle: Anhang VIII VO (EU) 2023/1773
                        </span>
                      ) : null;
                    })()}
                  </div>

                  <div className="bl-form-group">
                    <label className="bl-label">CO₂-Emissionsfaktor <span>(optional, kg CO₂-Äq./t)</span></label>
                    <input
                      className="bl-input"
                      type="number"
                      step="1"
                      min="0"
                      placeholder="Wird aus CBAM-Warengruppe geladen"
                      value={co2PerTonne}
                      onChange={(e) => setCo2PerTonne(e.target.value)}
                    />
                    {co2PerTonne && quantity && (
                      <span style={{ fontSize: 11, color: "#6b7280", marginTop: 3, display: "block" }}>
                        Gesamt: {(parseFloat(co2PerTonne) * parseFloat(quantity)).toLocaleString("de-DE", { maximumFractionDigits: 0 })} kg CO₂-Äq.
                        {" "}für {parseFloat(quantity).toLocaleString("de-DE")} {unit === "TON" ? "t" : unit === "KG" ? "kg" : "Stk"}
                      </span>
                    )}
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
                        <option key={t.code} value={t.code}>{t.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* CBAM-Insights: Einsparpotenzial · Plausibilität · Zertifikatskosten */}
                {cbamCategory && co2PerTonne && (() => {
                  const grp = CBAM_GROUPS.find(g => g.id === cbamCategory);
                  if (!grp) return null;
                  const entered  = parseFloat(co2PerTonne);
                  if (!entered || entered <= 0) return null;
                  const std      = grp.factor;                   // kg/t EU-Standard
                  const rawQty   = parseFloat(quantity) || 0;
                  const qtyTon   = unit === "TON" ? rawQty : unit === "KG" ? rawQty / 1000 : rawQty;
                  const ETS      = 75;                           // €/t CO₂ — EU-ETS-Schätzpreis 2026
                  const diff     = std - entered;                // positiv = Einsparung ggü. EU-Standard
                  const diffPct  = (diff / std) * 100;
                  const isSaving   = diff > 0;
                  const isCritical = diff > std * 0.5;           // >50 % unter EU-Standard → Plausibilitätsprüfung
                  const totalCO2t  = (entered / 1000) * qtyTon; // t CO₂ beim deklarierten Faktor
                  const euCO2t     = (std    / 1000) * qtyTon;  // t CO₂ beim EU-Standard
                  const cbamCost   = totalCO2t * ETS;
                  const cbamSaving = (euCO2t - totalCO2t) * ETS;

                  return (
                    <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>

                      {/* 1 — Grünes Einsparpotenzial-Badge */}
                      {isSaving && qtyTon > 0 && (
                        <div style={{ background: "#f0fdf4", border: "1px solid #16a34a", borderRadius: 6, padding: "10px 14px", display: "flex", alignItems: "flex-start", gap: 10 }}>
                          <span style={{ fontSize: 16, lineHeight: 1 }}>🌱</span>
                          <div style={{ fontSize: 12, color: "#14532d", lineHeight: 1.6 }}>
                            <strong>Einsparung gegenüber EU-Standard:</strong>{" "}
                            −{(diff * qtyTon / 1000).toFixed(1)} t CO₂ (−{diffPct.toFixed(1)} %) ·{" "}
                            CBAM-Kostenvorteil: ~{cbamSaving.toLocaleString("de-DE", { maximumFractionDigits: 0 })} € ·{" "}
                            <strong>Starkes Verkaufsargument!</strong>
                          </div>
                        </div>
                      )}

                      {/* 2 — Gelber Plausibilitäts-Warn-Indikator */}
                      {isCritical && (
                        <div style={{ background: "#fffbeb", border: "1px solid #d97706", borderRadius: 6, padding: "10px 14px", display: "flex", alignItems: "flex-start", gap: 10 }}>
                          <span style={{ fontSize: 16, lineHeight: 1 }}>⚠️</span>
                          <div style={{ fontSize: 12, color: "#92400e", lineHeight: 1.6 }}>
                            <strong>Plausibilitätshinweis:</strong> Der eingegebene Wert liegt mehr als 50 % unter dem EU-Standard
                            ({(std / 1000).toFixed(3)} t CO₂/t). Bitte stellen Sie sicher, dass das Werkszeugnis
                            (EN 10204 3.1) diesen Wert zweifelsfrei belegt. Abweichungen ohne Nachweis können bei der
                            CBAM-Zollerklärung zu Nachforderungen führen.
                          </div>
                        </div>
                      )}

                      {/* 3 — CBAM-Zertifikatkosten-Rechner */}
                      {qtyTon > 0 && (
                        <div style={{ background: "#eff6ff", border: "1px solid #93c5fd", borderRadius: 6, padding: "10px 14px", fontSize: 12, color: "#1e3a5f", lineHeight: 1.7 }}>
                          <strong>Geschätzte CBAM-Zertifikatkosten für diesen Deal</strong><br />
                          {totalCO2t.toFixed(2)} t CO₂ × {ETS} €/t (EU-ETS){" "}
                          = <strong>~{cbamCost.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €</strong>
                          {isSaving && (
                            <>{" "}· Einsparung vs. EU-Standard:{" "}
                              <strong style={{ color: "#15803d" }}>
                                −{cbamSaving.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
                              </strong>
                            </>
                          )}
                          <br />
                          <span style={{ color: "#6b7280", fontSize: 11 }}>
                            Schätzung auf Basis EU-ETS {ETS} €/t CO₂ (Indikativpreis 2026). Kein rechtsverbindlicher Wert —
                            tatsächliche Kosten hängen von freien ETS-Zertifikaten und dem Tagespreismarkt ab.
                          </span>
                        </div>
                      )}

                    </div>
                  );
                })()}

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
                    <label className="bl-label">Max. Lieferzeit *</label>
                    <input
                      className="bl-input"
                      type="text"
                      placeholder="z.B. max. 6 Wochen ab Zuschlag"
                      value={deliveryPeriod}
                      onChange={(e) => setDeliveryPeriod(e.target.value)}
                      required
                    />
                  </div>

                  <div className="bl-form-group">
                    <label className="bl-label">Lieferort *</label>
                    <input
                      className="bl-input"
                      type="text"
                      placeholder="z.B. Musterstraße 12, 10115 Berlin, Deutschland"
                      value={deliveryLocation}
                      onChange={(e) => setDeliveryLocation(e.target.value)}
                      required
                    />
                  </div>

                  <div className="bl-form-group">
                    <label className="bl-label">Zahlungsbedingungen *</label>
                    <select
                      className="bl-select"
                      value={paymentTerms}
                      onChange={(e) => setPaymentTerms(e.target.value)}
                      required
                    >
                      <option value="">— Bitte wählen —</option>
                      <option value="Vorkasse 100 % vor Lieferung">Vorkasse — 100 % vor Lieferung</option>
                      <option value="Anzahlung 10 % bei Zuschlag, Rest bei Lieferung">Anzahlung 10 % bei Zuschlag, Rest bei Lieferung</option>
                      <option value="Anzahlung 25 % bei Zuschlag, Rest bei Lieferung">Anzahlung 25 % bei Zuschlag, Rest bei Lieferung</option>
                      <option value="Anzahlung 50 % bei Zuschlag, Rest bei Lieferung">Anzahlung 50 % bei Zuschlag, Rest bei Lieferung</option>
                      <option value="14 Tage netto nach Lieferung">14 Tage netto nach Lieferung</option>
                      <option value="30 Tage netto nach Lieferung">30 Tage netto nach Lieferung</option>
                      <option value="60 Tage netto nach Lieferung">60 Tage netto nach Lieferung</option>
                      <option value="90 Tage netto nach Lieferung">90 Tage netto nach Lieferung</option>
                    </select>
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
              <table className="bl-table" style={{ tableLayout: "fixed", width: "100%" }}>
                <colgroup>
                  <col style={{ width: "34%" }} />
                  <col style={{ width: "11%" }} />
                  <col style={{ width: "13%" }} />
                  <col style={{ width: "18%" }} />
                  <col style={{ width: "12%" }} />
                  <col style={{ width: "12%" }} />
                </colgroup>
                <thead>
                  <tr>
                    <th>Ware</th>
                    <th>Menge</th>
                    <th>Status</th>
                    <th>Preis / Ergebnis</th>
                    <th>Auktionsende</th>
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
                        {/* Ware */}
                        <td>
                          <div style={{ fontWeight: 600, color: "#111827", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {lot.commodity}
                          </div>
                          {lot.qualityGrade && (
                            <div style={{ fontSize: 10.5, color: "#6b7280", marginTop: 2, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {lot.qualityGrade}
                            </div>
                          )}
                          {lot.hsCode && (
                            <div style={{ fontSize: 10, color: "#9ca3af", fontFamily: "'IBM Plex Mono',monospace" }}>
                              HS {lot.hsCode}
                            </div>
                          )}
                        </td>
                        {/* Menge */}
                        <td style={{ fontSize: 12.5, color: "#374151", whiteSpace: "nowrap" }}>
                          {Number(lot.quantity).toLocaleString("de-DE")} {lot.unit}
                        </td>
                        {/* Status + Bieter */}
                        <td>
                          <span className="bl-phase" style={{ background: PHASE_COLOR[lot.phase] }}>
                            {PHASE_LABEL[lot.phase]}
                          </span>
                          <div style={{ fontSize: 10.5, color: "#9ca3af", marginTop: 5, lineHeight: 1.4 }}>
                            {lot._count.registrations} angemeldet<br />
                            {lot._count.bids} Gebote
                          </div>
                        </td>
                        {/* Preis / Ergebnis */}
                        <td style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12 }}>
                          {lot.startPrice && (
                            <div style={{ color: "#9ca3af", fontSize: 10.5, marginBottom: 2 }}>
                              Max: {fmtEur(lot.startPrice)}
                            </div>
                          )}
                          {lot.phase === "CONCLUSION" ? (
                            lot.winnerId ? (
                              <div>
                                <span className="bl-winner">✓ Zuschlag</span>
                                {lot.currentBest && (
                                  <div style={{ marginTop: 3, color: "#14532d", fontWeight: 700, fontSize: 12 }}>
                                    {fmtEur(lot.currentBest)}
                                    {savings !== null && savings > 0 && (
                                      <div style={{ fontSize: 10, color: "#16a34a" }}>−{fmtEur(String(savings))}</div>
                                    )}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span className="bl-no-winner">Kein Gewinner</span>
                            )
                          ) : lot.currentBest ? (
                            <div>
                              <strong style={{ color: "#16a34a", fontSize: 12.5 }}>{fmtEur(lot.currentBest)}</strong>
                              {savings !== null && savings > 0 && (
                                <div style={{ fontSize: 10, color: "#16a34a" }}>−{fmtEur(String(savings))}</div>
                              )}
                            </div>
                          ) : (
                            <span style={{ color: "#d1d5db" }}>—</span>
                          )}
                        </td>
                        {/* Auktionsende */}
                        <td style={{ fontSize: 11.5, color: "#6b7280" }}>
                          {lot.auctionEnd ? fmtDate(lot.auctionEnd) : "—"}
                        </td>
                        {/* Aktion */}
                        <td style={{ whiteSpace: "nowrap" }}>
                          {lot.phase === "COLLECTION" && (
                            <button
                              className="bl-btn-open"
                              disabled={opening === lot.id || lot._count.registrations === 0}
                              onClick={() => openingLotId === lot.id ? setOpeningLotId(null) : requestOpenLot(lot.id)}
                              title={lot._count.registrations === 0 ? "Warten auf Verkäufer-Registrierungen" : nextSlotStartLabel()}
                              style={{ fontSize: 11, whiteSpace: "nowrap" }}
                            >
                              {opening === lot.id ? "…" : nextSlotStartLabel()}
                            </button>
                          )}
                          {(lot.phase === "PROPOSAL" || lot.phase === "REDUCTION") && (
                            <a href={`/dashboard/buyer/auction/${lot.id}`} className="bl-btn-watch">
                              Live →
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
