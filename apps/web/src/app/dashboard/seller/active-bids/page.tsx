import { SellerLotsClient } from "../SellerLotsClient";

export const metadata = { title: "Aktive Gebote | EUCX Verkäufer", robots: { index: false, follow: false } };
export const dynamic  = "force-dynamic";

export default function ActiveBidsPage() {
  return <SellerLotsClient initialFilter="mine" />;
}
