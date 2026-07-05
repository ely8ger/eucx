import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Datenschutzerklärung",
  description: "Datenschutzerklärung der EUCX gemäß DSGVO. Informationen zur Verarbeitung personenbezogener Daten und Ihren Rechten als Betroffener.",
  robots: { index: false, follow: false },
  alternates: { canonical: "https://eucx.eu/datenschutz" },
};

export default function DatenschutzLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
