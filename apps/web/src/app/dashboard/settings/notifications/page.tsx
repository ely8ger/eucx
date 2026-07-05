import { NotificationsSettingsClient } from "./NotificationsSettingsClient";

export const metadata = { title: "Benachrichtigungen | EUCX", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default function NotificationsSettingsPage() {
  return <NotificationsSettingsClient />;
}
