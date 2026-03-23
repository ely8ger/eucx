"use client";

import { useRouter }    from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { KycWizard }    from "@/components/kyc/KycWizard";
import { useI18n }      from "@/lib/i18n/context";

const F    = "'IBM Plex Sans', Arial, sans-serif";
const BLUE = "#154194";

export default function KycPage() {
  const { t }  = useI18n();
  const router = useRouter();
  const user   = useAuthStore((s) => s.user);

  if (!user) { router.replace("/login"); return null; }

  if (user.verificationStatus === "VERIFIED") {
    return (
      <div style={{ maxWidth: 480, margin: "64px auto 0", textAlign: "center", fontFamily: F }}>
        <div style={{ width: 64, height: 64, backgroundColor: "#f0fdf4", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#166534" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>
        <h1 style={{ fontSize: 20, fontWeight: 600, color: "#0d1b2a", margin: "0 0 8px" }}>{t("kyc_verified_title")}</h1>
        <p style={{ fontSize: 13, color: "#888", margin: "0 0 24px", lineHeight: 1.6 }}>
          {t("kyc_verified_desc")}
        </p>
        <button onClick={() => router.push("/dashboard")}
          style={{ height: 38, padding: "0 24px", backgroundColor: BLUE, color: "#fff", border: "none", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: F }}
          onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#0f3070")}
          onMouseLeave={e => (e.currentTarget.style.backgroundColor = BLUE)}>
          {t("kyc_verified_btn")}
        </button>
      </div>
    );
  }

  if (user.verificationStatus === "SUSPENDED" || user.verificationStatus === "REJECTED") {
    return (
      <div style={{ maxWidth: 480, margin: "64px auto 0", textAlign: "center", fontFamily: F }}>
        <div style={{ width: 64, height: 64, backgroundColor: "#fff1f1", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </div>
        <h1 style={{ fontSize: 20, fontWeight: 600, color: "#0d1b2a", margin: "0 0 8px" }}>
          {user.verificationStatus === "REJECTED" ? t("kyc_rejected_title") : t("kyc_suspended_title")}
        </h1>
        <p style={{ fontSize: 13, color: "#888", margin: "0 0 24px", lineHeight: 1.6 }}>
          {user.verificationStatus === "REJECTED"
            ? t("kyc_rejected_desc")
            : t("kyc_suspended_desc")}
        </p>
        <a href="mailto:support@eucx.eu"
          style={{ display: "inline-flex", alignItems: "center", height: 38, padding: "0 24px", backgroundColor: BLUE, color: "#fff", fontSize: 13, fontWeight: 600, textDecoration: "none" }}
          onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#0f3070")}
          onMouseLeave={e => (e.currentTarget.style.backgroundColor = BLUE)}>
          {t("kyc_btn_support")}
        </a>
      </div>
    );
  }

  if (user.verificationStatus === "PENDING_VERIFICATION") {
    return (
      <div style={{ maxWidth: 480, margin: "64px auto 0", textAlign: "center", fontFamily: F }}>
        <div style={{ width: 64, height: 64, backgroundColor: "#fffbeb", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#92400e" strokeWidth="1.8" strokeLinecap="round">
            <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
          </svg>
        </div>
        <h1 style={{ fontSize: 20, fontWeight: 600, color: "#0d1b2a", margin: "0 0 8px" }}>{t("kyc_pending_title")}</h1>
        <p style={{ fontSize: 13, color: "#888", margin: "0 0 24px", lineHeight: 1.6 }}>
          {t("kyc_pending_desc")}
        </p>
        <button onClick={() => router.push("/dashboard")}
          style={{ height: 38, padding: "0 24px", border: "1px solid #d0d0d0", backgroundColor: "#fff", fontSize: 13, color: "#505050", cursor: "pointer", fontFamily: F }}
          onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#f7f7f7")}
          onMouseLeave={e => (e.currentTarget.style.backgroundColor = "#fff")}>
          {t("kyc_pending_btn")}
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 680, fontFamily: F }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 300, color: "#0d1b2a", margin: 0 }}>{t("kyc_title")}</h1>
        <p style={{ fontSize: 13, color: "#888", marginTop: 4 }}>
          {t("kyc_subtitle")}
        </p>
      </div>
      <KycWizard />
    </div>
  );
}
