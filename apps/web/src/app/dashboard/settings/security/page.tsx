import { SecuritySettingsClient } from "./SecuritySettingsClient";

export const metadata = { title: "Sicherheit | EUCX", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default function SecuritySettingsPage() {
  return <SecuritySettingsClient />;
}
