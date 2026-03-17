import { Navbar }       from "@/components/layout/Navbar";
import { ToastProvider } from "@/components/ui/Toast";
import { QueryProvider } from "@/providers/QueryProvider";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
    <ToastProvider>
      <div className="flex flex-col min-h-screen bg-gov-bg">

        <Navbar />

        {/* ── Haupt-Inhalt ──────────────────────────────────────────────── */}
        <main className="flex-1 w-full">
          <div className="max-w-screen-xl mx-auto px-6 py-8">
            {children}
          </div>
        </main>

        {/* ── Institutioneller Footer (BWDS-Pattern) ────────────────────── */}
        <footer className="bg-gov-white border-t border-gov-border mt-auto">
          <div className="max-w-screen-xl mx-auto px-6 py-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 bg-gov-blue flex items-center justify-center rounded-sm">
                  <span className="text-white font-bold text-sm">E</span>
                </div>
                <div>
                  <p className="text-gov-text font-semibold text-sm">EUCX GmbH</p>
                  <p className="text-gov-text-muted text-xs">European Union Commodity Exchange · Frankfurt am Main</p>
                </div>
              </div>
              <nav className="flex items-center gap-5 text-xs text-gov-text-muted">
                <a href="#" className="hover:text-gov-blue transition-colors">Impressum</a>
                <a href="#" className="hover:text-gov-blue transition-colors">Datenschutz</a>
                <a href="#" className="hover:text-gov-blue transition-colors">Nutzungsbedingungen</a>
                <span>© 2026</span>
              </nav>
            </div>
          </div>
        </footer>

      </div>
    </ToastProvider>
    </QueryProvider>
  );
}
