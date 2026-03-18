"use client";
import Link from "next/link";
import {
  ShieldCheck,
  TrendingUp,
  FileText,
  Users,
  ArrowRight,
  BarChart3,
  Layers,
  Lock,
  Globe,
  CheckCircle2,
  Building2,
  Wheat,
  Trees,
  Package,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col" style={{ fontFamily: "'IBM Plex Sans', Arial, sans-serif", backgroundColor: "#ffffff" }}>

      {/* ── Topbar (HSBC-Stil: dünne Info-Leiste) ── */}
      <div style={{ backgroundColor: "#1a1a1a" }}>
        <div style={{ maxWidth: 1180, margin: "0 auto", padding: "0 20px" }}
          className="flex items-center justify-between h-9">
          <p className="text-white/50 text-xs tracking-wide">
            BaFin-regulierte Handelsplattform · Frankfurt am Main · MiFID II OTF
          </p>
          <div className="flex items-center gap-4 text-white/40 text-xs">
            <span className="flex items-center gap-1"><Lock size={10} /> TLS 1.3</span>
            <span className="flex items-center gap-1"><ShieldCheck size={10} /> DSGVO-konform</span>
          </div>
        </div>
      </div>

      {/* ── Header (HSBC-Stil: weiß, Schatten, Marken-Linie oben) ── */}
      <header className="bg-white sticky top-0 z-50"
        style={{ borderTop: "3px solid #154194", boxShadow: "0 1px 4px 0 rgba(0,0,0,.2)" }}>
        <div style={{ maxWidth: 1180, margin: "0 auto", padding: "0 20px" }}
          className="flex items-center justify-between h-16">

          {/* Logo */}
          <div className="flex items-center gap-3">
            <div style={{ width: 36, height: 36, backgroundColor: "#154194", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span className="text-white font-bold text-sm tracking-wide">E</span>
            </div>
            <div>
              <span className="font-bold text-lg leading-none" style={{ color: "#1a1a1a" }}>EUCX</span>
              <p className="text-[10px] leading-none mt-0.5 tracking-widest uppercase" style={{ color: "#929292" }}>EU Commodity Exchange</p>
            </div>
          </div>

          {/* Nav (HSBC-Stil: gewichtsloses normales Text) */}
          <nav className="hidden md:flex items-center gap-8 text-sm" style={{ color: "#333333" }}>
            {["Marktbereiche", "So funktioniert's", "Regulierung", "Teilnehmer werden"].map((label, i) => (
              <a key={label}
                href={["#marktbereiche", "#wie-es-funktioniert", "#regulierung", "#teilnehmer"][i]}
                className="transition-colors"
                style={{ fontSize: 14 }}
                onMouseEnter={e => (e.currentTarget.style.color = "#154194")}
                onMouseLeave={e => (e.currentTarget.style.color = "#333333")}>
                {label}
              </a>
            ))}
          </nav>

          {/* CTA Buttons (HSBC-Stil: keine Rundung) */}
          <div className="flex items-center gap-3">
            <Link href="/login"
              className="text-sm font-medium transition-colors"
              style={{ color: "#154194", fontSize: 14 }}>
              Anmelden
            </Link>
            <Link href="/register"
              className="flex items-center gap-2 text-white text-sm font-medium transition-colors"
              style={{ backgroundColor: "#154194", padding: "10px 20px", fontSize: 14, borderRadius: 0 }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#0f3070")}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = "#154194")}>
              Registrieren
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero (HSBC-Stil: dunkel, leichte Überschrift, scharf) ── */}
      <section style={{ backgroundColor: "#0d2340", paddingTop: 80, paddingBottom: 100 }}>
        <div style={{ maxWidth: 1180, margin: "0 auto", padding: "0 20px" }}>

          {/* Live-Badge (HSBC-Stil: eckig) */}
          <div className="inline-flex items-center gap-2 mb-8"
            style={{ border: "1px solid rgba(255,255,255,.2)", padding: "6px 16px", backgroundColor: "rgba(255,255,255,.06)" }}>
            <span className="w-2 h-2 bg-green-400" style={{ borderRadius: 0, animation: "pulse 2s infinite" }} />
            <span className="text-white/70 text-xs font-medium tracking-wide">Handelssitzungen Mo–Fr 09:00–17:30 Uhr</span>
          </div>

          <h1 className="text-white leading-tight mb-6"
            style={{ fontSize: 56, fontWeight: 300, maxWidth: 700, lineHeight: 1.1 }}>
            Die institutionelle Warenbörse für die Europäische Union
          </h1>

          <p style={{ fontSize: 18, color: "rgba(255,255,255,.55)", maxWidth: 560, lineHeight: 1.6, marginBottom: 40 }}>
            Transparentes Orderbuch, sofortige Abwicklung und BaFin-regulierter Marktbetrieb —
            für Metalle, Holz, Agrar und Industriegüter.
          </p>

          {/* Buttons (HSBC: komplett eckig) */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/login"
              className="flex items-center gap-2 font-medium text-sm transition-colors"
              style={{ backgroundColor: "#ffffff", color: "#154194", padding: "13px 28px", borderRadius: 0, fontSize: 14 }}>
              Zum Teilnehmerportal
              <ArrowRight size={16} />
            </Link>
            <a href="#wie-es-funktioniert"
              className="flex items-center gap-2 text-white font-medium text-sm transition-colors"
              style={{ border: "1px solid rgba(255,255,255,.25)", padding: "13px 28px", borderRadius: 0, backgroundColor: "transparent", fontSize: 14 }}>
              Mehr erfahren
            </a>
          </div>

          {/* Trust-Bar */}
          <div className="flex flex-wrap gap-8 mt-16">
            {[
              { icon: ShieldCheck, label: "BaFin-reguliert" },
              { icon: Globe, label: "EU-weit zugelassen" },
              { icon: Lock, label: "ISO 27001 zertifiziert" },
              { icon: FileText, label: "DSGVO-konform" },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2" style={{ color: "rgba(255,255,255,.4)", fontSize: 13 }}>
                <Icon size={15} />
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Statistiken (HSBC-Stil: weiß, Trennlinien, kein Rund) ── */}
      <section style={{ backgroundColor: "#ffffff", borderBottom: "1px solid #e8e8e8" }}>
        <div style={{ maxWidth: 1180, margin: "0 auto", padding: "0 20px" }}>
          <div className="grid grid-cols-2 md:grid-cols-4">
            {[
              { value: "€ 2,4 Mrd.", label: "Handelsvolumen 2025", sub: "+18 % ggü. Vorjahr" },
              { value: "1.200+", label: "Zugelassene Teilnehmer", sub: "in 27 EU-Staaten" },
              { value: "4", label: "Warensektionen", sub: "Metalle · Holz · Agrar · PPT" },
              { value: "98,7 %", label: "Ausführungsquote", sub: "aller Aufträge" },
            ].map((s, i) => (
              <div key={s.label}
                style={{
                  padding: "40px 20px",
                  borderLeft: i > 0 ? "1px solid #e8e8e8" : "none",
                }}>
                <p style={{ fontSize: 32, fontWeight: 300, color: "#154194", lineHeight: 1 }}>{s.value}</p>
                <p style={{ fontSize: 14, fontWeight: 500, color: "#1a1a1a", marginTop: 8 }}>{s.label}</p>
                <p style={{ fontSize: 12, color: "#929292", marginTop: 4 }}>{s.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Marktbereiche (HSBC-Stil: hellgrauer Bereich, eckige Cards) ── */}
      <section id="marktbereiche" style={{ backgroundColor: "#f5f5f5", padding: "80px 0" }}>
        <div style={{ maxWidth: 1180, margin: "0 auto", padding: "0 20px" }}>
          <div style={{ marginBottom: 56 }}>
            <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "#154194", marginBottom: 12 }}>
              Handelsumfang
            </p>
            <h2 style={{ fontSize: 32, fontWeight: 300, color: "#1a1a1a", lineHeight: 1.2 }}>
              Vier regulierte Warensektionen
            </h2>
            <p style={{ fontSize: 16, color: "#505050", marginTop: 16, maxWidth: 560, lineHeight: 1.6 }}>
              Der EUCX organisiert tägliche Handelssitzungen in vier Hauptbereichen mit
              vollständiger Markttransparenz und zentralem Clearing.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px" style={{ backgroundColor: "#d0d0d0" }}>
            {[
              {
                Icon: TrendingUp,
                code: "METALLE",
                title: "Metallprodukte",
                desc: "Walzstahl, Armaturen, Rohre, Nichteisenmetalle und Metallschrott für den industriellen Handel.",
                items: ["Bewehrungsstahl & Profile", "Blech & Coils", "Kupfer / Aluminium / Zink", "Metallschrott"],
                accent: "#154194",
              },
              {
                Icon: Trees,
                code: "HOLZ",
                title: "Holz & Forst",
                desc: "Rundholz, Schnittholz und Holzwerkstoffe aus nachhaltig bewirtschafteten Wäldern.",
                items: ["Rundholz & Stammholz", "Schnittholz", "Sperrholz / MDF", "Forstwirtschaft"],
                accent: "#1a6b40",
              },
              {
                Icon: Wheat,
                code: "AGRAR",
                title: "Agrarprodukte",
                desc: "Getreide, Ölsaaten, Milch- und Fleischprodukte für den EU-weiten Agrarhandel.",
                items: ["Weizen / Gerste / Mais", "Raps & Ölsaaten", "Milchprodukte", "Fleisch & Geflügel"],
                accent: "#8a5c00",
              },
              {
                Icon: Package,
                code: "PPT",
                title: "Papier & Baustoffe",
                desc: "Papier, Pappe, Zement, Baumaterialien und Industriechemikalien.",
                items: ["Papier & Karton", "Verpackungsmaterial", "Zement & Beton", "Industriechemie"],
                accent: "#5b3d8a",
              },
            ].map(({ Icon, code, title, desc, items, accent }) => (
              <div key={code} style={{ backgroundColor: "#ffffff", padding: "32px 24px" }}
                className="transition-all"
                onMouseEnter={e => (e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,.1)")}
                onMouseLeave={e => (e.currentTarget.style.boxShadow = "none")}>
                {/* Icon Block (HSBC: kein Rund, farbige Linie links) */}
                <div style={{ borderLeft: `3px solid ${accent}`, paddingLeft: 12, marginBottom: 20 }}>
                  <Icon size={22} style={{ color: accent }} />
                </div>
                <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: accent, marginBottom: 6 }}>{code}</p>
                <h3 style={{ fontSize: 16, fontWeight: 600, color: "#1a1a1a", marginBottom: 10 }}>{title}</h3>
                <p style={{ fontSize: 13, color: "#505050", lineHeight: 1.6, marginBottom: 20 }}>{desc}</p>
                <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                  {items.map((item) => (
                    <li key={item} className="flex items-center gap-2" style={{ fontSize: 13, color: "#333333", paddingBottom: 8, borderBottom: "1px solid #f0f0f0" }}>
                      <CheckCircle2 size={12} style={{ color: accent, flexShrink: 0 }} />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Wie es funktioniert (HSBC-Stil: weiß, Nummern eckig) ── */}
      <section id="wie-es-funktioniert" style={{ backgroundColor: "#ffffff", padding: "80px 0" }}>
        <div style={{ maxWidth: 1180, margin: "0 auto", padding: "0 20px" }}>
          <div style={{ marginBottom: 56 }}>
            <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "#154194", marginBottom: 12 }}>Prozess</p>
            <h2 style={{ fontSize: 32, fontWeight: 300, color: "#1a1a1a" }}>In vier Schritten zum Abschluss</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-0" style={{ borderTop: "2px solid #154194" }}>
            {[
              { step: "01", Icon: Users, title: "Akkreditierung", desc: "Registrierung als zugelassener Marktteilnehmer mit Unternehmensverifizierung und KYC-Prüfung." },
              { step: "02", Icon: FileText, title: "Auftragserfassung", desc: "Kauf- oder Verkaufsauftrag mit vollständiger Warenspezifikation für die gewünschte Sitzung einreichen." },
              { step: "03", Icon: BarChart3, title: "Handelssitzung", desc: "Live-Orderbuch mit Echtzeit-Preisfindung, Gebotsverhandlung und Abschluss." },
              { step: "04", Icon: ShieldCheck, title: "Clearing & Abwicklung", desc: "Automatisches Clearing, Börsenvertrag, Kautionsabrechnung und Lieferbestätigung." },
            ].map(({ step, Icon, title, desc }, i) => (
              <div key={step}
                style={{
                  padding: "36px 28px",
                  borderRight: i < 3 ? "1px solid #e8e8e8" : "none",
                }}>
                <div style={{
                  width: 40, height: 40, backgroundColor: "#154194",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  marginBottom: 20
                }}>
                  <Icon size={18} style={{ color: "#ffffff" }} />
                </div>
                <p style={{ fontSize: 11, fontWeight: 600, color: "#154194", letterSpacing: "0.1em", marginBottom: 8 }}>SCHRITT {step}</p>
                <h3 style={{ fontSize: 16, fontWeight: 600, color: "#1a1a1a", marginBottom: 10 }}>{title}</h3>
                <p style={{ fontSize: 13, color: "#505050", lineHeight: 1.6 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features (HSBC: dunkle Feature-Card links, Content rechts) ── */}
      <section style={{ backgroundColor: "#f5f5f5", padding: "80px 0" }}>
        <div style={{ maxWidth: 1180, margin: "0 auto", padding: "0 20px" }}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            {/* Feature Card (HSBC: dunkel, #3e505d adaptiert) */}
            <div style={{ backgroundColor: "#1e3a5f", padding: "48px 40px", color: "#ffffff" }}>
              <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,.5)", marginBottom: 12 }}>Plattform</p>
              <h2 style={{ fontSize: 28, fontWeight: 300, lineHeight: 1.3, marginBottom: 24 }}>
                Börseninfrastruktur auf institutionellem Niveau
              </h2>
              <p style={{ fontSize: 15, color: "rgba(255,255,255,.6)", lineHeight: 1.7, marginBottom: 36 }}>
                EUCX wurde von Grund auf für den regulierten Warenterminhandel entwickelt —
                mit den gleichen Sicherheits- und Transparenzstandards wie etablierte Rohstoffbörsen.
              </p>
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {[
                  { Icon: Layers, title: "Zentrales Orderbuch", desc: "Price-Time-Priority Matching mit vollständiger Preistransparenz" },
                  { Icon: ShieldCheck, title: "Zentrales Clearing", desc: "Automatische Kautionsverwaltung und Settlement" },
                  { Icon: BarChart3, title: "Echtzeit-Marktdaten", desc: "OHLCV-Kerzen, Orderbuch-Tiefe und Statistiken live" },
                  { Icon: Building2, title: "KYC & Compliance", desc: "Vollständige Prüfung, Audit-Trail und Reporting" },
                ].map(({ Icon, title, desc }) => (
                  <li key={title} className="flex items-start gap-4"
                    style={{ borderTop: "1px solid rgba(255,255,255,.1)", paddingTop: 16, marginTop: 16 }}>
                    <Icon size={18} style={{ color: "rgba(255,255,255,.5)", marginTop: 2, flexShrink: 0 }} />
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 600, color: "#ffffff" }}>{title}</p>
                      <p style={{ fontSize: 13, color: "rgba(255,255,255,.5)", marginTop: 3 }}>{desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Orderbuch-Mockup (HSBC-Stil: weißes Panel, eckig, Schatten) */}
            <div style={{ backgroundColor: "#ffffff", boxShadow: "0 2px 8px rgba(0,0,0,.12)" }}>
              {/* Panel Header */}
              <div style={{ backgroundColor: "#154194", padding: "14px 20px", display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ display: "flex", gap: 6 }}>
                  {[0,1,2].map(i => <span key={i} style={{ width: 10, height: 10, backgroundColor: "rgba(255,255,255,.2)", display: "block" }} />)}
                </div>
                <span style={{ color: "rgba(255,255,255,.6)", fontSize: 12 }}>Handelssitzung — Metalle #247</span>
              </div>
              <div style={{ padding: 20 }}>
                <div className="flex items-start justify-between" style={{ marginBottom: 20 }}>
                  <div>
                    <p style={{ fontSize: 11, color: "#929292", textTransform: "uppercase", letterSpacing: "0.1em" }}>Bewehrungsstahl A1 · Ø12mm</p>
                    <p style={{ fontSize: 28, fontWeight: 300, color: "#1a1a1a", marginTop: 4 }}>
                      € 587,00 <span style={{ fontSize: 14, color: "#929292" }}>/ t</span>
                    </p>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 600, color: "#1a7a3c", backgroundColor: "#f0faf4", border: "1px solid #a7f3d0", padding: "4px 10px" }}>
                    ● OFFEN
                  </span>
                </div>
                {/* Orderbuch */}
                <div className="grid grid-cols-2 gap-4" style={{ fontSize: 12 }}>
                  <div>
                    <p style={{ fontWeight: 600, color: "#cc0000", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8, fontSize: 11 }}>Verkauf</p>
                    {[["592,00","30 t"],["590,50","15 t"],["589,00","50 t"],["588,00","20 t"],["587,50","45 t"]].map(([p,q]) => (
                      <div key={p} className="flex justify-between" style={{ paddingBottom: 6, borderBottom: "1px solid #f5f5f5" }}>
                        <span style={{ color: "#cc0000", fontFamily: "monospace" }}>{p}</span>
                        <span style={{ color: "#929292" }}>{q}</span>
                      </div>
                    ))}
                  </div>
                  <div>
                    <p style={{ fontWeight: 600, color: "#1a7a3c", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8, fontSize: 11 }}>Kauf</p>
                    {[["587,00","25 t"],["586,50","40 t"],["585,00","60 t"],["584,00","35 t"],["583,50","20 t"]].map(([p,q]) => (
                      <div key={p} className="flex justify-between" style={{ paddingBottom: 6, borderBottom: "1px solid #f5f5f5" }}>
                        <span style={{ color: "#1a7a3c", fontFamily: "monospace" }}>{p}</span>
                        <span style={{ color: "#929292" }}>{q}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2" style={{ marginTop: 16 }}>
                  {[["Umsatz","€ 1,24 Mio."],["Abschlüsse","18"],["Zeit","14:32"]].map(([l,v]) => (
                    <div key={l} style={{ backgroundColor: "#f5f5f5", padding: "10px 8px", textAlign: "center" }}>
                      <p style={{ fontSize: 11, color: "#929292" }}>{l}</p>
                      <p style={{ fontSize: 13, fontWeight: 600, color: "#1a1a1a", marginTop: 2 }}>{v}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Regulierung (HSBC-Stil: weiß, horizontale Trennlinie zwischen Items) ── */}
      <section id="regulierung" style={{ backgroundColor: "#ffffff", padding: "80px 0" }}>
        <div style={{ maxWidth: 1180, margin: "0 auto", padding: "0 20px" }}>
          <div style={{ marginBottom: 56 }}>
            <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "#154194", marginBottom: 12 }}>Vertrauen & Sicherheit</p>
            <h2 style={{ fontSize: 32, fontWeight: 300, color: "#1a1a1a" }}>Regulierung auf höchstem Niveau</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-px" style={{ backgroundColor: "#e8e8e8" }}>
            {[
              { Icon: ShieldCheck, title: "BaFin-regulierter Marktbetreiber", desc: "EUCX GmbH ist als Organisiertes Handelssystem (OTF) gemäß MiFID II bei der BaFin registriert und wird laufend geprüft." },
              { Icon: Lock, title: "Maximale Datensicherheit", desc: "ISO 27001-zertifizierte Infrastruktur, TLS 1.3-Verschlüsselung, Zwei-Faktor-Authentifizierung für alle Teilnehmer." },
              { Icon: Globe, title: "DSGVO & EU-Compliance", desc: "Alle personenbezogenen Daten werden ausschließlich auf EU-Servern verarbeitet. Vollständiger Audit-Trail für jede Transaktion." },
            ].map(({ Icon, title, desc }) => (
              <div key={title} style={{ backgroundColor: "#ffffff", padding: "40px 32px" }}>
                <div style={{ width: 44, height: 44, backgroundColor: "#f0f4ff", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
                  <Icon size={20} style={{ color: "#154194" }} />
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 600, color: "#1a1a1a", marginBottom: 12, lineHeight: 1.4 }}>{title}</h3>
                <p style={{ fontSize: 13, color: "#505050", lineHeight: 1.7 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA (HSBC-Stil: dunkler Bereich mit dünnen Überschriften) ── */}
      <section id="teilnehmer" style={{ backgroundColor: "#0d2340", padding: "80px 0" }}>
        <div style={{ maxWidth: 1180, margin: "0 auto", padding: "0 20px" }}>
          <div style={{ maxWidth: 640 }}>
            <h2 style={{ fontSize: 36, fontWeight: 300, color: "#ffffff", lineHeight: 1.2, marginBottom: 20 }}>
              Jetzt als Marktteilnehmer registrieren
            </h2>
            <p style={{ fontSize: 16, color: "rgba(255,255,255,.55)", lineHeight: 1.7, marginBottom: 40 }}>
              Unternehmen mit Sitz in der EU können eine Akkreditierung beantragen.
              Nach erfolgreicher KYC-Prüfung erhalten Sie sofortigen Zugang zu allen vier Handelssektionen.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/register"
                className="flex items-center gap-2 font-medium text-sm"
                style={{ backgroundColor: "#ffffff", color: "#154194", padding: "13px 28px", borderRadius: 0, fontSize: 14, textDecoration: "none" }}>
                Akkreditierung beantragen
                <ArrowRight size={15} />
              </Link>
              <Link href="/login"
                className="flex items-center gap-2 font-medium text-sm"
                style={{ border: "1px solid rgba(255,255,255,.25)", color: "#ffffff", padding: "13px 28px", borderRadius: 0, backgroundColor: "transparent", fontSize: 14, textDecoration: "none" }}>
                Bereits Teilnehmer — Anmelden
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer (HSBC: dunkles Grau #404040, strukturiert) ── */}
      <footer style={{ backgroundColor: "#1a1a1a", color: "#929292" }}>
        <div style={{ maxWidth: 1180, margin: "0 auto", padding: "60px 20px 0" }}>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10" style={{ paddingBottom: 48, borderBottom: "1px solid #333333" }}>
            <div>
              <div className="flex items-center gap-2" style={{ marginBottom: 16 }}>
                <div style={{ width: 32, height: 32, backgroundColor: "#154194", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span className="text-white font-bold text-sm">E</span>
                </div>
                <span style={{ color: "#ffffff", fontWeight: 600, fontSize: 15 }}>EUCX</span>
              </div>
              <p style={{ fontSize: 13, lineHeight: 1.7, color: "#666666" }}>
                Digitale B2B-Warenbörse für institutionellen Rohstoffhandel in der EU.
              </p>
            </div>
            {[
              { title: "Plattform", links: ["Marktbereiche", "Handelssitzungen", "Orderbuch", "API-Zugang"] },
              { title: "Teilnehmer", links: ["Registrierung", "Akkreditierung", "Dokumentation", "Support"] },
              { title: "Rechtliches", links: ["Impressum", "Datenschutz", "Nutzungsbedingungen", "Barrierefreiheit"] },
            ].map(({ title, links }) => (
              <div key={title}>
                <p style={{ color: "#ffffff", fontWeight: 600, fontSize: 13, marginBottom: 16, textTransform: "uppercase", letterSpacing: "0.08em" }}>{title}</p>
                <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                  {links.map((link) => (
                    <li key={link} style={{ marginBottom: 10 }}>
                      <a href="#" style={{ fontSize: 13, color: "#666666", textDecoration: "none" }}
                        onMouseEnter={e => (e.currentTarget.style.color = "#ffffff")}
                        onMouseLeave={e => (e.currentTarget.style.color = "#666666")}>
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="flex flex-col md:flex-row items-center justify-between gap-4" style={{ padding: "24px 0" }}>
            <p style={{ fontSize: 12, color: "#444444" }}>© 2026 EUCX GmbH · Frankfurt am Main · HRB 123456 AG Frankfurt</p>
            <p style={{ fontSize: 12, color: "#444444" }}>Reguliert durch die BaFin · MiFID II OTF-Zulassung</p>
          </div>
        </div>
      </footer>

    </div>
  );
}
