import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gov-bg flex flex-col">
      {/* Header */}
      <header className="bg-gov-blue-header border-b border-white/10">
        <div className="max-w-screen-xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-white/10 border border-white/20 flex items-center justify-center rounded-sm">
              <span className="text-white font-bold text-sm">E</span>
            </div>
            <div>
              <p className="text-white font-bold text-base leading-none">EUCX</p>
              <p className="text-white/60 text-[10px] leading-none mt-0.5 tracking-wider uppercase">
                European Union Commodity Exchange
              </p>
            </div>
          </div>
          <nav className="flex items-center gap-6">
            <a href="#marktbereiche" className="text-white/70 text-sm hover:text-white transition-colors hidden md:block">
              Marktbereiche
            </a>
            <a href="#teilnehmer" className="text-white/70 text-sm hover:text-white transition-colors hidden md:block">
              Teilnehmer
            </a>
            <a href="#regulierung" className="text-white/70 text-sm hover:text-white transition-colors hidden md:block">
              Regulierung
            </a>
            <Link
              href="/login"
              className="h-9 px-5 bg-white text-gov-blue-header font-semibold text-sm rounded-sm hover:bg-gov-blue-light transition-colors flex items-center"
            >
              Anmelden
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gov-blue-header pb-20 pt-16">
        <div className="max-w-screen-xl mx-auto px-6 text-center">
          <p className="text-white/50 text-xs uppercase tracking-widest font-medium mb-4">
            Institutionelle Handelsplattform · B2B · EU-reguliert
          </p>
          <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight max-w-3xl mx-auto">
            Digitale Warenbörse für den institutionellen Rohstoffhandel in der EU
          </h1>
          <p className="mt-5 text-white/65 text-lg max-w-2xl mx-auto leading-relaxed">
            Transparentes Orderbuch, sofortige Abwicklung, BaFin-regulierter Markt.
            Metalle, Holz, Agrar und Industriegüter — alles auf einer Plattform.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/login"
              className="h-12 px-8 bg-white text-gov-blue-header font-bold text-sm rounded-sm hover:bg-gov-blue-light transition-colors flex items-center gap-2"
            >
              Zum Teilnehmerportal anmelden
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path d="M3 7h8M8 4l3 3-3 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
            <a
              href="#teilnehmer"
              className="h-12 px-8 border border-white/30 text-white font-semibold text-sm rounded-sm hover:bg-white/10 transition-colors flex items-center"
            >
              Registrierung beantragen
            </a>
          </div>
          {/* Vertrauensindikatoren */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-white/45 text-xs">
            <span className="flex items-center gap-1.5">
              <svg width="12" height="13" viewBox="0 0 12 13" fill="none" aria-hidden="true">
                <rect x="1" y="5.5" width="10" height="7" rx="1" stroke="currentColor" strokeWidth="1.2" />
                <path d="M3.5 5.5V3.5a2.5 2.5 0 015 0v2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
              </svg>
              TLS 1.3 verschlüsselt
            </span>
            <span>DSGVO-konform</span>
            <span>BaFin-regulierter Markt</span>
            <span>ISO 27001 zertifiziert</span>
            <span>Handelszeiten Mo–Fr 09:00–17:30</span>
          </div>
        </div>
      </section>

      {/* Statistiken */}
      <section className="bg-gov-white border-b border-gov-border">
        <div className="max-w-screen-xl mx-auto px-6 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { value: "€ 2,4 Mrd.", label: "Handelsvolumen 2025" },
              { value: "1.200+", label: "Zugelassene Teilnehmer" },
              { value: "4 Sektionen", label: "Warenbereiche" },
              { value: "98,7 %", label: "Ausführungsquote" },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-2xl font-bold text-gov-blue">{stat.value}</p>
                <p className="text-xs text-gov-text-muted mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Marktbereiche */}
      <section id="marktbereiche" className="py-16">
        <div className="max-w-screen-xl mx-auto px-6">
          <div className="mb-10">
            <p className="text-xs uppercase tracking-widest text-gov-text-muted font-medium mb-2">Handelsumfang</p>
            <h2 className="text-2xl font-bold text-gov-text">Marktbereiche</h2>
            <p className="text-gov-text-muted text-sm mt-2 max-w-xl">
              Der EUCX organisiert Handelsveranstaltungen in vier regulierten Warensektionen.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                code: "MET",
                title: "Metallprodukte",
                desc: "Walzstahl, Armaturen, Rohre, Nichteisenmetalle, Schrott",
                items: ["Bewehrungsstahl", "Walzblech", "Rohre & Profile", "Kupfer / Aluminium"],
                color: "border-l-gov-blue",
              },
              {
                code: "HOL",
                title: "Holz & Forst",
                desc: "Rundholz, Schnittholz, Holzwerkstoffe, Zellstoff",
                items: ["Rundholz", "Schnittholz", "Sperrholz / MDF", "Forstwirtschaft"],
                color: "border-l-gov-success",
              },
              {
                code: "AGR",
                title: "Agrarprodukte",
                desc: "Getreide, Ölsaaten, Milchprodukte, Fleisch",
                items: ["Weizen / Gerste", "Raps / Soja", "Milchpulver", "Fleisch & Geflügel"],
                color: "border-l-gov-warning",
              },
              {
                code: "PPT",
                title: "Papier & Baustoffe",
                desc: "Papier, Pappe, Baumaterialien, Chemie",
                items: ["Papier & Karton", "Verpackung", "Zement / Beton", "Industriechemie"],
                color: "border-l-gov-info",
              },
            ].map((section) => (
              <div
                key={section.code}
                className={`bg-gov-white border border-gov-border border-l-4 ${section.color} rounded-sm p-5 hover:shadow-sm transition-shadow`}
              >
                <div className="flex items-start justify-between mb-3">
                  <span className="text-xs font-bold text-gov-text-muted tracking-widest">{section.code}</span>
                </div>
                <h3 className="text-base font-bold text-gov-text mb-1">{section.title}</h3>
                <p className="text-xs text-gov-text-muted mb-4 leading-relaxed">{section.desc}</p>
                <ul className="space-y-1">
                  {section.items.map((item) => (
                    <li key={item} className="text-xs text-gov-text-2 flex items-center gap-1.5">
                      <span className="w-1 h-1 rounded-full bg-gov-border flex-none" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Wie es funktioniert */}
      <section className="bg-gov-white border-t border-b border-gov-border py-16">
        <div className="max-w-screen-xl mx-auto px-6">
          <div className="mb-10">
            <p className="text-xs uppercase tracking-widest text-gov-text-muted font-medium mb-2">Prozess</p>
            <h2 className="text-2xl font-bold text-gov-text">So funktioniert der Handel</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { step: "01", title: "Registrierung", desc: "Akkreditierung als zugelassener Marktteilnehmer — Käufer oder Verkäufer." },
              { step: "02", title: "Auftragserfassung", desc: "Kauf- oder Verkaufsauftrag für die gewünschte Handelssitzung einreichen." },
              { step: "03", title: "Handelssitzung", desc: "Live-Orderbuch: Preisfindung, Verhandlung und Abschluss in Echtzeit." },
              { step: "04", title: "Abwicklung", desc: "Biржевой договор, Kautionsabrechnung und Lieferbestätigung." },
            ].map((s) => (
              <div key={s.step} className="flex gap-4">
                <div className="flex-none w-9 h-9 bg-gov-blue-light border border-gov-blue/20 rounded-sm flex items-center justify-center">
                  <span className="text-gov-blue font-bold text-xs">{s.step}</span>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gov-text mb-1">{s.title}</h3>
                  <p className="text-xs text-gov-text-muted leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Teilnehmer CTA */}
      <section id="teilnehmer" className="py-16">
        <div className="max-w-screen-xl mx-auto px-6">
          <div className="bg-gov-blue rounded-sm p-10 text-center">
            <h2 className="text-2xl font-bold text-white mb-3">Zugelassener Marktteilnehmer werden</h2>
            <p className="text-white/70 text-sm max-w-xl mx-auto mb-8">
              Unternehmen mit Sitz in der EU können eine Akkreditierung beantragen.
              Nach Prüfung erhalten Sie Zugang zu allen Handelssektionen.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/register"
                className="h-11 px-7 bg-white text-gov-blue font-bold text-sm rounded-sm hover:bg-gov-blue-light transition-colors flex items-center"
              >
                Registrierung beantragen
              </Link>
              <Link
                href="/login"
                className="h-11 px-7 border border-white/30 text-white font-semibold text-sm rounded-sm hover:bg-white/10 transition-colors flex items-center"
              >
                Bereits registriert — Anmelden
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Regulierung */}
      <section id="regulierung" className="bg-gov-white border-t border-gov-border py-12">
        <div className="max-w-screen-xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <p className="text-xs uppercase tracking-widest text-gov-text-muted font-medium mb-3">Regulierung</p>
              <h3 className="text-sm font-bold text-gov-text mb-2">BaFin-regulierter Marktbetreiber</h3>
              <p className="text-xs text-gov-text-muted leading-relaxed">
                EUCX GmbH ist als organisierter Handelssystem (OTF) im Sinne der MiFID II bei der BaFin registriert.
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest text-gov-text-muted font-medium mb-3">Datenschutz</p>
              <h3 className="text-sm font-bold text-gov-text mb-2">DSGVO-konforme Verarbeitung</h3>
              <p className="text-xs text-gov-text-muted leading-relaxed">
                Alle personenbezogenen Daten werden auf Servern innerhalb der EU verarbeitet und gespeichert.
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest text-gov-text-muted font-medium mb-3">Sicherheit</p>
              <h3 className="text-sm font-bold text-gov-text mb-2">Zwei-Faktor-Authentifizierung</h3>
              <p className="text-xs text-gov-text-muted leading-relaxed">
                Zugang zum Teilnehmerportal ausschließlich mit Passwort und TOTP-Code (2FA).
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gov-blue-header border-t border-white/10 mt-auto">
        <div className="max-w-screen-xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/10 border border-white/20 flex items-center justify-center rounded-sm">
                <span className="text-white font-bold text-sm">E</span>
              </div>
              <div>
                <p className="text-white font-bold text-sm leading-none">EUCX</p>
                <p className="text-white/50 text-[10px] leading-none mt-0.5">© 2026 EUCX GmbH · Frankfurt am Main</p>
              </div>
            </div>
            <nav className="flex flex-wrap gap-6 text-xs text-white/50">
              <a href="#" className="hover:text-white transition-colors">Impressum</a>
              <a href="#" className="hover:text-white transition-colors">Datenschutzerklärung</a>
              <a href="#" className="hover:text-white transition-colors">Nutzungsbedingungen</a>
              <a href="#" className="hover:text-white transition-colors">Barrierefreiheit</a>
              <a href="#" className="hover:text-white transition-colors">Kontakt</a>
            </nav>
          </div>
        </div>
      </footer>
    </div>
  );
}
