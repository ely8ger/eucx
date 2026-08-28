import { SellerActiveBidsClient } from "./SellerActiveBidsClient";

export const metadata = { title: "Meine Gebote | EUCX Verkäufer", robots: { index: false, follow: false } };
export const dynamic  = "force-dynamic";

export default function ActiveBidsPage() {
  return <SellerActiveBidsClient />;
}
