import bcrypt from "bcryptjs";

const COST = 12; // 12 Runden - sicher und schnell genug für Produktion

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, COST);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
