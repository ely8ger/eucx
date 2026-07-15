import type { Metadata } from "next";
import { ApiKeysClient } from "./ApiKeysClient";

export const metadata: Metadata = {
  title: "API-Schlüssel – EUCX",
  description: "Programmatischen Zugriff auf EUCX-Ressourcen einrichten und verwalten.",
  robots: { index: false, follow: false },
};

export default function ApiKeysPage() {
  return <ApiKeysClient />;
}
