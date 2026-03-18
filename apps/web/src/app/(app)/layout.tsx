import { Navbar } from "@/components/layout/Navbar";
import { QueryProvider } from "@/providers/QueryProvider";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <div className="flex flex-col min-h-screen" style={{ backgroundColor: "#F8FAFC" }}>
        <Navbar />
        <main className="flex-1 w-full">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
            {children}
          </div>
        </main>
        <footer className="bg-white border-t border-slate-200 mt-auto">
          <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ backgroundColor: "#2563EB" }}>
                <span className="text-white font-bold text-xs">E</span>
              </div>
              <div>
                <p className="text-slate-700 font-semibold text-sm leading-none">EUCX GmbH</p>
                <p className="text-slate-400 text-xs mt-0.5">European Union Commodity Exchange · Frankfurt am Main</p>
              </div>
            </div>
            <nav className="flex items-center gap-5 text-xs text-slate-400">
              <a href="#" className="hover:text-slate-600 transition-colors">Impressum</a>
              <a href="#" className="hover:text-slate-600 transition-colors">Datenschutz</a>
              <a href="#" className="hover:text-slate-600 transition-colors">Nutzungsbedingungen</a>
              <span>© 2026</span>
            </nav>
          </div>
        </footer>
      </div>
    </QueryProvider>
  );
}
