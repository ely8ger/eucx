import { ProfileClient } from "./ProfileClient";

export const metadata = {
  title:   "Profil | EUCX",
  robots:  { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default function ProfilePage() {
  return <ProfileClient />;
}
