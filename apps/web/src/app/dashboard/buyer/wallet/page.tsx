import { WalletClient } from "./WalletClient";

export const metadata = { title: "Wallet & Guthaben | EUCX Käufer", robots: { index: false, follow: false } };
export const dynamic  = "force-dynamic";

export default function WalletPage() {
  return <WalletClient />;
}
