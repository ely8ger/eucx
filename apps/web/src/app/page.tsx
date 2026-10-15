import type { Metadata } from "next";
import Link from "next/link";
import {
  ShieldCheck, TrendingUp, FileText, Users,
  ArrowRight, BarChart3, Layers, Lock,
  Globe, Building2, FlaskConical,
  Package2, UserCheck, Activity, Gavel,
} from "lucide-react";
import { EucxLogo }  from "@/components/logo/EucxLogo";
import { SiteNav }   from "@/components/SiteNav";
import { tServer }   from "@/lib/i18n/server";
import { BASE_URL, buildAlternateLanguages } from "@/lib/seo/metadata";
import { db }        from "@/lib/db/client";
import Decimal       from "decimal.js";

// ── Page-spezifische Metadata ─────────────────────────────────────────────────
export function generateMetadata(): Metadata {
  return {
    title:       "EUCX — Europäische Rohstoffbörse für B2B-Rohstoffhandel",
    description: "Regulierter B2B-Marktplatz für Metalle, Stahl, Dünger und Agrarprodukte in der EU. KYC-verifizierte Händler, transparentes Orderbuch, DSGVO-konform.",
    alternates:  buildAlternateLanguages("/"),
    openGraph: {
      title:       "EUCX — European Union Commodity Exchange",
      description: "Institutioneller B2B-Rohstoffhandel: Metalle, Stahl, Dünger, Agrar. Reguliertes Orderbuch, sofortige Clearing-Abwicklung.",
      url:         BASE_URL,
      images: [
        { url: `/api/og?symbol=EUCX%20Exchange`, width: 1200, height: 630, alt: "EUCX — European Union Commodity Exchange" },
      ],
    },
  };
}


// ── Styles ────────────────────────────────────────────────────────────────────
const S: Record<string, React.CSSProperties> = {
  label: { fontSize: 11, fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase" as const, color: "#154194", marginBottom: 10, display: "block" },
  h2:    { fontSize: 34, fontWeight: 300, color: "#1a1a1a", lineHeight: 1.2, margin: 0 },
  body:  { fontSize: 15, color: "#505050", lineHeight: 1.7 },
};

// ── Echtzeit-KPIs aus der DB ──────────────────────────────────────────────────
export const revalidate = 300; // alle 5 Minuten neu berechnen

async function fetchStats() {
  try {
    const [memberCount, contractCount, volumeAgg, concludedCount, totalCount] = await Promise.all([
      db.organization.count({ where: { isVerified: true } }),
      db.lotContract.count(),
      db.lotContract.aggregate({ _sum: { totalValue: true } }),
      db.lot.count({ where: { phase: "CONCLUSION" } }),
      db.lot.count({ where: { isDraft: false } }),
    ]);

    const totalValue = new Decimal(volumeAgg._sum.totalValue?.toString() ?? "0");
    const volumeStr  = totalValue.gte(1_000_000_000)
      ? `${totalValue.div(1_000_000_000).toDecimalPlaces(1).toString()} Mrd.`
      : totalValue.gte(1_000_000)
      ? `${totalValue.div(1_000_000).toDecimalPlaces(1).toString()} Mio.`
      : totalValue.gt(0)
      ? `${totalValue.toDecimalPlaces(0).toString()} €`
      : "—";

    const execRate = totalCount > 0
      ? `${(concludedCount / totalCount * 100).toFixed(1)} %`
      : "—";

    return { memberCount, contractCount, volumeStr, execRate };
  } catch {
    return { memberCount: 0, contractCount: 0, volumeStr: "—", execRate: "—" };
  }
}

async function fetchMarketActivity() {
  try {
    const since7d = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const today0  = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());

    const [activeAuctions, tradeCount7d, volumeAgg7d, completedToday, activeLots] = await Promise.all([
      db.lot.count({ where: { phase: "PROPOSAL", isDraft: false } }),
      db.lotContract.count({ where: { createdAt: { gte: since7d } } }),
      db.lotContract.aggregate({ _sum: { totalValue: true }, where: { createdAt: { gte: since7d } } }),
      db.lot.count({ where: { phase: "CONCLUSION", lockedAt: { gte: today0 } } }),
      db.lot.findMany({
        where:  { phase: "PROPOSAL", isDraft: false },
        select: { cbamCategory: true },
      }),
    ]);

    const totalValue7d = new Decimal(volumeAgg7d._sum.totalValue?.toString() ?? "0");
    const volume7dStr  = totalValue7d.gte(1_000_000)
      ? `${totalValue7d.div(1_000_000).toDecimalPlaces(1)} Mio. €`
      : totalValue7d.gt(0)
      ? `${totalValue7d.toDecimalPlaces(0)} €`
      : "0 €";

    const categoryActivity: Record<string, number> = {};
    for (const lot of activeLots) {
      const cat = lot.cbamCategory ?? null;
      const label = cat?.startsWith("STEEL_")      ? "Metalle & Stahl"
                  : cat?.startsWith("ALUMINIUM_")  ? "Aluminium"
                  : cat?.startsWith("FERTILIZER_") ? "Dünger"
                  : cat?.startsWith("CEMENT_")     ? "Zement"
                  : cat === "HYDROGEN"              ? "Wasserstoff"
                  : "Sonstige";
      categoryActivity[label] = (categoryActivity[label] ?? 0) + 1;
    }

    return { activeAuctions, tradeCount7d, volume7dStr, completedToday, categoryActivity };
  } catch {
    return { activeAuctions: 0, tradeCount7d: 0, volume7dStr: "—", completedToday: 0, categoryActivity: {} };
  }
}

export default async function HomePage() {
  const t        = tServer;
  const stats    = await fetchStats();
  const market   = await fetchMarketActivity();

  return (
    <div style={{ fontFamily: "'IBM Plex Sans', Arial, sans-serif", backgroundColor: "#fff", color: "#1a1a1a" }}>

      <SiteNav rootPage />

      {/* ── Hero ── */}
      <section className="r-section-hero" style={{ backgroundColor: "#0b1e36" }}>
        <div className="r-container">
          <div className="inline-flex items-center gap-3" style={{
            border: "1px solid rgba(52,211,153,.35)",
            backgroundColor: "rgba(52,211,153,.07)",
            padding: "8px 18px",
            marginBottom: 32,
          }}>
            <span style={{
              width: 9, height: 9, backgroundColor: "#34d399", display: "inline-block", borderRadius: "50%",
              boxShadow: "0 0 0 3px rgba(52,211,153,.25)", flexShrink: 0,
            }} />
            <span style={{ fontSize: 14, fontWeight: 600, color: "#34d399", letterSpacing: "0.02em" }}>
              {t("hero_trading_hours")}
            </span>
            <span style={{ width: 1, height: 14, backgroundColor: "rgba(255,255,255,.15)", flexShrink: 0 }} />
            <span style={{ fontSize: 12, color: "rgba(255,255,255,.45)", letterSpacing: "0.02em" }}>
              {t("hero_trading_hours_hint")}
            </span>
          </div>

          <h1 className="r-hero-h1">{t("hero_h1")}</h1>
          <p className="r-hero-sub">{t("hero_sub")}</p>

          <div className="flex flex-wrap gap-4">
            <Link href="/register" className="hp-cta-primary"
              style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 14, fontWeight: 600, color: "#154194", padding: "13px 28px", textDecoration: "none" }}>
              {t("hero_cta_portal")} <ArrowRight size={15} />
            </Link>
            <a href="#wie-es-funktioniert" className="hp-cta-ghost"
              style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 14, fontWeight: 500, color: "rgba(255,255,255,.8)", border: "1px solid rgba(255,255,255,.2)", padding: "13px 28px", textDecoration: "none" }}>
              {t("hero_cta_more")}
            </a>
          </div>

          <div className="flex flex-wrap gap-6" style={{ marginTop: 48, paddingTop: 36, borderTop: "1px solid rgba(255,255,255,.08)" }}>
            {([
              { icon: Package2,  key: "hero_bafin" as const },
              { icon: Lock,      key: "hero_eu"    as const },
              { icon: UserCheck, key: "hero_iso"   as const },
              { icon: FileText,  key: "hero_dsgvo" as const },
            ]).map(({ icon: Icon, key }) => (
              <div key={key} className="flex items-center gap-2" style={{ fontSize: 13, color: "rgba(255,255,255,.35)" }}>
                <Icon size={14} /> {t(key)}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Statistiken ── */}
      <section style={{ borderBottom: "1px solid #e8e8e8" }}>
        <div className="r-container">
          <div className="r-grid-4">
            {([
              { v: stats.volumeStr,                    l: t("stat_volume_l"),  s: t("stat_volume_s")  },
              { v: stats.memberCount > 0 ? `${stats.memberCount}` : "—", l: t("stat_members_l"), s: t("stat_members_s") },
              { v: "2",                                l: t("stat_sectors_l"), s: t("stat_sectors_s") },
              { v: stats.execRate,                     l: t("stat_exec_l"),    s: t("stat_exec_s")    },
            ]).map(({ v, l, s }, i) => (
              <div key={l} className={i > 0 ? "r-stat-item" : ""}
                style={{ padding: "36px 0", borderLeft: i > 0 ? "1px solid #e8e8e8" : "none", paddingLeft: i > 0 ? 32 : 0 }}>
                <div style={{ fontSize: 32, fontWeight: 300, color: "#154194", lineHeight: 1 }}>{v}</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#1a1a1a", marginTop: 8 }}>{l}</div>
                <div style={{ fontSize: 12, color: "#aaa", marginTop: 4 }}>{s}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Marktaktivität ── */}
      <section style={{ backgroundColor: "#fff", borderBottom: "1px solid #e8e8e8" }}>
        <div className="r-container" style={{ paddingTop: 40, paddingBottom: 40 }}>
          <div className="flex items-center gap-3" style={{ marginBottom: 28 }}>
            <Activity size={16} style={{ color: "#154194" }} />
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase" as const, color: "#154194" }}>Marktaktivität</span>
            <span style={{ flex: 1, height: 1, backgroundColor: "#e8e8e8" }} />
            <span style={{ fontSize: 11, color: "#aaa" }}>letzte 7 Tage</span>
          </div>
          <div className="r-grid-3" style={{ gap: 0 }}>
            {([
              {
                icon: <Gavel size={20} style={{ color: "#154194" }} />,
                value: market.activeAuctions > 0 ? `${market.activeAuctions}` : "—",
                label: "Aktive Ausschreibungen",
                sub:   "Gebote jetzt möglich",
              },
              {
                icon: <BarChart3 size={20} style={{ color: "#154194" }} />,
                value: market.tradeCount7d > 0 ? `${market.tradeCount7d}` : "—",
                label: "Abgeschlossene Transaktionen",
                sub:   "Letzte 7 Tage",
              },
              {
                icon: <TrendingUp size={20} style={{ color: "#154194" }} />,
                value: market.volume7dStr,
                label: "Handelsvolumen",
                sub:   "Gesamtwert, letzte 7 Tage",
              },
            ]).map(({ icon, value, label, sub }, i) => (
              <div key={label} style={{
                padding: "28px 32px",
                borderLeft: i > 0 ? "1px solid #e8e8e8" : "none",
              }}>
                <div style={{ marginBottom: 14 }}>{icon}</div>
                <div style={{ fontSize: 28, fontWeight: 300, color: "#154194", lineHeight: 1, marginBottom: 8 }}>{value}</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#1a1a1a", marginBottom: 4 }}>{label}</div>
                <div style={{ fontSize: 12, color: "#aaa" }}>{sub}</div>
              </div>
            ))}
          </div>

          {Object.keys(market.categoryActivity).length > 0 && (
            <div className="flex flex-wrap gap-2" style={{ marginTop: 24, paddingTop: 20, borderTop: "1px solid #f0f0f0" }}>
              <span style={{ fontSize: 11, color: "#aaa", marginRight: 4, alignSelf: "center" }}>Aktiv:</span>
              {Object.entries(market.categoryActivity).map(([cat, count]) => (
                <span key={cat} style={{
                  fontSize: 12, fontWeight: 600, color: "#154194",
                  backgroundColor: "#eef2fb", padding: "4px 12px",
                  display: "inline-flex", alignItems: "center", gap: 6,
                }}>
                  {cat}
                  <span style={{ fontSize: 11, fontWeight: 700, backgroundColor: "#154194", color: "#fff", borderRadius: "50%", width: 18, height: 18, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>{count}</span>
                </span>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Marktbereiche ── */}
      <section id="marktbereiche" className="r-section-lg" style={{ backgroundColor: "#f7f7f7" }}>
        <div className="r-container">
          <span style={S.label}>{t("section_markets_label")}</span>
          <div className="flex flex-wrap items-end justify-between" style={{ marginBottom: 36, gap: 16 }}>
            <h2 style={S.h2}>{t("section_markets_h2")}</h2>
            <p style={{ ...S.body, maxWidth: 420, margin: 0 }}>{t("section_markets_sub")}</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 1, backgroundColor: "#e0e0e0" }}>

            {/* Metalle */}
            <Link href="/katalog" style={{ textDecoration: "none" }}>
              <div className="hp-market-card" style={{ padding: "32px 28px", cursor: "pointer", height: "100%" }}>
                <div style={{ borderLeft: "3px solid #154194", paddingLeft: 12, marginBottom: 20, display: "inline-block" }}>
                  <TrendingUp size={20} style={{ color: "#154194", display: "block" }} />
                </div>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "#154194", marginBottom: 8 }}>{t("sector_metalle")}</div>
                <div style={{ fontSize: 16, fontWeight: 600, color: "#1a1a1a", marginBottom: 4 }}>{t("metalle_title")}</div>
                <div style={{ fontSize: 12, color: "#888", marginBottom: 16 }}>{t("metalle_home_sub")}</div>
                <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                  {[t("metalle_li_1"), t("metalle_li_2"), t("metalle_li_3"), t("metalle_li_4")].map(item => (
                    <li key={item} style={{ fontSize: 13, color: "#444", padding: "7px 0", borderBottom: "1px solid #f0f0f0", display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ width: 4, height: 4, backgroundColor: "#154194", display: "inline-block", flexShrink: 0 }} />
                      {item}
                    </li>
                  ))}
                </ul>
                <div style={{ marginTop: 20, fontSize: 13, color: "#154194", fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>
                  {t("btn_catalog_open")}
                </div>
              </div>
            </Link>

            {/* Dünger */}
            <Link href="/duenger" style={{ textDecoration: "none" }}>
              <div className="hp-market-card" style={{ padding: "32px 28px", cursor: "pointer" }}>
                <div style={{ borderLeft: "3px solid #154194", paddingLeft: 12, marginBottom: 20, display: "inline-block" }}>
                  <FlaskConical size={20} style={{ color: "#154194", display: "block" }} />
                </div>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "#154194", marginBottom: 8 }}>{t("sector_duenger")}</div>
                <div style={{ fontSize: 16, fontWeight: 600, color: "#1a1a1a", marginBottom: 4 }}>{t("duenger_title")}</div>
                <div style={{ fontSize: 12, color: "#888", marginBottom: 16 }}>{t("duenger_home_sub")}</div>
                <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                  {[t("duenger_li_1"), t("duenger_li_2"), t("duenger_li_3"), t("duenger_li_4")].map(item => (
                    <li key={item} style={{ fontSize: 13, color: "#444", padding: "7px 0", borderBottom: "1px solid #f0f0f0", display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ width: 4, height: 4, backgroundColor: "#154194", display: "inline-block", flexShrink: 0 }} />
                      {item}
                    </li>
                  ))}
                </ul>
                <div style={{ marginTop: 20, fontSize: 13, color: "#154194", fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>
                  {t("btn_catalog_open")}
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Dual Value Prop ── */}
      <section className="r-section-lg" style={{ backgroundColor: "#fff", borderTop: "1px solid #e8e8e8" }}>
        <div className="r-container">
          <span style={S.label}>Für wen ist EUCX?</span>
          <h2 style={{ ...S.h2, marginBottom: 48 }}>Zwei Seiten. Eine Plattform.</h2>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1, backgroundColor: "#e0e0e0" }}>

            {/* Käufer */}
            <div style={{ backgroundColor: "#fff", padding: "44px 40px" }}>
              <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase" as const, color: "#154194", marginBottom: 6, display: "block" }}>Für Käufer</span>
              <h3 style={{ fontSize: 20, fontWeight: 600, color: "#1a1a1a", lineHeight: 1.3, margin: "0 0 8px" }}>Sie kaufen Rohstoffe im B2B-Markt.</h3>
              <p style={{ fontSize: 13, color: "#505050", lineHeight: 1.65, margin: "0 0 32px", paddingBottom: 28, borderBottom: "1px solid #e0e0e0" }}>
                <strong style={{ fontWeight: 600, color: "#1a1a1a" }}>Das Problem:</strong> Intransparente Preise, unbekannte Lieferanten, manuelle Vertragsabwicklung — jeder Einkauf ist ein Risiko.
              </p>
              <ul style={{ listStyle: "none", padding: 0, margin: "0 0 36px", display: "flex", flexDirection: "column" as const }}>
                {([
                  { title: "Echtzeit-Preistransparenz",      desc: "Reguliertes Orderbuch — Bid/Ask jederzeit einsehbar, keine versteckten Margen." },
                  { title: "KYC-verifizierte Lieferanten",   desc: "Alle Gegenparteien durchlaufen vollständige Identitäts- und Compliance-Prüfung." },
                  { title: "Strukturierter Handelsabschluss",desc: "Jede Transaktion läuft über das regulierte EUCX-Framework — verbindlich und rechtssicher." },
                  { title: "Digitale Vertragsdokumentation", desc: "Alle Handelsdokumente automatisch erstellt, archiviert und DSGVO-konform gespeichert." },
                ]).map(({ title, desc }) => (
                  <li key={title} style={{ display: "flex", alignItems: "flex-start", gap: 14, padding: "14px 0", borderBottom: "1px solid #f0f0f0" }}>
                    <div style={{ width: 32, height: 32, flexShrink: 0, backgroundColor: "#eef2fb", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="#154194" strokeWidth="1.5"><polyline points="1,7 5,11 13,3"/></svg>
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "#1a1a1a", marginBottom: 2 }}>{title}</div>
                      <div style={{ fontSize: 12, color: "#888", lineHeight: 1.6 }}>{desc}</div>
                    </div>
                  </li>
                ))}
              </ul>
              <Link href="/register?role=buyer" style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 600, color: "#fff", backgroundColor: "#154194", padding: "12px 24px", textDecoration: "none" }}>
                Als Käufer registrieren <ArrowRight size={13} />
              </Link>
            </div>

            {/* Verkäufer */}
            <div style={{ backgroundColor: "#0b1e36", padding: "44px 40px" }}>
              <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase" as const, color: "rgba(255,255,255,.35)", marginBottom: 6, display: "block" }}>Für Verkäufer</span>
              <h3 style={{ fontSize: 20, fontWeight: 600, color: "#fff", lineHeight: 1.3, margin: "0 0 8px" }}>Sie verkaufen Rohstoffe in die EU.</h3>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,.45)", lineHeight: 1.65, margin: "0 0 32px", paddingBottom: 28, borderBottom: "1px solid rgba(255,255,255,.1)" }}>
                <strong style={{ fontWeight: 600, color: "rgba(255,255,255,.85)" }}>Das Problem:</strong> Käufer finden, Zahlungsausfälle abfedern, Compliance-Anforderungen erfüllen — auf eigene Kosten und eigenes Risiko.
              </p>
              <ul style={{ listStyle: "none", padding: 0, margin: "0 0 36px", display: "flex", flexDirection: "column" as const }}>
                {([
                  { title: "EU-weites Käufernetz",          desc: "Sofortiger Zugang zu KYC-verifizierten institutionellen Käufern aus der gesamten EU." },
                  { title: "Nur verifizierte Gegenparteien",desc: "Alle Käufer durchlaufen KYC und Bonitätsprüfung — kein Handel mit unbekannten Parteien." },
                  { title: "Compliance out-of-the-box",     desc: "MiFID II, BaFin-Regulierung, DSGVO — die Plattform trägt den regulatorischen Aufwand." },
                  { title: "Digitale Vertragsabwicklung",   desc: "Automatische Rechnungsstellung und Handelsdokumentation auf einer Plattform." },
                ]).map(({ title, desc }) => (
                  <li key={title} style={{ display: "flex", alignItems: "flex-start", gap: 14, padding: "14px 0", borderBottom: "1px solid rgba(255,255,255,.08)" }}>
                    <div style={{ width: 32, height: 32, flexShrink: 0, backgroundColor: "rgba(255,255,255,.08)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="rgba(255,255,255,.7)" strokeWidth="1.5"><polyline points="1,7 5,11 13,3"/></svg>
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "#fff", marginBottom: 2 }}>{title}</div>
                      <div style={{ fontSize: 12, color: "rgba(255,255,255,.4)", lineHeight: 1.6 }}>{desc}</div>
                    </div>
                  </li>
                ))}
              </ul>
              <Link href="/register?role=seller" style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 600, color: "#154194", backgroundColor: "#fff", padding: "12px 24px", textDecoration: "none" }}>
                Als Verkäufer starten <ArrowRight size={13} />
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* ── Prozess ── */}
      <section id="wie-es-funktioniert" className="r-section-lg" style={{ backgroundColor: "#fff" }}>
        <div className="r-container">
          <span style={S.label}>{t("section_process_label")}</span>
          <h2 style={{ ...S.h2, marginBottom: 48 }}>{t("section_process_h2")}</h2>
          <div className="r-grid-4" style={{ borderTop: "3px solid #154194" }}>
            {([
              { step: "01", Icon: Users,       tk: "step1" },
              { step: "02", Icon: FileText,    tk: "step2" },
              { step: "03", Icon: BarChart3,   tk: "step3" },
              { step: "04", Icon: ShieldCheck, tk: "step4" },
            ] as const).map(({ step, Icon, tk }, i) => (
              <div key={step} className={i > 0 ? "r-process-item" : ""}
                style={{ padding: "36px 32px 36px 0", paddingLeft: i > 0 ? 32 : 0, borderLeft: i > 0 ? "1px solid #e8e8e8" : "none" }}>
                <div style={{ width: 44, height: 44, backgroundColor: "#154194", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
                  <Icon size={18} color="#fff" />
                </div>
                <div style={{ fontSize: 10, fontWeight: 700, color: "#154194", letterSpacing: "0.14em", marginBottom: 10 }}>{t("step_prefix")} {step}</div>
                <div style={{ fontSize: 15, fontWeight: 600, color: "#1a1a1a", marginBottom: 10 }}>{t(`${tk}_title` as Parameters<typeof t>[0])}</div>
                <div style={{ fontSize: 13, color: "#505050", lineHeight: 1.7 }}>{t(`${tk}_desc` as Parameters<typeof t>[0])}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Plattform ── */}
      <section className="r-section-lg" style={{ backgroundColor: "#f7f7f7" }}>
        <div className="r-container">
          <div className="r-grid-2">
            <div style={{ backgroundColor: "#1e3a5f", padding: "48px 40px", color: "#fff" }}>
              <span style={{ ...S.label, color: "rgba(255,255,255,.4)" }}>{t("platform_label")}</span>
              <h2 style={{ fontSize: 26, fontWeight: 300, lineHeight: 1.3, color: "#fff", margin: "0 0 20px" }}>{t("platform_h2")}</h2>
              <p style={{ fontSize: 14, color: "rgba(255,255,255,.55)", lineHeight: 1.8, marginBottom: 32 }}>{t("platform_sub")}</p>
              {([
                { Icon: Layers,      tk: "platform_ob"       },
                { Icon: ShieldCheck, tk: "platform_clearing" },
                { Icon: BarChart3,   tk: "platform_data"     },
                { Icon: Building2,   tk: "platform_kyc"      },
              ] as const).map(({ Icon, tk }) => (
                <div key={tk} className="flex items-start gap-4" style={{ borderTop: "1px solid rgba(255,255,255,.1)", paddingTop: 16, marginTop: 16 }}>
                  <Icon size={16} style={{ color: "rgba(255,255,255,.4)", marginTop: 2, flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "#fff" }}>{t(tk)}</div>
                    <div style={{ fontSize: 12, color: "rgba(255,255,255,.45)", marginTop: 3 }}>{t(`${tk}_desc` as Parameters<typeof t>[0])}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Orderbuch-Mockup */}
            <div style={{ backgroundColor: "#fff", boxShadow: "0 2px 16px rgba(0,0,0,.1)" }}>
              <div style={{ backgroundColor: "#154194", padding: "12px 20px" }}>
                <span style={{ fontSize: 12, color: "rgba(255,255,255,.6)" }}>{t("demo_session")}</span>
              </div>
              <div style={{ padding: 24 }}>
                <div className="flex items-start justify-between" style={{ marginBottom: 20, paddingBottom: 16, borderBottom: "1px solid #f0f0f0" }}>
                  <div>
                    <div style={{ fontSize: 11, color: "#aaa", textTransform: "uppercase", letterSpacing: "0.1em" }}>Bewehrungsstahl A1 · 12mm</div>
                    <div style={{ fontSize: 28, fontWeight: 300, color: "#0b1e36", marginTop: 4 }}>587,00 EUR <span style={{ fontSize: 13, color: "#aaa" }}>/ t</span></div>
                  </div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: "#1a7a3c", backgroundColor: "#f0faf4", padding: "4px 12px", border: "1px solid #c3e6cb" }}>{t("trading_stage_open")}</div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, fontSize: 12 }}>
                  {[
                    { label: t("trading_sell_pct"), color: "#b91c1c", rows: [["592,00","30 t"],["590,50","15 t"],["589,00","50 t"]] },
                    { label: t("trading_buy_pct"),  color: "#15803d", rows: [["587,00","25 t"],["586,50","40 t"],["585,00","60 t"]] },
                  ].map(({ label, color, rows }) => (
                    <div key={label}>
                      <div style={{ fontWeight: 600, color, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10, fontSize: 11 }}>{label}</div>
                      {rows.map(([p, q]) => (
                        <div key={p} className="flex justify-between" style={{ padding: "5px 0", borderBottom: "1px solid #f7f7f7" }}>
                          <span style={{ color, fontFamily: "monospace", fontWeight: 500 }}>{p}</span>
                          <span style={{ color: "#aaa" }}>{q}</span>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Regulierung ── */}
      <section id="regulierung" className="r-section-lg" style={{ backgroundColor: "#fff" }}>
        <div className="r-container">
          <span style={S.label}>{t("section_reg_label")}</span>
          <h2 style={{ ...S.h2, marginBottom: 40 }}>{t("section_reg_h2")}</h2>
          <div className="r-grid-3">
            {([
              { Icon: ShieldCheck, tk: "reg1" },
              { Icon: Lock,        tk: "reg2" },
              { Icon: Globe,       tk: "reg3" },
            ] as const).map(({ Icon, tk }) => (
              <div key={tk} style={{ backgroundColor: "#fff", padding: "40px 36px" }}>
                <div style={{ width: 44, height: 44, backgroundColor: "#f0f4ff", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
                  <Icon size={20} style={{ color: "#154194" }} />
                </div>
                <div style={{ fontSize: 15, fontWeight: 600, color: "#1a1a1a", marginBottom: 12, lineHeight: 1.4 }}>{t(`${tk}_title` as Parameters<typeof t>[0])}</div>
                <div style={{ fontSize: 13, color: "#505050", lineHeight: 1.75 }}>{t(`${tk}_desc` as Parameters<typeof t>[0])}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section id="teilnehmer" className="r-section-lg" style={{ backgroundColor: "#0b1e36" }}>
        <div className="r-container">
          <div style={{ maxWidth: 600 }}>
            <span style={{ ...S.label, color: "rgba(255,255,255,.35)" }}>{t("cta_label")}</span>
            <h2 style={{ fontSize: 32, fontWeight: 300, color: "#fff", lineHeight: 1.2, margin: "0 0 20px" }}>{t("cta_h2")}</h2>
            <p style={{ fontSize: 15, color: "rgba(255,255,255,.5)", lineHeight: 1.8, marginBottom: 36 }}>{t("cta_sub")}</p>
            <div className="flex flex-wrap gap-4">
              <Link href="/register" className="hp-cta-dark"
                style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 14, fontWeight: 600, color: "#154194", padding: "13px 28px", textDecoration: "none" }}>
                {t("cta_btn_register")} <ArrowRight size={14} />
              </Link>
              <Link href="/login" className="hp-cta-outline"
                style={{ display: "inline-flex", alignItems: "center", fontSize: 14, fontWeight: 500, color: "rgba(255,255,255,.75)", border: "1px solid rgba(255,255,255,.2)", padding: "13px 28px", textDecoration: "none" }}>
                {t("cta_btn_login")}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ backgroundColor: "#111", color: "#666" }}>
        <div className="r-container" style={{ paddingTop: 56, paddingBottom: 0 }}>
          <div className="r-footer-grid">
            <div>
              <div style={{ marginBottom: 16 }}>
                <Link href="/" style={{ textDecoration: "none", display: "inline-block" }}>
                  <EucxLogo variant="dark" size="md" showTagline />
                </Link>
              </div>
              <p style={{ fontSize: 13, color: "#555", lineHeight: 1.7 }}>{t("footer_desc")}</p>
            </div>
            {[
              { titleKey: "footer_platform" as const, links: [
                { label: t("footer_markets_link"), href: "#marktbereiche" },
                { label: t("footer_sessions"),     href: "#wie-es-funktioniert" },
                { label: t("footer_orderbook"),    href: "#wie-es-funktioniert" },
                { label: t("footer_api"),          href: "/katalog" },
              ]},
              { titleKey: "footer_members" as const, links: [
                { label: t("footer_registration"),  href: "/register" },
                { label: t("footer_accreditation"), href: "/register" },
                { label: t("footer_wissen"),        href: "/wissen" },
                { label: t("footer_support"),       href: "/impressum" },
              ]},
              { titleKey: "footer_legal" as const, links: [
                { label: t("footer_imprint"),       href: "/impressum" },
                { label: t("footer_privacy"),       href: "/datenschutz" },
                { label: t("footer_terms"),         href: "/agb" },
                { label: t("footer_accessibility"), href: "/regelwerk" },
              ]},
            ].map(({ titleKey, links }) => (
              <div key={titleKey}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#888", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 18 }}>{t(titleKey)}</div>
                {links.map(({ label, href }) => (
                  <a key={label} href={href} className="hp-footer-link">{label}</a>
                ))}
              </div>
            ))}
          </div>
          <div className="flex flex-col md:flex-row items-center justify-between gap-4" style={{ padding: "20px 0" }}>
            <span style={{ fontSize: 11, color: "#333" }}>{t("footer_copy")}</span>
            <span style={{ fontSize: 11, color: "#333" }}>{t("footer_reg")}</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
