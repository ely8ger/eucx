import { SignJWT, jwtVerify, type JWTPayload } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ?? "dev-secret-CHANGE-IN-PRODUCTION-min-32-chars"
);

export interface TokenPayload extends JWTPayload {
  userId:  string;
  orgId:   string;
  role:    string;
  email:   string;
}

// Access Token: 15 Minuten
export async function signAccessToken(payload: Omit<TokenPayload, keyof JWTPayload>): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("15m")
    .setIssuer("eucx.eu")
    .setAudience("eucx-api")
    .sign(JWT_SECRET);
}

// Refresh Token: 7 Tage
export async function signRefreshToken(userId: string): Promise<string> {
  return new SignJWT({ userId, type: "refresh" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .setIssuer("eucx.eu")
    .sign(JWT_SECRET);
}

export async function verifyAccessToken(token: string): Promise<TokenPayload> {
  const { payload } = await jwtVerify(token, JWT_SECRET, {
    issuer:   "eucx.eu",
    audience: "eucx-api",
  });
  return payload as TokenPayload;
}

export async function verifyRefreshToken(token: string): Promise<{ userId: string }> {
  const { payload } = await jwtVerify(token, JWT_SECRET, {
    issuer: "eucx.eu",
  });
  return { userId: payload["userId"] as string };
}
