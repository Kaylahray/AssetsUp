import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, Like } from 'typeorm';
import { AuditLog } from './entities/audit-log.entity';

@Injectable()
export class AuditLogService {
  constructor(
    @InjectRepository(AuditLog)
    private auditLogRepo: Repository<AuditLog>,
  ) {}

  create(log: Partial<AuditLog>) {
    const entry = this.auditLogRepo.create(log);
    return this.auditLogRepo.save(entry);
  }

  findAll() {
    return this.auditLogRepo.find({ order: { timestamp: 'DESC' } });
  }

  findByFilters(actionType?: string, from?: Date, to?: Date, initiator?: string) {
    const where: any = {};

    if (actionType) where.actionType = Like(`%${actionType}%`);
    if (initiator) where.initiator = Like(`%${initiator}%`);
    if (from && to) where.timestamp = Between(from, to);

    return this.auditLogRepo.find({
      where,
      order: { timestamp: 'DESC' },
    });
  }
}
