import { SellerBillingClient } from "./SellerBillingClient";

export const metadata = { title: "Abrechnung & CBAM-Reporting | EUCX Verkäufer", robots: { index: false, follow: false } };
export const dynamic  = "force-dynamic";

export default function SellerBillingPage() {
  return <SellerBillingClient />;
}
