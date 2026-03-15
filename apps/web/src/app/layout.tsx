import type { Metadata, Viewport } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: {
    default: "EUCX — European Union Commodity Exchange",
    template: "%s | EUCX",
  },
  description: "Digitale B2B-Warenbörse für Rohstoffe und Waren aller Kategorien — Metalle, Holz, Agrar, Chemie, Energie und mehr. Transparent, sicher, anonym.",
  keywords: ["Warenbörse", "B2B", "Rohstoffe", "Metalle", "Holz", "Agrar", "Commodity Exchange", "EU"],
  authors: [{ name: "EUCX" }],
  metadataBase: new URL("https://eucx.eu"),
  openGraph: {
    type:        "website",
    siteName:    "EUCX — European Union Commodity Exchange",
    locale:      "de_DE",
  },
  robots: {
    index:  false,  // B2B-Plattform, nicht indexieren
    follow: false,
  },
};

export const viewport: Viewport = {
  width:        "device-width",
  initialScale: 1,
  themeColor:   "#003D6B",  // Commerzbank Petrol
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de" suppressHydrationWarning>
      <body>
        <div className="flex flex-col h-screen overflow-hidden">
          {/* Top-Navigation */}
          <Navbar />

          {/* Hauptbereich: Sidebar + Content */}
          <div className="flex flex-1 overflow-hidden">
            <Sidebar />
            <main className="flex-1 overflow-auto bg-cb-gray-50 p-5">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
