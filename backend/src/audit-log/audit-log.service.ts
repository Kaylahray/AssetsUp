import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, Between } from "typeorm";
import { AuditLog } from "./entities/audit-log.entity";

@Injectable()
export class AuditLogService {
  constructor(
    @InjectRepository(AuditLog)
    private auditRepo: Repository<AuditLog>
  ) {}

  async record(log: Partial<AuditLog>): Promise<AuditLog> {
    const entry = this.auditRepo.create(log);
    return this.auditRepo.save(entry);
  }

  async getLogs(filters: {
    userId?: string;
    actionType?: string;
    startDate?: Date;
    endDate?: Date;
    skip?: number;
    take?: number;
  }): Promise<[AuditLog[], number]> {
    const where: any = {};
    if (filters.userId) where.userId = filters.userId;
    if (filters.actionType) where.actionType = filters.actionType;
    if (filters.startDate && filters.endDate)
      where.timestamp = Between(filters.startDate, filters.endDate);

    return this.auditRepo.findAndCount({
      where,
      order: { timestamp: "DESC" },
      skip: filters.skip || 0,
      take: filters.take || 20,
    });
  }
}
