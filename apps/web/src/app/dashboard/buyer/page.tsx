import { BuyerLotsClient } from "./BuyerLotsClient";

export const metadata = { title: "Ausschreibungen | EUCX Käufer", robots: { index: false, follow: false } };
export const dynamic  = "force-dynamic";

export default function BuyerDashboardPage() {
  return <BuyerLotsClient />;
}
