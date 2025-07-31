import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { AuditLogService } from './audit-log.service';
import { AuditLog } from './entities/audit-log.entity';

@Controller('audit-logs')
export class AuditLogController {
  constructor(private readonly auditLogService: AuditLogService) {}

  @Post()
  create(@Body() body: Partial<AuditLog>) {
    return this.auditLogService.create(body);
  }

  @Get()
  getAll() {
    return this.auditLogService.findAll();
  }

  @Get('search')
  filterLogs(
    @Query('actionType') actionType: string,
    @Query('initiator') initiator: string,
    @Query('from') from: string,
    @Query('to') to: string,
  ) {
    return this.auditLogService.findByFilters(
      actionType,
      from ? new Date(from) : undefined,
      to ? new Date(to) : undefined,
      initiator,
    );
  }
}
