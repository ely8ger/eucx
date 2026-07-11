import { BuyerLotsClient } from "../BuyerLotsClient";

export const metadata = { title: "Handelssitzung | EUCX Käufer", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default function BuyerAuctionsPage() {
  return <BuyerLotsClient initialFilter="active" />;
}
