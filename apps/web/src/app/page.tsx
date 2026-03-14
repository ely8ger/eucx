import { redirect } from "next/navigation";

// Startseite → Handelsraum
export default function HomePage() {
  redirect("/trading");
}
