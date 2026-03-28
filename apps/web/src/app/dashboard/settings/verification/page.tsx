/**
 * /dashboard/settings/verification
 *
 * KYC-Upload-Seite — Drag & Drop Dokument-Upload
 * Mobile-First: funktioniert auf iPad + Schrottplatz
 *
 * Server Component: lädt aktuellen Status
 * VerificationClient: Drag & Drop + Fetch
 */
import { VerificationClient } from "./VerificationClient";

export const metadata = { title: "Identitätsprüfung | EUCX" };

export default function VerificationPage() {
  return <VerificationClient />;
}
