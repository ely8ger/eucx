import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright E2E-Konfiguration
 *
 * Voraussetzung: Next.js Dev-Server läuft auf Port 3000
 * Seed-Datenbank: npx prisma db seed --seed-script prisma/seed.auction.ts
 *
 * Lokal ausführen:
 *   npm run dev &                 # Server starten
 *   npx playwright test           # Tests ausführen
 *   npx playwright test --ui      # Interaktiver Modus
 *
 * CI:
 *   npx playwright test --reporter=list
 */
export default defineConfig({
  testDir:   "./src/__tests__/e2e",
  timeout:   45_000,              // max. 45s pro Test (API kann langsam sein)
  expect:    { timeout: 10_000 }, // max. 10s für Assertions
  fullyParallel: false,           // sequentiell (State hängt von vorherigem Schritt ab)
  retries:   0,
  workers:   1,

  reporter: [
    ["list"],                     // kompakte Konsolenausgabe
    ["html", { open: "never", outputFolder: "playwright-report" }],
  ],

  use: {
    baseURL:     "http://localhost:3000",
    trace:       "retain-on-failure",
    screenshot:  "only-on-failure",
    video:       "retain-on-failure",
    // localStorage-basierte Auth → kein Cookie-Interceptor nötig
    storageState: undefined,
  },

  projects: [
    {
      name:    "chromium",
      use:     { ...devices["Desktop Chrome"] },
    },
  ],

  // Kein webServer: dev-Server muss bereits laufen (npm run dev)
  // webServer: { command: "npm run dev", port: 3000, reuseExistingServer: true }
});
