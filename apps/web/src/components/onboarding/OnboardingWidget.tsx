"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const SANS  = "'IBM Plex Sans', Arial, sans-serif";
const BLUE  = "#154194";
const NAVY  = "#0b1e36";
const GREEN = "#0e7a3c";

type KycStatus = "GUEST" | "PENDING_VERIFICATION" | "VERIFIED" | "REJECTED" | "SUSPENDED" | null;

interface Props {
  role:               "buyer" | "seller";
  kycStatus:          KycStatus;
  firstActionDone:    boolean;
  onStartFirstAction?: () => void;
}

interface Step {
  label:     string;
  hint:      string;
  done:      boolean;
  pending:   boolean;
  ctaLabel?: string;
  ctaHref?:  string;
  ctaAction?: () => void;
}

const SESSION_KEY = "eucx:onboarding:dismissed";

export function OnboardingWidget({ role, kycStatus, firstActionDone, onStartFirstAction }: Props) {
  const [dismissed, setDismissed] = useState(true);
  const [mounted,   setMounted]   = useState(false);

  useEffect(() => {
    setMounted(true);
    try { setDismissed(sessionStorage.getItem(SESSION_KEY) === "1"); }
    catch { setDismissed(false); }
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
      label:    "KYC einreichen",
      hint:     kycPending  ? "Dokumente eingereicht — Prüfung läuft (unter 24h)."
               : kycRejected ? "KYC abgelehnt — neue Dokumente einreichen."
               : "Unterlagen hochladen für die Handelszulassung.",
      done:    kycSubmitted && !kycRejected,
      pending: kycPending,
      ctaLabel: kycRejected ? "Erneut einreichen" : "KYC starten",
      ctaHref:  "/dashboard/settings/verification",
    },
    {
      label:    "KYC genehmigt",
      hint:     kycVerified ? "Identität bestätigt — vollständig handelsberechtigt."
                            : "Unsere Compliance-Abteilung prüft Ihre Dokumente.",
      done:    kycVerified,
      pending: kycPending,
      ctaLabel: kycPending ? "Status prüfen" : undefined,
      ctaHref:  kycPending ? "/dashboard/settings/verification" : undefined,
    },
    role === "buyer"
      ? {
          label:     "Erste Ausschreibung",
          hint:      firstActionDone
            ? "Ihre erste Ausschreibung wurde gestartet."
            : "Stellen Sie Ihren ersten Bedarf ein — Verkäufer geben Angebote ab.",
          done:     firstActionDone,
          pending:  false,
          ctaLabel: "Neue Ausschreibung",
          ctaAction: onStartFirstAction,
          ctaHref:   onStartFirstAction ? undefined : "/dashboard/buyer",
        }
      : {
          label:     "Für erstes Los registrieren",
          hint:      firstActionDone
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
  const activeIdx      = steps.findIndex(s => !s.done);
  const pct            = Math.round((completedCount / steps.length) * 100);

  function dismiss() {
    try { sessionStorage.setItem(SESSION_KEY, "1"); } catch { /* noop */ }
    setDismissed(true);
  }

  if (!mounted || dismissed || allDone) return null;

  const activeStep = activeIdx >= 0 ? steps[activeIdx] : null;

  return (
    <div style={{
      background: "#fff",
      border: "1px solid #d4d8e0",
      marginBottom: 28,
      fontFamily: SANS,
      boxShadow: "0 1px 4px rgba(13,27,42,.07)",
    }}>
      {/* Header */}
      <div style={{ padding: "18px 24px 0", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          {/* Circle icon */}
          <div style={{
            width: 36, height: 36, borderRadius: "50%",
            background: "#eef2fb",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M9 12l2 2 4-4M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                stroke={BLUE} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: NAVY }}>
              {role === "buyer" ? "Käufer-Einstieg" : "Verkäufer-Einstieg"}
              {" — Schritt "}
              {activeIdx >= 0 ? activeIdx + 1 : completedCount}
              {" von "}
              {steps.length}
            </div>
            <div style={{ fontSize: 12, color: "#7a8aa0", marginTop: 2 }}>
              {activeStep?.hint ?? "Alle Schritte abgeschlossen"}
            </div>
          </div>
        </div>
        <button
          onClick={dismiss}
          title="Ausblenden"
          aria-label="Onboarding ausblenden"
          style={{
            background: "none", border: "none", cursor: "pointer",
            color: "#9ca3af", fontSize: 20, lineHeight: 1,
            padding: "2px 4px", flexShrink: 0, marginTop: 2,
          }}
        >
          ×
        </button>
      </div>

      {/* Steps — horizontal grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: 12,
        padding: "16px 24px",
      }}>
        {steps.map((step, i) => {
          const isActive  = i === activeIdx;
          const isDone    = step.done;
          const isFuture  = !isDone && !isActive;

          let bg      = "#f7f9fc";
          let border  = "#d4d8e0";
          let numClr  = "#9ca3af";
          let lblClr  = "#6b7280";

          if (isDone)    { bg = "#f0faf4"; border = GREEN;  numClr = GREEN; lblClr = GREEN; }
          if (isActive)  { bg = "#eef2fb"; border = BLUE;   numClr = BLUE;  lblClr = BLUE;  }
          if (isFuture)  { bg = "#f7f9fc"; border = "#d4d8e0"; }

          return (
            <div key={i} style={{
              padding: "14px 16px",
              background: bg,
              border: `1px solid ${border}`,
              position: "relative",
              transition: "border-color .15s",
            }}>
              <div style={{
                fontSize: 10, fontWeight: 700,
                letterSpacing: ".07em", textTransform: "uppercase" as const,
                color: numClr,
                marginBottom: 6,
              }}>
                Schritt {i + 1}
              </div>
              <div style={{ fontSize: 13, fontWeight: 600, color: lblClr, lineHeight: 1.3 }}>
                {step.label}
              </div>
              {isDone && (
                <div style={{
                  position: "absolute", top: 10, right: 10,
                  width: 18, height: 18, borderRadius: "50%",
                  background: GREEN,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path d="M2 5l2.5 2.5 4-4" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              )}
              {step.pending && (
                <div style={{
                  position: "absolute", top: 10, right: 10,
                  width: 18, height: 18, borderRadius: "50%",
                  background: "#d97706",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <circle cx="5" cy="5" r="3.5" stroke="#fff" strokeWidth="1.2" fill="none"/>
                    <path d="M5 3v2.2L6.2 6.4" stroke="#fff" strokeWidth="1.1" strokeLinecap="round"/>
                  </svg>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* CTA for active step */}
      {activeStep && (activeStep.ctaAction || activeStep.ctaHref) && !activeStep.done && !activeStep.pending && (
        <div style={{ padding: "0 24px 16px", display: "flex", gap: 10, alignItems: "center" }}>
          {activeStep.ctaAction ? (
            <button
              onClick={activeStep.ctaAction}
              style={{
                padding: "8px 20px",
                background: BLUE, color: "#fff",
                border: "none", cursor: "pointer",
                fontSize: 12, fontWeight: 700,
                fontFamily: SANS, letterSpacing: ".03em",
              }}
            >
              {activeStep.ctaLabel}
            </button>
          ) : (
            <Link
              href={activeStep.ctaHref!}
              style={{
                padding: "8px 20px",
                background: BLUE, color: "#fff",
                textDecoration: "none",
                fontSize: 12, fontWeight: 700,
                display: "inline-block",
              }}
            >
              {activeStep.ctaLabel}
            </Link>
          )}
        </div>
      )}
      {activeStep?.pending && activeStep.ctaHref && (
        <div style={{ padding: "0 24px 16px" }}>
          <Link
            href={activeStep.ctaHref}
            style={{
              padding: "8px 20px",
              background: "#d97706", color: "#fff",
              textDecoration: "none",
              fontSize: 12, fontWeight: 700, display: "inline-block",
            }}
          >
            {activeStep.ctaLabel}
          </Link>
        </div>
      )}

      {/* Progress bar */}
      <div style={{ height: 3, background: "#e8edf3" }}>
        <div style={{ height: "100%", width: `${pct}%`, background: BLUE, transition: "width .4s ease" }} />
      </div>
    </div>
  );
}
