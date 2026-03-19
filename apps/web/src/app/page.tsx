"use client";
import { useState } from "react";
import Link from "next/link";
import {
  ShieldCheck, TrendingUp, FileText, Users,
  ArrowRight, BarChart3, Layers, Lock,
  Globe, Building2, Wheat, Trees, Package, X, Menu,
} from "lucide-react";
import { EucxLogo } from "@/components/logo/EucxLogo";

const S: Record<string, React.CSSProperties> = {
  label: { fontSize: 11, fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase" as const, color: "#154194", marginBottom: 10, display: "block" },
  h2:    { fontSize: 34, fontWeight: 300, color: "#1a1a1a", lineHeight: 1.2, margin: 0 },
  body:  { fontSize: 15, color: "#505050", lineHeight: 1.7 },
};

const NAV_LINKS = [
  { label: "Marktbereiche",    href: "#marktbereiche" },
  { label: "So funktioniert's", href: "#wie-es-funktioniert" },
  { label: "Regulierung",      href: "#regulierung" },
  { label: "Teilnehmer werden", href: "#teilnehmer" },
];

export default function HomePage() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div style={{ fontFamily: "'IBM Plex Sans', Arial, sans-serif", backgroundColor: "#fff", color: "#1a1a1a" }}>

      {/* ── Mobile Nav Overlay ── */}
      <div className={`r-mobile-menu ${menuOpen ? "open" : ""}`}>
        <button
          onClick={() => setMenuOpen(false)}
          style={{ position: "absolute", top: 20, right: 20, background: "none", border: "none", color: "#fff", cursor: "pointer" }}
          aria-label="Menu schliessen"
        >
          <X size={24} />
        </button>
        <div style={{ marginBottom: 32 }}>
          <EucxLogo variant="white" size="sm" />
        </div>
        {NAV_LINKS.map(({ label, href }) => (
          <a key={label} href={href} onClick={() => setMenuOpen(false)}
            style={{ fontSize: 18, color: "rgba(255,255,255,.85)", textDecoration: "none", padding: "14px 0", borderBottom: "1px solid rgba(255,255,255,.08)", display: "block" }}>
            {label}
          </a>
        ))}
        <div style={{ marginTop: 32, display: "flex", flexDirection: "column", gap: 12 }}>
          <Link href="/login" onClick={() => setMenuOpen(false)}
            style={{ textAlign: "center", fontSize: 14, fontWeight: 600, color: "#154194", backgroundColor: "#fff", padding: "13px 28px", textDecoration: "none" }}>
            Anmelden
          </Link>
          <Link href="/register" onClick={() => setMenuOpen(false)}
            style={{ textAlign: "center", fontSize: 14, fontWeight: 600, color: "#fff", backgroundColor: "#154194", padding: "13px 28px", textDecoration: "none" }}>
            Registrieren
          </Link>
        </div>
      </div>

      {/* ── Topbar ── */}
      <div style={{ backgroundColor: "#111", height: 38, display: "flex", alignItems: "center" }}>
        <div className="r-container flex items-center justify-between w-full">
          <span className="r-topbar-text" style={{ fontSize: 12, color: "rgba(255,255,255,.45)", letterSpacing: "0.02em" }}>
            BaFin-regulierte Handelsplattform · Frankfurt am Main · MiFID II OTF
          </span>
          <span className="hidden r-topbar-text" style={{ fontSize: 12, color: "rgba(255,255,255,.45)" }}>EUCX · MiFID II OTF</span>
          <div className="hidden sm:flex items-center gap-5">
            {([<><Lock size={11}/> TLS 1.3</>, <><ShieldCheck size={11}/> DSGVO-konform</>] as React.ReactNode[]).map((item, i) => (
              <span key={i} className="flex items-center gap-1.5" style={{ fontSize: 11, color: "rgba(255,255,255,.35)" }}>{item}</span>
            ))}
          </div>
        </div>
      </div>

      {/* ── Header ── */}
      <header style={{ backgroundColor: "#fff", borderTop: "3px solid #154194", boxShadow: "0 1px 4px rgba(0,0,0,.15)", position: "sticky", top: 0, zIndex: 50 }}>
        <div className="r-container" style={{ height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <EucxLogo size="md" />

          <nav className="hidden md:flex items-center">
            {NAV_LINKS.map(({ label, href }) => (
              <a key={label} href={href}
                style={{ fontSize: 14, color: "#333", padding: "0 18px", height: 64, display: "flex", alignItems: "center", borderBottom: "2px solid transparent", textDecoration: "none", transition: "color .15s, border-color .15s" }}
                onMouseEnter={e => { e.currentTarget.style.color="#154194"; e.currentTarget.style.borderBottomColor="#154194"; }}
                onMouseLeave={e => { e.currentTarget.style.color="#333"; e.currentTarget.style.borderBottomColor="transparent"; }}>
                {label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/login" className="hidden sm:block" style={{ fontSize: 13, color: "#154194", fontWeight: 500, textDecoration: "none" }}>Anmelden</Link>
            <Link href="/register" className="hidden sm:flex items-center gap-1.5"
              style={{ fontSize: 13, fontWeight: 600, color: "#fff", backgroundColor: "#154194", padding: "9px 20px", textDecoration: "none", transition: "background .15s" }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#0f3070")}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = "#154194")}>
              Registrieren <ArrowRight size={13} />
            </Link>
            {/* Hamburger */}
            <button
              className="r-hamburger"
              onClick={() => setMenuOpen(true)}
              aria-label="Menu offnen"
            >
              <span /><span /><span />
            </button>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="r-section-hero" style={{ backgroundColor: "#0b1e36" }}>
        <div className="r-container">
          <div className="inline-flex items-center gap-2" style={{ border: "1px solid rgba(255,255,255,.15)", padding: "5px 14px", marginBottom: 28 }}>
            <span style={{ width: 7, height: 7, backgroundColor: "#34d399", display: "inline-block", borderRadius: "50%" }} />
            <span style={{ fontSize: 12, color: "rgba(255,255,255,.6)", letterSpacing: "0.04em" }}>Handelssitzungen Mo-Fr 09:00-17:30 Uhr</span>
          </div>

          <h1 className="r-hero-h1">
            Die institutionelle Warenborse fur die Europaische Union
          </h1>
          <p className="r-hero-sub">
            Transparentes Orderbuch, sofortige Abwicklung und BaFin-regulierter Marktbetrieb -
            fur Metalle, Holz, Agrar und Industrieguter.
          </p>

          <div className="flex flex-wrap gap-4">
            <Link href="/login"
              style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 14, fontWeight: 600, color: "#154194", backgroundColor: "#fff", padding: "13px 28px", textDecoration: "none", transition: "background .15s" }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor="#f0f4ff")}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor="#fff")}>
              Zum Teilnehmerportal <ArrowRight size={15} />
            </Link>
            <a href="#wie-es-funktioniert"
              style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 14, fontWeight: 500, color: "rgba(255,255,255,.8)", border: "1px solid rgba(255,255,255,.2)", padding: "13px 28px", textDecoration: "none", transition: "background .15s" }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor="rgba(255,255,255,.07)")}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor="transparent")}>
              Mehr erfahren
            </a>
          </div>

          <div className="flex flex-wrap gap-6" style={{ marginTop: 48, paddingTop: 36, borderTop: "1px solid rgba(255,255,255,.08)" }}>
            {[
              { icon: ShieldCheck, label: "BaFin-reguliert" },
              { icon: Globe,       label: "EU-weit zugelassen" },
              { icon: Lock,        label: "ISO 27001 zertifiziert" },
              { icon: FileText,    label: "DSGVO-konform" },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2" style={{ fontSize: 13, color: "rgba(255,255,255,.35)" }}>
                <Icon size={14} /> {label}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Statistiken ── */}
      <section style={{ borderBottom: "1px solid #e8e8e8" }}>
        <div className="r-container">
          <div className="r-grid-4">
            {[
              { v: "2,4 Mrd.", l: "Handelsvolumen 2025",   s: "+18 % ggü. Vorjahr" },
              { v: "1.200+",   l: "Zugelassene Teilnehmer", s: "in 27 EU-Staaten" },
              { v: "4",        l: "Warensektionen",         s: "Metalle · Holz · Agrar · PPT" },
              { v: "98,7 %",   l: "Ausfuhrungsquote",       s: "aller Auftrage" },
            ].map((s, i) => (
              <div key={s.l} className={i > 0 ? "r-stat-item" : ""}
                style={{ padding: "36px 0", borderLeft: i > 0 ? "1px solid #e8e8e8" : "none", paddingLeft: i > 0 ? 32 : 0 }}>
                <div style={{ fontSize: 32, fontWeight: 300, color: "#154194", lineHeight: 1 }}>{s.v}</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#1a1a1a", marginTop: 8 }}>{s.l}</div>
                <div style={{ fontSize: 12, color: "#aaa", marginTop: 4 }}>{s.s}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Marktbereiche ── */}
      <section id="marktbereiche" className="r-section-lg" style={{ backgroundColor: "#f7f7f7" }}>
        <div className="r-container">
          <span style={S.label}>Handelsumfang</span>
          <div className="flex flex-wrap items-end justify-between" style={{ marginBottom: 36, gap: 16 }}>
            <h2 style={S.h2}>Vier regulierte Warensektionen</h2>
            <p style={{ ...S.body, maxWidth: 420, margin: 0 }}>
              Tagliche Sitzungen mit vollstandiger Markttransparenz und zentralem Clearing.
            </p>
          </div>

          <div className="r-grid-4-gap">
            {[
              { Icon: TrendingUp, code: "METALLE", title: "Metallprodukte",    items: ["Bewehrungsstahl & Profile","Blech & Coils","Kupfer / Aluminium / Zink","Metallschrott"] },
              { Icon: Trees,      code: "HOLZ",    title: "Holz & Forst",      items: ["Rundholz & Stammholz","Schnittholz","Sperrholz / MDF","Forstwirtschaft"] },
              { Icon: Wheat,      code: "AGRAR",   title: "Agrarprodukte",     items: ["Weizen / Gerste / Mais","Raps & Olsaaten","Milchprodukte","Fleisch & Geflugel"] },
              { Icon: Package,    code: "PPT",     title: "Papier & Baustoffe",items: ["Papier & Karton","Verpackungsmaterial","Zement & Beton","Industriechemie"] },
            ].map(({ Icon, code, title, items }) => (
              <div key={code} style={{ backgroundColor: "#fff", padding: "32px 28px" }}>
                <div style={{ borderLeft: "3px solid #154194", paddingLeft: 12, marginBottom: 20, display: "inline-block" }}>
                  <Icon size={20} style={{ color: "#154194", display: "block" }} />
                </div>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "#154194", marginBottom: 8 }}>{code}</div>
                <div style={{ fontSize: 16, fontWeight: 600, color: "#1a1a1a", marginBottom: 16 }}>{title}</div>
                <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                  {items.map(item => (
                    <li key={item} style={{ fontSize: 13, color: "#444", padding: "7px 0", borderBottom: "1px solid #f0f0f0", display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ width: 4, height: 4, backgroundColor: "#154194", display: "inline-block", flexShrink: 0 }} />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Prozess ── */}
      <section id="wie-es-funktioniert" className="r-section-lg" style={{ backgroundColor: "#fff" }}>
        <div className="r-container">
          <span style={S.label}>Prozess</span>
          <h2 style={{ ...S.h2, marginBottom: 48 }}>In vier Schritten zum Abschluss</h2>

          <div className="r-grid-4" style={{ borderTop: "3px solid #154194" }}>
            {[
              { step: "01", Icon: Users,       title: "Akkreditierung",       desc: "Unternehmensverifizierung und KYC-Prufung als zugelassener Marktteilnehmer." },
              { step: "02", Icon: FileText,    title: "Auftragserfassung",    desc: "Kauf- oder Verkaufsauftrag mit vollstandiger Warenspezifikation einreichen." },
              { step: "03", Icon: BarChart3,   title: "Handelssitzung",       desc: "Live-Orderbuch mit Echtzeit-Preisfindung, Gebotsverhandlung und Abschluss." },
              { step: "04", Icon: ShieldCheck, title: "Clearing & Abwicklung",desc: "Automatisches Clearing, Borsenvertrag, Kautionsabrechnung und Lieferbestatigung." },
            ].map(({ step, Icon, title, desc }, i) => (
              <div key={step} className={i > 0 ? "r-process-item" : ""}
                style={{ padding: "36px 32px 36px 0", paddingLeft: i > 0 ? 32 : 0, borderLeft: i > 0 ? "1px solid #e8e8e8" : "none" }}>
                <div style={{ width: 44, height: 44, backgroundColor: "#154194", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
                  <Icon size={18} color="#fff" />
                </div>
                <div style={{ fontSize: 10, fontWeight: 700, color: "#154194", letterSpacing: "0.14em", marginBottom: 10 }}>SCHRITT {step}</div>
                <div style={{ fontSize: 15, fontWeight: 600, color: "#1a1a1a", marginBottom: 10 }}>{title}</div>
                <div style={{ fontSize: 13, color: "#505050", lineHeight: 1.7 }}>{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Plattform ── */}
      <section className="r-section-lg" style={{ backgroundColor: "#f7f7f7" }}>
        <div className="r-container">
          <div className="r-grid-2">

            {/* Feature-Card */}
            <div style={{ backgroundColor: "#1e3a5f", padding: "48px 40px", color: "#fff" }}>
              <span style={{ ...S.label, color: "rgba(255,255,255,.4)" }}>Plattform</span>
              <h2 style={{ fontSize: 26, fontWeight: 300, lineHeight: 1.3, color: "#fff", margin: "0 0 20px" }}>
                Borseninfrastruktur auf institutionellem Niveau
              </h2>
              <p style={{ fontSize: 14, color: "rgba(255,255,255,.55)", lineHeight: 1.8, marginBottom: 32 }}>
                EUCX wurde fur regulierten Warenterminhandel entwickelt - mit denselben Standards wie etablierte Rohstoffborsen.
              </p>
              {[
                { Icon: Layers,      title: "Zentrales Orderbuch",  desc: "Price-Time-Priority Matching, vollstandige Preistransparenz" },
                { Icon: ShieldCheck, title: "Zentrales Clearing",   desc: "Automatische Kautionsverwaltung und Settlement" },
                { Icon: BarChart3,   title: "Echtzeit-Marktdaten",  desc: "OHLCV-Kerzen, Orderbuch-Tiefe und Statistiken live" },
                { Icon: Building2,   title: "KYC & Compliance",     desc: "Vollstandige Prufung, Audit-Trail und Reporting" },
              ].map(({ Icon, title, desc }) => (
                <div key={title} className="flex items-start gap-4" style={{ borderTop: "1px solid rgba(255,255,255,.1)", paddingTop: 16, marginTop: 16 }}>
                  <Icon size={16} style={{ color: "rgba(255,255,255,.4)", marginTop: 2, flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "#fff" }}>{title}</div>
                    <div style={{ fontSize: 12, color: "rgba(255,255,255,.45)", marginTop: 3 }}>{desc}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Orderbuch-Mockup */}
            <div style={{ backgroundColor: "#fff", boxShadow: "0 2px 16px rgba(0,0,0,.1)" }}>
              <div style={{ backgroundColor: "#154194", padding: "12px 20px" }}>
                <span style={{ fontSize: 12, color: "rgba(255,255,255,.6)" }}>Handelssitzung - Metalle #247 · Live</span>
              </div>
              <div style={{ padding: 24 }}>
                <div className="flex items-start justify-between" style={{ marginBottom: 20, paddingBottom: 16, borderBottom: "1px solid #f0f0f0" }}>
                  <div>
                    <div style={{ fontSize: 11, color: "#aaa", textTransform: "uppercase", letterSpacing: "0.1em" }}>Bewehrungsstahl A1 · 12mm</div>
                    <div style={{ fontSize: 28, fontWeight: 300, color: "#0b1e36", marginTop: 4 }}>587,00 EUR <span style={{ fontSize: 13, color: "#aaa" }}>/ t</span></div>
                  </div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: "#1a7a3c", backgroundColor: "#f0faf4", padding: "4px 12px", border: "1px solid #c3e6cb" }}>OFFEN</div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, fontSize: 12 }}>
                  {[
                    { label: "Verkauf", color: "#b91c1c", rows: [["592,00","30 t"],["590,50","15 t"],["589,00","50 t"],["588,00","20 t"]] },
                    { label: "Kauf",    color: "#15803d", rows: [["587,00","25 t"],["586,50","40 t"],["585,00","60 t"],["584,00","35 t"]] },
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
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginTop: 20 }}>
                  {[["Umsatz","1,24 Mio."],["Abschlusse","18"],["Zeit","14:32"]].map(([l,v]) => (
                    <div key={l} style={{ backgroundColor: "#f7f7f7", padding: "10px 0", textAlign: "center" }}>
                      <div style={{ fontSize: 11, color: "#aaa" }}>{l}</div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "#0b1e36", marginTop: 3 }}>{v}</div>
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
          <span style={S.label}>Vertrauen & Sicherheit</span>
          <h2 style={{ ...S.h2, marginBottom: 40 }}>Regulierung auf hochstem Niveau</h2>
          <div className="r-grid-3">
            {[
              { Icon: ShieldCheck, title: "BaFin-regulierter Marktbetreiber", desc: "EUCX GmbH ist als Organisiertes Handelssystem (OTF) gemass MiFID II bei der BaFin registriert und wird laufend gepruft." },
              { Icon: Lock,        title: "Maximale Datensicherheit",         desc: "ISO 27001-zertifizierte Infrastruktur, TLS 1.3-Verschlusselung, Zwei-Faktor-Authentifizierung fur alle Teilnehmer." },
              { Icon: Globe,       title: "DSGVO & EU-Compliance",            desc: "Alle personenbezogenen Daten werden ausschliesslich auf EU-Servern verarbeitet. Vollstandiger Audit-Trail fur jede Transaktion." },
            ].map(({ Icon, title, desc }) => (
              <div key={title} style={{ backgroundColor: "#fff", padding: "40px 36px" }}>
                <div style={{ width: 44, height: 44, backgroundColor: "#f0f4ff", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
                  <Icon size={20} style={{ color: "#154194" }} />
                </div>
                <div style={{ fontSize: 15, fontWeight: 600, color: "#1a1a1a", marginBottom: 12, lineHeight: 1.4 }}>{title}</div>
                <div style={{ fontSize: 13, color: "#505050", lineHeight: 1.75 }}>{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section id="teilnehmer" className="r-section-lg" style={{ backgroundColor: "#0b1e36" }}>
        <div className="r-container">
          <div style={{ maxWidth: 600 }}>
            <span style={{ ...S.label, color: "rgba(255,255,255,.35)" }}>Teilnehmer werden</span>
            <h2 style={{ fontSize: 32, fontWeight: 300, color: "#fff", lineHeight: 1.2, margin: "0 0 20px" }}>
              Jetzt als Marktteilnehmer registrieren
            </h2>
            <p style={{ fontSize: 15, color: "rgba(255,255,255,.5)", lineHeight: 1.8, marginBottom: 36 }}>
              Unternehmen mit Sitz in der EU konnen eine Akkreditierung beantragen.
              Nach erfolgreicher KYC-Prufung erhalten Sie sofortigen Zugang zu allen vier Handelssektionen.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/register"
                style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 14, fontWeight: 600, color: "#154194", backgroundColor: "#fff", padding: "13px 28px", textDecoration: "none" }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor="#f0f4ff")}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor="#fff")}>
                Akkreditierung beantragen <ArrowRight size={14} />
              </Link>
              <Link href="/login"
                style={{ display: "inline-flex", alignItems: "center", fontSize: 14, fontWeight: 500, color: "rgba(255,255,255,.75)", border: "1px solid rgba(255,255,255,.2)", padding: "13px 28px", textDecoration: "none" }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor="rgba(255,255,255,.06)")}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor="transparent")}>
                Bereits Teilnehmer - Anmelden
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
                <EucxLogo variant="white" size="sm" showTagline />
              </div>
              <p style={{ fontSize: 13, color: "#555", lineHeight: 1.7 }}>
                Digitale B2B-Warenborse fur institutionellen Rohstoffhandel in der Europaischen Union.
              </p>
            </div>
            {[
              { title: "Plattform",   links: [["Marktbereiche","#marktbereiche"],["Handelssitzungen","#wie-es-funktioniert"],["Orderbuch","#wie-es-funktioniert"],["API-Zugang","#"]] },
              { title: "Teilnehmer", links: [["Registrierung","/register"],["Akkreditierung","/register"],["Wissen","/wissen"],["Support","#"]] },
              { title: "Rechtliches",links: [["Impressum","/impressum"],["Datenschutz","/datenschutz"],["AGB","/agb"],["Barrierefreiheit","#"]] },
            ].map(({ title, links }) => (
              <div key={title}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#888", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 18 }}>{title}</div>
                {links.map(([label, href]) => (
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
            <span style={{ fontSize: 11, color: "#333" }}>© 2026 EUCX GmbH · Frankfurt am Main · HRB 123456 AG Frankfurt</span>
            <span style={{ fontSize: 11, color: "#333" }}>Reguliert durch die BaFin · MiFID II OTF-Zulassung</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
