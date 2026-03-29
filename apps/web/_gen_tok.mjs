import { SignJWT } from "jose";
const s = new TextEncoder().encode("eucx-production-secret-49aaa0dfacdbc41f9ef4e2de7ae0b185cd52aa00f1e918a9408dbd800381f6e0");
const token = await new SignJWT({ userId:"seed-user-seller-1", orgId:"seed-org-eucx-test", role:"SELLER", email:"seller1@eucx-test.de" })
  .setProtectedHeader({alg:"HS256"}).setIssuedAt().setExpirationTime("8h")
  .setIssuer("eucx.eu").setAudience("eucx-api").sign(s);
console.log(token);
