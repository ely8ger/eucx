/**
 * ClearingController — Enqueue + Status-Abfrage
 *
 * POST /api/v1/clearing/enqueue   → Job in BullMQ-Queue einreihen
 * GET  /api/v1/clearing/:dealId   → Settlement-Status abfragen
 *
 * Wird vom Next.js-Backend (nach CONTRACT_SIGNED) via internem API-Call aufgerufen.
 */

import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  HttpCode,
  HttpStatus,
  NotFoundException,
  ConflictException,
  Logger,
} from "@nestjs/common";
import { InjectQueue }         from "@nestjs/bullmq";
import { Queue }               from "bullmq";
import { ApiTags, ApiBearerAuth, ApiOperation } from "@nestjs/swagger";
import { PrismaService }       from "../../config/prisma.service";
import { INVOICE_GENERATION_QUEUE } from "./clearing.processor";
import { EnqueueClearingDto }  from "./dto/enqueue-clearing.dto";

@ApiTags("clearing")
@ApiBearerAuth()
@Controller("clearing")
export class ClearingController {
  private readonly logger = new Logger(ClearingController.name);

  constructor(
    @InjectQueue(INVOICE_GENERATION_QUEUE)
    private readonly clearingQueue: Queue,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * POST /api/v1/clearing/enqueue
   *
   * Reiht einen Settlement-Job in die BullMQ-Queue ein.
   * Idempotent: Wenn Settlement bereits COMPLETED → 200 ohne neuen Job.
   */
  @Post("enqueue")
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ summary: "Settlement-Job für CONTRACT_SIGNED Deal einreihen" })
  async enqueue(@Body() dto: EnqueueClearingDto) {
    const { dealId } = dto;

    // ── Deal validieren ────────────────────────────────────────────────────
    const deal = await this.prisma.deal.findUnique({
      where:   { id: dealId },
      include: { settlement: true },
    });

    if (!deal) {
      throw new NotFoundException(`Deal ${dealId} nicht gefunden`);
    }

    if (deal.status !== "CONTRACT_SIGNED") {
      throw new ConflictException(
        `Deal hat Status ${deal.status} — nur CONTRACT_SIGNED erlaubt`
      );
    }

    // ── Idempotenz: bereits abgeschlossen? ─────────────────────────────────
    if (deal.settlement?.status === "COMPLETED") {
      return {
        status:  "already_completed",
        message: "Settlement bereits abgeschlossen — kein neuer Job",
        dealId,
      };
    }

    // ── Job einreihen ──────────────────────────────────────────────────────
    // jobId = dealId → BullMQ dedupliziert automatisch (kein doppelter Job)
    const job = await this.clearingQueue.add(
      "invoice-generation",
      {
        dealId,
        triggeredBy:  "system",
        triggeredAt:  new Date().toISOString(),
      },
      {
        jobId:    `settlement:${dealId}`,   // Deduplizierung via jobId
        attempts: 3,
        backoff: {
          type:  "exponential",
          delay: 5_000,  // 5s, 25s, 125s
        },
        removeOnComplete: {
          age:   86_400,  // 24h nach Completion behalten
          count: 1000,
        },
        removeOnFail: {
          age: 7 * 86_400,  // 7 Tage bei Fehler behalten
        },
      }
    );

    this.logger.log(
      `Settlement-Job ${job.id} eingereiht für Deal ${dealId}`
    );

    return {
      status:  "queued",
      jobId:   job.id,
      dealId,
      message: "Settlement-Job erfolgreich eingereiht",
    };
  }

  /**
   * GET /api/v1/clearing/:dealId
   *
   * Settlement-Status + Rechnungen für einen Deal.
   */
  @Get(":dealId")
  @ApiOperation({ summary: "Settlement-Status für einen Deal abfragen" })
  async getStatus(@Param("dealId") dealId: string) {
    const settlement = await this.prisma.settlement.findUnique({
      where:   { dealId },
      include: {
        deal: {
          include: {
            invoices: {
              select: {
                id:            true,
                invoiceNumber: true,
                type:          true,
                status:        true,
                netPayable:    true,
                issuedAt:      true,
              },
            },
          },
        },
      },
    });

    if (!settlement) {
      throw new NotFoundException(`Kein Settlement für Deal ${dealId}`);
    }

    // ── BullMQ Job-Status abfragen ──────────────────────────────────────────
    const job = await this.clearingQueue.getJob(`settlement:${dealId}`);
    const jobState = job ? await job.getState() : null;

    return {
      settlementId:  settlement.id,
      dealId:        settlement.dealId,
      status:        settlement.status,
      grossAmount:   settlement.grossAmount,
      platformFee:   settlement.platformFee,
      vatAmount:     settlement.vatAmount,
      netToSeller:   settlement.netToSeller,
      currency:      settlement.currency,
      processedAt:   settlement.processedAt,
      errorMessage:  settlement.errorMessage,
      retryCount:    settlement.retryCount,
      jobState,
      invoices:      settlement.deal.invoices,
    };
  }
}
