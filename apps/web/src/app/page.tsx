"use client";
import Link from "next/link";
import {
  ShieldCheck, TrendingUp, FileText, Users,
  ArrowRight, BarChart3, Layers, Lock,
  Globe, Building2, Wheat, Trees, Package,
} from "lucide-react";

const S: Record<string, React.CSSProperties> = {
  container: { maxWidth: 1180, margin: "0 auto", padding: "0 40px" },
  label:     { fontSize: 11, fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase" as const, color: "#154194", marginBottom: 10, display: "block" },
  h2:        { fontSize: 34, fontWeight: 300, color: "#1a1a1a", lineHeight: 1.2, margin: 0 },
  body:      { fontSize: 15, color: "#505050", lineHeight: 1.7 },
};

export default function HomePage() {
  return (
    <div style={{ fontFamily: "'IBM Plex Sans', Arial, sans-serif", backgroundColor: "#fff", color: "#1a1a1a" }}>

      {/* ── Topbar ── */}
      <div style={{ backgroundColor: "#111", height: 38, display: "flex", alignItems: "center" }}>
        <div style={S.container} className="flex items-center justify-between w-full">
          <span style={{ fontSize: 12, color: "rgba(255,255,255,.45)", letterSpacing: "0.02em" }}>
            BaFin-regulierte Handelsplattform · Frankfurt am Main · MiFID II OTF
          </span>
          <div className="hidden sm:flex items-center gap-5">
            {[<><Lock size={11}/> TLS 1.3</>, <><ShieldCheck size={11}/> DSGVO-konform</>].map((item, i) => (
              <span key={i} className="flex items-center gap-1.5" style={{ fontSize: 11, color: "rgba(255,255,255,.35)" }}>{item}</span>
            ))}
          </div>
        </div>
      </div>

      {/* ── Header ── */}
      <header style={{ backgroundColor: "#fff", borderTop: "3px solid #154194", boxShadow: "0 1px 4px rgba(0,0,0,.15)", position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ ...S.container, height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div className="flex items-center gap-3">
            <div style={{ width: 36, height: 36, backgroundColor: "#154194", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <span style={{ color: "#fff", fontWeight: 700, fontSize: 14 }}>E</span>
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 16, color: "#0d1b2a", letterSpacing: "-0.01em" }}>EUCX</div>
              <div style={{ fontSize: 9, color: "#aaa", letterSpacing: "0.15em", textTransform: "uppercase", marginTop: 1 }}>EU Commodity Exchange</div>
            </div>
          </div>

          <nav className="hidden md:flex items-center">
            {["Marktbereiche", "So funktioniert's", "Regulierung", "Teilnehmer werden"].map((label, i) => (
              <a key={label} href={["#marktbereiche","#wie-es-funktioniert","#regulierung","#teilnehmer"][i]}
                style={{ fontSize: 14, color: "#333", padding: "0 18px", height: 64, display: "flex", alignItems: "center", borderBottom: "2px solid transparent", textDecoration: "none", transition: "color .15s, border-color .15s" }}
                onMouseEnter={e => { e.currentTarget.style.color="#154194"; e.currentTarget.style.borderBottomColor="#154194"; }}
                onMouseLeave={e => { e.currentTarget.style.color="#333"; e.currentTarget.style.borderBottomColor="transparent"; }}>
                {label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/login" style={{ fontSize: 13, color: "#154194", fontWeight: 500, textDecoration: "none" }}>Anmelden</Link>
            <Link href="/register"
              style={{ fontSize: 13, fontWeight: 600, color: "#fff", backgroundColor: "#154194", padding: "9px 20px", textDecoration: "none", display: "flex", alignItems: "center", gap: 6, transition: "background .15s" }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#0f3070")}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = "#154194")}>
              Registrieren <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section style={{ backgroundColor: "#0b1e36", padding: "96px 0 80px" }}>
        <div style={S.container}>
          {/* Live pill */}
          <div className="inline-flex items-center gap-2" style={{ border: "1px solid rgba(255,255,255,.15)", padding: "5px 14px", marginBottom: 36 }}>
            <span style={{ width: 7, height: 7, backgroundColor: "#34d399", display: "inline-block", borderRadius: "50%" }} />
            <span style={{ fontSize: 12, color: "rgba(255,255,255,.6)", letterSpacing: "0.04em" }}>Handelssitzungen Mo–Fr 09:00–17:30 Uhr</span>
          </div>

          <h1 style={{ fontSize: 52, fontWeight: 300, color: "#fff", lineHeight: 1.12, maxWidth: 680, margin: "0 0 24px" }}>
            Die institutionelle Warenbörse für die Europäische Union
          </h1>
          <p style={{ fontSize: 17, color: "rgba(255,255,255,.5)", maxWidth: 520, lineHeight: 1.7, margin: "0 0 44px" }}>
            Transparentes Orderbuch, sofortige Abwicklung und BaFin-regulierter Marktbetrieb —
            für Metalle, Holz, Agrar und Industriegüter.
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

          {/* Trust badges */}
          <div className="flex flex-wrap gap-8" style={{ marginTop: 56, paddingTop: 40, borderTop: "1px solid rgba(255,255,255,.08)" }}>
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
        <div style={S.container}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)" }}>
            {[
              { v: "€ 2,4 Mrd.", l: "Handelsvolumen 2025",   s: "+18 % ggü. Vorjahr" },
              { v: "1.200+",     l: "Zugelassene Teilnehmer", s: "in 27 EU-Staaten" },
              { v: "4",          l: "Warensektionen",         s: "Metalle · Holz · Agrar · PPT" },
              { v: "98,7 %",     l: "Ausführungsquote",       s: "aller Aufträge" },
            ].map((s, i) => (
              <div key={s.l} style={{ padding: "36px 0", borderLeft: i > 0 ? "1px solid #e8e8e8" : "none", paddingLeft: i > 0 ? 32 : 0 }}>
                <div style={{ fontSize: 36, fontWeight: 300, color: "#154194", lineHeight: 1 }}>{s.v}</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#1a1a1a", marginTop: 8 }}>{s.l}</div>
                <div style={{ fontSize: 12, color: "#aaa", marginTop: 4 }}>{s.s}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Marktbereiche ── */}
      <section id="marktbereiche" style={{ backgroundColor: "#f7f7f7", padding: "80px 0" }}>
        <div style={S.container}>
          <span style={S.label}>Handelsumfang</span>
          <div className="flex items-end justify-between" style={{ marginBottom: 48 }}>
            <h2 style={S.h2}>Vier regulierte Warensektionen</h2>
            <p style={{ ...S.body, maxWidth: 420, margin: 0 }}>
              Tägliche Sitzungen mit vollständiger Markttransparenz und zentralem Clearing.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 2, backgroundColor: "#ddd" }}>
            {[
              { Icon: TrendingUp, code: "METALLE", title: "Metallprodukte",    items: ["Bewehrungsstahl & Profile","Blech & Coils","Kupfer / Aluminium / Zink","Metallschrott"] },
              { Icon: Trees,      code: "HOLZ",    title: "Holz & Forst",      items: ["Rundholz & Stammholz","Schnittholz","Sperrholz / MDF","Forstwirtschaft"] },
              { Icon: Wheat,      code: "AGRAR",   title: "Agrarprodukte",     items: ["Weizen / Gerste / Mais","Raps & Ölsaaten","Milchprodukte","Fleisch & Geflügel"] },
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
      <section id="wie-es-funktioniert" style={{ backgroundColor: "#fff", padding: "80px 0" }}>
        <div style={S.container}>
          <span style={S.label}>Prozess</span>
          <h2 style={{ ...S.h2, marginBottom: 56 }}>In vier Schritten zum Abschluss</h2>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", borderTop: "3px solid #154194" }}>
            {[
              { step: "01", Icon: Users,      title: "Akkreditierung",       desc: "Unternehmensverifizierung und KYC-Prüfung als zugelassener Marktteilnehmer." },
              { step: "02", Icon: FileText,   title: "Auftragserfassung",    desc: "Kauf- oder Verkaufsauftrag mit vollständiger Warenspezifikation einreichen." },
              { step: "03", Icon: BarChart3,  title: "Handelssitzung",       desc: "Live-Orderbuch mit Echtzeit-Preisfindung, Gebotsverhandlung und Abschluss." },
              { step: "04", Icon: ShieldCheck,title: "Clearing & Abwicklung",desc: "Automatisches Clearing, Börsenvertrag, Kautionsabrechnung und Lieferbestätigung." },
            ].map(({ step, Icon, title, desc }, i) => (
              <div key={step} style={{ padding: "36px 32px 36px 0", paddingLeft: i > 0 ? 32 : 0, borderLeft: i > 0 ? "1px solid #e8e8e8" : "none" }}>
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
      <section style={{ backgroundColor: "#f7f7f7", padding: "80px 0" }}>
        <div style={S.container}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 60, alignItems: "start" }}>

            {/* Feature-Card (dunkel) */}
            <div style={{ backgroundColor: "#1e3a5f", padding: "48px 44px", color: "#fff" }}>
              <span style={{ ...S.label, color: "rgba(255,255,255,.4)" }}>Plattform</span>
              <h2 style={{ fontSize: 28, fontWeight: 300, lineHeight: 1.3, color: "#fff", margin: "0 0 20px" }}>
                Börseninfrastruktur auf institutionellem Niveau
              </h2>
              <p style={{ fontSize: 14, color: "rgba(255,255,255,.55)", lineHeight: 1.8, marginBottom: 36 }}>
                EUCX wurde für regulierten Warenterminhandel entwickelt — mit denselben Standards wie etablierte Rohstoffbörsen.
              </p>
              {[
                { Icon: Layers,      title: "Zentrales Orderbuch",  desc: "Price-Time-Priority Matching, vollständige Preistransparenz" },
                { Icon: ShieldCheck, title: "Zentrales Clearing",   desc: "Automatische Kautionsverwaltung und Settlement" },
                { Icon: BarChart3,   title: "Echtzeit-Marktdaten",  desc: "OHLCV-Kerzen, Orderbuch-Tiefe und Statistiken live" },
                { Icon: Building2,   title: "KYC & Compliance",     desc: "Vollständige Prüfung, Audit-Trail und Reporting" },
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
                <span style={{ fontSize: 12, color: "rgba(255,255,255,.6)" }}>Handelssitzung — Metalle #247 · Live</span>
              </div>
              <div style={{ padding: 24 }}>
                <div className="flex items-start justify-between" style={{ marginBottom: 20, paddingBottom: 16, borderBottom: "1px solid #f0f0f0" }}>
                  <div>
                    <div style={{ fontSize: 11, color: "#aaa", textTransform: "uppercase", letterSpacing: "0.1em" }}>Bewehrungsstahl A1 · Ø12mm</div>
                    <div style={{ fontSize: 30, fontWeight: 300, color: "#0b1e36", marginTop: 4 }}>€ 587,00 <span style={{ fontSize: 14, color: "#aaa" }}>/ t</span></div>
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
                  {[["Umsatz","€ 1,24 Mio."],["Abschlüsse","18"],["Zeit","14:32"]].map(([l,v]) => (
                    <div key={l} style={{ backgroundColor: "#f7f7f7", padding: "10px 0", textAlign: "center" }}>
                      <div style={{ fontSize: 11, color: "#aaa" }}>{l}</div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: "#0b1e36", marginTop: 3 }}>{v}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Regulierung ── */}
      <section id="regulierung" style={{ backgroundColor: "#fff", padding: "80px 0" }}>
        <div style={S.container}>
          <span style={S.label}>Vertrauen & Sicherheit</span>
          <h2 style={{ ...S.h2, marginBottom: 48 }}>Regulierung auf höchstem Niveau</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 2, backgroundColor: "#e8e8e8" }}>
            {[
              { Icon: ShieldCheck, title: "BaFin-regulierter Marktbetreiber", desc: "EUCX GmbH ist als Organisiertes Handelssystem (OTF) gemäß MiFID II bei der BaFin registriert und wird laufend geprüft." },
              { Icon: Lock,        title: "Maximale Datensicherheit",         desc: "ISO 27001-zertifizierte Infrastruktur, TLS 1.3-Verschlüsselung, Zwei-Faktor-Authentifizierung für alle Teilnehmer." },
              { Icon: Globe,       title: "DSGVO & EU-Compliance",            desc: "Alle personenbezogenen Daten werden ausschließlich auf EU-Servern verarbeitet. Vollständiger Audit-Trail für jede Transaktion." },
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
      <section id="teilnehmer" style={{ backgroundColor: "#0b1e36", padding: "80px 0" }}>
        <div style={S.container}>
          <div style={{ maxWidth: 600 }}>
            <span style={{ ...S.label, color: "rgba(255,255,255,.35)" }}>Teilnehmer werden</span>
            <h2 style={{ fontSize: 36, fontWeight: 300, color: "#fff", lineHeight: 1.2, margin: "0 0 20px" }}>
              Jetzt als Marktteilnehmer registrieren
            </h2>
            <p style={{ fontSize: 15, color: "rgba(255,255,255,.5)", lineHeight: 1.8, marginBottom: 40 }}>
              Unternehmen mit Sitz in der EU können eine Akkreditierung beantragen.
              Nach erfolgreicher KYC-Prüfung erhalten Sie sofortigen Zugang zu allen vier Handelssektionen.
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
                Bereits Teilnehmer — Anmelden
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ backgroundColor: "#111", color: "#666" }}>
        <div style={{ ...S.container, padding: "60px 40px 0" }}>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 48, paddingBottom: 48, borderBottom: "1px solid #222" }}>
            <div>
              <div className="flex items-center gap-2" style={{ marginBottom: 16 }}>
                <div style={{ width: 32, height: 32, backgroundColor: "#154194", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ color: "#fff", fontWeight: 700, fontSize: 13 }}>E</span>
                </div>
                <span style={{ color: "#fff", fontWeight: 600, fontSize: 15 }}>EUCX</span>
              </div>
              <p style={{ fontSize: 13, color: "#555", lineHeight: 1.7 }}>
                Digitale B2B-Warenbörse für institutionellen Rohstoffhandel in der Europäischen Union.
              </p>
            </div>
            {[
              { title: "Plattform",   links: ["Marktbereiche","Handelssitzungen","Orderbuch","API-Zugang"] },
              { title: "Teilnehmer", links: ["Registrierung","Akkreditierung","Dokumentation","Support"] },
              { title: "Rechtliches",links: ["Impressum","Datenschutz","Nutzungsbedingungen","Barrierefreiheit"] },
            ].map(({ title, links }) => (
              <div key={title}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#888", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 18 }}>{title}</div>
                {links.map(link => (
                  <a key={link} href="#" style={{ display: "block", fontSize: 13, color: "#555", textDecoration: "none", marginBottom: 10, transition: "color .15s" }}
                    onMouseEnter={e => (e.currentTarget.style.color="#fff")}
                    onMouseLeave={e => (e.currentTarget.style.color="#555")}>
                    {link}
                  </a>
                ))}
              </div>
            ))}
          </div>
          <div className="flex flex-col md:flex-row items-center justify-between gap-4" style={{ padding: "24px 0" }}>
            <span style={{ fontSize: 11, color: "#333" }}>© 2026 EUCX GmbH · Frankfurt am Main · HRB 123456 AG Frankfurt</span>
            <span style={{ fontSize: 11, color: "#333" }}>Reguliert durch die BaFin · MiFID II OTF-Zulassung</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
