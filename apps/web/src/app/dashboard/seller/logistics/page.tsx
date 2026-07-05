import { SellerLogisticsClient } from "./SellerLogisticsClient";

export const metadata = { title: "Logistik & Lieferungen | EUCX Verkäufer", robots: { index: false, follow: false } };
export const dynamic  = "force-dynamic";

export default function SellerLogisticsPage() {
  return <SellerLogisticsClient />;
}
