/**
 * Unit-Tests: Token-Persistenz-Enforcement
 *
 * Stellt sicher, dass:
 *   1. Access-Tokens NICHT in localStorage geschrieben werden
 *   2. Access-Tokens NICHT in URL-Parametern erscheinen
 *   3. pending_2fa Cookie korrekt gesetzt und gelöscht wird
 *
 * Strategie: Statische Analyse der Source-Dateien via Regex.
 * Kein Runtime-Setup nötig — schnell und CI-freundlich.
 */

import fs   from "fs";
import path from "path";

const SRC_ROOT = path.resolve(__dirname, "../../");

function readFile(relPath: string): string {
  return fs.readFileSync(path.join(SRC_ROOT, relPath), "utf-8");
}

function grepDir(dir: string, pattern: RegExp, exclude: RegExp[] = []): string[] {
  const matches: string[] = [];
  const entries = fs.readdirSync(path.join(SRC_ROOT, dir), { withFileTypes: true, recursive: true } as Parameters<typeof fs.readdirSync>[1]);

  for (const entry of entries as unknown as fs.Dirent[]) {
    if (!entry.isFile()) continue;
    if (!entry.name.endsWith(".ts") && !entry.name.endsWith(".tsx")) continue;

    const fullPath = path.join((entry as unknown as { parentPath: string }).parentPath ?? dir, entry.name);
    const relPath2 = path.relative(path.join(SRC_ROOT), fullPath);

    if (exclude.some(ex => ex.test(relPath2))) continue;

    try {
      const content = fs.readFileSync(fullPath, "utf-8");
      if (pattern.test(content)) matches.push(relPath2);
    } catch {
      // Datei nicht lesbar — ignorieren
    }
  }
  return matches;
}

// ─── Test 1: kein localStorage.setItem mit Token-Keys ─────────────────────────

describe("localStorage Token-Enforcement", () => {
  it("schreibt Access-Token nicht in localStorage", () => {
    const tokenSetPattern = /localStorage\.setItem\s*\(\s*["'](?:accessToken|access_token|token)["']/;
    const offenders = grepDir(".", tokenSetPattern, [
      /\.spec\.ts$/,
      /\.test\.ts$/,
      /__tests__/,
      /node_modules/,
    ]);
    expect(offenders).toEqual([]);
  });
});

// ─── Test 2: kein ?token= in URL-Builds ───────────────────────────────────────

describe("URL Token-Enforcement", () => {
  it("baut keine URLs mit ?token= aus Access-/Refresh-Tokens", () => {
    // Erlaubt: password-reset Token in URLs (das ist ein anderer Token-Typ)
    // Verboten: URL-Builds die den session token als Query-Parameter verwenden
    const urlTokenPattern = /[`'"]\s*\/api\/[^`'"]*\?token=\$\{/;
    const offenders = grepDir(".", urlTokenPattern, [
      /\.spec\.ts$/,
      /\.test\.ts$/,
      /__tests__/,
      /node_modules/,
    ]);
    expect(offenders).toEqual([]);
  });
});

// ─── Test 3: pending_2fa Cookie wird korrekt gesetzt ─────────────────────────

describe("pending_2fa Cookie", () => {
  it("setzt pending_2fa Cookie bei TOTP_REQUIRED in login/route.ts", () => {
    const loginRoute = readFile("app/api/auth/login/route.ts");
    expect(loginRoute).toMatch(/pending_2fa/);
    expect(loginRoute).toMatch(/signPending2faToken/);
    expect(loginRoute).toMatch(/httpOnly:\s*true/);
  });

  it("liest pending_2fa aus Cookie (kein E-Mail-Lookup) in 2fa/validate/route.ts", () => {
    const validateRoute = readFile("app/api/auth/2fa/validate/route.ts");
    expect(validateRoute).toMatch(/pending_2fa/);
    expect(validateRoute).toMatch(/verifyPending2faToken/);
    // Sicherstellen dass kein E-Mail-basierter User-Lookup mehr existiert
    expect(validateRoute).not.toMatch(/findFirst\s*\(\s*\{[\s\S]*?email/);
  });

  it("löscht pending_2fa Cookie nach erfolgreichem TOTP-Validate", () => {
    const validateRoute = readFile("app/api/auth/2fa/validate/route.ts");
    // Cookie-Löschung via maxAge: 0
    expect(validateRoute).toMatch(/pending_2fa[\s\S]{0,200}maxAge:\s*0/);
  });
});

// ─── Test 4: TOTP Replay-Schutz ist eingebunden ──────────────────────────────

describe("TOTP Replay-Schutz", () => {
  it("importiert isTotpCodeUsed und markTotpCodeUsed in 2fa/validate", () => {
    const validateRoute = readFile("app/api/auth/2fa/validate/route.ts");
    expect(validateRoute).toMatch(/isTotpCodeUsed/);
    expect(validateRoute).toMatch(/markTotpCodeUsed/);
  });

  it("prüft Replay VOR der Session-Ausgabe", () => {
    const validateRoute = readFile("app/api/auth/2fa/validate/route.ts");
    const replayIdx     = validateRoute.indexOf("isTotpCodeUsed");
    const sessionIdx    = validateRoute.indexOf("signAccessToken");
    expect(replayIdx).toBeGreaterThan(0);
    expect(sessionIdx).toBeGreaterThan(0);
    // Replay-Check muss vor Session-Ausgabe stehen
    expect(replayIdx).toBeLessThan(sessionIdx);
  });
});

// ─── Test 5: Separater REFRESH_JWT_SECRET ─────────────────────────────────────

describe("REFRESH_JWT_SECRET Key-Separation", () => {
  it("verwendet REFRESH_JWT_SECRET für signRefreshToken in jwt.ts", () => {
    const jwtFile = readFile("lib/auth/jwt.ts");
    expect(jwtFile).toMatch(/REFRESH_JWT_SECRET/);
    // signRefreshToken darf nicht mit JWT_SECRET (Access-Key) signieren
    const signRefreshFn = jwtFile.match(/signRefreshToken[\s\S]{0,400}?sign\(([^)]+)\)/)?.[1] ?? "";
    expect(signRefreshFn).toMatch(/REFRESH_JWT_SECRET/);
    expect(signRefreshFn).not.toMatch(/^JWT_SECRET$/);
  });

  it("dokumentiert REFRESH_JWT_SECRET in .env.example", () => {
    const envExample = fs.readFileSync(path.resolve(__dirname, "../../../../.env.example"), "utf-8");
    expect(envExample).toMatch(/REFRESH_JWT_SECRET/);
  });
});
