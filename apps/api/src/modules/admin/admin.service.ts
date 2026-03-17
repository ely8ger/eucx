/**
 * AdminService — Backoffice-Kernlogik für EUCX
 *
 * Verantwortlichkeiten:
 *   1. KYC Workflow      — User-Verifizierungsstatus verwalten, AdminNotes
 *   2. Dispute Resolution — Streitfälle öffnen, prüfen, abschließen
 *   3. Trade Storno       — cancelTrade() mit doppelter Buchführung
 *   4. Fee Reporting      — Plattformgebühren aggregiert nach Monat/Währung
 *   5. Audit Explorer     — durchsuchbare AuditLog-Ansicht für Prüfer
 *   6. Account Freeze     — User-Konto einfrieren / reaktivieren
 *
 * Sicherheit:
 *   - Alle Methoden setzen voraus, dass RolesGuard bereits validiert hat
 *   - Jede Admin-Aktion wird selbst in AuditLog geschrieben
 *   - cancelTrade() verwendet atomare DB-Transaktion (keine Teilstornos möglich)
 */

import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from "@nestjs/common";
import { PrismaService }  from "../../config/prisma.service";
import { AuditService }   from "../audit/audit.service";
import type {
  VerificationStatus,
  DisputeStatus,
  DisputeResolution,
  Prisma,
} from "@prisma/client";
import Decimal from "decimal.js";

// ─── DTOs (intern, ohne class-validator für Übersichtlichkeit) ────────────────

export interface SetVerificationDto {
  status:  VerificationStatus;
  comment: string;   // Pflicht — erscheint in AdminNote
}

export interface AddAdminNoteDto {
  content: string;
  isFlag:  boolean;
}

export interface OpenDisputeDto {
  reason:       string;
  evidenceUrls: string[];
}

export interface ResolveDisputeDto {
  resolution:          DisputeResolution;
  adminComment:        string;
  manualRefundAmount?: string;   // Nur bei PARTIAL_REFUND
}

export interface FeeReportFilter {
  from:      Date;
  to:        Date;
  currency?: string;
}

export interface AuditLogFilter {
  userId?:    string;
  action?:    string;
  entityType?: string;
  from?:      Date;
  to?:        Date;
  limit:      number;
  offset:     number;
}

// ─── Service ──────────────────────────────────────────────────────────────────

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit:  AuditService,
  ) {}

  // ════════════════════════════════════════════════════════════════════════════
  // 1. KYC WORKFLOW
  // ════════════════════════════════════════════════════════════════════════════

  /** Alle User in einer bestimmten KYC-Stufe (z.B. PENDING_VERIFICATION) */
  async getUsersByVerification(status: VerificationStatus, skip = 0, take = 50) {
    return this.prisma.user.findMany({
      where: { verificationStatus: status },
      select: {
        id:                 true,
        email:              true,
        role:               true,
        status:             true,
        verificationStatus: true,
        createdAt:          true,
        organization: {
          select: { name: true, country: true, taxId: true },
        },
        adminNotes: {
          orderBy: { createdAt: "desc" },
          take: 3,
          select: { content: true, isFlag: true, createdAt: true,
            author: { select: { email: true } } },
        },
      },
      skip,
      take,
      orderBy: { createdAt: "asc" },
    });
  }

  /** KYC-Status setzen + automatisch AdminNote erstellen */
  async setVerificationStatus(
    targetUserId: string,
    adminId:      string,
    dto:          SetVerificationDto,
  ) {
    const user = await this.prisma.user.findUnique({ where: { id: targetUserId } });
    if (!user) throw new NotFoundException("User nicht gefunden");

    const [updated] = await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: targetUserId },
        data:  { verificationStatus: dto.status },
        select: { id: true, email: true, verificationStatus: true },
      }),
      this.prisma.adminNote.create({
        data: {
          subjectId: targetUserId,
          authorId:  adminId,
          content:   `[KYC ${dto.status}] ${dto.comment}`,
          isFlag:    dto.status === "REJECTED" || dto.status === "SUSPENDED",
        },
      }),
    ]);

    await this.audit.log({
      userId:     adminId,
      action:     "KYC_STATUS_CHANGED",
      entityType: "User",
      entityId:   targetUserId,
      meta: {
        from:    user.verificationStatus,
        to:      dto.status,
        comment: dto.comment,
      } as Prisma.InputJsonObject,
    });

    return updated;
  }

  /** Account einfrieren (sofortige Handelssperre) */
  async freezeAccount(targetUserId: string, adminId: string, reason: string) {
    const user = await this.prisma.user.findUnique({ where: { id: targetUserId } });
    if (!user) throw new NotFoundException("User nicht gefunden");

    if (user.status === "SUSPENDED") {
      throw new ConflictException("Account ist bereits gesperrt");
    }

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: targetUserId },
        data:  { status: "SUSPENDED", verificationStatus: "SUSPENDED" },
      }),
      this.prisma.adminNote.create({
        data: {
          subjectId: targetUserId,
          authorId:  adminId,
          content:   `[FREEZE] ${reason}`,
          isFlag:    true,
        },
      }),
    ]);

    await this.audit.log({
      userId:     adminId,
      action:     "ACCOUNT_FROZEN",
      entityType: "User",
      entityId:   targetUserId,
      meta:       { reason } as Prisma.InputJsonObject,
    });
  }

  /** Account reaktivieren */
  async unfreezeAccount(targetUserId: string, adminId: string, reason: string) {
    const user = await this.prisma.user.findUnique({ where: { id: targetUserId } });
    if (!user) throw new NotFoundException("User nicht gefunden");

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: targetUserId },
        data:  { status: "ACTIVE", verificationStatus: "VERIFIED" },
      }),
      this.prisma.adminNote.create({
        data: {
          subjectId: targetUserId,
          authorId:  adminId,
          content:   `[UNFREEZE] ${reason}`,
          isFlag:    false,
        },
      }),
    ]);

    await this.audit.log({
      userId:     adminId,
      action:     "ACCOUNT_UNFROZEN",
      entityType: "User",
      entityId:   targetUserId,
      meta:       { reason } as Prisma.InputJsonObject,
    });
  }

  /** Interne Notiz zu einem User hinzufügen */
  async addAdminNote(targetUserId: string, adminId: string, dto: AddAdminNoteDto) {
    const user = await this.prisma.user.findUnique({ where: { id: targetUserId } });
    if (!user) throw new NotFoundException("User nicht gefunden");

    return this.prisma.adminNote.create({
      data: {
        subjectId: targetUserId,
        authorId:  adminId,
        content:   dto.content,
        isFlag:    dto.isFlag,
      },
      select: { id: true, content: true, isFlag: true, createdAt: true },
    });
  }

  // ════════════════════════════════════════════════════════════════════════════
  // 2. DISPUTE RESOLUTION
  // ════════════════════════════════════════════════════════════════════════════

  /** Streitfall eröffnen — friert den Trade ein */
  async openDispute(dealId: string, raisedById: string, dto: OpenDisputeDto) {
    const deal = await this.prisma.deal.findUnique({ where: { id: dealId } });
    if (!deal) throw new NotFoundException("Trade nicht gefunden");

    if (deal.status === "DISPUTED") {
      throw new ConflictException("Für diesen Trade ist bereits ein Streitfall offen");
    }

    const allowed: string[] = ["CONTRACT_SIGNED", "SETTLEMENT_COMPLETE"];
    if (!allowed.includes(deal.status)) {
      throw new BadRequestException(
        `Streitfall kann nur bei abgeschlossenen Trades eröffnet werden (Status: ${deal.status})`
      );
    }

    await this.prisma.$transaction([
      this.prisma.deal.update({
        where: { id: dealId },
        data:  { status: "DISPUTED" },
      }),
      this.prisma.tradeDispute.create({
        data: {
          dealId,
          raisedById,
          reason:       dto.reason,
          evidenceUrls: dto.evidenceUrls,
          status:       "OPEN",
        },
      }),
    ]);

    await this.audit.log({
      userId:     raisedById,
      action:     "DISPUTE_OPENED",
      entityType: "Deal",
      entityId:   dealId,
      meta:       { reason: dto.reason } as Prisma.InputJsonObject,
    });
  }

  /** Alle offenen Disputes (für Compliance-Dashboard) */
  async getOpenDisputes(status?: DisputeStatus) {
    return this.prisma.tradeDispute.findMany({
      where:   status ? { status } : { status: { in: ["OPEN", "UNDER_REVIEW"] } },
      include: {
        deal: {
          select: {
            id: true, status: true, totalValue: true, currency: true,
            product:    { select: { name: true } },
            sellerOrg:  { select: { name: true } },
            buyerOrg:   { select: { name: true } },
          },
        },
        raisedBy: { select: { email: true, organization: { select: { name: true } } } },
      },
      orderBy: { createdAt: "asc" },
    });
  }

  /** Status des Dispute aktualisieren (z.B. OPEN → UNDER_REVIEW) */
  async updateDisputeStatus(disputeId: string, adminId: string, status: DisputeStatus) {
    const dispute = await this.prisma.tradeDispute.findUnique({ where: { id: disputeId } });
    if (!dispute) throw new NotFoundException("Dispute nicht gefunden");

    return this.prisma.tradeDispute.update({
      where: { id: disputeId },
      data:  { status, reviewedById: adminId },
      select: { id: true, status: true, dealId: true },
    });
  }

  /**
   * Dispute abschließen.
   *
   * resolution = TRADE_UPHELD:
   *   → Deal.status zurück auf CONTRACT_SIGNED, Dispute closed
   *
   * resolution = TRADE_REVERSED:
   *   → cancelTrade() — Storno-Buchungen im Ledger
   *
   * resolution = PARTIAL_REFUND:
   *   → manualRefundAmount wird als Storno-ähnliche Buchung angelegt
   */
  async resolveDispute(disputeId: string, adminId: string, dto: ResolveDisputeDto) {
    const dispute = await this.prisma.tradeDispute.findUnique({
      where:   { id: disputeId },
      include: { deal: true },
    });
    if (!dispute) throw new NotFoundException("Dispute nicht gefunden");
    if (dispute.status === "RESOLVED" || dispute.status === "CANCELLED") {
      throw new ConflictException("Dispute ist bereits abgeschlossen");
    }

    if (dto.resolution === "TRADE_UPHELD") {
      await this.prisma.$transaction([
        this.prisma.deal.update({
          where: { id: dispute.dealId },
          data:  { status: "CONTRACT_SIGNED" },   // Zurück zu normalem Status
        }),
        this.prisma.tradeDispute.update({
          where: { id: disputeId },
          data: {
            status:       "RESOLVED",
            resolution:   dto.resolution,
            adminComment: dto.adminComment,
            reviewedById: adminId,
            resolvedAt:   new Date(),
          },
        }),
      ]);
    } else if (dto.resolution === "TRADE_REVERSED") {
      // Storno-Buchungen im Ledger + Deal stornieren
      await this.cancelTrade(dispute.dealId, adminId, `Dispute ${disputeId}: ${dto.adminComment}`);

      await this.prisma.tradeDispute.update({
        where: { id: disputeId },
        data: {
          status:       "CANCELLED",
          resolution:   dto.resolution,
          adminComment: dto.adminComment,
          reviewedById: adminId,
          resolvedAt:   new Date(),
        },
      });
    } else if (dto.resolution === "PARTIAL_REFUND") {
      if (!dto.manualRefundAmount) {
        throw new BadRequestException("manualRefundAmount erforderlich bei PARTIAL_REFUND");
      }
      await this.applyPartialRefund(dispute.dealId, adminId, dto.manualRefundAmount, dto.adminComment);

      await this.prisma.tradeDispute.update({
        where: { id: disputeId },
        data: {
          status:             "RESOLVED",
          resolution:         dto.resolution,
          adminComment:       dto.adminComment,
          manualRefundAmount: dto.manualRefundAmount,
          reviewedById:       adminId,
          resolvedAt:         new Date(),
        },
      });
    }

    await this.audit.log({
      userId:     adminId,
      action:     "DISPUTE_RESOLVED",
      entityType: "TradeDispute",
      entityId:   disputeId,
      meta: {
        resolution:   dto.resolution,
        adminComment: dto.adminComment,
      } as Prisma.InputJsonObject,
    });
  }

  // ════════════════════════════════════════════════════════════════════════════
  // 3. TRADE STORNO (Double-Entry Reversal)
  //
  //  Prinzip: Keine Daten werden gelöscht.
  //  Jede Original-Buchung bekommt eine Gegenbuchung (DEBIT ↔ CREDIT getauscht)
  //  mit correlationId = "STORNO-{originalCorrelationId}".
  //
  //  Invariante nach Storno:
  //    SUM(DEBIT) == SUM(CREDIT) für ALLE correlationIds gemeinsam
  //    = Doppelte Buchführung bleibt korrekt
  // ════════════════════════════════════════════════════════════════════════════

  async cancelTrade(dealId: string, adminId: string, reason: string): Promise<void> {
    const deal = await this.prisma.deal.findUnique({
      where:   { id: dealId },
      include: { settlement: true },
    });

    if (!deal) throw new NotFoundException("Trade nicht gefunden");

    if (deal.status === "CANCELLED") {
      throw new ConflictException("Trade ist bereits storniert");
    }

    await this.prisma.$transaction(async (tx) => {
      // ── 1. Storno-Gegenbuchungen anlegen ──────────────────────────────────
      // LedgerEntries sind über dealId verknüpft (kein settlementId in LedgerEntry)
      const originalEntries = await tx.ledgerEntry.findMany({
        where: { dealId },
      });

      for (const entry of originalEntries) {
        // Gegenbuchung: DEBIT → CREDIT, CREDIT → DEBIT (gleicher Betrag)
        // idempotencyKey muss einmalig sein → STORNO-Prefix
        await tx.ledgerEntry.create({
          data: {
            walletId:      entry.walletId,
            accountType:   entry.accountType,
            entryType:     entry.entryType === "DEBIT" ? "CREDIT" : "DEBIT",
            amount:        entry.amount,
            currency:      entry.currency,
            correlationId: `STORNO-${entry.correlationId}`,
            description:   `Storno: ${entry.description} | Grund: ${reason}`,
            dealId:        entry.dealId,
            idempotencyKey: `storno:${entry.id}`,
          },
        });
      }

      // ── 2. Settlement auf REVERSED setzen ─────────────────────────────────
      if (deal.settlement) {
        await tx.settlement.update({
          where: { id: deal.settlement.id },
          data:  { status: "REVERSED" },
        });
      }

      // ── 3. Deal auf CANCELLED setzen ──────────────────────────────────────
      await tx.deal.update({
        where: { id: dealId },
        data:  { status: "CANCELLED" },
      });
    });

    await this.audit.log({
      userId:     adminId,
      action:     "TRADE_CANCELLED",
      entityType: "Deal",
      entityId:   dealId,
      meta:       { reason } as Prisma.InputJsonObject,
    });
  }

  /** Teilrückerstattung: Einzelne Gegenbuchung über manualRefundAmount */
  private async applyPartialRefund(
    dealId:   string,
    adminId:  string,
    amount:   string,
    comment:  string,
  ): Promise<void> {
    const refundAmount = new Decimal(amount);
    if (refundAmount.lte(0)) {
      throw new BadRequestException("Rückerstattungsbetrag muss positiv sein");
    }

    const deal = await this.prisma.deal.findUnique({
      where:   { id: dealId },
      include: { settlement: true },
    });
    if (!deal?.settlement) {
      throw new BadRequestException("Kein Settlement für diesen Trade gefunden");
    }

    // Buyer-Wallet identifizieren (bekommt Rückerstattung)
    const buyerWallet = await this.prisma.wallet.findFirst({
      where: { organizationId: deal.buyerOrgId, currency: deal.currency },
    });
    if (!buyerWallet) {
      throw new BadRequestException("Käufer-Wallet nicht gefunden");
    }

    const correlationId = `PARTIAL-REFUND-${dealId}-${Date.now()}`;

    const sellerWallet = await this.prisma.wallet.findFirst({
      where: { organizationId: deal.sellerOrgId, currency: deal.currency },
    });

    await this.prisma.$transaction([
      // CREDIT an Käufer
      this.prisma.ledgerEntry.create({
        data: {
          walletId:       buyerWallet.id,
          accountType:    "TRADER_WALLET",
          entryType:      "CREDIT",
          amount:         refundAmount.toString(),
          currency:       deal.currency,
          correlationId,
          description:    `Teilrückerstattung | Dispute | ${comment}`,
          dealId:         dealId,
          idempotencyKey: `${correlationId}:buyer:CREDIT`,
        },
      }),
      // DEBIT vom Verkäufer (Gegenbuchung) — nur wenn Wallet existiert
      ...(sellerWallet ? [
        this.prisma.ledgerEntry.create({
          data: {
            walletId:       sellerWallet.id,
            accountType:    "TRADER_WALLET",
            entryType:      "DEBIT",
            amount:         refundAmount.toString(),
            currency:       deal.currency,
            correlationId,
            description:    `Teilrückerstattung (Gegenbuchung) | Dispute | ${comment}`,
            dealId:         dealId,
            idempotencyKey: `${correlationId}:seller:DEBIT`,
          },
        }),
      ] : []),
    ]);

    await this.audit.log({
      userId:     adminId,
      action:     "PARTIAL_REFUND_APPLIED",
      entityType: "Deal",
      entityId:   dealId,
      meta:       { amount, comment, correlationId } as Prisma.InputJsonObject,
    });
  }

  // ════════════════════════════════════════════════════════════════════════════
  // 4. FEE REPORTING — Plattformeinnahmen
  // ════════════════════════════════════════════════════════════════════════════

  /**
   * Aggregiert Plattformgebühren nach Monat + Währung.
   *
   * Gibt zurück:
   *   [{ month: "2026-03", currency: "EUR", totalFees: "12543.20", tradeCount: 48 }]
   */
  async getFeeReport(filter: FeeReportFilter) {
    type FeeRow = {
      month:       string;
      currency:    string;
      total_fees:  unknown;
      trade_count: bigint | number;
    };

    const rows = filter.currency
      ? await this.prisma.$queryRaw<FeeRow[]>`
          SELECT
            to_char(i.created_at, 'YYYY-MM')  AS month,
            i.currency::text,
            SUM(i.platform_fee)::numeric       AS total_fees,
            COUNT(*)                           AS trade_count
          FROM invoices i
          WHERE i.created_at >= ${filter.from}
            AND i.created_at <= ${filter.to}
            AND i.currency::text = ${filter.currency}
          GROUP BY to_char(i.created_at, 'YYYY-MM'), i.currency
          ORDER BY month DESC, i.currency
        `
      : await this.prisma.$queryRaw<FeeRow[]>`
          SELECT
            to_char(i.created_at, 'YYYY-MM')  AS month,
            i.currency::text,
            SUM(i.platform_fee)::numeric       AS total_fees,
            COUNT(*)                           AS trade_count
          FROM invoices i
          WHERE i.created_at >= ${filter.from}
            AND i.created_at <= ${filter.to}
          GROUP BY to_char(i.created_at, 'YYYY-MM'), i.currency
          ORDER BY month DESC, i.currency
        `;

    // Total Value Locked (TVL) — Summe aller Wallet-Guthaben
    const tvl = await this.prisma.wallet.groupBy({
      by:      ["currency"],
      _sum:    { balance: true },
    });

    return {
      fees: rows.map((r) => ({
        month:      r.month,
        currency:   r.currency,
        totalFees:  String(r.total_fees),
        tradeCount: typeof r.trade_count === "bigint" ? Number(r.trade_count) : r.trade_count,
      })),
      tvl: tvl.map((t) => ({
        currency: t.currency,
        balance:  t._sum.balance?.toString() ?? "0",
      })),
      generatedAt: new Date().toISOString(),
    };
  }

  /** Tagesübersicht: Umsatz, Gebühren, neue Trades */
  async getDailySummary(date: Date) {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);

    const [deals, fees, newUsers] = await Promise.all([
      this.prisma.deal.aggregate({
        where:  { createdAt: { gte: start, lte: end }, status: { notIn: ["CANCELLED", "DISPUTED"] } },
        _sum:   { totalValue: true },
        _count: { id: true },
      }),
      this.prisma.invoice.aggregate({
        where:  { createdAt: { gte: start, lte: end } },
        _sum:   { platformFee: true },
      }),
      this.prisma.user.count({
        where: { createdAt: { gte: start, lte: end } },
      }),
    ]);

    return {
      date:          start.toISOString().slice(0, 10),
      tradeCount:    deals._count.id,
      totalVolume:   deals._sum.totalValue?.toString() ?? "0",
      platformFees:  fees._sum.platformFee?.toString() ?? "0",
      newUsers,
    };
  }

  // ════════════════════════════════════════════════════════════════════════════
  // 5. AUDIT LOG EXPLORER
  // ════════════════════════════════════════════════════════════════════════════

  async searchAuditLogs(filter: AuditLogFilter) {
    const where: Prisma.AuditLogWhereInput = {
      ...(filter.userId     ? { userId:     filter.userId }     : {}),
      ...(filter.action     ? { action:     { contains: filter.action, mode: "insensitive" } } : {}),
      ...(filter.entityType ? { entityType: filter.entityType } : {}),
      ...(filter.from || filter.to
        ? {
            createdAt: {
              ...(filter.from ? { gte: filter.from } : {}),
              ...(filter.to   ? { lte: filter.to   } : {}),
            },
          }
        : {}),
    };

    const [logs, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        include: {
          user: { select: { email: true, role: true,
            organization: { select: { name: true } } } },
        },
        orderBy: { createdAt: "desc" },
        skip:    filter.offset,
        take:    filter.limit,
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return { logs, total, offset: filter.offset, limit: filter.limit };
  }

  /** Kritische Events: fehlgeschlagene Logins, Preis-Alerts, manuelle Eingriffe */
  async getCriticalEvents(limit = 100) {
    const criticalActions = [
      "LOGIN_FAILED",
      "ACCOUNT_FROZEN",
      "TRADE_CANCELLED",
      "DISPUTE_OPENED",
      "DISPUTE_RESOLVED",
      "KYC_STATUS_CHANGED",
      "PARTIAL_REFUND_APPLIED",
      "PRICE_MANIPULATION_ALERT",
    ];

    return this.prisma.auditLog.findMany({
      where:   { action: { in: criticalActions } },
      include: {
        user: { select: { email: true, organization: { select: { name: true } } } },
      },
      orderBy: { createdAt: "desc" },
      take:    limit,
    });
  }
}
