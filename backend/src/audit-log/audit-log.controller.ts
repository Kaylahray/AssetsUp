import { Controller, Get, Query } from "@nestjs/common";
import { AuditLogService } from "./audit-log.service";

@Controller("audit-logs")
export class AuditLogController {
  constructor(private readonly auditService: AuditLogService) {}

  @Get()
  findAll(
    @Query("userId") userId?: string,
    @Query("actionType") actionType?: string,
    @Query("startDate") startDate?: string,
    @Query("endDate") endDate?: string,
    @Query("skip") skip = "0",
    @Query("take") take = "20"
  ) {
    return this.auditService.getLogs({
      userId,
      actionType,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      skip: parseInt(skip),
      take: parseInt(take),
    });
  }
}
