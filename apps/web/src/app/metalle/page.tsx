"use client";

import Link from "next/link";
import { EucxLogo } from "@/components/logo/EucxLogo";

const BLUE = "#154194";
const F    = "'IBM Plex Sans', Arial, sans-serif";

// ─── Inline SVG Icons ────────────────────────────────────────────────────────
function IconRund()          { return <svg viewBox="0 0 80 60" width={80} height={60}><ellipse cx={40} cy={30} rx={22} ry={22} fill="#dce3ed" stroke="#9aabbc" strokeWidth={1.5}/><ellipse cx={40} cy={30} rx={14} ry={14} fill="#c5d0de"/></svg>; }
function IconVierkant()      { return <svg viewBox="0 0 80 60" width={80} height={60}><rect x={14} y={8} width={52} height={44} fill="#dce3ed" stroke="#9aabbc" strokeWidth={1.5}/><rect x={22} y={16} width={36} height={28} fill="#c5d0de"/></svg>; }
function IconSechskant()     { return <svg viewBox="0 0 80 60" width={80} height={60}><polygon points="40,5 65,18 65,42 40,55 15,42 15,18" fill="#dce3ed" stroke="#9aabbc" strokeWidth={1.5}/><polygon points="40,13 57,22 57,38 40,47 23,38 23,22" fill="#c5d0de"/></svg>; }
function IconFlach()         { return <svg viewBox="0 0 80 60" width={80} height={60}><rect x={4}  y={20} width={72} height={20} fill="#dce3ed" stroke="#9aabbc" strokeWidth={1.5}/><rect x={12} y={25} width={56} height={10} fill="#c5d0de"/></svg>; }
function IconRundrohre()     { return <svg viewBox="0 0 80 60" width={80} height={60}><ellipse cx={40} cy={30} rx={26} ry={26} fill="#dce3ed" stroke="#9aabbc" strokeWidth={1.5}/><ellipse cx={40} cy={30} rx={16} ry={16} fill="#fff" stroke="#9aabbc" strokeWidth={1}/></svg>; }
function IconVierkantrohre() { return <svg viewBox="0 0 80 60" width={80} height={60}><rect x={8}  y={5}  width={64} height={50} fill="#dce3ed" stroke="#9aabbc" strokeWidth={1.5}/><rect x={20} y={17} width={40} height={26} fill="#fff" stroke="#9aabbc" strokeWidth={1}/></svg>; }
function IconRohrzubehoer()  {
  return <svg viewBox="0 0 80 60" width={80} height={60}>
    {/* vertical pipe */}
    <rect x={28} y={2}  width={14} height={32} fill="#dce3ed" stroke="#9aabbc" strokeWidth={1.5} rx={2}/>
    <rect x={31} y={4}  width={8}  height={28} fill="#fff"    stroke="#9aabbc" strokeWidth={0.8}/>
    {/* horizontal pipe */}
    <rect x={35} y={30} width={32} height={14} fill="#dce3ed" stroke="#9aabbc" strokeWidth={1.5} rx={2}/>
    <rect x={37} y={33} width={28} height={8}  fill="#fff"    stroke="#9aabbc" strokeWidth={0.8}/>
    {/* elbow fill */}
    <rect x={28} y={30} width={14} height={14} fill="#dce3ed"/>
  </svg>;
}
function IconWinkel()        {
  return <svg viewBox="0 0 80 60" width={80} height={60}>
    <polygon points="10,55 10,5 22,5 22,43 70,43 70,55" fill="#dce3ed" stroke="#9aabbc" strokeWidth={1.5}/>
    <polygon points="16,49 16,11 18,11 18,45 66,45 66,49" fill="#c5d0de"/>
  </svg>;
}
function IconUProfile()      {
  return <svg viewBox="0 0 80 60" width={80} height={60}>
    <path d="M10,5 L10,55 L24,55 L24,20 L56,20 L56,55 L70,55 L70,5 Z" fill="#dce3ed" stroke="#9aabbc" strokeWidth={1.5}/>
    <path d="M18,13 L18,48 L22,48 L22,27 L58,27 L58,48 L62,48 L62,13 Z" fill="#c5d0de"/>
  </svg>;
}
function IconTProfile()      {
  return <svg viewBox="0 0 80 60" width={80} height={60}>
    <polygon points="5,5 75,5 75,18 46,18 46,55 34,55 34,18 5,18" fill="#dce3ed" stroke="#9aabbc" strokeWidth={1.5}/>
    <polygon points="13,11 67,11 67,14 43,14 43,49 37,49 37,14 13,14" fill="#c5d0de"/>
  </svg>;
}
function IconTraeger()       { return <svg viewBox="0 0 80 60" width={80} height={60}><polygon points="5,5 75,5 75,18 46,18 46,42 75,42 75,55 5,55 5,42 34,42 34,18 5,18" fill="#dce3ed" stroke="#9aabbc" strokeWidth={1.5}/><polygon points="13,11 67,11 67,14 43,14 43,46 67,46 67,49 13,49 13,46 37,46 37,14 13,14" fill="#c5d0de"/></svg>; }
function IconSonderprofile() {
  return <svg viewBox="0 0 80 60" width={80} height={60}>
    {/* C-profile cross section */}
    <path d="M15,5 L55,5 L55,18 L28,18 L28,42 L55,42 L55,55 L15,55 Z" fill="#dce3ed" stroke="#9aabbc" strokeWidth={1.5}/>
    <path d="M22,11 L50,11 L50,14 L34,14 L34,46 L50,46 L50,49 L22,49 Z" fill="#c5d0de"/>
  </svg>;
}
function IconBleche()        {
  return <svg viewBox="0 0 80 60" width={80} height={60}>
    {/* perspective plate */}
    <polygon points="8,40 72,40 72,52 8,52" fill="#dce3ed" stroke="#9aabbc" strokeWidth={1.5}/>
    <polygon points="8,40 20,20 84,20 72,40" fill="#c5d0de" stroke="#9aabbc" strokeWidth={1}/>
    <line x1="72" y1="40" x2="84" y2="20" stroke="#9aabbc" strokeWidth={1}/>
    <line x1="72" y1="52" x2="84" y2="32" stroke="#9aabbc" strokeWidth={1}/>
    <polygon points="84,20 84,32 72,52 72,40" fill="#b0bfcf" stroke="#9aabbc" strokeWidth={1}/>
  </svg>;
}
function IconLochbleche()    {
  return <svg viewBox="0 0 80 60" width={80} height={60}>
    <polygon points="8,40 72,40 72,52 8,52" fill="#dce3ed" stroke="#9aabbc" strokeWidth={1.5}/>
    <polygon points="8,40 20,20 84,20 72,40" fill="#c5d0de" stroke="#9aabbc" strokeWidth={1}/>
    <line x1="72" y1="40" x2="84" y2="20" stroke="#9aabbc" strokeWidth={1}/>
    <line x1="72" y1="52" x2="84" y2="32" stroke="#9aabbc" strokeWidth={1}/>
    <polygon points="84,20 84,32 72,52 72,40" fill="#b0bfcf" stroke="#9aabbc" strokeWidth={1}/>
    {/* holes */}
    {[28,42,56,70].map(x => [25,33].map(y => (
      <circle key={`${x}-${y}`} cx={x} cy={y} r={3} fill="#9aabbc" opacity={0.7}/>
    )))}
  </svg>;
}

const FORMS = [
  { id:"rundprofile",     label:"Rund",          Icon: IconRund },
  { id:"vierkantprofile", label:"Vierkant",       Icon: IconVierkant },
  { id:"sechskantprofile",label:"Sechskant",      Icon: IconSechskant },
  { id:"flachprofile",    label:"Flach",          Icon: IconFlach },
  { id:"rundrohre",       label:"Rundrohre",      Icon: IconRundrohre },
  { id:"vierkantrohre",   label:"Vierkantrohre",  Icon: IconVierkantrohre },
  { id:"rohrzubehoer",    label:"Rohrzubehör",    Icon: IconRohrzubehoer },
  { id:"winkelprofile",   label:"Winkel",         Icon: IconWinkel },
  { id:"u-profile",       label:"U-Profile",      Icon: IconUProfile },
  { id:"t-profile",       label:"T-Profile",      Icon: IconTProfile },
  { id:"traeger",         label:"Träger",         Icon: IconTraeger },
  { id:"sonderprofile",   label:"Sonderprofile",  Icon: IconSonderprofile },
  { id:"bleche",          label:"Bleche",         Icon: IconBleche },
  { id:"lochbleche",      label:"Lochbleche",     Icon: IconLochbleche },
];

export default function MetallePage() {
  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f4f6f9", fontFamily: F }}>

      {/* ── Kopfzeile ─────────────────────────────────────────────────── */}
      <header style={{ backgroundColor: "#0b1e36", borderBottom: "1px solid #1e3352" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 32px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link href="/" style={{ textDecoration: "none" }}>
            <EucxLogo variant="dark" size="md" />
          </Link>
          <Link href="/trading" style={{ fontSize: 13, color: "#8aaacf", textDecoration: "none" }}>
            Zum Handelsraum →
          </Link>
        </div>
      </header>

      {/* ── Breadcrumb ─────────────────────────────────────────────────── */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "16px 32px 0" }}>
        <div style={{ display: "flex", gap: 6, fontSize: 12, color: "#888" }}>
          <Link href="/"        style={{ color: "#888", textDecoration: "none" }}>Startseite</Link>
          <span>›</span>
          <span style={{ color: "#333" }}>Metallprodukte</span>
        </div>
      </div>

      {/* ── Seitentitel ────────────────────────────────────────────────── */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 32px 0" }}>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 16, paddingBottom: 24, borderBottom: "1px solid #dde2ea" }}>
          <div>
            <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: BLUE, display: "block", marginBottom: 8 }}>METALLE · STAHL</span>
            <h1 style={{ fontSize: 28, fontWeight: 300, color: "#0d1b2a", margin: 0, lineHeight: 1.2 }}>Formauswahl</h1>
            <p style={{ fontSize: 14, color: "#666", marginTop: 8 }}>14 Produktkategorien · Professioneller Stahlhandel auf EUCX</p>
          </div>
          <div style={{ display: "flex", gap: 24, fontSize: 13, color: "#666" }}>
            <span>✓ BaFin-reguliert</span>
            <span>✓ EN-Normen</span>
            <span>✓ Sofortige Abwicklung</span>
          </div>
        </div>
      </div>

      {/* ── 14 Formen Grid ─────────────────────────────────────────────── */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 32px 64px" }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(155px, 1fr))",
          gap: 1,
          backgroundColor: "#dde2ea",
        }}>
          {FORMS.map(({ id, label, Icon }) => (
            <Link key={id} href={`/metalle/${id}`} style={{ textDecoration: "none" }}>
              <div style={{
                backgroundColor: "#fff",
                padding: "28px 16px 20px",
                display: "flex", flexDirection: "column", alignItems: "center", gap: 14,
                cursor: "pointer", transition: "background .15s",
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.backgroundColor = "#f0f4fb"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.backgroundColor = "#fff"; }}
              >
                <Icon />
                <span style={{ fontSize: 13, fontWeight: 500, color: "#0d1b2a", textAlign: "center" }}>{label}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
