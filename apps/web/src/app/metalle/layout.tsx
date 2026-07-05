import type { Metadata } from "next";

export const metadata: Metadata = {
  alternates: { canonical: "https://eucx.eu/metalle" },
};

export default function MetalleLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
