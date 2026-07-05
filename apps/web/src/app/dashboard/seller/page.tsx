import { SellerLotsClient } from "./SellerLotsClient";

export const metadata = { title: "Ausschreibungen | EUCX Verkäufer", robots: { index: false, follow: false } };
export const dynamic  = "force-dynamic";

export default function SellerDashboardPage() {
  return <SellerLotsClient />;
}
