import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Allgemeine Geschäftsbedingungen",
  description: "AGB der EUCX — European Union Commodity Exchange für den institutionellen Rohstoffhandel. Nutzungsbedingungen und Vertragsgrundlagen.",
  alternates: { canonical: "https://eucx.eu/agb" },
};

export default function AgbLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
