import { Navbar } from "@/components/layout/Navbar";
import { QueryProvider } from "@/providers/QueryProvider";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <div className="flex flex-col min-h-screen bg-gray-50">
        <Navbar />
        <main className="flex-1 w-full">
          <div className="max-w-7xl mx-auto px-6 py-8">
            {children}
          </div>
        </main>
        <footer className="bg-white border-t border-gray-200 mt-auto">
          <div className="max-w-7xl mx-auto px-6 py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 bg-[#154194] rounded-sm flex items-center justify-center">
                <span className="text-white font-bold text-xs">E</span>
              </div>
              <div>
                <p className="text-gray-700 font-semibold text-sm leading-none">EUCX GmbH</p>
                <p className="text-gray-400 text-xs mt-0.5">European Union Commodity Exchange · Frankfurt am Main</p>
              </div>
            </div>
            <nav className="flex items-center gap-5 text-xs text-gray-400">
              <a href="#" className="hover:text-gray-600 transition-colors">Impressum</a>
              <a href="#" className="hover:text-gray-600 transition-colors">Datenschutz</a>
              <a href="#" className="hover:text-gray-600 transition-colors">Nutzungsbedingungen</a>
              <span>© 2026</span>
            </nav>
          </div>
        </footer>
      </div>
    </QueryProvider>
  );
}
