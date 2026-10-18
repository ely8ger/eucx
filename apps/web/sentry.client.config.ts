import * as Sentry from "@sentry/nextjs";

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    environment: process.env.NODE_ENV,
    // Nur 10% der Transaktionen in Production samplen (Performance)
    tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
    // Replay 1% aller Sessions, 100% bei Fehler
    replaysSessionSampleRate: 0.01,
    replaysOnErrorSampleRate: 1.0,
    integrations: [
      Sentry.replayIntegration({ maskAllText: true, blockAllMedia: false }),
    ],
  });
}
