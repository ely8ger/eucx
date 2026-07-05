import type { Metadata } from "next";

export const metadata: Metadata = {
  alternates: { canonical: "https://eucx.eu/duenger" },
};

export default function DuengerLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
