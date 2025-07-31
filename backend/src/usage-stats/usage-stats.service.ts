import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { UsageStat } from './usage-stats.entity';
import { CreateUsageStatDto } from './dto/create-usage-stat.dto';
import { UsageFilterDto } from './dto/usage-filter.dto';
import * as dayjs from 'dayjs';

@Injectable()
export class UsageStatsService {
  constructor(
    @InjectRepository(UsageStat)
    private usageStatRepo: Repository<UsageStat>,
  ) {}

  async create(dto: CreateUsageStatDto): Promise<UsageStat> {
    const usage = this.usageStatRepo.create({ ...dto, date: new Date(dto.date) });
    return this.usageStatRepo.save(usage);
  }

  async findAll(filter?: UsageFilterDto): Promise<UsageStat[]> {
    const where = filter?.department ? { department: filter.department } : {};
    return this.usageStatRepo.find({ where });
  }

  async aggregate(period: 'week' | 'month', start: Date, end: Date) {
    const stats = await this.usageStatRepo.find({
      where: { date: Between(start, end) },
    });
    const groupKey = (date: Date) =>
      period === 'week'
        ? `${dayjs(date).year()}-W${dayjs(date).week()}`
        : `${dayjs(date).year()}-${dayjs(date).month() + 1}`;
    const result = {};
    for (const stat of stats) {
      const key = `${stat.department}|${groupKey(stat.date)}`;
      if (!result[key]) {
        result[key] = {
          department: stat.department,
          period: groupKey(stat.date),
          totalUsage: 0,
        };
      }
      result[key].totalUsage += stat.usageHours;
    }
    return Object.values(result);
  }

  async seed() {
    const mock: CreateUsageStatDto[] = [
      {
        department: 'IT',
        usageHours: 12,
        assetType: 'Laptop',
        date: dayjs().subtract(2, 'week').toISOString(),
      },
      {
        department: 'HR',
        usageHours: 8,
        assetType: 'Printer',
        date: dayjs().subtract(1, 'week').toISOString(),
      },
      {
        department: 'IT',
        usageHours: 5,
        assetType: 'Projector',
        date: dayjs().toISOString(),
      },
    ];
    for (const dto of mock) {
      await this.create(dto);
    }
  }
}
