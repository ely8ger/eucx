import { SellerLotsClient } from "../SellerLotsClient";

export const metadata = { title: "Ausschreibungsraum | EUCX Verkäufer", robots: { index: false, follow: false } };
export const dynamic  = "force-dynamic";

export default function SellerAuctionsPage() {
  return <SellerLotsClient />;
}
