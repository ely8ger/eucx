import { Module }        from "@nestjs/common";
import { ScheduleModule } from "@nestjs/schedule";
import { PrismaService }  from "../../config/prisma.service";
import { MarketDataService } from "./market.service";

@Module({
  imports: [
    // ScheduleModule.forRoot() wird einmalig im AppModule registriert
  ],
  providers:   [PrismaService, MarketDataService],
  exports:     [MarketDataService],
})
export class MarketModule {}
