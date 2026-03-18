import Link from "next/link";
import {
  ShieldCheck,
  TrendingUp,
  FileText,
  Users,
  ChevronRight,
  BarChart3,
  Layers,
  Lock,
  Globe,
  ArrowRight,
  CheckCircle2,
  Building2,
  Wheat,
  Trees,
  Package,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">

      {/* ── Topbar ── */}
      <div className="bg-gov-blue-header">
        <div className="max-w-7xl mx-auto px-6 py-2 flex items-center justify-between">
          <p className="text-white/50 text-xs">
            BaFin-regulierte Handelsplattform · Frankfurt am Main
          </p>
          <div className="flex items-center gap-1.5 text-white/50 text-xs">
            <Lock size={11} />
            TLS 1.3 · DSGVO-konform
          </div>
        </div>
      </div>

      {/* ── Header ── */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gov-blue rounded-sm flex items-center justify-center">
              <span className="text-white font-bold text-sm tracking-wide">E</span>
            </div>
            <div>
              <span className="font-bold text-gov-text text-lg leading-none">EUCX</span>
              <p className="text-[10px] text-gray-400 leading-none mt-0.5 tracking-wider uppercase">EU Commodity Exchange</p>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm text-gray-600">
            <a href="#marktbereiche" className="hover:text-gov-blue transition-colors">Marktbereiche</a>
            <a href="#wie-es-funktioniert" className="hover:text-gov-blue transition-colors">So funktioniert's</a>
            <a href="#regulierung" className="hover:text-gov-blue transition-colors">Regulierung</a>
            <a href="#teilnehmer" className="hover:text-gov-blue transition-colors">Teilnehmer werden</a>
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-gray-600 hover:text-gov-blue transition-colors font-medium">
              Anmelden
            </Link>
            <Link
              href="/register"
              className="h-9 px-5 bg-gov-blue text-white text-sm font-semibold rounded-sm hover:bg-gov-blue-dark transition-colors flex items-center gap-1.5"
            >
              Registrieren
              <ChevronRight size={14} />
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="bg-gradient-to-b from-gov-blue-header to-gov-blue pt-24 pb-32">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 mb-8">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-white/80 text-xs font-medium tracking-wide">Handelssitzungen Mo–Fr 09:00–17:30 Uhr</span>
          </div>

          <h1 className="text-5xl md:text-6xl font-bold text-white leading-[1.1] max-w-4xl mx-auto">
            Die institutionelle Warenbörse für die Europäische Union
          </h1>

          <p className="mt-6 text-xl text-white/65 max-w-2xl mx-auto leading-relaxed">
            Transparentes Orderbuch, sofortige Abwicklung und BaFin-regulierter Marktbetrieb —
            für Metalle, Holz, Agrar und Industriegüter.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/login"
              className="group h-12 px-8 bg-white text-gov-blue font-bold text-sm rounded-sm hover:bg-gray-50 transition-colors flex items-center gap-2 shadow-lg"
            >
              Zum Teilnehmerportal
              <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <a
              href="#wie-es-funktioniert"
              className="h-12 px-8 border border-white/30 text-white font-semibold text-sm rounded-sm hover:bg-white/10 transition-colors flex items-center gap-2"
            >
              Mehr erfahren
            </a>
          </div>

          {/* Vertrauens-Badges */}
          <div className="mt-16 flex flex-wrap items-center justify-center gap-8">
            {[
              { icon: ShieldCheck, label: "BaFin-reguliert" },
              { icon: Globe, label: "EU-weit zugelassen" },
              { icon: Lock, label: "ISO 27001 zertifiziert" },
              { icon: FileText, label: "DSGVO-konform" },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2 text-white/50 text-sm">
                <Icon size={16} />
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Statistiken ── */}
      <section className="bg-white border-b border-gray-100 -mt-1">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: "€ 2,4 Mrd.", label: "Handelsvolumen 2025", sub: "+18 % ggü. Vorjahr" },
              { value: "1.200+", label: "Zugelassene Teilnehmer", sub: "in 27 EU-Staaten" },
              { value: "4", label: "Warensektionen", sub: "Metalle · Holz · Agrar · PPT" },
              { value: "98,7 %", label: "Ausführungsquote", sub: "aller Aufträge" },
            ].map((s) => (
              <div key={s.label} className="py-4">
                <p className="text-3xl font-bold text-gov-blue">{s.value}</p>
                <p className="text-sm font-semibold text-gray-700 mt-1">{s.label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{s.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Marktbereiche ── */}
      <section id="marktbereiche" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-xs font-semibold uppercase tracking-widest text-gov-blue mb-3">Handelsumfang</p>
            <h2 className="text-4xl font-bold text-gray-900">Vier regulierte Warensektionen</h2>
            <p className="mt-4 text-lg text-gray-500 max-w-2xl mx-auto">
              Der EUCX organisiert tägliche Handelssitzungen in vier Hauptbereichen mit
              vollständiger Markttransparenz und zentralem Clearing.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                Icon: TrendingUp,
                code: "METALLE",
                title: "Metallprodukte",
                desc: "Walzstahl, Armaturen, Rohre, Nichteisenmetalle und Metallschrott für den industriellen Handel.",
                items: ["Bewehrungsstahl & Profile", "Blech & Coils", "Kupfer / Aluminium / Zink", "Metallschrott"],
                color: "text-blue-600",
                bg: "bg-blue-50",
                border: "border-blue-100",
              },
              {
                Icon: Trees,
                code: "HOLZ",
                title: "Holz & Forst",
                desc: "Rundholz, Schnittholz und Holzwerkstoffe aus nachhaltig bewirtschafteten Wäldern.",
                items: ["Rundholz & Stammholz", "Schnittholz", "Sperrholz / MDF", "Forstwirtschaft"],
                color: "text-emerald-600",
                bg: "bg-emerald-50",
                border: "border-emerald-100",
              },
              {
                Icon: Wheat,
                code: "AGRAR",
                title: "Agrarprodukte",
                desc: "Getreide, Ölsaaten, Milch- und Fleischprodukte für den EU-weiten Agrarhandel.",
                items: ["Weizen / Gerste / Mais", "Raps & Ölsaaten", "Milchprodukte", "Fleisch & Geflügel"],
                color: "text-amber-600",
                bg: "bg-amber-50",
                border: "border-amber-100",
              },
              {
                Icon: Package,
                code: "PPT",
                title: "Papier & Baustoffe",
                desc: "Papier, Pappe, Zement, Baumaterialien und Industriechemikalien.",
                items: ["Papier & Karton", "Verpackungsmaterial", "Zement & Beton", "Industriechemie"],
                color: "text-purple-600",
                bg: "bg-purple-50",
                border: "border-purple-100",
              },
            ].map(({ Icon, code, title, desc, items, color, bg, border }) => (
              <div key={code} className={`bg-white rounded-lg border ${border} p-6 hover:shadow-md transition-shadow`}>
                <div className={`w-10 h-10 ${bg} rounded-lg flex items-center justify-center mb-4`}>
                  <Icon size={20} className={color} />
                </div>
                <p className={`text-xs font-bold uppercase tracking-widest ${color} mb-1`}>{code}</p>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
                <p className="text-sm text-gray-500 mb-4 leading-relaxed">{desc}</p>
                <ul className="space-y-1.5">
                  {items.map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle2 size={13} className={color} />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Wie es funktioniert ── */}
      <section id="wie-es-funktioniert" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-xs font-semibold uppercase tracking-widest text-gov-blue mb-3">Prozess</p>
            <h2 className="text-4xl font-bold text-gray-900">In vier Schritten zum Abschluss</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            {/* Verbindungslinie */}
            <div className="hidden md:block absolute top-8 left-[12.5%] right-[12.5%] h-px bg-gray-200" />

            {[
              {
                step: "01",
                Icon: Users,
                title: "Akkreditierung",
                desc: "Registrierung als zugelassener Marktteilnehmer mit Unternehmensverifizierung und KYC-Prüfung.",
              },
              {
                step: "02",
                Icon: FileText,
                title: "Auftragserfassung",
                desc: "Kauf- oder Verkaufsauftrag mit vollständiger Warenspezifikation für die gewünschte Sitzung einreichen.",
              },
              {
                step: "03",
                Icon: BarChart3,
                title: "Handelssitzung",
                desc: "Live-Orderbuch mit Echtzeit-Preisfindung, Gebotsverhandlung und Abschluss.",
              },
              {
                step: "04",
                Icon: ShieldCheck,
                title: "Clearing & Abwicklung",
                desc: "Automatisches Clearing, Biржевой-Vertrag, Kautionsabrechnung und Lieferbestätigung.",
              },
            ].map(({ step, Icon, title, desc }) => (
              <div key={step} className="flex flex-col items-center text-center">
                <div className="relative z-10 w-16 h-16 bg-white border-2 border-gov-blue rounded-full flex flex-col items-center justify-center mb-5 shadow-sm">
                  <Icon size={22} className="text-gov-blue" />
                </div>
                <span className="text-xs font-bold text-gov-blue/50 tracking-widest mb-1">{step}</span>
                <h3 className="text-base font-bold text-gray-900 mb-2">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-gov-blue mb-3">Plattform</p>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Börseninfrastruktur auf institutionellem Niveau
              </h2>
              <p className="text-lg text-gray-500 mb-8 leading-relaxed">
                EUCX wurde von Grund auf für den regulierten Warenterminhandel entwickelt —
                mit den gleichen Sicherheits- und Transparenzstandards wie etablierte Rohstoffbörsen.
              </p>
              <ul className="space-y-4">
                {[
                  { Icon: Layers, title: "Zentrales Orderbuch", desc: "Price-Time-Priority Matching mit vollständiger Preistransparenz für alle Teilnehmer" },
                  { Icon: ShieldCheck, title: "Zentrales Clearing", desc: "Automatische Kautionsverwaltung und Settlement nach jedem Abschluss" },
                  { Icon: BarChart3, title: "Echtzeit-Marktdaten", desc: "OHLCV-Kerzen, Orderbuch-Tiefe und Handelssitzungsstatistiken live" },
                  { Icon: Building2, title: "KYC & Compliance", desc: "Vollständige Teilnehmerprüfung, Audit-Trail und regulatorisches Reporting" },
                ].map(({ Icon, title, desc }) => (
                  <li key={title} className="flex items-start gap-4">
                    <div className="flex-none w-10 h-10 bg-gov-blue-light rounded-lg flex items-center justify-center mt-0.5">
                      <Icon size={18} className="text-gov-blue" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{title}</p>
                      <p className="text-sm text-gray-500 mt-0.5">{desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Mockup Panel */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-xl overflow-hidden">
              <div className="bg-gov-blue-header px-5 py-3 flex items-center gap-2">
                <div className="flex gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-white/20" />
                  <span className="w-3 h-3 rounded-full bg-white/20" />
                  <span className="w-3 h-3 rounded-full bg-white/20" />
                </div>
                <span className="text-white/60 text-xs ml-2">Handelssitzung — Metalle #247</span>
              </div>
              <div className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider">Bewehrungsstahl A1 · Ø12mm</p>
                    <p className="text-2xl font-bold text-gray-900 mt-0.5">€ 587,00 <span className="text-sm font-normal text-gray-400">/ t</span></p>
                  </div>
                  <span className="px-3 py-1 bg-green-50 text-green-700 text-xs font-semibold rounded-full border border-green-100">● OFFEN</span>
                </div>
                {/* Mini Orderbuch */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <p className="text-red-500 font-semibold uppercase tracking-wider mb-2">Verkauf</p>
                    {[["592,00", "30 t"], ["590,50", "15 t"], ["589,00", "50 t"], ["588,00", "20 t"], ["587,50", "45 t"]].map(([price, qty]) => (
                      <div key={price} className="flex justify-between py-1 border-b border-gray-50">
                        <span className="text-red-600 font-mono">{price}</span>
                        <span className="text-gray-400">{qty}</span>
                      </div>
                    ))}
                  </div>
                  <div>
                    <p className="text-green-600 font-semibold uppercase tracking-wider mb-2">Kauf</p>
                    {[["587,00", "25 t"], ["586,50", "40 t"], ["585,00", "60 t"], ["584,00", "35 t"], ["583,50", "20 t"]].map(([price, qty]) => (
                      <div key={price} className="flex justify-between py-1 border-b border-gray-50">
                        <span className="text-green-600 font-mono">{price}</span>
                        <span className="text-gray-400">{qty}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                  {[["Umsatz", "€ 1,24 Mio."], ["Abschlüsse", "18"], ["Zeit", "14:32"]].map(([label, val]) => (
                    <div key={label} className="bg-gray-50 rounded-lg p-2.5">
                      <p className="text-xs text-gray-400">{label}</p>
                      <p className="text-sm font-bold text-gray-800 mt-0.5">{val}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Regulierung ── */}
      <section id="regulierung" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-xs font-semibold uppercase tracking-widest text-gov-blue mb-3">Vertrauen & Sicherheit</p>
            <h2 className="text-4xl font-bold text-gray-900">Regulierung auf höchstem Niveau</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                Icon: ShieldCheck,
                title: "BaFin-regulierter Marktbetreiber",
                desc: "EUCX GmbH ist als Organisiertes Handelssystem (OTF) gemäß MiFID II bei der BaFin registriert und wird laufend geprüft.",
              },
              {
                Icon: Lock,
                title: "Maximale Datensicherheit",
                desc: "ISO 27001-zertifizierte Infrastruktur, TLS 1.3-Verschlüsselung, Zwei-Faktor-Authentifizierung für alle Teilnehmer.",
              },
              {
                Icon: Globe,
                title: "DSGVO & EU-Compliance",
                desc: "Alle personenbezogenen Daten werden ausschließlich auf EU-Servern verarbeitet. Vollständiger Audit-Trail für jede Transaktion.",
              },
            ].map(({ Icon, title, desc }) => (
              <div key={title} className="p-8 rounded-xl border border-gray-200 hover:border-gov-blue/30 hover:shadow-md transition-all">
                <div className="w-12 h-12 bg-gov-blue-light rounded-xl flex items-center justify-center mb-5">
                  <Icon size={22} className="text-gov-blue" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section id="teilnehmer" className="py-24 bg-gov-blue">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Jetzt als Marktteilnehmer registrieren
          </h2>
          <p className="text-xl text-white/65 max-w-2xl mx-auto mb-10">
            Unternehmen mit Sitz in der EU können eine Akkreditierung beantragen.
            Nach erfolgreicher KYC-Prüfung erhalten Sie sofortigen Zugang zu allen vier Handelssektionen.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/register"
              className="group h-12 px-8 bg-white text-gov-blue font-bold text-sm rounded-sm hover:bg-gray-50 transition-colors flex items-center gap-2 shadow-lg"
            >
              Akkreditierung beantragen
              <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link
              href="/login"
              className="h-12 px-8 border border-white/30 text-white font-semibold text-sm rounded-sm hover:bg-white/10 transition-colors flex items-center gap-2"
            >
              Bereits Teilnehmer — Anmelden
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-gray-900 text-gray-400">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
            <div className="md:col-span-1">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 bg-gov-blue rounded-sm flex items-center justify-center">
                  <span className="text-white font-bold text-sm">E</span>
                </div>
                <span className="text-white font-bold text-base">EUCX</span>
              </div>
              <p className="text-sm leading-relaxed text-gray-500">
                Digitale B2B-Warenbörse für institutionellen Rohstoffhandel in der EU.
              </p>
            </div>
            {[
              {
                title: "Plattform",
                links: ["Marktbereiche", "Handelssitzungen", "Orderbuch", "API-Zugang"],
              },
              {
                title: "Teilnehmer",
                links: ["Registrierung", "Akkreditierung", "Dokumentation", "Support"],
              },
              {
                title: "Rechtliches",
                links: ["Impressum", "Datenschutz", "Nutzungsbedingungen", "Barrierefreiheit"],
              },
            ].map(({ title, links }) => (
              <div key={title}>
                <p className="text-white font-semibold text-sm mb-4">{title}</p>
                <ul className="space-y-2.5">
                  {links.map((link) => (
                    <li key={link}>
                      <a href="#" className="text-sm hover:text-white transition-colors">{link}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-gray-600">© 2026 EUCX GmbH · Frankfurt am Main · HRB 123456 AG Frankfurt</p>
            <p className="text-xs text-gray-600">Reguliert durch die BaFin · MiFID II OTF-Zulassung</p>
          </div>
        </div>
      </footer>

    </div>
  );
}
