import type { Metadata } from "next";

export const metadata: Metadata = {
  alternates: { canonical: "https://eucx.eu/impressum" },
};

export default function ImpressumLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
