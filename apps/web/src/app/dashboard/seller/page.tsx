import { SellerControlCenter } from "./SellerControlCenter";

export const metadata = { title: "Verkäufer Control Center | EUCX", robots: { index: false, follow: false } };
export const dynamic  = "force-dynamic";

export default function SellerDashboardPage() {
  return <SellerControlCenter />;
}
