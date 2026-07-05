import type { Metadata } from "next";

export const metadata: Metadata = {
  alternates: { canonical: "https://eucx.eu/datenschutz" },
};

export default function DatenschutzLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
