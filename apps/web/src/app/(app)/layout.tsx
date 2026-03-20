import { Navbar } from "@/components/layout/Navbar";
import { QueryProvider } from "@/providers/QueryProvider";
import Link from "next/link";
import { EucxLogo } from "@/components/logo/EucxLogo";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", backgroundColor: "#f5f7fa", fontFamily: "'IBM Plex Sans', Arial, sans-serif" }}>
        <Navbar />
        <main style={{ flex: 1, width: "100%" }}>
          <div style={{ maxWidth: 1280, margin: "0 auto", padding: "32px 40px" }}>
            {children}
          </div>
        </main>
        <footer style={{ backgroundColor: "#ffffff", borderTop: "1px solid #e8e8e8" }}>
          <div style={{ maxWidth: 1280, margin: "0 auto", padding: "16px 40px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
            <Link href="/" style={{ textDecoration: "none" }}>
              <EucxLogo size="sm" />
            </Link>
            <nav style={{ display: "flex", alignItems: "center", gap: 20, fontSize: 11, color: "#aaa" }}>
              <a href="/impressum" style={{ color: "#aaa", textDecoration: "none" }}>Impressum</a>
              <a href="/datenschutz" style={{ color: "#aaa", textDecoration: "none" }}>Datenschutz</a>
              <a href="/agb" style={{ color: "#aaa", textDecoration: "none" }}>AGB</a>
              <span>© 2026 EUCX</span>
            </nav>
          </div>
        </footer>
      </div>
    </QueryProvider>
  );
}
