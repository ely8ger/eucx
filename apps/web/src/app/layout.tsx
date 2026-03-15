import type { Metadata, Viewport } from "next";
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
    type:     "website",
    siteName: "EUCX — European Union Commodity Exchange",
    locale:   "de_DE",
  },
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  width:        "device-width",
  initialScale: 1,
  themeColor:   "#003D6B",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
