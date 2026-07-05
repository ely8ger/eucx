import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Metallkatalog — Stahl, Edelstahl, Aluminium",
  description: "Institutioneller Metallhandel auf EUCX: Stahl, Edelstahl, Aluminium, Kupfer in allen Profilen. B2B-Direkthandel ohne Zwischenhändler.",
  alternates: { canonical: "https://eucx.eu/metalle" },
};

export default function MetalleLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
