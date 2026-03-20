import { Navbar } from "@/components/layout/Navbar";
import { QueryProvider } from "@/providers/QueryProvider";
import Link from "next/link";
import { EucxLogo } from "@/components/logo/EucxLogo";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <div className="flex flex-col min-h-screen" style={{ backgroundColor: "#F8FAFC" }}>
        <Navbar />
        <main className="flex-1 w-full">
          <div className="max-w-6xl mx-auto px-6 lg:px-10 py-7">
            {children}
          </div>
        </main>
        <footer className="bg-white border-t border-slate-200 mt-auto">
          <div className="max-w-6xl mx-auto px-6 lg:px-10 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <Link href="/" style={{ textDecoration: "none" }}>
              <EucxLogo size="sm" />
            </Link>
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
