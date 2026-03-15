import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../config/prisma.service";

interface AuditEntry {
  userId:   string;
  action:   string;
  meta?:    Record<string, unknown>;
}

/**
 * EUCX Audit Service — Event Sourcing & unveränderliche Logs.
 * Skill 3: Event Sourcing & Audit Logs
 *
 * Pattern: Jede Aktion wird als immutabler Zeitstempel gespeichert.
 * Löschen ist nicht erlaubt (Revisionssicherheit).
 */
@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  async log(entry: AuditEntry): Promise<void> {
    await this.prisma.auditLog.create({
      data: {
        userId:    entry.userId,
        action:    entry.action,
        meta:      entry.meta ? JSON.stringify(entry.meta) : null,
        createdAt: new Date(),
      },
    });
  }
}
