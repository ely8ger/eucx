import { SellerLotsClient } from "./SellerLotsClient";

export const metadata = { title: "Ausschreibungen | EUCX Verkäufer" };
export const dynamic  = "force-dynamic";

export default function SellerDashboardPage() {
  return <SellerLotsClient />;
}
