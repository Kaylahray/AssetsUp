import { Module, Global } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { EventEmitterModule } from "@nestjs/event-emitter";
import { AuditLogService } from "./audit-log.service";
import { AuditLogController } from "./audit-log.controller";
import { AuditLog } from "./entities/audit-log.entity";
import { AuditEmitterService } from "./services/audit-emitter.service";
import { AuditInterceptor } from "./interceptors/audit.interceptor";

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([AuditLog]),
    EventEmitterModule,
  ],
  controllers: [AuditLogController],
  providers: [
    AuditLogService,
    AuditEmitterService,
    AuditInterceptor,
  ],
  exports: [
    AuditLogService,
    AuditEmitterService,
    AuditInterceptor,
  ],
})
export class AuditLogModule {}
