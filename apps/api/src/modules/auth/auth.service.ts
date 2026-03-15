import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcryptjs";
import { UsersService } from "../users/users.service";
import { AuditService } from "../audit/audit.service";
import { LoginDto } from "./dto/login.dto";

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UsersService,
    private readonly jwt: JwtService,
    private readonly audit: AuditService,
  ) {}

  async login(dto: LoginDto, ip: string) {
    const user = await this.users.findByEmail(dto.email);
    if (!user) throw new UnauthorizedException("Ungültige Zugangsdaten");

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) throw new UnauthorizedException("Ungültige Zugangsdaten");

    if (user.status !== "ACTIVE") {
      throw new UnauthorizedException("Konto noch nicht freigegeben");
    }

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
