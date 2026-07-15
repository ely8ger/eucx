import type { Metadata } from "next";
import { PortfolioClient } from "./PortfolioClient";

export const metadata: Metadata = {
  title: "Portfolio – EUCX",
  description: "Überblick über Ihre abgeschlossenen Käufe, Einsparungen und CO₂-Exposition.",
  robots: { index: false, follow: false },
};

export default function PortfolioPage() {
  return <PortfolioClient />;
}
