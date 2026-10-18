"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const SANS = "'IBM Plex Sans', Arial, sans-serif";
const BLUE = "#154194";
const NAVY = "#0b1e36";

type KycStatus = "GUEST" | "PENDING_VERIFICATION" | "VERIFIED" | "REJECTED" | "SUSPENDED" | null;

interface Props {
  role:               "buyer" | "seller";
  kycStatus:          KycStatus;
  firstActionDone:    boolean; // buyer: lots.length > 0 | seller: myRegsCount > 0
  onStartFirstAction?: () => void;
}

interface Step {
  label:    string;
  hint:     string;
  done:     boolean;
  pending:  boolean; // waiting for external action (e.g. KYC review)
  ctaLabel?: string;
  ctaHref?:  string;
  ctaAction?: () => void;
}

const SESSION_KEY = "eucx:onboarding:dismissed";

export function OnboardingWidget({ role, kycStatus, firstActionDone, onStartFirstAction }: Props) {
  const [dismissed, setDismissed] = useState(true); // start hidden to avoid flash
  const [mounted,   setMounted]   = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      setDismissed(sessionStorage.getItem(SESSION_KEY) === "1");
    } catch {
      setDismissed(false);
    }
  }, []);

  const kycSubmitted = kycStatus !== "GUEST" && kycStatus !== null;
  const kycVerified  = kycStatus === "VERIFIED";
  const kycPending   = kycStatus === "PENDING_VERIFICATION";
  const kycRejected  = kycStatus === "REJECTED";

  const steps: Step[] = [
    {
      label:   "Konto erstellt",
      hint:    "Ihr EUCX-Konto ist eingerichtet.",
      done:    true,
      pending: false,
    },
    {
      label:   "Identität einreichen (KYC)",
      hint:    kycPending
        ? "Dokumente eingereicht — Prüfung läuft (unter 24h)."
        : kycRejected
          ? "KYC abgelehnt — neue Dokumente einreichen."
          : "Unterlagen hochladen für die Handelszulassung.",
      done:    kycSubmitted && !kycRejected,
      pending: kycPending,
      ctaLabel: kycRejected ? "Erneut einreichen" : "KYC starten",
      ctaHref:  "/dashboard/settings/verification",
    },
    {
      label:   "KYC genehmigt",
      hint:    kycVerified
        ? "Identität bestätigt — vollständig handelsberechtigt."
        : "Unsere Compliance-Abteilung prüft Ihre Dokumente.",
      done:    kycVerified,
      pending: kycPending,
      ctaLabel: kycPending ? "Status prüfen" : undefined,
      ctaHref:  kycPending ? "/dashboard/settings/verification" : undefined,
    },
    role === "buyer"
      ? {
          label:    "Erste Ausschreibung erstellen",
          hint:     firstActionDone
            ? "Ihre erste Ausschreibung wurde gestartet."
            : "Stellen Sie Ihren ersten Bedarf ein — Verkäufer geben Angebote ab.",
          done:     firstActionDone,
          pending:  false,
          ctaLabel: "Neue Ausschreibung",
          ctaAction: onStartFirstAction,
          ctaHref:   onStartFirstAction ? undefined : "/dashboard/buyer",
        }
      : {
          label:    "Für erstes Los registrieren",
          hint:     firstActionDone
            ? "Sie haben sich für Ihre erste Auktion registriert."
            : "Finden Sie ein Los in der Registrierungsphase und reichen Sie ein Angebot ein.",
          done:     firstActionDone,
          pending:  false,
          ctaLabel: "Lots ansehen",
          ctaHref:  "/dashboard/seller",
        },
  ];

  const completedCount = steps.filter(s => s.done).length;
  const allDone        = completedCount === steps.length;

  // Find the first incomplete step to highlight
  const activeIdx = steps.findIndex(s => !s.done);

  function dismiss() {
    try { sessionStorage.setItem(SESSION_KEY, "1"); } catch { /* noop */ }
    setDismissed(true);
  }

  // Don't render: not mounted, dismissed, or all done and KYC verified
  if (!mounted || dismissed || allDone) return null;

  const pct = Math.round((completedCount / steps.length) * 100);

  return (
    <div style={{
      background: "#f5f8ff",
      border: `1px solid #c9d8f0`,
      marginBottom: 28,
      fontFamily: SANS,
      position: "relative",
    }}>
      {/* Header */}
      <div style={{
        background: NAVY,
        padding: "14px 20px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: "#fff", letterSpacing: "0.04em" }}>
            {role === "buyer" ? "Käufer-Einstieg" : "Verkäufer-Einstieg"}
          </span>
          <span style={{
            fontSize: 11, fontWeight: 700, color: NAVY,
            background: "#7cb3f8", padding: "2px 8px", letterSpacing: "0.06em",
          }}>
            {completedCount}/{steps.length} Schritte
          </span>
        </div>
        <button
          onClick={dismiss}
          title="Ausblenden"
          style={{
            background: "none", border: "none", cursor: "pointer",
            color: "#7cb3f8", fontSize: 18, lineHeight: 1, padding: "0 2px",
          }}
        >
          ×
        </button>
      </div>

      {/* Progress bar */}
      <div style={{ height: 3, background: "#d1e0f7" }}>
        <div style={{
          height: "100%", width: `${pct}%`,
          background: BLUE,
          transition: "width .4s ease",
        }} />
      </div>

      {/* Steps */}
      <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 10 }}>
        {steps.map((step, i) => {
          const isActive = i === activeIdx;
          return (
            <div key={i} style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 14,
              padding: isActive ? "10px 14px" : "6px 14px",
              background: isActive ? "#eaf0fc" : "transparent",
              border: isActive ? `1px solid #c9d8f0` : "1px solid transparent",
            }}>
              {/* Icon */}
              <div style={{
                width: 22, height: 22, flexShrink: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 12, fontWeight: 700,
                background: step.done ? BLUE : step.pending ? "#d97706" : isActive ? "#e3ecff" : "#e5e7eb",
                color:      step.done ? "#fff" : step.pending ? "#fff" : isActive ? BLUE : "#9ca3af",
                marginTop: 1,
              }}>
                {step.done ? "✓" : step.pending ? "⧗" : String(i + 1)}
              </div>

              {/* Content */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: 13, fontWeight: isActive ? 700 : 400,
                  color: step.done ? "#6b7280" : NAVY,
                  textDecoration: step.done ? "line-through" : "none",
                }}>
                  {step.label}
                </div>
                {isActive && (
                  <div style={{ fontSize: 12, color: "#4b5563", marginTop: 3 }}>
                    {step.hint}
                  </div>
                )}
              </div>

              {/* CTA */}
              {isActive && (step.ctaAction || step.ctaHref) && !step.done && !step.pending && (
                step.ctaAction
                  ? (
                    <button
                      onClick={step.ctaAction}
                      style={{
                        flexShrink: 0, padding: "6px 14px",
                        background: BLUE, color: "#fff",
                        border: "none", cursor: "pointer",
                        fontSize: 12, fontWeight: 700, letterSpacing: "0.04em",
                        fontFamily: SANS,
                      }}
                    >
                      {step.ctaLabel}
                    </button>
                  )
                  : (
                    <Link
                      href={step.ctaHref!}
                      style={{
                        flexShrink: 0, padding: "6px 14px",
                        background: BLUE, color: "#fff",
                        textDecoration: "none",
                        fontSize: 12, fontWeight: 700, letterSpacing: "0.04em",
                        display: "inline-block",
                      }}
                    >
                      {step.ctaLabel}
                    </Link>
                  )
              )}
              {isActive && step.pending && step.ctaHref && (
                <Link
                  href={step.ctaHref}
                  style={{
                    flexShrink: 0, padding: "6px 14px",
                    background: "#d97706", color: "#fff",
                    textDecoration: "none",
                    fontSize: 12, fontWeight: 700, letterSpacing: "0.04em",
                    display: "inline-block",
                  }}
                >
                  {step.ctaLabel}
                </Link>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer hint */}
      <div style={{
        borderTop: "1px solid #d1e0f7",
        padding: "8px 20px",
        fontSize: 11,
        color: "#6b7280",
      }}>
        {role === "buyer"
          ? "Als Käufer schreiben Sie Bedarf aus und erhalten Angebote von verifizierten Verkäufern."
          : "Als Verkäufer registrieren Sie sich für Lots und geben Angebote in der Angebotsphase ab."}
      </div>
    </div>
  );
}
