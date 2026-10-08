import { Injectable, UnauthorizedException, HttpException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcryptjs";
import { UsersService } from "../users/users.service";
import { AuditService } from "../audit/audit.service";
import { LoginDto } from "./dto/login.dto";

// C2 — In-Memory Brute-Force-Schutz (Sliding Window, server-lokal)
const loginFailMap = new Map<string, number[]>();
const MAX_ATTEMPTS  = 5;
const WINDOW_MS     = 900_000; // 15 Minuten

function isRateLimited(email: string): boolean {
  const now    = Date.now();
  const cutoff = now - WINDOW_MS;
  const times  = (loginFailMap.get(email) ?? []).filter((t) => t > cutoff);
  if (times.length >= MAX_ATTEMPTS) {
    loginFailMap.set(email, times);
    return true;
  }
  times.push(now);
  loginFailMap.set(email, times);
  return false;
}

function resetLoginCounter(email: string): void {
  loginFailMap.delete(email);
}

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UsersService,
    private readonly jwt: JwtService,
    private readonly audit: AuditService,
  ) {}

  async login(dto: LoginDto, ip: string) {
    // C2 — Rate-Limit vor DB-Lookup (verhindert Timing-Angriff + Enumeration)
    if (isRateLimited(dto.email)) {
      throw new HttpException("Zu viele Fehlversuche. Bitte versuchen Sie es in 15 Minuten erneut.", 429);
    }

    const user = await this.users.findByEmail(dto.email);
    if (!user) throw new UnauthorizedException("Ungültige Zugangsdaten");

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) {
      this.audit.log({ userId: user.id, action: "AUTH_LOGIN_FAILED", meta: { ip } }).catch(() => {});
      throw new UnauthorizedException("Ungültige Zugangsdaten");
    }

    if (user.status !== "ACTIVE") {
      throw new UnauthorizedException("Konto noch nicht freigegeben");
    }

    resetLoginCounter(dto.email);

    await this.audit.log({
      userId: user.id,
      action: "AUTH_LOGIN",
      meta: { ip },
    });

    return {
      accessToken: this.jwt.sign({
        sub:   user.id,
        email: user.email,
        role:  user.role,
        orgId: user.organizationId,
      }),
    };
  }
}
