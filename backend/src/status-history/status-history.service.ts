import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StatusHistory, AssetStatus } from './entities/status-history.entity';
import { CreateStatusHistoryDto } from './dto/create-status-history.dto';

@Injectable()
export class StatusHistoryService {
  constructor(
    @InjectRepository(StatusHistory)
    private readonly repo: Repository<StatusHistory>,
  ) {}

  async logStatusChange(dto: CreateStatusHistoryDto): Promise<StatusHistory> {
    const record = this.repo.create({
      assetId: dto.assetId,
      previousStatus: dto.previousStatus,
      newStatus: dto.newStatus,
      changedBy: dto.changedBy,
      // changeDate is auto via @CreateDateColumn
    });
    return this.repo.save(record);
  }

  async getByAsset(assetId: string): Promise<StatusHistory[]> {
    return this.repo.find({
      where: { assetId },
      order: { changeDate: 'DESC' },
    });
  }
}
