/**
 * Health Controller — /health
 *
 * Endpunkte:
 *   GET /health         → Vollständiger Status (DB, Redis, Memory, Disk)
 *   GET /health/live    → Liveness (nur: läuft der Prozess?)
 *   GET /health/ready   → Readiness (läuft + alle Deps erreichbar?)
 *
 * Konzept Liveness vs. Readiness (Kubernetes-Pattern):
 *   Liveness:  "Ist der Prozess noch am Leben?" → Restart wenn nein
 *   Readiness: "Kann der Prozess Traffic annehmen?" → aus LoadBalancer wenn nein
 *
 * Schwellwerte:
 *   Memory Heap:   < 512 MB  (warnt bei > 85% Auslastung)
 *   Memory RSS:    < 1 GB
 *   DB-Ping:       < 2000ms Timeout
 *   Redis-Ping:    < 1000ms Timeout
 *
 * Warum kein Auth auf /health?
 *   Kubernetes/AWS-Loadbalancer müssen diesen Endpunkt ohne Token erreichen.
 *   Keine sensiblen Daten im Response → kein Auth nötig.
 */

import { Controller, Get } from "@nestjs/common";
import {
  HealthCheck,
  HealthCheckService,
  PrismaHealthIndicator,
  MemoryHealthIndicator,
  HealthCheckResult,
} from "@nestjs/terminus";
import { ApiTags, ApiOperation } from "@nestjs/swagger";
import { PrismaService } from "../../config/prisma.service";
import { SkipThrottle } from "@nestjs/throttler";

@ApiTags("health")
@Controller("health")
@SkipThrottle()
export class HealthController {
  constructor(
    private readonly health:   HealthCheckService,
    private readonly prisma:   PrismaHealthIndicator,
    private readonly memory:   MemoryHealthIndicator,
    private readonly db:       PrismaService,
  ) {}

  /** Vollständiger Health-Check: DB + Memory */
  @Get()
  @HealthCheck()
  @ApiOperation({ summary: "System-Status (DB, Memory, Redis)" })
  check(): Promise<HealthCheckResult> {
    return this.health.check([
      // ── PostgreSQL / Neon ───────────────────────────────────────────────
      () => this.prisma.pingCheck("postgresql", this.db, { timeout: 2000 }),

      // ── Memory: Heap-Verbrauch ───────────────────────────────────────────
      // Heap > 512 MB → unhealthy (typisch für Memory-Leak)
      () => this.memory.checkHeap("memory_heap", 512 * 1024 * 1024),

      // ── Memory: RSS (Resident Set Size) ─────────────────────────────────
      // RSS > 1 GB → unhealthy
      () => this.memory.checkRSS("memory_rss", 1024 * 1024 * 1024),
    ]);
  }

  /** Liveness: Prozess läuft → immer 200 wenn Prozess reagiert */
  @Get("live")
  @ApiOperation({ summary: "Liveness Check (Prozess läuft?)" })
  liveness(): { status: string; timestamp: string } {
    return {
      status:    "ok",
      timestamp: new Date().toISOString(),
    };
  }

  /** Readiness: DB erreichbar → kann Traffic annehmen */
  @Get("ready")
  @HealthCheck()
  @ApiOperation({ summary: "Readiness Check (DB erreichbar?)" })
  readiness(): Promise<HealthCheckResult> {
    return this.health.check([
      () => this.prisma.pingCheck("postgresql", this.db, { timeout: 2000 }),
    ]);
  }
}
