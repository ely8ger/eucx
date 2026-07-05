import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Düngemittelkatalog — Kali, NPK, Stickstoff, Phosphor",
  description: "Institutioneller Düngemittelhandel auf EUCX: Kali, NPK, Stickstoff, Phosphor. B2B-Direkthandel für Agrarwirtschaft in der EU.",
  alternates: { canonical: "https://eucx.eu/duenger" },
};

export default function DuengerLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
