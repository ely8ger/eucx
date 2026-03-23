"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ShieldCheck, TrendingUp, FileText, Users,
  ArrowRight, BarChart3, Layers, Lock,
  Globe, Building2, FlaskConical, Trees, Package, X,
} from "lucide-react";
import { EucxLogo } from "@/components/logo/EucxLogo";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useI18n } from "@/lib/i18n/context";

const S: Record<string, React.CSSProperties> = {
  label: { fontSize: 11, fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase" as const, color: "#154194", marginBottom: 10, display: "block" },
  h2:    { fontSize: 34, fontWeight: 300, color: "#1a1a1a", lineHeight: 1.2, margin: 0 },
  body:  { fontSize: 15, color: "#505050", lineHeight: 1.7 },
};

export default function HomePage() {
  const { t } = useI18n();
  const [menuOpen, setMenuOpen] = useState(false);

  const NAV_LINKS = [
    { label: t("nav_katalog"),     href: "/katalog" },
    { label: t("nav_markets"),     href: "#marktbereiche" },
    { label: t("nav_how"),         href: "#wie-es-funktioniert" },
    { label: t("nav_regulation"),  href: "#regulierung" },
    { label: t("nav_join"),        href: "#teilnehmer" },
  ];

  return (
    <div style={{ fontFamily: "'IBM Plex Sans', Arial, sans-serif", backgroundColor: "#fff", color: "#1a1a1a" }}>

      {/* ── Mobile Nav Overlay ── */}
      <div className={`r-mobile-menu ${menuOpen ? "open" : ""}`}>
        <button onClick={() => setMenuOpen(false)}
          style={{ position: "absolute", top: 20, right: 20, background: "none", border: "none", color: "#fff", cursor: "pointer" }}>
          <X size={24} />
        </button>
        <div style={{ marginBottom: 28 }}><Link href="/" onClick={() => setMenuOpen(false)} style={{ textDecoration: "none" }}><EucxLogo variant="dark" size="sm" /></Link></div>
        {NAV_LINKS.map(({ label, href }) => (
          <a key={href} href={href} onClick={() => setMenuOpen(false)}
            style={{ fontSize: 18, color: "rgba(255,255,255,.85)", textDecoration: "none", padding: "14px 0", borderBottom: "1px solid rgba(255,255,255,.08)", display: "block" }}>
            {label}
          </a>
        ))}
        <div style={{ marginTop: 28, display: "flex", flexDirection: "column", gap: 12 }}>
          <Link href="/login" onClick={() => setMenuOpen(false)}
            style={{ textAlign: "center", fontSize: 14, fontWeight: 600, color: "#154194", backgroundColor: "#fff", padding: "13px 28px", textDecoration: "none" }}>
            {t("nav_login")}
          </Link>
          <Link href="/register" onClick={() => setMenuOpen(false)}
            style={{ textAlign: "center", fontSize: 14, fontWeight: 600, color: "#fff", backgroundColor: "#154194", padding: "13px 28px", textDecoration: "none" }}>
            {t("nav_register")}
          </Link>
          <div style={{ paddingTop: 8, display: "flex", justifyContent: "center" }}>
            <LanguageSwitcher dark />
          </div>
        </div>
      </div>

      {/* ── Topbar ── */}
      <div style={{ backgroundColor: "#111", height: 38, display: "flex", alignItems: "center" }}>
        <div className="r-container flex items-center justify-between w-full">
          <span className="r-topbar-text" style={{ fontSize: 12, color: "rgba(255,255,255,.45)", letterSpacing: "0.02em" }}>
            {t("topbar")}
          </span>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-5">
              {([<><Lock size={11}/> {t("topbar_tls")}</>, <><ShieldCheck size={11}/> {t("topbar_dsgvo")}</>] as React.ReactNode[]).map((item, i) => (
                <span key={i} className="flex items-center gap-1.5" style={{ fontSize: 11, color: "rgba(255,255,255,.35)" }}>{item}</span>
              ))}
            </div>
            <LanguageSwitcher dark />
          </div>
        </div>
      </div>

      {/* ── Header ── */}
      <header style={{ backgroundColor: "#fff", borderTop: "3px solid #154194", boxShadow: "0 1px 4px rgba(0,0,0,.15)", position: "sticky", top: 0, zIndex: 50 }}>
        <div className="r-container" style={{ height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link href="/" style={{ textDecoration: "none" }}><EucxLogo size="md" /></Link>

          <nav className="hidden md:flex items-center">
            {NAV_LINKS.map(({ label, href }) => (
              <a key={href} href={href}
                style={{ fontSize: 14, color: "#333", padding: "0 18px", height: 64, display: "flex", alignItems: "center", borderBottom: "2px solid transparent", textDecoration: "none", transition: "color .15s, border-color .15s" }}
                onMouseEnter={e => { e.currentTarget.style.color="#154194"; e.currentTarget.style.borderBottomColor="#154194"; }}
                onMouseLeave={e => { e.currentTarget.style.color="#333"; e.currentTarget.style.borderBottomColor="transparent"; }}>
                {label}
              </a>
            ))}
            <Link href="/marktpreise"
              style={{ fontSize: 12, fontWeight: 700, color: "#154194", backgroundColor: "#eef2fb", padding: "5px 14px", textDecoration: "none", letterSpacing: "0.04em", marginLeft: 8, border: "1px solid #c7d7f0" }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#154194", e.currentTarget.style.color = "#fff")}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = "#eef2fb", e.currentTarget.style.color = "#154194")}>
              {t("nav_marktpreise")} ↗
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/login" className="hidden sm:block" style={{ fontSize: 13, color: "#154194", fontWeight: 500, textDecoration: "none" }}>
              {t("nav_login")}
            </Link>
            <Link href="/register" className="hidden sm:flex items-center gap-1.5"
              style={{ fontSize: 13, fontWeight: 600, color: "#fff", backgroundColor: "#154194", padding: "9px 20px", textDecoration: "none", transition: "background .15s" }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#0f3070")}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = "#154194")}>
              {t("nav_register")} <ArrowRight size={13} />
            </Link>
            <button className="r-hamburger" onClick={() => setMenuOpen(true)} aria-label="Menu">
              <span /><span /><span />
            </button>
          </div>
        </div>
      </header>

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

          {/* Marktpreise-Banner */}
          <Link href="/marktpreise" style={{
            display: "inline-flex", alignItems: "center", gap: 12, marginBottom: 24,
            backgroundColor: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.15)",
            padding: "10px 18px", textDecoration: "none",
          }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = "rgba(255,255,255,.1)")}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = "rgba(255,255,255,.06)")}>
            <span style={{ width: 6, height: 6, backgroundColor: "#22c55e", borderRadius: "50%", flexShrink: 0 }} />
            <span style={{ fontSize: 12, color: "rgba(255,255,255,.6)" }}>
              {t("nav_marktpreise")}:
            </span>
            <span style={{ fontSize: 12, fontWeight: 700, color: "#fff", fontFamily: "'IBM Plex Mono', monospace" }}>
              Betonstahl 698,00 €/t · Walzdraht 672,00 €/t · Harnstoff 485,00 €/t
            </span>
            <span style={{ fontSize: 11, color: "#22c55e", fontWeight: 700, marginLeft: 4 }}>→</span>
          </Link>

          <div className="flex flex-wrap gap-4">
            <Link href="/login"
              style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 14, fontWeight: 600, color: "#154194", backgroundColor: "#fff", padding: "13px 28px", textDecoration: "none", transition: "background .15s" }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor="#f0f4ff")}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor="#fff")}>
              {t("hero_cta_portal")} <ArrowRight size={15} />
            </Link>
            <a href="#wie-es-funktioniert"
              style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 14, fontWeight: 500, color: "rgba(255,255,255,.8)", border: "1px solid rgba(255,255,255,.2)", padding: "13px 28px", textDecoration: "none", transition: "background .15s" }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor="rgba(255,255,255,.07)")}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor="transparent")}>
              {t("hero_cta_more")}
            </a>
          </div>

          <div className="flex flex-wrap gap-6" style={{ marginTop: 48, paddingTop: 36, borderTop: "1px solid rgba(255,255,255,.08)" }}>
            {([
              { icon: ShieldCheck, key: "hero_bafin" as const },
              { icon: Globe,       key: "hero_eu"    as const },
              { icon: Lock,        key: "hero_iso"   as const },
              { icon: FileText,    key: "hero_dsgvo" as const },
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
              { v: "stat_volume_v",  l: "stat_volume_l",  s: "stat_volume_s"  },
              { v: "stat_members_v", l: "stat_members_l", s: "stat_members_s" },
              { v: "stat_sectors_v", l: "stat_sectors_l", s: "stat_sectors_s" },
              { v: "stat_exec_v",    l: "stat_exec_l",    s: "stat_exec_s"    },
            ] as const).map(({ v, l, s }, i) => (
              <div key={l} className={i > 0 ? "r-stat-item" : ""}
                style={{ padding: "36px 0", borderLeft: i > 0 ? "1px solid #e8e8e8" : "none", paddingLeft: i > 0 ? 32 : 0 }}>
                <div style={{ fontSize: 32, fontWeight: 300, color: "#154194", lineHeight: 1 }}>{t(v)}</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#1a1a1a", marginTop: 8 }}>{t(l)}</div>
                <div style={{ fontSize: 12, color: "#aaa", marginTop: 4 }}>{t(s)}</div>
              </div>
            ))}
          </div>
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
            {/* ── METALLE — klickbar ── */}
            <Link href="/katalog" style={{ textDecoration: "none" }}>
              <div style={{ backgroundColor: "#fff", padding: "32px 28px", cursor: "pointer", height: "100%" }}
                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.backgroundColor = "#f0f4fb"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.backgroundColor = "#fff"; }}>
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

            {/* ── DÜNGER ── */}
            <Link href="/duenger" style={{ textDecoration: "none" }}>
            <div style={{ backgroundColor: "#fff", padding: "32px 28px", cursor: "pointer", transition: "background .15s" }}
              onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.backgroundColor = "#f0f4fb"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.backgroundColor = "#fff"; }}
            >
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
                <div style={{ fontSize: 15, fontWeight: 600, color: "#1a1a1a", marginBottom: 10 }}>{t(`${tk}_title` as any)}</div>
                <div style={{ fontSize: 13, color: "#505050", lineHeight: 1.7 }}>{t(`${tk}_desc` as any)}</div>
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
                    <div style={{ fontSize: 14, fontWeight: 600, color: "#fff" }}>{t(tk as any)}</div>
                    <div style={{ fontSize: 12, color: "rgba(255,255,255,.45)", marginTop: 3 }}>{t(`${tk}_desc` as any)}</div>
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
                      {rows.map(([p,q]) => (
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
                <div style={{ fontSize: 15, fontWeight: 600, color: "#1a1a1a", marginBottom: 12, lineHeight: 1.4 }}>{t(`${tk}_title` as any)}</div>
                <div style={{ fontSize: 13, color: "#505050", lineHeight: 1.75 }}>{t(`${tk}_desc` as any)}</div>
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
              <Link href="/register"
                style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 14, fontWeight: 600, color: "#154194", backgroundColor: "#fff", padding: "13px 28px", textDecoration: "none" }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor="#f0f4ff")}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor="#fff")}>
                {t("cta_btn_register")} <ArrowRight size={14} />
              </Link>
              <Link href="/login"
                style={{ display: "inline-flex", alignItems: "center", fontSize: 14, fontWeight: 500, color: "rgba(255,255,255,.75)", border: "1px solid rgba(255,255,255,.2)", padding: "13px 28px", textDecoration: "none" }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor="rgba(255,255,255,.06)")}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor="transparent")}>
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
                { label: t("footer_api"),          href: "#" },
              ]},
              { titleKey: "footer_members" as const, links: [
                { label: t("footer_registration"),  href: "/register" },
                { label: t("footer_accreditation"), href: "/register" },
                { label: t("footer_wissen"),        href: "/wissen" },
                { label: t("footer_support"),       href: "#" },
              ]},
              { titleKey: "footer_legal" as const, links: [
                { label: t("footer_imprint"),       href: "/impressum" },
                { label: t("footer_privacy"),       href: "/datenschutz" },
                { label: t("footer_terms"),         href: "/agb" },
                { label: t("footer_accessibility"), href: "#" },
              ]},
            ].map(({ titleKey, links }) => (
              <div key={titleKey}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#888", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 18 }}>{t(titleKey)}</div>
                {links.map(({ label, href }) => (
                  <a key={label} href={href} style={{ display: "block", fontSize: 13, color: "#555", textDecoration: "none", marginBottom: 10, transition: "color .15s" }}
                    onMouseEnter={e => (e.currentTarget.style.color="#fff")}
                    onMouseLeave={e => (e.currentTarget.style.color="#555")}>
                    {label}
                  </a>
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
