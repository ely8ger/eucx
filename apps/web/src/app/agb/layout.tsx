import type { Metadata } from "next";

export const metadata: Metadata = {
  alternates: { canonical: "https://eucx.eu/agb" },
};

export default function AgbLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
