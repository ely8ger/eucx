/**
 * AdminController — /api/v1/admin/*
 *
 * Alle Endpunkte sind doppelt geschützt:
 *   1. JwtAuthGuard   — gültiger Bearer-Token erforderlich
 *   2. RolesGuard     — Rolle muss in @Roles() stehen
 *
 * Rollenverteilung:
 *   SUPER_ADMIN:         alles
 *   COMPLIANCE_OFFICER:  KYC, Disputes, Audit, Fee-Report
 *   ADMIN:               User-Verwaltung (kein Storno, kein Fee-Report)
 *
 * Endpunkte:
 *   GET  /admin/kyc?status=PENDING_VERIFICATION   — KYC-Queue
 *   PATCH /admin/kyc/:userId                       — Status setzen
 *   POST  /admin/kyc/:userId/note                  — AdminNote hinzufügen
 *   POST  /admin/kyc/:userId/freeze                — Account einfrieren
 *   POST  /admin/kyc/:userId/unfreeze              — Account reaktivieren
 *
 *   GET   /admin/disputes                          — Offene Disputes
 *   PATCH /admin/disputes/:id/status               — Status ändern
 *   POST  /admin/disputes/:id/resolve              — Dispute abschließen
 *   POST  /admin/trades/:dealId/dispute            — Dispute eröffnen
 *   DELETE /admin/trades/:dealId                   — Trade stornieren (hard cancel)
 *
 *   GET  /admin/finance/fees?from=&to=             — Gebühren-Report
 *   GET  /admin/finance/daily?date=                — Tagesübersicht
 *
 *   GET  /admin/audit?userId=&action=&from=&to=    — Audit-Log Explorer
 *   GET  /admin/audit/critical                     — Kritische Events
 */

import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
  DefaultValuePipe,
} from "@nestjs/common";
import { AdminService, type SetVerificationDto, type AddAdminNoteDto, type OpenDisputeDto, type ResolveDisputeDto } from "./admin.service";
import { JwtAuthGuard }   from "../../common/guards/jwt-auth.guard";
import { RolesGuard }     from "../../common/guards/roles.guard";
import { Roles }          from "../../common/decorators/roles.decorator";
import type { VerificationStatus, DisputeStatus } from "@prisma/client";

type AuthRequest = { user: { userId: string; role: string } };

@Controller("admin")
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminController {
  constructor(private readonly admin: AdminService) {}

  // ═══════════════════════════════════════════════════════════════════════════
  // KYC MANAGEMENT
  // ═══════════════════════════════════════════════════════════════════════════

  @Get("kyc")
  @Roles("SUPER_ADMIN", "COMPLIANCE_OFFICER", "ADMIN")
  getKycQueue(
    @Query("status") status: VerificationStatus = "PENDING_VERIFICATION",
    @Query("skip", new DefaultValuePipe(0), ParseIntPipe)  skip: number,
    @Query("take", new DefaultValuePipe(50), ParseIntPipe) take: number,
  ) {
    return this.admin.getUsersByVerification(status, skip, take);
  }

  @Patch("kyc/:userId")
  @Roles("SUPER_ADMIN", "COMPLIANCE_OFFICER")
  setVerification(
    @Param("userId")  userId: string,
    @Body()           dto:    SetVerificationDto,
    @Request()        req:    AuthRequest,
  ) {
    return this.admin.setVerificationStatus(userId, req.user.userId, dto);
  }

  @Post("kyc/:userId/note")
  @Roles("SUPER_ADMIN", "COMPLIANCE_OFFICER", "ADMIN")
  @HttpCode(HttpStatus.CREATED)
  addNote(
    @Param("userId") userId: string,
    @Body()          dto:    AddAdminNoteDto,
    @Request()       req:    AuthRequest,
  ) {
    return this.admin.addAdminNote(userId, req.user.userId, dto);
  }

  @Post("kyc/:userId/freeze")
  @Roles("SUPER_ADMIN", "COMPLIANCE_OFFICER")
  @HttpCode(HttpStatus.OK)
  freezeAccount(
    @Param("userId")  userId: string,
    @Body("reason")   reason: string,
    @Request()        req:    AuthRequest,
  ) {
    return this.admin.freezeAccount(userId, req.user.userId, reason);
  }

  @Post("kyc/:userId/unfreeze")
  @Roles("SUPER_ADMIN")
  @HttpCode(HttpStatus.OK)
  unfreezeAccount(
    @Param("userId") userId: string,
    @Body("reason")  reason: string,
    @Request()       req:    AuthRequest,
  ) {
    return this.admin.unfreezeAccount(userId, req.user.userId, reason);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // DISPUTE MANAGEMENT
  // ═══════════════════════════════════════════════════════════════════════════

  @Get("disputes")
  @Roles("SUPER_ADMIN", "COMPLIANCE_OFFICER")
  getDisputes(@Query("status") status?: DisputeStatus) {
    return this.admin.getOpenDisputes(status);
  }

  @Post("trades/:dealId/dispute")
  @Roles("SUPER_ADMIN", "COMPLIANCE_OFFICER", "ADMIN")
  @HttpCode(HttpStatus.CREATED)
  openDispute(
    @Param("dealId") dealId: string,
    @Body()          dto:    OpenDisputeDto,
    @Request()       req:    AuthRequest,
  ) {
    return this.admin.openDispute(dealId, req.user.userId, dto);
  }

  @Patch("disputes/:id/status")
  @Roles("SUPER_ADMIN", "COMPLIANCE_OFFICER")
  updateDisputeStatus(
    @Param("id")       id:     string,
    @Body("status")    status: DisputeStatus,
    @Request()         req:    AuthRequest,
  ) {
    return this.admin.updateDisputeStatus(id, req.user.userId, status);
  }

  @Post("disputes/:id/resolve")
  @Roles("SUPER_ADMIN", "COMPLIANCE_OFFICER")
  @HttpCode(HttpStatus.OK)
  resolveDispute(
    @Param("id") id:    string,
    @Body()      dto:   ResolveDisputeDto,
    @Request()   req:   AuthRequest,
  ) {
    return this.admin.resolveDispute(id, req.user.userId, dto);
  }

  /** Hard-Cancel: Trade direkt stornieren (ohne Dispute-Ticket) */
  @Delete("trades/:dealId")
  @Roles("SUPER_ADMIN")
  @HttpCode(HttpStatus.OK)
  cancelTrade(
    @Param("dealId") dealId: string,
    @Body("reason")  reason: string,
    @Request()       req:    AuthRequest,
  ) {
    return this.admin.cancelTrade(dealId, req.user.userId, reason);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // FINANCIAL OVERSIGHT
  // ═══════════════════════════════════════════════════════════════════════════

  @Get("finance/fees")
  @Roles("SUPER_ADMIN", "COMPLIANCE_OFFICER")
  getFeeReport(
    @Query("from")     from:     string,
    @Query("to")       to:       string,
    @Query("currency") currency?: string,
  ) {
    return this.admin.getFeeReport({
      from:     from ? new Date(from) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      to:       to   ? new Date(to)   : new Date(),
      currency,
    });
  }

  @Get("finance/daily")
  @Roles("SUPER_ADMIN", "COMPLIANCE_OFFICER")
  getDailySummary(@Query("date") date?: string) {
    return this.admin.getDailySummary(date ? new Date(date) : new Date());
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // AUDIT LOG EXPLORER
  // ═══════════════════════════════════════════════════════════════════════════

  @Get("audit")
  @Roles("SUPER_ADMIN", "COMPLIANCE_OFFICER")
  searchAuditLogs(
    @Query("limit",  new DefaultValuePipe(50),  ParseIntPipe) limit:  number,
    @Query("offset", new DefaultValuePipe(0),   ParseIntPipe) offset: number,
    @Query("userId")     userId?:     string,
    @Query("action")     action?:     string,
    @Query("entityType") entityType?: string,
    @Query("from")       from?:       string,
    @Query("to")         to?:         string,
  ) {
    return this.admin.searchAuditLogs({
      userId,
      action,
      entityType,
      from:   from ? new Date(from) : undefined,
      to:     to   ? new Date(to)   : undefined,
      limit:  Math.min(limit, 500),
      offset,
    });
  }

  @Get("audit/critical")
  @Roles("SUPER_ADMIN", "COMPLIANCE_OFFICER")
  getCriticalEvents(
    @Query("limit", new DefaultValuePipe(100), ParseIntPipe) limit: number,
  ) {
    return this.admin.getCriticalEvents(Math.min(limit, 500));
  }
}
