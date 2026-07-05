import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Impressum",
  description: "Impressum der EUCX — European Union Commodity Exchange. Pflichtangaben gemäß § 5 TMG und § 55 RStV.",
  robots: { index: false, follow: false },
  alternates: { canonical: "https://eucx.eu/impressum" },
};

export default function ImpressumLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
