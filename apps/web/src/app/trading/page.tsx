import type { Metadata } from "next";
import TradingRoom from "@/components/trading/TradingRoom";

export const metadata: Metadata = { title: "Handelsraum — EUCX" };

export default function TradingPage() {
  return <TradingRoom />;
}
