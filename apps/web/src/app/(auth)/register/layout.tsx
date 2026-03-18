import type { Metadata } from "next";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "EUCX - Anmelden",
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return children;
}
