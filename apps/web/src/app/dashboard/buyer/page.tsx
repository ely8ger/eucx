import { BuyerLotsClient } from "./BuyerLotsClient";

export const metadata = { title: "Ausschreibungen | EUCX Käufer" };
export const dynamic  = "force-dynamic";

export default function BuyerDashboardPage() {
  return <BuyerLotsClient />;
}
