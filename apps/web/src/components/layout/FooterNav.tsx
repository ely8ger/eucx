"use client";

import { useI18n } from "@/lib/i18n/context";

export function FooterNav() {
  const { t } = useI18n();
  return (
    <nav style={{ display: "flex", alignItems: "center", gap: 20, fontSize: 11, color: "#aaa" }}>
      <a href="/impressum"  style={{ color: "#aaa", textDecoration: "none" }}>{t("footer_imprint")}</a>
      <a href="/datenschutz" style={{ color: "#aaa", textDecoration: "none" }}>{t("footer_privacy")}</a>
      <a href="/agb"        style={{ color: "#aaa", textDecoration: "none" }}>{t("footer_terms")}</a>
      <span>© 2026 EUCX</span>
    </nav>
  );
}
