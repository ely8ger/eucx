import type { Metadata } from "next";
import TradingTerminal from "@/components/trading/TradingTerminal";

export const metadata: Metadata = { title: "Trading Terminal — EUCX" };

export default function TradingTerminalPage() {
  return <TradingTerminal />;
}
