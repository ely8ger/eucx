import { SellerInventoryClient } from "./SellerInventoryClient";

export const metadata = { title: "Lagerbestand & Chargen | EUCX Verkäufer", robots: { index: false, follow: false } };
export const dynamic  = "force-dynamic";

export default function SellerInventoryPage() {
  return <SellerInventoryClient />;
}
