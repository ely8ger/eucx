/**
 * KycVerifiedGuard
 *
 * Blockiert Trades von nicht-verifizierten Usern.
 * Wirft 403 wenn verificationStatus != VERIFIED.
 *
 * Ausnahmen (kein KYC-Check nötig):
 *   - SUPER_ADMIN, COMPLIANCE_OFFICER, ADMIN — dürfen immer
 *
 * Verwendung:
 *   @UseGuards(JwtAuthGuard, KycVerifiedGuard)
 *   async placeOrder(...) { ... }
 *
 * Compliance:
 *   Automatisches Flagging: Bei Versuch ohne Verifizierung wird AuditLog-Eintrag
 *   geschrieben (Typ: KYC_BYPASS_ATTEMPT). Nicht blockiert — nur geloggt.
 *   Blockiert: echte 403-Response.
 */

import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from "@nestjs/common";
import { PrismaService } from "../../config/prisma.service";

const ADMIN_ROLES = new Set(["SUPER_ADMIN", "COMPLIANCE_OFFICER", "ADMIN"]);

@Injectable()
export class KycVerifiedGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req     = context.switchToHttp().getRequest<{ user?: { userId: string; role?: string } }>();
    const userId  = req.user?.userId;
    const role    = req.user?.role;

    // Admins sind von KYC-Check ausgenommen
    if (role && ADMIN_ROLES.has(role)) {
      return true;
    }

    if (!userId) {
      throw new ForbiddenException("Nicht autorisiert");
    }

    const user = await this.prisma.user.findUnique({
      where:  { id: userId },
      select: { verificationStatus: true },
    });

    if (user?.verificationStatus !== "VERIFIED") {
      // Compliance-Flagging: AuditLog-Eintrag (fire-and-forget, kein await)
      this.prisma.auditLog.create({
        data: {
          userId,
          action:     "KYC_BYPASS_ATTEMPT",
          entityType: "Order",
          entityId:   userId,
          meta:       { verificationStatus: user?.verificationStatus ?? "UNKNOWN" },
        },
      }).catch(() => {});   // Fehler nicht nach oben propagieren

      throw new ForbiddenException(
        "Ihr Account ist noch nicht verifiziert. " +
        "Bitte reichen Sie Ihre Unternehmensdokumente ein und warten Sie auf die KYC-Freigabe."
      );
    }

    return true;
  }
}
