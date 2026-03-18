/**
 * Auth-Layout - Behörden-Portal-Stil
 * Pattern: ELSTER / BundID - schlichter hellgrauer Hintergrund,
 * zentrierte Karte, dezenter institutioneller Header
 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gov-bg flex flex-col">

      {/* ── Institutioneller Portal-Header ───────────────────────────────── */}
      <div className="bg-gov-blue-header">
        <div className="max-w-screen-xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white/10 border border-white/20 flex items-center justify-center rounded-sm">
              <span className="text-white font-bold text-sm">E</span>
            </div>
            <div>
              <p className="text-white font-bold text-base leading-none">EUCX</p>
              <p className="text-white/60 text-[10px] leading-none mt-0.5 tracking-wider">
                EU COMMODITY EXCHANGE
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <svg width="12" height="14" viewBox="0 0 12 14" fill="none" aria-hidden="true">
              <rect x="1" y="6" width="10" height="7" rx="1" stroke="rgba(255,255,255,0.5)" strokeWidth="1.2"/>
              <path d="M4 6V4a2 2 0 014 0v2" stroke="rgba(255,255,255,0.5)" strokeWidth="1.2" strokeLinecap="round"/>
            </svg>
            <span className="text-white/60 text-xs">Gesicherter Bereich · TLS 1.3</span>
          </div>
        </div>
      </div>

      {/* ── Zentrierter Inhalt ────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        {children}
      </div>

      {/* ── Portal-Footer ─────────────────────────────────────────────────── */}
      <div className="bg-gov-white border-t border-gov-border">
        <div className="max-w-screen-xl mx-auto px-6 py-4 flex items-center justify-between">
          <p className="text-xs text-gov-text-muted">© 2026 EUCX GmbH · Frankfurt am Main</p>
          <nav className="flex items-center gap-4 text-xs text-gov-text-muted">
            <a href="#" className="hover:text-gov-blue transition-colors">Impressum</a>
            <a href="#" className="hover:text-gov-blue transition-colors">Datenschutz</a>
            <a href="#" className="hover:text-gov-blue transition-colors">Barrierefreiheit</a>
          </nav>
        </div>
      </div>
    </div>
  );
}
