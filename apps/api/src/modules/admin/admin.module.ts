import { Module }         from "@nestjs/common";
import { PrismaService }  from "../../config/prisma.service";
import { AuditModule }    from "../audit/audit.module";
import { AdminService }   from "./admin.service";
import { AdminController } from "./admin.controller";

@Module({
  imports:     [AuditModule],
  providers:   [PrismaService, AdminService],
  controllers: [AdminController],
  exports:     [AdminService],
})
export class AdminModule {}
